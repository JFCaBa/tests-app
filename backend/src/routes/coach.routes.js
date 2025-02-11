import express from "express";
import { auth, errors } from "../middleware/index.js";
import aiRotator from "../services/ai.rotator.js";

const { asyncHandler } = errors;
const router = express.Router();

router.get(
  "/health",
  asyncHandler(async (req, res) => {
    const status = {
      status: "ok",
      aiInitialized: aiRotator.isInitialized,
      timestamp: new Date(),
    };
    res.json(status);
  })
);

router.post(
  "/generate",
  auth.required,
  asyncHandler(async (req, res) => {
    const { input, subject, context } = req.body;

    try {
      const response = await aiRotator.generateResponse(
        input,
        subject,
        context
      );

      if (!response) {
        return res.status(500).json({
          message: "Failed to generate response",
          fallback: true,
        });
      }

      res.json({ response });
    } catch (error) {
      console.error("Generation error:", error);
      res.status(500).json({
        message: "Failed to generate response",
        error: error.message,
      });
    }
  })
);

router.get(
  "/status",
  asyncHandler(async (req, res) => {
    res.json({
      initialized: aiRotator.initialized,
      modelLoaded: true,
      timestamp: new Date(),
    });
  })
);

export default router;
