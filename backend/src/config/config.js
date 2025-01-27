import dotenv from "dotenv";
dotenv.config();

export const config = {
  port: process.env.PORT || 3000,
  mongoURI: process.env.MONGODB_URI,
  jwtSecret: process.env.JWT_SECRET,
  env: process.env.NODE_ENV || "development",
  corsOrigin: process.env.CORS_ORIGIN || "http://localhost:5173",
  uploadPath: process.env.UPLOAD_PATH || "uploads/",
  maxFileSize: process.env.MAX_FILE_SIZE || "10mb",
};

export const dbConfig = {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  retryWrites: true,
};
