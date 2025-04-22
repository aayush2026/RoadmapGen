/**
 * Backend server for Roadmap Explorer UI
 * Handles PDF uploads and processing
 */
import express from "express";
import multer from "multer";
import path from "path";
import { fileURLToPath } from "url";
import fs from "fs";
import { spawn } from "child_process";
import { createProxyMiddleware } from "http-proxy-middleware";
import dotenv from "dotenv";

// Get dirname in ESM modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment variables from .env file
dotenv.config({ path: path.resolve(path.join(__dirname, "..", ".env")) });

const app = express();
const PORT = process.env.PORT || 3001;

// Status tracking for uploaded files
const fileStatus = new Map();

// Configure storage for uploaded files
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const uploadsDir = path.join(__dirname, "..", "documents");
    // Create directory if it doesn't exist
    if (!fs.existsSync(uploadsDir)) {
      fs.mkdirSync(uploadsDir, { recursive: true });
    }
    cb(null, uploadsDir);
  },
  filename: function (req, file, cb) {
    // Preserve original filename
    cb(null, file.originalname);
  },
});

// Create multer instance for file uploads
const upload = multer({
  storage: storage,
  limits: { fileSize: 20 * 1024 * 1024 }, // 20MB limit
  fileFilter: function (req, file, cb) {
    // Accept only PDF files
    if (file.mimetype !== "application/pdf") {
      return cb(new Error("Only PDF files are allowed"));
    }
    cb(null, true);
  },
});

// API routes
app.use(express.json());

// Handle file uploads
app.post("/api/upload", upload.single("file"), (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: "No file uploaded" });
    }

    const filePath = req.file.path;
    const fileName = req.file.originalname;

    // Set initial status
    fileStatus.set(fileName, {
      status: "processing",
      message: "Document is being processed",
      timestamp: Date.now(),
    });

    console.log(`Processing file: ${filePath}`);

    // Normalize the filepath for the OS
    const normalizedPath = path.normalize(filePath);

    // Get the absolute path to the Python script
    const wrapperScriptPath = path.resolve(
      path.join(__dirname, "..", "wrapper-pipeline.py")
    );
    console.log(`Wrapper script path: ${wrapperScriptPath}`);

    // Get the root directory path where document_to_roadmap_pipeline.py is located
    // For the specific project structure, this is the parent of roadmap-explorer-ui
    const rootDir = path.dirname(__dirname);
    console.log(`Running in directory: ${rootDir}`);

    // Verify the OPENAI API key is set
    if (!process.env.OPENAI_API_KEY) {
      console.warn(
        "WARNING: OPENAI_API_KEY is not set in environment variables!"
      );
      fileStatus.set(fileName, {
        status: "error",
        message: "OPENAI_API_KEY is not set in environment variables",
        timestamp: Date.now(),
      });
      return res
        .status(500)
        .json({ message: "Server configuration error: API key missing" });
    }

    // Use spawn for async process with better output handling
    // Convert the path to absolute just to be safe
    const absoluteDocPath = path.resolve(normalizedPath);
    console.log(`Absolute document path: ${absoluteDocPath}`);

    // Try a different spawn approach: pass the full command as a string
    const command = `python "${wrapperScriptPath}" "${absoluteDocPath}" --batch-size 10 --store-embeddings`;
    console.log(`Running command: ${command}`);

    const pythonProcess = spawn(command, [], {
      env: process.env,
      shell: true, // Use shell to handle Windows paths better
      // Run in the ai-roadmap-gen directory to ensure all Python scripts are found
      cwd: rootDir,
    });

    let stdoutData = "";
    let stderrData = "";

    pythonProcess.stdout.on("data", (data) => {
      const output = data.toString();
      console.log(`Python stdout: ${output}`);
      stdoutData += output;
    });

    pythonProcess.stderr.on("data", (data) => {
      const output = data.toString();
      console.error(`Python stderr: ${output}`);
      stderrData += output;
    });

    pythonProcess.on("close", (code) => {
      console.log(`Python process exited with code ${code}`);

      if (code !== 0) {
        console.error(`Processing failed with code ${code}`);
        console.error(`stderr: ${stderrData}`);
        fileStatus.set(fileName, {
          status: "error",
          message: `Processing failed: ${stderrData || `Exit code ${code}`}`,
          timestamp: Date.now(),
        });
        return;
      }

      console.log(`Document processed successfully`);
      fileStatus.set(fileName, {
        status: "completed",
        message: "Document processed successfully",
        timestamp: Date.now(),
      });

      // Copy the generated roadmap to the public directory
      const docName = path.basename(fileName, ".pdf");
      const roadmapSource = path.join(
        __dirname,
        "..",
        "roadmap",
        `${docName}.json`
      );
      const roadmapDest = path.join(
        __dirname,
        "public",
        "roadmap",
        `${docName}.json`
      );

      fs.copyFile(roadmapSource, roadmapDest, (err) => {
        if (err) {
          console.error(`Error copying roadmap file: ${err.message}`);
        } else {
          console.log(
            `Roadmap file copied to public directory: ${roadmapDest}`
          );

          // Update the manifest file
          const manifestPath = path.join(
            __dirname,
            "public",
            "roadmap",
            "manifest.json"
          );
          fs.readFile(manifestPath, "utf8", (err, data) => {
            if (err) {
              console.error(`Error reading manifest file: ${err.message}`);
              return;
            }

            try {
              const manifest = JSON.parse(data);

              // Check if the roadmap is already in the manifest
              const exists = manifest.roadmaps.some(
                (item) => item.name === `${docName}.json`
              );

              if (!exists) {
                manifest.roadmaps.push({
                  name: `${docName}.json`,
                  path: `/roadmap/${docName}.json`,
                });

                fs.writeFile(
                  manifestPath,
                  JSON.stringify(manifest, null, 2),
                  "utf8",
                  (err) => {
                    if (err) {
                      console.error(
                        `Error updating manifest file: ${err.message}`
                      );
                    } else {
                      console.log("Manifest file updated successfully");
                    }
                  }
                );
              }
            } catch (err) {
              console.error(`Error parsing manifest file: ${err.message}`);
            }
          });
        }
      });
    });

    // Respond immediately, don't wait for processing to complete
    res.status(200).json({
      message: "File uploaded successfully, processing started",
      file: fileName,
    });
  } catch (error) {
    console.error(`Error handling upload: ${error.message}`);
    res.status(500).json({ message: `Server error: ${error.message}` });
  }
});

// Get processing status
app.get("/api/status", (req, res) => {
  const fileName = req.query.filename;
  if (!fileName) {
    return res.status(400).json({ message: "Filename parameter is required" });
  }

  const status = fileStatus.get(fileName);
  if (!status) {
    return res.status(404).json({ message: "File status not found" });
  }

  res.json(status);
});

// API endpoint for retrieving detailed content from vector DB
app.post("/api/detail", async (req, res) => {
  try {
    const { topic, summary, document_name } = req.body;

    console.log("Detail API request:", { topic, summary, document_name });

    if (!topic || !document_name) {
      return res.status(400).json({
        message:
          "Missing required parameters. Please provide topic and document_name.",
      });
    }

    console.log(
      `Generating detailed content for topic "${topic}" from document "${document_name}"`
    );

    // Create query combining topic and summary (if provided)
    const query = summary ? `${topic}. ${summary}` : topic;

    // Get the root directory path
    const rootDir = path.dirname(__dirname);

    // Get the absolute path to the Python script for semantic search
    const scriptPath = path.resolve(path.join(rootDir, "semantic_search.py"));
    console.log(`Semantic search script path: ${scriptPath}`);

    if (!fs.existsSync(scriptPath)) {
      console.error(`Script not found: ${scriptPath}`);
      return res
        .status(500)
        .json({ message: "Semantic search script not found" });
    }

    // Run the semantic search as a child process
    // Use fewer arguments and surround the query with quotes to keep it as a single argument
    const pythonProcess = spawn(
      "python",
      [
        scriptPath,
        "--query",
        `"${query.replace(/"/g, '\\"')}"`, // Quote the query and escape any double quotes
        "--document",
        document_name,
        "--limit",
        "3",
      ],
      {
        env: process.env,
        cwd: rootDir, // Run in the ai-roadmap-gen directory
        shell: true, // Use shell to handle special characters better
      }
    );

    let stdoutData = "";
    let stderrData = "";

    pythonProcess.stdout.on("data", (data) => {
      const output = data.toString();
      console.log(`Semantic search stdout: ${output}`);
      stdoutData += output;
    });

    pythonProcess.stderr.on("data", (data) => {
      const output = data.toString();
      console.error(`Semantic search stderr: ${output}`);
      stderrData += output;
    });

    pythonProcess.on("close", async (code) => {
      console.log(`Semantic search process exited with code ${code}`);

      if (code !== 0) {
        console.error(`Semantic search error: ${stderrData}`);

        // Fallback to direct API approach if the Python script fails
        console.log("Attempting fallback direct approach");

        try {
          // Use a more direct approach without Python script
          // Import the embedding_store module
          const embedding_store_path = path.resolve(
            path.join(rootDir, "embedding_store.py")
          );

          // Try an alternative: Use Node.js to call OpenAI API directly for the detailed content
          console.log("Using direct OpenAI approach instead");

          // Check for OpenAI API key
          const openaiKey = process.env.OPENAI_API_KEY;
          if (!openaiKey) {
            console.error("OpenAI API key is not set");
            return res.status(500).json({
              message: "OpenAI API key is not configured",
            });
          }

          // Simplified prompt containing topic and any summary
          const prompt = summary
            ? `Generate a detailed educational explanation about "${topic}". Context: ${summary}`
            : `Generate a detailed educational explanation about "${topic}"`;

          console.log("Sending direct request to OpenAI with prompt:", prompt);

          // Send to OpenAI directly
          const openaiResponse = await fetch(
            "https://api.openai.com/v1/chat/completions",
            {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${openaiKey}`,
              },
              body: JSON.stringify({
                model: "gpt-3.5-turbo",
                messages: [
                  {
                    role: "system",
                    content: `You are a detailed educational content creator. Generate a comprehensive explanation about the requested topic.
                
                Ensure you:
                1. Create comprehensive, detailed content about the topic
                2. Format your response with clear headings and structure
                3. Correctly represent any mathematical expressions, formulas, or equations
                4. Make the content educational and informative
                
                For mathematical expressions or equations:
                - Use LaTeX format when appropriate (e.g., $E = mc^2$)
                - Ensure all variables are clearly explained
                - Present complex formulas in a readable way`,
                  },
                  {
                    role: "user",
                    content: prompt,
                  },
                ],
                temperature: 0.5,
                max_tokens: 1000,
              }),
            }
          );

          if (!openaiResponse.ok) {
            const errorText = await openaiResponse.text();
            console.error("OpenAI API error:", errorText);
            return res.status(500).json({
              message: "Failed to generate detailed content with OpenAI",
              error: errorText,
            });
          }

          const openaiData = await openaiResponse.json();

          if (!openaiData.choices || !openaiData.choices.length) {
            console.error("No content in OpenAI response:", openaiData);
            return res.status(500).json({
              message: "Failed to generate detailed content",
              error: "No content in response",
            });
          }

          // Extract the generated content
          const detailedContent = openaiData.choices[0].message.content;

          // Return the detailed content
          console.log("Returning detailed content to client (fallback method)");
          return res.json({
            topic,
            detailed_content: detailedContent,
            fallback_method: true,
          });
        } catch (fallbackError) {
          console.error("Fallback approach failed:", fallbackError);
          return res.status(500).json({
            message: "Error retrieving detailed content (both methods failed)",
            error: stderrData,
            fallback_error: fallbackError.message,
          });
        }
      }

      try {
        // Check if stdout is empty
        if (!stdoutData.trim()) {
          console.error("Semantic search returned empty result");
          return res.status(404).json({
            message: "No search results returned from semantic search",
          });
        }

        console.log("Raw output from semantic search:", stdoutData);

        // Try to parse the JSON, handling potential issues with the output
        let searchResults;
        try {
          // Find JSON in the output (in case there's debug text before/after)
          const jsonMatch = stdoutData.match(/(\[.*\])/s);
          if (jsonMatch && jsonMatch[1]) {
            searchResults = JSON.parse(jsonMatch[1]);
          } else {
            // If no JSON array found, try parsing the whole output
            searchResults = JSON.parse(stdoutData);
          }
        } catch (jsonError) {
          console.error(`Initial JSON parse error: ${jsonError.message}`);
          // Try cleaning the output to handle common issues
          const cleaned = stdoutData
            .trim()
            .replace(/^[^[{]*/, "")
            .replace(/[^}\]]*$/, "");
          try {
            searchResults = JSON.parse(cleaned);
          } catch (secondError) {
            console.error(
              `Second JSON parse attempt failed: ${secondError.message}`
            );
            return res.status(500).json({
              message: "Failed to parse search results",
              error: "Invalid JSON returned from search",
              rawOutput: stdoutData,
            });
          }
        }

        console.log("Parsed search results:", searchResults);

        if (
          !searchResults ||
          !Array.isArray(searchResults) ||
          searchResults.length === 0
        ) {
          console.error("No relevant content found");
          return res.status(404).json({
            message: "No relevant content found for this topic",
          });
        }

        // Get the most relevant result
        const topResult = searchResults[0];
        console.log("Top search result:", topResult);

        // Use OpenAI to generate detailed content from the chunk
        const openaiKey = process.env.OPENAI_API_KEY;

        if (!openaiKey) {
          console.error("OpenAI API key is not set");
          return res.status(500).json({
            message: "OpenAI API key is not configured",
          });
        }

        console.log(
          "Sending request to OpenAI for detailed content generation"
        );

        // Simplified prompt for detailed content generation
        const prompt = `Create a detailed explanation about "${topic}" based on this content:\n\n${topResult.content}`;

        try {
          // Making a direct fetch to OpenAI API
          const openaiResponse = await fetch(
            "https://api.openai.com/v1/chat/completions",
            {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${openaiKey}`,
              },
              body: JSON.stringify({
                model: "gpt-3.5-turbo",
                messages: [
                  {
                    role: "system",
                    content: `You are a detailed educational content creator. Generate a comprehensive explanation based on the provided text.
                  
                  Ensure you:
                  1. Include all key concepts and details from the provided text
                  2. Format your response with clear headings and structure
                  3. Correctly represent any mathematical expressions, formulas, or equations
                  4. Make the content educational and informative`,
                  },
                  {
                    role: "user",
                    content: prompt,
                  },
                ],
                temperature: 0.5,
                max_tokens: 1000,
              }),
            }
          );

          if (!openaiResponse.ok) {
            const errorText = await openaiResponse.text();
            console.error("OpenAI API error:", errorText);
            return res.status(500).json({
              message: "Failed to generate detailed content with OpenAI",
              error: errorText,
            });
          }

          const openaiData = await openaiResponse.json();
          console.log("OpenAI response received");

          if (!openaiData.choices || !openaiData.choices.length) {
            console.error("No content in OpenAI response:", openaiData);
            return res.status(500).json({
              message: "Failed to generate detailed content",
              error: "No content in response",
            });
          }

          // Extract the generated content
          const detailedContent = openaiData.choices[0].message.content;

          // Return the detailed content along with metadata
          console.log("Returning detailed content to client");
          return res.json({
            topic,
            detailed_content: detailedContent,
            score: topResult.score,
            source_chunk: topResult.content,
          });
        } catch (openaiError) {
          console.error("OpenAI API error:", openaiError);
          return res.status(500).json({
            message: "Error calling OpenAI API",
            error: openaiError.message,
          });
        }
      } catch (jsonError) {
        console.error(`Error processing search results: ${jsonError.message}`);
        console.error(`Raw stdout: ${stdoutData}`);
        return res.status(500).json({
          message: "Error processing search results",
          error: jsonError.message,
          stdout: stdoutData,
        });
      }
    });
  } catch (error) {
    console.error(`Error in /api/detail endpoint: ${error.message}`);
    return res.status(500).json({
      message: "Server error processing request",
      error: error.message,
    });
  }
});

// Clean up old status entries every hour
setInterval(() => {
  const now = Date.now();
  fileStatus.forEach((value, key) => {
    // Remove entries older than 1 hour
    if (now - value.timestamp > 3600000) {
      fileStatus.delete(key);
    }
  });
}, 3600000);

// In development mode, proxy requests to the Vite dev server
if (process.env.NODE_ENV === "development") {
  app.use(
    "/",
    createProxyMiddleware({
      target: "http://localhost:5173",
      changeOrigin: true,
      ws: true,
    })
  );
} else {
  // In production, serve static files from the dist directory
  app.use(express.static(path.join(__dirname, "dist")));

  // Handle client-side routing
  app.get("*", (req, res) => {
    res.sendFile(path.join(__dirname, "dist", "index.html"));
  });
}

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
