import mongoose from "mongoose";

// Define the Quiz Schema
const quizSchema = new mongoose.Schema({
    // Unique quiz ID
    // quiz_id: {
    //     type: String,
    //     required: true,
    //     unique: true
    // },
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
    // instruction: { type: String }, // Instructions for the quiz
    questions: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: "Question"
    }], // Array of Questions
    rating: { type: Number, default: 0 }, // Quiz rating
    user_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User"
    },
    
}, { timestamps: true }); // Adds createdAt & updatedAt fields automatically

export default mongoose.model("Quiz", quizSchema);
