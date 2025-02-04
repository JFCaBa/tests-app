import express from "express";
import { ChatMessage } from "../models/index.js";
import { auth, validation, errors } from "../middleware/index.js";
const { asyncHandler } = errors;

const router = express.Router();

// @route   GET /chat/messages
// @desc    Get chat messages with optional subject filter
// @access  Private
router.get(
  "/messages",
  auth.required,
  validation.rules.query.pagination,
  asyncHandler(async (req, res) => {
    const { subject, limit = 50 } = req.query;

    const messages = await ChatMessage.getConversationHistory(
      req.user._id,
      subject || null,
      parseInt(limit)
    );

    res.json(messages);
  })
);

// @route   POST /chat/messages
// @desc    Save a new chat message
// @access  Private
router.post(
  "/messages",
  auth.required,
  validation.rules.chat.createMessage,
  validation.validate,
  asyncHandler(async (req, res) => {
    const { text, isUser, subject, timestamp, isError } = req.body;

    const message = await ChatMessage.create({
      userId: req.user._id,
      text,
      isUser,
      subject,
      timestamp: timestamp || new Date(),
      isError,
      metadata: {
        userContext: {
          totalTests: req.user.statistics?.totalTests || 0,
          averageScore: req.user.statistics?.averageScore || 0,
          preferredSubjects: req.user.preferences?.preferredSubjects || [],
        },
      },
    });

    res.status(201).json(message);
  })
);

// @route   DELETE /chat/messages
// @desc    Delete chat messages (with optional subject filter)
// @access  Private
router.delete(
  "/messages",
  auth.required,
  asyncHandler(async (req, res) => {
    const { subject, before } = req.query;
    const query = { userId: req.user._id };

    if (subject) {
      query.subject = subject;
    }

    if (before) {
      query.timestamp = { $lt: new Date(before) };
    }

    await ChatMessage.deleteMany(query);

    res.json({ message: "Messages deleted successfully" });
  })
);

// @route   POST /chat/messages/cleanup
// @desc    Cleanup old messages
// @access  Private
router.post(
  "/messages/cleanup",
  auth.required,
  asyncHandler(async (req, res) => {
    const result = await ChatMessage.cleanupMessages(req.user._id);

    res.json({
      message: "Cleanup completed",
      deletedCount: result.deletedCount,
    });
  })
);

export default router;
