import express from "express";
import { TutorSession, Tutor, User } from "../models/index.js";
import { auth, validation, errors } from "../middleware/index.js";
const { asyncHandler } = errors;
const router = express.Router();

// Get all sessions with filters
router.get(
  "/",
  [auth.required, auth.admin],
  asyncHandler(async (req, res) => {
    const { status, search } = req.query;
    const query = {};

    if (status && status !== "all") {
      query.status = status;
    }

    const sessions = await TutorSession.find(query)
      .populate("tutorId", "name")
      .populate("studentId", "username")
      .sort({ startTime: -1 });

    if (search) {
      const filtered = sessions.filter(
        (session) =>
          session.tutorId.name.toLowerCase().includes(search.toLowerCase()) ||
          session.studentId.username
            .toLowerCase()
            .includes(search.toLowerCase())
      );
      return res.json({ sessions: filtered });
    }

    res.json({ sessions });
  })
);

// Create new session
router.post(
  "/",
  [auth.required, auth.admin],
  asyncHandler(async (req, res) => {
    const { tutorId, studentId, startTime, duration, subject, notes } =
      req.body;

    const endTime = new Date(new Date(startTime).getTime() + duration * 60000);

    const tutor = await Tutor.findById(tutorId);
    if (!tutor) {
      return res.status(404).json({ message: "Tutor not found" });
    }

    const session = await TutorSession.create({
      tutorId,
      studentId,
      startTime,
      endTime,
      subject,
      notes,
      status: "pending",
      amount: (duration / 60) * tutor.hourlyRate,
      paymentMethod: "paypal", // Default to PayPal
    });

    const populatedSession = await TutorSession.findById(session._id)
      .populate("tutorId", "name")
      .populate("studentId", "username");

    res.status(201).json(populatedSession);
  })
);

// Get session by ID
router.get(
  "/:id",
  [auth.required, auth.admin],
  asyncHandler(async (req, res) => {
    const session = await TutorSession.findById(req.params.id)
      .populate("tutorId", "name")
      .populate("studentId", "username");

    if (!session) {
      return res.status(404).json({ message: "Session not found" });
    }

    res.json(session);
  })
);

// Update session
router.put(
  "/:id",
  [auth.required, auth.admin],
  asyncHandler(async (req, res) => {
    const { tutorId, studentId, startTime, duration, subject, notes, status } =
      req.body;

    const endTime = new Date(new Date(startTime).getTime() + duration * 60000);

    const session = await TutorSession.findByIdAndUpdate(
      req.params.id,
      {
        tutorId,
        studentId,
        startTime,
        endTime,
        subject,
        notes,
        status,
      },
      { new: true }
    )
      .populate("tutorId", "name")
      .populate("studentId", "username");

    if (!session) {
      return res.status(404).json({ message: "Session not found" });
    }

    res.json(session);
  })
);

// Update session status
router.patch(
  "/:id/status",
  [auth.required, auth.admin],
  asyncHandler(async (req, res) => {
    const { status } = req.body;

    const session = await TutorSession.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true }
    )
      .populate("tutorId", "name")
      .populate("studentId", "username");

    if (!session) {
      return res.status(404).json({ message: "Session not found" });
    }

    res.json(session);
  })
);

// Delete session
router.delete(
  "/:id",
  [auth.required, auth.admin],
  asyncHandler(async (req, res) => {
    const session = await TutorSession.findByIdAndDelete(req.params.id);

    if (!session) {
      return res.status(404).json({ message: "Session not found" });
    }

    res.json({ message: "Session deleted successfully" });
  })
);

export default router;
