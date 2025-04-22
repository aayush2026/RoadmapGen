/**
 * Debug script for document_to_roadmap_pipeline.py
 * Directly runs the pipeline with full error output to diagnose issues
 */
import { spawnSync } from "child_process";
import path from "path";
import { fileURLToPath } from "url";
import fs from "fs";
import dotenv from "dotenv";

// Get dirname in ESM modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment variables from parent directory's .env file
dotenv.config({ path: path.resolve(path.join(__dirname, "..", ".env")) });

// Check if OPENAI_API_KEY is present
if (!process.env.OPENAI_API_KEY) {
  console.error("ERROR: OPENAI_API_KEY environment variable is not set!");
  console.error("Please check your .env file in the root directory.");
  process.exit(1);
}

// Path to the document and pipeline script
const documentPath =
  process.argv[2] || path.join(__dirname, "..", "documents", "gradient.pdf");
const scriptPath = path.join(__dirname, "..", "wrapper-pipeline.py");

console.log("=== Debug: Python Pipeline Execution ===");
console.log(`Document path: ${documentPath}`);
console.log(`Wrapper script path: ${scriptPath}`);
console.log(
  `OPENAI_API_KEY present: ${process.env.OPENAI_API_KEY ? "Yes" : "No"}`
);

// Verify files exist
if (!fs.existsSync(documentPath)) {
  console.error(`ERROR: Document file does not exist: ${documentPath}`);
  process.exit(1);
}

if (!fs.existsSync(scriptPath)) {
  console.error(`ERROR: Python wrapper script does not exist: ${scriptPath}`);
  process.exit(1);
}

// Use spawnSync for better error output than exec
try {
  console.log("\n=== Starting Python process ===");
  console.log(
    `Command: python "${scriptPath}" "${documentPath}" --batch-size 10`
  );

  // Get the root directory path where document_to_roadmap_pipeline.py is located
  // For the specific project structure, this is the parent of roadmap-explorer-ui
  const rootDir = path.dirname(__dirname);
  console.log(`Running in directory: ${rootDir}`);

  const pythonProcess = spawnSync(
    "python",
    [scriptPath, documentPath, "--batch-size", "10"],
    {
      env: process.env,
      stdio: "inherit", // This shows real-time output
      encoding: "utf-8",
      shell: true, // Use shell to handle Windows paths better
      cwd: rootDir, // Run in the parent directory to ensure all Python scripts are found
    }
  );

  if (pythonProcess.error) {
    console.error(
      `\nERROR: Failed to execute process: ${pythonProcess.error.message}`
    );
    process.exit(1);
  }

  if (pythonProcess.status !== 0) {
    console.error(`\nPython process exited with code: ${pythonProcess.status}`);
    process.exit(pythonProcess.status);
  }

  console.log("\n=== Python process completed successfully ===");
} catch (error) {
  console.error(
    `\nERROR: Exception while running Python process: ${error.message}`
  );
  process.exit(1);
}
