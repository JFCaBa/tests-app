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
// @desc    Submit test answers and save to history
// @access  Private
router.post(
  "/submit",
  auth.required,
  asyncHandler(async (req, res) => {
    const {
      answers,
      timeSpent,
      subject,
      mode,
      difficulty,
      score,
      totalQuestions,
      correctAnswers,
    } = req.body;

    try {
      // Find the user
      const user = await User.findById(req.user._id);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      // Create test history entry
      const testResult = {
        testDate: new Date(),
        subject,
        score: score || (correctAnswers / totalQuestions) * 100,
        totalQuestions,
        correctAnswers,
        timeSpent,
        mode,
        difficulty,
        questions: answers.map((answer) => ({
          questionId: answer.questionId,
          userAnswer: answer.answer,
          correct: answer.correct,
          timeSpent: answer.timeSpent,
        })),
      };

      // Add to user's test history
      user.testHistory.push(testResult);
      await user.save();

      // Update question statistics
      for (const answer of answers) {
        const question = await Question.findById(answer.questionId);
        if (question) {
          question.statistics = question.statistics || {};
          question.statistics.timesAnswered =
            (question.statistics.timesAnswered || 0) + 1;
          if (answer.correct) {
            question.statistics.timesCorrect =
              (question.statistics.timesCorrect || 0) + 1;
          }
          question.statistics.averageTimeSpent =
            ((question.statistics.averageTimeSpent || 0) *
              (question.statistics.timesAnswered - 1) +
              answer.timeSpent) /
            question.statistics.timesAnswered;

          await question.save();
        }
      }

      res.json(testResult);
    } catch (error) {
      console.error("Test submission error:", error);
      res.status(500).json({ message: "Failed to save test results" });
    }
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
      .populate("testHistory.questions.questionId", "question");

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Sort history by date descending
    const sortedHistory = user.testHistory.sort(
      (a, b) => b.testDate - a.testDate
    );

    res.json(sortedHistory);
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
