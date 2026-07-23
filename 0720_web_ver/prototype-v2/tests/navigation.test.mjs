import assert from "node:assert/strict";
import { createRequire } from "node:module";
import { test } from "node:test";
import path from "node:path";
import { pathToFileURL } from "node:url";

const require = createRequire(import.meta.url);
const { chromium } = require("playwright");
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
      };
    });

    geometry.widths.forEach((width, index) => {
      assertApprox(width, [0.27, 0.46, 0.27][index], 0.015, `desktop panel ${index + 1} ratio`);
    });
    assert.ok(geometry.previewInset <= 1, "active preview should fill the panel");
    assert.ok(geometry.previewOpacity >= 0.9, "active preview should be near-opaque");
    assert.ok(geometry.heroOpacity >= 0.08 && geometry.heroOpacity <= 0.18, "category hero should recede");
    assert.equal(geometry.objectFit, "contain");

    await page.locator('[data-project-row][data-slug="alldayfit"]').hover();
    assert.match(await page.locator('[data-panel="ai"] [data-project-preview]').getAttribute("src"), /alldayfit-1280\.webp$/);
    await page.mouse.move(720, 120);
    await page.waitForTimeout(350);
    assert.equal(await page.locator('[data-panel="ai"] [data-project-row].is-selected').getAttribute("data-slug"), "alldayfit");
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
    await page.locator('[data-panel="ai"]').hover();
    await page.waitForTimeout(1200);
    await page.locator('[data-project-row][data-slug="alldayfit"]').hover();
    await page.locator('[data-project-row][data-slug="alldayfit"]').click();

    const saved = await page.evaluate(() => window.PortfolioState.loadHomeState());
    assert.equal(saved.activeCategory, "ai");
    assert.equal(saved.selectedSlug, "alldayfit");

    await page.reload();
    await page.evaluate(() => window.portfolioHome.restore(window.PortfolioState.loadHomeState()));

    assert.equal(await page.locator("[data-split-door]").getAttribute("data-active"), "ai");
    assert.equal(await page.locator('[data-panel="ai"] [data-panel-trigger]').getAttribute("aria-expanded"), "true");
    assert.equal(await page.locator('[data-panel="ai"] [data-project-list]').getAttribute("hidden"), null);
    assert.equal(await page.locator('[data-panel="ai"] [data-project-row].is-selected').getAttribute("data-slug"), "alldayfit");
    assert.match(await page.locator('[data-panel="ai"] [data-project-preview]').getAttribute("src"), /alldayfit-1280\.webp$/);
  });
});
