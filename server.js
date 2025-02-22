import 'dotenv/config'
import bodyParser from 'body-parser';
import express from "express";
import mongoDB from './database/config/mongodb.config.js';


const server=express();
const port=process.env.PORT ||8000;


server.use(bodyParser.json())


server.get('/',(req,res)=>{
    res.send("hello world")
})

server.listen(port,()=>{
    console.log("server connected to port "+port)
    mongoDB();
})