import mongoose from "mongoose";

// Define the Quiz Schema
const quizSchema = new mongoose.Schema({
    // Unique quiz ID
    quizId: {
        type: String,
        required: true,
        unique: true
    },
    // Gk,Science or coding related
    quizTags: [
        {
            type: String,
        }
    ],
    title: {
        type: String,
        required: true
    },
    description: { type: String }, // Quiz description

    // instruction is array of lines of instruction
    // instruction: [
    //     { 
    //         type: String 
    //     }
    // ], // Instructions for the quiz
    questions: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: "Question"
    }], 
    rating: { 
        type: Number, 
        default: 0 
    }, 
    user_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User"
    },
    quizBanner:{
        type: String
    }
    
}, { timestamps: true });

export default mongoose.model("Quiz", quizSchema);
