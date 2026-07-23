import { mkdir, writeFile } from "node:fs/promises";
import { createRequire } from "node:module";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { sources, variants } from "./asset-manifest.mjs";

const require = createRequire(import.meta.url);
const sharp = require("sharp");
const scriptsDir = path.dirname(fileURLToPath(import.meta.url));
const prototypeDir = path.resolve(scriptsDir, "..");
const outputDir = path.join(prototypeDir, "assets", "optimized");

await mkdir(outputDir, { recursive: true });

for (const [key, source] of Object.entries(sources)) {
  for (const { width, quality } of variants) {
    await sharp(source)
      .rotate()
      .resize({ width, withoutEnlargement: true })
      .webp({ quality, effort: 5 })
      .toFile(path.join(outputDir, `${key}-${width}.webp`));
  }
}

const largestVariant = Math.max(...variants.map(({ width }) => width));
const assetMetadata = {};

for (const key of Object.keys(sources)) {
  const metadata = await sharp(path.join(outputDir, `${key}-${largestVariant}.webp`)).metadata();
  assetMetadata[key] = { width: metadata.width, height: metadata.height };
}

const metadataSource = `(function () {
  const metadata = ${JSON.stringify(assetMetadata, null, 2)};

  if (typeof window !== "undefined") window.PORTFOLIO_IMAGE_META = metadata;
  if (typeof module !== "undefined") module.exports = metadata;
})();
`;

await writeFile(path.join(outputDir, "asset-meta.js"), metadataSource);
