import mongoose from "mongoose";

const questionSchema = new mongoose.Schema({
    quiz_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Quiz",
        required: true  
    },
    question_text: { type: String, required: true },
    question_type: {
        type: String,
        enum: ["MCQ", "Boolean", "Input"],
        required: true
    },
    options: [{ type: String }],  // Only required for MCQs
    correct_answer: { type: String, required: true },
    points: { type: Number, default: 1 },
}, { timestamps: true });

export default mongoose.model("Question", questionSchema);
