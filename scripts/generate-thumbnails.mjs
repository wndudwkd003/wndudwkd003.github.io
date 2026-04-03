import fs from "node:fs/promises";
import path from "node:path";
import sharp from "sharp";

const ROOT_DIR = process.cwd();
const AWARDS_DIR = path.join(ROOT_DIR, "public", "awards");
const THUMBNAIL_DIRNAME = "thumbnail";
const IMAGE_EXTENSIONS = new Set([".jpg", ".jpeg", ".png", ".webp", ".gif"]);
const THUMBNAIL_WIDTH = 480;

async function walk(dirPath) {
  const entries = await fs.readdir(dirPath, { withFileTypes: true });
  const files = [];

  for (const entry of entries) {
    const fullPath = path.join(dirPath, entry.name);

    if (entry.isDirectory()) {
      if (entry.name === THUMBNAIL_DIRNAME) continue;
      files.push(...(await walk(fullPath)));
      continue;
    }

    files.push(fullPath);
  }

  return files;
}

function buildPipeline(sourcePath, extension) {
  const pipeline = sharp(sourcePath, { animated: extension === ".gif" })
    .rotate()
    .resize({
      width: THUMBNAIL_WIDTH,
      withoutEnlargement: true,
    });

  if (extension === ".jpg" || extension === ".jpeg") {
    return pipeline.jpeg({ quality: 70, mozjpeg: true });
  }

  if (extension === ".png") {
    return pipeline.png({ quality: 70, compressionLevel: 9 });
  }

  if (extension === ".webp") {
    return pipeline.webp({ quality: 70 });
  }

  if (extension === ".gif") {
    return pipeline.gif({ colours: 64 });
  }

  return pipeline;
}

async function ensureThumbnail(sourcePath) {
  const extension = path.extname(sourcePath).toLowerCase();
  if (!IMAGE_EXTENSIONS.has(extension)) return;

  const sourceDir = path.dirname(sourcePath);
  const thumbnailDir = path.join(sourceDir, THUMBNAIL_DIRNAME);
  const thumbnailPath = path.join(thumbnailDir, path.basename(sourcePath));

  try {
    await fs.access(thumbnailPath);
    return;
  } catch {
    await fs.mkdir(thumbnailDir, { recursive: true });
  }

  await buildPipeline(sourcePath, extension).toFile(thumbnailPath);
  console.log(`Created thumbnail: ${path.relative(ROOT_DIR, thumbnailPath)}`);
}

async function main() {
  try {
    await fs.access(AWARDS_DIR);
  } catch {
    console.log("No awards directory found. Skipping thumbnail generation.");
    return;
  }

  const files = await walk(AWARDS_DIR);
  await Promise.all(files.map(ensureThumbnail));
}

main().catch((error) => {
  console.error("Thumbnail generation failed.");
  console.error(error);
  process.exitCode = 1;
});
