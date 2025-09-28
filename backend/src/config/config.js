import dotenv from "dotenv";
dotenv.config();

const isDevelopment = process.env.NODE_ENV === "development";

export const config = {
  port: process.env.PORT || 1999,
  mongoURI: process.env.MONGODB_URI,
  jwtSecret: process.env.JWT_SECRET,
  env: process.env.NODE_ENV || "development",
  corsOrigin: process.env.CORS_ORIGIN || "https://testmyrussian.com,https://www.testmyrussian.com",
  uploadPath: process.env.UPLOAD_PATH || "uploads/",
  maxFileSize: process.env.MAX_FILE_SIZE || "10mb",
};

export const dbConfig = {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  retryWrites: true,
};
