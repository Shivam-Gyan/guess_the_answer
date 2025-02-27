import express from "express";
import questionController from "../controllers/question.controller.js";

const questionRouter = express.Router();

questionRouter
  .post("/:quizId/create-question", questionController.createQuestion)
  .get("/:quizId/get-questions", questionController.getQuestions)
  .get("/get-question/:id", questionController.getQuestionById)
  .put("/update-question/:id", questionController.updateQuestion)
  .delete("/delete-question/:id", questionController.deleteQuestion);

export default questionRouter;
