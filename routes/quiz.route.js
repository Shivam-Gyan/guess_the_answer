import express from "express";
import quizController from "../controllers/quiz.controller.js";

const quizRouter = express.Router();

quizRouter
  .post("/create-quiz", quizController.createQuiz)
  .get("/get-quizzes", quizController.getQuizzes)
  .get("/get-quiz/:id", quizController.getQuizById)
  .put("/update-quiz/:id", quizController.updateQuiz)
  .delete("/delete-quiz/:id", quizController.deleteQuiz);

export default quizRouter;
