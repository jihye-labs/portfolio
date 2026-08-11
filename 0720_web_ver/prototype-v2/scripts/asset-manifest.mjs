import path from "node:path";
import { fileURLToPath } from "node:url";

const scriptsDir = path.dirname(fileURLToPath(import.meta.url));
const prototypeDir = path.resolve(scriptsDir, "..");
const portfolioDir = path.resolve(scriptsDir, "../../..");
const workspaceDir = path.resolve(scriptsDir, "../..");

export const variants = [
  { width: 480, quality: 76 },
  { width: 1280, quality: 82 },
];

export const sources = {
  "hero-branding": path.join(prototypeDir, "assets/branding-chromatic.png"),
  "hero-ai": path.join(prototypeDir, "assets/ai-glass-bloom-v2.png"),
  "hero-space": path.join(prototypeDir, "assets/space-chromatic.png"),
  "gallery-flowers": path.join(portfolioDir, "web/public/media/gallery-flowers/interior-hero.jpg"),
  "gallery-flowers-hero": path.join(prototypeDir, "assets/gallery-flowers-hero.png"),
  "kd-navien-brand": path.join(portfolioDir, "web/public/media/kd-navien/navien-mate.webp"),
  "benzhi-life": path.join(portfolioDir, "web/public/media/btl-archive/xiang-after.webp"),
  "sk-bullsone": path.join(portfolioDir, "web/public/media/btl-archive/sk-spatial-identity.webp"),
  "elora": path.join(portfolioDir, "web/public/media/ai-archive/elora-poster.webp"),
  "elora-keyvisual": path.join(prototypeDir, "assets/elora-keyvisual.jpg"),
  "nike-study": path.join(prototypeDir, "assets/nike-visual-study-main.png"),
  "ai-archive-main": path.join(prototypeDir, "assets/ai-campaign-archive-main.png"),
  "genz-glitch": path.join(workspaceDir, "4-2_AIWORKS/4_genZglichi/genZglichi.png"),
  "alldayfit": path.join(portfolioDir, "web/public/media/ai-archive/alldayfit-hero.jpg"),
  "market-marble": path.join(portfolioDir, "web/public/media/ai-archive/marketmable-hero.jpg"),
  "samsung-display-798": path.join(portfolioDir, "web/public/media/samsung-display/experience-center.webp"),
  "kd-navien-space": path.join(portfolioDir, "web/public/media/kd-navien/awe-hero.png"),
  "lenovo-smart-home": path.join(portfolioDir, "web/public/media/btl-archive/lenovo-pop.webp"),
  "samsung-sds": path.join(portfolioDir, "web/public/media/btl-archive/samsung-sds-pop.webp"),
  "gallery-brand-system": path.join(portfolioDir, "web/public/media/gallery-flowers/brand-system.png"),
  "gallery-menu": path.join(portfolioDir, "web/public/media/gallery-flowers/signature-lineup.webp"),
  "gallery-content": path.join(portfolioDir, "web/public/media/gallery-flowers/cafe-instagram.webp"),
  "gallery-space": path.join(portfolioDir, "web/public/media/gallery-flowers/space-cinematic.webp"),
  "kd-navien-usp": path.join(portfolioDir, "web/public/media/kd-navien/usp-flash.webp"),
  "kd-navien-ish": path.join(portfolioDir, "web/public/media/kd-navien/ish-spatial-proposal.webp"),
  "kd-navien-showroom": path.join(portfolioDir, "web/public/media/kd-navien/shanghai-showroom-proposal.webp"),
  "elora-frame-01": path.join(portfolioDir, "tmp/audit-elora-03.jpg"),
  "elora-frame-02": path.join(portfolioDir, "tmp/audit-elora-09.jpg"),
  "elora-frame-03": path.join(portfolioDir, "tmp/audit-elora-17.jpg"),
  "alldayfit-look-01": path.join(portfolioDir, "tmp/audit-alldayfit-03.jpg"),
  "alldayfit-look-02": path.join(portfolioDir, "tmp/audit-alldayfit-09.jpg"),
  "alldayfit-look-03": path.join(portfolioDir, "tmp/audit-alldayfit-21.jpg"),
  "samsung-display-spatial": path.join(portfolioDir, "web/public/media/samsung-display/spatial-proposal.webp"),
  "samsung-display-onyx": path.join(portfolioDir, "web/public/media/samsung-display/onyx-meeting.webp"),
  "samsung-display-device": path.join(portfolioDir, "web/public/media/samsung-display/display-device.webp"),
  "benzhi-before": path.join(workspaceDir, "4-1 BTL/xiangbangbang/benzhi_before.png"),
  "benzhi-facade": path.join(workspaceDir, "4-1 BTL/xiangbangbang/benzhi.png"),
  "sk-bullsone-pop": path.join(workspaceDir, "4-1 BTL/sk_rubricants/SKRubricants.png"),
  "sk-bullsone-detail": path.join(workspaceDir, "4-1 BTL/sk_rubricants/7.png"),
  "market-marble-panorama": path.join(workspaceDir, "4-2_AIWORKS/1_MarketMable/images/panorama_market.jpg"),
  "market-marble-detail": path.join(workspaceDir, "4-2_AIWORKS/1_MarketMable/images/reve2.jpg"),
  "lenovo-render": path.join(workspaceDir, "4-1 BTL/lenovo/1.png"),
  "lenovo-pop-detail": path.join(workspaceDir, "4-1 BTL/lenovo/lenovo_pop1.png"),
  "samsung-sds-exhibition": path.join(workspaceDir, "4-1 BTL/samsungSDS/samsung_SDS_전시.png"),
  "btl-hurom": path.join(portfolioDir, "web/public/media/btl-archive/hurom-retail.webp"),
  "btl-korea-pavilion": path.join(portfolioDir, "web/public/media/btl-archive/korea-pavilion.webp"),
  "btl-field-system": path.join(portfolioDir, "web/public/media/btl-archive/lenovo-pop.webp"),
};
