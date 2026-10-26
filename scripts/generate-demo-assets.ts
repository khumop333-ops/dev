import fs from "fs";
import path from "path";

const demoDir = path.join(process.cwd(), "public/images/demo");
const uploadsDir = path.join(process.cwd(), "public/uploads");

fs.mkdirSync(demoDir, { recursive: true });
fs.mkdirSync(uploadsDir, { recursive: true });
fs.writeFileSync(path.join(uploadsDir, ".gitkeep"), "");

interface SpecimenCardSpec {
  filename: string;
  code: string;
  category: string;
  title: string;
  subtitle: string;
  bg: string;
  panelBg: string;
  stroke: string;
  accent: string;
  motif: "botanical" | "preroll" | "apothecary" | "tincture" | "extract" | "accessory";
}

function renderMotif(motif: SpecimenCardSpec["motif"], stroke: string, accent: string): string {
  switch (motif) {
    case "botanical":
      return `
        <g transform="translate(300, 250)" fill="none" stroke="${stroke}" stroke-width="1.5">
          <path d="M0,110 L0,-95" />
          <path d="M0,55 C-45,45 -65,10 -45,-20 C-20,-10 -5,20 0,55 Z" fill="${accent}" fill-opacity="0.12" />
          <path d="M0,30 C45,20 65,-15 45,-45 C20,-35 5,-5 0,30 Z" fill="${stroke}" fill-opacity="0.08" />
          <path d="M0,-5 C-40,-15 -55,-50 -35,-75 C-15,-65 -5,-35 0,-5 Z" fill="${stroke}" fill-opacity="0.08" />
          <path d="M0,-35 C35,-45 48,-75 30,-95 C12,-85 4,-60 0,-35 Z" fill="${accent}" fill-opacity="0.12" />
          <circle cx="0" cy="-102" r="5" fill="${accent}" stroke="none" />
          <circle cx="-52" cy="-25" r="3" fill="${stroke}" stroke="none" />
          <circle cx="52" cy="-50" r="3" fill="${stroke}" stroke="none" />
        </g>
      `;
    case "preroll":
      return `
        <g transform="translate(300, 250)" fill="none" stroke="${stroke}" stroke-width="1.5">
          <rect x="-55" y="-85" width="32" height="170" rx="4" fill="#FFFFFF" />
          <line x1="-55" y1="35" x2="-23" y2="35" />
          <rect x="-15" y="-95" width="32" height="180" rx="4" fill="#FFFFFF" />
          <line x1="-15" y1="25" x2="17" y2="25" />
          <rect x="25" y="-75" width="32" height="160" rx="4" fill="#FFFFFF" />
          <line x1="25" y1="45" x2="57" y2="45" />
          <circle cx="1" cy="-112" r="4" fill="${accent}" stroke="none" />
        </g>
      `;
    case "apothecary":
      return `
        <g transform="translate(300, 255)" fill="none" stroke="${stroke}" stroke-width="1.5">
          <rect x="-70" y="-45" width="140" height="115" rx="6" fill="#FFFFFF" />
          <rect x="-52" y="-68" width="104" height="23" rx="3" fill="${accent}" fill-opacity="0.18" />
          <rect x="-48" y="-18" width="96" height="60" fill="none" />
          <line x1="-30" y1="2" x2="30" y2="2" />
          <line x1="-22" y1="16" x2="22" y2="16" />
          <circle cx="0" cy="-8" r="3" fill="${accent}" stroke="none" />
        </g>
      `;
    case "tincture":
      return `
        <g transform="translate(300, 255)" fill="none" stroke="${stroke}" stroke-width="1.5">
          <path d="M-22,-95 L22,-95 L18,-62 L-18,-62 Z" fill="${stroke}" fill-opacity="0.15" />
          <rect x="-28" y="-62" width="56" height="18" rx="2" fill="#FFFFFF" />
          <path d="M-22,-44 L-45,-15 L-45,85 C-45,92 -39,98 -32,98 L32,98 C39,98 45,92 45,85 L45,-15 L22,-44 Z" fill="#FFFFFF" />
          <rect x="-32" y="-2" width="64" height="72" fill="${accent}" fill-opacity="0.1" />
          <line x1="-18" y1="22" x2="18" y2="22" />
          <line x1="-14" y1="38" x2="14" y2="38" />
        </g>
      `;
    case "extract":
      return `
        <g transform="translate(300, 250)" fill="none" stroke="${stroke}" stroke-width="1.5">
          <circle cx="0" cy="0" r="76" fill="#FFFFFF" />
          <circle cx="0" cy="0" r="54" fill="${accent}" fill-opacity="0.16" />
          <circle cx="0" cy="0" r="26" fill="${stroke}" fill-opacity="0.08" />
          <line x1="-95" y1="0" x2="-76" y2="0" />
          <line x1="76" y1="0" x2="95" y2="0" />
          <line x1="0" y1="-95" x2="0" y2="-76" />
          <line x1="0" y1="76" x2="0" y2="95" />
        </g>
      `;
    case "accessory":
      return `
        <g transform="translate(300, 250)" fill="none" stroke="${stroke}" stroke-width="1.5">
          <rect x="-68" y="-68" width="136" height="136" rx="8" fill="#FFFFFF" />
          <circle cx="0" cy="0" r="46" />
          <circle cx="0" cy="0" r="14" fill="${accent}" fill-opacity="0.2" />
          <line x1="-46" y1="0" x2="-14" y2="0" />
          <line x1="14" y1="0" x2="46" y2="0" />
          <line x1="0" y1="-46" x2="0" y2="-14" />
          <line x1="0" y1="14" x2="0" y2="46" />
        </g>
      `;
  }
}

function buildSpecimenSvg(spec: SpecimenCardSpec): string {
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 600 600" width="600" height="600" role="img" aria-label="${spec.title}">
  <rect width="600" height="600" fill="${spec.bg}" />
  <rect x="28" y="28" width="544" height="544" fill="none" stroke="#D6CBB9" stroke-width="1" />
  <rect x="64" y="96" width="472" height="320" fill="${spec.panelBg}" stroke="#D6CBB9" stroke-width="1" />
  <text x="64" y="68" font-family="Georgia, serif" font-size="13" fill="#5F5B52" letter-spacing="2">${spec.category.toUpperCase()}</text>
  <text x="536" y="68" font-family="monospace" font-size="12" fill="#5F5B52" text-anchor="end">${spec.code}</text>
  ${renderMotif(spec.motif, spec.stroke, spec.accent)}
  <line x1="64" y1="454" x2="536" y2="454" stroke="#D6CBB9" stroke-width="1" />
  <text x="64" y="492" font-family="Georgia, serif" font-size="24" fill="#1C1C19">${spec.title}</text>
  <text x="64" y="522" font-family="system-ui, sans-serif" font-size="13" fill="#5F5B52" letter-spacing="0.5">${spec.subtitle}</text>
  <text x="536" y="522" font-family="system-ui, sans-serif" font-size="11" fill="#23452F" text-anchor="end" letter-spacing="1.5">HIGHVELD HERBAL CO.</text>
</svg>`;
}

const specs: SpecimenCardSpec[] = [
  // Categories
  {
    filename: "category-flower.svg",
    code: "CAT-01",
    category: "Botanical Category",
    title: "Cured Dried Flower",
    subtitle: "Small-batch indoor & greenhouse cultivars",
    bg: "#F7F3EA",
    panelBg: "#EFE9DC",
    stroke: "#23452F",
    accent: "#B85C38",
    motif: "botanical",
  },
  {
    filename: "category-prerolls.svg",
    code: "CAT-02",
    category: "Botanical Category",
    title: "Prepared Pre-Rolls",
    subtitle: "Whole-flower unbleached paper rolls",
    bg: "#F7F3EA",
    panelBg: "#EFE9DC",
    stroke: "#23452F",
    accent: "#B85C38",
    motif: "preroll",
  },
  {
    filename: "category-edibles.svg",
    code: "CAT-03",
    category: "Botanical Category",
    title: "Botanical Confectionery",
    subtitle: "Measured pastilles & artisanal infusions",
    bg: "#F7F3EA",
    panelBg: "#EFE9DC",
    stroke: "#23452F",
    accent: "#B85C38",
    motif: "apothecary",
  },
  {
    filename: "category-extracts.svg",
    code: "CAT-04",
    category: "Botanical Category",
    title: "Solventless & Extracts",
    subtitle: "Cold-pressed rosin & botanical concentrates",
    bg: "#F7F3EA",
    panelBg: "#EFE9DC",
    stroke: "#23452F",
    accent: "#B85C38",
    motif: "extract",
  },
  {
    filename: "category-wellness.svg",
    code: "CAT-05",
    category: "Botanical Category",
    title: "CBD & Apothecary",
    subtitle: "Sublingual oils & botanical balms",
    bg: "#F7F3EA",
    panelBg: "#EFE9DC",
    stroke: "#23452F",
    accent: "#B85C38",
    motif: "tincture",
  },
  {
    filename: "category-accessories.svg",
    code: "CAT-06",
    category: "Botanical Category",
    title: "Storage & Hardware",
    subtitle: "Airtight glass vessels & precision tools",
    bg: "#F7F3EA",
    panelBg: "#EFE9DC",
    stroke: "#23452F",
    accent: "#B85C38",
    motif: "accessory",
  },

  // Products
  {
    filename: "product-apricot-reserve.svg",
    code: "SPEC-101",
    category: "Dried Flower",
    title: "Highveld Apricot Reserve",
    subtitle: "Glass-cured whole flower • Stone-fruit & cedar",
    bg: "#F7F3EA",
    panelBg: "#EFE9DC",
    stroke: "#23452F",
    accent: "#B85C38",
    motif: "botanical",
  },
  {
    filename: "product-magalies-haze.svg",
    code: "SPEC-102",
    category: "Dried Flower",
    title: "Magalies Bergamot Haze",
    subtitle: "Sun-grown heritage cultivar • Citrus & pine",
    bg: "#F7F3EA",
    panelBg: "#E7DECF",
    stroke: "#23452F",
    accent: "#2F6B4F",
    motif: "botanical",
  },
  {
    filename: "product-waterkloof-kush.svg",
    code: "SPEC-103",
    category: "Dried Flower",
    title: "Waterkloof Evening Reserve",
    subtitle: "Indoor small-batch flower • Earthy & clove",
    bg: "#F7F3EA",
    panelBg: "#EFE9DC",
    stroke: "#1C1C19",
    accent: "#B85C38",
    motif: "botanical",
  },
  {
    filename: "product-bushveld-preroll.svg",
    code: "SPEC-201",
    category: "Pre-Rolls",
    title: "Bushveld Classic Single Roll",
    subtitle: "0.75g whole-flower roll • Unbleached hemp paper",
    bg: "#F7F3EA",
    panelBg: "#EFE9DC",
    stroke: "#23452F",
    accent: "#B85C38",
    motif: "preroll",
  },
  {
    filename: "product-evening-duet.svg",
    code: "SPEC-202",
    category: "Pre-Rolls",
    title: "Jacaranda Dusk Twin Pack",
    subtitle: "2 × 0.5g balanced flower rolls •Reusable tin",
    bg: "#F7F3EA",
    panelBg: "#E7DECF",
    stroke: "#23452F",
    accent: "#B85C38",
    motif: "preroll",
  },
  {
    filename: "product-rooibos-pastilles.svg",
    code: "SPEC-301",
    category: "Edibles",
    title: "Cederberg Rooibos & Honey Pastilles",
    subtitle: "10 pieces per tin • Botanical pectin pastilles",
    bg: "#F7F3EA",
    panelBg: "#EFE9DC",
    stroke: "#23452F",
    accent: "#B85C38",
    motif: "apothecary",
  },
  {
    filename: "product-citrus-drops.svg",
    code: "SPEC-302",
    category: "Edibles",
    title: "Lowveld Naartjie Botanical Chews",
    subtitle: "10 pieces per jar • Natural citrus peel oil",
    bg: "#F7F3EA",
    panelBg: "#E7DECF",
    stroke: "#23452F",
    accent: "#956A1C",
    motif: "apothecary",
  },
  {
    filename: "product-pressed-rosin.svg",
    code: "SPEC-401",
    category: "Extracts",
    title: "Cold-Pressed Botanical Rosin",
    subtitle: "Solventless mechanical press • 1g UV glass jar",
    bg: "#F7F3EA",
    panelBg: "#EFE9DC",
    stroke: "#1C1C19",
    accent: "#B85C38",
    motif: "extract",
  },
  {
    filename: "product-amber-distillate.svg",
    code: "SPEC-402",
    category: "Extracts",
    title: "Refined Botanical Vape Cartridge",
    subtitle: "510-thread ceramic core • Terpene-rich extract",
    bg: "#F7F3EA",
    panelBg: "#E7DECF",
    stroke: "#23452F",
    accent: "#B85C38",
    motif: "extract",
  },
  {
    filename: "product-botanical-tincture.svg",
    code: "SPEC-501",
    category: "CBD & Wellness",
    title: "Full-Spectrum Botanical Drops 600mg",
    subtitle: "30ml amber dropper • Cold-pressed MCT carrier",
    bg: "#F7F3EA",
    panelBg: "#EFE9DC",
    stroke: "#23452F",
    accent: "#2F6B4F",
    motif: "tincture",
  },
  {
    filename: "product-recovery-balm.svg",
    code: "SPEC-502",
    category: "CBD & Wellness",
    title: "Marula & Arnica Topical Salve",
    subtitle: "50ml glass jar • External botanical application",
    bg: "#F7F3EA",
    panelBg: "#E7DECF",
    stroke: "#23452F",
    accent: "#B85C38",
    motif: "apothecary",
  },
  {
    filename: "product-brass-grinder.svg",
    code: "SPEC-601",
    category: "Accessories",
    title: "Milled Anodised Herb Mill (55mm)",
    subtitle: "4-piece machined aluminium • Magnetic lid",
    bg: "#F7F3EA",
    panelBg: "#EFE9DC",
    stroke: "#1C1C19",
    accent: "#B85C38",
    motif: "accessory",
  },
  {
    filename: "product-glass-jar.svg",
    code: "SPEC-602",
    category: "Accessories",
    title: "Ultraviolet Apothecary Storage Vessel",
    subtitle: "250ml heavy violet glass • Airtight screw seal",
    bg: "#F7F3EA",
    panelBg: "#E7DECF",
    stroke: "#23452F",
    accent: "#2F6B4F",
    motif: "apothecary",
  },
];

for (const spec of specs) {
  fs.writeFileSync(path.join(demoDir, spec.filename), buildSpecimenSvg(spec));
}

// Hero editorial SVG
const heroSvg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 900" width="800" height="900" role="img" aria-label="Highveld Herbal Co. Botanical Specimen">
  <rect width="800" height="900" fill="#23452F" />
  <rect x="36" y="36" width="728" height="828" fill="none" stroke="#E7DECF" stroke-opacity="0.3" stroke-width="1" />
  <rect x="84" y="120" width="632" height="540" fill="#F7F3EA" stroke="#D6CBB9" stroke-width="1" />
  <text x="84" y="88" font-family="Georgia, serif" font-size="14" fill="#E7DECF" letter-spacing="3">PRETORIA BOTANICAL DISPENSARY • EST. GP</text>
  <text x="716" y="88" font-family="monospace" font-size="13" fill="#E7DECF" text-anchor="end">25.7479° S, 28.2293° E</text>
  <g transform="translate(400, 390)" fill="none" stroke="#23452F" stroke-width="1.75">
    <line x1="0" y1="180" x2="0" y2="-165" />
    <path d="M0,105 C-80,90 -115,30 -80,-25 C-35,-10 -10,45 0,105 Z" fill="#23452F" fill-opacity="0.09" />
    <path d="M0,65 C80,50 115,-10 80,-65 C35,-50 10,5 0,65 Z" fill="#B85C38" fill-opacity="0.14" />
    <path d="M0,5 C-70,-10 -95,-70 -60,-115 C-25,-100 -8,-45 0,5 Z" fill="#23452F" fill-opacity="0.09" />
    <path d="M0,-45 C65,-60 85,-110 55,-150 C22,-135 8,-90 0,-45 Z" fill="#B85C38" fill-opacity="0.14" />
    <circle cx="0" cy="-178" r="8" fill="#B85C38" stroke="none" />
  </g>
  <text x="84" y="724" font-family="Georgia, serif" font-size="32" fill="#F7F3EA">Carefully selected. Clearly presented.</text>
  <text x="84" y="762" font-family="system-ui, sans-serif" font-size="15" fill="#E7DECF" opacity="0.85">Small-batch botanical preparations, transparent batch documentation, and</text>
  <text x="84" y="786" font-family="system-ui, sans-serif" font-size="15" fill="#E7DECF" opacity="0.85">store-confirmed reservations for collection or Pretoria local delivery.</text>
  <line x1="84" y1="816" x2="716" y2="816" stroke="#E7DECF" stroke-opacity="0.25" stroke-width="1" />
  <text x="84" y="842" font-family="monospace" font-size="12" fill="#E7DECF" letter-spacing="1.5">STRICTLY 18+ • NO ONLINE CARD PAYMENT • ZAR PRICING</text>
</svg>`;

fs.writeFileSync(path.join(demoDir, "hero-botanical.svg"), heroSvg);
console.log("Generated", specs.length + 1, "botanical SVG placeholders in public/images/demo/");
