import 'dotenv/config'
import bodyParser from 'body-parser';
import express from "express";
import mongoDB from './database/config/mongodb.config.js';
import userRouter from './routes/user.route.js';
import fileUpload from 'express-fileupload'
import cloudinary from 'cloudinary';
import cors from 'cors'
import quizRouter from './routes/quiz.route.js';
import questionRouter from './routes/question.route.js';


const server=express();
const port=process.env.PORT ||8000;

cloudinary.v2.config({
    cloud_name:process.env.CLOUDINARY_CLOUD_NAME,
    api_key:process.env.CLOUDINARY_API_KEY,
    api_secret:process.env.CLOUDINARY_API_SECRET
})

server.use(bodyParser.json())
server.use(fileUpload({
    useTempFiles:true,
}))
server.use(cors());


server.get('/',(req,res)=>{
    res.send("hello world")
})

server.use('/api/user',userRouter)
server.use('/api/quiz',quizRouter)
server.use('/api/question',questionRouter)

server.listen(port,()=>{
    console.log("server connected to port "+port)
    mongoDB();
})