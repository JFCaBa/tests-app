import express from "express";
import { Question } from "../models/index.js";
import { auth, upload, validation, errors } from "../middleware/index.js";
const { asyncHandler } = errors;

const router = express.Router();

// @route   GET /api/questions
// @desc    Get questions with filters
// @access  Private
router.get(
  "/",
  auth.required,
  validation.rules.query.pagination,
  validation.rules.query.search,
  validation.validate,
  asyncHandler(async (req, res) => {
    const { subject, type, difficulty, page = 1, limit = 10 } = req.query;

    const query = { active: true };
    if (subject) query.subject = subject;
    if (type) query.type = type;
    if (difficulty) query.difficulty = difficulty;

    const skip = (page - 1) * limit;

    const questions = await Question.find(query)
      .skip(skip)
      .limit(Number(limit))
      .sort({ createdAt: -1 });

    const total = await Question.countDocuments(query);

    res.json({
      questions,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total,
        pages: Math.ceil(total / limit),
      },
    });
  })
);

// @route   POST /api/questions
// @desc    Create a new question
// @access  Admin
router.post(
  "/",
  [auth.required, auth.admin],
  upload.multiple,
  validation.rules.question.create,
  validation.validate,
  asyncHandler(async (req, res) => {
    const questionData = { ...req.body, createdBy: req.user._id };

    // Handle file uploads if any
    if (req.files) {
      if (req.files.audio) {
        questionData.audioUrl = req.files.audio[0].path;
      }
      if (req.files.image) {
        questionData.imageUrl = req.files.image[0].path;
      }
    }

    const question = await Question.create(questionData);
    res.status(201).json(question);
  })
);

// @route   GET /api/questions/:id
// @desc    Get question by ID
// @access  Private
router.get(
  "/:id",
  auth.required,
  asyncHandler(async (req, res) => {
    const question = await Question.findById(req.params.id);
    if (!question) {
      return res.status(404).json({ message: "Question not found" });
    }
    res.json(question);
  })
);

// @route   PUT /api/questions/:id
// @desc    Update question
// @access  Admin
router.put(
  "/:id",
  [auth.required, auth.admin],
  upload.multiple,
  validation.rules.question.update,
  validation.validate,
  asyncHandler(async (req, res) => {
    let question = await Question.findById(req.params.id);
    if (!question) {
      return res.status(404).json({ message: "Question not found" });
    }

    // Update fields
    const updateData = { ...req.body };

    // Handle file uploads if any
    if (req.files) {
      if (req.files.audio) {
        updateData.audioUrl = req.files.audio[0].path;
      }
      if (req.files.image) {
        updateData.imageUrl = req.files.image[0].path;
      }
    }

    question = await Question.findByIdAndUpdate(req.params.id, updateData, {
      new: true,
      runValidators: true,
    });

    res.json(question);
  })
);

// @route   DELETE /api/questions/:id
// @desc    Delete question (soft delete)
// @access  Admin
router.delete(
  "/:id",
  [auth.required, auth.admin],
  asyncHandler(async (req, res) => {
    const question = await Question.findById(req.params.id);
    if (!question) {
      return res.status(404).json({ message: "Question not found" });
    }

    // Soft delete
    question.active = false;
    await question.save();

    res.json({ message: "Question deleted successfully" });
  })
);

// @route   GET /api/questions/subject/:subject
// @desc    Get questions by subject
// @access  Private
router.get(
  "/subject/:subject",
  auth.required,
  asyncHandler(async (req, res) => {
    const { subject } = req.params;
    const questions = await Question.find({
      subject,
      active: true,
    }).sort({ createdAt: -1 });

    res.json(questions);
  })
);

export default router;
