import { spawn } from "child_process";
import path from "path";
import fs from "fs/promises";

const backupDatabase = async (config = {}) => {
  const {
    dbName = "test-app",
    backupDir = "./mongodb_backup",
    host = "localhost",
    port = "27017",
  } = config;

  try {
    // Create backup directory if it doesn't exist
    const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
    const backupPath = path.join(backupDir, `backup-${timestamp}`);
    await fs.mkdir(backupPath, { recursive: true });

    console.log("Starting database backup...");
    console.log(`Database: ${dbName}`);
    console.log(`Backup location: ${backupPath}`);

    // Construct mongodump command
    const mongodump = spawn("mongodump", [
      `--host=${host}`,
      `--port=${port}`,
      `--db=${dbName}`,
      `--out=${backupPath}`,
      "--gzip",
    ]);

    // Handle process events
    mongodump.stdout.on("data", (data) => {
      console.log(`stdout: ${data}`);
    });

    mongodump.stderr.on("data", (data) => {
      console.error(`stderr: ${data}`);
    });

    return new Promise((resolve, reject) => {
      mongodump.on("close", (code) => {
        if (code === 0) {
          console.log(`Backup completed successfully`);
          console.log(`Backup stored in: ${backupPath}`);
          resolve(backupPath);
        } else {
          reject(new Error(`Backup failed with code ${code}`));
        }
      });

      mongodump.on("error", (error) => {
        reject(new Error(`Failed to start backup: ${error.message}`));
      });
    });
  } catch (error) {
    console.error("Backup failed:", error.message);
    throw error;
  }
};

// Execute backup with default settings
backupDatabase().catch((error) => {
  console.error("Backup script failed:", error);
  process.exit(1);
});
