import express from "express";
import path from "path";
import { Question, User } from "../models/index.js";
import { auth, upload, validation, errors } from "../middleware/index.js";
import { localTranscriptionService } from "../services/local-transcription.service.js";

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
    const {
      subject,
      type,
      difficulty,
      page = 1,
      limit = 10,
      search,
    } = req.query;

    const query = { active: true };
    if (subject) query.subject = subject;
    if (type) query.type = type;
    if (difficulty) query.difficulty = difficulty;
    if (search) {
      query.$or = [
        { question: { $regex: search, $options: "i" } },
        { explanation: { $regex: search, $options: "i" } },
      ];
    }

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
// @desc    Check answer and update statistics
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

    // Update question statistics and get results
    const result = await question.updateStatistics(answer, timeSpent);

    // Find and update user
    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Ensure statistics object exists
    if (!user.statistics) {
      user.statistics = {
        totalAnswered: 0,
        totalCorrect: 0,
        bySubject: new Map(),
      };
    }

    // Ensure bySubject map exists
    if (!user.statistics.bySubject) {
      user.statistics.bySubject = new Map();
    }

    // Get or create subject statistics
    let subjectStats = user.statistics.bySubject.get(question.subject);
    if (!subjectStats) {
      subjectStats = {
        answered: 0,
        correct: 0,
        averageTimeSpent: 0,
      };
    }

    // Update statistics
    user.statistics.totalAnswered = (user.statistics.totalAnswered || 0) + 1;
    if (result.isCorrect) {
      user.statistics.totalCorrect = (user.statistics.totalCorrect || 0) + 1;
    }

    // Update subject statistics
    subjectStats.answered += 1;
    if (result.isCorrect) {
      subjectStats.correct += 1;
    }

    // Update average time spent
    if (timeSpent) {
      const oldTotal =
        subjectStats.averageTimeSpent * (subjectStats.answered - 1);
      subjectStats.averageTimeSpent =
        (oldTotal + timeSpent) / subjectStats.answered;
    }

    // Set updated subject statistics
    user.statistics.bySubject.set(question.subject, subjectStats);

    // Mark statistics as modified to ensure save
    user.markModified("statistics");
    await user.save();

    // Convert Map to plain object for response
    const subjectProgress = Object.fromEntries(user.statistics.bySubject);

    res.json({
      correct: result.isCorrect,
      explanation: question.explanation,
      correctAnswer: question.correctAnswer,
      statistics: {
        question: result.statistics,
        successRate: result.successRate,
        user: {
          totalAnswered: user.statistics.totalAnswered,
          totalCorrect: user.statistics.totalCorrect,
          subjectProgress: subjectProgress[question.subject] || {},
        },
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

    // Create update data object
    const updateData = { ...req.body };

    // Handle options data
    if (updateData.options) {
      try {
        // If options is a string, parse it
        if (typeof updateData.options === "string") {
          const parsedOptions = JSON.parse(updateData.options);
          // Validate the structure of each option
          if (!Array.isArray(parsedOptions)) {
            return res
              .status(400)
              .json({ message: "Options must be an array" });
          }
          updateData.options = parsedOptions.map((option) => ({
            text: option.text,
            isCorrect: option.isCorrect,
          }));
        }
      } catch (error) {
        console.error("Error parsing options:", error);
        return res.status(400).json({ message: "Invalid options format" });
      }
    }

    // Handle file uploads
    if (req.files) {
      if (req.files.audio) {
        updateData.audioUrl = req.files.audio[0].path;
      }
      if (req.files.image) {
        updateData.imageUrl = req.files.image[0].path;
      }
    }

    // Remove any undefined or null values
    Object.keys(updateData).forEach(
      (key) =>
        (updateData[key] === undefined || updateData[key] === null) &&
        delete updateData[key]
    );

    try {
      question = await Question.findByIdAndUpdate(req.params.id, updateData, {
        new: true,
        runValidators: true,
      });
      res.json(question);
    } catch (error) {
      // Handle Mongoose validation errors
      if (error.name === "ValidationError") {
        return res.status(400).json({
          message: "Validation Error",
          details: Object.values(error.errors).map((err) => err.message),
        });
      }
      throw error;
    }
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

// @route   POST /questions/:id/transcribe
// @desc    Transcribe audio for a question
// @access  Admin
router.post(
  "/:id/transcribe",
  [auth.required, auth.admin],
  asyncHandler(async (req, res) => {
    const question = await Question.findById(req.params.id);

    if (!question) {
      return res.status(404).json({ message: "Question not found" });
    }

    if (!question.audioUrl) {
      return res.status(400).json({ message: "Question has no audio file" });
    }

    const fullPath = path.join("https://testmyrussian.com", question.audioUrl);
    console.log("Transcribing audio:", fullPath);

    try {
      // Get the audio file
      const audioFile = await fetch(fullPath).then((res) => res.blob());

      const { text } = await localTranscriptionService.transcribeAudio(
        audioFile
      );

      console.log("Transcription result:", text);

      res.json(text);
    } catch (error) {
      console.error("Transcription error:", error);
      res.status(500).json({
        message: "Failed to transcribe audio",
        error: error.message,
      });
    }
  })
);

export default router;
