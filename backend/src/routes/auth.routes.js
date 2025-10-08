import mongoose from "mongoose";
import express from "express";
import jwt from "jsonwebtoken";
import { config } from "../config/config.js";
import { User } from "../models/index.js";
import { auth, validation, errors } from "../middleware/index.js";
import { validationResult } from "express-validator";
const { asyncHandler } = errors;

const router = express.Router();

// @route   POST /api/auth/register
// @desc    Register a new user
// @access  Public
router.post(
  "/register",
  auth.optional,
  asyncHandler(async (req, res) => {
    const isTemporaryUser = req.user && req.user.isTemporary;
    const validationRules = isTemporaryUser
      ? validation.rules.user.convert
      : validation.rules.user.register;

    await Promise.all(validationRules.map(validation => validation.run(req)));

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { username, email, password } = req.body;

    if (isTemporaryUser) {
      // Convert temporary user to permanent
      const user = req.user;
      user.username = username;
      user.email = email;
      user.password = password;
      user.isTemporary = false;
      await user.save();

      // Generate token
      const token = jwt.sign({ userId: user._id }, config.jwtSecret, {
        expiresIn: "120d",
      });

      return res.status(200).json({
        token,
        user: {
          id: user._id,
          username: user.username,
          email: user.email,
          role: user.role,
          preferences: user.preferences,
        },
      });
    }

    // Check if user already exists
    const userExists = await User.findOne({ $or: [{ email }, { username }] });
    if (userExists) {
      return res.status(400).json({ message: "User already exists" });
    }

    // Create user
    const user = await User.create({
      username,
      email,
      password,
    });

    // Generate token
    const token = jwt.sign({ userId: user._id }, config.jwtSecret, {
      expiresIn: "120d",
    });

    res.status(201).json({
      token,
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        role: user.role,
        preferences: user.preferences,
      },
    });
  })
);

// @route   POST /api/auth/login
// @desc    Authenticate user & get token
// @access  Public
router.post(
  "/login",
  validation.rules.user.login,
  validation.validate,
  asyncHandler(async (req, res) => {
    const { email, password } = req.body;

    // Find user
    const user = await User.findOne({ email });
    if (!user || !(await user.comparePassword(password))) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    if (!user.isActive) {
      return res.status(401).json({ message: "Account is deactivated" });
    }

    // Update last login
    user.lastLogin = new Date();
    await user.save();

    // Generate token
    const token = jwt.sign({ userId: user._id }, config.jwtSecret, {
      expiresIn: "120d",
    });

    res.json({
      token,
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        role: user.role,
        preferences: user.preferences,
        lastLogin: user.lastLogin,
      },
    });
  })
);

// @route   POST /api/auth/guest
// @desc    Create a temporary guest user
// @access  Public
router.post(
  "/guest",
  asyncHandler(async (req, res) => {
    // Create user
    const user = await User.create({
      isTemporary: true,
    });

    // Generate token
    const token = jwt.sign({ userId: user._id }, config.jwtSecret, {
      expiresIn: "120d",
    });

    res.status(201).json({
      token,
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        role: user.role,
        preferences: user.preferences,
      },
    });
  })
);

// @route   GET /api/auth/me
// @desc    Get current user
// @access  Private
router.get(
  "/me",
  auth.required,
  asyncHandler(async (req, res) => {
    const user = await User.findById(req.user._id).select("-password");
    res.json(user);
  })
);

// @route   PUT /api/auth/me
// @desc    Update user profile
// @access  Private
router.put(
  "/me",
  auth.required,
  asyncHandler(async (req, res) => {
    const { username, email, preferences } = req.body;
    const user = await User.findById(req.user._id);

    if (username) user.username = username;
    if (email) user.email = email;

    // Handle preferences update with proper type checking
    if (preferences) {
      user.preferences = {
        // Keep existing preferences that aren't being updated
        ...user.preferences,
        // Update with new preferences
        notificationEnabled:
          typeof preferences.notificationEnabled === "boolean"
            ? preferences.notificationEnabled
            : user.preferences.notificationEnabled,
        preferredSubjects: Array.isArray(preferences.preferredSubjects)
          ? preferences.preferredSubjects
          : user.preferences.preferredSubjects || [],
        defaultDifficulty: ["easy", "medium", "hard"].includes(
          preferences.defaultDifficulty
        )
          ? preferences.defaultDifficulty
          : user.preferences.defaultDifficulty || "medium",
        questionsPerTest: Number.isInteger(Number(preferences.questionsPerTest))
          ? Number(preferences.questionsPerTest)
          : user.preferences.questionsPerTest || 10,
      };
    }

    await user.save();

    // Return the complete updated user object
    res.json({
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        role: user.role,
        preferences: user.preferences,
      },
    });
  })
);

// @route   POST /api/auth/logout
// @desc    Logout user (optional: blacklist token)
// @access  Private
router.post(
  "/logout",
  auth.required,
  asyncHandler(async (req, res) => {
    // In a real implementation, you might want to blacklist the token
    // For now, we'll just send a success response
    res.json({ message: "Successfully logged out" });
  })
);

export default router;
