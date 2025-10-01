import fs from "fs/promises";
import express from "express";
import {
  User,
  Question,
  ChatMessage,
  Tutor,
  TutorSession,
} from "../models/index.js";
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
      .sort({ lastLogin: -1 });

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

router.get(
  "/stats",
  asyncHandler(async (req, res) => {
    try {
      // Get user statistics
      const [
        totalUsers,
        activeUsers,
        adminUsers,

        // Tutor statistics
        totalTutors,
        activeTutors,

        // Question statistics
        totalQuestions,
        activeQuestions,
        questionsBySubject,
      ] = await Promise.all([
        // User statistics
        User.countDocuments(),
        User.countDocuments({ isActive: true }),
        User.countDocuments({ role: "admin" }),

        // Tutor statistics
        Tutor.countDocuments(),
        Tutor.countDocuments({ active: true }),

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

      // Get session statistics
      const [
        upcomingSessions,
        pastSessions,
        pendingSessions,
        confirmedSessions,
        completedSessions,
      ] = await Promise.all([
        TutorSession.countDocuments({
          startTime: { $gt: new Date() },
        }),
        TutorSession.countDocuments({
          startTime: { $lte: new Date() },
        }),
        TutorSession.countDocuments({ status: "pending" }),
        TutorSession.countDocuments({ status: "confirmed" }),
        TutorSession.countDocuments({ status: "completed" }),
      ]);

      // Calculate test statistics
      const testStats = await User.aggregate([
        { $unwind: "$testHistory" },
        {
          $group: {
            _id: null,
            totalTests: { $sum: 1 },
            totalScore: { $sum: "$testHistory.score" },
            totalCorrectAnswers: { $sum: "$testHistory.correctAnswers" },
            totalQuestions: { $sum: "$testHistory.totalQuestions" },
          },
        },
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

      const testStatistics = testStats[0] || {
        totalTests: 0,
        averageScore: 0,
      };

      const response = {
        users: {
          total: totalUsers,
          active: activeUsers,
          admins: adminUsers,
        },
        tutors: {
          total: totalTutors,
          active: activeTutors,
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
        sessions: {
          upcoming: upcomingSessions,
          past: pastSessions,
          byStatus: {
            pending: pendingSessions,
            confirmed: confirmedSessions,
            completed: completedSessions,
          },
          total: upcomingSessions + pastSessions,
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

// MARK: - Tutor
// @route   POST /api/admin/tutors
// @desc    Create a new tutor
// @access  Admin
router.post(
  "/tutors",
  [auth.required, auth.admin],
  asyncHandler(async (req, res) => {
    const {
      name,
      location,
      email,
      gender,
      bio,
      hourlyRate,
      subjects,
      phonePayments,
      paypalPayments,
      phoneNumber,
      paypalEmail,
    } = req.body;

    const tutor = new Tutor({
      userId: req.user._id,
      name,
      location,
      email,
      gender,
      bio,
      hourlyRate: Number(hourlyRate),
      subjects,
      phonePayments,
      paypalPayments,
      phoneNumber: phonePayments ? phoneNumber : undefined,
      paypalEmail: paypalPayments ? paypalEmail : undefined,
      active: true,
    });

    await tutor.save();
    res.status(201).json(tutor);
  })
);

// @route   GET /admin/tutors
// @desc    Get available tutors
// @access  Private
router.get(
  "/tutors",
  auth.required,
  auth.admin,
  validation.rules.query.pagination,
  validation.rules.query.search,
  validation.validate,
  asyncHandler(async (req, res) => {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const search = req.query.search || "";

    const query = {
      ...(search ? { subjects: { $regex: search, $options: "i" } } : {}),
    };
    const tutors = await Tutor.find(query)
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .exec();

    const count = await Tutor.countDocuments(query);

    res.json({
      tutors,
      totalPages: Math.ceil(count / limit),
      currentPage: page,
    });
  })
);

// @route   GET /api/admin/tutors/:id
// @desc    Get tutor by ID
// @access  Admin
router.get(
  "/tutors/:id",
  [auth.required, auth.admin],
  asyncHandler(async (req, res) => {
    const tutor = await Tutor.findById(req.params.id);

    if (!tutor) {
      return res.status(404).json({ message: "Tutor not found" });
    }

    res.json(tutor);
  })
);

// @route   PUT /api/admin/tutors/:id
// @desc    Update tutor
// @access  Admin
router.put(
  "/tutors/:id",
  [auth.required, auth.admin],
  asyncHandler(async (req, res) => {
    const {
      name,
      location,
      email,
      gender,
      bio,
      hourlyRate,
      subjects,
      phonePayments,
      paypalPayments,
      phoneNumber,
      paypalEmail,
      active,
    } = req.body;

    const tutor = await Tutor.findById(req.params.id);

    if (!tutor) {
      return res.status(404).json({ message: "Tutor not found" });
    }

    tutor.name = name;
    tutor.location = location;
    tutor.email = email;
    tutor.gender = gender;
    tutor.bio = bio;
    tutor.hourlyRate = Number(hourlyRate);
    tutor.subjects = subjects;
    tutor.phonePayments = phonePayments;
    tutor.paypalPayments = paypalPayments;
    tutor.phoneNumber = phonePayments ? phoneNumber : undefined;
    tutor.paypalEmail = paypalPayments ? paypalEmail : undefined;
    tutor.active = active;

    const updatedTutor = await tutor.save();
    res.json(updatedTutor);
  })
);

// @route   GET /api/admin/tutors/:id/sessions
// @desc    Tutors sessions
// @access  Admin
router.get(
  "/tutors/:id/sessions",
  auth.required,
  auth.admin,
  async (req, res) => {
    const now = new Date();
    const upcoming = await TutorSession.find({
      tutorId: req.params.id,
      startTime: { $gt: now },
    }).sort({ startTime: 1 });

    const past = await TutorSession.find({
      tutorId: req.params.id,
      startTime: { $lt: now },
    }).sort({ startTime: -1 });

    res.json({ upcoming, past });
  }
);

// @route   DELETE /api/admin/tutors/:id
// @desc    Delete a tutor
// @access  Admin
router.delete(
  "/tutors/:id",
  auth.required,
  auth.admin,
  asyncHandler(async (req, res) => {
    const tutor = await Tutor.findById(req.params.id);

    if (!tutor) {
      return res.status(404).json({ message: "Tutor not found" });
    }

    await tutor.deleteOne();
    res.json({ message: "Tutor removed successfully" });
  })
);

export default router;
