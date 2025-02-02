import express from "express";
import { auth } from "../middleware/index.js";
const router = express.Router();

// @route   GET /subscription/check
// @desc    Check subscription status
// @access  Private
router.get("/check", auth.required, async (req, res) => {
  try {
    const user = req.user;

    // For now, only admins have access
    const hasAccess = user.role === "admin";

    res.json({
      hasAccess,
      isAdmin: user.role === "admin",
      message: hasAccess
        ? "Access granted"
        : "Subscription required for this feature",
    });
  } catch (error) {
    console.error("Subscription check error:", error);
    res.status(500).json({
      message: "Error checking subscription status",
    });
  }
});

export default router;
