(function () {
function createHomeController(root) {
  const panels = Array.from(root.querySelectorAll("[data-panel]"));
  let activeCategory = "";
  let selectedSlug = "";
  let activationTimer = 0;

  function categoryFor(id) {
    return window.PORTFOLIO_DATA.categories.find((category) => category.id === id);
  }

  function cancelActivation() {
    clearTimeout(activationTimer);
    activationTimer = 0;
  }

  function renderRows(panel, category) {
    const list = panel.querySelector("[data-project-list]");
    const trigger = panel.querySelector("[data-panel-trigger]");
    list.id = `project-list-${category.id}`;
    list.hidden = true;
    list.inert = true;
    trigger.setAttribute("aria-controls", list.id);

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

  function activateCategory(id, preferredSlug = "", options = {}) {
    cancelActivation();
    activeCategory = id;
    root.dataset.active = id;

    panels.forEach((panel) => {
      const active = panel.dataset.panel === id;
      const list = panel.querySelector("[data-project-list]");
      const trigger = panel.querySelector("[data-panel-trigger]");

      if (!active) {
        panel.classList.remove("is-active", "is-keyboard-active");
        trigger.setAttribute("aria-expanded", "false");
        list.hidden = true;
        list.inert = true;
        return;
      }

      list.hidden = false;
      list.inert = false;
      panel.classList.toggle("is-keyboard-active", options.immediate === true);
      if (options.immediate !== true && !panel.classList.contains("is-active")) {
        void list.offsetHeight;
      }
      panel.classList.add("is-active");
      trigger.setAttribute("aria-expanded", "true");
      selectProject(panel, preferredSlug);
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

  function saveHomeState() {
    window.PortfolioState.saveHomeState(snapshot());
  }

  function restore(value) {
    const state = window.PortfolioState.normalizeHomeState(value);
    if (state.activeCategory) {
      activateCategory(state.activeCategory, state.selectedSlug, { immediate: true });
    }
    requestAnimationFrame(() => {
      window.scrollTo(0, state.scrollY);
      if (state.focusId) document.getElementById(state.focusId)?.focus({ preventScroll: true });
    });
  }

  panels.forEach((panel) => {
    const category = categoryFor(panel.dataset.panel);
    const trigger = panel.querySelector("[data-panel-trigger]");
    renderRows(panel, category);

    panel.addEventListener("pointerenter", (event) => {
      if (event.pointerType === "touch") return;
      cancelActivation();
      activationTimer = setTimeout(() => {
        activationTimer = 0;
        activateCategory(category.id);
      }, 260);
    });
    panel.addEventListener("pointerleave", cancelActivation);
    trigger.addEventListener("click", () => activateCategory(category.id));
    trigger.addEventListener("focus", () => activateCategory(category.id, "", { immediate: true }));
    panel.addEventListener("pointerover", (event) => {
      if (event.pointerType === "touch") return;
      const row = event.target.closest("[data-project-row]");
      if (row) selectProject(panel, row.dataset.slug);
    });
    panel.addEventListener("focusin", (event) => {
      const row = event.target.closest("[data-project-row]");
      if (row) {
        activateCategory(category.id, row.dataset.slug, { immediate: true });
      }
    });
    panel.querySelector("[data-project-list]").addEventListener("click", (event) => {
      const link = event.target.closest("a");
      if (!link) return;
      const row = link.closest("[data-project-row]");
      if (row) selectProject(panel, row.dataset.slug);
      saveHomeState();
    });
  });

  root.addEventListener("pointerleave", cancelActivation);
  document.querySelector(".nav-actions")?.addEventListener("click", saveHomeState);

  return { activateCategory, selectProject, snapshot, restore };
}

window.PortfolioHome = { init: createHomeController };
})();
