import mongoose from "mongoose";

// Define the Question Schema
const questionSchema = new mongoose.Schema({
    question_text: { type: String, required: true },
    question_type:{
        type:String,
        enum:["MCQ","Boolean","Input"],
        required:true
    },
    options: [{ type: String, required: true }], // Array of possible answers
    correct_answer: { type: String, required: true }, // Correct answer
    points: { type: Number, default: 1 }, // Points for the question
});

// Define the Quiz Schema
const quizSchema = new mongoose.Schema({
    // Unique quiz ID
    quiz_id: {
        type: String,
        required: true,
        unique: true
    },
    // Gk,Science or coding related
    quiz_type: {
        type: String,
        required: true
    },
    // Quiz title
    title: {
        type: String,
        required: true
    },
    description: { type: String }, // Quiz description
    instruction: { type: String }, // Instructions for the quiz
    questions: [questionSchema], // Embedded Question Schema
}, { timestamps: true }); // Adds createdAt & updatedAt fields automatically

const Quiz = mongoose.model("Quiz", quizSchema);

export default Quiz;
