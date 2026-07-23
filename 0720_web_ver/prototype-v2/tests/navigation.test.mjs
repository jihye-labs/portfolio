import assert from "node:assert/strict";
import { createRequire } from "node:module";
import { test } from "node:test";
import path from "node:path";
import { pathToFileURL } from "node:url";

const require = createRequire(import.meta.url);
const { chromium } = require("playwright");
const url = pathToFileURL(path.resolve("prototype-v2/index.html")).href;

test("desktop quick scan expands one door and keeps the selected project preview", async () => {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
  await page.goto(url);
  await page.locator('[data-panel="ai"]').hover();
  await page.waitForTimeout(1200);
  assert.equal(await page.locator('[data-panel="ai"] [data-panel-trigger]').getAttribute("aria-expanded"), "true");
  assert.equal(await page.locator('[data-panel="ai"] [data-project-row]').count(), 4);
  await page.locator('[data-project-row][data-slug="alldayfit"]').hover();
  assert.match(await page.locator('[data-panel="ai"] [data-project-preview]').getAttribute("src"), /alldayfit-1280\.webp$/);
  await page.mouse.move(720, 120);
  await page.waitForTimeout(350);
  assert.equal(await page.locator('[data-panel="ai"] [data-project-row].is-selected').getAttribute("data-slug"), "alldayfit");
  await browser.close();
});
