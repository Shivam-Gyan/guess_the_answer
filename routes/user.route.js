import express from "express";
import userController from "../controllers/user.controller.js";
import Validation from "../utils/Validation.js";
import userMiddelware from "../middleware/user.middleware.js";
import UplaodCloudinary from "../utils/ImageUpload.utils.js";

const userRouter = express.Router();


userRouter
    .post('/register', userController.register)
    .post("/login",userController.login)
    .post('/profile-pic',UplaodCloudinary)
    .post('/otp-verify',Validation.optVerify)
    .post('/resend-otp',Validation.resendOtp)
    .post('/email-verify',userController.verifyEmail)
    .get('/profile',userMiddelware.verifyToken,userController.getUserProfile)
    .get('/forget-password/:email',userController.forgotPassword)
    .post('/reset-password',userController.resetPassword)


export default userRouter;