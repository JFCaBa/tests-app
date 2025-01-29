import express from "express";
import cors from "cors";
import mongoose from "mongoose";
import { config } from "./config/config.js";

// Import routes
import authRoutes from "./routes/auth.routes.js";
import questionRoutes from "./routes/questions.routes.js";
import testRoutes from "./routes/tests.routes.js";
import adminRoutes from "./routes/admin.routes.js";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

// Middleware
app.use(
  cors({
    origin: ["http://testmyrussian.com", "http://www.testmyrussian.com"],
    credentials: true,
  })
);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static files from the uploads directory
app.use("/uploads", express.static(path.join(__dirname, "../uploads")));

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/questions", questionRoutes);
app.use("/api/tests", testRoutes);
app.use("/api/admin", adminRoutes);

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: "Something went wrong!" });
});

app.get("/debug-static", (req, res) => {
  const testFile = path.join(
    uploadsPath,
    "audio",
    "audio-1738069076455-15569576.mp3"
  );
  res.json({
    uploadsPath,
    testFile,
    exists: fs.existsSync(testFile),
    files: fs.readdirSync(path.join(uploadsPath, "audio")),
  });
});

// Database connection
mongoose
  .connect(config.mongoURI)
  .then(() => {
    console.log("Connected to MongoDB");
    app.listen(config.port, () => {
      console.log(`Server is running on port ${config.port}`);
    });
  })
  .catch((error) => {
    console.error("Error connecting to MongoDB:", error);
    process.exit(1);
  });
