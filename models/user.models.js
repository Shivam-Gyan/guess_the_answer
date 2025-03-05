import mongoose from "mongoose";
import bcrypt from 'bcrypt'
import jwt from 'jsonwebtoken'


const quizAttemptedSchema=new mongoose.Schema({
    quizAttemptedId: {
        type:mongoose.Schema.Types.ObjectId,
        ref:"quiz"
    },
    quizAttemptedAt:{
        type:Date,
        default:new Date()
    },
    pointEarned:{
        type:Number,
        default:0
    },
    timeTaken:{
        type:Number,
        default:0
    }
})

const quizCreatedSchema=new mongoose.Schema({
    quizCreatedId:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"quiz"
    },
    quizCreatedAt:{
        type:Date,
        default:new Date()
    }
})

const roomCreatedSchema=new mongoose.Schema({
        roomCreatedBy:{
            type:mongoose.Schema.Types.ObjectId,
            ref:"users"
        },
        roomId:{
            type:String,
        },
        max_participants:{
            type:Number,
            default:0
        },
        participants:[
            {
                type:mongoose.Schema.Types.ObjectId,
                ref:"users"
            }
        ]
})

const previousLogInLogSchema = new mongoose.Schema({
    previousLoginOn: {
        type: Date,
        default: Date.now // Automatically log the date when added
    },
    previousLoginIP: {
        type: String,
    },
    previousLoginStatus: {
        type: String,
        enum: ["Successful Login", "Wrong Password", "Account Locked", "Password Expired"]   // Enum for login status
    }
});

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
    isEmailVerified:{
        type:Boolean,
        default:false
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
        enum:["User","Admin"],
        default:"User",
        required:true
    },
    quizAttempted:[quizAttemptedSchema],
    quizCreated:[quizCreatedSchema],
    friends:[
        {
            type:mongoose.Schema.Types.ObjectId,
            ref:"users"
        }
    ],
    pointsEarned:{
        type:Number,
        default:0
    },
    roomCreated:[roomCreatedSchema],
    otp:{
        type:String,
        default:null
    },
    otpExpires:{
        type:Date,
        default:null
    },

    // store quiz id for later user attempt the quiz like cart  
    storeQiuzId:[
        {
            type:mongoose.Schema.Types.ObjectId,
            ref:"quiz"
        }
    ],
    isLocked:{
        type:Boolean,
        default:false
    },
    passwordAttempts:{
        type:Number,
        default:5
    },
    previousLoginLog:[previousLogInLogSchema]

},{timestamps:true})


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