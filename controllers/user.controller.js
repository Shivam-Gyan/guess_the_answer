import userModel from '../models/user.models.js'
import Validation from '../utils/Validation.js'
import userServices from '../database/services/user.services.js'
import mailerUtils from '../utils/Mailer.util.js'

const userController = {

    register: async (req, res) => {

        const { username, password, email, user_type } = req.body;

        if (!email || !username || !password || !user_type) {
            return res.status(500).json({
                message: "please fill the entire form",
                success: false
            })
        }

        const user_exist = await userServices.getByEmail(email)
        if (user_exist) {
            return res.json({
                message: "user already exist",
                success: false
            })
        }

        const validated_username = Validation.usernameValidation(username);
        if (validated_username.errors) {
            return res.status(500).json({ message: validated_username.errors, success: false })
        }

        const validate_password = Validation.passwordValidation(password)
        if (validate_password.errors) {
            return res.status(500).json({ message: validate_password.errors, success: false })
        }

        const lastData = await userServices.getLastUser();

        const userId = Validation.generateId({ lastData, IdType: 'USERID' });

        let jwt_token;

        try {
            const hashed_password = await userModel.hashPassword(password);

            const user = await userServices.addUser({
                email,
                password: hashed_password,
                user_type,
                username,
                userId
            })

            jwt_token = await user.generateJWT();

            if (!user.isEmailVerified) {

                const otpObject = Validation.generateOTP();
                user.otp = otpObject.otp;
                user.otpExpires = otpObject.otpExpires;
                await user.save();
                //send otp to user email

                const emailResponse = await mailerUtils.otpMailForUser({
                    body: {
                        receiverEmail: email,
                        subject: 'Email Verification',
                        userName: `${user.firstName} ${user.lastName}`,
                        otpType: 'register',
                        otp: otpObject.otp
                    }
                }, res);

                if (emailResponse && emailResponse.status !== 'success') {
                    throw new Error('Failed to send email.');
                }

            }


            const welcomeEmailResponse = await mailerUtils.welcomeMailForUser({
                body: {
                    receiverEmail: email,
                    subject: 'Welcome to Guess the answer Quiz platform',
                    userName: username,
                }
            }, res);

            if (welcomeEmailResponse && welcomeEmailResponse.status !== 'success') {
                throw new Error('Failed to send welcome email.');
            }

            res.status(200).cookie("token", jwt_token, { httpOnly: true }).json({
                message: "user registered successfully.please verify your email",
                success: true,
                user: {
                    email: user.email,
                    username: user.username,
                    user_type: user.user_type,
                    isEmailVerified: user.isEmailVerified
                },
                token: jwt_token
            })

        } catch (error) {
            res.status(500).json({
                message: error.message,
                success: false
            })
        }
    },

    login: async (req, res) => {
        const { password, email } = req.body;

        if (!email || !password) {
            return res.status(500).json({
                message: "please fill the entire form",
                success: false
            })
        }

        const user = await userServices.getByEmail(email);

        if (!user) {
            return res.status(500).json({
                message: "user not found",
                success: false
            })
        }

        if (user.isLocked) {
            return res.status(500).json({
                message: "Account locked.Connect with admin",
                success: false
            })
        }

        if (!user.isEmailVerified) {
            return res.status(500).json({
                message: "please verify your email",
                user: {
                    email: user.email,
                    username: user.username
                },
                success: false
            })
        }

        try {

            const password_isvalid = await user.isValidPassword(password)

            if (!password_isvalid) {

                if (user.passwordAttempts === 1) {
                    user.isLocked = true;
                    user.passwordAttempts = 0;
                    user.previousLoginLog.push({
                        previousLoginOn: new Date(),
                        previousLoginIP: req.ip,
                        previousLoginStatus: "Account Locked"
                    })
                    await user.save();
                    throw new Error('Account locked. Please reset your password.');
                }

                user.passwordAttempts -= 1;
                user.previousLoginLog.push({
                    previousLoginOn: new Date(),
                    previousLoginIP: req.ip,
                    previousLoginStatus: "Wrong Password"
                })
                await user.save();

                throw new Error(`Invalid password. ${user.passwordAttempts} attempts left.`);

            }

            // if successfull login then store login log to successfull attempt
            user.previousLoginLog.push({
                previousLoginOn: new Date(),
                previousLoginIP: req.ip,
                previousLoginStatus: "Successful Login"
            })

            await user.save();

            const welcomeEmailResponse = await mailerUtils.welcomeMailForUser({
                body: {
                    receiverEmail: email,
                    subject: 'Welcome to Guess the answer Quiz platform',
                    userName: user.username,
                }
            }, res);

            if (welcomeEmailResponse && welcomeEmailResponse.status !== 'success') {
                throw new Error('Failed to send welcome email.');
            }

            const jwt_token = await user.generateJWT();

            // converting the mongoose user object to plain object and deleting the password field

            const userObject = user.toObject();
            delete userObject.password;
            delete userObject.previousLoginLog;
            delete userObject.passwordAttempts;

            return res.status(200).json({
                message: "login successfully",
                success: true,
                user: userObject,
                token: jwt_token
            })
        } catch (error) {
            return res.status(500).json({
                message: error.message,
                success: false
            })
        }
    },

    verifyEmail: async (req, res) => {

        const { email } = req.body;
        try {
            const user = await userServices.getByEmail(email);

            if (!user) {
                return res.status(404).json({
                    success: false,
                    message: "User not found.Please register"
                });
            }

            if (user.isEmailVerified) {
                return res.status(200).json({
                    success: true,
                    message: "Email already verified",
                    user
                });
            }

            const otpObject = Validation.generateOTP();
            user.otp = otpObject.otp;
            user.otpExpires = otpObject.otpExpires;
            await user.save();

            const emailResponse = await mailerUtils.otpMailForUser({
                body: {
                    receiverEmail: email,
                    subject: 'Email Verification',
                    userName: user.username,
                    otpType: 'verify',
                    otp: otpObject.otp
                }
            }, res);

            if (emailResponse && emailResponse.status !== 'success') {
                return res.status(500).json({ error: 'Failed to send email.' });
            }

            delete user.password;
            return res.status(200).json({
                success: true,
                message: "OTP sent to your email",
            });


        } catch (error) {
            return res.status(500).json({
                message: error.message,
                success: false
            })

        }

    },

    getUserProfile: async (req, res) => {

        const email = req.user.email;
        try {
            const user = await userServices.getByEmail(email);
            if (!user) {
                return res.status(404).json({
                    message: "user not found",
                    success: false
                })
            }
            delete user.password;
            delete user.passwordAttempts;
            delete user.previousLoginLog;
            return res.status(200).json({
                success: true,
                user
            })

        } catch (error) {
            return res.status(500).json({
                message: error.message,
                success: false
            })
        }
    },

    forgotPassword: async (req, res) => {

        const { email } = req.params;

        try {
            const user = await userServices.getByEmail(email);

            if (!user) {
                return res.status(404).json({
                    message: "user not found",
                    success: false
                })
            }

            const otpObject = Validation.generateOTP();
            user.otp = otpObject.otp;
            user.otpExpires = otpObject.otpExpires;
            await user.save();

            const emailResponse = await mailerUtils.otpMailForUser({
                body: {
                    receiverEmail: email,
                    subject: 'Forgot Password',
                    userName: user.username,
                    otpType: 'forgot password',
                    otp: otpObject.otp
                }
            }, res);

            if (emailResponse && emailResponse.status !== 'success') {
                throw new Error('Failed to send email.');
            }

            return res.status(200).json({
                success: true,
                message: "OTP sent to your email",
                email:email
            });

        } catch (error) {
            return res.status(500).json({
                message: error.message,
                success: false
            })
        }
    },

    resetPassword: async (req, res) => {

        const { email, password, otp } = req.body;

        try {
            const user = await userServices.getByEmail(email);

            if (!user) {
                throw new Error("User not found");
            }

            if (user.otp !== otp) {
                throw new Error("Invalid OTP");
            }

            if (user.otpExpires < new Date()) {
               throw new Error("OTP expired");
            }

            const validate_password = Validation.passwordValidation(password)
            if (validate_password.errors) {
                throw new Error(validate_password.errors);
            }

            const hashed_password = await userModel.hashPassword(password);
            user.password = hashed_password;
            user.otp = null;
            user.otpExpires = null;
            await user.save();

            return res.status(200).json({
                success: true,
                message: "Password reset successfully",
            });

        } catch (error) {
            return res.status(500).json({
                message: error.message,
                success: false
            })
        }


    }
}

export default userController;