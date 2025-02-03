import express from "express";
import { auth, errors } from "../middleware/index.js";
import gpt4allService from "../services/gpt4all.service.js";

const { asyncHandler } = errors;
const router = express.Router();

// Health check endpoint
router.get(
  "/health",
  asyncHandler(async (req, res) => {
    const status = {
      status: "ok",
      aiInitialized: gpt4allService.isInitialized,
      timestamp: new Date(),
    };
    res.json(status);
  })
);

// Generate response endpoint
router.post(
  "/generate",
  auth.required,
  asyncHandler(async (req, res) => {
    const { input, subject, context } = req.body;

    try {
      const response = await gpt4allService.generateResponse(
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

// Get model status
router.get(
  "/status",
  asyncHandler(async (req, res) => {
    res.json({
      initialized: gpt4allService.isInitialized,
      modelLoaded: !!gpt4allService.model,
      timestamp: new Date(),
    });
  })
);

// Delete model cache
router.get(
  auth.required,
  auth.admin,
  "/clear-cache",
  asyncHandler(async (req, res) => {
    gpt4allService.clearCache();
    res.json({
      message: "Cache cleared",
      timestamp: new Date(),
    });
  })
);

export default router;
