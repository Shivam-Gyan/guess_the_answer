import express from "express";
import userController from "../controllers/user.controller.js";

const userRouter = express.Router();


userRouter
    .post('/register', userController.register)
    .post("/login",userController.login)
    .post('/upload-image',userController.UplaodCloudinary)


export default userRouter;