import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const sourceDir = path.resolve(__dirname, "../server/data");
const destDir = path.resolve(__dirname, "../public/api");

if (!fs.existsSync(sourceDir)) {
  console.warn(
    `[Sync] Warning: Source directory ${sourceDir} not found. Skipping sync.`,
  );
  process.exit(0);
}

if (!fs.existsSync(destDir)) {
  fs.mkdirSync(destDir, { recursive: true });
}

const files = fs.readdirSync(sourceDir);
for (const file of files) {
  if (file.endsWith(".json")) {
    fs.copyFileSync(path.join(sourceDir, file), path.join(destDir, file));
    console.log(`[Sync] Copied ${file} from server/data/ to public/api/`);
  }
}
