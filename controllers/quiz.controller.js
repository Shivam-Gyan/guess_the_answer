import quizServices from "../database/services/quiz.services.js";

const quizController = {
  createQuiz: async (req, res) => {
    const { title, description = "", type } = req.body;

    if (!title || !type) {
      return res.status(400).json({
        message: "Title and quiz type are required fields",
        success: false,
      });
    }

    try {
      const quiz = await quizServices.addQuiz({
        title,
        description,
        quiz_type: type,
        questions: [],
      });

      console.log("quiz saved in mongo")
      return res.status(201).json({
        message: "Quiz created successfully",
        success: true,
        quiz,
      });
    } catch (error) {
      console.log(error)
      return res.status(500).json({
        message: error.message,
        success: false,
      });
    }
  },

  getQuizzes: async (_, res) => {
    try {
      const quizzes = await quizServices.getQuizzes();
      return res.status(200).json({
        message: "Quizzes fetched successfully",
        success: true,
        quizzes,
      });
    } catch (error) {
      return res.status(500).json({
        message: error.message,
        success: false,
      });
    }
  },

  getQuizById: async (req, res) => {
    const { id } = req.params;

    try {
      const quiz = await quizServices.getQuizById(id);
      return res.status(200).json({
        message: "Quiz fetched successfully",
        success: true,
        quiz,
      });
    } catch (error) {
      return res.status(500).json({
        message: error.message,
        success: false,
      });
    }
  },

  updateQuiz: async (req, res) => {
    const { id } = req.params;
    const { title, description, type } = req.body;

    if (!title || !type) {
      return res.status(400).json({
        message: "Title and quiz type are required fields",
        success: false,
      });
    }

    try {
      const updatedQuiz = await quizServices.updateQuizById(id, {
        title,
        description,
        quiz_type: type,
      });

      return res.status(200).json({
        message: "Quiz updated successfully",
        success: true,
        updatedQuiz,
      });
    } catch (error) {
      return res.status(500).json({
        message: error.message,
        success: false,
      });
    }
  },

  deleteQuiz: async (req, res) => {
    const { id } = req.params;

    try {
      const deletedQuiz = await quizServices.deleteQuizById(id);
      return res.status(200).json({
        message: "Quiz deleted successfully",
        success: true,
        deletedQuiz,
      });
    } catch (error) {
      return res.status(500).json({
        message: error.message,
        success: false,
      });
    }
  },
};

export default quizController;
