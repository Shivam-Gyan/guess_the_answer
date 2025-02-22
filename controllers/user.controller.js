import userModel from '../models/user.models.js'
import Validation from '../utils/Validation.js'
import userServices from '../database/services/user.services.js'
import cloudinary from 'cloudinary'
import crypto from 'crypto'

const userController = {

    UplaodCloudinary : async (req, res) => {

        if (!req.files || Object.keys(req.files).length == 0) {
            return next(new ErrorHandler("Please uplaod and image", 404));
        }
        const { image } = req.files;
        let cloudinaryResponse;
    
        try {
            cloudinaryResponse = await cloudinary.uploader.upload(
                image.tempFilePath
            );
        } catch (error) {
            return res.status(500).json({
                message:error.message,
                success:false
            })
        }
    
    
        return res.status(200).json({
            success: true,
            message: "upload successfull",
            image_url: cloudinaryResponse.secure_url
        })
    },

    register: async (req, res) => {

        const { username, password, email, user_type } = req.body;

        if (!email || !username || !password || !user_type) {
            return res.status(500).json({
                message: "please fill the entire form",
                success: false
            })
        }

        const user_exist = await userServices.getByEmail(email)
        if (user_exist){
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

        const randomInt = await crypto.randomInt(1000, 9999).toString()
        const userId = username + randomInt;


        try {
            const hashed_password = await userModel.hashPassword(password);

            const user = await userServices.addUser({
                email,
                password: hashed_password,
                user_type,
                username,
                userId
            })

            const jwt_token = await user.generateJWT();
            delete user.password
            res.status(200).json({
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

        try {

            const user = await userServices.getByEmail(email);
            const password_isvalid = await user.isValidPassword(password)

            if (!password_isvalid) {
                return res.status(500).json({
                    message: "user not authenticated.Please register",
                    success: false
                })
            }
            const jwt_token = await user.generateJWT();
           
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
    }


}

export default userController;