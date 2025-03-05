import crypto from 'crypto';
import userServices from '../database/services/user.services.js';
import mailerUtils from './Mailer.util.js';

const Validation = {
    passwordValidation: function (password) {
        const minLength = 8;
        const maxLength = 16;

        const hasUpperCase = /[A-Z]/.test(password);
        const hasLowerCase = /[a-z]/.test(password);
        const hasNumber = /[0-9]/.test(password);
        const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password);
        const isValidLength = password.length >= minLength && password.length <= maxLength;

        const errors = [];

        if (!isValidLength) errors.push(`Password must be ${minLength}-${maxLength} characters long.`);
        if (!hasUpperCase) errors.push("Password must contain at least one uppercase letter.");
        if (!hasLowerCase) errors.push("Password must contain at least one lowercase letter.");
        if (!hasNumber) errors.push("Password must contain at least one number.");
        if (!hasSpecialChar) errors.push("Password must contain at least one special character (!@#$%^&*...).");

        if (errors.length > 0) {
            return { errors };
        }

        return 0;
    },

    usernameValidation: function (username) {
        const minLength = 4;
        const maxLength = 16;
        const usernameRegex = /^[a-zA-Z][a-zA-Z0-9_]*$/;

        const errors = [];

        if (username.length < minLength || username.length > maxLength) {
            errors.push(`Username must be between ${minLength}-${maxLength} characters.`);
        }

        if (!usernameRegex.test(username)) {
            errors.push("Username can only contain letters, numbers, and underscores (_), and must start with a letter.");
        }

        if (errors.length > 0) {
            return { errors }; // ✅ Rejects with an error
        }

        return 0;

    },

    generateId: function ({ lastData, IdType }) {

        // console.log(lastData,IdType);

        let newID = `GTA-${IdType}-001`; // Default UID if no users exist

        const prevId = (lastData?.userId || lastData?.quizId)

        if (lastData && prevId) {
            const lastUIDNumber = parseInt(prevId.split('-').pop(), 10); // Extract numeric part
            const nextUIDNumber = lastUIDNumber + 1;
            newID = `GTA-${IdType}-${nextUIDNumber.toString().padStart(3, '0')}`;
        }

        return newID;
    },

    generateOTP: function () {
        return {
            otp: crypto.randomInt(100000, 999999).toString(),
            otpExpires: new Date(Date.now() + 5 * 60000) // 5 minutes
        }
    },

    optVerify: async (req, res) => {

        const { email,otp } = req.body;
        // const email=req.user.email; 
        const user = await userServices.getByEmail(email);
        if (!user) {
            return res.status(404).json({
                error: "Not Found",
                errorDescription: "User not found."
            });
        }

        if (user.otp !== otp) {
            return res.status(400).json({
                error: "Invalid OTP",
                errorDescription: "The OTP provided is invalid."
            });
        }

        if (user.otpExpires < new Date()) {
            return res.status(400).json({
                error: "Expired OTP",
                errorDescription: "The OTP provided has expired."
            });
        }

        // Clear the OTP and OTP expiry
        user.isEmailVerified = true;
        user.otp = null;
        user.otpExpires = null;

        // Save the user
        await user.save();

        res.status(200).json({
            message: "Email verified successfully.",
            user
        });
    },

    resendOtp: async (req, res) => {

        const { email } = req.body;
        const user = await userServices.getByEmail(email);

        if (!user) {
            return res.status(404).json({
                error: "Not Found",
                errorDescription: "User not found."
            });
        }

        if (user.isEmailVerified) {
            return res.status(400).json({
                error: "Already Verified",
                errorDescription: "The email address is already verified."
            });
        }

        // Generate a new OTP
        const otpObject = Validation.generateOTP();

        // Update the user
        user.otp = otpObject.otp;
        user.otpExpires = otpObject.otpExpires;

        // Save the user
        await user.save();

        const emailResponse = await mailerUtils.otpMailForUser({
            body: {
                receiverEmail: email,
                subject: 'Email Verification',
                userName: `${user.firstName} ${user.lastName}`,
                otpType: 'resend',
                otp: otpObject.otp
            }
        }, res);

        if (emailResponse && emailResponse.status !== 'success') {
            return res.status(500).json({ error: 'Failed to send email.' });
        }

        res.status(200).json({
            message: "OTP sent.Please check your email.",
            email: email
        });
    },
}

export default Validation;