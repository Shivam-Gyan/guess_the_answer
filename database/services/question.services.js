import questionModel from "../../models/question.model.js";

const questionServices = {
  addQuestion: async (question) => {
    const newQuestion = new questionModel(question);
    if (!newQuestion) {
      throw new Error("Error while adding the question");
    }
    await newQuestion.save();
    return newQuestion;
  },
  getQuestionByText: async (quizId, question_text) => {
    return await questionModel.findOne({ quiz_id: quizId, question_text });
  },
  getQuestions: async (quizId) => {
    return await questionModel.find({ quiz_id: quizId });
  },
  getQuestionById: async (questionId) => {
    const question = await questionModel.findById(questionId);
    if (!question) {
      throw new Error("Question not exist");
    }
    return question;
  },
  updateQuestionById: async (questionId, questionData) => {
    const question = await questionModel.findByIdAndUpdate(
      questionId,
      questionData,
      { new: true }
    );
    if (!question) {
      throw new Error("Question not exist");
    }
    return question;
  },
  deleteQuestionById: async (questionId) => {
    const question = await questionModel.findByIdAndDelete(questionId);
    if (!question) {
      throw new Error("Question not exist");
    }
    return question;
  },
};

export default questionServices;
