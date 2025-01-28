import fs from "fs/promises";
import express from "express";
import { User, Question } from "../models/index.js";
import { auth, validation, errors, upload } from "../middleware/index.js";

const { asyncHandler } = errors;
const router = express.Router();

// All routes require admin privileges
router.use(auth.required, auth.admin);

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

// @route   GET /api/admin/stats
// @desc    Get system statistics
// @access  Admin
router.get(
  "/stats",
  asyncHandler(async (req, res) => {
    const stats = await Promise.all([
      // User statistics
      User.countDocuments(),
      User.countDocuments({ role: "admin" }),
      User.countDocuments({ isActive: true }),

      // Question statistics
      Question.countDocuments(),
      Question.countDocuments({ active: true }),
      Question.aggregate([
        {
          $group: {
            _id: "$subject",
            count: { $sum: 1 },
          },
        },
      ]),

      // Test statistics from user history
      User.aggregate([
        { $unwind: "$testHistory" },
        {
          $group: {
            _id: null,
            totalTests: { $sum: 1 },
            averageScore: { $avg: "$testHistory.score" },
          },
        },
      ]),
    ]);

    res.json({
      users: {
        total: stats[0],
        admins: stats[1],
        active: stats[2],
      },
      questions: {
        total: stats[3],
        active: stats[4],
        bySubject: stats[5],
      },
      tests: stats[6][0] || { totalTests: 0, averageScore: 0 },
    });
  })
);

// @route   POST /api/admin/question
// @desc    Add a new question
// @access  Admin
router.post(
  "/question",
  upload.multiple,
  asyncHandler(async (req, res) => {
    try {
      console.log("Received request:", req.body, req.files);

      // Ensure required fields are present
      if (!req.body.question || !req.body.subject) {
        return res.status(400).json({ message: "Missing required fields" });
      }

      // Parse options field (ensure it's an array of objects)
      let optionsArray = [];
      if (req.body.options) {
        try {
          optionsArray = JSON.parse(req.body.options); // Convert JSON string to array
          // Validate the structure of each option object
          optionsArray = optionsArray.map((option) => ({
            text: option.text || "Default option", // Ensure text is provided
            isCorrect:
              typeof option.isCorrect === "boolean" ? option.isCorrect : false,
          }));
        } catch (error) {
          return res
            .status(400)
            .json({ message: "Invalid JSON format for options" });
        }
      }

      // Create the question first
      const questionData = {
        ...req.body,
        options: optionsArray,
        createdBy: req.user._id,
      };
      let uploadedFiles = []; // Ensure this is initialized

      let question = new Question(questionData);

      if (req.files) {
        if (req.files.audio) {
          question.audioUrl = req.files.audio[0].path; // Assign audio URL
          uploadedFiles.push(req.files.audio[0].path);
        }
        if (req.files.image) {
          question.imageUrl = req.files.image[0].path;
          uploadedFiles.push(req.files.image[0].path);
        }
      }

      // Save the question document after setting all fields
      question = await question.save();

      res.status(201).json(question);
    } catch (error) {
      console.error("Error creating question:", error);

      // Cleanup uploaded files if an error occurs
      await Promise.all(
        uploadedFiles.map((file) => fs.unlink(file).catch(() => {}))
      );

      res
        .status(400)
        .json({ message: "Failed to create question", error: error.message });
    }
  })
);

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

export default router;
