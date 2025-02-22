import mongoose from "mongoose";

async function mongoDB(){
    try{
        await mongoose.connect(process.env.MOGODB_URI)
        console.log("database connected ");
    }catch(error){
        console.log("database connection errror "+error.message);
    }
}

export default mongoDB;