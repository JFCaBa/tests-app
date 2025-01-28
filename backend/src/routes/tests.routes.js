import express from "express";
import { Question, User } from "../models/index.js";
import { auth, validation, errors } from "../middleware/index.js";
const { asyncHandler } = errors;

const router = express.Router();

// @route   POST /api/tests/start
// @desc    Start a new test session
// @access  Private
router.post(
  "/start",
  auth.required,
  validation.rules.test.start,
  validation.validate,
  asyncHandler(async (req, res) => {
    const { subject, difficulty = "medium", questionCount = 10 } = req.body;

    // Build query for questions
    const query = { active: true };
    if (subject !== "all") query.subject = subject;
    if (difficulty !== "all") query.difficulty = difficulty;

    // Get random questions
    const questions = await Question.aggregate([
      { $match: query },
      { $sample: { size: Number(questionCount) } },
      {
        $project: {
          correctAnswer: 0, // Don't send correct answers to client
          statistics: 0,
        },
      },
    ]);

    if (questions.length === 0) {
      return res.status(404).json({
        message: "No questions available for selected criteria",
      });
    }

    res.json({
      testId: new mongoose.Types.ObjectId(), // Generate proper test ID
      questions,
      timeLimit: questions.reduce(
        (sum, q) => sum + (q.metadata?.timeLimit || 60),
        0
      ),
    });
  })
);

// @route   POST /api/tests/submit
// @desc    Submit test answers
// @access  Private
router.post(
  "/submit",
  auth.required,
  validation.rules.test.submit,
  validation.validate,
  asyncHandler(async (req, res) => {
    const { testId, answers, timeSpent } = req.body;

    // Get all questions
    const questionIds = answers.map((a) => a.questionId);
    const questions = await Question.find({ _id: { $in: questionIds } });

    // Calculate results
    let correctCount = 0;
    const results = answers.map((answer) => {
      const question = questions.find(
        (q) => q._id.toString() === answer.questionId
      );
      const isCorrect = question.correctAnswer === answer.answer;
      if (isCorrect) correctCount++;

      // Update question statistics
      question.statistics.timesAnswered++;
      if (isCorrect) question.statistics.timesCorrect++;
      question.save();

      return {
        questionId: answer.questionId,
        correct: isCorrect,
        userAnswer: answer.answer,
        correctAnswer: question.correctAnswer,
      };
    });

    // Calculate score
    const score = (correctCount / answers.length) * 100;

    // Save test results to user history
    const user = await User.findById(req.user._id);
    user.testHistory.push({
      testDate: new Date(),
      subject: questions[0].subject,
      score,
      totalQuestions: answers.length,
      correctAnswers: correctCount,
      timeSpent,
      questions: results,
    });
    await user.save();

    res.json({
      score,
      totalQuestions: answers.length,
      correctAnswers: correctCount,
      timeSpent,
      results: answers.map((answer) => ({
        questionId: answer.questionId,
        correct: answer.isCorrect,
        userAnswer: answer.answer,
        correctAnswer: questions.find(
          (q) => q._id.toString() === answer.questionId
        ).correctAnswer,
      })),
    });
  })
);

// @route   GET /api/tests/history
// @desc    Get user's test history
// @access  Private
router.get(
  "/history",
  auth.required,
  asyncHandler(async (req, res) => {
    const user = await User.findById(req.user._id)
      .select("testHistory")
      .sort({ "testHistory.testDate": -1 });

    res.json(user.testHistory);
  })
);

// @route   GET /api/tests/stats
// @desc    Get user's test statistics
// @access  Private
router.get(
  "/stats",
  auth.required,
  asyncHandler(async (req, res) => {
    const user = await User.findById(req.user._id);

    // Calculate statistics by subject
    const statsBySubject = {};
    user.testHistory.forEach((test) => {
      if (!statsBySubject[test.subject]) {
        statsBySubject[test.subject] = {
          totalTests: 0,
          averageScore: 0,
          bestScore: 0,
          totalTime: 0,
        };
      }

      const stats = statsBySubject[test.subject];
      stats.totalTests++;
      stats.averageScore =
        (stats.averageScore * (stats.totalTests - 1) + test.score) /
        stats.totalTests;
      stats.bestScore = Math.max(stats.bestScore, test.score);
      stats.totalTime += test.timeSpent;
    });

    res.json({
      totalTests: user.testHistory.length,
      statsBySubject,
      recentTests: user.testHistory.slice(0, 5),
    });
  })
);

export default router;
