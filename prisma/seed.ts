import bcrypt from "bcryptjs";
import { prisma } from "../src/lib/prisma";
import { defaultSiteConfig } from "../src/config/site";
import { STORE_SETTINGS_KEY } from "../src/lib/settings";

async function main() {
  console.log("Seeding Highveld Herbal Co. database...");

  const adminEmail = (
    process.env.ADMIN_EMAIL || "admin@highveldherbal.co.za"
  ).toLowerCase();
  const adminPassword = process.env.ADMIN_PASSWORD || "ChangeMePretoria2026!";

  const staffEmail = (
    process.env.STAFF_EMAIL || "staff@highveldherbal.co.za"
  ).toLowerCase();
  const staffPassword = process.env.STAFF_PASSWORD || "StaffPretoria2026!";

  if (!process.env.ADMIN_PASSWORD) {
    console.warn(
      "⚠️  WARNING: ADMIN_PASSWORD env var not set. Using development fallback password. Change this immediately before deploying to production."
    );
  }

  const adminHash = await bcrypt.hash(adminPassword, 10);
  const staffHash = await bcrypt.hash(staffPassword, 10);

  const adminUser = await prisma.user.upsert({
    where: { email: adminEmail },
    update: {
      name: "Dispensary Manager (Admin)",
      passwordHash: adminHash,
      role: "ADMIN",
      active: true,
    },
    create: {
      name: "Dispensary Manager (Admin)",
      email: adminEmail,
      passwordHash: adminHash,
      role: "ADMIN",
      active: true,
    },
  });

  await prisma.user.upsert({
    where: { email: staffEmail },
    update: {
      name: "Pretoria Counter Staff",
      passwordHash: staffHash,
      role: "STAFF",
      active: true,
    },
    create: {
      name: "Pretoria Counter Staff",
      email: staffEmail,
      passwordHash: staffHash,
      role: "STAFF",
      active: true,
    },
  });

  // Store Settings
  await prisma.siteSetting.upsert({
    where: { key: STORE_SETTINGS_KEY },
    update: {},
    create: {
      key: STORE_SETTINGS_KEY,
      valueJson: {
        brandName: defaultSiteConfig.brandName,
        tagline: defaultSiteConfig.tagline,
        description: defaultSiteConfig.description,
        addressLine1: defaultSiteConfig.addressLine1,
        suburb: defaultSiteConfig.suburb,
        city: defaultSiteConfig.city,
        province: defaultSiteConfig.province,
        postalCode: defaultSiteConfig.postalCode,
        phone: defaultSiteConfig.phone,
        whatsappNumber: defaultSiteConfig.whatsappNumber,
        whatsappDisplay: defaultSiteConfig.whatsappDisplay,
        email: defaultSiteConfig.email,
        weekdaysHours: defaultSiteConfig.hours.weekdays,
        saturdayHours: defaultSiteConfig.hours.saturday,
        sundayHours: defaultSiteConfig.hours.sunday,
        deliveryFeeCents: defaultSiteConfig.deliveryFeeCents,
        freeDeliveryThresholdCents: defaultSiteConfig.freeDeliveryThresholdCents,
        deliveryAreasText: defaultSiteConfig.deliveryAreas.join(", "),
        salesMode: defaultSiteConfig.salesMode,
        vatNotice: defaultSiteConfig.vatNotice,
        announcementText: defaultSiteConfig.announcementText,
        complianceNotice: defaultSiteConfig.complianceNotice,
      },
    },
  });

  // Categories
  const categoriesData = [
    {
      name: "Flower",
      slug: "flower",
      description:
        "Small-batch dried botanical flower, slow-cured in climate-controlled vaults and trimmed by hand.",
      imageUrl: "/images/demo/category-flower.svg",
      sortOrder: 1,
    },
    {
      name: "Pre-rolls",
      slug: "pre-rolls",
      description:
        "Whole-flower prepared rolls using unbleached hemp paper and ceramic or card crutches. Never filled with trim.",
      imageUrl: "/images/demo/category-prerolls.svg",
      sortOrder: 2,
    },
    {
      name: "Edibles",
      slug: "edibles",
      description:
        "Measured botanical confectionery and fruit pectin pastilles crafted with South African botanicals.",
      imageUrl: "/images/demo/category-edibles.svg",
      sortOrder: 3,
    },
    {
      name: "Extracts",
      slug: "extracts",
      description:
        "Solventless cold-pressed rosin and refined botanical concentrates packaged in UV-protective glass.",
      imageUrl: "/images/demo/category-extracts.svg",
      sortOrder: 4,
    },
    {
      name: "CBD & Wellness",
      slug: "cbd-wellness",
      description:
        "Non-intoxicating sublingual botanical drops and topical salves formulated with cold-pressed carrier oils.",
      imageUrl: "/images/demo/category-wellness.svg",
      sortOrder: 5,
    },
    {
      name: "Accessories",
      slug: "accessories",
      description:
        "Precision-milled herb mills, ultraviolet storage vessels, and humidity-control accessories.",
      imageUrl: "/images/demo/category-accessories.svg",
      sortOrder: 6,
    },
  ];

  const categoriesBySlug: Record<string, { id: string; slug: string }> = {};
  for (const cat of categoriesData) {
    const created = await prisma.category.upsert({
      where: { slug: cat.slug },
      update: cat,
      create: cat,
    });
    categoriesBySlug[cat.slug] = created;
  }

  // Brands
  const brandsData = [
    {
      name: "Highveld Botanicals",
      slug: "highveld-botanicals",
      description:
        "Our Pretoria house selection of slow-cured indoor and glasshouse botanical preparations.",
    },
    {
      name: "Magalies Reserve",
      slug: "magalies-reserve",
      description:
        "Sun-grown and living-soil heritage cultivars cultivated in the Magaliesberg foothills.",
    },
    {
      name: "Cederberg Apothecary",
      slug: "cederberg-apothecary",
      description:
        "Botanical pastilles, tinctures, and balms blending indigenous Cape and Highveld flora.",
    },
    {
      name: "Karoo Craft Collective",
      slug: "karoo-craft-collective",
      description:
        "Small-run solventless extracts and mechanical cold-press preparations.",
    },
    {
      name: "Pretoria Atelier Hardware",
      slug: "pretoria-atelier-hardware",
      description:
        "Durable storage glass and machined preparation tools built for longevity.",
    },
  ];

  const brandsBySlug: Record<string, { id: string; slug: string }> = {};
  for (const b of brandsData) {
    const created = await prisma.brand.upsert({
      where: { slug: b.slug },
      update: b,
      create: b,
    });
    brandsBySlug[b.slug] = created;
  }

  // Products
  const productsData = [
    {
      name: "Highveld Apricot Reserve",
      slug: "highveld-apricot-reserve",
      brandSlug: "highveld-botanicals",
      categorySlug: "flower",
      shortDescription:
        "Indoor glass-cured whole flower with a warm stone-fruit, sweet cedar, and dry herbal bouquet.",
      descriptionMarkdown: `### Cultivar Overview\n\n**Highveld Apricot Reserve** is cultivated in small indoor rooms under full-spectrum lighting and slow-cured for 28 days in humidity-regulated glass vaults.\n\n- **Trim**: Hand-trimmed whole buds\n- **Aroma profile**: Ripe apricot skin, dry cedarwood, and subtle white pepper\n- **Cure**: 28-day cold cure at 60% relative humidity\n\n*Store in a cool, dark place below 22°C. Keep sealed when not in use.*`,
      status: "ACTIVE" as const,
      featured: true,
      productTypeLabel: "Indoor Whole Flower",
      thcContent: "Admin-entered batch value: 21.4%",
      cbdContent: "< 0.5%",
      weightLabel: "1g / 3.5g / 5g",
      terpenes: "Myrcene, Caryophyllene, Limonene",
      flavourNotes: "Apricot, Cedar, Warm Spice",
      batchNumber: "HHC-FL-2026-10A",
      storageNotes:
        "Keep sealed in original ultraviolet glass jar away from direct sunlight and heat sources.",
      image: {
        url: "/images/demo/product-apricot-reserve.svg",
        alt: "Highveld Apricot Reserve botanical specimen card",
      },
      variants: [
        {
          name: "1g Tester Jar",
          sku: "HHC-APR-1G",
          priceCents: 16000, // R 160,00
          stockQuantity: 18,
          reservedQuantity: 1,
          lowStockThreshold: 4,
          sortOrder: 1,
        },
        {
          name: "3.5g Glass Jar",
          sku: "HHC-APR-35G",
          priceCents: 48000, // R 480,00
          stockQuantity: 14,
          reservedQuantity: 1,
          lowStockThreshold: 3,
          sortOrder: 2,
        },
        {
          name: "5g Reserve Tin",
          sku: "HHC-APR-5G",
          priceCents: 65000, // R 650,00
          stockQuantity: 8,
          reservedQuantity: 0,
          lowStockThreshold: 2,
          sortOrder: 3,
        },
      ],
    },
    {
      name: "Magalies Bergamot Haze",
      slug: "magalies-bergamot-haze",
      brandSlug: "magalies-reserve",
      categorySlug: "flower",
      shortDescription:
        "Glasshouse living-soil cultivar presenting crisp bergamot citrus, crushed pine needles, and green tea notes.",
      descriptionMarkdown: `### Cultivar Overview\n\nGrown in mineralized living soil in the Magaliesberg region, **Magalies Bergamot Haze** benefits from natural Highveld sunlight and cool mountain nights.\n\n- **Cultivation**: Living-soil glasshouse\n- **Bouquet**: Bergamot zest, wild rosemary, and fresh pine\n- **Packaging**: Sealed pouch with 62% two-way humidity pack`,
      status: "ACTIVE" as const,
      featured: true,
      productTypeLabel: "Glasshouse Living Soil",
      thcContent: "Admin-entered batch value: 18.8%",
      cbdContent: "0.8%",
      weightLabel: "1g / 3.5g / 7g",
      terpenes: "Terpinolene, Limonene, Pinene",
      flavourNotes: "Bergamot, Pine, Green Tea",
      batchNumber: "MR-BH-2026-09B",
      storageNotes: "Store below 24°C. Reseal pouch firmly after opening.",
      image: {
        url: "/images/demo/product-magalies-haze.svg",
        alt: "Magalies Bergamot Haze botanical specimen card",
      },
      variants: [
        {
          name: "1g Pouch",
          sku: "MR-BER-1G",
          priceCents: 12000, // R 120,00
          stockQuantity: 22,
          reservedQuantity: 0,
          lowStockThreshold: 5,
          sortOrder: 1,
        },
        {
          name: "3.5g Pouch",
          sku: "MR-BER-35G",
          priceCents: 36000, // R 360,00
          stockQuantity: 12,
          reservedQuantity: 0,
          lowStockThreshold: 3,
          sortOrder: 2,
        },
        {
          name: "7g Quarter Jar",
          sku: "MR-BER-7G",
          priceCents: 68000, // R 680,00
          stockQuantity: 2, // Low stock!
          reservedQuantity: 0,
          lowStockThreshold: 3,
          sortOrder: 3,
        },
      ],
    },
    {
      name: "Waterkloof Evening Reserve",
      slug: "waterkloof-evening-reserve",
      brandSlug: "highveld-botanicals",
      categorySlug: "flower",
      shortDescription:
        "Dense, slow-cured indoor cultivar with deep earthy cocoa, roasted coffee bean, and clove aromatics.",
      descriptionMarkdown: `### Cultivar Overview\n\nSelected for its complex aromatic depth, **Waterkloof Evening Reserve** is a small-batch indoor harvest cured in dark violet glass.\n\n- **Structure**: Dense, resinous whole flower\n- **Aroma**: Dark cacao nibs, damp earth, and warm clove\n- **Batch size**: Limited 40-jar release per harvest cycle`,
      status: "ACTIVE" as const,
      featured: false,
      productTypeLabel: "Limited Indoor Batch",
      thcContent: "Admin-entered batch value: 23.0%",
      cbdContent: "< 0.3%",
      weightLabel: "3.5g",
      terpenes: "Caryophyllene, Humulene, Linalool",
      flavourNotes: "Cocoa, Clove, Earth",
      batchNumber: "HHC-WK-2026-10C",
      storageNotes: "Store upright in original glass jar away from heat.",
      image: {
        url: "/images/demo/product-waterkloof-kush.svg",
        alt: "Waterkloof Evening Reserve botanical specimen card",
      },
      variants: [
        {
          name: "3.5g Violet Glass Jar",
          sku: "HHC-WKR-35G",
          priceCents: 52000, // R 520,00
          stockQuantity: 3, // Low stock state
          reservedQuantity: 1,
          lowStockThreshold: 3,
          sortOrder: 1,
        },
        {
          name: "7g Collector Tin",
          sku: "HHC-WKR-7G",
          priceCents: 98000, // R 980,00
          stockQuantity: 0, // Out of stock state
          reservedQuantity: 0,
          lowStockThreshold: 2,
          sortOrder: 2,
        },
      ],
    },
    {
      name: "Bushveld Classic Single Roll (0.75g)",
      slug: "bushveld-classic-single-roll",
      brandSlug: "magalies-reserve",
      categorySlug: "pre-rolls",
      shortDescription:
        "Single 0.75g whole-flower roll in unbleached organic hemp paper, housed in a reusable aluminium tube.",
      descriptionMarkdown: `### Preparation Details\n\nPrepared daily in small runs using ground whole flower—never shake, leaf, or trim.\n\n- **Weight**: 0.75g net botanical flower\n- **Paper**: Unbleached organic hemp paper with spiral card filter\n- **Container**: Airtight screw-top aluminium travel tube`,
      status: "ACTIVE" as const,
      featured: true,
      productTypeLabel: "Single Whole-Flower Roll",
      thcContent: "Admin-entered batch value: 19.0%",
      cbdContent: "< 0.5%",
      weightLabel: "0.75g",
      terpenes: "Myrcene, Pinene",
      flavourNotes: "Toasted Herb, Pine, Citrus Peel",
      batchNumber: "MR-PR-2026-10D",
      storageNotes: "Keep tube capped tightly to preserve freshness.",
      image: {
        url: "/images/demo/product-bushveld-preroll.svg",
        alt: "Bushveld Classic Single Roll specimen card",
      },
      variants: [
        {
          name: "Single Tube (0.75g)",
          sku: "MR-BUSH-1X",
          priceCents: 11000, // R 110,00
          stockQuantity: 30,
          reservedQuantity: 2,
          lowStockThreshold: 5,
          sortOrder: 1,
        },
        {
          name: "Bundle of 3 Tubes (2.25g)",
          sku: "MR-BUSH-3X",
          priceCents: 29500, // R 295,00
          stockQuantity: 15,
          reservedQuantity: 0,
          lowStockThreshold: 3,
          sortOrder: 2,
        },
      ],
    },
    {
      name: "Jacaranda Dusk Twin Pack (2 × 0.5g)",
      slug: "jacaranda-dusk-twin-pack",
      brandSlug: "highveld-botanicals",
      categorySlug: "pre-rolls",
      shortDescription:
        "Two measured 0.5g whole-flower rolls presented in a brushed steel pocket tin.",
      descriptionMarkdown: `### Preparation Details\n\nDesigned for shorter, measured sessions, the **Jacaranda Dusk Twin Pack** contains two 0.5g rolls milled from our indoor evening flower selection.\n\n- **Contents**: 2 × 0.5g whole-flower rolls (1.0g total)\n- **Presentation**: Brushed slide-top tin with humidity sachet`,
      status: "ACTIVE" as const,
      featured: false,
      productTypeLabel: "Twin Pre-Roll Tin",
      thcContent: "Admin-entered batch value: 20.2%",
      cbdContent: "0.6%",
      weightLabel: "1.0g (2 × 0.5g)",
      terpenes: "Linalool, Caryophyllene",
      flavourNotes: "Lavender, Sweet Wood, Spice",
      batchNumber: "HHC-JD-2026-10E",
      storageNotes: "Store flat in cool conditions.",
      image: {
        url: "/images/demo/product-evening-duet.svg",
        alt: "Jacaranda Dusk Twin Pack specimen card",
      },
      variants: [
        {
          name: "Twin Pack Tin (2 × 0.5g)",
          sku: "HHC-JAC-2X",
          priceCents: 19500, // R 195,00
          stockQuantity: 19,
          reservedQuantity: 0,
          lowStockThreshold: 4,
          sortOrder: 1,
        },
      ],
    },
    {
      name: "Cederberg Rooibos & Honey Pastilles",
      slug: "cederberg-rooibos-honey-pastilles",
      brandSlug: "cederberg-apothecary",
      categorySlug: "edibles",
      shortDescription:
        "Artisanal fruit-pectin pastilles infused with organic Cederberg rooibos reduction and raw fynbos honey.",
      descriptionMarkdown: `### Botanical Confectionery\n\nCrafted in small culinary batches using plant-based citrus pectin, brewed Cederberg rooibos tea, and unheated blossom honey.\n\n- **Quantity**: 10 pastilles per tin\n- **Formulation**: Vegan pectin base (gelatine-free, gluten-free)\n- **Important note**: Onset of ingested botanical products may take between 60 and 120 minutes. Keep strictly out of reach of children.`,
      status: "ACTIVE" as const,
      featured: true,
      productTypeLabel: "Botanical Pastilles (10 Pack)",
      thcContent: "Admin-entered batch value: 10mg per pastille",
      cbdContent: "10mg per pastille (1:1 ratio)",
      weightLabel: "45g net (10 pieces)",
      flavourNotes: "Brewed Rooibos, Fynbos Honey, Lemon Peel",
      batchNumber: "CA-RP-2026-09F",
      storageNotes: "Store below 20°C or refrigerate during warm Highveld summer months.",
      image: {
        url: "/images/demo/product-rooibos-pastilles.svg",
        alt: "Cederberg Rooibos and Honey Pastilles specimen card",
      },
      variants: [
        {
          name: "Tin of 10 Pastilles",
          sku: "CA-ROO-10",
          priceCents: 28000, // R 280,00
          stockQuantity: 16,
          reservedQuantity: 1,
          lowStockThreshold: 4,
          sortOrder: 1,
        },
      ],
    },
    {
      name: "Lowveld Naartjie Botanical Chews",
      slug: "lowveld-naartjie-botanical-chews",
      brandSlug: "cederberg-apothecary",
      categorySlug: "edibles",
      shortDescription:
        "Bright tangerine and cold-pressed naartjie peel botanical chews in a child-resistant glass jar.",
      descriptionMarkdown: `### Botanical Confectionery\n\nFlavoured with cold-pressed South African naartjie peel oil and tart orchard citrus.\n\n- **Quantity**: 10 chews per child-resistant glass jar\n- **Ingredients**: Cane sugar, glucose, citrus pectin, cold-pressed naartjie oil, botanical extract\n- **Storage**: Keep sealed in a cool pantry away from sunlight.`,
      status: "ACTIVE" as const,
      featured: false,
      productTypeLabel: "Citrus Botanical Chews",
      thcContent: "Admin-entered batch value: 15mg per chew",
      cbdContent: "< 1mg",
      weightLabel: "50g net (10 pieces)",
      flavourNotes: "Naartjie Zest, Sweet Mandarin",
      batchNumber: "CA-NC-2026-10G",
      storageNotes: "Keep child-resistant cap firmly locked after opening.",
      image: {
        url: "/images/demo/product-citrus-drops.svg",
        alt: "Lowveld Naartjie Botanical Chews specimen card",
      },
      variants: [
        {
          name: "Jar of 10 Chews",
          sku: "CA-NAA-10",
          priceCents: 31000, // R 310,00
          stockQuantity: 11,
          reservedQuantity: 0,
          lowStockThreshold: 3,
          sortOrder: 1,
        },
      ],
    },
    {
      name: "Cold-Pressed Botanical Rosin (1g)",
      slug: "cold-pressed-botanical-rosin",
      brandSlug: "karoo-craft-collective",
      categorySlug: "extracts",
      shortDescription:
        "100% solventless live rosin extracted strictly via ice water, heat, and mechanical pressure.",
      descriptionMarkdown: `### Solventless Extraction\n\nPressed at low temperatures (78°C) through 73-micron filtration bags without chemical solvents or hydrocarbons.\n\n- **Process**: Ice-water hash cold-pressed into badder consistency\n- **Vessel**: 1g airtight ceramic-lined UV glass jar\n- **Handling**: Best stored chilled between 4°C and 10°C; allow jar to reach room temperature before opening to prevent condensation.`,
      status: "ACTIVE" as const,
      featured: true,
      productTypeLabel: "Solventless Live Rosin",
      thcContent: "Admin-entered batch value: 71.5%",
      cbdContent: "1.2%",
      weightLabel: "1.0g",
      terpenes: "Limonene, Caryophyllene, Myrcene",
      flavourNotes: "Candied Citrus, Earthy Pine",
      batchNumber: "KCC-ROS-2026-10H",
      storageNotes: "Refrigerate at 4°C–10°C for optimal terpene preservation.",
      image: {
        url: "/images/demo/product-pressed-rosin.svg",
        alt: "Cold-Pressed Botanical Rosin specimen card",
      },
      variants: [
        {
          name: "1.0g UV Glass Jar",
          sku: "KCC-ROS-1G",
          priceCents: 75000, // R 750,00
          stockQuantity: 6,
          reservedQuantity: 0,
          lowStockThreshold: 2,
          sortOrder: 1,
        },
      ],
    },
    {
      name: "Refined Botanical Vape Cartridge (510 Thread)",
      slug: "refined-botanical-vape-cartridge",
      brandSlug: "karoo-craft-collective",
      categorySlug: "extracts",
      shortDescription:
        "Ceramic-core 510-thread glass cartridge filled with uncut botanical extract and cultivar-derived terpenes.",
      descriptionMarkdown: `### Hardware & Formulation\n\nContains pure botanical extract and botanical terpenes with zero PG, VG, MCT oil, or vitamin E acetate.\n\n- **Thread**: Standard 510 thread (battery sold separately)\n- **Coil**: Medical-grade porous ceramic heating element\n- **Volume**: Available in 0.5ml and 1.0ml capacities`,
      status: "ACTIVE" as const,
      featured: false,
      productTypeLabel: "510 Ceramic Cartridge",
      thcContent: "Admin-entered batch value: 82.0%",
      cbdContent: "2.1%",
      weightLabel: "0.5ml / 1.0ml",
      terpenes: "Pinene, Limonene, Beta-Caryophyllene",
      flavourNotes: "Herbal Citrus, Clean Pine",
      batchNumber: "KCC-VC-2026-09J",
      storageNotes: "Store upright at room temperature out of direct sun.",
      image: {
        url: "/images/demo/product-amber-distillate.svg",
        alt: "Refined Botanical Vape Cartridge specimen card",
      },
      variants: [
        {
          name: "0.5ml Cartridge",
          sku: "KCC-VAPE-05",
          priceCents: 45000, // R 450,00
          stockQuantity: 10,
          reservedQuantity: 0,
          lowStockThreshold: 3,
          sortOrder: 1,
        },
        {
          name: "1.0ml Cartridge",
          sku: "KCC-VAPE-10",
          priceCents: 79000, // R 790,00
          stockQuantity: 7,
          reservedQuantity: 0,
          lowStockThreshold: 2,
          sortOrder: 2,
        },
      ],
    },
    {
      name: "Apothecary CBD Botanical Drops (30ml)",
      slug: "apothecary-cbd-botanical-drops",
      brandSlug: "cederberg-apothecary",
      categorySlug: "cbd-wellness",
      shortDescription:
        "Cold-pressed fractionated coconut (MCT) oil infused with broad-spectrum cannabidiol and chamomile extract.",
      descriptionMarkdown: `### Apothecary Tincture\n\nFormulated for straightforward measurement with a graduated glass pipette marked in 0.25ml increments.\n\n- **Volume**: 30ml amber glass bottle with calibrated dropper\n- **Carrier**: Organic fractionated coconut MCT oil\n- **Compliance notice**: This product is a botanical food supplement/preparation and is not intended to diagnose, treat, cure, or prevent any disease.`,
      status: "ACTIVE" as const,
      featured: true,
      productTypeLabel: "Broad-Spectrum CBD Oil",
      thcContent: "< 0.001% (Non-detectable)",
      cbdContent: "600mg / 1200mg per 30ml",
      weightLabel: "30ml",
      flavourNotes: "Natural Chamomile & Mild Coconut",
      batchNumber: "CA-CBD-2026-10K",
      storageNotes: "Store upright in a cool cupboard below 25°C.",
      image: {
        url: "/images/demo/product-botanical-tincture.svg",
        alt: "Apothecary CBD Botanical Drops specimen card",
      },
      variants: [
        {
          name: "600mg / 30ml (20mg/ml)",
          sku: "CA-CBD-600",
          priceCents: 39000, // R 390,00
          stockQuantity: 14,
          reservedQuantity: 0,
          lowStockThreshold: 3,
          sortOrder: 1,
        },
        {
          name: "1200mg / 30ml (40mg/ml)",
          sku: "CA-CBD-1200",
          priceCents: 64000, // R 640,00
          stockQuantity: 9,
          reservedQuantity: 0,
          lowStockThreshold: 3,
          sortOrder: 2,
        },
      ],
    },
    {
      name: "Marula & Arnica Botanical Topical Salve (50ml)",
      slug: "marula-arnica-botanical-salve",
      brandSlug: "cederberg-apothecary",
      categorySlug: "cbd-wellness",
      shortDescription:
        "Rich external skin balm crafted with cold-pressed Limpopo marula oil, beeswax, arnica, and CBD isolate.",
      descriptionMarkdown: `### External Botanical Balm\n\nBlended with unrefined South African marula seed oil, shea butter, beeswax, rosemary leaf oil, and 500mg cannabidiol.\n\n- **Use**: For external topical skin application only. Do not apply to broken skin.\n- **Packaging**: 50ml amber glass apothecary jar with aluminium lid.`,
      status: "ACTIVE" as const,
      featured: false,
      productTypeLabel: "Topical Botanical Salve",
      thcContent: "0.0%",
      cbdContent: "500mg per 50ml jar",
      weightLabel: "50ml",
      flavourNotes: "Rosemary, Eucalyptus & Marula (Aromatic)",
      batchNumber: "CA-SAL-2026-08L",
      storageNotes: "Keep away from direct heat so beeswax base remains firm.",
      image: {
        url: "/images/demo/product-recovery-balm.svg",
        alt: "Marula and Arnica Botanical Topical Salve specimen card",
      },
      variants: [
        {
          name: "50ml Amber Glass Jar",
          sku: "CA-SALVE-50",
          priceCents: 34000, // R 340,00
          stockQuantity: 12,
          reservedQuantity: 0,
          lowStockThreshold: 3,
          sortOrder: 1,
        },
      ],
    },
    {
      name: "Milled Anodised Herb Mill (55mm)",
      slug: "milled-anodised-herb-mill-55mm",
      brandSlug: "pretoria-atelier-hardware",
      categorySlug: "accessories",
      shortDescription:
        "Precision 4-piece CNC-machined 6061 aluminium herb mill with neodymium magnetic closure and stainless mesh screen.",
      descriptionMarkdown: `### Hardware Specification\n\nEngineered for smooth, flake-free milling with radial tooth geometry and a low-friction nylon glide ring.\n\n- **Diameter**: 55mm\n- **Material**: Matte anodised 6061 aircraft-grade aluminium\n- **Includes**: Linen drawstring pouch and cleaning brush`,
      status: "ACTIVE" as const,
      featured: false,
      productTypeLabel: "4-Piece Precision Mill",
      weightLabel: "145g",
      batchNumber: "PAH-GR-2026-01",
      storageNotes: "Clean periodically with isopropyl alcohol and warm water.",
      image: {
        url: "/images/demo/product-brass-grinder.svg",
        alt: "Milled Anodised Herb Mill 55mm specimen card",
      },
      variants: [
        {
          name: "55mm Forest Anodised",
          sku: "PAH-MILL-FOR",
          priceCents: 42000, // R 420,00
          stockQuantity: 9,
          reservedQuantity: 0,
          lowStockThreshold: 2,
          sortOrder: 1,
        },
        {
          name: "55mm Brushed Charcoal",
          sku: "PAH-MILL-CHR",
          priceCents: 42000, // R 420,00
          stockQuantity: 11,
          reservedQuantity: 0,
          lowStockThreshold: 2,
          sortOrder: 2,
        },
      ],
    },
    {
      name: "Ultraviolet Apothecary Storage Vessel (250ml)",
      slug: "ultraviolet-apothecary-storage-vessel",
      brandSlug: "pretoria-atelier-hardware",
      categorySlug: "accessories",
      shortDescription:
        "Heavyweight European violet glass storage jar that blocks visible light spectrums to preserve dried botanicals.",
      descriptionMarkdown: `### Storage Specification\n\nHeavy-walled biophotonic violet glass blocks damaging visible light rays while remaining completely odour-proof.\n\n- **Capacity**: 250ml (holds approximately 14g–20g of dried flower)\n- **Seal**: BPA-free airtight screw cap with writable batch label`,
      status: "ACTIVE" as const,
      featured: false,
      productTypeLabel: "UV Glass Storage Jar",
      weightLabel: "250ml capacity",
      batchNumber: "PAH-UV-2026-02",
      storageNotes: "Dishwasher safe (glass body); hand-wash airtight lid.",
      image: {
        url: "/images/demo/product-glass-jar.svg",
        alt: "Ultraviolet Apothecary Storage Vessel specimen card",
      },
      variants: [
        {
          name: "250ml Single Jar",
          sku: "PAH-UV-250",
          priceCents: 18500, // R 185,00
          stockQuantity: 20,
          reservedQuantity: 0,
          lowStockThreshold: 4,
          sortOrder: 1,
        },
      ],
    },
  ];

  const createdVariantsBySku: Record<
    string,
    { id: string; productId: string; name: string; sku: string; priceCents: number; productName: string }
  > = {};

  for (const prod of productsData) {
    const category = categoriesBySlug[prod.categorySlug];
    const brand = brandsBySlug[prod.brandSlug];

    const existing = await prisma.product.findUnique({
      where: { slug: prod.slug },
    });

    const productRecord = existing
      ? await prisma.product.update({
          where: { id: existing.id },
          data: {
            name: prod.name,
            brandId: brand.id,
            categoryId: category.id,
            shortDescription: prod.shortDescription,
            descriptionMarkdown: prod.descriptionMarkdown,
            status: prod.status,
            featured: prod.featured,
            productTypeLabel: prod.productTypeLabel,
            thcContent: prod.thcContent ?? null,
            cbdContent: prod.cbdContent ?? null,
            weightLabel: prod.weightLabel ?? null,
            terpenes: prod.terpenes ?? null,
            flavourNotes: prod.flavourNotes ?? null,
            batchNumber: prod.batchNumber ?? null,
            storageNotes: prod.storageNotes ?? null,
            seoTitle: `${prod.name} | ${defaultSiteConfig.brandName}`,
            seoDescription: prod.shortDescription,
          },
        })
      : await prisma.product.create({
          data: {
            name: prod.name,
            slug: prod.slug,
            brandId: brand.id,
            categoryId: category.id,
            shortDescription: prod.shortDescription,
            descriptionMarkdown: prod.descriptionMarkdown,
            status: prod.status,
            featured: prod.featured,
            productTypeLabel: prod.productTypeLabel,
            thcContent: prod.thcContent ?? null,
            cbdContent: prod.cbdContent ?? null,
            weightLabel: prod.weightLabel ?? null,
            terpenes: prod.terpenes ?? null,
            flavourNotes: prod.flavourNotes ?? null,
            batchNumber: prod.batchNumber ?? null,
            storageNotes: prod.storageNotes ?? null,
            seoTitle: `${prod.name} | ${defaultSiteConfig.brandName}`,
            seoDescription: prod.shortDescription,
          },
        });

    await prisma.productImage.deleteMany({
      where: { productId: productRecord.id },
    });

    await prisma.productImage.create({
      data: {
        productId: productRecord.id,
        url: prod.image.url,
        alt: prod.image.alt,
        sortOrder: 0,
      },
    });

    for (const v of prod.variants) {
      const variantRecord = await prisma.productVariant.upsert({
        where: { sku: v.sku },
        update: {
          productId: productRecord.id,
          name: v.name,
          priceCents: v.priceCents,
          stockQuantity: v.stockQuantity,
          reservedQuantity: v.reservedQuantity,
          lowStockThreshold: v.lowStockThreshold,
          active: true,
          sortOrder: v.sortOrder,
        },
        create: {
          productId: productRecord.id,
          name: v.name,
          sku: v.sku,
          priceCents: v.priceCents,
          stockQuantity: v.stockQuantity,
          reservedQuantity: v.reservedQuantity,
          lowStockThreshold: v.lowStockThreshold,
          active: true,
          sortOrder: v.sortOrder,
        },
      });

      createdVariantsBySku[v.sku] = {
        id: variantRecord.id,
        productId: productRecord.id,
        name: variantRecord.name,
        sku: variantRecord.sku,
        priceCents: variantRecord.priceCents,
        productName: productRecord.name,
      };
    }
  }

  // Seed 3 Realistic Demo Orders
  const now = new Date();
  const demoOrders = [
    {
      publicId: "HHC-842K9P",
      status: "PENDING" as const,
      customerFirstName: "Pieter",
      customerLastName: "van der Merwe",
      email: "pieter.vdm@example.co.za",
      phone: "+27 82 411 0921",
      fulfilmentMethod: "COLLECTION" as const,
      preferredDateTime: "Tomorrow between 14:00 and 16:00",
      notes: "Will pay by card at the Brooklyn counter upon collection.",
      adminNotes: "Awaiting afternoon WhatsApp confirmation call.",
      paymentStatus: "UNPAID" as const,
      paymentMethod: "In-Store Card (Pending)",
      deliveryFeeCents: 0,
      items: [
        { sku: "HHC-APR-35G", quantity: 1 },
        { sku: "MR-BUSH-1X", quantity: 2 },
      ],
    },
    {
      publicId: "HHC-519M3R",
      status: "CONFIRMED" as const,
      customerFirstName: "Thandi",
      customerLastName: "Nkosi",
      email: "thandi.nkosi@example.co.za",
      phone: "+27 83 502 8814",
      fulfilmentMethod: "DELIVERY" as const,
      addressLine1: "48 Anderson Street",
      suburb: "Brooklyn",
      city: "Pretoria",
      province: "Gauteng",
      postalCode: "0181",
      preferredDateTime: "Friday morning (10:00–12:00)",
      notes: "Gate code via intercom at main entrance.",
      adminNotes: "Stock reserved and confirmed via WhatsApp.",
      paymentStatus: "UNPAID" as const,
      paymentMethod: "EFT on Invoice",
      deliveryFeeCents: 0, // Over R 850 threshold
      items: [
        { sku: "HHC-WKR-35G", quantity: 1 },
        { sku: "CA-ROO-10", quantity: 1 },
        { sku: "HHC-APR-1G", quantity: 1 },
      ],
    },
    {
      publicId: "HHC-204T7W",
      status: "COMPLETED" as const,
      customerFirstName: "Johan",
      customerLastName: "Botha",
      email: "johan.botha@example.co.za",
      phone: "+27 72 901 3340",
      fulfilmentMethod: "COLLECTION" as const,
      preferredDateTime: "Collected in-store",
      notes: "",
      adminNotes: "ID verified (18+). Paid via Instant EFT.",
      paymentStatus: "PAID_EFT" as const,
      paymentMethod: "EFT",
      deliveryFeeCents: 0,
      items: [
        { sku: "CA-CBD-600", quantity: 1 },
        { sku: "PAH-UV-250", quantity: 1 },
      ],
    },
  ];

  for (const ord of demoOrders) {
    const existingOrder = await prisma.order.findUnique({
      where: { publicId: ord.publicId },
    });
    if (!existingOrder) {
      const resolvedItems = ord.items.map((item) => {
        const v = createdVariantsBySku[item.sku];
        return {
          productId: v.productId,
          variantId: v.id,
          productNameSnapshot: v.productName,
          variantNameSnapshot: v.name,
          skuSnapshot: v.sku,
          unitPriceCents: v.priceCents,
          quantity: item.quantity,
          lineTotalCents: v.priceCents * item.quantity,
        };
      });
      const subtotalCents = resolvedItems.reduce(
        (acc, i) => acc + i.lineTotalCents,
        0
      );
      const totalCents = subtotalCents + ord.deliveryFeeCents;

      await prisma.order.create({
        data: {
          publicId: ord.publicId,
          status: ord.status,
          customerFirstName: ord.customerFirstName,
          customerLastName: ord.customerLastName,
          email: ord.email,
          phone: ord.phone,
          fulfilmentMethod: ord.fulfilmentMethod,
          addressLine1: ord.addressLine1 ?? null,
          suburb: ord.suburb ?? null,
          city: ord.city ?? null,
          province: ord.province ?? null,
          postalCode: ord.postalCode ?? null,
          preferredDateTime: ord.preferredDateTime,
          notes: ord.notes,
          adminNotes: ord.adminNotes,
          subtotalCents,
          deliveryFeeCents: ord.deliveryFeeCents,
          totalCents,
          paymentMethod: ord.paymentMethod,
          paymentStatus: ord.paymentStatus,
          ageConfirmedAt: now,
          termsAcceptedAt: now,
          privacyAcceptedAt: now,
          items: {
            create: resolvedItems,
          },
        },
      });
    }
  }

  // Seed Demo Enquiries
  const existingEnquiries = await prisma.enquiry.count();
  if (existingEnquiries === 0) {
    await prisma.enquiry.createMany({
      data: [
        {
          name: "Annelize Pretorius",
          email: "annelize.p@example.co.za",
          phone: "+27 82 770 1122",
          subject: "Batch availability for Apothecary CBD Drops",
          productSlug: "apothecary-cbd-botanical-drops",
          type: "PRODUCT_ENQUIRY",
          status: "NEW",
          message:
            "Good day, could you please confirm whether the 1200mg Apothecary CBD Botanical Drops are currently in stock for Saturday morning collection in Brooklyn?",
        },
        {
          name: "Kabelo Mokoena",
          email: "kabelo.m@example.co.za",
          phone: "+27 76 312 4490",
          subject: "Local delivery to Lynnwood",
          type: "GENERAL",
          status: "READ",
          message:
            "Hi team, do you offer afternoon deliveries to Lynnwood Ridge, and what identification is required on delivery?",
        },
      ],
    });
  }

  // Seed FAQs
  await prisma.faqItem.deleteMany({});
  await prisma.faqItem.createMany({
    data: [
      {
        question: "Who may browse and reserve items from Highveld Herbal Co.?",
        answerMarkdown:
          "Access to this website and our Pretoria dispensary is strictly restricted to adults aged **18 years and older**. Valid South African ID, passport, or driver's licence card is verified upon in-store collection or local delivery.",
        category: "Age & Compliance",
        sortOrder: 1,
        active: true,
      },
      {
        question: "How does the online reservation request process work?",
        answerMarkdown:
          "1. **Browse the menu**: Select your preferred items and variants.\n2. **Submit a reservation request**: Complete the checkout form with your contact details and preferred fulfilment method (Pretoria collection or local delivery).\n3. **Store confirmation**: No online card payment is taken on the website. Our dispensary team verifies physical batch availability and contacts you via WhatsApp or email to confirm your collection window or delivery slot and payment arrangement.",
        category: "Reservations",
        sortOrder: 2,
        active: true,
      },
      {
        question: "Why is no online card payment taken at checkout?",
        answerMarkdown:
          "We operate a store-confirmed reservation model so every request is verified by our Pretoria staff for stock accuracy, age verification (18+), and local delivery scheduling before payment is finalised via in-store card terminal, EFT, or cash on collection.",
        category: "Payments",
        sortOrder: 3,
        active: true,
      },
      {
        question: "Which Pretoria suburbs do you cover for local delivery?",
        answerMarkdown:
          "We organise local courier delivery across **Brooklyn, Waterkloof, Menlo Park, Hatfield, Lynnwood, Groenkloof, Newlands, Faerie Glen, Garsfontein, and Centurion Central**. Standard local delivery is **R 65,00**, or complimentary on reservations of **R 850,00** or more.",
        category: "Collection & Delivery",
        sortOrder: 4,
        active: true,
      },
      {
        question: "How long is my reserved stock held?",
        answerMarkdown:
          "When you submit a reservation request, your selected variants are reserved in our inventory system for **24 trading hours** while our team contacts you to confirm collection or delivery. Unconfirmed reservations are automatically released back to the menu.",
        category: "Reservations",
        sortOrder: 5,
        active: true,
      },
      {
        question: "Are the products listed on this website registered medicines?",
        answerMarkdown:
          "No. None of the botanical products, extracts, or accessories listed on this website are presented as registered medicines under the Medicines and Related Substances Act, nor are they intended to diagnose, treat, cure, or prevent any medical condition.",
        category: "Age & Compliance",
        sortOrder: 6,
        active: true,
      },
      {
        question: "What is your returns and exchanges policy?",
        answerMarkdown:
          "Due to hygiene and safety regulations governing botanical preparations, sealed consumable items cannot be returned once they have left the premises unless there is a verified packaging defect. Hardware and accessories carry a 7-day defective exchange guarantee in accordance with the Consumer Protection Act (CPA).",
        category: "Returns",
        sortOrder: 7,
        active: true,
      },
      {
        question: "How is my personal information protected under POPIA?",
        answerMarkdown:
          "We practise strict data minimisation in line with the **Protection of Personal Information Act (POPIA), Act 4 of 2013**. We collect only your name, contact number, email address, and delivery address (if applicable) to process your reservation. We never sell or share customer records with third-party marketers.",
        category: "Privacy",
        sortOrder: 8,
        active: true,
      },
    ],
  });

  // Seed Legal & Content Pages
  const legalDisclaimerBanner = `> **TEMPLATE LEGAL CONTENT NOTICE**: This document is placeholder template copy provided for technical demonstration only. It does **not** constitute legal advice. The dispensary operator must have this policy reviewed and approved by a qualified South African attorney before commercial publication.\n\n*Last updated: 26 October 2026*\n\n---\n\n`;

  const legalPages = [
    {
      slug: "privacy",
      title: "Privacy Policy (POPIA Notice)",
      seoTitle: "Privacy Policy (POPIA) | Highveld Herbal Co.",
      seoDescription:
        "How Highveld Herbal Co. collects, processes, and safeguards personal information in accordance with South Africa's Protection of Personal Information Act (POPIA).",
      bodyMarkdown:
        legalDisclaimerBanner +
        `### 1. Introduction & Responsible Party\n\nHighveld Herbal Co. ("the Store", "we", "us") respects your right to privacy and processes personal information in accordance with the **Protection of Personal Information Act 4 of 2013 ("POPIA")** of the Republic of South Africa.\n\n- **Physical Address**: 123 Example Street, Pretoria, Gauteng, 0001\n- **Information Officer Email**: privacy@example.co.za\n- **Telephone**: +27 12 000 0000\n\n### 2. Data Minimisation Principle\n\nWe collect only the minimum personal information strictly necessary to process your reservation request or respond to your enquiry:\n\n- First name and surname\n- South African mobile telephone number and email address\n- Delivery street address, suburb, and postal code (only when local delivery is selected)\n- Timestamps recording your confirmation that you are 18 years of age or older and your acceptance of our Terms\n\nWe **do not** collect South African ID numbers, biometric data, medical records, or payment card numbers on this website.\n\n### 3. Purpose of Processing\n\nYour information is used solely to:\n\n1. Verify stock availability and confirm your reservation via WhatsApp, telephone, or email.\n2. Coordinate in-store collection or local Pretoria delivery.\n3. Maintain statutory accounting and stock audit records.\n\n### 4. Your Rights as a Data Subject under POPIA\n\nUnder Sections 23 and 24 of POPIA, you have the right to:\n\n- Request confirmation of whether we hold personal information about you.\n- Request a copy of the record of your personal information.\n- Request the correction, destruction, or deletion of inaccurate or outdated personal information.\n- Object to the processing of your personal information.\n\nTo exercise these rights, please submit a request via our [Contact Page](/contact) or email **privacy@example.co.za**.`,
    },
    {
      slug: "terms",
      title: "Terms & Conditions of Reservation",
      seoTitle: "Terms & Conditions | Highveld Herbal Co.",
      seoDescription:
        "Terms governing the use of the Highveld Herbal Co. website and reservation request service in Pretoria, South Africa.",
      bodyMarkdown:
        legalDisclaimerBanner +
        `### 1. Nature of Reservation Service\n\nThis website operates in **Reservation / Order Request Mode**. Submitting a reservation request on this website does not constitute an automatic concluded contract of sale, nor is any online card payment processed on this website. All reservation requests are subject to:\n\n1. Verification of physical batch availability at our Pretoria premises;\n2. Verification that the customer is **18 years of age or older**; and\n3. Direct confirmation by store staff via WhatsApp, telephone, or email.\n\n### 2. Strict 18+ Age Restriction\n\nYou may not use this website, submit an enquiry, or submit a reservation request if you are under **18 years of age**. Falsifying your age confirmation is a breach of these Terms. Valid government-issued photographic identification (South African ID book/card, valid passport, or driver's licence) must be presented upon collection or delivery.\n\n### 3. Pricing in South African Rand (ZAR)\n\nAll prices are displayed in **South African Rand (ZAR)**. While we endeavour to keep all menu prices accurate, the store confirms the final total before payment is arranged.\n\n### 4. Governing Law\n\nThese Terms are governed by the laws of the **Republic of South Africa**.`,
    },
    {
      slug: "cookies",
      title: "Cookie & Local Storage Policy",
      seoTitle: "Cookie Policy | Highveld Herbal Co.",
      seoDescription:
        "Information about strictly necessary cookies and browser storage used on the Highveld Herbal Co. website.",
      bodyMarkdown:
        legalDisclaimerBanner +
        `### 1. Essential Browser Storage Only\n\nWe avoid invasive third-party advertising trackers. This website uses browser \`localStorage\` and essential cookies strictly for functional store operation:\n\n- **Age Verification State (\`hhc_age_verified_v1\`)**: Remembers your 18+ confirmation so you are not prompted on every page view.\n- **Cookie Notice Acknowledgement (\`hhc_cookie_consent_v1\`)**: Records your cookie preference.\n- **Reservation Cart (\`hhc_cart_v1\`)**: Stores only the variant IDs and quantities of items you add to your reservation request.\n- **Admin Authentication Session**: Strictly necessary HTTP-only session cookie for authorised staff members.\n\n### 2. Managing Browser Storage\n\nYou may clear your browser cookies and local storage at any time through your browser settings.`,
    },
    {
      slug: "paia",
      title: "PAIA Section 51 Information Manual",
      seoTitle: "PAIA Manual | Highveld Herbal Co.",
      seoDescription:
        "Promotion of Access to Information Act 2 of 2000 (PAIA) information notice for Highveld Herbal Co.",
      bodyMarkdown:
        legalDisclaimerBanner +
        `### 1. Promotion of Access to Information Act (PAIA)\n\nThis notice is published in terms of Section 51 of the **Promotion of Access to Information Act 2 of 2000 ("PAIA")** read with the **Protection of Personal Information Act 4 of 2013 ("POPIA")**.\n\n### 2. Contact Details of Information Officer\n\n- **Entity Name**: Highveld Herbal Co. (Demo White-Label Entity)\n- **Information Officer**: The Dispensary Manager\n- **Physical Address**: 123 Example Street, Pretoria, Gauteng, 0001\n- **Email**: privacy@example.co.za\n- **Telephone**: +27 12 000 0000\n\n### 3. Request Procedure (Form 2)\n\nRequesters seeking access to records held by the Store must submit a formal request on the prescribed PAIA Form 2 to the Information Officer at the address or email listed above.`,
    },
    {
      slug: "age-policy",
      title: "18+ Age Verification Policy",
      seoTitle: "18+ Age Verification Policy | Highveld Herbal Co.",
      seoDescription:
        "Mandatory 18+ age verification policy for website visitors, collections, and deliveries.",
      bodyMarkdown:
        legalDisclaimerBanner +
        `### 1. Zero Tolerance for Under-18 Access or Supply\n\nHighveld Herbal Co. enforces a strict **18+ only policy** across all digital and physical touchpoints:\n\n1. **Website Entry Age Gate**: Visitors must confirm they are 18 years or older before browsing.\n2. **Server-Validated Checkout Confirmation**: Every reservation submission requires explicit confirmation of age (18+), and the exact UTC/SAST timestamp is permanently recorded on the order record.\n3. **Physical ID Check at Handover**: Whether collecting in-store in Pretoria or receiving a local courier delivery, the recipient must present a valid South African ID card/book, passport, or driver's licence proving they are 18 years or older.\n\nIf valid identification cannot be produced at handover, the reservation will be cancelled immediately.`,
    },
    {
      slug: "responsible-use",
      title: "Responsible Use & Safety Notice",
      seoTitle: "Responsible Use Notice | Highveld Herbal Co.",
      seoDescription:
        "Important responsible-use guidelines, storage precautions, and non-medical disclaimers.",
      bodyMarkdown:
        legalDisclaimerBanner +
        `### 1. Important Safety Precautions\n\n- **Adults 18+ Only**: Botanical products are strictly for adults aged 18 years and older.\n- **Keep Out of Reach of Children & Animals**: Store all products in locked, child-resistant containers out of sight and reach of children and pets.\n- **Do Not Drive or Operate Machinery**: Never drive a motor vehicle or operate heavy machinery after using botanical products that may cause drowsiness or impairment.\n- **Pregnancy & Health Conditions**: Pregnant or breastfeeding individuals, and persons with cardiovascular, psychiatric, or other health conditions, or those taking prescription medication, should consult a registered healthcare practitioner before use.\n\n### 2. No Medical Claims\n\nProducts presented on this website are **not** registered medicines and have not been evaluated by SAHPRA for the treatment, cure, prevention, or diagnosis of any disease or medical condition. No information on this website should be interpreted as medical or clinical dosage advice.`,
    },
    {
      slug: "delivery-collection",
      title: "Collection & Pretoria Delivery Policy",
      seoTitle: "Collection & Delivery Policy | Highveld Herbal Co.",
      seoDescription:
        "Details on Pretoria in-store collection and local suburban delivery for confirmed reservations.",
      bodyMarkdown:
        legalDisclaimerBanner +
        `### 1. In-Store Collection (Brooklyn, Pretoria)\n\n- **Address**: 123 Example Street, Pretoria, Gauteng, 0001\n- **Collection Hours**: Monday–Friday 09:00–18:00; Saturday 09:00–16:00\n- **Cost**: Complimentary\n- **Requirement**: Bring your reservation reference (e.g. \`HHC-XXXXXX\`) and valid 18+ photo identification.\n\n### 2. Local Pretoria Delivery\n\n- **Covered Suburbs**: Brooklyn, Waterkloof, Menlo Park, Hatfield, Lynnwood, Groenkloof, Newlands, Faerie Glen, Garsfontein, and Centurion Central.\n- **Standard Delivery Fee**: **R 65,00** (Complimentary on reservations of **R 850,00** or more).\n- **Handover Requirement**: Deliveries are handed directly to the named adult customer upon verification of 18+ identification. Parcels cannot be left unattended at gates or with minors.`,
    },
    {
      slug: "returns-refunds",
      title: "Returns, Exchanges & Cancellations Policy",
      seoTitle: "Returns & Refunds Policy | Highveld Herbal Co.",
      seoDescription:
        "Policy on reservation cancellations, defective hardware exchanges, and consumable safety rules.",
      bodyMarkdown:
        legalDisclaimerBanner +
        `### 1. Cancelling a Reservation Request\n\nYou may cancel a pending or confirmed reservation at any time prior to dispatch or collection at no cost by contacting our store via WhatsApp (+27 82 000 0000) or email (hello@example.co.za) with your order reference.\n\n### 2. Consumable Botanical Products\n\nFor hygiene, quality assurance, and tamper-safety reasons, sealed dried flower, pre-rolls, edibles, extracts, and tinctures cannot be returned or exchanged once opened or removed from the store, except where a product is found to be defective or damaged at the time of supply in terms of the **Consumer Protection Act 68 of 2008 ("CPA")**.\n\n### 3. Hardware & Accessories\n\nUnused accessories and hardware in original packaging may be exchanged within **7 days** of purchase with proof of purchase. Manufacturing defects are assessed for repair, replacement, or refund in line with the CPA.`,
    },
  ];

  for (const page of legalPages) {
    await prisma.contentPage.upsert({
      where: { slug: page.slug },
      update: {
        title: page.title,
        bodyMarkdown: page.bodyMarkdown,
        published: true,
        seoTitle: page.seoTitle,
        seoDescription: page.seoDescription,
      },
      create: {
        slug: page.slug,
        title: page.title,
        bodyMarkdown: page.bodyMarkdown,
        published: true,
        seoTitle: page.seoTitle,
        seoDescription: page.seoDescription,
      },
    });
  }

  // Initial Audit Log entry
  const existingLogs = await prisma.auditLog.count();
  if (existingLogs === 0) {
    await prisma.auditLog.create({
      data: {
        userId: adminUser.id,
        userEmail: adminUser.email,
        action: "SEED_INITIAL_CATALOGUE",
        entityType: "System",
        entityId: "seed-v1",
        metadataJson: {
          categories: categoriesData.length,
          brands: brandsData.length,
          products: productsData.length,
          legalPages: legalPages.length,
        },
      },
    });
  }

  console.log("✅ Seed completed:");
  console.log(`   - Admin login: ${adminEmail} / ${adminPassword}`);
  console.log(`   - Staff login: ${staffEmail} / ${staffPassword}`);
  console.log(`   - ${categoriesData.length} categories, ${brandsData.length} brands, ${productsData.length} products seeded.`);
}

main()
  .catch((err) => {
    console.error("Seed error:", err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
