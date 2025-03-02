import questionServices from "../database/services/question.services.js";
import quizServices from "../database/services/quiz.services.js";

const questionController = {
  
  createQuestion: async (req, res) => {
    const { quizId } = req.params;

    const { question_text, question_type, options, correct_answer, points } =
      req.body;

    if (!question_text || !question_type || !correct_answer) {
      return res.status(400).json({
        message: "Please fill the entire form",
        success: false,
      });
    }

    if (question_type === "MCQ") {
      if (!options || options.length < 2) {
        return res.status(400).json({
          message: "Please provide atleast 2 options for MCQ questions",
          success: false,
        });
      }

      if (!options.includes(correct_answer)) {
        return res.status(400).json({
          message: "Correct answer should be one of the options",
          success: false,
        });
      }
    }

    try {
      const existed_quiz = await quizServices.getQuizById(quizId);
      if (!existed_quiz) {
        return res.status(404).json({
          message: "Quiz not found",
          success: false,
        });
      }

      const existed_question = await questionServices.getQuestionByText(
        quizId,
        question_text
      );

      if (existed_question) {
        return res.status(400).json({
          message: "Question already exists",
          success: false,
        });
      }

      const question = await questionServices.addQuestion({
        quiz_id: quizId,
        question_text,
        question_type,
        options,
        correct_answer,
        points,
      });

      await quizServices.addQuestionsToQuiz(quizId, question._id);

      return res.status(201).json({
        message: "Question added successfully",
        success: true,
        question,
      });
    } catch (error) {
      return res.status(500).json({
        message: error.message,
        success: false,
      });
    }
  },

  getQuestions: async (req, res) => {
    const { quizId } = req.params;

    try {
      const questions = await questionServices.getQuestions(quizId);
      return res.status(200).json({
        message: "Questions fetched successfully",
        success: true,
        questions,
      });
    } catch (error) {
      return res.status(500).json({
        message: error.message,
        success: false,
      });
    }
  },

  getQuestionById: async (req, res) => {
    const { id } = req.params;

    try {
      const question = await questionServices.getQuestionById(id);
      return res.status(200).json({
        message: "Question fetched successfully",
        success: true,
        question,
      });
    } catch (error) {
      return res.status(500).json({
        message: error.message,
        success: false,
      });
    }
  },

  updateQuestion: async (req, res) => {
    const { id } = req.params;

    const { question_text, question_type, options, correct_answer, points } =
      req.body;

    if (!question_text || !question_type || !correct_answer) {
      return res.status(400).json({
        message: "Please fill the entire form",
        success: false,
      });
    }

    if (question_type === "MCQ") {
      if (!options || options.length < 2) {
        return res.status(400).json({
          message: "Please provide atleast 2 options for MCQ questions",
          success: false,
        });
      }

      if (!options.includes(correct_answer)) {
        return res.status(400).json({
          message: "Correct answer should be one of the options",
          success: false,
        });
      }
    }

    try {
      const updatedQuestion = await questionServices.updateQuestionById(
        id,
        {
          question_text,
          question_type,
          options,
          correct_answer,
          points,
        }
      );

      return res.status(200).json({
        message: "Question updated successfully",
        success: true,
        updatedQuestion,
      });
    } catch (error) {
      return res.status(500).json({
        message: error.message,
        success: false,
      });
    }
  },

  deleteQuestion: async (req, res) => {
    const { id } = req.params;

    try {
      const deletedQuestion = await questionServices.deleteQuestionById(
        id
      );
      await quizServices.removeQuestionFromQuiz(deletedQuestion.quiz_id, id);
      return res.status(200).json({
        message: "Question deleted successfully",
        success: true,
        deletedQuestion,
      });
    } catch (error) {
      return res.status(500).json({
        message: error.message,
        success: false,
      });
    }
  },
};

export default questionController;
