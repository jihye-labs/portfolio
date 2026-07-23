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

test("a project row opens an internal editorial case with persistent navigation", async () => {
  await withPage({ width: 1440, height: 900 }, async (page) => {
    await page.locator('[data-panel="ai"]').hover();
    await page.waitForTimeout(1100);
    await page.locator('[data-project-row][data-slug="elora"]').click();
    await page.waitForSelector(".case-view");

    assert.equal(await page.locator(".case-view h1").textContent(), "ELORA");
    assert.equal(await page.locator(".case-nav").isVisible(), true);
    assert.equal(await page.locator(".case-meta").isVisible(), true);
    assert.equal(await page.locator(".case-proof").count(), 4);
    assert.equal(await page.locator(".case-process").count(), 1);
    assert.equal(await page.locator("[data-back-category]").isVisible(), true);
    assert.equal(await page.locator(".hero").isHidden(), true);

    const external = page.locator('a[target="_blank"]');
    assert.equal(await external.count(), 1);
    assert.match(await external.textContent(), /OPEN LIVE PROJECT/);
    assert.equal(await external.getAttribute("href"), "https://www.jihye.space/");
    assert.equal(await external.getAttribute("rel"), "noopener noreferrer");

    const heroImage = page.locator(".case-hero-media img");
    assert.match(await heroImage.getAttribute("src"), /elora-keyvisual-1280\.webp$/);

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
  });
});

test("projects without an explicit live URL remain entirely inside the portfolio", async () => {
  await withPage({ width: 1440, height: 900 }, async (page) => {
    await page.goto(`${url}#/work/gallery-flowers`);
    await page.waitForSelector('.case-view[data-project="gallery-flowers"]');

    assert.equal(await page.locator(".case-view h1").textContent(), "Gallery Flowers");
    assert.equal(await page.locator('a[target="_blank"]').count(), 0);
    assert.equal(await page.locator(".live-project").count(), 0);
    assert.equal(await page.locator(".case-proof").count(), 4);
  });
});

test("KD Navien keeps one case structure while changing its chapter context", async () => {
  await withPage({ width: 390, height: 844 }, async (page) => {
    await page.goto(`${url}#/work/kd-navien?chapter=exhibition-space`);
    await page.waitForSelector('.case-view[data-chapter="exhibition-space"]');

    assert.equal(await page.locator(".case-view h1").textContent(), "KD Navien China");
    assert.match(await page.locator(".case-hero-copy p").textContent(), /Exhibition Direction/);
    assert.match(await page.locator(".case-story").textContent(), /visitor path/i);
    assert.equal(await page.locator(".case-view").getAttribute("data-category"), "space");

    const geometry = await page.evaluate(() => {
      const hero = document.querySelector(".case-hero").getBoundingClientRect();
      const firstProof = document.querySelector(".case-proof").getBoundingClientRect();
      const nav = document.querySelector(".case-nav").getBoundingClientRect();
      const processMedia = document.querySelector(".case-process-media").getBoundingClientRect();
      return {
        heroHeight: hero.height,
        viewportHeight: window.innerHeight,
        firstProofWidth: firstProof.width,
        viewportWidth: window.innerWidth,
        navHeight: nav.height,
        processMediaHeight: processMedia.height,
        proofRatios: Array.from(document.querySelectorAll(".case-proof-media img")).map((image) => {
          const media = image.parentElement.getBoundingClientRect();
          return {
            rendered: media.width / media.height,
            intrinsic: Number(image.getAttribute("width")) / Number(image.getAttribute("height")),
          };
        }),
      };
    });

    assert.ok(geometry.heroHeight >= geometry.viewportHeight * 0.72);
    assert.ok(geometry.firstProofWidth >= geometry.viewportWidth * 0.88);
    assert.ok(geometry.navHeight <= 72);
    assert.ok(geometry.processMediaHeight <= geometry.viewportWidth * 1.2);
    geometry.proofRatios.forEach(({ rendered, intrinsic }) => {
      assertApprox(rendered, intrinsic, 0.03, "mobile proof should preserve its reserved source proportion");
    });
  });
});

test("an invalid project chapter renders a truthful not-found state", async () => {
  await withPage({ width: 1440, height: 900 }, async (page) => {
    await page.goto(`${url}#/work/kd-navien?chapter=not-a-real-chapter`);
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
      await page.locator('[data-panel="ai"]').hover();
      await page.waitForTimeout(1100);
      await page.locator('[data-project-row][data-slug="elora"]').click();
      await page.waitForSelector('.case-view[data-project="elora"]');
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
    await page.locator('[data-panel="ai"]').hover();
    await page.waitForTimeout(1100);
    const originRow = page.locator('[data-project-row][data-slug="elora"]');
    await originRow.focus();
    await originRow.click();
    await page.waitForSelector('.case-view[data-project="elora"]');

    await page.locator(".case-pagination > a").last().click();
    await page.waitForSelector('.case-view[data-project="genz-glitch"]');
    await page.locator("[data-close-case]").last().click();
    await page.waitForSelector(".hero:not([hidden])");
    await page.waitForFunction(() => document.activeElement?.dataset.slug === "elora");

    assert.equal(await page.locator("[data-split-door]").getAttribute("data-active"), "ai");
    assert.equal(
      await page.locator('[data-panel="ai"] [data-project-row].is-selected').getAttribute("data-slug"),
      "elora",
    );
    assert.equal(await page.evaluate(() => document.activeElement?.dataset.slug), "elora");
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
    await page.locator('[data-panel="ai"]').hover();
    await page.waitForTimeout(1100);
    await page.locator('[data-project-row][data-slug="elora"]').click();
    await page.waitForSelector('.case-view[data-project="elora"]');
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
