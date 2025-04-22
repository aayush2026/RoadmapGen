/**
 * Script to copy roadmap JSON files to the public directory
 */

import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

// Get dirname in ESM modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Source directory (corrected path to point to existing 'roadmap' directory)
const sourceDir = path.join(__dirname, "../roadmap");
// Destination directory
const destDir = path.join(__dirname, "public/roadmap");

// Create destination directory if it doesn't exist
if (!fs.existsSync(destDir)) {
  fs.mkdirSync(destDir, { recursive: true });
  console.log(`Created directory: ${destDir}`);
}

// Copy all roadmap files and build manifest
try {
  const files = fs.readdirSync(sourceDir);
  const jsonFiles = [];

  files.forEach((file) => {
    if (file.endsWith(".json")) {
      const sourcePath = path.join(sourceDir, file);
      const destPath = path.join(destDir, file);

      fs.copyFileSync(sourcePath, destPath);
      console.log(`Copied: ${file}`);

      // Add to manifest
      jsonFiles.push({
        name: file,
        path: `/roadmap/${file}`,
      });
    }
  });

  // Create manifest file
  const manifest = {
    roadmaps: jsonFiles,
  };

  fs.writeFileSync(
    path.join(destDir, "manifest.json"),
    JSON.stringify(manifest, null, 2)
  );
  console.log("Generated manifest.json file");

  console.log(
    "All roadmap files successfully copied to public/roadmap directory"
  );
} catch (error) {
  console.error("Error copying roadmap files:", error.message);
}
