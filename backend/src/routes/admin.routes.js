import express from "express";
import { User, Question } from "../models/index.js";
import { auth, validation, errors } from "../middleware/index.js";
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
