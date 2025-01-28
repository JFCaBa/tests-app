import mongoose from "mongoose";

const OptionSchema = new mongoose.Schema({
  text: {
    type: String,
    required: true,
  },
  isCorrect: {
    type: Boolean,
    required: true,
  },
});

const QuestionSchema = new mongoose.Schema(
  {
    subject: {
      type: String,
      required: true,
      enum: ["listening", "grammar", "history", "laws", "reading", "writing"],
      index: true,
    },
    type: {
      type: String,
      required: true,
      enum: ["multiple-choice", "writing", "audio"],
      index: true,
    },
    difficulty: {
      type: String,
      required: true,
      enum: ["easy", "medium", "hard"],
      default: "medium",
    },
    question: {
      type: String,
      required: true,
    },
    options: [OptionSchema],
    correctAnswer: {
      type: Number, // Index of correct option for multiple choice
      required: function () {
        return this.type === "multiple-choice";
      },
    },
    audioUrl: {
      type: String,
      required: function () {
        return this.type === "audio";
      },
    },
    audioDuration: {
      type: Number, // Duration in seconds
      required: function () {
        return this.type === "audio";
      },
    },
    imageUrl: {
      type: String,
    },
    sampleResponse: {
      type: String,
      required: function () {
        return this.type === "writing";
      },
    },
    explanation: {
      type: String, // Explanation of the correct answer
    },
    tags: [
      {
        type: String,
        index: true,
      },
    ],
    metadata: {
      timeLimit: {
        type: Number, // Time limit in seconds
        default: 60,
      },
      points: {
        type: Number,
        default: 1,
      },
    },
    timeLimit: {
      type: Number,
      default: 60,
    },
    statistics: {
      timesAttempted: { type: Number, default: 0 },
      timesAnswered: {
        type: Number,
        default: 0,
      },
      timesCorrect: {
        type: Number,
        default: 0,
      },
      averageTimeSpent: {
        type: Number,
        default: 0,
      },
    },
    active: {
      type: Boolean,
      default: true,
      index: true,
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

// Index for efficient querying
QuestionSchema.index({ subject: 1, type: 1, difficulty: 1, active: 1 });

// Method to update statistics
QuestionSchema.methods.updateStatistics = function (correct, timeSpent) {
  this.statistics.timesAnswered += 1;
  if (correct) {
    this.statistics.timesCorrect += 1;
  }

  // Update average time spent
  const oldTotal =
    (this.statistics.timesAnswered - 1) * this.statistics.averageTimeSpent;
  this.statistics.averageTimeSpent =
    (oldTotal + timeSpent) / this.statistics.timesAnswered;
};

// Virtual for success rate
QuestionSchema.virtual("successRate").get(function () {
  if (this.statistics.timesAnswered === 0) return 0;
  return (this.statistics.timesCorrect / this.statistics.timesAnswered) * 100;
});

// Method to validate audio question
QuestionSchema.pre("save", function (next) {
  if (this.type === "audio" && !this.audioUrl) {
    next(new Error("Audio URL is required for audio questions"));
  }
  if (this.type === "writing" && !this.sampleResponse) {
    next(new Error("Sample response is required for writing questions"));
  }
  next();
});

// Method for checking answers
QuestionSchema.methods.checkAnswer = function (answer) {
  switch (this.type) {
    case "multiple-choice":
      return this.correctAnswer === answer;
    case "writing":
      // Implement writing evaluation logic
      return true; // Placeholder
    case "audio":
      return this.correctAnswer === answer;
    default:
      return false;
  }
};

const Question = mongoose.model("Question", QuestionSchema);

export default Question;
