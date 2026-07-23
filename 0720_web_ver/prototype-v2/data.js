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

const imageKeys = [
  "hero-branding", "hero-ai", "hero-space",
  "gallery-flowers", "kd-navien-brand", "benzhi-life", "sk-bullsone",
  "elora", "elora-keyvisual", "genz-glitch", "alldayfit", "market-marble",
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

function entry(slug, role, chapter = "", previewKey = slug) {
  return { slug, role, chapter, previewKey };
}

const categories = [
  {
    id: "branding",
    label: "BRANDING+",
    hero: imageSet("hero-branding"),
    entries: [
      entry("gallery-flowers", "Identity / space / content / operation"),
      entry("kd-navien", "China SI manual", "brand-system", "kd-navien-brand"),
      entry("benzhi-life", "Lifestyle retail identity"),
      entry("sk-bullsone", "Service-center identity"),
    ],
  },
  {
    id: "ai",
    label: "AI+",
    hero: imageSet("hero-ai"),
    entries: [
      entry("elora", "AI perfume campaign film"),
      entry("genz-glitch", "AI beauty brand concept"),
      entry("alldayfit", "OEM business review / lookbook"),
      entry("market-marble", "AI editorial market concept"),
    ],
  },
  {
    id: "space",
    label: "SPACE BTL+",
    hero: imageSet("hero-space"),
    entries: [
      entry("samsung-display-798", "B2B experience center"),
      entry("kd-navien", "AWE / ISH exhibition", "exhibition-space", "kd-navien-space"),
      entry("lenovo-smart-home", "Smart-home experience"),
      entry("samsung-sds", "Technology exhibition"),
    ],
  },
];

const projects = {
  "gallery-flowers": {
    slug: "gallery-flowers", title: "Gallery Flowers", category: "branding",
    year: "2024-2026", role: "Brand / Spatial / Content Direction",
    scope: "Brand, space, menu, content, web IA, operation",
    thesis: "A fragmented hospitality business became one connected brand experience.",
    problem: "The venue, menu, content, and digital touchpoints needed one recognizable operating language.",
    judgment: "Treat the brand as an experience system rather than a logo-led identity exercise.",
    contribution: "Connected identity, spatial touchpoints, menu storytelling, content, web structure, and operational use.",
    image: imageSets["gallery-flowers"], liveUrl: "", detailMode: "full",
  },
  "kd-navien": {
    slug: "kd-navien", title: "KD Navien China", category: "branding",
    year: "2017-2019", role: "Brand Experience / Spatial Direction",
    scope: "SI manual, showroom, AWE / ISH exhibitions",
    thesis: "A repeatable brand system connected product communication, showrooms, and international exhibitions.",
    problem: "Different products and venues needed to communicate one smart-home brand with consistent hierarchy.",
    judgment: "Build a modular communication and spatial system that could scale from manual to field execution.",
    contribution: "Directed the SI logic, visitor communication, product zones, and exhibition applications.",
    image: imageSets["kd-navien-brand"], liveUrl: "", detailMode: "full",
    chapters: {
      "brand-system": {
        category: "branding", image: imageSets["kd-navien-brand"],
        role: "China SI Manual / Brand System",
        problem: "The China market needed an applicable SI standard across products and customer touchpoints.",
        judgment: "Translate brand principles into a repeatable visual and spatial manual.",
      },
      "exhibition-space": {
        category: "space", image: imageSets["kd-navien-space"],
        role: "AWE / ISH Exhibition Direction",
        problem: "Visitors needed to understand multiple products and the smart-home proposition in a short visit.",
        judgment: "Organize the booth around product stories, demonstration moments, and a clear visitor path.",
      },
    },
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
    image: imageSets["elora-keyvisual"], liveUrl: "https://www.jihye.space/", detailMode: "full",
  },
  "genz-glitch": {
    slug: "genz-glitch", title: "GenZ-Glitch", category: "ai",
    year: "2025-2026", role: "AI Beauty Brand Concept",
    scope: "Brand concept, image system, campaign language",
    thesis: "A beauty concept used AI to define a distinctive campaign language and selection system.",
    problem: "A youth beauty idea needed a recognizable attitude rather than a generic futuristic aesthetic.",
    judgment: "Use controlled visual disruption as a repeatable campaign code.",
    contribution: "Defined the concept, art-directed generations, and edited the visual system.",
    image: imageSets["genz-glitch"], liveUrl: "", detailMode: "full",
  },
  alldayfit: {
    slug: "alldayfit", title: "AllDayFit", category: "ai",
    year: "2025-2026", role: "New Business Review / AI Visual Direction",
    scope: "Research, OEM feasibility, audience, lookbook",
    thesis: "Business research and OEM feasibility expanded into an AI-assisted golfwear visual proposition.",
    problem: "Y-company needed to judge whether an OEM golfwear opportunity could become a coherent consumer proposition.",
    judgment: "Connect business review, audience positioning, product direction, and visual proof in one decision flow.",
    contribution: "Structured research and feasibility, then directed the concept lookbook as tangible evidence.",
    image: imageSets.alldayfit, liveUrl: "", detailMode: "full",
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
    image: imageSets["samsung-display-798"], liveUrl: "", detailMode: "full",
  },
  "lenovo-smart-home": {
    slug: "lenovo-smart-home", title: "Lenovo Smart Home Experience", category: "space",
    year: "2018", role: "Experience Space Planning",
    scope: "Smart-home demonstration and retail communication",
    thesis: "Smart-home technology was translated into a visitor-centered demonstration environment.",
    problem: "Connected products needed to feel like one understandable home experience.",
    judgment: "Organize demonstrations around everyday scenarios and visible interaction points.",
    contribution: "Structured the spatial narrative, product zones, and supporting communication.",
    image: imageSets["lenovo-smart-home"], liveUrl: "", detailMode: "short",
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

const evidence = {
  "gallery-flowers": [
    ["gallery-flowers", "Hospitality space", "Space as the physical brand anchor", "50% 50%"],
    ["gallery-brand-system", "Gallery Flowers identity system", "Identity and graphic rules", "50% 50%"],
    ["gallery-menu", "Signature menu lineup", "Menu storytelling and product hierarchy", "50% 50%"],
    ["gallery-content", "Gallery Flowers social content", "Content translated into a repeatable channel language", "50% 50%"],
  ],
  "kd-navien": [
    ["kd-navien-brand", "Navien Mate communication", "Brand and product communication system", "50% 50%"],
    ["kd-navien-space", "KD Navien AWE exhibition", "Exhibition application and visitor path", "50% 50%"],
    ["kd-navien-ish", "KD Navien ISH proposal", "Spatial proposal and demonstration logic", "50% 50%"],
    ["kd-navien-showroom", "KD Navien Shanghai showroom", "Showroom application of the shared system", "50% 50%"],
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
    image: imageSets[key],
    alt,
    caption,
    position,
  }));
  project.process = {
    label: project.detailMode === "full"
      ? "The process evidence connects strategy, selection, and final application."
      : "The short case records the key decision and implementation proof.",
    proof: project.proofs[Math.min(1, project.proofs.length - 1)],
  };
}

const kdNavien = projects["kd-navien"];
kdNavien.chapters["brand-system"].proofs = [
  kdNavien.proofs[0], kdNavien.proofs[3], kdNavien.proofs[1], kdNavien.proofs[2],
];
kdNavien.chapters["brand-system"].process = {
  label: "The SI logic moves from product communication to repeatable showroom and exhibition application.",
  proof: kdNavien.proofs[3],
};
kdNavien.chapters["exhibition-space"].proofs = [
  kdNavien.proofs[1], kdNavien.proofs[2], kdNavien.proofs[3], kdNavien.proofs[0],
];
kdNavien.chapters["exhibition-space"].process = {
  label: "The visitor path connects product stories, demonstration moments, and spatial hierarchy.",
  proof: kdNavien.proofs[2],
};

const aiArchive = [
  ["charlotte-etoile", "Charlotte Etoile", "AI fashion film"],
  ["ddp-fashion-show", "DDP Fashion Show", "AI fashion showcase"],
  ["koedc", "KOEDC", "AI campaign study"],
  ["dandy-korea", "Dandy Korea", "AI company film"],
  ["datawave", "DATAWAVE", "AI promotional film"],
].map(([slug, title, role]) => ({ slug, title, role }));

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
