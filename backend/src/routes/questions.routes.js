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

// @route   GET /api/questions/practice
// @desc    Get practice questions
// @access  Private
router.get(
  "/practice",
  auth.required,
  asyncHandler(async (req, res) => {
    const { subject, mode, difficulty } = req.query;
    const query = { active: true };

    if (subject && subject !== "all") query.subject = subject;
    if (difficulty && difficulty !== "all") query.difficulty = difficulty;

    // Get random question based on mode
    const question = await Question.aggregate([
      { $match: query },
      { $sample: { size: 1 } },
      {
        $project:
          mode === "practice"
            ? {
                // Include all fields in practice mode
                _id: 1,
                question: 1,
                subject: 1,
                type: 1,
                difficulty: 1,
                options: 1,
                audioUrl: 1,
                imageUrl: 1,
                timeLimit: 1,
                correctAnswer: 1,
                explanation: 1,
              }
            : {
                // Exclude sensitive fields in test mode
                correctAnswer: 0,
                explanation: 0,
                statistics: 0,
              },
      },
    ]).then((results) => results[0]);

    if (!question) {
      return res
        .status(404)
        .json({ message: "No questions available for the selected criteria" });
    }

    res.json(question);
  })
);

// @route   POST /api/questions/check
// @desc    Check answer for practice question
// @access  Private
router.post(
  "/check",
  auth.required,
  asyncHandler(async (req, res) => {
    const { questionId, answer, timeSpent } = req.body;
    const question = await Question.findById(questionId);

    if (!question) {
      return res.status(404).json({ message: "Question not found" });
    }

    let isCorrect = false;
    const responseData = {
      correct: false,
      explanation: question.explanation || "",
    };

    switch (question.type) {
      case "multiple-choice":
        isCorrect = answer === question.correctAnswer;
        responseData.correct = isCorrect;
        responseData.correctAnswer = question.correctAnswer;
        break;

      case "writing":
        // For writing questions, we might want to implement more sophisticated checking
        responseData.sampleResponse = question.sampleResponse;
        break;

      case "audio":
        isCorrect = answer === question.correctAnswer;
        responseData.correct = isCorrect;
        responseData.correctAnswer = question.correctAnswer;
        break;

      default:
        return res.status(400).json({ message: "Invalid question type" });
    }

    // Update question statistics
    question.statistics = question.statistics || {};
    question.statistics.timesAnswered =
      (question.statistics.timesAnswered || 0) + 1;
    if (isCorrect) {
      question.statistics.timesCorrect =
        (question.statistics.timesCorrect || 0) + 1;
    }

    // Update average time spent if provided
    if (timeSpent) {
      const oldTotal =
        (question.statistics.timesAnswered - 1) *
        (question.statistics.averageTimeSpent || 0);
      question.statistics.averageTimeSpent =
        (oldTotal + timeSpent) / question.statistics.timesAnswered;
    }

    await question.save();
    res.json(responseData);
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

    const updateData = { ...req.body };

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
