import express from "express";
import { auth, errors } from "../middleware/index.js";
const { asyncHandler } = errors;

const router = express.Router();

// Health check endpoint
router.get(
  "/health",
  asyncHandler(async (req, res) => {
    res.json({ status: "ok", timestamp: new Date() });
  })
);

// Generate response endpoint
router.post(
  "/generate",
  auth.required,
  asyncHandler(async (req, res) => {
    const { input, subject, context } = req.body;

    try {
      // Here you would integrate with your local AI service
      // For now, we'll use a simple response system
      const response = await generateResponse(input, subject, context);
      res.json({ response });
    } catch (error) {
      console.error("Generation error:", error);
      res.status(500).json({
        message: "Failed to generate response",
        fallback: true,
      });
    }
  })
);

// Get subject statistics
router.get(
  "/stats/:subject",
  auth.required,
  asyncHandler(async (req, res) => {
    const { subject } = req.params;
    const userId = req.user._id;

    try {
      // Get user's statistics for the subject
      const stats = await getUserSubjectStats(userId, subject);
      res.json(stats);
    } catch (error) {
      console.error("Stats error:", error);
      res.status(500).json({ message: "Failed to get statistics" });
    }
  })
);

// Get suggestions for a subject
router.get(
  "/suggestions/:subject",
  auth.required,
  asyncHandler(async (req, res) => {
    const { subject } = req.params;

    try {
      const suggestions = await getSubjectSuggestions(subject);
      res.json(suggestions);
    } catch (error) {
      console.error("Suggestions error:", error);
      res.status(500).json({ message: "Failed to get suggestions" });
    }
  })
);

export default router;
