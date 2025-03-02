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
                    return res.status(500).json({ error: "Failed to send email." })
                } else {
                    const welcomeEmailResponse = await mailerUtils.welcomeMailForUser({
                        body: {
                            receiverEmail: email,
                            subject: 'Welcome to Guess the answer Quiz platform',
                            userName: username,
                        }
                    }, res);

                    if (welcomeEmailResponse && welcomeEmailResponse.status !== 'success') {
                        return res.status(500).json({ error: 'Failed to send welcome email.' });
                    }
                }
                delete user.password;

                return res.status(200).json({
                    success: true,
                    message: 'User registered successfully. Please verify your email address using the OTP sent to your email.',
                    token: jwt_token,
                    userData: {
                        email: user.email,
                        username: user.username,
                    }
                });
            }
            else {
                const welcomeEmailResponse = await mailerUtils.welcomeMailForUser({
                    body: {
                        receiverEmail: email,
                        subject: 'Welcome to Guess the answer Quiz platform',
                        userName: username,
                    }
                }, res);

                if (welcomeEmailResponse && welcomeEmailResponse.status !== 'success') {
                    return res.status(500).json({ error: 'Failed to send welcome email.' });
                }
            }

            delete user.password;
            res.status(200).cookie("token", jwt_token, { httpOnly: true }).json({
                message: "user registered successfully",
                success: true,
                user,
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

        const validate_password = Validation.passwordValidation(password)
        if (validate_password.errors) {
            return res.status(500).json({ message: validate_password.errors, success: false })
        }

        const user = await userServices.getByEmail(email);

        if (!user) {
            return res.status(500).json({
                message: "user not found",
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
                return res.status(500).json({
                    message: "incorrect email and password",
                    success: false
                })
            }

            const welcomeEmailResponse = await mailerUtils.welcomeMailForUser({
                body: {
                    receiverEmail: email,
                    subject: 'Welcome to Guess the answer Quiz platform',
                    userName: username,
                }
            }, res);

            if (welcomeEmailResponse && welcomeEmailResponse.status !== 'success') {
                return res.status(500).json({ error: 'Failed to send welcome email.' });
            }

            const jwt_token = await user.generateJWT();

            delete user.password;

            return res.status(200).json({
                message: "login successfully",
                success: true,
                user,
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
    }


}

export default userController;