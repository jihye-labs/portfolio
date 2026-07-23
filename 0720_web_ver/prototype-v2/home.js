(function () {
function createHomeController(root) {
  const panels = Array.from(root.querySelectorAll("[data-panel]"));
  let activeCategory = "";
  let selectedSlug = "";
  let activationTimer = 0;

  function categoryFor(id) {
    return window.PORTFOLIO_DATA.categories.find((category) => category.id === id);
  }

  function renderRows(panel, category) {
    const list = panel.querySelector("[data-project-list]");
    const rows = category.entries.map((item, index) => {
      const project = window.PORTFOLIO_DATA.projects[item.slug];
      const route = { name: "work", slug: item.slug };
      if (item.chapter) route.chapter = item.chapter;
      return `<a id="project-${category.id}-${item.slug}" data-project-row data-slug="${item.slug}" data-preview-key="${item.previewKey}" href="${window.PortfolioRouter.toHash(route)}"><span>${String(index + 1).padStart(2, "0")}</span><strong>${project.title}</strong><em>${item.role}</em><b data-open-project aria-label="Open ${project.title}">↗</b></a>`;
    }).join("");
    const archive = category.id === "ai"
      ? '<a class="strip-archive-link" href="#/archive/ai">AI CAMPAIGN ARCHIVE <b aria-hidden="true">↗</b></a>'
      : "";
    list.innerHTML = rows + archive;
  }

  function selectProject(panel, slug) {
    const category = categoryFor(panel.dataset.panel);
    const item = category.entries.find((entry) => entry.slug === slug) || category.entries[0];
    const preview = panel.querySelector("[data-project-preview]");
    const image = window.PORTFOLIO_DATA.imageSets[item.previewKey];
    selectedSlug = item.slug;
    preview.src = image.src;
    preview.srcset = image.srcset;
    panel.querySelectorAll("[data-project-row]").forEach((row) => {
      row.classList.toggle("is-selected", row.dataset.slug === selectedSlug);
      row.setAttribute("aria-current", row.dataset.slug === selectedSlug ? "true" : "false");
    });
  }

  function activateCategory(id, preferredSlug = "") {
    activeCategory = id;
    root.dataset.active = id;
    panels.forEach((panel) => {
      const active = panel.dataset.panel === id;
      panel.classList.toggle("is-active", active);
      panel.querySelector("[data-panel-trigger]").setAttribute("aria-expanded", String(active));
      if (active) selectProject(panel, preferredSlug);
    });
  }

  function snapshot() {
    return {
      activeCategory,
      selectedSlug,
      scrollY: window.scrollY,
      focusId: document.activeElement?.id || "",
    };
  }

  function restore(value) {
    const state = window.PortfolioState.normalizeHomeState(value);
    if (state.activeCategory) activateCategory(state.activeCategory, state.selectedSlug);
    requestAnimationFrame(() => {
      window.scrollTo(0, state.scrollY);
      if (state.focusId) document.getElementById(state.focusId)?.focus({ preventScroll: true });
    });
  }

  panels.forEach((panel) => {
    const category = categoryFor(panel.dataset.panel);
    renderRows(panel, category);
    panel.addEventListener("pointerenter", (event) => {
      if (event.pointerType === "touch") return;
      clearTimeout(activationTimer);
      activationTimer = setTimeout(() => activateCategory(category.id), 260);
    });
    panel.querySelector("[data-panel-trigger]").addEventListener("click", () => activateCategory(category.id));
    panel.addEventListener("pointerover", (event) => {
      if (event.pointerType === "touch") return;
      const row = event.target.closest("[data-project-row]");
      if (row) selectProject(panel, row.dataset.slug);
    });
    panel.addEventListener("focusin", (event) => {
      const row = event.target.closest("[data-project-row]");
      if (row) {
        activateCategory(category.id);
        selectProject(panel, row.dataset.slug);
      }
    });
  });

  return { activateCategory, selectProject, snapshot, restore };
}

window.PortfolioHome = { init: createHomeController };
})();
