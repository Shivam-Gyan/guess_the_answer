import mongoose from "mongoose";


// question model
const questionSchema = new mongoose.Schema({

    question_text: { 
        type: String, 
        required: true ,
    },
    question_type: {
        type: String,
        enum: ["MCQ", "Boolean", "Input"],
        required: true
    },

    options: [{ type: String }],  // Only required for MCQs

    hint: { type: String }, // Hint for the question

    correct_answer: { type: String, required: true },

    points: { type: Number, default: 1 },
});


// Define the Quiz Schema
const quizSchema = new mongoose.Schema({

    isDraft: {  
        type: Boolean,
        default: false
    },
    quiz_type: {
        type: String,
        enum: ["Quiz", "Form"],
        required: true
    },

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

    questions: [questionSchema],
    rating: { 
        type: Number, 
        default: 0 
    }, 
    noOfQuestions:{
        type: String,
        required: true
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
