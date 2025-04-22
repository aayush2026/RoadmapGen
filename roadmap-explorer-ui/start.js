/**
 * Start script for the Roadmap Explorer application
 * This ensures roadmap files are copied before starting the server
 */
import { execSync } from "child_process";
import path from "path";
import { fileURLToPath } from "url";

// Get dirname in ESM modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

console.log("Starting Roadmap Explorer...");

// 1. First make sure all roadmap files are copied to the public directory
console.log("Copying roadmap files...");
try {
  execSync("node copy-roadmaps.js", { stdio: "inherit" });
  console.log("Roadmap files copied successfully");
} catch (error) {
  console.error("Error copying roadmap files:", error.message);
  process.exit(1);
}

// 2. Now start the server
console.log("Starting server...");
try {
  execSync("node server.js", { stdio: "inherit" });
} catch (error) {
  console.error("Error starting server:", error.message);
  process.exit(1);
}
