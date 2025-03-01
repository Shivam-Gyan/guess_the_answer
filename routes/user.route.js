import express from "express";
import userController from "../controllers/user.controller.js";
import Validation from "../utils/Validation.js";
import userMiddelware from "../middleware/user.middleware.js";

const userRouter = express.Router();


userRouter
    .post('/register', userController.register)
    .post("/login",userController.login)
    .post('/upload-image',userController.UplaodCloudinary)
    .post('/otp-verify',Validation.optVerify)
    .post('/resend-otp',Validation.resendOtp)
    .post('/email-verify',userController.verifyEmail)
    .get('/profile',userMiddelware.verifyToken,userController.getUserProfile)


export default userRouter;