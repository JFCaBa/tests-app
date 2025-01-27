import mongoose from "mongoose";
import { config, dbConfig } from "./config.js";

export const connectDatabase = async () => {
  try {
    await mongoose.connect(config.mongoURI, dbConfig);
    console.log("MongoDB connected successfully");
  } catch (error) {
    console.error("MongoDB connection error:", error);
    process.exit(1);
  }
};

mongoose.connection.on("disconnected", () => {
  console.log("MongoDB disconnected");
});

mongoose.connection.on("error", (err) => {
  console.error("MongoDB error:", err);
});
