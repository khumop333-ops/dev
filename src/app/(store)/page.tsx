import React from "react";
import Link from "next/link";
import { ArrowRight, MapPin, Clock, ShieldCheck, CheckCircle2 } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { getStoreSettings } from "@/lib/settings";
import { ProductCard } from "@/components/store/product-card";
import { formatZAR } from "@/lib/money";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const [siteConfig, categories, featuredProducts] = await Promise.all([
    getStoreSettings(),
    prisma.category.findMany({
      where: { active: true },
      orderBy: { sortOrder: "asc" },
    }),
    prisma.product.findMany({
      where: { status: "ACTIVE", featured: true },
      include: {
        category: true,
        brand: true,
        images: { orderBy: { sortOrder: "asc" } },
        variants: { where: { active: true }, orderBy: { sortOrder: "asc" } },
      },
      orderBy: { createdAt: "desc" },
      take: 6,
    }),
  ]);

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "LocalBusiness",
    name: siteConfig.brandName,
    description: siteConfig.description,
    telephone: siteConfig.phone,
    email: siteConfig.email,
    priceRange: "R 110 - R 980",
    address: {
      "@type": "PostalAddress",
      streetAddress: siteConfig.addressLine1,
      addressLocality: siteConfig.city,
      addressRegion: siteConfig.province,
      postalCode: siteConfig.postalCode,
      addressCountry: "ZA",
    },
  };

  return (
    <div>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      {/* Editorial Hero Split Section */}
      <section className="border-b border-[#D6CBB9] bg-[#F7F3EA]">
        <div className="mx-auto max-w-container px-4 sm:px-6 lg:px-8 py-12 lg:py-20">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12 items-center">
            <div className="lg:col-span-7 space-y-6">
              <div className="inline-flex items-center gap-2 rounded-[4px] border border-[#D6CBB9] bg-[#E7DECF] px-3 py-1 text-xs font-medium text-[#1C1C19]">
                <span>{siteConfig.city}, {siteConfig.province}</span>
                <span aria-hidden="true">•</span>
                <span>Botanical Dispensary &amp; Apothecary</span>
              </div>

              <h1 className="font-serif text-4xl sm:text-5xl lg:text-[56px] leading-[1.08] text-[#1C1C19]">
                {siteConfig.tagline}
              </h1>

              <p className="text-base sm:text-lg text-[#5F5B52] leading-relaxed max-w-2xl">
                {siteConfig.description}
              </p>

              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3.5 pt-2">
                <Link
                  href="/shop"
                  data-testid="hero-browse-cta"
                  className="inline-flex items-center justify-center gap-2 rounded-[6px] border border-[#23452F] bg-[#23452F] px-6 py-3.5 text-sm font-medium text-white hover:bg-[#1A3523] transition-colors"
                >
                  <span>Browse the menu</span>
                  <ArrowRight className="h-4 w-4" />
                </Link>
                <Link
                  href="/visit"
                  className="inline-flex items-center justify-center rounded-[6px] border border-[#D6CBB9] bg-white px-6 py-3.5 text-sm font-medium text-[#1C1C19] hover:border-[#23452F] transition-colors"
                >
                  Visit the store
                </Link>
              </div>

              <div className="pt-4 border-t border-[#D6CBB9] grid grid-cols-2 sm:grid-cols-3 gap-4 text-xs text-[#5F5B52]">
                <div>
                  <span className="block font-semibold text-[#1C1C19]">
                    Fulfilment Mode
                  </span>
                  <span>Reservation / Order Request</span>
                </div>
                <div>
                  <span className="block font-semibold text-[#1C1C19]">
                    Local Pretoria Delivery
                  </span>
                  <span>
                    {formatZAR(siteConfig.deliveryFeeCents)} (Free over{" "}
                    {formatZAR(siteConfig.freeDeliveryThresholdCents)})
                  </span>
                </div>
                <div className="col-span-2 sm:col-span-1">
                  <span className="block font-semibold text-[#1C1C19]">
                    Age Requirement
                  </span>
                  <span>Strictly 18+ (ID Verified)</span>
                </div>
              </div>
            </div>

            <div className="lg:col-span-5">
              <div className="rounded-[8px] border border-[#D6CBB9] bg-[#23452F] overflow-hidden">
                <img
                  src="/images/demo/hero-botanical.svg"
                  alt={`${siteConfig.brandName} Pretoria botanical specimen illustration`}
                  className="w-full h-auto block"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Factual Trust Strip */}
      <section
        aria-label="Store commitments"
        className="border-b border-[#D6CBB9] bg-[#E7DECF]"
      >
        <div className="mx-auto max-w-container px-4 sm:px-6 lg:px-8 py-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="flex items-start gap-3">
              <span className="inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-[4px] border border-[#23452F] bg-[#23452F] text-xs font-semibold text-white">
                18+
              </span>
              <div>
                <h2 className="font-sans text-xs font-semibold uppercase tracking-wider text-[#1C1C19]">
                  18+ Adults Only
                </h2>
                <p className="text-xs text-[#5F5B52] mt-0.5">
                  Mandatory age verification online and upon collection or delivery.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <MapPin className="h-5 w-5 text-[#23452F] shrink-0 mt-0.5" />
              <div>
                <h2 className="font-sans text-xs font-semibold uppercase tracking-wider text-[#1C1C19]">
                  Collection &amp; Local Delivery
                </h2>
                <p className="text-xs text-[#5F5B52] mt-0.5">
                  Collect in {siteConfig.suburb} or organise courier delivery across Pretoria.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <CheckCircle2 className="h-5 w-5 text-[#23452F] shrink-0 mt-0.5" />
              <div>
                <h2 className="font-sans text-xs font-semibold uppercase tracking-wider text-[#1C1C19]">
                  Clear Pricing in ZAR
                </h2>
                <p className="text-xs text-[#5F5B52] mt-0.5">
                  Transparent per-gram and per-unit pricing in South African Rand.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <ShieldCheck className="h-5 w-5 text-[#23452F] shrink-0 mt-0.5" />
              <div>
                <h2 className="font-sans text-xs font-semibold uppercase tracking-wider text-[#1C1C19]">
                  Store-Confirmed Orders
                </h2>
                <p className="text-xs text-[#5F5B52] mt-0.5">
                  No online card payment taken. Staff confirm batch stock directly.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Shop by Category Section */}
      <section className="border-b border-[#D6CBB9] py-14 lg:py-20">
        <div className="mx-auto max-w-container px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-10">
            <div>
              <span className="text-xs font-semibold uppercase tracking-[0.15em] text-[#23452F]">
                Curated Departments
              </span>
              <h2 className="font-serif text-3xl sm:text-4xl text-[#1C1C19] mt-1">
                Browse by Category
              </h2>
            </div>
            <Link
              href="/shop"
              className="inline-flex items-center gap-1.5 text-sm font-medium text-[#23452F] hover:underline"
            >
              <span>View complete menu</span>
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {categories.map((cat) => (
              <Link
                key={cat.id}
                href={`/collections/${cat.slug}`}
                prefetch={false}
                className="group flex flex-col justify-between rounded-[8px] border border-[#D6CBB9] bg-white p-6 hover:border-[#23452F] transition-colors"
              >
                <div>
                  <div className="aspect-[16/10] mb-5 rounded-[6px] border border-[#D6CBB9] bg-[#F7F3EA] overflow-hidden">
                    <img
                      src={cat.imageUrl || "/images/demo/category-flower.svg"}
                      alt={cat.name}
                      className="h-full w-full object-cover"
                      loading="lazy"
                    />
                  </div>
                  <h3 className="font-serif text-2xl text-[#1C1C19] group-hover:text-[#23452F]">
                    {cat.name}
                  </h3>
                  <p className="mt-2 text-xs text-[#5F5B52] leading-relaxed">
                    {cat.description}
                  </p>
                </div>

                <div className="mt-5 pt-3 border-t border-[#D6CBB9] flex items-center justify-between text-xs font-medium text-[#23452F]">
                  <span>Explore {cat.name}</span>
                  <ArrowRight className="h-3.5 w-3.5" />
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Products Grid */}
      <section className="border-b border-[#D6CBB9] bg-[#E7DECF]/35 py-14 lg:py-20">
        <div className="mx-auto max-w-container px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-10">
            <div>
              <span className="text-xs font-semibold uppercase tracking-[0.15em] text-[#23452F]">
                Current Pretoria Vault Selection
              </span>
              <h2 className="font-serif text-3xl sm:text-4xl text-[#1C1C19] mt-1">
                Featured Preparations
              </h2>
            </div>
            <Link
              href="/shop"
              className="inline-flex items-center gap-1.5 text-sm font-medium text-[#23452F] hover:underline"
            >
              <span>Filter all products</span>
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {featuredProducts.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        </div>
      </section>

      {/* How Reservations Work (Three Steps) */}
      <section className="border-b border-[#D6CBB9] bg-[#23452F] text-white py-14 lg:py-20">
        <div className="mx-auto max-w-container px-4 sm:px-6 lg:px-8">
          <div className="max-w-2xl mb-12">
            <span className="text-xs uppercase tracking-[0.2em] text-[#E7DECF]">
              Reservation Protocol
            </span>
            <h2 className="font-serif text-3xl sm:text-4xl text-white mt-2">
              How Store-Confirmed Reservations Work
            </h2>
            <p className="mt-3 text-sm text-[#E7DECF]/90 leading-relaxed">
              We do not process automated card payments online. Instead, you
              reserve items from our live inventory and settle once our Pretoria
              dispensary confirms your order.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="rounded-[8px] border border-[#E7DECF]/25 bg-[#1A3523] p-6 space-y-3">
              <span className="inline-block font-mono text-xs text-[#E7DECF] border border-[#E7DECF]/30 rounded-[4px] px-2 py-0.5">
                STEP 01
              </span>
              <h3 className="font-serif text-2xl text-white">
                1. Browse the Menu
              </h3>
              <p className="text-xs text-[#E7DECF]/85 leading-relaxed">
                Explore dried flower, pre-rolls, pastilles, extracts, and CBD
                preparations with live stock indicators and transparent pricing
                in South African Rand (ZAR).
              </p>
            </div>

            <div className="rounded-[8px] border border-[#E7DECF]/25 bg-[#1A3523] p-6 space-y-3">
              <span className="inline-block font-mono text-xs text-[#E7DECF] border border-[#E7DECF]/30 rounded-[4px] px-2 py-0.5">
                STEP 02
              </span>
              <h3 className="font-serif text-2xl text-white">
                2. Submit a Reservation
              </h3>
              <p className="text-xs text-[#E7DECF]/85 leading-relaxed">
                Select Pretoria in-store collection or local suburban delivery,
                confirm you are 18+, and submit your request. Your selected
                variants are immediately reserved.
              </p>
            </div>

            <div className="rounded-[8px] border border-[#E7DECF]/25 bg-[#1A3523] p-6 space-y-3">
              <span className="inline-block font-mono text-xs text-[#E7DECF] border border-[#E7DECF]/30 rounded-[4px] px-2 py-0.5">
                STEP 03
              </span>
              <h3 className="font-serif text-2xl text-white">
                3. Confirm &amp; Collect
              </h3>
              <p className="text-xs text-[#E7DECF]/85 leading-relaxed">
                Our team contacts you via WhatsApp or email to confirm your
                collection window or courier slot and payment arrangement
                (in-store card, EFT, or cash).
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Brand Story & Pretoria Store Visit Section */}
      <section className="py-14 lg:py-20">
        <div className="mx-auto max-w-container px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
            {/* Brand Story */}
            <div className="lg:col-span-6 rounded-[8px] border border-[#D6CBB9] bg-white p-8 flex flex-col justify-between space-y-6">
              <div className="space-y-4">
                <span className="text-xs font-semibold uppercase tracking-[0.15em] text-[#23452F]">
                  Our Approach
                </span>
                <h2 className="font-serif text-3xl text-[#1C1C19]">
                  Quiet Expertise &amp; Batch Transparency
                </h2>
                <p className="text-sm text-[#5F5B52] leading-relaxed">
                  {siteConfig.brandName} was established with a straightforward
                  premise: adult customers in Pretoria deserve a calm,
                  well-documented, and respectful botanical retail environment.
                </p>
                <p className="text-sm text-[#5F5B52] leading-relaxed">
                  Every item on our menu is catalogued with clear cultivar notes,
                  storage instructions, and batch identifiers—free of exaggerated
                  claims, gimmicks, or unverified promises.
                </p>
              </div>

              <div className="pt-4 border-t border-[#D6CBB9] flex items-center justify-between">
                <Link
                  href="/about"
                  className="text-sm font-medium text-[#23452F] hover:underline"
                >
                  Read our full story &amp; standards →
                </Link>
                <Link
                  href="/faq"
                  className="text-xs text-[#5F5B52] hover:text-[#1C1C19] underline"
                >
                  Frequently Asked Questions
                </Link>
              </div>
            </div>

            {/* Store Visit Card */}
            <div className="lg:col-span-6 rounded-[8px] border border-[#D6CBB9] bg-[#E7DECF]/60 p-8 flex flex-col justify-between space-y-6">
              <div className="space-y-4">
                <span className="text-xs font-semibold uppercase tracking-[0.15em] text-[#23452F]">
                  Visit Our Dispensary
                </span>
                <h2 className="font-serif text-3xl text-[#1C1C19]">
                  {siteConfig.suburb}
                </h2>
                <div className="space-y-2 text-sm text-[#1C1C19]">
                  <p className="flex items-start gap-2">
                    <MapPin className="h-4 w-4 text-[#23452F] shrink-0 mt-1" />
                    <span>{siteConfig.fullAddress}</span>
                  </p>
                  <div className="flex items-start gap-2">
                    <Clock className="h-4 w-4 text-[#23452F] shrink-0 mt-1" />
                    <div className="text-xs text-[#5F5B52] space-y-1">
                      <p className="text-[#1C1C19] font-medium">
                        {siteConfig.hours.weekdays}
                      </p>
                      <p>{siteConfig.hours.saturday}</p>
                      <p>{siteConfig.hours.sunday}</p>
                    </div>
                  </div>
                </div>

                <div className="rounded-[6px] border border-[#D6CBB9] bg-[#F7F3EA] p-4 text-xs text-[#5F5B52] space-y-1">
                  <p className="font-semibold text-[#1C1C19]">
                    Local Pretoria Delivery Areas:
                  </p>
                  <p>{siteConfig.deliveryAreas.join(" • ")}</p>
                </div>
              </div>

              <div className="pt-4 border-t border-[#D6CBB9] flex flex-wrap items-center gap-3">
                <Link
                  href="/visit"
                  className="inline-flex items-center justify-center rounded-[6px] bg-[#23452F] px-4 py-2.5 text-xs font-medium text-white hover:bg-[#1A3523]"
                >
                  Store Details &amp; Collection Guide
                </Link>
                <a
                  href={siteConfig.directionsUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center justify-center rounded-[6px] border border-[#D6CBB9] bg-white px-4 py-2.5 text-xs font-medium text-[#1C1C19] hover:border-[#23452F]"
                >
                  Open in Google Maps ↗
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
