import quizModel from "../../models/quiz.models.js";

const quizServices = {
  addQuiz: async (quiz) => {
    console.log(`quiz - ${quiz}`)
    const newQuiz = new quizModel(quiz);
    console.log(newQuiz);
    if (!newQuiz) {
      throw new Error("Error while adding the quiz");
    }
    await newQuiz.save();
    console.log("saved")
    return newQuiz;
  },
  getQuizzes: async () => {
    const quizzes = await quizModel.find();
    return quizzes;
  },
  getQuizById: async (id) => {
    const quiz = await quizModel.findById(id).populate("questions");
    if (!quiz) {
      throw new Error("Quiz not existed");
    }
    return quiz;
  },
  updateQuizById: async (id, quizData) => {
    const quiz = await quizModel.findByIdAndUpdate(id, quizData, { new: true });
    if (!quiz) {
      throw new Error("Quiz not existed");
    }
    return quiz;
  },
  deleteQuizById: async (id) => {
    const quiz = await quizModel.findByIdAndDelete(id);
    if (!quiz) {
      throw new Error("Quiz not existed");
    }
    return quiz;
  },
  addQuestionsToQuiz: async (quizId, questionId) => {
    return await quizModel.findByIdAndUpdate(
      quizId,
      { $push: { questions: questionId } }, // Push the question ID into the questions array
      { new: true }
    );
  },
  removeQuestionFromQuiz: async (quizId, questionId) => {
    return await quizModel.findByIdAndUpdate(
      quizId,
      { $pull: { questions: questionId } }, // Remove question from the array
      { new: true }
    );
  },
};

export default quizServices;
