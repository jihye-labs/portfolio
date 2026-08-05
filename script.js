(function () {
  const hero = document.querySelector(".hero");
  const splitDoor = document.querySelector("[data-split-door]");
  const routeView = document.querySelector("[data-route-view]");
  const home = window.PortfolioHome.init(splitDoor);
  const ROUTE_STATE_KEY = "leeJihyePortfolioRoute";
  let hasRendered = false;
  let activeRouteState = null;

  window.portfolioHome = home;
  if ("scrollRestoration" in history) history.scrollRestoration = "manual";

  function currentHash() {
    return window.location.hash || "#/";
  }

  function createHomeEntryId() {
    if (window.crypto?.randomUUID) return window.crypto.randomUUID();
    return `home-${Date.now()}-${Math.random().toString(36).slice(2)}`;
  }

  function readRouteState() {
    const value = history.state?.[ROUTE_STATE_KEY];
    if (
      !value
      || value.version !== 1
      || value.hash !== currentHash()
      || !["home", "direct"].includes(value.origin)
    ) {
      return null;
    }
    return value;
  }

  function replaceRouteState(value) {
    const nextHistoryState = {
      ...(history.state || {}),
      [ROUTE_STATE_KEY]: value,
    };
    history.replaceState(nextHistoryState, "");
    activeRouteState = value;
    return value;
  }

  function homeRouteState() {
    return {
      version: 1,
      hash: currentHash(),
      origin: "home",
      homeHash: currentHash(),
      homeEntryId: createHomeEntryId(),
      caseDepth: 0,
    };
  }

  function directRouteState() {
    return {
      version: 1,
      hash: currentHash(),
      origin: "direct",
      homeHash: "#/works",
      homeEntryId: "",
      caseDepth: 0,
    };
  }

  function establishRouteState(route) {
    const existing = readRouteState();
    if (existing) {
      activeRouteState = existing;
      return existing;
    }

    const previous = activeRouteState;
    if (route.name === "home") {
      return replaceRouteState(homeRouteState());
    }

    if (
      route.name === "work"
      && previous?.origin === "home"
      && previous.homeEntryId
      && ["home", "work"].includes(document.body.dataset.view)
    ) {
      return replaceRouteState({
        ...previous,
        hash: currentHash(),
        caseDepth: document.body.dataset.view === "home"
          ? 1
          : previous.caseDepth + 1,
      });
    }

    return replaceRouteState(directRouteState());
  }

  function getRouteContext() {
    return activeRouteState || directRouteState();
  }

  window.PortfolioNavigation = Object.freeze({
    ROUTE_STATE_KEY,
    getRouteContext,
  });

  function changeDOM(callback, { sharedHero = false } = {}) {
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (!reduced && document.startViewTransition) {
      if (sharedHero) {
        document.documentElement.classList.add("is-route-transitioning");
      }
      try {
        const transition = document.startViewTransition(callback);
        Promise.resolve(transition.finished)
          .catch(() => {})
          .then(() => {
            document.documentElement.classList.remove("is-route-transitioning");
          });
        return transition;
      } catch {
        document.documentElement.classList.remove("is-route-transitioning");
      }
    }
    callback();
    return null;
  }

  function renderRoute() {
    const route = window.PortfolioRouter.parseHash(window.location.hash);
    const previousView = document.body.dataset.view || "";
    establishRouteState(route);
    const update = () => {
      if (route.name === "home") {
        hero.hidden = false;
        routeView.hidden = true;
        routeView.innerHTML = "";
        const stored = window.PortfolioState.loadHomeState();
        home.restore(route.category ? { ...stored, activeCategory: route.category } : stored);
        document.body.dataset.view = "home";
        return;
      }

      if (document.body.dataset.view === "home") {
        window.PortfolioState.saveHomeState(home.snapshot());
      }

      hero.hidden = true;
      routeView.hidden = false;
      routeView.innerHTML = "";
      window.PortfolioViews.render(route, routeView);
      routeView.focus({ preventScroll: true });
      window.scrollTo(0, 0);
      document.body.dataset.view = route.name;
    };

    if (!hasRendered) {
      update();
      hasRendered = true;
      return;
    }
    const sharedHero = (
      (previousView === "home" && route.name === "work")
      || (previousView === "work" && ["home", "work"].includes(route.name))
    );
    changeDOM(update, { sharedHero });
  }

  document.addEventListener("click", (event) => {
    const close = event.target.closest("[data-close-case]");
    if (!close) return;
    event.preventDefault();
    const routeState = getRouteContext();
    if (
      routeState.origin === "home"
      && routeState.homeEntryId
      && routeState.caseDepth > 0
    ) {
      history.go(-routeState.caseDepth);
      return;
    }
    window.location.hash = "#/works";
  });

  window.addEventListener("hashchange", renderRoute);
  window.addEventListener("portfolio-locale-change", () => {
    if (document.body.dataset.view !== "home") renderRoute();
  });
  renderRoute();
})();
