import assert from "node:assert/strict";
import { createRequire } from "node:module";
import { test } from "node:test";
import path from "node:path";
import { pathToFileURL } from "node:url";

const require = createRequire(import.meta.url);
const { chromium } = require("/Users/jihyelee/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright");
const url = pathToFileURL(path.resolve("prototype-v2/index.html")).href;

async function withPage(viewport, callback) {
  const browser = await chromium.launch({ headless: true });
  try {
    const page = await browser.newPage({ viewport });
    await page.goto(url);
    await callback(page);
  } finally {
    await browser.close();
  }
}

function assertApprox(actual, expected, tolerance, message) {
  assert.ok(Math.abs(actual - expected) <= tolerance, `${message}: expected ${expected}, received ${actual}`);
}

test("desktop quick scan expands one dominant project layer at 27/46/27", async () => {
  await withPage({ width: 1440, height: 900 }, async (page) => {
    await page.locator('[data-panel="ai"]').hover();
    await page.waitForTimeout(1200);

    assert.equal(await page.locator('[data-panel="ai"] [data-panel-trigger]').getAttribute("aria-expanded"), "true");
    assert.equal(await page.locator('[data-panel="ai"] [data-project-row]').count(), 4);

    const geometry = await page.evaluate(() => {
      const panels = Array.from(document.querySelectorAll("[data-panel]"));
      const active = document.querySelector('[data-panel="ai"]');
      const preview = active.querySelector(".project-preview");
      const previewImage = preview.querySelector("img");
      const panelImage = active.querySelector(".panel-image");
      const panelRect = active.getBoundingClientRect();
      const previewRect = preview.getBoundingClientRect();
      return {
        widths: panels.map((panel) => panel.getBoundingClientRect().width / window.innerWidth),
        previewInset: Math.max(
          Math.abs(previewRect.top - panelRect.top),
          Math.abs(previewRect.right - panelRect.right),
          Math.abs(previewRect.bottom - panelRect.bottom),
          Math.abs(previewRect.left - panelRect.left),
        ),
        previewOpacity: Number.parseFloat(getComputedStyle(preview).opacity),
        heroOpacity: Number.parseFloat(getComputedStyle(panelImage).opacity),
        objectFit: getComputedStyle(previewImage).objectFit,
        loadedWidth: previewImage.naturalWidth,
        loadedHeight: previewImage.naturalHeight,
      };
    });

    geometry.widths.forEach((width, index) => {
      assertApprox(width, [0.27, 0.46, 0.27][index], 0.015, `desktop panel ${index + 1} ratio`);
    });
    assert.ok(geometry.previewInset <= 1, "active preview should fill the panel");
    assert.ok(geometry.previewOpacity >= 0.9, "active preview should be near-opaque");
    assert.ok(geometry.heroOpacity >= 0.08 && geometry.heroOpacity <= 0.18, "category hero should recede");
    assert.equal(geometry.objectFit, "cover");
    assert.ok(geometry.loadedWidth > 0 && geometry.loadedHeight > 0, "active preview image should load");

    await page.locator('[data-project-row][data-slug="genz-glitch"]').hover();
    assert.match(await page.locator('[data-panel="ai"] [data-project-preview]').getAttribute("src"), /genz-glitch-main-preview\.png(?:\?v=\w+)?$/);
    assert.equal(await page.locator('[data-panel="ai"] [data-project-preview]').evaluate((image) => getComputedStyle(image).objectFit), "cover");
    assert.deepEqual(await page.locator('[data-panel="ai"] [data-project-preview]').evaluate((image) => ({
      naturalWidth: image.naturalWidth,
      naturalHeight: image.naturalHeight,
    })), {
      naturalWidth: 2304,
      naturalHeight: 1317,
    });
    await page.mouse.move(720, 120);
    await page.waitForTimeout(350);
    assert.equal(await page.locator('[data-panel="ai"] [data-project-row].is-selected').getAttribute("data-slug"), "genz-glitch");
  });
});

test("triggers control stable hidden and inert project lists with immediate keyboard reveal", async () => {
  await withPage({ width: 1440, height: 900 }, async (page) => {
    const initial = await page.evaluate(() => Array.from(document.querySelectorAll("[data-panel]")).map((panel) => {
      const trigger = panel.querySelector("[data-panel-trigger]");
      const list = panel.querySelector("[data-project-list]");
      return {
        panel: panel.dataset.panel,
        listId: list.id,
        controls: trigger.getAttribute("aria-controls"),
        expanded: trigger.getAttribute("aria-expanded"),
        hidden: list.hidden,
        inert: list.inert,
      };
    }));

    initial.forEach((item) => {
      assert.equal(item.listId, `project-list-${item.panel}`);
      assert.equal(item.controls, item.listId);
      assert.equal(item.expanded, "false");
      assert.equal(item.hidden, true);
      assert.equal(item.inert, true);
    });

    await page.locator('[data-panel="ai"] [data-panel-trigger]').focus();
    const focused = await page.evaluate(() => {
      const panels = Array.from(document.querySelectorAll("[data-panel]"));
      const active = document.querySelector('[data-panel="ai"]');
      const list = active.querySelector("[data-project-list]");
      return {
        expanded: active.querySelector("[data-panel-trigger]").getAttribute("aria-expanded"),
        hidden: list.hidden,
        inert: list.inert,
        opacity: Number.parseFloat(getComputedStyle(list).opacity),
        collapsed: panels.filter((panel) => panel !== active).map((panel) => {
          const siblingList = panel.querySelector("[data-project-list]");
          return { hidden: siblingList.hidden, inert: siblingList.inert };
        }),
      };
    });

    assert.equal(focused.expanded, "true");
    assert.equal(focused.hidden, false);
    assert.equal(focused.inert, false);
    assert.equal(focused.opacity, 1);
    focused.collapsed.forEach((item) => {
      assert.equal(item.hidden, true);
      assert.equal(item.inert, true);
    });
  });
});

test("mobile activation grows one fixed-height panel without overlap or document churn", async () => {
  await withPage({ width: 390, height: 844 }, async (page) => {
    const initialHeight = await page.evaluate(() => document.documentElement.scrollHeight);
    await page.locator('[data-panel="branding"] [data-panel-trigger]').click();
    await page.waitForTimeout(1200);

    const geometry = await page.evaluate(() => {
      const panels = Array.from(document.querySelectorAll("[data-panel]"));
      const active = document.querySelector('[data-panel="branding"]');
      const panelRect = active.getBoundingClientRect();
      const preview = active.querySelector(".project-preview");
      const previewRect = preview.getBoundingClientRect();
      const triggerRect = active.querySelector("[data-panel-trigger]").getBoundingClientRect();
      const listRect = active.querySelector("[data-project-list]").getBoundingClientRect();
      const navRect = document.querySelector(".top-nav").getBoundingClientRect();
      return {
        innerHeight: window.innerHeight,
        scrollHeight: document.documentElement.scrollHeight,
        ratios: panels.map((panel) => panel.getBoundingClientRect().height / window.innerHeight),
        navBottom: navRect.bottom,
        triggerTop: triggerRect.top,
        triggerBottom: triggerRect.bottom,
        listTop: listRect.top,
        listBottom: listRect.bottom,
        panelBottom: panelRect.bottom,
        previewInset: Math.max(
          Math.abs(previewRect.top - panelRect.top),
          Math.abs(previewRect.right - panelRect.right),
          Math.abs(previewRect.bottom - panelRect.bottom),
          Math.abs(previewRect.left - panelRect.left),
        ),
        previewOpacity: Number.parseFloat(getComputedStyle(preview).opacity),
        heroOpacity: Number.parseFloat(getComputedStyle(active.querySelector(".panel-image")).opacity),
        objectFit: getComputedStyle(preview.querySelector("img")).objectFit,
      };
    });

    geometry.ratios.forEach((height, index) => {
      assertApprox(height, [1.7 / 3, 0.65 / 3, 0.65 / 3][index], 0.015, `mobile panel ${index + 1} ratio`);
    });
    assert.equal(geometry.scrollHeight, initialHeight);
    assert.equal(geometry.scrollHeight, geometry.innerHeight);
    assert.ok(geometry.navBottom <= geometry.triggerTop, "navigation and active title should not overlap");
    assert.ok(geometry.triggerBottom <= geometry.listTop, "active title and list should not overlap");
    assert.ok(geometry.listBottom <= geometry.panelBottom, "active list should remain inside its panel");
    assert.ok(geometry.previewInset <= 1, "mobile preview should fill the active panel");
    assert.ok(geometry.previewOpacity >= 0.9, "mobile preview should be near-opaque");
    assert.ok(geometry.heroOpacity >= 0.08 && geometry.heroOpacity <= 0.18, "mobile category hero should recede");
    assert.equal(geometry.objectFit, "contain");
  });
});

test("leaving a panel before the hover delay cancels stale activation", async () => {
  await withPage({ width: 1440, height: 900 }, async (page) => {
    await page.locator('[data-panel="ai"]').hover();
    await page.waitForTimeout(100);
    await page.locator(".nav-actions a").first().hover();
    await page.waitForTimeout(350);

    assert.equal(await page.locator("[data-split-door]").getAttribute("data-active"), "");
    assert.equal(await page.locator('[data-panel="ai"] [data-panel-trigger]').getAttribute("aria-expanded"), "false");
    assert.equal(await page.locator('[data-panel="ai"] [data-project-list]').getAttribute("hidden"), "");
  });
});

test("project navigation saves and restores the active category and selection", async () => {
  await withPage({ width: 1440, height: 900 }, async (page) => {
    await page.locator('[data-panel="branding"]').hover();
    await page.waitForTimeout(1200);
    await page.locator('[data-project-row][data-slug="alldayfit"]').hover();
    await page.locator('[data-project-row][data-slug="alldayfit"]').click();

    const saved = await page.evaluate(() => window.PortfolioState.loadHomeState());
    assert.equal(saved.activeCategory, "branding");
    assert.equal(saved.selectedSlug, "alldayfit");

    await page.reload();
    await page.evaluate(() => window.portfolioHome.restore(window.PortfolioState.loadHomeState()));

    assert.equal(await page.locator("[data-split-door]").getAttribute("data-active"), "branding");
    assert.equal(await page.locator('[data-panel="branding"] [data-panel-trigger]').getAttribute("aria-expanded"), "true");
    assert.equal(await page.locator('[data-panel="branding"] [data-project-list]').getAttribute("hidden"), null);
    assert.equal(await page.locator('[data-panel="branding"] [data-project-row].is-selected').getAttribute("data-slug"), "alldayfit");
    assert.match(await page.locator('[data-panel="branding"] [data-project-preview]').getAttribute("src"), /alldayfit-main-preview\.png(?:\?v=\w+)?$/);
  });
});

test("a project row opens an internal editorial case with persistent navigation", async () => {
  await withPage({ width: 1440, height: 900 }, async (page) => {
    await page.locator('[data-panel="space"]').hover();
    await page.waitForTimeout(1100);
    await page.locator('[data-project-row][data-slug="samsung-display-798"]').click();
    await page.waitForSelector(".case-view");

    assert.equal(await page.locator(".case-view h1").textContent(), "Samsung Display 798");
    assert.equal(await page.locator(".case-nav").isVisible(), true);
    assert.equal(await page.locator(".case-nav__identity").count(), 0);
    assert.equal(await page.locator(".case-nav [data-locale-switch]").count(), 0);
    assert.equal(await page.locator('.case-nav a[data-close-case]').first().textContent(), "BACK TO WORKS");
    assert.equal(await page.locator('.case-nav a[href^="mailto:"]').getAttribute("href"), "mailto:leejihye210@gmail.com");
    assert.equal(await page.locator(".case-meta").isVisible(), true);
    assert.equal(await page.locator(".case-proof").count(), 0);
    assert.equal(await page.locator(".case-pdf-page").count(), 9);
    assert.equal(await page.locator(".case-pdf-grid").count(), 1);
    assert.equal(await page.locator(".case-process").count(), 1);
    assert.equal(await page.locator("[data-back-category]").isVisible(), true);
    assert.equal(await page.locator(".hero").isHidden(), true);

    const external = page.locator('.case-view a[target="_blank"]');
    assert.equal(await external.count(), 0);

    const heroImage = page.locator(".case-hero-media img");
    assert.match(await heroImage.getAttribute("src"), /samsung-display-pdf\/hero-photo\.jpg$/);
    assert.match(await page.locator(".case-thesis .bilingual__secondary").textContent(), /방문 흐름과 콘텐츠 위계/);

    const pictureReservations = await page.evaluate(() => (
      Array.from(document.querySelectorAll(".case-view picture")).map((picture) => {
        const image = picture.querySelector("img");
        return {
          width: Number(image.getAttribute("width")),
          height: Number(image.getAttribute("height")),
          ratio: getComputedStyle(picture).aspectRatio,
        };
      })
    ));
    pictureReservations.forEach(({ width, height, ratio }) => {
      assert.ok(width > 0);
      assert.ok(height > 0);
      assert.notEqual(ratio, "auto");
    });

    const pdfLayout = await page.evaluate(() => {
      const grid = document.querySelector(".case-pdf-grid");
      return {
        columns: getComputedStyle(grid).gridTemplateColumns.split(" ").length,
        pages: Array.from(document.querySelectorAll(".case-pdf-page img")).map((image) => ({
          width: Number(image.getAttribute("width")),
          height: Number(image.getAttribute("height")),
          loadedWidth: image.naturalWidth,
        })),
      };
    });
    assert.equal(pdfLayout.columns, 3);
    assert.equal(pdfLayout.pages.length, 9);
    pdfLayout.pages.forEach(({ width, height, loadedWidth }) => {
      assert.equal(width, 1950);
      assert.equal(height, 1350);
      assert.ok(loadedWidth > 0);
    });
  });
});

test("every internal detail page uses the compact case navigation policy", async () => {
  await withPage({ width: 1440, height: 900 }, async (page) => {
    for (const hash of [
      "#/work/gallery-flowers",
      "#/work/benzhi-life",
      "#/work/alldayfit",
      "#/work/samsung-display-798",
      "#/work/kd-navien-exhibition",
      "#/work/lenovo-smart-home",
    ]) {
      await page.goto(`${url}${hash}`);
      await page.waitForSelector(".case-view");
      assert.equal(await page.locator(".case-nav__identity").count(), 0);
      assert.equal(await page.locator(".case-nav [data-locale-switch]").count(), 0);
      assert.equal(await page.locator(".case-nav button[data-locale]").count(), 0);
      assert.equal(await page.locator('.case-nav a[href="mailto:leejihye210@gmail.com"]').count(), 1);
      assert.equal(await page.locator('.case-nav a[data-close-case]').first().textContent(), "BACK TO WORKS");
      assert.equal(await page.locator(".case-nav__close").count(), 1);
    }
  });
});

test("AllDayFit uses the approved branded case-study page inside the portfolio", async () => {
  await withPage({ width: 1440, height: 1100 }, async (page) => {
    await page.goto(`${url}#/work/alldayfit`);
    await page.waitForSelector('.case-view[data-project="alldayfit"]');

    assert.equal(await page.locator(".alldayfit-case").count(), 1);
    assert.equal(await page.locator(".case-nav__context").textContent(), "BRANDING+ / 03");
    assert.equal(await page.locator('.case-nav a[data-close-case]').first().textContent(), "BACK TO WORKS");
    assert.equal(await page.locator('.case-nav a[href="mailto:leejihye210@gmail.com"]').count(), 1);
    assert.equal(await page.locator(".case-pagination").count(), 1);

    const text = await page.locator(".alldayfit-case").textContent();
    assert.match(text, /New Business Case Study/);
    assert.match(text, /Ten-mile wear 신사업 검토/);
    assert.match(text, /Research \/ OEM feasibility \/ Audience \/ Lookbook/);
    assert.match(text, /텐마일웨어/);
    assert.doesNotMatch(text, /워크레저/);

    const imageSources = await page.locator(".alldayfit-case img").evaluateAll((images) => (
      images.map((image) => ({
        src: image.getAttribute("src"),
        loadedWidth: image.naturalWidth,
      }))
    ));
    assert.ok(imageSources.some(({ src }) => /lookbook-3\.jpg$/.test(src)));
    assert.ok(imageSources.some(({ src }) => /slide-market\.jpg$/.test(src)));
    imageSources.forEach(({ loadedWidth }) => assert.ok(loadedWidth > 0));
  });
});

test("AI main rows open external live projects in new tabs and Archive remains internal", async () => {
  await withPage({ width: 1440, height: 900 }, async (page) => {
    await page.locator('[data-panel="ai"]').hover();
    await page.waitForTimeout(1100);

    const expected = [
      ["nike-study", "https://nike.leejihye210.workers.dev/?motion=1"],
      ["elora", "https://elora-liart-seven.vercel.app/"],
      ["genz-glitch", "https://gen-z-glitch.vercel.app/"],
    ];

    for (const [slug, href] of expected) {
      const row = page.locator(`[data-panel="ai"] [data-project-row][data-slug="${slug}"]`);
      assert.equal(await row.getAttribute("href"), href);
      assert.equal(await row.getAttribute("target"), "_blank");
      assert.equal(await row.getAttribute("rel"), "noopener noreferrer");
    }

    const nikePreview = await page.locator('[data-panel="ai"] [data-project-preview]').evaluate((image) => ({
      src: image.getAttribute("src"),
      objectFit: getComputedStyle(image).objectFit,
      objectPosition: getComputedStyle(image).objectPosition,
      width: Number(image.getAttribute("width")),
      height: Number(image.getAttribute("height")),
    }));
    assert.match(nikePreview.src, /nike-study-1280\.webp$/);
    assert.equal(nikePreview.objectFit, "cover");
    assert.equal(nikePreview.objectPosition, "50% 50%");
    assert.equal(nikePreview.width, 1280);
    assert.equal(nikePreview.height, 718);

    const archive = page.locator('[data-panel="ai"] [data-project-row][data-slug="ai-archive"]');
    assert.equal(await archive.getAttribute("href"), "#/archive/ai");
    assert.equal(await archive.getAttribute("target"), null);
  });
});

test("Space main rows hide BTL Archive and open Parkment Gwangju externally", async () => {
  await withPage({ width: 1440, height: 900 }, async (page) => {
    await page.locator('[data-panel="space"]').hover();
    await page.waitForTimeout(1200);

    const rows = await page.locator('[data-panel="space"] [data-project-row]').evaluateAll((items) => items.map((row) => ({
      slug: row.dataset.slug,
      title: row.querySelector("strong")?.textContent?.trim(),
      role: row.querySelector("em")?.textContent?.trim(),
      href: row.getAttribute("href"),
      target: row.getAttribute("target"),
    })));

    assert.deepEqual(rows.map(({ slug }) => slug), [
      "samsung-display-798",
      "parkment-gwangju",
      "kd-navien-exhibition",
      "lenovo-smart-home",
    ]);
    assert.equal(rows.some(({ slug }) => slug === "btl-archive"), false);
    assert.deepEqual(rows[1], {
      slug: "parkment-gwangju",
      title: "Parkment GwangJU",
      role: "Study Case / Proposal",
      href: "https://gwangju-livid.vercel.app/",
      target: "_blank",
    });
    assert.equal(rows[0].title, "Samsung Display 798 (Beijing)");
    assert.equal(rows[2].title, "KD Navien China / Exhibition Experience");
    assert.equal(rows[3].title, "Lenovo Smart Home Experience");

    await page.locator('[data-project-row][data-slug="parkment-gwangju"]').hover();
    assert.match(await page.locator('[data-panel="space"] [data-project-preview]').getAttribute("src"), /parkment-gwangju-main\.jpg(?:\?v=\w+)?$/);
    assert.ok(await page.locator('[data-panel="space"] [data-project-preview]').evaluate((image) => (
      image.naturalWidth > 0 && image.naturalHeight > 0
    )));
  });
});

test("Lenovo case renders grouped evidence from the Lenovo folder", async () => {
  await withPage({ width: 1440, height: 900 }, async (page) => {
    await page.goto(`${url}#/work/lenovo-smart-home`);
    await page.waitForSelector('.case-view[data-project="lenovo-smart-home"]');

    assert.equal(await page.locator(".grouped-evidence-section").count(), 5);
    assert.equal(await page.locator(".grouped-evidence-card").count(), 15);
    assert.equal(await page.locator(".grouped-evidence-card--strip").count(), 1);
    assert.match(await page.locator(".case-thesis .bilingual__secondary").textContent(), /리테일 경험/);
    assert.equal(await page.locator('img[src*="lenovo_pop3"]').count(), 0);

    const sources = await page.locator(".grouped-evidence-card img").evaluateAll((items) => (
      items.map((image) => image.getAttribute("src"))
    ));
    assert.ok(sources.some((src) => src.endsWith("/assets/lenovo/smart-home-overview.png")));
    assert.ok(sources.some((src) => src.endsWith("/assets/lenovo/security-home-model.png")));
    assert.ok(sources.some((src) => src.endsWith("/assets/lenovo/identity-pod-render-cropped.png")));
    assert.ok(sources.some((src) => src.endsWith("/assets/lenovo/proposal-overview-strip.jpg")));
    assert.equal(sources.some((src) => src.endsWith("/assets/lenovo/identity-pod-render.png")), false);

    const cardHeights = await page.locator(".grouped-evidence-section").first().locator(".grouped-evidence-card__media").evaluateAll((items) => (
      items.map((item) => Math.round(item.getBoundingClientRect().height))
    ));
    assert.equal(new Set(cardHeights).size, 1);
  });
});

test("Brand Archive opens as a compact index instead of a fourth full case", async () => {
  await withPage({ width: 1440, height: 900 }, async (page) => {
    await page.locator('[data-panel="branding"]').hover();
    await page.waitForTimeout(1100);
    await page.locator('[data-project-row][data-slug="brand-archive"]').click();
    await page.waitForSelector(".archive-view--brand");

    assert.equal(await page.locator(".case-view").count(), 0);
    assert.equal(await page.locator(".archive-list--brand .archive-row").count(), 3);
    assert.equal(await page.locator(".archive-list--brand a").count(), 1);
    assert.equal(await page.locator(".archive-list--brand article").count(), 2);
    assert.equal(await page.locator(".archive-view--brand .index-nav__identity").count(), 0);
    assert.equal(await page.locator(".archive-view--brand [data-locale-switch]").count(), 0);
    assert.equal(await page.locator('.archive-view--brand a[href="mailto:leejihye210@gmail.com"]').count(), 1);
    assert.equal(await page.locator(".index-nav__close").getAttribute("href"), "#/");
  });
});

test("projects without an explicit live URL remain entirely inside the portfolio", async () => {
  await withPage({ width: 1440, height: 900 }, async (page) => {
    await page.goto(`${url}#/work/gallery-flowers`);
    await page.waitForSelector('.case-view[data-project="gallery-flowers"]');

    assert.equal(await page.locator(".case-view h1").textContent(), "Gallery Flowers");
    assert.equal(await page.locator(".case-hero-copy em").textContent(), "Artisan's Lounge : Salon");
    assert.equal(await page.locator(".case-meta dd").nth(1).textContent(), "2026.03-05");
    assert.equal(await page.locator('.case-view a[target="_blank"]').count(), 0);
    assert.equal(await page.locator(".live-project").count(), 0);
    assert.equal(await page.locator(".gallery-pdf-page").count(), 9);
    assert.equal(await page.locator(".case-scope__grid article").count(), 5);
    assert.equal(await page.locator(".case-journey__grid article").count(), 4);
    assert.equal(await page.locator(".case-story--gallery").count(), 1);
    assert.equal(await page.locator(".gallery-editorial").count(), 5);
    assert.equal(await page.locator(".gallery-objectives__grid article").count(), 4);
    assert.match(await page.locator(".case-view").textContent(), /지역 제휴/);
    assert.match(await page.locator(".case-view").textContent(), /Mermaid Angel/);
    assert.match(await page.locator(".case-view").textContent(), /시그니처 음료/);
    assert.match(await page.locator(".gallery-flow").textContent(), /NAVER PLACE/);
  });
});

test("KD Navien separates SI system and exhibition experience cases", async () => {
  await withPage({ width: 390, height: 844 }, async (page) => {
    await page.goto(`${url}#/work/kd-navien-exhibition`);
    await page.waitForSelector('.case-view[data-project="kd-navien-exhibition"]');

    assert.equal(await page.locator(".case-view h1").textContent(), "KD Navien China / Exhibition Experience");
    assert.match(await page.locator(".case-hero-copy p").textContent(), /Exhibition Direction/);
    assert.match(await page.locator(".case-story").textContent(), /visitor path/i);
    assert.equal(await page.locator(".case-view").getAttribute("data-category"), "space");
    assert.equal(await page.locator(".case-proof").count(), 0);
    assert.equal(await page.locator(".grouped-evidence-section").count(), 4);
    assert.equal(await page.locator(".grouped-evidence-card").count(), 12);
    assert.equal(await page.locator('.grouped-evidence-card img[src*="/assets/kd_navien/"]').count(), 12);
    assert.equal(await page.locator('.grouped-evidence-card img[src*="1_AWE_2.jpeg"]').count(), 0);
    assert.equal(await page.locator('.grouped-evidence-card img[src*="3.42.31"]').count(), 0);
    for (const proof of await page.locator(".grouped-evidence-card").all()) {
      await proof.scrollIntoViewIfNeeded();
    }
    await page.evaluate(async () => {
      await Promise.all(Array.from(document.querySelectorAll(".grouped-evidence-card img")).map((image) => (
        image.decode().catch(() => null)
      )));
    });

    const geometry = await page.evaluate(() => {
      const hero = document.querySelector(".case-hero").getBoundingClientRect();
      const firstProof = document.querySelector(".grouped-evidence-card").getBoundingClientRect();
      const nav = document.querySelector(".case-nav").getBoundingClientRect();
      const processMedia = document.querySelector(".case-process-media").getBoundingClientRect();
      return {
        heroHeight: hero.height,
        viewportHeight: window.innerHeight,
        firstProofWidth: firstProof.width,
        viewportWidth: window.innerWidth,
        navHeight: nav.height,
        processMediaHeight: processMedia.height,
        firstSectionHeights: Array.from(document.querySelectorAll(".grouped-evidence-section")[0].querySelectorAll(".grouped-evidence-card__media")).map((media) => (
          Math.round(media.getBoundingClientRect().height)
        )),
        firstSectionWidths: Array.from(document.querySelectorAll(".grouped-evidence-section")[0].querySelectorAll(".grouped-evidence-card")).map((card) => (
          Math.round(card.getBoundingClientRect().width)
        )),
        proofRatios: Array.from(document.querySelectorAll(".grouped-evidence-card img")).map((image) => {
          const media = image.parentElement.getBoundingClientRect();
          return {
            rendered: media.width / media.height,
            intrinsic: Number(image.getAttribute("width")) / Number(image.getAttribute("height")),
            loadedWidth: image.naturalWidth,
          };
        }),
      };
    });

    assert.ok(geometry.heroHeight >= geometry.viewportHeight * 0.72);
    assert.ok(geometry.firstProofWidth >= geometry.viewportWidth * 0.88);
    assert.ok(geometry.navHeight <= 72);
    assert.ok(geometry.processMediaHeight <= geometry.viewportWidth * 1.2);
    assert.equal(new Set(geometry.firstSectionHeights).size, 1);
    assert.equal(new Set(geometry.firstSectionWidths).size, 1);
    geometry.proofRatios.forEach(({ loadedWidth }) => {
      assert.ok(loadedWidth > 0);
    });
  });
});

test("KD Navien desktop evidence follows the requested bento rhythm", async () => {
  await withPage({ width: 1440, height: 1100 }, async (page) => {
    await page.goto(`${url}#/work/kd-navien-exhibition`);
    await page.waitForSelector('.case-view[data-project="kd-navien-exhibition"]');
    for (const proof of await page.locator(".grouped-evidence-card").all()) {
      await proof.scrollIntoViewIfNeeded();
    }
    await page.evaluate(async () => {
      await Promise.all(Array.from(document.querySelectorAll(".grouped-evidence-card img")).map((image) => (
        image.decode().catch(() => null)
      )));
    });

    const groups = await page.evaluate(() => (
      Array.from(document.querySelectorAll(".grouped-evidence-section")).map((section) => {
        const sectionRect = section.getBoundingClientRect();
        return {
          layout: section.getAttribute("data-layout"),
          cards: Array.from(section.querySelectorAll(".grouped-evidence-card")).map((card) => {
            const rect = card.getBoundingClientRect();
            return {
              left: Math.round(rect.left - sectionRect.left),
              top: Math.round(rect.top - sectionRect.top),
              width: Math.round(rect.width),
              height: Math.round(rect.height),
            };
          }),
        };
      })
    ));

    assert.deepEqual(groups.map(({ layout }) => layout), [
      "awe-2018",
      "ish-hero-pair",
      "product-feature-stack",
      "related-feature-pair",
    ]);

    const [awe, ish, product, related] = groups.map(({ cards }) => cards);
    assert.equal(awe[0].top, awe[2].top);
    assert.ok(awe[1].top > awe[0].top);
    assert.ok(awe[1].width > awe[0].width * 1.8);

    assert.ok(ish[1].top > ish[0].top);
    assert.equal(ish[1].top, ish[2].top);
    assert.ok(ish[0].width > ish[1].width * 1.8);

    assert.equal(product[0].top, product[1].top);
    assert.ok(product[2].top > product[1].top);
    assert.ok(product[0].height > product[1].height * 1.8);

    assert.ok(related[1].top > related[0].top);
    assert.equal(related[1].top, related[2].top);
    assert.ok(related[0].width > related[1].width * 1.8);

    const fitChecks = await page.evaluate(() => {
      const select = (layout, index) => getComputedStyle(
        document.querySelector(`.grouped-evidence-section[data-layout="${layout}"] .grouped-evidence-card:nth-child(${index}) img`)
      ).objectFit;
      return [
        select("awe-2018", 2),
        select("ish-hero-pair", 1),
        select("product-feature-stack", 1),
        select("related-feature-pair", 1),
      ];
    });
    assert.deepEqual(fitChecks, ["contain", "contain", "contain", "contain"]);
  });
});

test("an invalid project chapter renders a truthful not-found state", async () => {
  await withPage({ width: 1440, height: 900 }, async (page) => {
    await page.goto(`${url}#/work/kd-navien-exhibition?chapter=not-a-real-chapter`);
    await page.waitForSelector(".case-not-found");

    assert.equal(await page.locator(".case-view").count(), 0);
    assert.match(await page.locator(".case-not-found").textContent(), /chapter not found/i);
    assert.equal(await page.locator("[data-chapter]").count(), 0);
  });
});

test("closing a case restores category, selected row, focus, and scroll", async () => {
  await withPage({ width: 1440, height: 900 }, async (page) => {
    await page.locator('[data-panel="space"]').hover();
    await page.waitForTimeout(1100);

    const row = page.locator('[data-project-row][data-slug="lenovo-smart-home"]');
    await row.focus();
    await page.evaluate(() => {
      document.body.style.minHeight = "1600px";
      window.scrollTo(0, 180);
      document.querySelector('[data-project-row][data-slug="lenovo-smart-home"]').click();
    });
    await page.waitForSelector('.case-view[data-project="lenovo-smart-home"]');
    await page.locator("[data-close-case]").last().click();
    await page.waitForSelector(".hero:not([hidden])");
    await page.waitForFunction(() => (
      document.activeElement?.dataset.slug === "lenovo-smart-home"
      && window.scrollY === 180
    ));

    assert.equal(
      await page.locator('[data-panel="space"] [data-panel-trigger]').getAttribute("aria-expanded"),
      "true",
    );
    assert.equal(
      await page.locator('[data-panel="space"] [data-project-row].is-selected').getAttribute("data-slug"),
      "lenovo-smart-home",
    );
    assert.equal(await page.evaluate(() => document.activeElement?.dataset.slug), "lenovo-smart-home");
    assert.equal(await page.evaluate(() => window.scrollY), 180);
  });
});

test("browser Back restores the same Home quick-scan state", async () => {
  await withPage({ width: 1440, height: 900 }, async (page) => {
    await page.locator('[data-panel="branding"]').hover();
    await page.waitForTimeout(1100);
    const row = page.locator('[data-project-row][data-slug="benzhi-life"]');
    await row.focus();
    await row.click();
    await page.waitForSelector('.case-view[data-project="benzhi-life"]');

    await page.evaluate(() => history.back());
    await page.waitForSelector(".hero:not([hidden])");
    await page.waitForFunction(() => document.activeElement?.dataset.slug === "benzhi-life");

    assert.equal(await page.locator("[data-split-door]").getAttribute("data-active"), "branding");
    assert.equal(
      await page.locator('[data-panel="branding"] [data-project-row].is-selected').getAttribute("data-slug"),
      "benzhi-life",
    );
  });
});

test("a direct project URL closes to All Works without inventing Home history", async () => {
  const browser = await chromium.launch({ headless: true });
  try {
    const context = await browser.newContext({ viewport: { width: 1440, height: 900 } });
    const page = await context.newPage();
    await page.goto(`${url}#/work/elora`);
    await page.waitForSelector('.case-view[data-project="elora"]');

    assert.equal((await page.locator("[data-back-category]").textContent()).trim(), "BACK TO WORKS");
    assert.equal(await page.locator("[data-back-category]").getAttribute("href"), "#/works");
    assert.equal(await page.locator("[data-close-case]").last().getAttribute("href"), "#/works");

    await page.locator("[data-close-case]").last().click();
    await page.waitForURL(/#\/works$/);
    assert.equal(await page.evaluate(() => sessionStorage.getItem(window.PortfolioState.STORAGE_KEY)), null);
  } finally {
    await browser.close();
  }
});

test("route changes use View Transitions unless reduced motion is requested", async () => {
  async function transitionCount(reducedMotion) {
    const browser = await chromium.launch({ headless: true });
    try {
      const context = await browser.newContext({
        viewport: { width: 1440, height: 900 },
        reducedMotion,
      });
      const page = await context.newPage();
      await page.addInitScript(() => {
        window.__viewTransitionCalls = 0;
        document.startViewTransition = (callback) => {
          window.__viewTransitionCalls += 1;
          callback();
          const resolved = Promise.resolve();
          return { ready: resolved, updateCallbackDone: resolved, finished: resolved };
        };
      });
      await page.goto(url);
      await page.locator('[data-panel="space"]').hover();
      await page.waitForTimeout(1100);
      await page.locator('[data-project-row][data-slug="samsung-display-798"]').click();
      await page.waitForSelector('.case-view[data-project="samsung-display-798"]');
      return await page.evaluate(() => window.__viewTransitionCalls);
    } finally {
      await browser.close();
    }
  }

  assert.ok(await transitionCount("no-preference") >= 1);
  assert.equal(await transitionCount("reduce"), 0);
});

test("Close skips a Previous/Next case chain and restores the saved Home origin", async () => {
  await withPage({ width: 1440, height: 900 }, async (page) => {
    await page.locator('[data-panel="space"]').hover();
    await page.waitForTimeout(1100);
    const originRow = page.locator('[data-project-row][data-slug="samsung-display-798"]');
    await originRow.focus();
    await originRow.click();
    await page.waitForSelector('.case-view[data-project="samsung-display-798"]');

    await page.locator(".case-pagination > a").last().click();
    await page.waitForSelector('.case-view[data-project="kd-navien-exhibition"]');
    await page.locator("[data-close-case]").last().click();
    await page.waitForSelector(".hero:not([hidden])");
    await page.waitForFunction(() => document.activeElement?.dataset.slug === "samsung-display-798");

    assert.equal(await page.locator("[data-split-door]").getAttribute("data-active"), "space");
    assert.equal(
      await page.locator('[data-panel="space"] [data-project-row].is-selected').getAttribute("data-slug"),
      "samsung-display-798",
    );
    assert.equal(await page.evaluate(() => document.activeElement?.dataset.slug), "samsung-display-798");
  });
});

test("selected preview and detail Hero share one transition owner on entry and return", async () => {
  const browser = await chromium.launch({ headless: true });
  try {
    const context = await browser.newContext({
      viewport: { width: 1440, height: 900 },
      reducedMotion: "no-preference",
    });
    const page = await context.newPage();
    await page.addInitScript(() => {
      window.__transitionContracts = [];
      document.startViewTransition = (callback) => {
        const owners = () => Array.from(
          document.querySelectorAll(".project-preview, .case-hero-media"),
        ).filter((element) => (
          element.getClientRects().length
          && getComputedStyle(element).viewTransitionName === "case-hero"
        )).map((element) => (
          element.classList.contains("project-preview")
            ? "project-preview"
            : "case-hero-media"
        ));
        const before = owners();
        callback();
        const after = owners();
        window.__transitionContracts.push({ before, after });
        const resolved = Promise.resolve();
        return { ready: resolved, updateCallbackDone: resolved, finished: resolved };
      };
    });
    await page.goto(url);
    await page.locator('[data-panel="space"]').hover();
    await page.waitForTimeout(1100);
    await page.locator('[data-project-row][data-slug="samsung-display-798"]').click();
    await page.waitForSelector('.case-view[data-project="samsung-display-798"]');
    await page.locator("[data-close-case]").last().click();
    await page.waitForSelector(".hero:not([hidden])");

    assert.deepEqual(await page.evaluate(() => window.__transitionContracts), [
      { before: ["project-preview"], after: ["case-hero-media"] },
      { before: ["case-hero-media"], after: ["project-preview"] },
    ]);
    await page.waitForFunction(() => (
      !document.documentElement.classList.contains("is-route-transitioning")
    ));
    assert.deepEqual(await page.evaluate(() => Array.from(
      document.querySelectorAll(".project-preview, .case-hero-media"),
    ).filter((element) => getComputedStyle(element).viewTransitionName !== "none")), []);
  } finally {
    await browser.close();
  }
});

test("stale Home storage cannot classify a new direct detail lifecycle as Home-originated", async () => {
  const browser = await chromium.launch({ headless: true });
  try {
    const context = await browser.newContext({ viewport: { width: 1440, height: 900 } });
    const page = await context.newPage();
    await page.goto(url);
    await page.evaluate(() => {
      window.PortfolioState.saveHomeState({
        activeCategory: "ai",
        selectedSlug: "elora",
        focusId: "project-ai-elora",
        scrollY: 0,
      });
    });
    await page.goto("about:blank");
    await page.goto(`${url}#/work/elora`);
    await page.waitForSelector('.case-view[data-project="elora"]');

    assert.notEqual(
      await page.evaluate(() => sessionStorage.getItem(window.PortfolioState.STORAGE_KEY)),
      null,
    );
    assert.equal((await page.locator("[data-back-category]").textContent()).trim(), "BACK TO WORKS");
    assert.equal(await page.locator("[data-close-case]").last().getAttribute("href"), "#/works");

    await page.locator("[data-close-case]").last().click();
    await page.waitForURL(/#\/works$/);
    await page.waitForFunction(() => !document.querySelector(".case-view"));
    assert.equal(await page.locator(".case-view").count(), 0);
  } finally {
    await browser.close();
  }
});

test("All Works presents three full-width discipline bands and the approved home menu links", async () => {
  await withPage({ width: 1440, height: 900 }, async (page) => {
    await page.goto(`${url}#/works`);
    await page.waitForSelector(".works-view");

    assert.deepEqual(
      await page.locator(".works-group h2").allTextContents(),
      ["BRANDING+", "AI+", "SPACE BTL+"],
    );
    assert.equal(await page.locator('.works-view a[href^="#/work/"]').count(), 6);
    assert.equal(await page.locator('.works-view a[target="_blank"][href^="https://"]').count(), 4);
    assert.equal(await page.locator('.works-view a[href="#/archive/brand"]').count(), 1);
    assert.equal(await page.locator('.works-view a[href="#/archive/ai"]').count(), 1);
    assert.equal(await page.locator('.works-view a[href="#/archive/btl"]').count(), 0);
    assert.equal(await page.locator('.works-view a[href="https://gwangju-livid.vercel.app/"]').count(), 1);

    const geometry = await page.evaluate(() => ({
      bands: Array.from(document.querySelectorAll(".works-group")).map((group) => {
        const rect = group.getBoundingClientRect();
        return { left: rect.left, right: rect.right, width: rect.width };
      }),
      viewport: window.innerWidth,
      thumbReservations: Array.from(document.querySelectorAll(".works-thumb img")).map((image) => ({
        width: Number(image.getAttribute("width")),
        height: Number(image.getAttribute("height")),
        ratio: getComputedStyle(image.parentElement).aspectRatio,
      })),
    }));

    geometry.bands.forEach(({ left, right, width }) => {
      assert.ok(left <= 1);
      assert.ok(Math.abs(right - geometry.viewport) <= 1);
      assert.equal(width, geometry.viewport);
    });
    geometry.thumbReservations.forEach(({ width, height, ratio }) => {
      assert.ok(width > 0);
      assert.ok(height > 0);
      assert.notEqual(ratio, "auto");
    });
  });
});

test("All Works remains a legible quick scan without horizontal overflow on mobile", async () => {
  await withPage({ width: 390, height: 844 }, async (page) => {
    await page.goto(`${url}#/works`);
    await page.waitForSelector(".works-view");

    const layout = await page.evaluate(() => {
      const rows = Array.from(document.querySelectorAll(".works-row"));
      return {
        scrollWidth: document.documentElement.scrollWidth,
        viewportWidth: window.innerWidth,
        rows: rows.map((row) => {
          const rect = row.getBoundingClientRect();
          const title = row.querySelector("strong").getBoundingClientRect();
          return {
            width: rect.width,
            height: rect.height,
            titleWidth: title.width,
            titleVisible: getComputedStyle(row.querySelector("strong")).display !== "none",
          };
        }),
      };
    });

    assert.equal(layout.scrollWidth, layout.viewportWidth);
    layout.rows.forEach((row) => {
      assert.ok(row.width <= layout.viewportWidth);
      assert.ok(row.height >= 68);
      assert.ok(row.height <= 96);
      assert.ok(row.titleWidth >= 120);
      assert.equal(row.titleVisible, true);
    });
  });
});

test("Career tells the four-stage factual trajectory as accumulated experience expanding into AI", async () => {
  for (const viewport of [{ width: 1440, height: 900 }, { width: 390, height: 844 }]) {
    await withPage(viewport, async (page) => {
      await page.goto(`${url}#/profile`);
      await page.waitForSelector(".profile-view");

      assert.match(
        await page.locator(".profile-view h1").textContent(),
        /Experience built the foundation/i,
      );
      assert.deepEqual(
        await page.locator(".career-step time").allTextContents(),
        ["2025–Now", "2016–2020", "2010–2016", "2005–2010"],
      );
      assert.deepEqual(
        await page.locator(".career-step h2").allTextContents(),
        [
          "Brand Content & AI Strategy",
          "BTL & Brand Experience",
          "Service & Space Business Planning",
          "Architecture & Technical Coordination",
        ],
      );
      assert.match(await page.locator(".profile-intro").textContent(), /Korea.*China.*Japan/i);
      assert.equal(await page.locator(".career-step .career-step").count(), 0);
      assert.equal(
        await page.locator(".index-nav__close").getAttribute("href"),
        "#/",
      );
    });
  }
});

test("AI Campaign Archive presents direct cards and sound-capable video previews without language chrome", async () => {
  for (const viewport of [{ width: 1440, height: 900 }, { width: 390, height: 844 }]) {
    await withPage(viewport, async (page) => {
      await page.goto(`${url}#/archive/ai`);
      await page.waitForSelector(".archive-view--ai");

      assert.equal(await page.locator(".index-nav__identity").count(), 0);
      assert.equal(await page.locator("[data-locale-switch]").count(), 0);
      assert.equal(await page.locator(".locale-switch").count(), 0);
      assert.match(await page.locator("h1").textContent(), /AI Campaign Archive/i);
      assert.equal(await page.locator(".ai-launcher-hero h1 + .ai-launcher-hero__intro").textContent(), "각 PROJECT를 클릭하면 웹, 영상, 아카이브가 열립니다.");
      assert.equal(await page.locator(".ai-work-card").count(), 14);
      await page.evaluate(async () => {
        await Promise.all(Array.from(document.querySelectorAll(".ai-work-card__image")).map((image) => (
          image.decode().catch(() => null)
        )));
      });
      const thumbnails = await page.locator(".ai-work-card__image").evaluateAll((images) => images.map((image) => ({
        src: image.getAttribute("src"),
        naturalWidth: image.naturalWidth,
        naturalHeight: image.naturalHeight,
      })));
      assert.equal(thumbnails.length, 14);
      assert.equal(thumbnails.every(({ src, naturalWidth, naturalHeight }) => src && naturalWidth > 0 && naturalHeight > 0), true);
      assert.equal(await page.locator(".ai-archive-frame iframe").count(), 0);
      assert.equal(await page.locator(".ai-archive-preview").count(), 0);
      assert.equal(await page.locator(".project-rail").count(), 0);
      assert.equal(await page.locator(".project-index").count(), 0);
      assert.equal(await page.locator('a[href*="jihye.space"]').count(), 0);

      const cards = await page.locator(".ai-work-card").evaluateAll((items) => items.map((card) => ({
        tagName: card.tagName,
        href: card.getAttribute("href"),
        target: card.getAttribute("target"),
        rel: card.getAttribute("rel"),
        video: card.getAttribute("data-video-src"),
        type: card.querySelector(".ai-work-card__type")?.textContent?.trim(),
        title: card.querySelector("h2")?.textContent?.trim(),
      })));
      assert.deepEqual(cards.map(({ title }) => title), [
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
      assert.equal(cards.filter(({ tagName }) => tagName === "BUTTON").length, 4);
      assert.equal(cards.filter(({ type }) => type === "VIDEO").length, 4);
      assert.equal(cards.filter(({ video }) => video?.endsWith(".mp4")).length, 4);
      assert.equal(cards.filter(({ tagName }) => tagName === "A").every(({ href, target, rel }) => href && target === "_blank" && rel === "noopener noreferrer"), true);
      assert.equal(cards[0].href, "https://nike.leejihye210.workers.dev/?motion=1");
      assert.equal(cards[2].href, "https://elora-liart-seven.vercel.app/");

      await page.locator(".ai-work-card").first().hover();
      await page.waitForTimeout(520);
      const hovered = await page.locator(".ai-work-card").first().evaluate((card) => ({
        borderColor: getComputedStyle(card).borderColor,
        transform: getComputedStyle(card).transform,
        openOpacity: Number.parseFloat(getComputedStyle(card.querySelector(".ai-work-card__open")).opacity),
      }));
      assert.notEqual(hovered.transform, "none");
      assert.ok(hovered.borderColor.includes("127") || hovered.borderColor.includes("255"));
      assert.ok(hovered.openOpacity > 0.5);

      await page.locator('.ai-work-card[data-video-src*="summer-story-preview"]').click();
      await page.waitForSelector(".ai-video-modal:not([hidden])");
      const modal = await page.locator(".ai-video-modal").evaluate((element) => {
        const video = element.querySelector("video");
        return {
          hidden: element.hidden,
          source: video?.getAttribute("src"),
          muted: video?.muted,
          controls: video?.controls,
        };
      });
      assert.equal(modal.hidden, false);
      assert.match(modal.source, /summer-story-preview\.mp4$/);
      assert.equal(modal.muted, false);
      assert.equal(modal.controls, true);
      await page.locator(".ai-video-modal__close").click();
      await page.waitForFunction(() => document.querySelector(".ai-video-modal")?.hidden === true);

      const layout = await page.evaluate(() => {
        return {
          scrollWidth: document.documentElement.scrollWidth,
          cardCount: document.querySelectorAll(".ai-work-card").length,
        };
      });
      assert.equal(layout.scrollWidth, viewport.width);
      assert.equal(layout.cardCount, 14);
    });
  }
});

test("BTL Works Archive keeps three internal capability entries with real reserved images", async () => {
  for (const viewport of [{ width: 1440, height: 900 }, { width: 390, height: 844 }]) {
    await withPage(viewport, async (page) => {
      await page.goto(`${url}#/archive/btl`);
      await page.waitForSelector(".archive-view--btl");

      assert.equal(await page.locator(".archive-row").count(), 3);
      assert.match(await page.locator("h1").textContent(), /BTL Works Archive/i);
      assert.equal(await page.locator('.archive-view--btl a[target="_blank"]').count(), 0);
      assert.equal(await page.locator(".archive-view--btl .index-nav__identity").count(), 0);
      assert.equal(await page.locator(".archive-view--btl [data-locale-switch]").count(), 0);
      assert.equal(await page.locator('.archive-view--btl a[href="mailto:leejihye210@gmail.com"]').count(), 1);

      const images = await page.evaluate(() => (
        Array.from(document.querySelectorAll(".archive-row picture img")).map((image) => ({
          width: Number(image.getAttribute("width")),
          height: Number(image.getAttribute("height")),
          loadedWidth: image.naturalWidth,
          ratio: getComputedStyle(image.parentElement).aspectRatio,
        }))
      ));
      assert.equal(images.length, 3);
      images.forEach(({ width, height, loadedWidth, ratio }) => {
        assert.ok(width > 0);
        assert.ok(height > 0);
        assert.ok(loadedWidth > 0);
        assert.notEqual(ratio, "auto");
      });
    });
  }
});

test("standard index routes follow the compact contact and home navigation policy", async () => {
  await withPage({ width: 390, height: 844 }, async (page) => {
    for (const hash of ["#/works", "#/profile"]) {
      await page.goto(`${url}${hash}`);
      await page.waitForSelector(".index-view");
      assert.equal(await page.locator(".index-nav__identity").count(), 0);
      assert.equal(await page.locator("[data-locale-switch]").count(), 0);
      assert.equal(await page.locator(".locale-switch").count(), 0);
      assert.equal(await page.locator(".index-nav a[href='mailto:leejihye210@gmail.com']").count(), 1);
      assert.equal(await page.locator(".index-nav__close").getAttribute("href"), "#/");
      assert.equal(await page.locator(".index-view h1").count(), 1);
      assert.equal(await page.locator(".index-nav").isVisible(), true);
      assert.equal(await page.locator(".index-view").getAttribute("tabindex"), "-1");
    }
  });
});

test("mobile opens a project on the first menu tap after the category opens", async () => {
  const browser = await chromium.launch({ headless: true });
  try {
    const page = await browser.newPage({
      viewport: { width: 390, height: 844 },
      isMobile: true,
      hasTouch: true,
    });
    await page.goto(url);
    await page.locator('[data-panel="branding"] [data-panel-trigger]').tap();
    await page.waitForTimeout(1100);
    const activeBox = await page.locator('[data-panel="branding"]').boundingBox();
    const siblingBox = await page.locator('[data-panel="ai"]').boundingBox();
    assert.ok(activeBox.height > siblingBox.height * 1.8);
    const row = page.locator(
      '[data-panel="branding"] [data-project-row][data-slug="benzhi-life"]',
    );
    await row.tap();
    assert.match(page.url(), /#\/work\/benzhi-life/);
  } finally {
    await browser.close();
  }
});

test("tablet touch opens a category from the panel surface, not only its title", async () => {
  const browser = await chromium.launch({ headless: true });
  try {
    const page = await browser.newPage({
      viewport: { width: 1024, height: 768 },
      isMobile: true,
      hasTouch: true,
    });
    await page.goto(url);

    const tapPoint = await page.locator('[data-panel="ai"]').evaluate((panel) => {
      const rect = panel.getBoundingClientRect();
      return {
        x: Math.round(rect.left + rect.width / 2),
        y: Math.round(rect.bottom - 96),
      };
    });
    await page.touchscreen.tap(tapPoint.x, tapPoint.y);
    await page.waitForTimeout(1100);

    assert.equal(await page.locator('[data-split-door]').getAttribute('data-active'), 'ai');
    assert.equal(await page.locator('[data-panel="ai"] [data-panel-trigger]').getAttribute('aria-expanded'), 'true');
    assert.equal(await page.locator('[data-panel="ai"] [data-project-list]').getAttribute('hidden'), null);
    assert.equal(await page.locator('[data-panel="branding"] [data-project-list]').getAttribute('hidden'), '');
    assert.equal(await page.locator('[data-panel="space"] [data-project-list]').getAttribute('hidden'), '');
  } finally {
    await browser.close();
  }
});

test("reduced motion disables shared-element travel", async () => {
  const browser = await chromium.launch({ headless: true });
  try {
    const page = await browser.newPage({
      viewport: { width: 1440, height: 900 },
      reducedMotion: "reduce",
    });
    await page.goto(url);
    assert.equal(
      await page.evaluate(() => (
        getComputedStyle(document.documentElement)
          .getPropertyValue("--door-time")
          .trim()
      )),
      "120ms",
    );
  } finally {
    await browser.close();
  }
});

test("touch arrow is an always-visible direct-open target", async () => {
  const browser = await chromium.launch({ headless: true });
  try {
    const context = await browser.newContext({
      viewport: { width: 390, height: 844 },
      isMobile: true,
      hasTouch: true,
    });
    const page = await context.newPage();
    await page.goto(url);
    await page.locator('[data-panel="ai"] [data-panel-trigger]').tap();
    await page.waitForTimeout(1100);

    const row = page.locator('[data-panel="ai"] [data-project-row][data-slug="genz-glitch"]');
    const arrow = row.locator("[data-open-project]");
    const target = await arrow.evaluate((element) => {
      const rect = element.getBoundingClientRect();
      const style = getComputedStyle(element);
      return {
        width: rect.width,
        height: rect.height,
        opacity: Number.parseFloat(style.opacity),
        visibility: style.visibility,
      };
    });
    assert.ok(target.width >= 44);
    assert.ok(target.height >= 44);
    assert.equal(target.opacity, 1);
    assert.equal(target.visibility, "visible");

    const popupPromise = context.waitForEvent("page");
    await arrow.tap();
    const popup = await popupPromise;
    await popup.waitForLoadState("domcontentloaded");
    assert.equal(new URL(popup.url()).origin, "https://gen-z-glitch.vercel.app");
    assert.equal(await page.evaluate(() => location.hash || "#/"), "#/");
    await popup.close();
  } finally {
    await browser.close();
  }
});

test("keyboard focus selects rows, Enter opens, and Escape collapses Home", async () => {
  await withPage({ width: 1440, height: 900 }, async (page) => {
    const panel = page.locator('[data-panel="space"]');
    const trigger = panel.locator("[data-panel-trigger]");
    const row = panel.locator('[data-project-row][data-slug="lenovo-smart-home"]');

    await trigger.focus();
    assert.equal(await trigger.getAttribute("aria-expanded"), "true");
    await row.focus();
    assert.equal(await row.getAttribute("aria-current"), "true");
    assert.equal(await row.evaluate((element) => getComputedStyle(element).outlineStyle), "solid");

    await page.keyboard.press("Escape");
    assert.equal(await trigger.getAttribute("aria-expanded"), "false");
    assert.equal(await panel.locator("[data-project-list]").getAttribute("hidden"), "");
    assert.equal(await page.evaluate(() => document.activeElement?.matches("[data-panel-trigger]")), true);

    await page.waitForTimeout(1100);
    const widths = await page.locator("[data-panel]").evaluateAll((panels) => (
      panels.map((item) => item.getBoundingClientRect().width / window.innerWidth)
    ));
    widths.forEach((width) => assertApprox(width, 1 / 3, 0.015, "collapsed panel ratio"));

    await page.keyboard.press("Enter");
    assert.equal(await trigger.getAttribute("aria-expanded"), "true");
    await row.focus();
    await page.keyboard.press("Enter");
    await page.waitForURL(/#\/work\/lenovo-smart-home/);
  });
});

test("reduced motion keeps input state changes but removes transforms and route travel", async () => {
  const browser = await chromium.launch({ headless: true });
  try {
    const context = await browser.newContext({
      viewport: { width: 1440, height: 900 },
      reducedMotion: "reduce",
    });
    const page = await context.newPage();
    await page.addInitScript(() => {
      window.__viewTransitionCalls = 0;
      document.startViewTransition = (callback) => {
        window.__viewTransitionCalls += 1;
        callback();
        const resolved = Promise.resolve();
        return { ready: resolved, updateCallbackDone: resolved, finished: resolved };
      };
    });
    await page.goto(url);
    await page.locator('[data-panel="ai"] [data-panel-trigger]').focus();
    const motion = await page.locator('[data-panel="ai"]').evaluate((panel) => {
      const preview = panel.querySelector(".project-preview");
      const heading = panel.querySelector(".panel-trigger");
      return {
        panelTransform: getComputedStyle(panel).transform,
        previewTransform: getComputedStyle(preview).transform,
        headingTransform: getComputedStyle(heading).transform,
        previewTransitionDelay: getComputedStyle(preview).transitionDelay,
        viewTransitionName: getComputedStyle(preview).viewTransitionName,
      };
    });
    assert.equal(motion.panelTransform, "none");
    assert.equal(motion.previewTransform, "none");
    assert.equal(motion.headingTransform, "none");
    assert.match(motion.previewTransitionDelay, /(^|,\s*)0s($|,)/);
    assert.equal(motion.viewTransitionName, "none");

    await page.locator('[data-panel="space"] [data-panel-trigger]').focus();
    await page.locator('[data-panel="space"] [data-project-row][data-slug="lenovo-smart-home"]').click();
    await page.waitForSelector('.case-view[data-project="lenovo-smart-home"]');
    assert.equal(await page.evaluate(() => window.__viewTransitionCalls), 0);
  } finally {
    await browser.close();
  }
});
