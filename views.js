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
    const source = image.srcset
      ? `<source srcset="${escapeHTML(image.srcset)}" type="${escapeHTML(image.type || "image/webp")}">`
      : "";
    return `<picture class="${safeClass}" style="aspect-ratio:${image.width}/${image.height}">
      ${source}
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

  function looseImage(src, alt, className = "", position = "50% 50%", eager = false) {
    const loading = eager ? 'loading="eager" fetchpriority="high"' : 'loading="lazy"';
    return `<img
      class="${escapeHTML(className)}"
      src="${escapeHTML(src)}"
      alt="${escapeHTML(alt)}"
      decoding="async"
      ${loading}
      style="object-position:${escapeHTML(position)}"
    >`;
  }

  function categorySequence(categoryId) {
    return window.PORTFOLIO_DATA.categories
      .find(({ id }) => id === categoryId)?.entries
      .filter((item) => item.kind !== "archive" && window.PORTFOLIO_DATA.projects[item.slug])
      .map((item) => ({ ...item, kind: "project", externalUrl: "" })) || [];
  }

  function localized(project, field) {
    const locale = window.PortfolioLocale?.get?.() || "ko";
    const english = project.copy?.en?.[field]
      || (field === "strategy" ? project.judgment : project[field])
      || "Content to be confirmed.";
    const korean = project.copy?.ko?.[field] || "한국어 내용 확인 필요";
    const japanese = project.copy?.ja?.[field] || "日本語内容は確認中です。";
    return {
      english,
      secondary: locale === "ja" ? japanese : locale === "en" ? "" : korean,
      locale,
      needsReview: locale === "ja" && !project.copy?.ja?.[field],
    };
  }

  function bilingual(project, field, className = "") {
    const value = localized(project, field);
    const review = value.needsReview
      ? '<span class="copy-review">EDITORIAL CHECK / Japanese copy pending</span>'
      : "";
    return `<div class="bilingual ${escapeHTML(className)}">
      <p class="bilingual__en">${escapeHTML(value.english)}</p>
      ${value.secondary ? `<p class="bilingual__secondary">${escapeHTML(value.secondary)}</p>` : ""}
      ${review}
    </div>`;
  }

  function entryRoute(item, fromCategory = "") {
    if (item.kind === "archive") return window.PortfolioRouter.toHash({ name: item.routeName || "brand-archive" });
    if (item.kind === "external") return safeExternalURL(item.externalUrl);
    const route = { name: "work", slug: item.slug };
    if (item.chapter) route.chapter = item.chapter;
    if (fromCategory) route.from = fromCategory;
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

  function galleryPair(english, korean, className = "") {
    return `<div class="gallery-pair ${escapeHTML(className)}">
      <p class="gallery-pair__en">${escapeHTML(english)}</p>
      <p class="gallery-pair__ko">${escapeHTML(korean)}</p>
    </div>`;
  }

  function renderPdfEvidence(project, {
    label = "PROJECT RECORD",
    countLabel = "PDF PAGES",
    className = "",
    ariaLabel = "Project PDF record",
  } = {}) {
    const pages = project.pdfPages || [];
    const pageCount = String(pages.length).padStart(2, "0");
    const items = pages.map((page, index) => {
      const number = String(index + 1).padStart(2, "0");
      return `<figure class="case-pdf-page">
        <img src="${escapeHTML(page.src)}" alt="${escapeHTML(page.alt)}" width="${page.width}" height="${page.height}" loading="eager" fetchpriority="high" decoding="async">
        <figcaption><span>${number}</span><span>${escapeHTML(countLabel)} / ${pageCount}</span></figcaption>
      </figure>`;
    }).join("");

    return `<section class="case-pdf-evidence ${escapeHTML(className)}" aria-label="${escapeHTML(ariaLabel)}">
      <header class="case-section-heading">
        <p>${escapeHTML(label)}</p>
        <span>${pageCount} ${escapeHTML(countLabel)}</span>
      </header>
      <div class="case-pdf-grid">${items}</div>
    </section>`;
  }

  function renderGalleryPdfEvidence(project, label = "08 / PROJECT RECORD") {
    return renderPdfEvidence(project, {
      label,
      countLabel: "PROJECT RECORD",
      className: "gallery-pdf-evidence",
      ariaLabel: "Gallery Flowers project record",
    }).replaceAll("case-pdf-grid", "gallery-pdf-grid").replaceAll("case-pdf-page", "gallery-pdf-page");
  }

  function renderGalleryStory({ project, proofs, process, journey, resultProject, reviewNotes, live }) {
    const blocks = project.galleryBlocks;
    const image = (block, className) => picture(
      window.PORTFOLIO_DATA.imageSets[block.image],
      block.alt,
      className,
      "50% 50%",
    );
    const objectiveItems = blocks.objectives.points.map(([number, title, detail]) => (
      `<article><span>${escapeHTML(number)}</span><strong>${escapeHTML(title)}</strong><p>${escapeHTML(detail)}</p></article>`
    )).join("");

    return `<section class="case-story case-story--gallery">
      <section class="gallery-editorial gallery-editorial--statement">
        <div class="gallery-editorial__rail">
          <p>${escapeHTML(blocks.positioning.label)}</p>
          <span>THE CENTRAL IDEA</span>
        </div>
        <div class="gallery-editorial__copy">
          <h2>${escapeHTML(blocks.positioning.title)}</h2>
          ${galleryPair(blocks.positioning.en, blocks.positioning.ko)}
        </div>
      </section>

      ${renderGalleryPdfEvidence(project, "02 / PROJECT RECORD")}

      <section class="gallery-objectives">
        <header>
          <div><p>${escapeHTML(blocks.objectives.label)}</p><h2>${escapeHTML(blocks.objectives.title)}</h2></div>
          <span>FOUR CONDITIONS TO REFRAME</span>
        </header>
        <div class="gallery-objectives__grid">${objectiveItems}</div>
      </section>

      <section class="gallery-editorial gallery-editorial--identity">
        <div class="gallery-editorial__copy">
          <p class="gallery-editorial__label">${escapeHTML(blocks.identity.label)}</p>
          <h2>${escapeHTML(blocks.identity.title)}</h2>
          ${galleryPair(blocks.identity.en, blocks.identity.ko)}
          ${galleryPair(blocks.identity.noteEn, blocks.identity.noteKo, "gallery-pair--note")}
        </div>
        <figure class="gallery-editorial__visual">${image(blocks.identity, "gallery-editorial__image")}</figure>
      </section>

      <section class="gallery-editorial gallery-editorial--fnb">
        <div class="gallery-editorial__visual gallery-editorial__visual--wide">${image(blocks.fnb, "gallery-editorial__image")}</div>
        <div class="gallery-editorial__copy">
          <p class="gallery-editorial__label">${escapeHTML(blocks.fnb.label)}</p>
          <h2>${escapeHTML(blocks.fnb.title)}</h2>
          ${galleryPair(blocks.fnb.en, blocks.fnb.ko)}
          <ul class="gallery-detail-list">
            <li><strong>Signature drinks</strong><span>시그니처 음료</span></li>
            <li><strong>Tea-based menu</strong><span>티 베이스 메뉴</span></li>
            <li><strong>Emotional dessert sets</strong><span>감성을 담은 디저트 세트</span></li>
            <li><strong>Viral & kids menu</strong><span>바이럴 메뉴 / 키즈 메뉴</span></li>
          </ul>
        </div>
      </section>

      <section class="gallery-editorial gallery-editorial--experience">
        <div class="gallery-editorial__copy">
          <p class="gallery-editorial__label">${escapeHTML(blocks.experience.label)}</p>
          <h2>${escapeHTML(blocks.experience.title)}</h2>
          ${galleryPair(blocks.experience.en, blocks.experience.ko)}
        </div>
        <figure class="gallery-editorial__visual">${image(blocks.experience, "gallery-editorial__image")}</figure>
      </section>

      <section class="gallery-editorial gallery-editorial--digital">
        <div class="gallery-editorial__visual gallery-editorial__visual--tall">${image(blocks.digital, "gallery-editorial__image")}</div>
        <div class="gallery-editorial__copy">
          <p class="gallery-editorial__label">${escapeHTML(blocks.digital.label)}</p>
          <h2>${escapeHTML(blocks.digital.title)}</h2>
          ${galleryPair(blocks.digital.en, blocks.digital.ko)}
          <div class="gallery-flow" aria-label="Digital channel flow">
            <span>PARTNERSHIP</span><b>→</b><span>SNS CONTENT</span><b>→</b><span>NAVER PLACE</span><b>→</b><span>SEASONAL PROMOTION</span>
          </div>
        </div>
      </section>

      <section class="gallery-extension">
        <header><p>${escapeHTML(blocks.extension.label)}</p><span>INFLOW + STAY + RETURN</span></header>
        <div class="gallery-extension__grid">
          <div><h2>${escapeHTML(blocks.extension.title)}</h2></div>
          ${galleryPair(blocks.extension.en, blocks.extension.ko)}
        </div>
      </section>

      <section class="case-process">
        <div class="case-process-copy">
          <p>09 / PROCESS PROOF</p>
          <h2>${escapeHTML(process.label)}</h2>
        </div>
        ${picture(process.proof.image, process.proof.alt, "case-process-media", process.proof.position)}
      </section>

      ${journey ? `<section class="case-journey" aria-label="Experience return loop">
        <header><p>10 / THE RETURN LOOP</p><span>OFFLINE EXPERIENCE EXTENSION</span></header>
        <div class="case-journey__grid">${journey}</div>
      </section>` : ""}

      <article class="case-contribution">
        <p>11 / THE VALUE</p>
        ${bilingual({ ...project, copy: { ...project.copy, en: { ...project.copy?.en, result: resultProject } } }, "result")}
      </article>
      ${reviewNotes ? `<aside class="case-review-note"><p>EDITORIAL CHECK</p><ul>${reviewNotes}</ul></aside>` : ""}
      ${live}
    </section>`;
  }

  function heroMedia(project) {
    if (project.heroVideo?.provider === "youtube") {
      const { id, start = 0, end = 20 } = project.heroVideo;
      const source = `https://www.youtube-nocookie.com/embed/${encodeURIComponent(id)}?autoplay=1&mute=1&controls=0&loop=1&playlist=${encodeURIComponent(id)}&playsinline=1&rel=0&modestbranding=1&start=${start}&end=${end}`;
      const isLocalFile = window.location.protocol === "file:";
      return `<div class="case-hero-media case-hero-media--video">
        ${picture(project.image, `${project.title} project`, "case-hero-poster", "50% 50%", true)}
        ${isLocalFile
          ? `<span class="case-hero-video-label">20S FILM PREVIEW / OPEN ON PUBLISHED SITE</span>`
          : `<iframe src="${escapeHTML(source)}" title="${escapeHTML(project.title)} campaign preview" allow="autoplay; encrypted-media" loading="eager" tabindex="-1"></iframe>`}
      </div>`;
    }
    return picture(project.image, `${project.title} project`, "case-hero-media", "50% 50%", true);
  }

  function renderCase(sourceProject, chapter = "", originCategory = "") {
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
    const routeContext = window.PortfolioNavigation?.getRouteContext();
    const hasHomeOrigin = Boolean(
      routeContext?.origin === "home"
      && routeContext.homeEntryId
      && routeContext.caseDepth > 0
    );
    const backCategory = originCategory || "";
    const backRoute = hasHomeOrigin
      ? routeContext.homeHash
      : window.PortfolioRouter.toHash(backCategory
        ? { name: "works", category: backCategory }
        : { name: "works" });
    const backLabel = hasHomeOrigin ? "BACK TO CATEGORY" : "BACK TO WORKS";
    const reviewNotes = (project.reviewNotes || []).map((note) => (
      `<li>${escapeHTML(note)}</li>`
    )).join("");
    const promptNotes = (project.promptNotes || []).map((note, noteIndex) => (
      `<article class="prompt-note">
        <span>${String(noteIndex + 1).padStart(2, "0")} / ${escapeHTML(note.label)}</span>
        <p>${escapeHTML(window.PortfolioLocale?.get?.() === "ko" ? note.ko : note.en)}</p>
      </article>`
    )).join("");
    const client = project.client || "Client / confirm";
    const resultProject = project.result || project.contribution || "Result / confirm";
    const scopeItems = project.scopeItems?.map(([title, detail]) => (
      `<article><strong>${escapeHTML(title)}</strong><span>${escapeHTML(detail)}</span></article>`
    )).join("") || "";
    const journey = project.journey?.map(([label, title, detail]) => (
      `<article><p>${escapeHTML(label)}</p><strong>${escapeHTML(title)}</strong><span>${escapeHTML(detail)}</span></article>`
    )).join("") || "";

    return `<article
      class="case-view case-view--${escapeHTML(project.category)} case-view--mode-${escapeHTML(project.detailMode)}${project.slug === "gallery-flowers" ? " case-view--gallery" : ""}"
      data-project="${escapeHTML(project.slug)}"
      data-chapter="${escapeHTML(chapter)}"
      data-category="${escapeHTML(project.category)}"
      data-detail-mode="${escapeHTML(project.detailMode)}"
    >
      <header class="case-nav">
        <span class="case-nav__context">${escapeHTML(categoryLabel)} / ${String(index + 1).padStart(2, "0")}</span>
        <a href="${escapeHTML(backRoute)}" data-close-case>BACK TO WORKS</a>
        <a href="mailto:leejihye210@gmail.com">CONTACT ↗</a>
        <a class="case-nav__close" href="${escapeHTML(backRoute)}" data-close-case aria-label="Close project">
          <span aria-hidden="true">×</span>
        </a>
      </header>

      <section class="case-hero" aria-labelledby="case-title">
        ${heroMedia(project)}
        <div class="case-hero-shade" aria-hidden="true"></div>
        <div class="case-hero-copy">
          <p>${escapeHTML(project.role)}</p>
          <h1 id="case-title">${escapeHTML(project.title)}</h1>
          ${project.heroSubtitle ? `<em>${escapeHTML(project.heroSubtitle)}</em>` : ""}
          <span>${escapeHTML(project.year)}</span>
        </div>
      </section>

      <section class="case-intro">
        <div class="case-intro__lead">
          <p class="case-kicker">PROJECT POINT OF VIEW</p>
          ${bilingual(project, "thesis", "case-thesis")}
        </div>
        <dl class="case-meta">
          <div><dt>Client</dt><dd>${escapeHTML(client)}</dd></div>
          <div><dt>Year</dt><dd>${escapeHTML(project.year)}</dd></div>
          <div><dt>Role</dt><dd>${escapeHTML(project.role)}</dd></div>
          <div><dt>Scope</dt><dd>${escapeHTML(project.scope)}</dd></div>
        </dl>
      </section>

      ${scopeItems ? `<section class="case-scope" aria-label="Project scope">
        <header><p>PROJECT SCOPE</p><span>${String(project.scopeItems.length).padStart(2, "0")} WORKSTREAMS</span></header>
        <div class="case-scope__grid">${scopeItems}</div>
      </section>` : ""}

      ${project.galleryBlocks
        ? renderGalleryStory({ project, proofs, process, journey, resultProject, reviewNotes, live })
        : `<section class="case-story">
          <div class="case-decision">
            <article>
              <p>01 / ${escapeHTML(project.challengeLabel || "THE CHALLENGE")}</p>
              ${bilingual(project, "problem")}
            </article>
            <article>
              <p>02 / ${escapeHTML(project.strategyLabel || "THE STRATEGY / MASTER PLAN")}</p>
              ${bilingual(project, "strategy")}
            </article>
          </div>

          ${project.pdfPages ? renderPdfEvidence(project, {
            label: "03 / PROJECT RECORD",
            countLabel: "PDF PAGES",
            className: "case-pdf-evidence--samsung",
            ariaLabel: "Samsung Display EBC project record",
          }) : `<section class="case-evidence" aria-label="Selected outputs">
            <header class="case-section-heading">
              <p>SELECTED OUTPUTS</p>
              <span>${String(project.proofs.length).padStart(2, "0")} PROOFS</span>
            </header>
            <div class="case-evidence-grid">${proofs}</div>
          </section>`}

          <section class="case-process">
            <div class="case-process-copy">
              <p>03 / ${escapeHTML(project.systemLabel || "PROCESS PROOF")}</p>
              <h2>${escapeHTML(process.label)}</h2>
            </div>
            ${picture(
              process.proof.image,
              process.proof.alt,
              "case-process-media",
              process.proof.position,
            )}
          </section>

          ${journey ? `<section class="case-journey" aria-label="Experience return loop">
            <header><p>04 / THE RETURN LOOP</p><span>OFFLINE EXPERIENCE EXTENSION</span></header>
            <div class="case-journey__grid">${journey}</div>
          </section>` : ""}

          ${promptNotes ? `<section class="case-prompt-notes"><header><p>04 / PROMPT NOTES</p><span>SELECTED DIRECTION</span></header><div>${promptNotes}</div></section>` : ""}

          <article class="case-contribution">
            <p>${promptNotes || journey ? "05" : "04"} / THE VALUE</p>
            ${bilingual({ ...project, copy: { ...project.copy, en: { ...project.copy?.en, result: resultProject } } }, "result")}
          </article>
          ${reviewNotes ? `<aside class="case-review-note"><p>EDITORIAL CHECK</p><ul>${reviewNotes}</ul></aside>` : ""}
          ${live}
        </section>`}

      <footer class="case-pagination">
        <a href="${escapeHTML(entryRoute(previous, project.category))}">
          <span>PREVIOUS</span><strong>← ${escapeHTML(window.PORTFOLIO_DATA.projects[previous.slug].title)}</strong>
        </a>
        <a href="${escapeHTML(backRoute)}" data-back-category>
          ${escapeHTML(backLabel)}
        </a>
        <a href="${escapeHTML(entryRoute(next, project.category))}">
          <span>NEXT</span><strong>${escapeHTML(window.PORTFOLIO_DATA.projects[next.slug].title)} →</strong>
        </a>
      </footer>
    </article>`;
  }

  function indexShell(className, eyebrow, title, intro, body, options = {}) {
    const compactNav = options.nav === "compact";
    return `<article class="${escapeHTML(className)} index-view" tabindex="-1">
      <nav class="index-nav${compactNav ? " index-nav--compact" : ""}" aria-label="Index navigation">
        <a href="mailto:leejihye210@gmail.com">CONTACT ↗</a>
        <a class="index-nav__close" href="#/" aria-label="Close and return home">
          <span>HOME</span><b aria-hidden="true">×</b>
        </a>
      </nav>
      <header class="index-hero">
        <p class="index-eyebrow">${escapeHTML(eyebrow)}</p>
        <h1>${escapeHTML(title)}</h1>
        ${intro ? `<p class="index-intro">${escapeHTML(intro)}</p>` : ""}
      </header>
      ${body}
    </article>`;
  }

  function renderWorkRow(item, category, index) {
    const project = window.PORTFOLIO_DATA.projects[item.slug];
    const title = item.title || project?.title || item.slug;
    const year = project?.year || "";
    const route = item.kind === "archive"
      ? { name: item.routeName || "brand-archive" }
      : { name: "work", slug: item.slug };
    if (item.kind !== "archive") {
      if (item.chapter) route.chapter = item.chapter;
      route.from = category.id;
    }
    const isExternal = item.kind === "external";
    const href = isExternal ? safeExternalURL(item.externalUrl) : window.PortfolioRouter.toHash(route);
    const attributes = isExternal ? ' target="_blank" rel="noopener noreferrer"' : "";
    const image = window.PORTFOLIO_DATA.imageSets[item.previewKey];
    return `<a class="works-row" href="${escapeHTML(href)}"${attributes}>
      <span class="works-row__number">${String(index + 1).padStart(2, "0")}</span>
      ${picture(image, `${title} preview`, "works-thumb")}
      <strong>${escapeHTML(title)}</strong>
      <em>${escapeHTML(item.role)}</em>
      <i>${escapeHTML(year)}</i>
      <b aria-hidden="true">↗</b>
    </a>`;
  }

  function renderWorks(activeCategory = "") {
    const categories = window.PORTFOLIO_DATA.categories;
    const visibleCategories = activeCategory
      ? categories.filter((category) => category.id === activeCategory)
      : categories;
    const tabs = [
      { id: "", label: "ALL WORKS" },
      ...categories.map(({ id, label }) => ({ id, label })),
    ].map((tab) => `<a class="works-tab${tab.id === activeCategory ? " is-active" : ""}" href="${escapeHTML(window.PortfolioRouter.toHash({ name: "works", category: tab.id }))}" aria-current="${tab.id === activeCategory ? "page" : "false"}">${escapeHTML(tab.label)}</a>`).join("");
    const groups = visibleCategories.map((category) => {
      const rows = category.entries
        .map((item, index) => renderWorkRow(item, category, index))
        .join("");
      let archive = "";
      if (category.id === "branding" && !category.entries.some((item) => item.kind === "archive")) {
        archive = `<a class="works-archive-link" href="#/archive/brand">
          <span>SELECTED PRACTICE</span>
          <strong>Brand Archive</strong>
          <b aria-hidden="true">↗</b>
        </a>`;
      }
      if (category.id === "ai" && !category.entries.some((item) => item.kind === "archive")) {
        archive = `<a class="works-archive-link" href="#/archive/ai">
          <span>ADDITIONAL STUDIES</span>
          <strong>AI Campaign Archive</strong>
          <b aria-hidden="true">↗</b>
        </a>`;
      }
      if (category.id === "space" && !category.entries.some((item) => item.kind === "archive")) {
        archive = `<a class="works-archive-link" href="#/archive/btl">
          <span>FIELD CAPABILITY</span>
          <strong>BTL Archive</strong>
          <b aria-hidden="true">↗</b>
        </a>`;
      }
      return `<section class="works-group works-group--${escapeHTML(category.id)}">
        <header class="works-group__header">
          <p>${String(window.PORTFOLIO_DATA.categories.indexOf(category) + 1).padStart(2, "0")}</p>
          <h2>${escapeHTML(category.label)}</h2>
        </header>
        <div class="works-group__rows">${rows}${archive}</div>
      </section>`;
    }).join("");
    return indexShell(
      "works-view",
      "WORKS INDEX / 2026",
      "Works Index",
      "A fast scan across brand systems, AI campaigns, and spatial experience.",
      `<nav class="works-tabs" aria-label="Works categories">${tabs}</nav><div class="works-groups">${groups}</div>`,
    );
  }

  function renderProfile() {
    const profile = window.PORTFOLIO_DATA.profile;
    const stages = profile.stages.map((stage, index) => (
      `<article class="career-step">
        <div class="career-step__marker">
          <span>${String(index + 1).padStart(2, "0")}</span>
          <time>${escapeHTML(stage.period)}</time>
        </div>
        <div class="career-step__story">
          <h2>${escapeHTML(stage.title)}</h2>
          <p class="career-step__place">${escapeHTML(stage.place)}</p>
          <p>${escapeHTML(stage.description)}</p>
        </div>
      </article>`
    )).join("");
    return indexShell(
      "profile-view",
      "CAREER / ACCUMULATED PRACTICE",
      "Experience built the foundation. AI expands the range.",
      "",
      `<section class="profile-intro">
        <p>${escapeHTML(profile.intro)}</p>
        <span>PROJECTS PROVE THE JUDGMENT.</span>
      </section>
      <section class="career-timeline" aria-label="Career timeline">${stages}</section>`,
    );
  }

  function renderAIArchive() {
    const cards = window.PORTFOLIO_DATA.aiArchive.map((item, index) => {
      const href = safeExternalURL(item.url);
      const number = item.number || String(index + 1).padStart(2, "0");
      const tags = (item.tags || []).slice(0, 4).map((tag) => (
        `<span>${escapeHTML(tag)}</span>`
      )).join("");
      return `<a
        class="ai-work-card ai-work-card--${escapeHTML(item.tone || "study")}"
        href="${escapeHTML(href)}"
        target="_blank"
        rel="noopener noreferrer"
        style="--card-accent:${escapeHTML(item.accent || "#7fffe0")}"
      >
        <div class="ai-work-card__topline">
          <span class="ai-work-card__number">${escapeHTML(number)}</span>
          <span class="ai-work-card__type">${escapeHTML(item.type || "WEB")}</span>
        </div>
        <div class="ai-work-card__media">
          ${looseImage(item.screenshot, `${item.title} preview`, "ai-work-card__image", item.imagePosition || "50% 50%", true)}
          <span class="ai-work-card__open">${item.type === "YOUTUBE" ? "PLAY" : "OPEN"} ↗</span>
        </div>
        <div class="ai-work-card__body">
          <p>${escapeHTML(item.category)}</p>
          <h2>${escapeHTML(item.title)}</h2>
          <em>${escapeHTML(item.description)}</em>
          <div class="ai-work-card__tags">${tags}</div>
        </div>
        <strong class="ai-work-card__word">${escapeHTML(item.visualWord || "AI Campaign Study")}</strong>
      </a>`;
    }).join("");
    return `<article class="index-view archive-view archive-view--ai" tabindex="-1">
      <nav class="ai-launcher-nav" aria-label="AI archive navigation">
        <a href="mailto:leejihye210@gmail.com">CONTACT ↗</a>
        <a class="ai-launcher-nav__home" href="#/">HOME <span aria-hidden="true">×</span></a>
      </nav>
      <header class="ai-launcher-hero">
        <div>
          <p>AI+ / CAMPAIGN STUDIES</p>
          <h1>AI Campaign Archive</h1>
        </div>
        <span>카드 전체를 클릭하면 각 라이브 웹, 영상, 아카이브가 새 탭으로 바로 열립니다.</span>
      </header>
      <section class="ai-work-grid" aria-label="AI campaign cards">
        ${cards}
      </section>
    </article>`;
  }

  function renderBrandArchive() {
    const rows = [
      ["sk-bullsone", "SK Lubricants x Bullsone", "2018", "Service-center identity / promotion system", "sk-bullsone"],
      ["hurom-retail", "Hurom Retail", "2016-2020", "Retail POP / field execution", "btl-hurom"],
      ["field-archive", "Additional Field Work", "2016-2020", "Retail / POP / production coordination", "btl-field-system"],
    ].map(([slug, title, year, role, previewKey], index) => {
      const project = window.PORTFOLIO_DATA.projects[slug];
      const image = window.PORTFOLIO_DATA.imageSets[previewKey];
      const href = project ? window.PortfolioRouter.toHash({ name: "work", slug, from: "branding" }) : "";
      const tag = project ? "a" : "article";
      const attributes = project ? ` href="${escapeHTML(href)}"` : "";
      return `<${tag} class="archive-row archive-row--visual"${attributes}>
        <span>${String(index + 1).padStart(2, "0")}</span>
        ${picture(image, title, "archive-thumb")}
        <span class="archive-row__copy"><strong>${escapeHTML(title)}</strong><em>${escapeHTML(role)}</em></span>
        <time>${escapeHTML(year)}</time>
        <b aria-hidden="true">${project ? "↗" : "—"}</b>
      </${tag}>`;
    }).join("");
    return indexShell(
      "archive-view archive-view--brand",
      "BRANDING+ / SELECTED PRACTICE",
      "Brand Archive",
      "Short-form evidence of brand systems that move from identity into space, content, and operation.",
      `<section class="archive-list archive-list--brand">${rows}</section>`,
      { nav: "compact" },
    );
  }

  function renderBTLArchive() {
    const rows = window.PORTFOLIO_DATA.btlArchive.map((item, index) => (
      `<figure class="archive-row archive-row--visual">
        <span>${String(index + 1).padStart(2, "0")}</span>
        ${picture(item.image, item.title, "archive-thumb")}
        <figcaption>
          <strong>${escapeHTML(item.title)}</strong>
          <em>${escapeHTML(item.role)}</em>
        </figcaption>
      </figure>`
    )).join("");
    return indexShell(
      "archive-view archive-view--btl",
      "SPACE BTL+ / FIELD CAPABILITY",
      "BTL Works Archive",
      "Selected evidence of retail POP, exhibition operation, and repeatable field execution.",
      `<section class="archive-list archive-list--btl">${rows}</section>`,
      { nav: "compact" },
    );
  }

  function renderNotFound() {
    return indexShell(
      "not-found-view",
      "404",
      "Project not found",
      "",
      '<a class="index-return" href="#/works">BACK TO ALL WORKS →</a>',
    );
  }

  function render(route, mount) {
    if (route.name === "work") {
      const project = window.PORTFOLIO_DATA.projects[route.slug];
      if (!project) {
        mount.innerHTML = '<p class="case-not-found">Project not found.</p>';
        return false;
      }
      if (project.detailMode === "archive") {
        mount.innerHTML = renderBrandArchive();
        return true;
      }
      if (route.chapter && !hasChapter(project, route.chapter)) {
        mount.innerHTML = `<section class="case-not-found">
          <a href="${escapeHTML(window.PortfolioRouter.toHash({ name: "work", slug: project.slug }))}">← ${escapeHTML(project.title)}</a>
          <p>Project chapter not found.</p>
        </section>`;
        return false;
      }
      mount.innerHTML = renderCase(project, route.chapter || "", route.from || "");
      return true;
    }
    if (route.name === "works") mount.innerHTML = renderWorks(route.category || "");
    else if (route.name === "profile") mount.innerHTML = renderProfile();
    else if (route.name === "brand-archive") mount.innerHTML = renderBrandArchive();
    else if (route.name === "ai-archive") mount.innerHTML = renderAIArchive();
    else if (route.name === "btl-archive") mount.innerHTML = renderBTLArchive();
    else mount.innerHTML = renderNotFound();
    return true;
  }

  window.PortfolioViews = { render };
})();
