(function () {
  const STORAGE_KEY = "lee-jihye-portfolio-locale-v1";
  const allowed = new Set(["ko", "en", "ja"]);

  function get() {
    try {
      const value = localStorage.getItem(STORAGE_KEY);
      return allowed.has(value) ? value : "ko";
    } catch {
      return "ko";
    }
  }

  function set(locale) {
    const next = allowed.has(locale) ? locale : "ko";
    try { localStorage.setItem(STORAGE_KEY, next); } catch {}
    document.documentElement.lang = next === "ko" ? "ko" : next === "ja" ? "ja" : "en";
    document.querySelectorAll("[data-locale]").forEach((button) => {
      button.setAttribute("aria-pressed", String(button.dataset.locale === next));
    });
    window.dispatchEvent(new CustomEvent("portfolio-locale-change", { detail: next }));
    return next;
  }

  function init() {
    document.addEventListener("click", (event) => {
      const button = event.target.closest("[data-locale]");
      if (button) set(button.dataset.locale);
    });
    set(get());
  }

  window.PortfolioLocale = { get, set, init };
  init();
})();
