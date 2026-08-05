(function () {
function parseHash(hash = "") {
  const source = hash.replace(/^#/, "") || "/";
  const [pathname, query = ""] = source.split("?");
  const params = new URLSearchParams(query);
  const parts = pathname.split("/").filter(Boolean);

  if (parts[0] === "work" && parts[1]) {
    const legacyKD = parts[1] === "kd-navien";
    const route = {
      name: "work",
      slug: legacyKD && params.get("chapter") === "exhibition-space"
        ? "kd-navien-exhibition"
        : legacyKD
          ? "kd-navien-si"
          : parts[1],
    };
    if (params.get("chapter") && !legacyKD) route.chapter = params.get("chapter");
    if (params.get("from")) route.from = params.get("from");
    return route;
  }
  if (parts[0] === "archive" && parts[1] === "brand") return { name: "brand-archive" };
  if (parts[0] === "archive" && parts[1] === "ai") return { name: "ai-archive" };
  if (parts[0] === "archive" && parts[1] === "btl") return { name: "btl-archive" };
  if (parts[0] === "works") return {
    name: "works",
    category: params.get("category") || "",
  };
  if (parts[0] === "profile") return { name: "profile" };

  const route = { name: "home" };
  if (params.get("category")) route.category = params.get("category");
  return route;
}

function toHash(route) {
  if (route.name === "work") {
    const params = new URLSearchParams();
    if (route.chapter) params.set("chapter", route.chapter);
    if (route.from) params.set("from", route.from);
    const query = params.toString() ? `?${params.toString()}` : "";
    return `#/work/${route.slug}${query}`;
  }
  if (route.name === "ai-archive") return "#/archive/ai";
  if (route.name === "brand-archive") return "#/archive/brand";
  if (route.name === "btl-archive") return "#/archive/btl";
  if (route.name === "works") {
    return route.category ? `#/works?category=${encodeURIComponent(route.category)}` : "#/works";
  }
  if (route.name === "profile") return "#/profile";
  return route.category ? `#/?category=${encodeURIComponent(route.category)}` : "#/";
}

const api = { parseHash, toHash };

if (typeof window !== "undefined") window.PortfolioRouter = api;
if (typeof module !== "undefined") module.exports = api;
})();
