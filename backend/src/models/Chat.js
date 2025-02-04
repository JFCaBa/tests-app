import mongoose from "mongoose";

const ChatMessageSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    text: {
      type: String,
      required: true,
    },
    isUser: {
      type: Boolean,
      required: true,
    },
    subject: {
      type: String,
      enum: [
        "listening",
        "grammar",
        "history",
        "laws",
        "reading",
        "writing",
        null,
      ],
      index: true,
    },
    timestamp: {
      type: Date,
      default: Date.now,
      index: true,
    },
    isError: {
      type: Boolean,
      default: false,
    },
    metadata: {
      userContext: {
        totalTests: Number,
        averageScore: Number,
        preferredSubjects: [String],
      },
    },
  },
  {
    timestamps: true,
  }
);

// Index for efficient querying of user's messages by subject and date
ChatMessageSchema.index({ userId: 1, subject: 1, timestamp: -1 });

// Method to get conversation history
ChatMessageSchema.statics.getConversationHistory = async function (
  userId,
  subject = null,
  limit = 50
) {
  const query = { userId };
  if (subject) {
    query.subject = subject;
  }

  return this.find(query).sort({ timestamp: -1 }).limit(limit).lean();
};

// Method to cleanup old messages
ChatMessageSchema.statics.cleanupOldMessages = async function (
  userId,
  daysToKeep = 30
) {
  const cutoffDate = new Date();
  cutoffDate.setDate(cutoffDate.getDate() - daysToKeep);

  return this.deleteMany({
    userId,
    timestamp: { $lt: cutoffDate },
  });
};

// Method to cleanup  messages
ChatMessageSchema.statics.cleanupMessages = async function (userId) {
  return this.deleteMany({
    userId,
  });
};

const ChatMessage = mongoose.model("ChatMessage", ChatMessageSchema);

export default ChatMessage;
