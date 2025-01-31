import axios from "axios";

export const testService = {
  async submitTest(testData) {
    try {
      // Format the answers to match backend expectations
      const formattedAnswers = testData.stats.answers.map((answer) => ({
        questionId: answer.questionId,
        answer: answer.answer,
        timeSpent: answer.timeSpent,
        correct: answer.correct,
      }));

      // Calculate overall score
      const score = (testData.stats.correct / testData.stats.total) * 100;

      // Prepare submission data
      const submission = {
        answers: formattedAnswers,
        timeSpent: testData.stats.timeSpent || testData.stats.totalTimeSpent,
        subject: testData.subject,
        mode: testData.mode,
        difficulty: testData.difficulty,
        score: score,
        totalQuestions: testData.stats.total,
        correctAnswers: testData.stats.correct,
      };

      // Submit to backend
      const response = await axios.post("/tests/submit", submission);
      return response.data;
    } catch (error) {
      console.error("Test submission error:", error);
      throw new Error(
        error.response?.data?.message || "Failed to submit test results"
      );
    }
  },

  async getHistory() {
    try {
      const response = await axios.get("/tests/history");
      return response.data;
    } catch (error) {
      console.error("History fetch error:", error);
      throw new Error(
        error.response?.data?.message || "Failed to fetch test history"
      );
    }
  },
  async getStats() {
    try {
      const response = await axios.get("/tests/stats");
      return response.data;
    } catch (error) {
      console.error("Stats fetch error:", error);
      throw new Error(
        error.response?.data?.message || "Failed to fetch user stats"
      );
    }
  },
};

export default testService;
