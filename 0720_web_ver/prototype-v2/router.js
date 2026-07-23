(function () {
function parseHash(hash = "") {
  const source = hash.replace(/^#/, "") || "/";
  const [pathname, query = ""] = source.split("?");
  const params = new URLSearchParams(query);
  const parts = pathname.split("/").filter(Boolean);

  if (parts[0] === "work" && parts[1]) {
    const route = { name: "work", slug: parts[1] };
    if (params.get("chapter")) route.chapter = params.get("chapter");
    return route;
  }
  if (parts[0] === "archive" && parts[1] === "ai") return { name: "ai-archive" };
  if (parts[0] === "archive" && parts[1] === "btl") return { name: "btl-archive" };
  if (parts[0] === "works") return { name: "works" };
  if (parts[0] === "profile") return { name: "profile" };

  const route = { name: "home" };
  if (params.get("category")) route.category = params.get("category");
  return route;
}

function toHash(route) {
  if (route.name === "work") {
    const chapter = route.chapter ? `?chapter=${encodeURIComponent(route.chapter)}` : "";
    return `#/work/${route.slug}${chapter}`;
  }
  if (route.name === "ai-archive") return "#/archive/ai";
  if (route.name === "btl-archive") return "#/archive/btl";
  if (route.name === "works") return "#/works";
  if (route.name === "profile") return "#/profile";
  return route.category ? `#/?category=${encodeURIComponent(route.category)}` : "#/";
}

const api = { parseHash, toHash };

if (typeof window !== "undefined") window.PortfolioRouter = api;
if (typeof module !== "undefined") module.exports = api;
})();
