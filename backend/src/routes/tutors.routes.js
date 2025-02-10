import express from "express";
import { Tutor, TutorSession } from "../models/index.js";
import { auth, validation, errors } from "../middleware/index.js";

const { asyncHandler } = errors;
const router = express.Router();

// @route   GET /api/tutors
// @desc    Get available tutors
// @access  Private
router.get(
  "/",
  auth.required,
  validation.rules.query.pagination,
  validation.rules.query.search,
  validation.validate,
  asyncHandler(async (req, res) => {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const search = req.query.search || "";

    const query = {
      active: true,
      ...(search ? { subjects: { $regex: search, $options: "i" } } : {}),
    };
    const tutors = await Tutor.find(query)
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .exec();

    const count = await Tutor.countDocuments(query);

    res.json({
      tutors,
      totalPages: Math.ceil(count / limit),
      currentPage: page,
    });
  })
);

// @route   GET /api/tutors/:id
// @desc    Get tutor details
// @access  Private
router.get(
  "/:id",
  auth.required,
  asyncHandler(async (req, res) => {
    const tutor = await Tutor.findById(req.params.id).populate(
      "userId",
      "username email"
    );
    if (!tutor) {
      return res.status(404).json({ message: "Tutor not found" });
    }
    res.json(tutor);
  })
);

// @route   GET /api/tutors/:id/availability
// @desc    Get tutor availability
// @access  Private
router.get(
  "/:id/availability",
  auth.required,
  asyncHandler(async (req, res) => {
    const tutor = await Tutor.findById(req.params.id);
    if (!tutor) {
      return res.status(404).json({ message: "Tutor not found" });
    }
    res.json(tutor.availability);
  })
);

// @route   POST /api/tutors/sessions
// @desc    Create a booking session with a tutor
// @access  Private
router.post(
  "/sessions",
  auth.required,
  validation.rules.body.session,
  validation.validate,
  asyncHandler(async (req, res) => {
    const { tutorId, startTime, endTime, subject, paymentMethod, amount } =
      req.body;
    const studentId = req.user.id;

    const tutor = await Tutor.findById(tutorId);
    if (!tutor) {
      return res.status(404).json({ message: "Tutor not found" });
    }

    const session = new TutorSession({
      tutorId,
      studentId,
      startTime,
      endTime,
      subject,
      paymentMethod,
      amount,
      status: "pending",
    });

    await session.save();
    res.status(201).json(session);
  })
);

export default router;
