import mongoose from "mongoose";

const userSchema=new mongoose.Schema({
    userId:{
        type:String,
        required:true,
        unique:true
    },
    username:{
        type:String,
        required:true,
        unique:true,
        trim:true,  
    },
    email: {
        type: String,
        required: true,
        trim: true,
        unique: true,
        lowercase: true,
    },
    password: {
        type: String,
        required: true,
        select: false
    },
    profile_img:{
        type:String
    },
    user_type:{
        type:String,
        enum:["Student","Teacher","personal"]
    },
    friends:[
        {
            type:mongoose.Schema.Types.ObjectId,
            ref:"users"
        }
    ],
    points:{
        type:Number,
        default:0
    },
    createdAt:{
        type:Date,
        default:new Date()
    }
})


userSchema.statics.hashPassword = async function (password) {
    return await bcrypt.hash(password, 10);
}

userSchema.methods.isValidPassword = async function (password) {
    return await bcrypt.compare(password, this.password)
}

userSchema.methods.generateJWT = async function () {
    return await jwt.sign({ email: this.email }, process.env.JWT_SECRET,{expiresIn:'24h'})
}

export default mongoose.model("users",userSchema)