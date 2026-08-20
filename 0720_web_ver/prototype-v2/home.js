(function () {
function createHomeController(root) {
  const panels = Array.from(root.querySelectorAll("[data-panel]"));
  let activeCategory = "";
  let selectedSlug = "";
  let activationTimer = 0;
  let leaveTimer = 0;
  let suppressFocusActivation = false;

  function categoryFor(id) {
    return window.PORTFOLIO_DATA.categories.find((category) => category.id === id);
  }

  function cancelActivation() {
    clearTimeout(activationTimer);
    activationTimer = 0;
  }

  function cancelLeave() {
    clearTimeout(leaveTimer);
    leaveTimer = 0;
  }

  function scheduleCollapse() {
    cancelLeave();
    if (!activeCategory) return;
    leaveTimer = setTimeout(() => {
      leaveTimer = 0;
      collapseCategory();
    }, 280);
  }

  function isTouchLikeInput() {
    return window.matchMedia("(hover: none), (pointer: coarse)").matches;
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
      const title = item.title || project?.title || item.slug;
      const route = item.kind === "archive"
        ? { name: item.routeName || "brand-archive" }
        : { name: "work", slug: item.slug };
      if (item.chapter) route.chapter = item.chapter;
      const href = item.kind === "external" ? item.externalUrl : window.PortfolioRouter.toHash(route);
      const external = item.kind === "external" ? ' target="_blank" rel="noopener noreferrer"' : "";
      return `<a id="project-${category.id}-${item.slug}" data-project-row data-slug="${item.slug}" data-preview-key="${item.previewKey}" href="${href}"${external}><span>${String(index + 1).padStart(2, "0")}</span><strong>${title}</strong><em>${item.role}</em><b data-open-project aria-hidden="true">↗</b></a>`;
    }).join("");
    list.innerHTML = rows;
  }

  function selectProject(panel, slug) {
    const category = categoryFor(panel.dataset.panel);
    const item = category.entries.find((entry) => entry.slug === slug) || category.entries[0];
    const preview = panel.querySelector("[data-project-preview]");
    const image = window.PORTFOLIO_DATA.imageSets[item.previewKey];
    selectedSlug = item.slug;
    preview.src = image.src;
    if (image.srcset) {
      preview.srcset = image.srcset;
    } else {
      preview.removeAttribute("srcset");
    }
    preview.width = image.width;
    preview.height = image.height;
    preview.style.objectFit = item.preview?.fit || "contain";
    preview.style.objectPosition = item.preview?.position || "50% 50%";
    panel.querySelectorAll("[data-project-row]").forEach((row) => {
      row.classList.toggle("is-selected", row.dataset.slug === selectedSlug);
      row.setAttribute("aria-current", row.dataset.slug === selectedSlug ? "true" : "false");
    });
  }

  function activateCategory(id, preferredSlug = "", options = {}) {
    cancelActivation();
    cancelLeave();
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

  function collapseCategory() {
    const previousCategory = activeCategory;
    cancelActivation();
    cancelLeave();
    activeCategory = "";
    selectedSlug = "";
    root.dataset.active = "";

    panels.forEach((panel) => {
      panel.classList.remove("is-active", "is-keyboard-active");
      panel.querySelector("[data-panel-trigger]").setAttribute("aria-expanded", "false");
      const list = panel.querySelector("[data-project-list]");
      list.hidden = true;
      list.inert = true;
    });

    if (previousCategory) {
      const trigger = root.querySelector(
        `[data-panel="${previousCategory}"] [data-panel-trigger]`,
      );
      suppressFocusActivation = true;
      trigger?.focus({ preventScroll: true });
      suppressFocusActivation = false;
    }
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
      cancelLeave();
      cancelActivation();
      activationTimer = setTimeout(() => {
        activationTimer = 0;
        activateCategory(category.id);
      }, 260);
    });
    panel.addEventListener("pointerleave", cancelActivation);
    trigger.addEventListener("click", () => activateCategory(category.id));
    panel.addEventListener("click", (event) => {
      if (
        !isTouchLikeInput()
        || event.target.closest("[data-panel-trigger], [data-project-list]")
      ) return;
      activateCategory(category.id);
    });
    trigger.addEventListener("focus", () => {
      if (!suppressFocusActivation) {
        activateCategory(category.id, "", { immediate: true });
      }
    });
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
      if (row) {
        selectProject(panel, row.dataset.slug);
      }
      saveHomeState();
    });
  });

  root.addEventListener("pointerenter", cancelLeave);
  root.addEventListener("pointerleave", () => {
    cancelActivation();
    scheduleCollapse();
  });
  document.querySelector(".nav-actions")?.addEventListener("click", saveHomeState);
  document.addEventListener("keydown", (event) => {
    if (
      event.key === "Escape"
      && document.body.dataset.view === "home"
      && activeCategory
    ) {
      event.preventDefault();
      collapseCategory();
    }
  });

  return { activateCategory, selectProject, snapshot, restore };
}

window.PortfolioHome = { init: createHomeController };
})();
