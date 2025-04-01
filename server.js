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
import { createServer } from 'http';
import { Server as SocketServer } from 'socket.io';
import socketService from './socket/index.js';
import roomRouter from './routes/room.route.js';

const app=express();

const server = createServer(app);
const io = new SocketServer(server, {
    pingTimeout: 60000,
    cors: {
        origin: "*",
        credentials: true
    }
});

app.set('io', io);

const port=process.env.PORT ||8000;

cloudinary.v2.config({
    cloud_name:process.env.CLOUDINARY_CLOUD_NAME,
    api_key:process.env.CLOUDINARY_API_KEY,
    api_secret:process.env.CLOUDINARY_API_SECRET
})

app.use(express.json())
app.use(fileUpload({
    useTempFiles:true,
}))

app.use(cors());

app.get('/',(req,res)=>{
    res.send("hello world")
})

app.use('/api/user',userRouter)
app.use('/api/quiz',quizRouter)
app.use('/api/question',questionRouter)
app.use('/api/room', roomRouter);

socketService.initializeSocketIO(io);

server.listen(port,()=>{
    console.log("server connected to port "+port)
    mongoDB();
})