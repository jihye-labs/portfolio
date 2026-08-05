(function () {
const STORAGE_KEY = "lee-jihye-home-state-v1";
const categoryIds = new Set(["branding", "ai", "space"]);

function normalizeHomeState(value = {}) {
  return {
    activeCategory: categoryIds.has(value.activeCategory) ? value.activeCategory : "",
    selectedSlug: typeof value.selectedSlug === "string" ? value.selectedSlug : "",
    scrollY: Number.isFinite(value.scrollY) && value.scrollY > 0 ? value.scrollY : 0,
    focusId: typeof value.focusId === "string" ? value.focusId : "",
  };
}

function saveHomeState(value) {
  const normalized = normalizeHomeState(value);
  sessionStorage.setItem(STORAGE_KEY, JSON.stringify(normalized));
  return normalized;
}

function loadHomeState() {
  try {
    return normalizeHomeState(JSON.parse(sessionStorage.getItem(STORAGE_KEY) || "{}"));
  } catch {
    return normalizeHomeState();
  }
}

const api = { STORAGE_KEY, normalizeHomeState, saveHomeState, loadHomeState };

if (typeof window !== "undefined") window.PortfolioState = api;
if (typeof module !== "undefined") module.exports = api;
})();
