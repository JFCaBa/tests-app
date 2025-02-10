// models/Tutor.js
import mongoose from "mongoose";

const availabilitySchema = new mongoose.Schema({
  dayOfWeek: Number,
  startTime: String,
  endTime: String,
});

const TutorSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    bio: String,
    hourlyRate: {
      type: Number,
      required: true,
    },
    subjects: [
      {
        type: String,
        enum: ["listening", "grammar", "history", "laws", "reading", "writing"],
      },
    ],
    availability: [availabilitySchema],
    phonePayments: Boolean,
    paypalPayments: Boolean,
    phoneNumber: String,
    paypalEmail: String,
    active: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.model("Tutor", TutorSchema);
