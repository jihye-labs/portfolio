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

  function evidenceCard(item, index) {
    const [key, alt, caption, position = "50% 50%"] = item;
    const image = window.PORTFOLIO_DATA.imageSets[key];
    const ratio = image.width / image.height;
    const modifier = image.height > image.width * 3
      ? "strip"
      : ratio > 1.55
        ? "wide"
        : ratio < 0.85
          ? "tall"
          : "standard";
    return `<figure class="grouped-evidence-card grouped-evidence-card--${modifier}">
      ${picture(image, alt, "grouped-evidence-card__media", position)}
      <figcaption><span>${String(index + 1).padStart(2, "0")}</span>${escapeHTML(caption)}</figcaption>
    </figure>`;
  }

  function renderEvidenceGroups(project) {
    const groups = project.evidenceGroups.map((group) => {
      const items = group.items
        .map((item, itemIndex) => evidenceCard(item, itemIndex))
        .join("");
      return `<section class="grouped-evidence-section">
        <header>
          <p>${escapeHTML(group.eyebrow)}</p>
          <div>
            <h2>${escapeHTML(group.title)}</h2>
            <span>${escapeHTML(group.description)}</span>
          </div>
        </header>
        <div class="grouped-evidence-grid">${items}</div>
      </section>`;
    }).join("");
    const total = project.evidenceGroups.reduce((sum, group) => sum + group.items.length, 0);
    return `<section class="case-evidence case-evidence--grouped" aria-label="Selected outputs">
      <header class="case-section-heading">
        <p>SELECTED OUTPUTS</p>
        <span>${String(total).padStart(2, "0")} PROOFS / GROUPED</span>
      </header>
      ${groups}
    </section>`;
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

  function renderAllDayFitCase({
    project,
    chapter,
    categoryLabel,
    index,
    previous,
    next,
    backRoute,
    backLabel,
  }) {
    const asset = (file) => `./assets/alldayfit-site/${file}`;
    const sectionLinks = [
      ["adf-market", "01 Market"],
      ["adf-solution", "02 Solution"],
      ["adf-gtm", "03 GTM"],
      ["adf-scale", "04 Scale"],
    ].map(([id, label]) => (
      `<a href="#${escapeHTML(id)}" data-label="${escapeHTML(label)}"><span></span></a>`
    )).join("");

    return `<article
      class="case-view case-view--branding case-view--mode-alldayfit"
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

      <div class="alldayfit-case">
        <nav class="alldayfit-dotnav" aria-label="AllDayFit section navigation">${sectionLinks}</nav>

        <section class="alldayfit-hero" aria-labelledby="alldayfit-title">
          <div class="alldayfit-hero__inner">
            <p class="alldayfit-eyebrow">New Business Case Study</p>
            <div class="alldayfit-hero__grid">
              <div class="alldayfit-hero__type">
                <h1 id="alldayfit-title"><span>All Day</span><span>Fit<b>.</b></span></h1>
              </div>
              <figure class="alldayfit-hero__photo">
                <img src="${escapeHTML(asset("lookbook-3.jpg"))}" alt="AllDayFit concept lookbook, white tech polo setup" loading="eager" fetchpriority="high" decoding="async">
              </figure>
            </div>
            <p class="alldayfit-hero__sub">Ten-mile wear 신사업 검토</p>
            <p class="alldayfit-hero__desc">업무, 운동, 여가를 하루 안에서 오가는 사람들을 위한 한국형 텐마일웨어 카테고리. Y사가 보유한 소재와 생산 역량이 소비자 브랜드 제안으로 확장될 수 있는지 시장, 사업성, 타깃, 비주얼 증거의 순서로 검토했습니다.</p>
            <dl class="alldayfit-meta">
              <div><dt>Client</dt><dd>Y-company / Confidential<br>New Business Review</dd></div>
              <div><dt>Year</dt><dd>${escapeHTML(project.year)}</dd></div>
              <div><dt>Role</dt><dd>${escapeHTML(project.role)}</dd></div>
              <div><dt>Scope</dt><dd>${escapeHTML(project.scope)}</dd></div>
            </dl>
          </div>
        </section>

        <section class="alldayfit-context">
          <div class="alldayfit-container alldayfit-container--narrow">
            <p class="alldayfit-eyebrow">Brief</p>
            <h2>왜 이 리뷰가 필요했나</h2>
            <p class="alldayfit-body-lg">Y사는 메리노울 등 고기능성 소재 기술과 자체 생산 시설을 갖추고 있었지만, 이 역량을 소비자에게 직접 전달하는 브랜드 사업은 아직 명확히 정리되어 있지 않았습니다. 보유한 생산 기반과 소재 역량을 어느 카테고리로 발산할 것인가, 그리고 그것이 실제 시장에서 구매 이유가 될 수 있는가가 핵심 질문이었습니다.</p>
            <p class="alldayfit-pull">“이 시점에, 이 역량으로, 어떤 신사업이 성립하는가?”</p>
          </div>
        </section>

        <section class="alldayfit-part" id="adf-market">
          <span class="alldayfit-watermark" aria-hidden="true">01</span>
          <div class="alldayfit-container">
            <p class="alldayfit-eyebrow">01 / Market</p>
            <h2>기회가 실재하는가</h2>
            <div class="alldayfit-text">
              <p>하이브리드 근무, 웰니스 관심 증가, 일상복과 기능성 의류의 경계가 흐려지는 변화는 기능성 의류 수요가 커지고 있다는 신호였습니다. 하지만 신호만으로 사업을 시작할 수는 없습니다. 실제로 확인해야 했던 것은 포지셔닝 맵 위의 빈 공간이었습니다.</p>
              <p>룰루레몬류의 고기능·고가 영역과 무신사류의 저가·저기능 영역 사이에서, 고기능이면서도 접근 가능한 가격대의 자리는 상대적으로 비어 있었습니다. 이 공백이 단순한 트렌드가 아니라 가격 장벽, 소재 전문성, 생산 구조의 차이에서 발생한 구조적 빈틈인지 확인하는 것이 첫 번째 판단이었습니다.</p>
            </div>
            <div class="alldayfit-slide-grid">
              <figure class="alldayfit-slide">
                <img src="${escapeHTML(asset("slide-market.jpg"))}" alt="Market size and growth trend analysis slide" loading="eager" decoding="async">
                <figcaption><span></span>시장 규모와 성장 트렌드</figcaption>
              </figure>
              <figure class="alldayfit-slide">
                <img src="${escapeHTML(asset("slide-competitive.jpg"))}" alt="Competitive positioning map analysis slide" loading="eager" decoding="async">
                <figcaption><span></span>경쟁 구도 분석과 포지셔닝 맵</figcaption>
              </figure>
            </div>
          </div>
        </section>

        <section class="alldayfit-part alldayfit-part--alt" id="adf-solution">
          <span class="alldayfit-watermark" aria-hidden="true">02</span>
          <div class="alldayfit-container alldayfit-container--narrow">
            <p class="alldayfit-eyebrow">02 / Solution</p>
            <h2>왜 이 자리인가</h2>
            <div class="alldayfit-text">
              <p>빈 공간을 확인한 뒤의 질문은 Y사가 그 자리를 차지할 명분이 있는가였습니다. 한국인 체형에 맞춘 패턴, 자체 생산으로 확보 가능한 원가 절감, 고기능 소재에 대한 이해는 아무 포지션에서나 우위가 아니라 고기능·중가라는 자리에서 가장 설득력 있게 작동했습니다.</p>
            </div>
            <p class="alldayfit-pull alldayfit-pull--accent">“텐마일웨어”라는 이름도 의도적 선택이었습니다.<br>업무, 운동, 여가를 넘나드는 하루의 동선을 한 벌로 커버한다는 약속이 애슬레저나 스트리트 같은 기존 카테고리 프레임보다 더 정확하게 문제를 정의한다고 판단했습니다.</p>
          </div>
        </section>

        <section class="alldayfit-part" id="adf-gtm">
          <span class="alldayfit-watermark" aria-hidden="true">03</span>
          <div class="alldayfit-container">
            <p class="alldayfit-eyebrow">03 / Go-to-Market</p>
            <h2>누구에게, 어떻게 먼저 보여줄 것인가</h2>
            <div class="alldayfit-gtm">
              <div class="alldayfit-text">
                <p>페르소나는 스타일 무드보드가 아니라 페인포인트 지도로 다뤘습니다. 구김, 땀 냄새, 활동적이면서도 전문적으로 보여야 하는 이미지 같은 구체적 불편이 항균, 초경량, 구김 방지 같은 실제 소재 스펙과 연결되어야 했습니다.</p>
                <p>채널 순서 역시 전략적 판단이 필요했습니다. 마진과 고객 데이터를 직접 확보할 수 있는 자사몰을 먼저 검증대로 삼고, 신뢰도가 필요한 편집 플랫폼 입점은 그다음 단계로 미루는 구조를 제안했습니다. 처음부터 모든 채널을 여는 대신, 학습과 확장의 순서를 설계했습니다.</p>
              </div>
              <figure class="alldayfit-slide alldayfit-slide--persona">
                <img src="${escapeHTML(asset("slide-persona.jpg"))}" alt="Target persona analysis slide" loading="eager" decoding="async">
                <figcaption><span></span>타깃 페르소나와 제품 스펙 연결</figcaption>
              </figure>
            </div>
          </div>
        </section>

        <section class="alldayfit-lookbook">
          <div class="alldayfit-container">
            <p class="alldayfit-eyebrow">Concept Lookbook</p>
            <h2>포지셔닝을 눈으로 확인하기</h2>
            <p class="alldayfit-body-lg">고기능·중가, 미니멀×기능성이라는 문서 위의 포지셔닝이 실제로 설득력 있는 이미지로 번역되는지 확인하기 위해 AI 이미지 생성으로 컨셉 룩북을 제작했습니다. 이 과정은 단순히 예쁜 이미지를 만드는 것이 아니라, “입고 싶은 옷인가”와 “브랜드 제안으로 보이는가”를 검증하는 시각적 의사결정 단계였습니다.</p>
          </div>
          <div class="alldayfit-carousel" aria-label="AllDayFit concept lookbook">
            ${["lookbook-1.jpg", "lookbook-2.jpg", "lookbook-3.jpg", "lookbook-4.jpg"].map((file, lookIndex) => {
              const captions = [
                "아이보리 폴로와 플리츠 스커트",
                "네이비 니트 폴로 셋업",
                "화이트 테크 폴로 셋업",
                "스트라이프 크롭 니트 셋업",
              ];
              return `<figure class="alldayfit-look-card">
                <img src="${escapeHTML(asset(file))}" alt="${escapeHTML(`AllDayFit concept lookbook ${lookIndex + 1}`)}" loading="eager" decoding="async">
                <figcaption><span>${String(lookIndex + 1).padStart(2, "0")}</span>${escapeHTML(captions[lookIndex])}</figcaption>
              </figure>`;
            }).join("")}
          </div>
        </section>

        <section class="alldayfit-part alldayfit-part--alt" id="adf-scale">
          <span class="alldayfit-watermark" aria-hidden="true">04</span>
          <div class="alldayfit-container">
            <p class="alldayfit-eyebrow">04 / Scale</p>
            <h2>다음 판을 어떻게 키울 것인가</h2>
            <div class="alldayfit-text">
              <p>AI 트렌드 예측 시스템은 부가 기능이 아니라, 브랜드가 매 시즌 감에만 의존하지 않기 위한 장치로 검토했습니다. 그래서 시스템 설계에 앞서 구조방정식(AMOS)으로 디자인 독창성, 인지된 유용성 같은 요인이 실제 수용의도에 유의미하게 영향을 미치는지부터 확인했습니다.</p>
            </div>
            <figure class="alldayfit-slide alldayfit-slide--amos">
              <img src="${escapeHTML(asset("slide-amos.jpg"))}" alt="AMOS analysis result slide for AI acceptance intention" loading="eager" decoding="async">
              <figcaption><span></span>AI 수용의도 분석과 구조방정식(AMOS) 결과</figcaption>
            </figure>
            <div class="alldayfit-text">
              <p>라이선스 검토는 자체 브랜드가 실패했을 때의 대안이 아니라 동시에 굴릴 수 있는 두 번째 트랙으로 제안했습니다. 일본의 기술·소재 라이선스 시장은 로열티 부담이 상대적으로 낮고, Y사의 자체 생산 역량과 궁합이 좋다는 점에서 리스크를 분산하면서도 생산 인프라를 활용할 수 있는 경로였습니다.</p>
            </div>
          </div>
        </section>

        <section class="alldayfit-reflection">
          <div class="alldayfit-container alldayfit-container--narrow">
            <p class="alldayfit-eyebrow">Reflection</p>
            <h2>이 프로젝트에서 남은 판단</h2>
            <div class="alldayfit-text">
              <p>시장 데이터와 경쟁 구도는 비교적 명확했습니다. 실제로 어려웠던 지점은 “포지셔닝이 옳다”는 판단과 “지금 이 조직이 그 포지션을 지속적으로 실행할 준비가 되어 있다”는 판단 사이의 간극을 가늠하는 일이었습니다.</p>
              <p>검증한 것은 시장 공백의 존재, 보유 자산과 포지션의 정합성, 페르소나 기반 제품 스펙의 논리적 연결이었습니다. 실제 소재 원가, 유통 마진, 라이선스 파트너사의 협상 의지처럼 숫자와 계약으로 확정해야 하는 부분은 다음 단계 실사에서 확인해야 할 영역으로 남겼습니다.</p>
            </div>
          </div>
        </section>
      </div>

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

    if (project.detailMode === "alldayfit") {
      return renderAllDayFitCase({
        project,
        chapter,
        categoryLabel,
        index,
        previous,
        next,
        backRoute,
        backLabel,
      });
    }

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
          }) : project.evidenceGroups ? renderEvidenceGroups(project) : `<section class="case-evidence" aria-label="Selected outputs">
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
      const isVideo = item.type === "VIDEO" && item.video;
      const href = isVideo ? "" : safeExternalURL(item.url);
      const number = item.number || String(index + 1).padStart(2, "0");
      const tags = (item.tags || []).slice(0, 4).map((tag) => (
        `<span>${escapeHTML(tag)}</span>`
      )).join("");
      const content = `
        <div class="ai-work-card__topline">
          <span class="ai-work-card__number">${escapeHTML(number)}</span>
          <span class="ai-work-card__type">${escapeHTML(item.type || "WEB")}</span>
        </div>
        <div class="ai-work-card__media">
          ${looseImage(item.screenshot, `${item.title} preview`, "ai-work-card__image", item.imagePosition || "50% 50%", true)}
          <span class="ai-work-card__open">${isVideo ? "PLAY VIDEO" : item.type === "YOUTUBE" ? "PLAY" : "OPEN PROJECT"} ↗</span>
        </div>
        <div class="ai-work-card__body">
          <p>${escapeHTML(item.category)}</p>
          <h2>${escapeHTML(item.title)}</h2>
          <em>${escapeHTML(item.description)}</em>
          <div class="ai-work-card__tags">${tags}</div>
        </div>
        <strong class="ai-work-card__word">${escapeHTML(item.visualWord || "AI Campaign Study")}</strong>`;
      if (isVideo) {
        return `<button
          class="ai-work-card ai-work-card--video ai-work-card--${escapeHTML(item.tone || "study")}"
          type="button"
          data-video-src="${escapeHTML(item.video)}"
          data-video-poster="${escapeHTML(item.screenshot)}"
          data-video-title="${escapeHTML(item.title)}"
          data-video-orientation="${escapeHTML(item.videoOrientation || "landscape")}"
          style="--card-accent:${escapeHTML(item.accent || "#7fffe0")}"
        >${content}</button>`;
      }
      return `<a
        class="ai-work-card ai-work-card--${escapeHTML(item.tone || "study")}"
        href="${escapeHTML(href)}"
        target="_blank"
        rel="noopener noreferrer"
        style="--card-accent:${escapeHTML(item.accent || "#7fffe0")}"
      >${content}</a>`;
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
          <span class="ai-launcher-hero__intro">각 PROJECT를 클릭하면 웹, 영상, 아카이브가 열립니다.</span>
        </div>
      </header>
      <section class="ai-work-grid" aria-label="AI campaign cards">
        ${cards}
      </section>
      <div class="ai-video-modal" data-ai-video-modal hidden>
        <div class="ai-video-modal__backdrop" data-ai-video-close></div>
        <div class="ai-video-modal__dialog" role="dialog" aria-modal="true" aria-label="AI video preview">
          <button class="ai-video-modal__close" type="button" data-ai-video-close aria-label="Close video">×</button>
          <p class="ai-video-modal__title" data-ai-video-title></p>
          <video class="ai-video-modal__player" data-ai-video-player controls playsinline preload="metadata"></video>
        </div>
      </div>
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
