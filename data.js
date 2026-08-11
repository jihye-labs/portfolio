(function () {
const imageMetadata = typeof window !== "undefined"
  ? window.PORTFOLIO_IMAGE_META
  : require("./assets/optimized/asset-meta.js");

function imageSet(key) {
  const dimensions = imageMetadata[key];
  if (!dimensions) throw new Error(`Missing image metadata for ${key}`);
  return {
    src: `./assets/optimized/${key}-1280.webp`,
    srcset: `./assets/optimized/${key}-480.webp 480w, ./assets/optimized/${key}-1280.webp 1280w`,
    width: dimensions.width,
    height: dimensions.height,
  };
}

function staticImage(src, width, height) {
  return { src, width, height };
}

function versionedStaticImage(src, width, height) {
  return staticImage(`${src}?v=20260811b`, width, height);
}

const imageKeys = [
  "hero-branding", "hero-ai", "hero-space",
  "gallery-flowers", "gallery-flowers-hero", "kd-navien-brand", "benzhi-life", "sk-bullsone",
  "elora", "elora-keyvisual", "nike-study", "ai-archive-main", "genz-glitch", "alldayfit", "market-marble",
  "samsung-display-798", "kd-navien-space", "lenovo-smart-home", "samsung-sds",
  "gallery-brand-system", "gallery-menu", "gallery-content", "gallery-space",
  "kd-navien-usp", "kd-navien-ish", "kd-navien-showroom",
  "elora-frame-01", "elora-frame-02", "elora-frame-03",
  "alldayfit-look-01", "alldayfit-look-02", "alldayfit-look-03",
  "samsung-display-spatial", "samsung-display-onyx", "samsung-display-device",
  "benzhi-before", "benzhi-facade", "sk-bullsone-pop", "sk-bullsone-detail",
  "market-marble-panorama", "market-marble-detail",
  "lenovo-render", "lenovo-pop-detail", "samsung-sds-exhibition",
  "btl-hurom", "btl-korea-pavilion", "btl-field-system",
];
const imageSets = Object.fromEntries(imageKeys.map((key) => [key, imageSet(key)]));
Object.assign(imageSets, {
  "genz-glitch-main": versionedStaticImage("./assets/genz-glitch-main-preview.png", 2048, 1171),
  "alldayfit-main": versionedStaticImage("./assets/alldayfit-main-preview.png", 2916, 2152),
  "parkment-gwangju": versionedStaticImage("./assets/parkment-gwangju-main.jpg", 2752, 1536),
  "lenovo-smart-home-overview": staticImage("./assets/lenovo/smart-home-overview.png", 1580, 884),
  "lenovo-security-home-model": staticImage("./assets/lenovo/security-home-model.png", 1376, 768),
  "lenovo-identity-pod-render": staticImage("./assets/lenovo/identity-pod-render.png", 1788, 986),
  "lenovo-identity-pod-render-cropped": staticImage("./assets/lenovo/identity-pod-render-cropped.png", 1696, 986),
  "lenovo-smart-service-booth": staticImage("./assets/lenovo/smart-service-booth.png", 1450, 996),
  "lenovo-wall-pop-system": staticImage("./assets/lenovo/wall-pop-system.png", 1400, 988),
  "lenovo-product-island": staticImage("./assets/lenovo/product-island.png", 1426, 998),
  "lenovo-smart-home-room": staticImage("./assets/lenovo/smart-home-room.png", 1444, 978),
  "lenovo-service-island-render": staticImage("./assets/lenovo/service-island-render.jpg", 1600, 1095),
  "lenovo-retail-kiosk-system": staticImage("./assets/lenovo/retail-kiosk-system.jpg", 1600, 1095),
  "lenovo-storefront-identity": staticImage("./assets/lenovo/storefront-identity.jpg", 4095, 3017),
  "lenovo-product-offer-card": staticImage("./assets/lenovo/product-offer-card.jpg", 532, 320),
  "lenovo-price-tag-system": staticImage("./assets/lenovo/price-tag-system.jpg", 1754, 1539),
  "lenovo-package-bag-white": staticImage("./assets/lenovo/package-bag-white.jpg", 2500, 1562),
  "lenovo-package-bag-orange": staticImage("./assets/lenovo/package-bag-orange.jpg", 2500, 1562),
  "lenovo-proposal-overview-strip": staticImage("./assets/lenovo/proposal-overview-strip.jpg", 790, 7497),
});

function entry(slug, role, chapter = "", previewKey = slug, kind = "project", title = "", routeName = "", externalUrl = "", preview = {}) {
  return { slug, role, chapter, previewKey, kind, title, routeName, externalUrl, preview };
}

const categories = [
  {
    id: "branding",
    label: "BRANDING+",
    hero: imageSet("hero-branding"),
    entries: [
      entry("gallery-flowers", "Identity / space / content / operation"),
      entry("benzhi-life", "Lifestyle retail identity"),
      entry("alldayfit", "NEW business review / lookbook", "", "alldayfit-main", "project", "All Day Fit"),
      entry("brand-archive", "", "", "sk-bullsone", "archive", "Brand Archive", "brand-archive"),
    ],
  },
  {
    id: "ai",
    label: "AI+",
    hero: imageSet("hero-ai"),
    entries: [
      entry("nike-study", "AI sports campaign / visual study", "", "nike-study", "external", "", "", "https://nike.leejihye210.workers.dev/?motion=1", { fit: "cover", position: "50% 50%" }),
      entry("elora", "AI perfume campaign film/visual study", "", "elora-keyvisual", "external", "", "", "https://elora-liart-seven.vercel.app/"),
      entry("genz-glitch", "AI beauty brand concept visual study", "", "genz-glitch-main", "external", "", "", "https://gen-z-glitch.vercel.app/", { fit: "cover", position: "50% 50%" }),
      entry("ai-archive", "", "", "ai-archive-main", "archive", "AI CAMPAIGN ARCHIVE", "ai-archive"),
    ],
  },
  {
    id: "space",
    label: "SPACE BTL+",
    hero: imageSet("hero-space"),
    entries: [
      entry("samsung-display-798", "B2B experience center", "", "samsung-display-798", "project", "Samsung Display 798 (Beijing)"),
      entry("parkment-gwangju", "Study Case / Proposal", "", "parkment-gwangju", "external", "Parkment GwangJU", "", "https://gwangju-livid.vercel.app/", { fit: "cover", position: "50% 50%" }),
      entry("kd-navien-exhibition", "AWE / ISH exhibition experience", "", "kd-navien-space", "project", "KD Navien China / Exhibition Experience"),
      entry("lenovo-smart-home", "Smart-home experience", "", "lenovo-smart-home", "project", "Lenovo Smart Home Experience"),
    ],
  },
];

const projects = {
  "brand-archive": {
    slug: "brand-archive", title: "Brand Archive", category: "branding",
    year: "2016-2020", role: "Retail / POP / Field Execution",
    scope: "Short-form brand and BTL evidence",
    thesis: "Short-form evidence of brand systems that move from identity into field execution.",
    problem: "A broad body of retail, POP, and field work needed a fast, useful index rather than disconnected project pages.",
    judgment: "Organize supporting work by role and application so the range of execution is visible at a glance.",
    contribution: "Structured the archive around identity, retail, POP, production, and field application.",
    result: "A compact index of additional brand experience and BTL capability.",
    image: imageSets["sk-bullsone"], liveUrl: "", detailMode: "archive",
  },
  "gallery-flowers": {
    slug: "gallery-flowers", title: "Gallery Flowers", category: "branding",
    year: "2026.03-05", role: "Project Lead / Brand Experience Direction",
    scope: "Brand positioning, identity, F&B, experience, digital, operation",
    heroSubtitle: "Artisan's Lounge : Salon",
    thesis: "A Paju outskirts gallery cafe became an artisan's lounge where flowers, art, food, and time gather.",
    problem: "A vague cafe-gallery identity, low access motivation, and disconnected space, content, and menu weakened recognition and repeat visits.",
    judgment: "Reframe the place as a local art salon, then connect brand, menu, stay, digital discovery, partnership, and seasonal programs into one return loop.",
    contribution: "Led brand positioning and storytelling, signature menu planning, spatial experience, digital channel planning, partnership and program concepts, and operating scenarios.",
    image: imageSets["gallery-flowers-hero"], liveUrl: "", detailMode: "full",
    challengeLabel: "THE CONTEXT", strategyLabel: "THE EXPERIENCE SYSTEM", systemLabel: "THE RETURN LOOP",
    processLabel: "From salon positioning to menu, space, digital channel, partnership, and seasonal operation.",
    scopeItems: [
      ["Brand Strategy", "브랜드 아이덴티티 / 포지셔닝 / 스토리텔링"],
      ["F&B Curation", "시그니처 메뉴 개발 / 메뉴 리브랜딩"],
      ["Experience Design", "머무는 경험 시나리오 / 공간·콘텐츠"],
      ["Digital Channel", "웹사이트 IA / SNS 콘텐츠 기획"],
      ["Operation", "운영 시나리오 / 프로모션 기획"],
    ],
    pdfPages: Array.from({ length: 9 }, (_, index) => {
      const page = index + 1;
      return {
        src: `./assets/gallery-flowers-pdf/page-${page}.jpg`,
        width: 1920,
        height: 1080,
        alt: `Gallery Flowers portfolio record page ${String(page).padStart(2, "0")}`,
      };
    }),
    journey: [
      ["01 / IN SPACE", "Experience the place", "공간에서 경험하고 아름다운 식사와 작은 작품의 시간을 만듭니다."],
      ["02 / IN CONTENT", "Discover through stories", "감각적인 비주얼 콘텐츠로 브랜드의 분위기와 메시지를 전합니다."],
      ["03 / IN CHANNEL", "Connect through search", "SNS와 네이버 플레이스를 통해 실제 방문으로 이어지게 합니다."],
      ["04 / IN SEASON", "Return through change", "계절별 메뉴와 체험 프로그램으로 다시 찾을 이유를 만듭니다."],
    ],
    galleryBlocks: {
      positioning: {
        label: "01 / BRAND STRATEGY",
        title: "An art salon at the edge of Paju.",
        en: "A Paju outskirts gallery cafe was reinterpreted as an art salon where art, dessert, tea, and local experience meet.",
        ko: "파주 외곽의 갤러리 카페를 예술, 디저트, 티, 로컬 경험이 어우러지는 아트 살롱으로 재해석했다.",
      },
      objectives: {
        label: "03 / BACKGROUND & OBJECTIVES",
        title: "The visit needed a clearer reason to exist.",
        points: [
          ["01", "Outskirts location", "외곽 위치로 방문 동기와 재유입 요인이 부족했다."],
          ["02", "Blurred identity", "카페와 갤러리의 정체성이 희미해 브랜드 인지가 약했다."],
          ["03", "Disconnected experience", "공간 경험과 콘텐츠가 분리되어 하나의 브랜드로 기억되기 어려웠다."],
          ["04", "Need for repeat", "계절·콘텐츠·메뉴가 연결된 리핏 중심 구조가 필요했다."],
        ],
      },
      identity: {
        label: "04 / BRAND IDENTITY",
        title: "Artisan Flowers / Lounge / Slow",
        en: "The salon became the conceptual bridge between flowers, art, hospitality, and a slower way of spending time.",
        ko: "살롱이라는 개념을 통해 꽃, 예술, 환대, 느리게 머무는 시간을 하나의 브랜드 언어로 연결했다.",
        noteEn: "Mermaid Angel : Floa was developed from the gallery's existing mermaid sculpture. Its fluid silhouette recalls a flower, while the wings express warmth and hospitality.",
        noteKo: "기존 인어 조각상에서 출발한 Mermaid Angel : Floa는 부드럽게 흐르는 실루엣과 꽃잎을 닮은 날개로 브랜드의 온기와 환대를 상징한다.",
        image: "gallery-brand-system",
        alt: "Gallery Flowers brand identity, logo, palette, and applications",
      },
      fnb: {
        label: "05 / F&B CURATION & PLANNING",
        title: "Menu became a memory-making device.",
        en: "Signature drinks, tea-based menus, emotional dessert sets, viral items, and a kids menu expanded the value of staying.",
        ko: "시그니처 음료, 티 베이스 메뉴, 감성을 담은 디저트 세트, 바이럴 메뉴와 키즈 메뉴로 머무는 시간의 가치를 확장했다.",
        image: "gallery-menu",
        alt: "Gallery Flowers signature drinks and menu curation",
      },
      experience: {
        label: "06 / EXPERIENCE DESIGN",
        title: "A place where staying becomes a small taste.",
        en: "Beyond a cup of coffee, the experience invited people to record, taste, and encounter art through a slower stay.",
        ko: "커피 한 잔을 넘어 기록하고, 맛보고, 예술을 만나는 느린 체류의 시간을 제안했다.",
        image: "gallery-space",
        alt: "Gallery Flowers spatial experience and stay scenario",
      },
      digital: {
        label: "07 / DIGITAL CHANNEL",
        title: "From online discovery to an offline visit.",
        en: "A visual storytelling system connected regional partnership to social content, Naver Place as the homepage hub, and seasonal promotion.",
        ko: "지역 제휴에서 SNS 콘텐츠, 네이버 플레이스라는 홈페이지 허브, 시즌 프로모션으로 이어지는 유기적 순환 구조를 제안했다.",
        image: "gallery-content",
        alt: "Gallery Flowers social media and digital channel content",
      },
      extension: {
        label: "08 / OFFLINE EXPERIENCE EXTENSION",
        title: "Partnership brought people in. Immersive programs made them stay.",
        en: "Local restaurant partnerships created inflow, while three atelier experiences gave families, couples, and friends a reason to remember the place and return. Seasonal changes and one-day classes were planned as the next layer.",
        ko: "파주 지역 맛집과의 전략적 제휴로 유입을 만들고, 가족·연인·친구가 함께 즐기는 세 가지 몰입형 아틀리에 체험으로 체류와 기억을 설계했다. 시즌별 변화와 원데이 클래스도 다음 확장으로 계획했다.",
      },
    },
  },
  "kd-navien-si": {
    slug: "kd-navien-si", title: "KD Navien China / SI System", category: "branding",
    year: "2017-2019", role: "BTL Strategy Lead / Brand System",
    scope: "SI manual, showroom, dealer, POP, graphic, furniture",
    thesis: "A distributed China rollout became one repeatable brand language.",
    problem: "Showrooms, dealer spaces, and product touchpoints needed to communicate one smart-home brand with a consistent hierarchy.",
    judgment: "Translate brand principles and product USP into a modular SI system that local partners could apply in the field.",
    contribution: "Structured the SI logic, product communication, showroom and dealer applications, POP cascade, and local production criteria.",
    result: "A repeatable system linking SI principles, product communication, showroom application, and field execution.",
    image: imageSets["kd-navien-brand"], liveUrl: "", detailMode: "system", relatedProject: "kd-navien-exhibition",
    challengeLabel: "THE SITUATION", strategyLabel: "THE DECISION", systemLabel: "THE SI SYSTEM",
    processLabel: "From product USP to showroom, dealer, POP, and local production standards.",
  },
  "kd-navien-exhibition": {
    slug: "kd-navien-exhibition", title: "KD Navien China / Exhibition Experience", category: "space",
    year: "2017-2018", role: "BTL Strategy Lead / Exhibition Direction",
    scope: "AWE Shanghai, ISH Beijing, USP Flash, special POP, field coordination",
    thesis: "Technical product stories became spatial experiences across AWE and ISH.",
    problem: "Visitors needed to understand boiler, water-heater, and heating-mat technology within a short exhibition visit.",
    judgment: "Organize the booth around product stories, demonstration moments, and a clear visitor path rather than product inventory.",
    contribution: "Directed exhibition storytelling, product experience zones, special POP, installation conditions, and local execution communication.",
    result: "Technology USP was translated into a legible exhibition journey that could be produced and operated on site.",
    image: imageSets["kd-navien-space"], liveUrl: "", detailMode: "system", relatedProject: "kd-navien-si",
    challengeLabel: "THE SITUATION", strategyLabel: "THE DECISION", systemLabel: "THE EXHIBITION JOURNEY",
    processLabel: "From technical product stories to demonstration moments, visitor path, and field delivery.",
  },
  "benzhi-life": {
    slug: "benzhi-life", title: "Benzhi Life / 本智生活", category: "branding",
    year: "2018", role: "Retail Identity / SI",
    scope: "Facade, graphics, and retail application",
    thesis: "A lifestyle retail identity was clarified through facade, graphic, and spatial application.",
    problem: "The storefront and in-store messages did not yet communicate one confident lifestyle identity.",
    judgment: "Use a clear facade hierarchy and a limited family of repeatable graphic applications.",
    contribution: "Structured the identity application from exterior recognition to retail touchpoints.",
    image: imageSets["benzhi-life"], liveUrl: "", detailMode: "short",
    challengeLabel: "THE BEFORE", strategyLabel: "THE IDENTITY MOVE", systemLabel: "THE APPLICATION",
    processLabel: "From storefront recognition to a repeatable lifestyle retail language.",
  },
  "sk-bullsone": {
    slug: "sk-bullsone", title: "SK Lubricants x Bullsone", category: "branding",
    year: "2018", role: "Spatial Identity / Promotion System",
    scope: "Service center, POP, and promotion",
    thesis: "A service-center environment became a recognizable brand and promotion system.",
    problem: "Service information and promotion needed to remain clear inside a busy operational environment.",
    judgment: "Unify spatial identity and promotional hierarchy instead of treating POP as separate decoration.",
    contribution: "Connected branded zones, service communication, and reusable promotion formats.",
    image: imageSets["sk-bullsone"], liveUrl: "", detailMode: "short",
  },
  elora: {
    slug: "elora", title: "ELORA", category: "ai",
    year: "2025-2026", role: "AI Campaign / Creative Direction",
    scope: "Concept, key visual, campaign film",
    thesis: "AI was directed as a cinematic perfume campaign, not presented as a generation demo.",
    problem: "The work needed emotional continuity and product desire beyond a collection of attractive generations.",
    judgment: "Direct one scent-memory narrative and select every image against the same cinematic campaign logic.",
    contribution: "Led concept framing, visual selection, film direction, and campaign presentation.",
    image: imageSets["elora-keyvisual"], liveUrl: "https://elora-liart-seven.vercel.app/", detailMode: "full",
    heroVideo: { provider: "youtube", id: "Sn-0_JGfyCs", start: 0, end: 20 },
  },
  "nike-study": {
    slug: "nike-study", title: "NIKE / Visual Study", category: "ai",
    year: "2026", role: "AI Campaign / Visual Direction", client: "Concept Study",
    scope: "Motion collage, sports narrative, visual system",
    thesis: "A sports story was translated into a kinetic visual language built from movement, fragments, and repeatable graphic codes.",
    problem: "A high-energy sports concept needed a visual system that could move between still image, motion, and campaign rhythm.",
    judgment: "Use collage, type, and athlete motion as a modular campaign grammar rather than a single hero image.",
    contribution: "Directed the visual study across athlete imagery, paper collage motion, and campaign composition.",
    result: "A flexible visual language that can extend from social cutdowns to a short campaign film.",
    image: imageSets["nike-study"], liveUrl: "https://nike.leejihye210.workers.dev/?motion=1", detailMode: "full", reviewNotes: [
      "Confirm whether this should be presented as a client commission or an independent concept study before publishing the NIKE name.",
    ],
  },
  "genz-glitch": {
    slug: "genz-glitch", title: "GenZ-Glitch", category: "ai",
    year: "2025-2026", role: "AI Beauty Brand Concept",
    scope: "Brand concept, image system, campaign language",
    thesis: "A beauty concept used AI to define a distinctive campaign language and selection system.",
    problem: "A youth beauty idea needed a recognizable attitude rather than a generic futuristic aesthetic.",
    judgment: "Use controlled visual disruption as a repeatable campaign code.",
    contribution: "Defined the concept, art-directed generations, and edited the visual system.",
    image: imageSets["genz-glitch"], liveUrl: "https://gen-z-glitch.vercel.app/", detailMode: "full",
  },
  alldayfit: {
    slug: "alldayfit", title: "AllDayFit", category: "branding",
    year: "2025", role: "New Business Case Study",
    scope: "Research / OEM feasibility / Audience / Lookbook",
    thesis: "A ten-mile wear / 텐마일웨어 business review connected market opportunity, OEM feasibility, audience logic, and visual proof.",
    problem: "Y-company needed to judge whether its material and production capabilities could become a coherent consumer-facing apparel proposition.",
    judgment: "Connect market gap, business fit, target pain points, go-to-market order, and lookbook evidence in one decision flow.",
    contribution: "Structured the business review, feasibility logic, audience positioning, product direction, and concept lookbook.",
    image: imageSets.alldayfit, liveUrl: "", detailMode: "alldayfit",
  },
  "market-marble": {
    slug: "market-marble", title: "Market Marble", category: "ai",
    year: "2025", role: "AI Editorial Concept",
    scope: "Concept, visual world, prototype",
    thesis: "An AI-native editorial concept turned market information into an approachable visual world.",
    problem: "Complex market material needed an inviting entry point without losing its informational purpose.",
    judgment: "Use a strong editorial metaphor and modular visual scenes to guide exploration.",
    contribution: "Built the concept, key imagery, motion direction, and working prototype.",
    image: imageSets["market-marble"], liveUrl: "", detailMode: "short",
  },
  "samsung-display-798": {
    slug: "samsung-display-798", title: "Samsung Display 798", category: "space",
    year: "2019", role: "B2B Experience Planning",
    scope: "Visitor journey, content direction, spatial communication",
    thesis: "A B2B technology story became a legible visitor journey and experience center.",
    problem: "Multiple display technologies needed to become understandable and memorable within one visit.",
    judgment: "Sequence the experience around visitor questions and proof moments rather than product inventory.",
    contribution: "Directed the journey, content hierarchy, and connection between narrative and space.",
    image: staticImage("./assets/samsung-display-pdf/hero-photo.jpg", 3000, 806), liveUrl: "", detailMode: "full",
    pdfPages: Array.from({ length: 9 }, (_, index) => {
      const page = index + 1;
      return {
        src: `./assets/samsung-display-pdf/page-${page}.jpg`,
        width: 1950,
        height: 1350,
        alt: `Samsung Display EBC project record page ${String(page).padStart(2, "0")}`,
      };
    }),
  },
  "lenovo-smart-home": {
    slug: "lenovo-smart-home", title: "Lenovo Smart Home Experience", category: "space",
    year: "2018", role: "Experience Space Planning",
    scope: "Smart-home demonstration and retail communication",
    thesis: "Smart-home technology was translated into a visitor-centered retail experience system.",
    problem: "Connected products needed to feel like one understandable home scenario, not separate device displays.",
    judgment: "Organize the experience around everyday use scenes, visible interaction points, and retail-ready communication modules.",
    contribution: "Structured the spatial narrative, product zones, POP applications, graphic hierarchy, and supporting communication.",
    image: imageSets["lenovo-smart-home"], liveUrl: "", detailMode: "short",
    evidenceGroups: [
      {
        eyebrow: "01 / SCENARIO SYSTEM",
        title: "Smart-home stories became physical scenes.",
        description: "Room-like displays and service islands made connected functions easier to understand within a short retail visit.",
        items: [
          ["lenovo-smart-home-overview", "Smart-home overview board", "Home scenario overview and device relationship"],
          ["lenovo-security-home-model", "Smart security home model", "Warm-toned security scenario model and product context"],
          ["lenovo-smart-home-room", "Smart-home room display", "Room-scale product communication and scenario setup"],
          ["lenovo-service-island-render", "Service island render", "Interaction-led service island for customer explanation"],
        ],
      },
      {
        eyebrow: "02 / RETAIL POP",
        title: "POP elements supported quick comprehension.",
        description: "Modular fixtures, podiums, and counter-style displays helped the smart-home offer become visible in-store.",
        items: [
          ["lenovo-wall-pop-system", "Wall POP system", "Wall-mounted product and service communication"],
          ["lenovo-product-island", "Product island display", "Compact product island for retail explanation"],
          ["lenovo-smart-service-booth", "Smart service booth", "Service booth applying the brand and product hierarchy"],
          ["lenovo-retail-kiosk-system", "Retail kiosk system", "Kiosk-style touchpoint connecting brand and service message"],
          ["lenovo-identity-pod-render-cropped", "Identity pod render", "Small-scale branded service pod"],
        ],
      },
      {
        eyebrow: "03 / IDENTITY & COMMUNICATION",
        title: "Graphic language gave the service a recognizable face.",
        description: "Signage, price communication, and promotion graphics supported recognition beyond the fixture itself.",
        items: [
          ["lenovo-storefront-identity", "Storefront identity board", "Signage and visual identity expansion"],
          ["lenovo-product-offer-card", "Product offer card", "Retail offer and price communication"],
          ["lenovo-price-tag-system", "Price tag system", "Tabletop price and product information system"],
        ],
      },
      {
        eyebrow: "04 / PACKAGE APPLICATION",
        title: "Carry-out touchpoints extended the system.",
        description: "Package and bag applications carried the service identity beyond the point of sale.",
        items: [
          ["lenovo-package-bag-white", "White package bag application", "Minimal carry-out package application"],
          ["lenovo-package-bag-orange", "Orange package bag application", "Illustrated carry-out package variation"],
        ],
      },
      {
        eyebrow: "05 / PROPOSAL OVERVIEW",
        title: "The full proposal was kept as a long-form evidence strip.",
        description: "The original vertical proposal sheet is preserved as a record of the broader concept flow.",
        items: [
          ["lenovo-proposal-overview-strip", "Lenovo proposal overview strip", "Long-form proposal overview and slide sequence"],
        ],
      },
    ],
  },
  "samsung-sds": {
    slug: "samsung-sds", title: "Samsung SDS", category: "space",
    year: "2018", role: "Technology Exhibition Communication",
    scope: "Exhibition, POP, and field application",
    thesis: "Enterprise technology was organized into a concise exhibition communication system.",
    problem: "Abstract technology offerings needed a fast and consistent physical explanation.",
    judgment: "Prioritize a clear message hierarchy and repeatable exhibit communication.",
    contribution: "Organized the spatial communication and implementation-ready visual applications.",
    image: imageSets["samsung-sds"], liveUrl: "", detailMode: "short",
  },
};

const projectEditorial = {
  "gallery-flowers": {
    client: "Gallery Flowers",
    result: "A practical brand experience system connecting salon positioning, identity, menu, space, content, digital discovery, and daily operation.",
    en: {
      thesis: "A Paju outskirts gallery cafe became an artisan's lounge where flowers, art, food, and time gather.",
      problem: "A vague cafe-gallery identity, low access motivation, and disconnected space, content, and menu weakened recognition and repeat visits.",
      strategy: "Reframe the place as a local art salon, then connect brand, menu, stay, digital discovery, partnership, and seasonal programs into one return loop.",
      contribution: "Led brand positioning and storytelling, signature menu planning, spatial experience, digital channel planning, partnership and program concepts, and operating scenarios.",
      result: "A practical brand experience system connecting salon positioning, identity, menu, space, content, digital discovery, and daily operation.",
    },
    ko: {
      thesis: "파주 외곽의 갤러리 카페를 꽃, 예술, 음식, 시간이 모이는 아티잔 라운지이자 로컬 아트 살롱으로 재해석했다.",
      problem: "카페와 갤러리의 정체성이 희미했고, 외곽 입지로 방문 동기와 재유입 요인이 부족했으며, 공간·콘텐츠·메뉴가 분리되어 브랜드 인지와 재방문 구조가 약했다.",
      strategy: "공간을 로컬 아트 살롱으로 포지셔닝하고, 브랜드·메뉴·머무는 경험·디지털 탐색·지역 제휴·시즌 프로그램을 하나의 순환 구조로 연결했다.",
      contribution: "브랜드 포지셔닝과 스토리텔링, 시그니처 메뉴 기획, 공간 경험, 디지털 채널, 제휴·체험 프로그램, 운영 시나리오를 리드했다.",
      result: "살롱 포지셔닝부터 아이덴티티, 메뉴, 공간, 콘텐츠, 디지털 유입, 일상 운영까지 연결되는 실행 가능한 브랜드 경험 시스템을 만들었다.",
    },
  },
  "kd-navien-si": {
    client: "KD Navien China",
    result: "A repeatable system linking SI principles, product communication, showroom application, and field execution.",
    ko: {
      thesis: "중국 전역의 쇼룸, 대리점, 제품 접점을 하나의 반복 가능한 브랜드 언어로 정리했다.",
      problem: "쇼룸, 대리점, 제품 접점이 하나의 스마트홈 브랜드 위계로 읽혀야 했다.",
      strategy: "브랜드 원칙과 제품 USP를 현지 파트너가 적용할 수 있는 모듈형 SI 시스템으로 번역했다.",
      contribution: "SI 로직, 제품 커뮤니케이션, 쇼룸·대리점 적용, POP, 가구, 현지 제작 기준을 구조화했다.",
      result: "SI 원칙부터 제품 커뮤니케이션, 쇼룸 적용, 현장 실행까지 이어지는 반복 가능한 기준을 만들었다.",
    },
  },
  "kd-navien-exhibition": {
    client: "KD Navien China",
    result: "Technology USP was translated into a legible exhibition journey that could be produced and operated on site.",
    ko: {
      thesis: "기술 중심의 제품 이야기를 AWE와 ISH에서 관람객이 체험하는 공간 경험으로 전환했다.",
      problem: "보일러, 온수기, 온수매트 기술을 짧은 전시 관람 안에서 이해시켜야 했다.",
      strategy: "제품을 나열하기보다 제품 스토리, 시연 순간, 관람 동선을 중심으로 부스를 구성했다.",
      contribution: "전시 스토리텔링, 제품 체험 존, 특수 POP, 설치 조건, 현지 실행 커뮤니케이션을 리드했다.",
      result: "기술 USP를 이해 가능한 전시 동선으로 번역하고 현장 제작과 운영까지 연결했다.",
    },
  },
  "benzhi-life": {
    client: "Benzhi Life / 本智生活",
    result: "A clearer lifestyle retail identity from facade recognition to in-store communication.",
    ko: {
      thesis: "라이프스타일 리테일 브랜드의 아이덴티티를 파사드와 매장 적용으로 명확하게 만들었다.",
      problem: "매장 전면과 내부 메시지가 하나의 라이프스타일 브랜드로 인식되기 어려웠다.",
      strategy: "외부 인지부터 매장 접점까지 제한된 그래픽 규칙과 명확한 위계로 정리했다.",
      contribution: "파사드, 그래픽, 리테일 적용을 하나의 SI 흐름으로 구조화했다.",
      result: "매장 외부 인식과 내부 커뮤니케이션이 같은 브랜드 언어로 작동하도록 정리했다.",
    },
  },
  "sk-bullsone": {
    client: "SK Lubricants x Bullsone",
    result: "A service-center identity and promotion system designed for a busy operational environment.",
    ko: {
      thesis: "서비스센터 환경을 인식 가능한 브랜드 및 프로모션 시스템으로 전환했다.",
      problem: "운영이 우선인 현장 안에서도 서비스 정보와 프로모션이 명확하게 읽혀야 했다.",
      strategy: "POP를 개별 장식으로 보지 않고 공간 아이덴티티와 프로모션 위계를 하나로 통합했다.",
      contribution: "브랜드 존, 서비스 커뮤니케이션, 반복 가능한 프로모션 포맷을 연결했다.",
      result: "현장 운영을 방해하지 않으면서도 브랜드 인지와 정보 전달이 가능한 시스템을 만들었다.",
    },
  },
  elora: {
    client: "ELORA / Concept Film",
    result: "A cinematic campaign system with continuity across scent memory, character, motion, and final film presentation.",
    ko: {
      thesis: "AI를 생성 데모가 아니라 영화적인 향수 캠페인으로 디렉션했다.",
      problem: "매력적인 생성 이미지의 모음이 아니라 감정과 제품 욕망이 이어지는 캠페인이 필요했다.",
      strategy: "하나의 향 기억 서사를 정하고, 같은 인물·의상·공간·조명 기준으로 모든 샷을 선별했다.",
      contribution: "콘셉트 프레이밍, 비주얼 셀렉션, 필름 방향, 캠페인 프레젠테이션을 리드했다.",
      result: "장면마다 다른 생성 결과가 하나의 향수 캠페인 필름으로 읽히는 연속성을 확보했다.",
    },
    reviewNotes: ["Confirm the public film URL and whether this case should be labelled as a concept film."],
  },
  "genz-glitch": {
    client: "Independent Beauty Concept",
    result: "A controlled visual disruption system for a youth beauty campaign world.",
    ko: {
      thesis: "AI를 활용해 독특한 뷰티 캠페인 언어와 셀렉션 시스템을 정의했다.",
      problem: "젊은 뷰티 콘셉트가 일반적인 퓨처리즘 이미지가 아닌 고유한 태도로 보여야 했다.",
      strategy: "통제된 시각적 글리치를 반복 가능한 캠페인 코드로 사용했다.",
      contribution: "콘셉트, 생성 방향, 셀렉션 기준, 비주얼 시스템을 정의했다.",
      result: "이미지마다 달라지지 않고 확장 가능한 뷰티 캠페인 세계를 구축했다.",
    },
  },
  alldayfit: {
    client: "Y-company / Confidential New Business Review",
    result: "A decision-ready proposition connecting market research, OEM feasibility, positioning, and visual proof.",
    ko: {
      thesis: "텐마일웨어 신사업 검토를 통해 시장 기회, OEM 가능성, 타깃 논리, 비주얼 증거를 하나의 판단 구조로 연결했다.",
      problem: "Y사가 보유한 소재와 생산 역량이 실제 소비자 브랜드 제안으로 발전 가능한지 검토해야 했다.",
      strategy: "시장 공백, 보유 자산의 정합성, 타깃 페인포인트, 채널 순서, 룩북 증거를 하나의 의사결정 흐름으로 연결했다.",
      contribution: "시장과 경쟁 분석, 사업성 검토, 타깃 포지셔닝, 제품 방향, 콘셉트 룩북을 구조화했다.",
      result: "고기능·중가 텐마일웨어 포지션을 시각적으로 검토할 수 있는 사업 제안 근거를 만들었다.",
    },
    reviewNotes: ["Y-company is kept confidential. Confirm the public-facing client label and whether the market figures may be published."],
  },
  "market-marble": {
    client: "Market Marble",
    result: "An approachable AI-native editorial prototype that turns complex market material into visual exploration.",
    ko: {
      thesis: "AI 네이티브 에디토리얼 콘셉트로 시장 정보를 친근한 시각 세계로 번역했다.",
      problem: "정보의 목적을 잃지 않으면서도 복잡한 시장 자료에 쉽게 진입할 수 있어야 했다.",
      strategy: "강한 에디토리얼 은유와 모듈형 장면으로 탐색의 흐름을 설계했다.",
      contribution: "콘셉트, 키 이미지, 모션 방향, 작동 가능한 프로토타입을 구성했다.",
      result: "시장 정보가 데이터 화면에 머물지 않고 탐색 가능한 브랜드 경험으로 확장됐다.",
    },
  },
  "samsung-display-798": {
    client: "Samsung Display",
    result: "A visitor-centered B2B experience center connecting technology stories, content hierarchy, and spatial proof.",
    ko: {
      thesis: "B2B 디스플레이 기술을 단순히 제품별로 나열하지 않고, 방문 흐름과 콘텐츠 위계가 자연스럽게 이어지는 경험센터로 정리했다. 관람자가 공간을 이동하면서 기술의 차이와 활용 장면을 단계적으로 이해할 수 있도록 스토리와 공간을 함께 설계했다.",
      problem: "삼성디스플레이가 보유한 여러 기술과 제품은 각각의 장점이 분명했지만, 짧은 방문 시간 안에서 모두 이해시키기에는 정보량이 많았다. 제품 설명이 많아질수록 관람자는 핵심 메시지를 놓치기 쉬웠고, 공간은 기술을 증명하는 장면보다 제품 전시장처럼 보일 위험이 있었다.",
      strategy: "방문자가 처음 마주하는 질문, 이동하면서 확인해야 하는 기술의 차이, 마지막에 기억해야 하는 proof moment를 기준으로 동선을 재구성했다. 각 존은 기능 설명보다 사용 장면과 비교 포인트가 먼저 읽히도록 정리하고, 그래픽·영상·공간 요소가 같은 메시지 위계로 작동하게 했다.",
      contribution: "관람 여정, 존별 콘텐츠 우선순위, 공간 안에서 기술이 읽히는 방식, 현장 적용을 위한 시각 자료의 연결을 디렉션했다. 제안 이미지와 실제 현장 사진을 함께 검토하며 기획 의도와 구현 결과가 같은 흐름으로 보이도록 정리했다.",
      result: "복잡한 B2B 기술 포트폴리오가 관람자의 이동과 이해 순서를 따라가는 경험으로 정리됐다. 공간은 단순 전시물이 아니라, 기술을 빠르게 이해하고 기억하게 만드는 방문자 중심의 커뮤니케이션 장치로 작동했다.",
    },
  },
  "lenovo-smart-home": {
    client: "Lenovo",
    result: "A scenario-led smart-home retail experience connecting product zones, POP, signage, and service communication.",
    ko: {
      thesis: "스마트홈 기술을 기기별 설명이 아니라 생활 장면 안에서 이해되는 리테일 경험으로 번역했다. 방문자가 제품을 따로 보는 것이 아니라, 집 안에서 어떤 기능이 연결되고 어떤 상황에서 유용한지 빠르게 파악하도록 공간과 POP를 함께 정리했다.",
      problem: "연결형 제품은 기능이 많을수록 설명이 복잡해지고, 매장에서는 각 제품이 분리된 디스플레이처럼 보이기 쉽다. 짧은 체류 시간 안에서 스마트홈의 편의성과 서비스 구조를 이해시키기 위해서는 제품 나열보다 사용 시나리오와 접점별 메시지 위계가 필요했다.",
      strategy: "공간을 집의 장면, 서비스 안내, 제품 체험, 가격·프로모션 커뮤니케이션으로 나누고, 각 접점이 같은 브랜드 언어로 읽히도록 구성했다. 룸형 디스플레이와 아일랜드형 POP, 사인, 가격표, 패키지까지 하나의 경험 흐름으로 연결했다.",
      contribution: "스마트홈 체험 동선, 제품 존 구성, POP 구조, 그래픽·사인 위계, 가격·프로모션 툴, 패키지 적용까지 리테일 현장에서 실행 가능한 커뮤니케이션 체계를 정리했다.",
      result: "복잡한 스마트홈 기능이 생활 시나리오와 매장 접점 안에서 이해되는 형태로 정리됐다. 공간, 제품, 그래픽, 패키지가 따로 보이지 않고 하나의 리테일 경험 시스템으로 작동하도록 만들었다.",
    },
  },
  "samsung-sds": {
    client: "Samsung SDS",
    result: "A concise exhibition communication system for explaining enterprise technology quickly and consistently.",
    ko: {
      thesis: "엔터프라이즈 기술을 짧고 일관된 전시 커뮤니케이션 시스템으로 조직했다.",
      problem: "추상적인 기술 서비스가 짧은 관람 시간 안에 명확하게 설명되어야 했다.",
      strategy: "메시지 위계와 반복 가능한 전시 커뮤니케이션을 우선순위로 두었다.",
      contribution: "전시 커뮤니케이션과 현장 적용이 가능한 시각 요소를 정리했다.",
      result: "복잡한 기술 제안이 현장에서 빠르게 읽히는 커뮤니케이션으로 압축됐다.",
    },
  },
  "nike-study": {
    ko: {
      thesis: "움직임, 파편, 반복 가능한 그래픽 코드를 기반으로 스포츠 이야기를 확장했다.",
      problem: "스틸 이미지, 모션, 캠페인 리듬을 오갈 수 있는 스포츠 비주얼 시스템이 필요했다.",
      strategy: "콜라주, 타이포그래피, 선수의 움직임을 모듈형 캠페인 문법으로 사용했다.",
      contribution: "선수 이미지, 페이퍼 콜라주 모션, 캠페인 구성을 연결해 비주얼 스터디를 디렉션했다.",
      result: "소셜 컷다운부터 짧은 캠페인 필름까지 확장 가능한 시각 언어를 제안했다.",
    },
  },
};

for (const [slug, editorial] of Object.entries(projectEditorial)) {
  const project = projects[slug];
  if (!project) continue;
  Object.assign(project, editorial);
  project.copy = { en: {}, ko: editorial.ko || {} };
  for (const field of ["thesis", "problem", "judgment", "contribution", "result"]) {
    project.copy.en[field] = field === "judgment" ? project.judgment : project[field];
  }
  project.copy.ko.strategy = project.copy.ko.strategy || project.copy.ko.judgment;
  project.reviewNotes = editorial.reviewNotes || project.reviewNotes || [];
}

projects.elora.promptNotes = [
  { label: "CHARACTER LOCK", en: "Preserve the same character, costume, room, lighting mood, and composition.", ko: "같은 인물, 의상, 공간, 조명 분위기, 구도를 유지한다." },
  { label: "ONE ACTION / ONE CLIP", en: "Keep one clear movement per clip so the campaign rhythm remains legible.", ko: "한 클립에는 하나의 분명한 움직임만 넣어 캠페인 리듬을 유지한다." },
  { label: "CAMERA PRESET", en: "Use a named camera move such as Eyes In, Dolly In, Arc Left, or Static.", ko: "Eyes In, Dolly In, Arc Left, Static처럼 카메라 움직임을 명확히 지정한다." },
];

function kdNavienProofImage(file, width, height) {
  return staticImage(`./assets/kd_navien/${file}`, width, height);
}

const evidence = {
  "gallery-flowers": [
    ["gallery-flowers", "Gallery Flowers hospitality space", "The physical anchor for the local art salon", "50% 50%"],
    ["gallery-brand-system", "Artisan's Lounge identity system", "The Salon concept, logo, palette, and graphic language", "50% 50%"],
    ["gallery-menu", "F&B curation and signature menu", "Signature drinks, tea-based menu, dessert sets, and menu rebranding", "50% 50%"],
    ["gallery-content", "Digital channel and social content", "A visual storytelling language connecting discovery to visit", "50% 50%"],
    ["gallery-space", "Experience design and on-site application", "Stay scenarios, spatial content, seasonal programs, and field results", "50% 50%"],
  ],
  "kd-navien-si": [
    ["kd-navien-brand", "KD Navien SI manual", "Brand and product communication system", "50% 50%"],
    ["kd-navien-showroom", "KD Navien Shanghai showroom", "Showroom application and field standard", "50% 50%"],
    ["kd-navien-usp", "KD Navien USP Flash", "Product benefit translated into retail communication", "50% 50%"],
    ["kd-navien-brand", "KD Navien dealer application", "Repeatable local application", "50% 50%"],
  ],
  "kd-navien-exhibition": [
    ["kd-navien-space", "KD Navien AWE exhibition", "Exhibition application and visitor path", "50% 50%"],
    ["kd-navien-ish", "KD Navien ISH proposal", "Spatial proposal and demonstration logic", "50% 50%"],
    ["kd-navien-space", "KD Navien exhibition detail", "Product experience and special POP", "50% 50%"],
    ["kd-navien-showroom", "KD Navien field coordination", "Installation and local execution proof", "50% 50%"],
    [kdNavienProofImage("1_AWE_1.png", 2200, 1233), "KD Navien AWE booth record", "AWE booth scale and visitor-facing product zones", "50% 50%"],
    [kdNavienProofImage("1_AWE_4.png", 1200, 800), "KD Navien exhibition facade comparison", "Booth facade and product communication variations", "50% 50%"],
    [kdNavienProofImage("2.jpeg", 545, 988), "KD Navien boiler USP panel", "Technical USP translated into a vertical product graphic", "50% 50%"],
    [kdNavienProofImage("2.png", 1200, 800), "Navien Mate heating mat POP", "Product benefit communication for bedding and heating-mat display", "50% 50%"],
    [kdNavienProofImage("2017_경동_베이비페어.png", 1778, 986), "KD Navien baby fair proposal", "Family-facing fair booth concept and product display planning", "50% 50%"],
    [kdNavienProofImage("2018_awe전시.png", 780, 1002), "KD Navien AWE on-site booth", "On-site exhibition installation and field execution proof", "50% 50%"],
    [kdNavienProofImage("경동_그래픽.png", 1804, 958), "KD Navien graphic system", "Graphic map and communication layer for product understanding", "50% 50%"],
    [kdNavienProofImage("스크린샷 2026-07-05 오후 3.41.54.png", 1144, 1004), "KD Navien product wall", "Showroom-style product wall and communication hierarchy", "50% 50%"],
    [kdNavienProofImage("스크린샷 2026-07-05 오후 3.43.22.png", 1812, 772), "KD Navien planning board", "Planning document tying exhibition, showroom, and communication standards", "50% 50%"],
  ],
  elora: [
    ["elora", "ELORA campaign poster", "Hero campaign key visual", "50% 50%"],
    ["elora-frame-01", "ELORA film frame one", "Scent-memory narrative opening", "50% 50%"],
    ["elora-frame-02", "ELORA film frame two", "Material and emotional continuity", "50% 50%"],
    ["elora-frame-03", "ELORA film frame three", "Campaign film resolution", "50% 50%"],
  ],
  "genz-glitch": [
    ["genz-glitch", "GenZ-Glitch brand board", "Brand world and campaign language", "50% 12%"],
    ["genz-glitch", "GenZ-Glitch visual selection", "Controlled disruption and beauty imagery", "50% 38%"],
    ["genz-glitch", "GenZ-Glitch applications", "Repeatable campaign codes", "50% 66%"],
    ["genz-glitch", "GenZ-Glitch system detail", "Editing and selection consistency", "50% 88%"],
  ],
  alldayfit: [
    ["alldayfit", "AllDayFit proposition", "Business proposition translated into a visual direction", "50% 50%"],
    ["alldayfit-look-01", "AllDayFit look one", "Audience and silhouette direction", "50% 50%"],
    ["alldayfit-look-02", "AllDayFit look two", "Product and styling feasibility", "50% 50%"],
    ["alldayfit-look-03", "AllDayFit look three", "Lookbook evidence for the business review", "50% 50%"],
  ],
  "samsung-display-798": [
    ["samsung-display-798", "Samsung Display experience center", "Experience-center hero and visitor entry", "50% 50%"],
    ["samsung-display-spatial", "Samsung Display spatial proposal", "Visitor journey translated into space", "50% 50%"],
    ["samsung-display-onyx", "Samsung Onyx experience", "Technology proof in a meeting scenario", "50% 50%"],
    ["samsung-display-device", "Samsung Display device communication", "Product and content hierarchy", "50% 50%"],
  ],
  "benzhi-life": [
    ["benzhi-life", "Benzhi Life identity application", "Completed retail identity", "50% 50%"],
    ["benzhi-before", "Benzhi Life before", "Initial storefront condition", "50% 50%"],
    ["benzhi-facade", "Benzhi Life facade proposal", "Facade hierarchy and recognition", "50% 50%"],
  ],
  "sk-bullsone": [
    ["sk-bullsone", "SK Lubricants and Bullsone spatial identity", "Service-center system", "50% 50%"],
    ["sk-bullsone-pop", "Service promotion communication", "POP hierarchy and campaign use", "50% 50%"],
    ["sk-bullsone-detail", "Service-center application detail", "Operational implementation proof", "50% 50%"],
  ],
  "market-marble": [
    ["market-marble", "Market Marble hero", "Editorial market concept", "50% 50%"],
    ["market-marble-panorama", "Market Marble panorama", "Visual world and exploration structure", "50% 50%"],
    ["market-marble-detail", "Market Marble interaction detail", "Prototype application", "50% 50%"],
  ],
  "lenovo-smart-home": [
    ["lenovo-smart-home", "Lenovo Smart Home communication", "Experience and retail communication", "50% 50%"],
    ["lenovo-render", "Lenovo Smart Home spatial render", "Scenario-led spatial proposal", "50% 50%"],
    ["lenovo-pop-detail", "Lenovo product communication detail", "Implementation-ready product touchpoint", "50% 50%"],
  ],
  "samsung-sds": [
    ["samsung-sds", "Samsung SDS POP", "Enterprise technology communication", "50% 50%"],
    ["samsung-sds-exhibition", "Samsung SDS exhibition", "Physical exhibition application", "50% 50%"],
    ["samsung-sds", "Samsung SDS communication detail", "Repeatable field application", "35% 50%"],
  ],
};

for (const project of Object.values(projects)) {
  const rows = evidence[project.slug] || [
    [project.slug, `${project.title} selected output`, project.scope, "50% 50%"],
  ];
  project.proofs = rows.map(([key, alt, caption, position]) => ({
    image: typeof key === "string" ? imageSets[key] : key,
    alt,
    caption,
    position,
  }));
  project.process = {
    label: project.processLabel || (project.detailMode === "full"
      ? "The process evidence connects strategy, selection, and final application."
      : "The short case records the key decision and implementation proof."),
    proof: project.proofs[Math.min(1, project.proofs.length - 1)],
  };
}

const aiArchive = [
  {
    slug: "nike",
    number: "01",
    title: "NIKE",
    category: "AI Sports Campaign / Visual Study",
    description: "스포츠 무드, 모션 리듬, 그래픽 파편을 연결한 AI 캠페인 비주얼 스터디.",
    tags: ["Sports", "Campaign", "Motion", "Visual Study"],
    url: "https://nike.leejihye210.workers.dev/?motion=1",
    type: "WEB",
    tone: "nike",
    accent: "#7fffe0",
    screenshot: "./assets/optimized/nike-study-1280.webp",
    imagePosition: "50% 50%",
    visualWord: "Move / Sport / Signal",
  },
  {
    slug: "summer-story",
    number: "02",
    title: "Summer Story",
    category: "AI Campaign Film",
    description: "여름의 빛, 향, 움직임을 30초 캠페인 필름으로 압축한 영상 스터디.",
    tags: ["Video", "30s Film", "Sound", "Mood"],
    url: "",
    type: "VIDEO",
    tone: "summer",
    accent: "#7fffe0",
    screenshot: "./assets/ai-archive/videos/summer-story-poster.jpg",
    imagePosition: "50% 50%",
    video: "./assets/ai-archive/videos/summer-story-preview.mp4",
    videoOrientation: "landscape",
    visualWord: "Light / Air / Memory",
  },
  {
    slug: "elora",
    number: "03",
    title: "ELORA",
    category: "AI Perfume Film / Creative Direction",
    description: "AI 영상, 향수 광고, 시퀀스 설계, 비주얼 디렉션을 보여주는 메인 프로젝트.",
    tags: ["AI Film", "Creative Direction", "Perfume", "Storyboard"],
    url: "https://elora-liart-seven.vercel.app/",
    type: "WEB",
    tone: "elora",
    accent: "#9b6dff",
    screenshot: "./assets/ai-archive/elora-capture.png",
    imagePosition: "50% 0%",
    visualWord: "Scent / Memory / Absence",
  },
  {
    slug: "genz-glitch",
    number: "04",
    title: "GenZ-Glitch",
    category: "AI Beauty Brand Concept",
    description: "Gen Z 감성과 글리치 무드를 기반으로 설계한 AI 화장품 브랜드 기획.",
    tags: ["Beauty", "Brand Concept", "Glitch", "Gen Z"],
    url: "https://gen-z-glitch.vercel.app/",
    type: "WEB",
    tone: "glitch",
    accent: "#ff75c8",
    screenshot: "./assets/ai-archive/glitch-capture.png",
    imagePosition: "52% 10%",
    visualWord: "Skin / Signal / Identity",
  },
  {
    slug: "dark-in-red",
    number: "05",
    title: "Dark in Red",
    category: "AI Fashion Shorts",
    description: "강한 레드 톤과 인물 무드를 중심으로 짧게 몰입시키는 세로형 캠페인 숏츠.",
    tags: ["Video", "Shorts", "Fashion", "Red"],
    url: "",
    type: "VIDEO",
    tone: "darkred",
    accent: "#ff5b7d",
    screenshot: "./assets/ai-archive/videos/dark-in-red-poster.jpg",
    imagePosition: "50% 50%",
    video: "./assets/ai-archive/videos/dark-in-red-preview.mp4",
    videoOrientation: "portrait",
    visualWord: "Red / Body / Motion",
  },
  {
    slug: "ddp-fashion-show",
    number: "06",
    title: "DDP Fashion Show",
    category: "AI Metaverse Fashion Concept",
    description: "AI 룩, LED 기둥 스토리텔링, 메타버스 런웨이를 연결한 디지털 패션쇼 콘셉트.",
    tags: ["Fashion", "Metaverse", "Exhibition", "AI Look"],
    url: "https://ddp-red.vercel.app/",
    type: "WEB",
    tone: "ddp",
    accent: "#9b6dff",
    screenshot: "./assets/ai-archive/ddp-fashion-preview1.png",
    imagePosition: "50% 18%",
    visualWord: "Runway / Screen / Mirror",
  },
  {
    slug: "charlotte-etoile",
    number: "07",
    title: "Charlotte Étoile",
    category: "AI Luxury Promo Film",
    description: "빛, 우아함, 브랜드 무드를 시네마틱하게 구성한 AI 럭셔리 홍보영상.",
    tags: ["Luxury", "Promo Film", "Mood", "AI Video"],
    url: "https://youtu.be/lLdUVFUcdqc",
    type: "YOUTUBE",
    tone: "etoile",
    accent: "#ffd36a",
    screenshot: "./assets/ai-archive/paris.jpeg",
    imagePosition: "50% 50%",
    visualWord: "Light / Pearl / Motion",
  },
  {
    slug: "gallery-flowers-ai",
    number: "08",
    title: "Gallery Flowers",
    category: "AI-assisted Branding & Space Content",
    description: "AI를 활용해 전략, 콘텐츠, 웹 구조를 연결한 갤러리플라워즈 리브랜딩.",
    tags: ["Brand Strategy", "Space Content", "Web IA", "F&B"],
    url: "https://galleryflowers.pages.dev/",
    type: "WEB",
    tone: "gallery",
    accent: "#7fffe0",
    screenshot: "./assets/optimized/gallery-flowers-hero-1280.webp",
    imagePosition: "50% 0%",
    visualWord: "Artisan / Lounge / Salon",
  },
  {
    slug: "market-marble",
    number: "09",
    title: "Market Marble",
    category: "AI Local Commerce App",
    description: "전통시장 활성화를 위해 기획한 AI 기반 로컬 커머스 앱 프로토타입.",
    tags: ["Local", "App Concept", "Market", "Service"],
    url: "https://marketmarble.vercel.app/project1",
    type: "WEB",
    tone: "market",
    accent: "#7fffe0",
    screenshot: "./assets/ai-archive/marketmarble.png",
    imagePosition: "50% 0%",
    visualWord: "Market / Reward / Local",
  },
  {
    slug: "datawave",
    number: "10",
    title: "DATAWAVE",
    category: "AI Tech Promo Video",
    description: "데이터와 디지털 전환 메시지를 짧은 시각 내러티브로 번역한 AI 홍보영상.",
    tags: ["Tech", "Data", "Promo", "AI Video"],
    url: "https://youtu.be/-P1eXoP4Wag",
    type: "YOUTUBE",
    tone: "datawave",
    accent: "#00d4ff",
    screenshot: "./assets/ai-archive/datawave-capture.png",
    imagePosition: "50% 50%",
    visualWord: "Data / Flow / Signal",
  },
  {
    slug: "koedc",
    number: "11",
    title: "KOEDC",
    category: "AI Public Explainer Video",
    description: "한국희귀필수의약품센터의 역할과 절차를 정보전달형 영상으로 구조화한 프로젝트.",
    tags: ["Public", "Explainer", "Video", "Healthcare"],
    url: "https://www.youtube.com/watch?v=fI4bXfMwzYE",
    type: "YOUTUBE",
    tone: "koedc",
    accent: "#7fffe0",
    screenshot: "./assets/ai-archive/koedc.png",
    imagePosition: "50% 50%",
    visualWord: "Public / Access / Care",
  },
  {
    slug: "gwangju",
    number: "12",
    title: "GWANGJU",
    category: "AI Local Campaign Shorts",
    description: "지역의 장면과 이동감을 세로형 숏츠로 편집한 로컬 캠페인 영상 스터디.",
    tags: ["Video", "Shorts", "Local", "Campaign"],
    url: "",
    type: "VIDEO",
    tone: "gwangju",
    accent: "#7fffe0",
    screenshot: "./assets/ai-archive/videos/gwangju-poster.jpg",
    imagePosition: "50% 50%",
    video: "./assets/ai-archive/videos/gwangju-preview.mp4",
    videoOrientation: "portrait",
    visualWord: "Local / Walk / Scene",
  },
  {
    slug: "flaseek",
    number: "13",
    title: "Flaseek!",
    category: "AI Fashion Product Shorts",
    description: "패션 제품과 광고 문구를 빠른 템포로 결합한 세로형 AI 숏츠.",
    tags: ["Video", "Shorts", "Fashion", "Product"],
    url: "",
    type: "VIDEO",
    tone: "flaseek",
    accent: "#c5ff4a",
    screenshot: "./assets/ai-archive/videos/flaseek-poster.jpg",
    imagePosition: "50% 50%",
    video: "./assets/ai-archive/videos/flaseek-preview.mp4",
    videoOrientation: "portrait",
    visualWord: "Product / Speed / Drop",
  },
  {
    slug: "ai-labs",
    number: "14",
    title: "AI Labs",
    category: "Learning Archive & Experiments",
    description: "교육과 실험을 통해 축적한 AI 툴 테스트, 워크플로우 스터디, 프로토타입 아카이브.",
    tags: ["Archive", "Workflow", "Study", "Experiment"],
    url: "http://jlabs.dothome.co.kr/#ai-labs",
    type: "ARCHIVE",
    tone: "labs",
    accent: "#7fffe0",
    screenshot: "./assets/ai-archive/hero-ai-future.png",
    imagePosition: "50% 50%",
    visualWord: "Tools / Workflow / Notes",
  },
];

const btlArchive = [
  ["hurom-retail", "Hurom Retail", "Retail POP and field execution", "btl-hurom"],
  ["korea-pavilion", "Korea Pavilion", "Exhibition operation and communication", "btl-korea-pavilion"],
  ["field-systems", "Field Execution Systems", "Repeatable POP and operational applications", "btl-field-system"],
].map(([slug, title, role, imageKey]) => ({
  slug, title, role, image: imageSets[imageKey],
}));

const profile = {
  intro: "Brand, space, BTL, and operations experience accumulated across Korea, China, and Japan. AI now expands that practical foundation into faster research, broader visual exploration, and new campaign possibilities.",
  stages: [
    {
      period: "2025–Now",
      title: "Brand Content & AI Strategy",
      place: "Independent / Gallery Flowers",
      description: "Connecting brand operation, content direction, web structure, and AI-assisted campaign development.",
    },
    {
      period: "2016–2020",
      title: "BTL & Brand Experience",
      place: "Supa Decoration Design, Beijing",
      description: "Leading exhibitions, retail POP, SI systems, and field execution for Samsung, KD Navien, Lenovo, Hurom, and other brands.",
    },
    {
      period: "2010–2016",
      title: "Service & Space Business Planning",
      place: "Daelim B&Co / Japan Business",
      description: "Planning service flows, product and space businesses, and cross-border projects from research through delivery.",
    },
    {
      period: "2005–2010",
      title: "Architecture & Technical Coordination",
      place: "SAI Architectural Planning",
      description: "Building an architectural foundation through design participation and technical coordination across Korea and Japan.",
    },
  ],
};
const portfolioData = { categories, projects, aiArchive, btlArchive, imageSets, profile };

if (typeof window !== "undefined") window.PORTFOLIO_DATA = portfolioData;
if (typeof module !== "undefined") module.exports = portfolioData;
})();
