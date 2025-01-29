import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import crypto from "crypto";
import fs from "fs/promises";
import path from "path";
import { fileURLToPath } from "url";
import dotenv from "dotenv";

// Get the directory name in ES module
const __dirname = path.dirname(fileURLToPath(import.meta.url));

const defaultAdmin = {
  username: "admin",
  email: "admin@example.com",
  password: "admin123", // This should be changed after first login
  role: "admin",
  isActive: true,
};

const generateJwtSecret = () => {
  return crypto.randomBytes(64).toString("hex");
};

const setupEnvironmentFile = async () => {
  const envPath = path.join(__dirname, "../backend/.env");

  try {
    // Check if .env exists
    try {
      await fs.access(envPath);
      console.log(".env file exists, loading existing configuration");
      dotenv.config({ path: envPath });
      return;
    } catch {
      // File doesn't exist, continue with creation
      console.log(".env file not found, creating new one");
    }

    const jwtSecret = generateJwtSecret();
    const envContent = `PORT=1999
MONGODB_URI=mongodb://localhost:27017/test-app
JWT_SECRET=${jwtSecret}
NODE_ENV=development
CORS_ORIGIN=http://localhost:5173
UPLOAD_PATH=uploads/
MAX_FILE_SIZE=10mb`;

    await fs.writeFile(envPath, envContent);
    console.log(".env file created successfully with new JWT secret");
    dotenv.config({ path: envPath });
  } catch (error) {
    console.error("Error setting up .env file:", error);
    throw error;
  }
};

const setupDatabase = async () => {
  try {
    // Setup environment file first
    await setupEnvironmentFile();

    if (!process.env.MONGODB_URI) {
      throw new Error("MONGODB_URI is not defined in environment variables");
    }

    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI);
    console.log("Connected to MongoDB successfully");

    // Create indexes
    await Promise.all([
      mongoose.connection.db.createIndex(
        "users",
        { email: 1 },
        { unique: true }
      ),
      mongoose.connection.db.createIndex(
        "users",
        { username: 1 },
        { unique: true }
      ),
      mongoose.connection.db.createIndex("questions", {
        subject: 1,
        type: 1,
        difficulty: 1,
      }),
      mongoose.connection.db.createIndex("questions", { active: 1 }),
    ]);

    console.log("Database indexes created successfully");

    // Define User Schema for admin creation
    const userSchema = new mongoose.Schema({
      username: String,
      email: String,
      password: String,
      role: String,
      isActive: Boolean,
    });

    // Create User model
    const User = mongoose.model("User", userSchema);

    // Check if admin user exists
    const adminExists = await User.findOne({ role: "admin" });

    if (!adminExists) {
      // Hash password
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(defaultAdmin.password, salt);

      // Create admin user
      await User.create({
        ...defaultAdmin,
        password: hashedPassword,
      });

      console.log("\n=== Default Admin Credentials ===");
      console.log("Email:", defaultAdmin.email);
      console.log("Password:", defaultAdmin.password);
      console.log(
        "IMPORTANT: Please change these credentials after first login"
      );
      console.log("===============================\n");
    } else {
      console.log("Admin user already exists, skipping creation");
    }

    // Create uploads directory if it doesn't exist
    const uploadsPath = path.join(__dirname, "../backend/uploads");
    try {
      await fs.access(uploadsPath);
    } catch {
      await fs.mkdir(uploadsPath, { recursive: true });
      console.log("Uploads directory created");
    }

    console.log("Database setup completed successfully");
    process.exit(0);
  } catch (error) {
    console.error("Database setup failed:", error);
    console.error("Error details:", error.message);
    process.exit(1);
  } finally {
    await mongoose.disconnect();
  }
};

// Run setup
console.log("Starting application setup...");
setupDatabase();
