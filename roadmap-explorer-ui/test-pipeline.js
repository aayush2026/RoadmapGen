/**
 * Test script for document_to_roadmap_pipeline.py
 * This helps check if the Python environment is set up correctly
 */
import { exec } from "child_process";
import path from "path";
import { fileURLToPath } from "url";
import fs from "fs";
import dotenv from "dotenv";

// Load environment variables from .env file
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.resolve(path.join(__dirname, "..", ".env")) });

console.log("=== Testing Document to Roadmap Pipeline ===");

// Check if OpenAI API key is available
if (!process.env.OPENAI_API_KEY) {
  console.error("ERROR: OPENAI_API_KEY is not set in environment variables!");
  console.error(
    "Please add it to your .env file in the root directory (not in roadmap-explorer-ui)"
  );
  console.error(
    "The .env file should contain: OPENAI_API_KEY=your_api_key_here"
  );
  process.exit(1);
} else {
  console.log("✓ OpenAI API key is available");
}

// Check if Python is installed
console.log("\nChecking Python installation...");
const pythonExecutable = process.platform === "win32" ? "python" : "python3";

exec(`${pythonExecutable} --version`, (error, stdout, stderr) => {
  if (error) {
    console.error(
      `ERROR: Python is not installed or not in PATH: ${error.message}`
    );
    process.exit(1);
  }
  console.log(`✓ ${stdout.trim()}`);

  // Check for required Python packages
  console.log("\nChecking Python packages...");

  // Check for the OpenAI package
  exec(
    `${pythonExecutable} -c "import openai; print('OpenAI version:', openai.__version__)"`,
    (error, stdout, stderr) => {
      if (error) {
        console.error("ERROR: OpenAI package is not installed in Python");
        console.error("Run: pip install openai");
        process.exit(1);
      }
      console.log(`✓ ${stdout.trim()}`);

      // Check for the docling package
      exec(
        `${pythonExecutable} -c "import docling; print('Docling package is installed')"`,
        (error, stdout, stderr) => {
          if (error) {
            console.error("ERROR: docling package is not installed in Python");
            console.error("Run: pip install docling");
            process.exit(1);
          }
          console.log(`✓ ${stdout.trim()}`);

          // Check if python-dotenv is installed
          exec(
            `${pythonExecutable} -c "import dotenv; print('python-dotenv is installed')"`,
            (error, stdout, stderr) => {
              if (error) {
                console.error("ERROR: python-dotenv is not installed");
                console.error("Run: pip install python-dotenv");
                process.exit(1);
              }
              console.log(`✓ ${stdout.trim()}`);

              // Check if sample.pdf exists in the test directory
              const testDir = path.join(__dirname, "..", "tests");
              if (!fs.existsSync(testDir)) {
                fs.mkdirSync(testDir, { recursive: true });
              }

              const samplePdf = path.join(testDir, "sample.pdf");
              if (!fs.existsSync(samplePdf)) {
                console.log("\nCreating a sample PDF file for testing...");
                // Create a simple text file instead if PDF generation is not available
                fs.writeFileSync(
                  samplePdf,
                  "This is a sample PDF file for testing purposes."
                );
                console.log(`✓ Created ${samplePdf}`);
              }

              // Try running the pipeline with minimal processing
              console.log(
                "\nTesting document_to_roadmap_pipeline.py script with a sample file..."
              );
              const scriptPath = path.resolve(
                path.join(__dirname, "..", "document_to_roadmap_pipeline.py")
              );

              exec(
                `${pythonExecutable} "${scriptPath}" "${samplePdf}" --batch-size 1`,
                {
                  env: process.env,
                  timeout: 60000, // 1 minute timeout
                },
                (error, stdout, stderr) => {
                  if (error) {
                    console.error("ERROR: Failed to run the pipeline script");
                    console.error(`Error message: ${error.message}`);
                    console.error(`stderr: ${stderr}`);
                    console.error(`stdout: ${stdout}`);
                    console.error("\nPossible solutions:");
                    console.error("1. Make sure your OpenAI API key is valid");
                    console.error(
                      "2. Check that all Python dependencies are installed"
                    );
                    console.error("3. Look for specific error messages above");
                    process.exit(1);
                  }

                  console.log(`✓ Pipeline script executed successfully`);
                  console.log("\n=== Test completed successfully! ===");
                  console.log(
                    "You should now be able to run the server with 'npm run dev' or 'npm start'"
                  );
                }
              );
            }
          );
        }
      );
    }
  );
});
