import fs from "fs/promises";
import express from "express";
import { User, Question, ChatMessage } from "../models/index.js";
import { auth, validation, errors, upload } from "../middleware/index.js";

const { asyncHandler } = errors;
const router = express.Router();

// All routes require admin privileges
router.use(auth.required, auth.admin);

console.log("Admin routes loaded");

// MARK: - /users
// @route   GET /api/admin/users
// @desc    Get all users
// @access  Admin
router.get(
  "/users",
  asyncHandler(async (req, res) => {
    const { page = 1, limit = 10, search } = req.query;
    const query = {};

    if (search) {
      query.$or = [
        { username: { $regex: search, $options: "i" } },
        { email: { $regex: search, $options: "i" } },
      ];
    }

    const users = await User.find(query)
      .select("-password")
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .sort({ createdAt: -1 });

    const count = await User.countDocuments(query);

    res.json({
      users,
      totalPages: Math.ceil(count / limit),
      currentPage: page,
      totalUsers: count,
    });
  })
);

// MARK: - /users/:id
// @route   PUT /api/admin/users/:id
// @desc    Update user role or status
// @access  Admin
router.put(
  "/users/:id",
  asyncHandler(async (req, res) => {
    const { role, isActive } = req.body;
    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    if (role) user.role = role;
    if (typeof isActive === "boolean") user.isActive = isActive;

    await user.save();
    res.json(user);
  })
);

// MARK: - /questions GET
// @route   GET /api/admin/stats
// @desc    Get system statistics
// @access  Admin
router.get(
  "/stats",
  asyncHandler(async (req, res) => {
    try {
      // Get user statistics
      const [
        totalUsers,
        activeUsers,
        adminUsers,
        totalQuestions,
        activeQuestions,
        questionsBySubject,
      ] = await Promise.all([
        // User statistics
        User.countDocuments(),
        User.countDocuments({ isActive: true }),
        User.countDocuments({ role: "admin" }),

        // Question statistics
        Question.countDocuments(),
        Question.countDocuments({ active: true }),
        Question.aggregate([
          { $match: { active: true } },
          {
            $group: {
              _id: "$subject",
              count: { $sum: 1 },
            },
          },
          { $sort: { _id: 1 } },
        ]),
      ]);

      // Calculate test statistics
      const testStats = await User.aggregate([
        // Unwind the testHistory array to work with individual tests
        { $unwind: "$testHistory" },
        // Group all tests together
        {
          $group: {
            _id: null,
            totalTests: { $sum: 1 },
            totalScore: { $sum: "$testHistory.score" },
            totalCorrectAnswers: { $sum: "$testHistory.correctAnswers" },
            totalQuestions: { $sum: "$testHistory.totalQuestions" },
          },
        },
        // Calculate averages
        {
          $project: {
            _id: 0,
            totalTests: 1,
            averageScore: {
              $cond: [
                { $eq: ["$totalTests", 0] },
                0,
                { $divide: ["$totalScore", "$totalTests"] },
              ],
            },
          },
        },
      ]);

      // Get the test statistics or use defaults if no tests exist
      const testStatistics = testStats[0] || {
        totalTests: 0,
        averageScore: 0,
      };

      // Format the response
      const response = {
        users: {
          total: totalUsers,
          active: activeUsers,
          admins: adminUsers,
        },
        questions: {
          total: totalQuestions,
          active: activeQuestions,
          bySubject: questionsBySubject,
        },
        tests: {
          totalTests: testStatistics.totalTests,
          averageScore: testStatistics.averageScore || 0,
        },
        lastUpdated: new Date(),
      };

      res.json(response);
    } catch (error) {
      console.error("Error fetching admin statistics:", error);
      throw new errors.ErrorResponse("Error fetching statistics", 500);
    }
  })
);

// MARK: - /questions POST
// @route   POST /api/admin/question
// @desc    Add a new question
// @access  Admin
router.post(
  "/question",
  upload.multiple,
  asyncHandler(async (req, res) => {
    try {
      // Debug logging
      console.log("Request body:", req.body);
      console.log("Request files:", req.files);
      console.log("Content type:", req.headers["content-type"]);

      // Validate required fields
      if (!req.body.question || !req.body.subject || !req.body.type) {
        return res.status(400).json({
          message: "Missing required fields",
          received: {
            question: !!req.body.question,
            subject: !!req.body.subject,
            type: !!req.body.type,
          },
        });
      }

      // Parse options with error handling
      let options = [];
      if (req.body.options) {
        try {
          // Handle both string and array inputs
          if (typeof req.body.options === "string") {
            console.log("Parsing options string:", req.body.options);
            options = JSON.parse(req.body.options);
          } else if (Array.isArray(req.body.options)) {
            options = req.body.options;
          }

          // Validate options structure
          options = options.map((option, index) => {
            const optionObj =
              typeof option === "string" ? { text: option } : option;
            return {
              text: optionObj.text || "",
              isCorrect: index === parseInt(req.body.correctAnswer, 10),
            };
          });

          console.log("Processed options:", options);
        } catch (error) {
          console.error("Options parsing error:", error);
          return res.status(400).json({
            message: "Invalid options format",
            error: error.message,
            receivedOptions: req.body.options,
          });
        }
      }

      // Create question data
      const questionData = {
        subject: req.body.subject,
        type: req.body.type,
        question: req.body.question,
        difficulty: req.body.difficulty || "medium",
        options: options,
        sampleResponse: req.body.sampleResponse,
        correctAnswer: parseInt(req.body.correctAnswer, 10),
        explanation: req.body.explanation,
        createdBy: req.user._id,
      };

      // Handle file uploads
      if (req.files) {
        console.log("Processing files:", Object.keys(req.files));

        if (req.files.audio) {
          questionData.audioUrl = req.files.audio[0].path;
          console.log("Audio file path:", questionData.audioUrl);
        }

        if (req.files.image) {
          questionData.imageUrl = req.files.image[0].path;
          console.log("Image file path:", questionData.imageUrl);
        }
      }

      // Validate audio questions
      if (questionData.type === "audio" && !questionData.audioUrl) {
        return res.status(400).json({
          message: "Audio file is required for audio questions",
          receivedFiles: req.files ? Object.keys(req.files) : [],
        });
      }

      console.log("Final question data:", questionData);

      // Create and save the question
      const question = new Question(questionData);
      await question.save();

      res.status(201).json(question);
    } catch (error) {
      console.error("Error creating question:", error);

      // Return detailed error response
      res.status(400).json({
        message: "Failed to create question",
        error: error.message,
        stack: process.env.NODE_ENV === "development" ? error.stack : undefined,
      });
    }
  })
);

// MARK: - /bulk-questions
// @route   POST /api/admin/bulk-questions
// @desc    Bulk create/update questions
// @access  Admin
router.post(
  "/bulk-questions",
  asyncHandler(async (req, res) => {
    const { questions } = req.body;

    // Validate question format
    const validatedQuestions = questions.map((q) => ({
      subject: q.subject,
      type: q.type,
      difficulty: q.difficulty,
      question: q.question,
      options: q.options,
      correctAnswer: q.correctAnswer,
      sampleResponse: q.sampleResponse,
      active: q.active,
      createdBy: req.user._id,
    }));

    const results = await Question.insertMany(validatedQuestions);
    res.json(results);
  })
);

// MARK: - /audit
// @route   GET /api/admin/audit
// @desc    Get system audit logs (last 100 actions)
// @access  Admin
router.get(
  "/audit",
  asyncHandler(async (req, res) => {
    const recentChanges = await Promise.all([
      // Recent question changes
      Question.find()
        .sort({ updatedAt: -1 })
        .limit(50)
        .select("question subject type updatedAt createdBy"),

      // Recent user changes
      User.find()
        .sort({ updatedAt: -1 })
        .limit(50)
        .select("username email role isActive updatedAt"),
    ]);

    const allChanges = [
      ...recentChanges[0].map((q) => ({
        type: "question",
        item: q,
        date: q.updatedAt,
      })),
      ...recentChanges[1].map((u) => ({
        type: "user",
        item: u,
        date: u.updatedAt,
      })),
    ];

    // Sort by date descending
    allChanges.sort((a, b) => b.date - a.date);

    res.json(allChanges.slice(0, 100));
  })
);

// MARK: - /messages/stats
// @route   GET /admin/messages/stats
// @desc    Get chat statistics
// @access  Private
router.get(
  "/messages/stats",
  auth.required,
  auth.admin,
  asyncHandler(async (req, res) => {
    const stats = await ChatMessage.aggregate([
      {
        $group: {
          _id: "$subject",
          messageCount: { $sum: 1 },
          userMessages: { $sum: { $cond: ["$isUser", 1, 0] } },
          botMessages: { $sum: { $cond: ["$isUser", 0, 1] } },
          errors: { $sum: { $cond: ["$isError", 1, 0] } },
        },
      },
    ]);

    res.json(stats);
  })
);

// MARK: - /messages/cleanup
// @route   POST /admin/messages/cleanup
// @desc    Cleanup old messages
// @access  Private
router.post(
  "/messages/cleanup",
  auth.required,
  auth.admin,
  asyncHandler(async (req, res) => {
    const { daysToKeep = 30 } = req.body;

    const result = await ChatMessage.cleanupOldMessages(
      req.user._id,
      daysToKeep
    );

    res.json({
      message: "Cleanup completed",
      deletedCount: result.deletedCount,
    });
  })
);

export default router;
