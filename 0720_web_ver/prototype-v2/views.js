(function () {
  function escapeHTML(value = "") {
    return String(value).replace(/[&<>"']/g, (character) => ({
      "&": "&amp;",
      "<": "&lt;",
      ">": "&gt;",
      '"': "&quot;",
      "'": "&#39;",
    })[character]);
  }

  function safeExternalURL(value = "") {
    try {
      const url = new URL(value);
      return url.protocol === "https:" || url.protocol === "http:" ? url.href : "";
    } catch {
      return "";
    }
  }

  function picture(image, alt, className = "", position = "50% 50%", eager = false) {
    const loading = eager ? 'loading="eager" fetchpriority="high"' : 'loading="lazy"';
    const safeClass = escapeHTML(className);
    return `<picture class="${safeClass}" style="aspect-ratio:${image.width}/${image.height}">
      <source srcset="${escapeHTML(image.srcset)}" type="image/webp">
      <img
        src="${escapeHTML(image.src)}"
        alt="${escapeHTML(alt)}"
        width="${image.width}"
        height="${image.height}"
        decoding="async"
        ${loading}
        style="object-position:${escapeHTML(position)}"
      >
    </picture>`;
  }

  function categorySequence(categoryId) {
    return window.PORTFOLIO_DATA.categories
      .find(({ id }) => id === categoryId)?.entries || [];
  }

  function entryRoute(item) {
    const route = { name: "work", slug: item.slug };
    if (item.chapter) route.chapter = item.chapter;
    return window.PortfolioRouter.toHash(route);
  }

  function proofRhythm(category, index) {
    const rhythms = {
      branding: ["landscape", "portrait", "portrait", "landscape"],
      ai: ["cinema", "portrait", "landscape", "cinema"],
      space: ["cinema", "landscape", "portrait", "cinema"],
    };
    return rhythms[category]?.[index] || "landscape";
  }

  function mergeChapter(project, chapter) {
    if (!chapter) return project;
    return { ...project, ...project.chapters[chapter] };
  }

  function hasChapter(project, chapter) {
    return Boolean(chapter && Object.hasOwn(project.chapters || {}, chapter));
  }

  function renderProof(proof, index, category) {
    const number = String(index + 1).padStart(2, "0");
    const rhythm = proofRhythm(category, index);
    return `<figure class="case-proof case-proof--${rhythm}">
      ${picture(proof.image, proof.alt, "case-proof-media", proof.position)}
      <figcaption><span>${number}</span>${escapeHTML(proof.caption)}</figcaption>
    </figure>`;
  }

  function renderCase(sourceProject, chapter = "") {
    const project = mergeChapter(sourceProject, chapter);
    const sequence = categorySequence(project.category);
    const index = Math.max(0, sequence.findIndex((item) => (
      item.slug === project.slug && (!chapter || item.chapter === chapter)
    )));
    const previous = sequence[(index - 1 + sequence.length) % sequence.length];
    const next = sequence[(index + 1) % sequence.length];
    const liveURL = safeExternalURL(project.liveUrl);
    const live = liveURL
      ? `<a class="live-project" href="${escapeHTML(liveURL)}" target="_blank" rel="noopener noreferrer">
          <span>OPEN LIVE PROJECT</span><span aria-hidden="true">↗</span>
        </a>`
      : "";
    const proofs = project.proofs
      .map((proof, proofIndex) => renderProof(proof, proofIndex, project.category))
      .join("");
    const process = project.process;
    const categoryLabel = window.PORTFOLIO_DATA.categories
      .find(({ id }) => id === project.category)?.label || project.category;
    const hasHomeState = Boolean(
      sessionStorage.getItem(window.PortfolioState.STORAGE_KEY),
    );
    const backRoute = hasHomeState
      ? window.PortfolioRouter.toHash({ name: "home", category: project.category })
      : window.PortfolioRouter.toHash({ name: "works" });
    const backLabel = hasHomeState ? "BACK TO CATEGORY" : "BACK TO WORKS";

    return `<article
      class="case-view case-view--${escapeHTML(project.category)}"
      data-project="${escapeHTML(project.slug)}"
      data-chapter="${escapeHTML(chapter)}"
      data-category="${escapeHTML(project.category)}"
      data-detail-mode="${escapeHTML(project.detailMode)}"
    >
      <header class="case-nav">
        <a class="case-nav__identity" href="${escapeHTML(backRoute)}" data-close-case>LEE JIHYE WORKS</a>
        <span class="case-nav__context">${escapeHTML(categoryLabel)} / ${String(index + 1).padStart(2, "0")}</span>
        <a href="#/works">ALL WORKS</a>
        <a class="case-nav__close" href="${escapeHTML(backRoute)}" data-close-case aria-label="Close project">
          <span aria-hidden="true">×</span>
        </a>
      </header>

      <section class="case-hero" aria-labelledby="case-title">
        ${picture(project.image, `${project.title} project`, "case-hero-media", "50% 50%", true)}
        <div class="case-hero-shade" aria-hidden="true"></div>
        <div class="case-hero-copy">
          <p>${escapeHTML(project.role)}</p>
          <h1 id="case-title">${escapeHTML(project.title)}</h1>
          <span>${escapeHTML(project.year)}</span>
        </div>
      </section>

      <section class="case-intro">
        <div class="case-intro__lead">
          <p class="case-kicker">PROJECT POINT OF VIEW</p>
          <p class="case-thesis">${escapeHTML(project.thesis)}</p>
        </div>
        <dl class="case-meta">
          <div><dt>Period</dt><dd>${escapeHTML(project.year)}</dd></div>
          <div><dt>Role</dt><dd>${escapeHTML(project.role)}</dd></div>
          <div><dt>Scope</dt><dd>${escapeHTML(project.scope)}</dd></div>
        </dl>
      </section>

      <section class="case-story">
        <div class="case-decision">
          <article>
            <p>01 / OPPORTUNITY</p>
            <h2>${escapeHTML(project.problem)}</h2>
          </article>
          <article>
            <p>02 / JUDGMENT</p>
            <h2>${escapeHTML(project.judgment)}</h2>
          </article>
        </div>

        <section class="case-evidence" aria-label="Selected outputs">
          <header class="case-section-heading">
            <p>SELECTED OUTPUTS</p>
            <span>${String(project.proofs.length).padStart(2, "0")} PROOFS</span>
          </header>
          <div class="case-evidence-grid">${proofs}</div>
        </section>

        <section class="case-process">
          <div class="case-process-copy">
            <p>03 / PROCESS PROOF</p>
            <h2>${escapeHTML(process.label)}</h2>
          </div>
          ${picture(
            process.proof.image,
            process.proof.alt,
            "case-process-media",
            process.proof.position,
          )}
        </section>

        <article class="case-contribution">
          <p>04 / CONTRIBUTION</p>
          <h2>${escapeHTML(project.contribution)}</h2>
        </article>
        ${live}
      </section>

      <footer class="case-pagination">
        <a href="${escapeHTML(entryRoute(previous))}">
          <span>PREVIOUS</span><strong>← ${escapeHTML(window.PORTFOLIO_DATA.projects[previous.slug].title)}</strong>
        </a>
        <a href="${escapeHTML(backRoute)}" data-back-category>
          ${escapeHTML(backLabel)}
        </a>
        <a href="${escapeHTML(entryRoute(next))}">
          <span>NEXT</span><strong>${escapeHTML(window.PORTFOLIO_DATA.projects[next.slug].title)} →</strong>
        </a>
      </footer>
    </article>`;
  }

  function render(route, mount) {
    if (route.name !== "work") return false;
    const project = window.PORTFOLIO_DATA.projects[route.slug];
    if (!project) {
      mount.innerHTML = '<p class="case-not-found">Project not found.</p>';
      return false;
    }
    if (route.chapter && !hasChapter(project, route.chapter)) {
      mount.innerHTML = `<section class="case-not-found">
        <a href="${escapeHTML(window.PortfolioRouter.toHash({ name: "work", slug: project.slug }))}">← ${escapeHTML(project.title)}</a>
        <p>Project chapter not found.</p>
      </section>`;
      return false;
    }
    mount.innerHTML = renderCase(project, route.chapter || "");
    return true;
  }

  window.PortfolioViews = { render };
})();
