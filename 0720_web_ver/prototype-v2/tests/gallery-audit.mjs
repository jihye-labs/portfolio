import assert from "node:assert/strict";
import { createRequire } from "node:module";
import path from "node:path";
import { pathToFileURL } from "node:url";

const require = createRequire(import.meta.url);
const { chromium } = require("/Users/jihyelee/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright");
const root = path.resolve("prototype-v2");
const url = `${pathToFileURL(path.join(root, "index.html")).href}#/work/gallery-flowers`;
const required = [
  ".case-story--gallery",
  ".gallery-objectives__grid",
  ".gallery-editorial--identity",
  ".gallery-editorial--fnb",
  ".gallery-editorial--experience",
  ".gallery-editorial--digital",
  ".gallery-flow",
  ".gallery-pdf-evidence",
  ".case-journey",
  ".case-contribution",
];

const browser = await chromium.launch({ headless: true });
try {
  for (const viewport of [
    { name: "desktop", width: 1440, height: 900 },
    { name: "mobile", width: 390, height: 844 },
  ]) {
    const context = await browser.newContext({ viewport });
    const page = await context.newPage();
    const errors = [];
    page.on("pageerror", (error) => errors.push(error.message));
    page.on("console", (message) => {
      if (message.type() === "error") errors.push(message.text());
    });
    await page.goto(url);
    await page.waitForSelector(".case-view--gallery");
    await page.waitForTimeout(500);
    await page.evaluate(async () => {
      const wait = (duration) => new Promise((resolve) => setTimeout(resolve, duration));
      const bottom = document.documentElement.scrollHeight - window.innerHeight;
      for (let position = 0; position <= bottom; position += Math.max(480, Math.floor(window.innerHeight * 0.72))) {
        window.scrollTo(0, position);
        await wait(90);
      }
      window.scrollTo(0, 0);
      await wait(250);
    });

    const metrics = await page.evaluate((selectors) => {
      const images = Array.from(document.querySelectorAll(".case-view--gallery img")).filter((image) => (
        image.offsetParent !== null && getComputedStyle(image).visibility !== "hidden"
      ));
      const layoutImages = Array.from(document.querySelectorAll(
        ".case-view--gallery .gallery-editorial__visual img, .case-view--gallery .gallery-pdf-page img, .case-view--gallery .case-process-media img",
      ));
      const rects = layoutImages.map((image) => image.getBoundingClientRect());
      return {
        overflow: document.documentElement.scrollWidth - document.documentElement.clientWidth,
        missing: selectors.filter((selector) => !document.querySelector(selector)),
        sectionLabels: Array.from(document.querySelectorAll(
          ".case-story--gallery .gallery-editorial__rail p, .case-story--gallery .case-section-heading p, .case-story--gallery .gallery-objectives header p, .case-story--gallery .gallery-editorial__label, .case-story--gallery .gallery-extension header p, .case-story--gallery .case-process-copy > p, .case-story--gallery .case-journey > header p, .case-story--gallery .case-contribution > p",
        )).map((node) => node.textContent.trim()),
        objectivesBackground: getComputedStyle(document.querySelector(".gallery-objectives")).backgroundColor,
        brokenImages: images.filter((image) => (
          !image.complete || image.naturalWidth < 20 || image.naturalHeight < 20
        )).length,
        imagesOutside: rects.filter((rect) => (
          rect.right > document.documentElement.clientWidth + 1 || rect.left < -1
        )).length,
        imageCount: images.length,
        objectives: document.querySelectorAll(".gallery-objectives__grid article").length,
        editorialBlocks: document.querySelectorAll(".gallery-editorial").length,
        pdfPages: document.querySelectorAll(".gallery-pdf-page").length,
        legacyProofs: document.querySelectorAll(".case-view--gallery .case-proof").length,
        pdfColumns: getComputedStyle(document.querySelector(".gallery-pdf-grid")).gridTemplateColumns.split(" ").length,
        journey: document.querySelectorAll(".case-journey__grid article").length,
      };
    }, required);

    assert.deepEqual(errors, [], `${viewport.name} logged browser errors`);
    assert.equal(metrics.overflow, 0, `${viewport.name} has horizontal overflow`);
    assert.deepEqual(metrics.missing, [], `${viewport.name} is missing required content sections`);
    assert.equal(metrics.brokenImages, 0, `${viewport.name} has broken images`);
    assert.equal(metrics.imagesOutside, 0, `${viewport.name} has images outside the viewport`);
    assert.equal(metrics.objectives, 4);
    assert.equal(metrics.editorialBlocks, 5);
    assert.deepEqual(metrics.sectionLabels.slice(0, 11), [
      "01 / BRAND STRATEGY",
      "02 / PROJECT RECORD",
      "03 / BACKGROUND & OBJECTIVES",
      "04 / BRAND IDENTITY",
      "05 / F&B CURATION & PLANNING",
      "06 / EXPERIENCE DESIGN",
      "07 / DIGITAL CHANNEL",
      "08 / OFFLINE EXPERIENCE EXTENSION",
      "09 / PROCESS PROOF",
      "10 / THE RETURN LOOP",
      "11 / THE VALUE",
    ]);
    assert.notEqual(metrics.objectivesBackground, "rgb(252, 235, 232)");
    assert.equal(metrics.pdfPages, 9);
    assert.equal(metrics.legacyProofs, 0);
    assert.equal(metrics.pdfColumns, viewport.name === "desktop" ? 3 : 1);
    assert.equal(metrics.journey, 4);
    console.log(`${viewport.name}:`, JSON.stringify(metrics));
    await context.close();
  }
} finally {
  await browser.close();
}
