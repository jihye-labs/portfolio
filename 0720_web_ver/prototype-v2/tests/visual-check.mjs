import assert from "node:assert/strict";
import { mkdir } from "node:fs/promises";
import { createRequire } from "node:module";
import path from "node:path";
import { pathToFileURL } from "node:url";

const require = createRequire(import.meta.url);
const { chromium } = require("/Users/jihyelee/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright");
const root = path.resolve("prototype-v2");
const url = pathToFileURL(path.join(root, "index.html")).href;
const output = path.join(root, "captures");
await mkdir(output, { recursive: true });

const browser = await chromium.launch({ headless: true });

async function loadPageImages(page) {
  await page.evaluate(async () => {
    const delay = (duration) => new Promise((resolve) => {
      window.setTimeout(resolve, duration);
    });
    const step = Math.max(480, Math.floor(window.innerHeight * 0.72));
    const bottom = document.documentElement.scrollHeight - window.innerHeight;

    for (let position = 0; position <= bottom; position += step) {
      window.scrollTo(0, position);
      await delay(90);
    }

    window.scrollTo(0, bottom);
    await delay(180);
    window.scrollTo(0, 0);
    await delay(180);
  });
}

async function inspectPage(page, name) {
  await page.waitForTimeout(1200);
  await page.evaluate(async () => {
    const inViewport = (image) => {
      const rect = image.getBoundingClientRect();
      return rect.bottom > 0 && rect.top < window.innerHeight;
    };
    await Promise.all(
      Array.from(document.images)
        .filter((image) => image.checkVisibility({
          checkOpacity: true,
          checkVisibilityCSS: true,
        }) && inViewport(image))
        .map((image) => image.decode().catch(() => undefined)),
    );
  });

  const metrics = await page.evaluate(() => {
    const overlaps = [];
    const visible = (element) => (
      element
      && element.offsetParent !== null
      && getComputedStyle(element).visibility !== "hidden"
    );
    const intersects = (first, second) => (
      first.left < second.right
      && first.right > second.left
      && first.top < second.bottom
      && first.bottom > second.top
    );
    const pairs = [
      [document.querySelector(".top-nav"), document.querySelector(".door-panel.is-active .panel-trigger")],
      [document.querySelector(".door-panel.is-active .panel-trigger"), document.querySelector(".door-panel.is-active .project-strip")],
      [document.querySelector(".case-nav"), document.querySelector(".case-hero-copy")],
    ];
    const inViewport = (image) => {
      const rect = image.getBoundingClientRect();
      return rect.bottom > 0 && rect.top < window.innerHeight;
    };

    for (const [first, second] of pairs) {
      if (visible(first) && visible(second) && intersects(
        first.getBoundingClientRect(),
        second.getBoundingClientRect(),
      )) {
        overlaps.push(`${first.className} overlaps ${second.className}`);
      }
    }

    return {
      overflow: document.documentElement.scrollWidth - document.documentElement.clientWidth,
      overlaps,
      visibleImages: Array.from(document.images)
        .filter((image) => image.checkVisibility({
          checkOpacity: true,
          checkVisibilityCSS: true,
        }) && inViewport(image))
        .map((image) => ({
          complete: image.complete,
          width: image.naturalWidth,
          height: image.naturalHeight,
        })),
    };
  });

  assert.ok(metrics.overflow <= 1, `${name} has horizontal overflow`);
  assert.deepEqual(metrics.overlaps, [], `${name} has overlapping primary UI`);
  assert.ok(
    metrics.visibleImages.every((image) => (
      image.complete && image.width > 20 && image.height > 20
    )),
    `${name} has a blank visible image`,
  );
}

try {
  for (const setup of [
    { name: "home-desktop", viewport: { width: 1440, height: 900 }, route: "#/" },
    { name: "home-mobile", viewport: { width: 390, height: 844 }, route: "#/" },
    { name: "works-desktop", viewport: { width: 1440, height: 900 }, route: "#/works" },
    { name: "brand-archive-desktop", viewport: { width: 1440, height: 900 }, route: "#/archive/brand" },
    { name: "detail-desktop", viewport: { width: 1440, height: 900 }, route: "#/work/elora" },
    { name: "detail-mobile", viewport: { width: 390, height: 844 }, route: "#/work/elora" },
  ]) {
    const context = await browser.newContext({ viewport: setup.viewport });
    const page = await context.newPage();
    const errors = [];
    page.on("console", (message) => {
      if (message.type() === "error") errors.push(message.text());
    });
    page.on("pageerror", (error) => errors.push(error.message));

    await page.goto(`${url}${setup.route}`);
    await inspectPage(page, setup.name);

    if (setup.name === "home-desktop") {
      await page.screenshot({
        path: path.join(output, "home-desktop.png"),
        fullPage: true,
      });
      await page.locator('[data-panel="ai"]').hover();
      await page.waitForTimeout(1200);
      await inspectPage(page, "home-ai-active");
      await page.screenshot({
        path: path.join(output, "home-ai-active.png"),
        fullPage: true,
      });
    } else {
      await loadPageImages(page);
      await inspectPage(page, `${setup.name}-after-scroll`);
      await page.screenshot({
        path: path.join(output, `${setup.name}.png`),
        fullPage: true,
      });
    }

    assert.deepEqual(errors, [], `${setup.name} logged an error`);
    await context.close();
  }
} finally {
  await browser.close();
}
