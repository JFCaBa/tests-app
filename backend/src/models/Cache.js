import mongoose from "mongoose";

const CacheSchema = new mongoose.Schema(
  {
    key: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    value: {
      type: String,
      required: true,
    },
    subject: {
      type: String,
      required: true,
      index: true,
    },
    createdAt: {
      type: Date,
      default: Date.now,
      expires: 86400, // Cache entries expire after 24 hours (in seconds)
    },
    metadata: {
      timesRequested: {
        type: Number,
        default: 1,
      },
      lastAccessed: {
        type: Date,
        default: Date.now,
      },
    },
  },
  {
    timestamps: true,
  }
);

// Add method to get cached response
CacheSchema.statics.getCachedResponse = async function (key) {
  const cached = await this.findOne({ key });
  if (cached) {
    // Update metadata
    cached.metadata.timesRequested += 1;
    cached.metadata.lastAccessed = new Date();
    await cached.save();
    return cached.value;
  }
  return null;
};

// Add method to cache response
CacheSchema.statics.cacheResponse = async function (key, value, subject) {
  try {
    const cached = await this.create({
      key,
      value,
      subject,
    });
    return cached;
  } catch (error) {
    // Handle duplicate key errors gracefully
    if (error.code === 11000) {
      return await this.findOneAndUpdate(
        { key },
        {
          value,
          subject,
          "metadata.lastAccessed": new Date(),
          $inc: { "metadata.timesRequested": 1 },
        },
        { new: true }
      );
    }
    throw error;
  }
};

// Add method to clear cache
CacheSchema.statics.clearCache = async function (subject = null) {
  if (subject) {
    return await this.deleteMany({ subject });
  }
  return await this.deleteMany({});
};

const Cache = mongoose.model("Cache", CacheSchema);

export default Cache;
