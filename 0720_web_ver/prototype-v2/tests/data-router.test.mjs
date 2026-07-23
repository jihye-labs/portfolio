import assert from "node:assert/strict";
import fs from "node:fs";
import { createRequire } from "node:module";
import { test } from "node:test";
import vm from "node:vm";

const require = createRequire(import.meta.url);
const data = require("../data.js");
const router = require("../router.js");
const state = require("../state.js");

test("Home keeps the approved category and project order", () => {
  assert.deepEqual(data.categories.map(({ id }) => id), ["branding", "ai", "space"]);
  assert.deepEqual(data.categories.find(({ id }) => id === "ai").entries.map(({ slug }) => slug), [
    "elora", "genz-glitch", "alldayfit", "market-marble",
  ]);
  assert.ok(data.categories.every(({ entries }) => entries.length === 4));
  assert.equal(data.aiArchive.length, 5);
  assert.equal(data.btlArchive.length, 3);
});

test("KD Navien keeps one project record with two entry chapters", () => {
  assert.ok(data.projects["kd-navien"]);
  const entries = data.categories.flatMap(({ entries }) => entries)
    .filter(({ slug }) => slug === "kd-navien");
  assert.deepEqual(entries.map(({ chapter }) => chapter), ["brand-system", "exhibition-space"]);
});

test("ELORA uses the campaign key visual and every image set reserves dimensions", () => {
  const eloraEntry = data.categories
    .find(({ id }) => id === "ai")
    .entries.find(({ slug }) => slug === "elora");
  assert.equal(data.projects.elora.image, data.imageSets["elora-keyvisual"]);
  assert.equal(eloraEntry.previewKey, "elora-keyvisual");
  assert.equal(data.imageSets["elora-keyvisual"].width, 1280);
  assert.equal(data.imageSets["elora-keyvisual"].height, 720);

  for (const [key, image] of Object.entries(data.imageSets)) {
    assert.ok(image.width > 0, `${key} has no intrinsic width`);
    assert.ok(image.height > 0, `${key} has no intrinsic height`);
  }
});

test("route helpers round-trip a project chapter", () => {
  const route = { name: "work", slug: "kd-navien", chapter: "brand-system" };
  assert.deepEqual(router.parseHash(router.toHash(route)), route);
  assert.deepEqual(router.parseHash("#/archive/btl"), { name: "btl-archive" });
});

test("Home state normalizes unknown values", () => {
  assert.deepEqual(state.normalizeHomeState({
    activeCategory: "invalid",
    selectedSlug: 14,
    scrollY: -8,
    focusId: null,
  }), {
    activeCategory: "",
    selectedSlug: "",
    scrollY: 0,
    focusId: "",
  });
});

test("classic browser scripts install all public APIs together", () => {
  const context = vm.createContext({ window: {}, URLSearchParams });

  for (const filename of ["assets/optimized/asset-meta.js", "data.js", "router.js", "state.js"]) {
    const source = fs.readFileSync(new URL(`../${filename}`, import.meta.url), "utf8");
    vm.runInContext(source, context, { filename });
  }

  assert.ok(context.window.PORTFOLIO_IMAGE_META);
  assert.ok(context.window.PORTFOLIO_DATA);
  assert.ok(context.window.PortfolioRouter);
  assert.ok(context.window.PortfolioState);
});
