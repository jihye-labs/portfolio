(function () {
  const hero = document.querySelector(".hero");
  const splitDoor = document.querySelector("[data-split-door]");
  const routeView = document.querySelector("[data-route-view]");

  window.portfolioHome = window.PortfolioHome.init(splitDoor);

  function renderRoute() {
    const route = window.PortfolioRouter.parseHash(window.location.hash);
    const isCase = route.name === "work";

    hero.hidden = isCase;
    routeView.hidden = !isCase;

    if (!isCase) return;

    window.PortfolioViews.render(route, routeView);
    window.scrollTo(0, 0);
    routeView.focus({ preventScroll: true });
  }

  window.addEventListener("hashchange", renderRoute);
  renderRoute();
})();
