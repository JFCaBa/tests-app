import multer from "multer";
import path from "path";
import { config } from "../config/config.js";

// Configure storage
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    let uploadPath = config.uploadPath;

    // Choose subdirectory based on file type
    if (file.mimetype.startsWith("audio/")) {
      uploadPath = path.join(uploadPath, "audio");
    } else if (file.mimetype.startsWith("image/")) {
      uploadPath = path.join(uploadPath, "images");
    }

    cb(null, uploadPath);
  },
  filename: (req, file, cb) => {
    // Create unique filename with timestamp
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(
      null,
      file.fieldname + "-" + uniqueSuffix + path.extname(file.originalname)
    );
  },
});

// File filter
const fileFilter = (req, file, cb) => {
  // Allow only specific file types
  if (file.fieldname === "audio") {
    if (
      file.mimetype === "audio/mpeg" ||
      file.mimetype === "audio/wav" ||
      file.mimetype === "audio/mp3"
    ) {
      cb(null, true);
    } else {
      cb(
        new Error("Invalid audio file type. Only MP3 and WAV are allowed."),
        false
      );
    }
  } else if (file.fieldname === "image") {
    if (
      file.mimetype === "image/jpeg" ||
      file.mimetype === "image/png" ||
      file.mimetype === "image/gif"
    ) {
      cb(null, true);
    } else {
      cb(
        new Error(
          "Invalid image file type. Only JPEG, PNG and GIF are allowed."
        ),
        false
      );
    }
  } else {
    cb(new Error("Invalid field name"), false);
  }
};

// Create multer upload instance
const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit
  },
});

// Middleware for handling file upload errors
export const handleUploadError = (err, req, res, next) => {
  if (err instanceof multer.MulterError) {
    if (err.code === "LIMIT_FILE_SIZE") {
      return res.status(400).json({
        message: "File is too large. Maximum size is 10MB",
      });
    }
    return res.status(400).json({
      message: `Upload error: ${err.message}`,
    });
  } else if (err) {
    return res.status(400).json({
      message: err.message,
    });
  }
  next();
};

// Export configured upload middleware
export const uploadAudio = upload.single("audio");
export const uploadImage = upload.single("image");
export const uploadMultiple = upload.fields([
  { name: "audio", maxCount: 1 },
  { name: "image", maxCount: 1 },
]);
