(function () {
  const hero = document.querySelector(".hero");
  const splitDoor = document.querySelector("[data-split-door]");
  const routeView = document.querySelector("[data-route-view]");
  const home = window.PortfolioHome.init(splitDoor);
  let hasRendered = false;

  window.portfolioHome = home;
  if ("scrollRestoration" in history) history.scrollRestoration = "manual";

  function changeDOM(callback) {
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (!reduced && document.startViewTransition) {
      return document.startViewTransition(callback);
    }
    callback();
    return null;
  }

  function renderRoute() {
    const route = window.PortfolioRouter.parseHash(window.location.hash);
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
    changeDOM(update);
  }

  document.addEventListener("click", (event) => {
    const close = event.target.closest("[data-close-case]");
    if (!close) return;
    event.preventDefault();
    const hasHomeState = Boolean(
      sessionStorage.getItem(window.PortfolioState.STORAGE_KEY),
    );
    if (hasHomeState) {
      history.back();
      return;
    }
    window.location.hash = "#/works";
  });

  window.addEventListener("hashchange", renderRoute);
  renderRoute();
})();
