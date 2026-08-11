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
  assert.deepEqual(data.categories.find(({ id }) => id === "branding").entries.map(({ slug }) => slug), [
    "gallery-flowers", "benzhi-life", "alldayfit", "brand-archive",
  ]);
  assert.deepEqual(data.categories.find(({ id }) => id === "space").entries.map(({ slug }) => slug), [
    "samsung-display-798", "parkment-gwangju", "kd-navien-exhibition", "lenovo-smart-home",
  ]);
  assert.deepEqual(data.categories.find(({ id }) => id === "ai").entries.map(({ slug }) => slug), [
    "nike-study", "elora", "genz-glitch", "ai-archive",
  ]);
  assert.equal(data.categories.find(({ id }) => id === "ai").entries.length, 4);
  assert.deepEqual(data.categories.find(({ id }) => id === "branding").entries.map(({ role }) => role), [
    "Identity / space / content / operation",
    "Lifestyle retail identity",
    "NEW business review / lookbook",
    "",
  ]);
  assert.deepEqual(
    data.categories.find(({ id }) => id === "space").entries.map(({ title, role, kind, externalUrl }) => ({
      title,
      role,
      kind,
      externalUrl,
    })),
    [
      { title: "Samsung Display 798 (Beijing)", role: "B2B experience center", kind: "project", externalUrl: "" },
      {
        title: "Parkment GwangJU",
        role: "Study Case / Proposal",
        kind: "external",
        externalUrl: "https://gwangju-livid.vercel.app/",
      },
      { title: "KD Navien China / Exhibition Experience", role: "AWE / ISH exhibition experience", kind: "project", externalUrl: "" },
      { title: "Lenovo Smart Home Experience", role: "Smart-home experience", kind: "project", externalUrl: "" },
    ],
  );
  assert.equal(data.categories.find(({ id }) => id === "space").entries.some(({ slug }) => slug === "btl-archive"), false);
  assert.equal(data.aiArchive.length, 14);
  assert.equal(data.btlArchive.length, 3);
});

test("Home preview assets use approved main-page thumbnails", () => {
  const brandingEntries = data.categories.find(({ id }) => id === "branding").entries;
  const aiEntries = data.categories.find(({ id }) => id === "ai").entries;
  const spaceEntries = data.categories.find(({ id }) => id === "space").entries;

  assert.equal(brandingEntries.find(({ slug }) => slug === "alldayfit").previewKey, "alldayfit-main");
  assert.equal(aiEntries.find(({ slug }) => slug === "genz-glitch").previewKey, "genz-glitch-main");
  assert.equal(spaceEntries.find(({ slug }) => slug === "parkment-gwangju").previewKey, "parkment-gwangju");

  assert.equal(data.imageSets["alldayfit-main"].src, "./assets/alldayfit-main-preview.png?v=20260811b");
  assert.equal(data.imageSets["alldayfit-main"].width, 2916);
  assert.equal(data.imageSets["alldayfit-main"].height, 2152);
  assert.equal(data.imageSets["genz-glitch-main"].src, "./assets/genz-glitch-main-preview.png?v=20260811b");
  assert.equal(data.imageSets["genz-glitch-main"].width, 2048);
  assert.equal(data.imageSets["genz-glitch-main"].height, 1171);
  assert.equal(data.imageSets["parkment-gwangju"].src, "./assets/parkment-gwangju-main.jpg?v=20260811b");
  assert.equal(data.imageSets["parkment-gwangju"].width, 2752);
  assert.equal(data.imageSets["parkment-gwangju"].height, 1536);

  for (const key of ["alldayfit-main", "genz-glitch-main", "parkment-gwangju"]) {
    const file = new URL(`../${data.imageSets[key].src.replace("./", "").split("?")[0]}`, import.meta.url);
    assert.ok(fs.existsSync(file), `${key} asset should exist`);
  }
});

test("AllDayFit is framed as the third Branding case study", () => {
  const project = data.projects.alldayfit;
  assert.equal(project.category, "branding");
  assert.equal(project.detailMode, "alldayfit");
  assert.equal(project.role, "New Business Case Study");
  assert.equal(project.scope, "Research / OEM feasibility / Audience / Lookbook");
  assert.match(project.thesis, /텐마일웨어/);
  assert.doesNotMatch(JSON.stringify(project), /워크레저/);
});

test("AI main projects are external live links while AI Archive stays internal", () => {
  const aiEntries = data.categories.find(({ id }) => id === "ai").entries;
  assert.deepEqual(
    aiEntries.slice(0, 3).map(({ slug, kind, externalUrl }) => ({ slug, kind, externalUrl })),
    [
      {
        slug: "nike-study",
        kind: "external",
        externalUrl: "https://nike.leejihye210.workers.dev/?motion=1",
      },
      {
        slug: "elora",
        kind: "external",
        externalUrl: "https://elora-liart-seven.vercel.app/",
      },
      {
        slug: "genz-glitch",
        kind: "external",
        externalUrl: "https://gen-z-glitch.vercel.app/",
      },
    ],
  );
  assert.equal(aiEntries[3].kind, "archive");
  assert.equal(aiEntries[3].previewKey, "ai-archive-main");
  assert.equal(aiEntries[3].routeName, "ai-archive");
  assert.deepEqual(data.aiArchive.map(({ title }) => title), [
    "NIKE",
    "Summer Story",
    "ELORA",
    "GenZ-Glitch",
    "Dark in Red",
    "DDP Fashion Show",
    "Charlotte Étoile",
    "Gallery Flowers",
    "Market Marble",
    "DATAWAVE",
    "KOEDC",
    "GWANGJU",
    "Flaseek!",
    "AI Labs",
  ]);
  assert.deepEqual(
    data.aiArchive.slice(0, 4).map(({ title, url, type, video }) => ({ title, url, type, video: Boolean(video) })),
    [
      { title: "NIKE", url: "https://nike.leejihye210.workers.dev/?motion=1", type: "WEB", video: false },
      { title: "Summer Story", url: "", type: "VIDEO", video: true },
      { title: "ELORA", url: "https://elora-liart-seven.vercel.app/", type: "WEB", video: false },
      { title: "GenZ-Glitch", url: "https://gen-z-glitch.vercel.app/", type: "WEB", video: false },
    ],
  );
  assert.equal(data.aiArchive.filter(({ type }) => type === "VIDEO").length, 4);
  assert.equal(data.aiArchive.every(({ url, screenshot, type, video }) => (url || video) && screenshot && type), true);
  assert.ok(data.aiArchive.every(({ type, video }) => (type === "VIDEO") === Boolean(video)));
});

test("AI archive keeps the approved thumbnail sources for selected cards", () => {
  const screenshots = Object.fromEntries(data.aiArchive.map(({ slug, screenshot }) => [slug, screenshot]));
  assert.equal(screenshots["charlotte-etoile"], "./assets/ai-archive/paris.jpeg");
  assert.equal(screenshots["ddp-fashion-show"], "./assets/ai-archive/ddp-fashion-preview1.png");
  assert.equal(screenshots.koedc, "./assets/ai-archive/koedc.png");
  assert.equal(screenshots["market-marble"], "./assets/ai-archive/marketmarble.png");
  assert.equal(screenshots["summer-story"], "./assets/ai-archive/videos/summer-story-poster.jpg");
  assert.equal(screenshots["dark-in-red"], "./assets/ai-archive/videos/dark-in-red-poster.jpg");

  for (const screenshot of [
    screenshots["charlotte-etoile"],
    screenshots["ddp-fashion-show"],
    screenshots.koedc,
    screenshots["market-marble"],
    screenshots["summer-story"],
    screenshots["dark-in-red"],
  ]) {
    const file = new URL(`../${screenshot.replace("./", "")}`, import.meta.url);
    assert.ok(fs.existsSync(file), `${screenshot} should exist`);
    assert.ok(fs.statSync(file).size > 0, `${screenshot} should not be empty`);
  }

  for (const video of data.aiArchive.filter(({ type }) => type === "VIDEO").map(({ video }) => video)) {
    const file = new URL(`../${video.replace("./", "")}`, import.meta.url);
    assert.ok(fs.existsSync(file), `${video} should exist`);
    assert.ok(fs.statSync(file).size > 0, `${video} should not be empty`);
    assert.ok(fs.statSync(file).size < 10 * 1024 * 1024, `${video} should stay deployable`);
  }
});

test("Home top navigation keeps only identity, all works, and contact", () => {
  const html = fs.readFileSync(new URL("../index.html", import.meta.url), "utf8");
  assert.match(html, /JIHYE\.SPACE/);
  assert.doesNotMatch(html, /LEE JIHYE WORKS home/);
  assert.doesNotMatch(html, />CAREER\b/);
  assert.doesNotMatch(html, /data-locale-switch/);
  assert.doesNotMatch(html, />KR</);
  assert.doesNotMatch(html, />EN</);
  assert.doesNotMatch(html, />JP</);
  assert.match(html, /ALL WORKS/);
  assert.match(html, /CONTACT/);
});

test("KD Navien separates brand system and exhibition experience records", () => {
  assert.ok(data.projects["kd-navien-si"]);
  assert.ok(data.projects["kd-navien-exhibition"]);
  assert.equal(data.projects["kd-navien-si"].category, "branding");
  assert.equal(data.projects["kd-navien-exhibition"].category, "space");
  assert.equal(data.categories.flatMap(({ entries }) => entries).some(({ slug }) => slug === "sk-bullsone"), false);
});

test("KD Navien exhibition groups deduplicated evidence by exhibition role", () => {
  const project = data.projects["kd-navien-exhibition"];
  const groups = project.evidenceGroups;
  const items = groups.flatMap(({ items }) => items);
  const imageSources = items.map(([key]) => (
    typeof key === "string" ? data.imageSets[key].src : key.src
  ));

  assert.deepEqual(groups.map(({ eyebrow }) => eyebrow), [
    "01 / AWE EXHIBITION",
    "02 / ISH EXHIBITION",
    "03 / PRODUCT COMMUNICATION",
    "04 / RELATED SPATIAL SYSTEM",
  ]);
  assert.equal(items.length, 12);
  assert.equal(new Set(imageSources).size, 12);
  assert.ok(imageSources.every((src) => src.includes("/assets/kd_navien/")));
  assert.equal(imageSources.some((src) => src.includes("1_AWE_2.jpeg")), false);
  assert.equal(imageSources.some((src) => src.includes("3.42.31")), false);
  assert.equal(imageSources.some((src) => src.includes("3.41.54")), false);
  assert.ok(items.every((item) => item[4] === "standard"));
  items.forEach(([image]) => {
    const source = typeof image === "string" ? data.imageSets[image] : image;
    assert.ok(source.width > 0);
    assert.ok(source.height > 0);
    assert.equal(Boolean(source.srcset), false);
  });
});

test("Samsung Display uses the selected exhibition photo as hero and nine-page PDF evidence", () => {
  const project = data.projects["samsung-display-798"];
  assert.match(project.image.src, /assets\/samsung-display-pdf\/hero-photo\.jpg$/);
  assert.equal(project.image.width, 3000);
  assert.equal(project.image.height, 806);
  assert.equal(project.pdfPages.length, 9);
  assert.deepEqual(project.pdfPages.map(({ src }) => src), Array.from({ length: 9 }, (_, index) => (
    `./assets/samsung-display-pdf/page-${index + 1}.jpg`
  )));
  assert.match(project.copy.ko.thesis, /방문 흐름/);
  assert.ok(project.copy.ko.thesis.length > 70);
});

test("Lenovo preserves grouped smart-home evidence without duplicate screenshots", () => {
  const project = data.projects["lenovo-smart-home"];
  const items = project.evidenceGroups.flatMap(({ items }) => items);
  const keys = items.map(([key]) => key);

  assert.equal(project.evidenceGroups.length, 5);
  assert.equal(items.length, 15);
  assert.equal(new Set(keys).size, 15);
  assert.equal(keys.some((key) => key.includes("pop3")), false);
  assert.ok(keys.includes("lenovo-security-home-model"));
  assert.ok(keys.includes("lenovo-identity-pod-render-cropped"));
  assert.equal(keys.includes("lenovo-identity-pod-render"), false);
  assert.ok(project.copy.ko.thesis.length > 90);
  assert.ok(project.copy.ko.result.length > 70);

  for (const key of keys) {
    assert.ok(data.imageSets[key], `${key} image metadata should exist`);
    const file = new URL(`../${data.imageSets[key].src.replace("./", "")}`, import.meta.url);
    assert.ok(fs.existsSync(file), `${key} asset should exist`);
    assert.ok(fs.statSync(file).size > 0, `${key} asset should not be empty`);
  }
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
  const route = { name: "work", slug: "kd-navien-si" };
  assert.deepEqual(router.parseHash(router.toHash(route)), route);
  assert.deepEqual(router.parseHash("#/work/kd-navien?chapter=exhibition-space"), {
    name: "work", slug: "kd-navien-exhibition",
  });
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
