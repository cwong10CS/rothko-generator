import fs from "fs";
import path from "path";
import archiver from "archiver";
import { execSync } from "child_process";

const outputDir = path.resolve("./");
const zipFileName = "rothko-generator-deploy.zip";

// Build the Next.js application first
console.log("Building Next.js application...");
try {
  execSync("npm run build", { stdio: "inherit" });
  console.log("Build completed successfully.");
} catch (error) {
  console.error("Build failed:", error.message);
  process.exit(1);
}

const output = fs.createWriteStream(path.join(outputDir, zipFileName));
const archive = archiver("zip", { zlib: { level: 9 } });

output.on("close", () => {
  console.log(
    `${zipFileName} has been created. Total size: ${archive.pointer()} bytes`,
  );
  console.log("Ready for AWS deployment!");
});

archive.on("error", (err) => {
  throw err;
});

archive.pipe(output);

// Add files and folders to the archive using glob patterns
archive.glob("**/*", {
  cwd: outputDir,
  dot: true, // Include files that start with a dot
  ignore: [
    "node_modules/**", // Exclude node_modules
    "rothko-generator-deploy.zip", // Exclude the zip file itself
    ".git/**", // Exclude git files
    "*.log", // Exclude log files
  ],
});

// Finalize the archive
archive.finalize();
