import mongoose from "mongoose";
import bcrypt from "bcryptjs";

const TestResultSchema = new mongoose.Schema({
  questionId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Question",
    required: true,
  },
  userAnswer: mongoose.Schema.Types.Mixed,
  correct: Boolean,
  timeSpent: Number,
  // Add these fields to store details directly
  question: String,
  correctAnswer: mongoose.Schema.Types.Mixed,
  options: [mongoose.Schema.Types.Mixed],
  explanation: String,
});

const TestHistorySchema = new mongoose.Schema({
  testDate: {
    type: Date,
    default: Date.now,
  },
  subject: {
    type: String,
    required: true,
    enum: [
      "listening",
      "grammar",
      "history",
      "laws",
      "reading",
      "writing",
      "all",
    ],
  },
  score: {
    type: Number,
    required: true,
  },
  totalQuestions: {
    type: Number,
    required: true,
  },
  correctAnswers: {
    type: Number,
    required: true,
  },
  timeSpent: {
    type: Number,
    required: true,
  },
  difficulty: {
    type: String,
    enum: ["easy", "medium", "hard"],
    default: "medium", // Add default value
  },
  questions: [TestResultSchema],
});

const StatisticsSchema = new mongoose.Schema(
  {
    totalAnswered: {
      type: Number,
      default: 0,
    },
    totalCorrect: {
      type: Number,
      default: 0,
    },
    bySubject: {
      type: Map,
      of: new mongoose.Schema(
        {
          answered: { type: Number, default: 0 },
          correct: { type: Number, default: 0 },
          averageTimeSpent: { type: Number, default: 0 },
        },
        { _id: false }
      ),
      default: new Map(),
    },
  },
  { _id: false }
);

const UserSchema = new mongoose.Schema(
  {
    username: {
      type: String,
      required: [true, "Username is required"],
      unique: true,
      trim: true,
      minlength: [3, "Username must be at least 3 characters long"],
    },
    email: {
      type: String,
      required: [true, "Email is required"],
      unique: true,
      trim: true,
      lowercase: true,
      match: [
        /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/,
        "Please enter a valid email",
      ],
    },
    password: {
      type: String,
      required: [true, "Password is required"],
      minlength: [6, "Password must be at least 6 characters long"],
    },
    role: {
      type: String,
      enum: ["user", "admin", "tutor"],
      default: "user",
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    lastLogin: {
      type: Date,
      default: Date.now,
    },
    statistics: {
      type: StatisticsSchema,
      default: () => ({}),
    },
    testHistory: [TestHistorySchema],
    preferences: {
      preferredSubjects: [
        {
          type: String,
          enum: [
            "listening",
            "grammar",
            "history",
            "laws",
            "reading",
            "writing",
          ],
        },
      ],
      notificationEnabled: {
        type: Boolean,
        default: true,
      },
      defaultDifficulty: {
        type: String,
        enum: ["easy", "medium", "hard"],
        default: "medium",
      },
      questionsPerTest: {
        type: Number,
        default: 10,
      },
    },
  },
  {
    timestamps: true,
  }
);

// Pre-save middleware to hash password
UserSchema.pre("save", async function (next) {
  if (this.isModified("password")) {
    try {
      const salt = await bcrypt.genSalt(10);
      this.password = await bcrypt.hash(this.password, salt);
    } catch (error) {
      return next(error);
    }
  }
  next();
});

// Method to compare password
UserSchema.methods.comparePassword = async function (candidatePassword) {
  try {
    return await bcrypt.compare(candidatePassword, this.password);
  } catch (error) {
    throw error;
  }
};

// Virtual for success rate
UserSchema.virtual("successRate").get(function () {
  if (!this.statistics || this.statistics.totalAnswered === 0) return 0;
  return (this.statistics.totalCorrect / this.statistics.totalAnswered) * 100;
});

const User = mongoose.model("User", UserSchema);

export default User;
