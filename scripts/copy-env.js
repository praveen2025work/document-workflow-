const fs = require('fs');
const path = require('path');

// This script copies a specified environment file to .env in the project root.

// Get the source file name from the command-line arguments.
const sourceFile = process.argv[2];
if (!sourceFile) {
  console.error('Error: Please provide a source environment file as an argument.');
  console.error('Usage: node scripts/copy-env.js .env.example');
  process.exit(1);
}

// Define the project root and the full paths for source and destination files.
const projectRoot = path.resolve(__dirname, '..');
const sourcePath = path.join(projectRoot, sourceFile);
const destPath = path.join(projectRoot, '.env');

// Check if the source file exists before attempting to copy.
if (!fs.existsSync(sourcePath)) {
  console.error(`Error: Source file not found at ${sourcePath}`);
  process.exit(1);
}

try {
  // Copy the file.
  fs.copyFileSync(sourcePath, destPath);
  console.log(`Successfully copied ${sourceFile} to .env`);
} catch (error) {
  console.error(`Error copying file: ${error.message}`);
  process.exit(1);
}