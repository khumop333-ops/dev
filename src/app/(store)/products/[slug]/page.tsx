import React, { cache } from "react";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getStoreSettings } from "@/lib/settings";
import { ProductDetailInteractive } from "@/components/store/product-detail-interactive";
import { ProductCard } from "@/components/store/product-card";
import {
  Accordion,
  AccordionItem,
  AccordionTrigger,
  AccordionContent,
} from "@/components/ui/accordion";
import { MarkdownContent } from "@/components/ui/markdown-content";
import { formatZAR } from "@/lib/money";
import { getAvailableStock } from "@/lib/inventory";

export const dynamic = "force-dynamic";

const getProductBySlug = cache(async (slug: string) => {
  return prisma.product.findUnique({
    where: { slug },
    include: {
      category: true,
      brand: true,
      images: { orderBy: { sortOrder: "asc" } },
      variants: { where: { active: true }, orderBy: { sortOrder: "asc" } },
    },
  });
});

export async function generateMetadata({
  params,
}: {
  params: { slug: string };
}): Promise<Metadata> {
  try {
    const product = await getProductBySlug(params.slug);

    if (!product || product.status !== "ACTIVE") {
      return { title: "Product Not Found" };
    }

    return {
      title: product.seoTitle || product.name,
      description: product.seoDescription || product.shortDescription,
    };
  } catch {
    return { title: "Botanical Preparation" };
  }
}

export default async function ProductDetailPage({
  params,
}: {
  params: { slug: string };
}) {
  const [siteConfig, product] = await Promise.all([
    getStoreSettings(),
    getProductBySlug(params.slug),
  ]);

  if (!product || product.status !== "ACTIVE") {
    notFound();
  }

  const relatedProducts = await prisma.product.findMany({
    where: {
      status: "ACTIVE",
      categoryId: product.categoryId,
      id: { not: product.id },
    },
    include: {
      category: true,
      brand: true,
      images: { orderBy: { sortOrder: "asc" } },
      variants: { where: { active: true }, orderBy: { sortOrder: "asc" } },
    },
    take: 3,
  });

  const primaryImage = product.images[0] ?? {
    url: "/images/demo/category-flower.svg",
    alt: product.name,
  };

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";
  const minPriceCents = product.variants.length
    ? Math.min(...product.variants.map((v) => v.priceCents))
    : 0;
  const anyInStock = product.variants.some((v) => getAvailableStock(v) > 0);

  const breadcrumbJsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      {
        "@type": "ListItem",
        position: 1,
        name: "Home",
        item: siteUrl,
      },
      {
        "@type": "ListItem",
        position: 2,
        name: "Menu",
        item: `${siteUrl}/shop`,
      },
      {
        "@type": "ListItem",
        position: 3,
        name: product.category.name,
        item: `${siteUrl}/collections/${product.category.slug}`,
      },
      {
        "@type": "ListItem",
        position: 4,
        name: product.name,
        item: `${siteUrl}/products/${product.slug}`,
      },
    ],
  };

  const productJsonLd = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.name,
    description: product.shortDescription,
    sku: product.variants[0]?.sku || product.slug,
    brand: product.brand
      ? {
          "@type": "Brand",
          name: product.brand.name,
        }
      : undefined,
    offers: {
      "@type": "Offer",
      priceCurrency: "ZAR",
      price: (minPriceCents / 100).toFixed(2),
      availability: anyInStock
        ? "https://schema.org/InStock"
        : "https://schema.org/OutOfStock",
      url: `${siteUrl}/products/${product.slug}`,
    },
  };

  return (
    <div className="mx-auto max-w-container px-4 sm:px-6 lg:px-8 py-10 lg:py-14">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(productJsonLd) }}
      />

      {/* Breadcrumbs */}
      <nav aria-label="Breadcrumb" className="mb-8 text-xs text-[#5F5B52]">
        <ol className="flex flex-wrap items-center gap-2">
          <li>
            <Link href="/" className="hover:text-[#23452F]">
              Home
            </Link>
          </li>
          <li aria-hidden="true">/</li>
          <li>
            <Link href="/shop" className="hover:text-[#23452F]">
              Menu
            </Link>
          </li>
          <li aria-hidden="true">/</li>
          <li>
            <Link
              href={`/collections/${product.category.slug}`}
              prefetch={false}
              className="hover:text-[#23452F]"
            >
              {product.category.name}
            </Link>
          </li>
          <li aria-hidden="true">/</li>
          <li aria-current="page" className="text-[#1C1C19] font-medium">
            {product.name}
          </li>
        </ol>
      </nav>

      {/* Main Product Split Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12 items-start">
        {/* Left: Image Gallery */}
        <div className="lg:col-span-6 space-y-4">
          <div className="aspect-square rounded-[8px] border border-[#D6CBB9] bg-white overflow-hidden">
            <img
              src={primaryImage.url}
              alt={primaryImage.alt}
              className="h-full w-full object-cover"
            />
          </div>

          {product.images.length > 1 && (
            <div className="grid grid-cols-4 gap-3">
              {product.images.map((img) => (
                <div
                  key={img.id}
                  className="aspect-square rounded-[6px] border border-[#D6CBB9] bg-white overflow-hidden"
                >
                  <img
                    src={img.url}
                    alt={img.alt}
                    className="h-full w-full object-cover"
                  />
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Right: Product Info, Interactive Selector, and Accordions */}
        <div className="lg:col-span-6 space-y-6">
          <div>
            <div className="flex flex-wrap items-center gap-2 text-xs text-[#5F5B52] mb-2">
              <Link
                href={`/collections/${product.category.slug}`}
                prefetch={false}
                className="rounded-[4px] border border-[#D6CBB9] bg-[#E7DECF] px-2.5 py-0.5 font-medium text-[#1C1C19]"
              >
                {product.category.name}
              </Link>
              {product.brand && (
                <span>• Produced by {product.brand.name}</span>
              )}
              {product.productTypeLabel && (
                <span>• {product.productTypeLabel}</span>
              )}
            </div>

            <h1 className="font-serif text-3xl sm:text-4xl text-[#1C1C19]">
              {product.name}
            </h1>

            <p className="mt-3 text-sm text-[#5F5B52] leading-relaxed">
              {product.shortDescription}
            </p>
          </div>

          {/* Interactive Variant & Quantity Selector */}
          <ProductDetailInteractive
            productName={product.name}
            productSlug={product.slug}
            variants={product.variants}
            salesMode={siteConfig.salesMode}
          />

          {/* Collection & Pretoria Delivery Summary Card */}
          <div className="rounded-[8px] border border-[#D6CBB9] bg-[#E7DECF]/50 p-4 text-xs text-[#5F5B52] space-y-2">
            <p className="font-semibold text-[#1C1C19]">
              Pretoria Collection &amp; Local Delivery
            </p>
            <p>
              <strong>In-Store Collection:</strong> {siteConfig.fullAddress} (
              {siteConfig.hours.weekdays}). Complimentary.
            </p>
            <p>
              <strong>Local Pretoria Delivery:</strong>{" "}
              {formatZAR(siteConfig.deliveryFeeCents)} across covered Pretoria
              suburbs (Complimentary on orders over{" "}
              {formatZAR(siteConfig.freeDeliveryThresholdCents)}).
            </p>
          </div>

          {/* Information Accordions */}
          <Accordion
            type="multiple"
            defaultValue={["description", "contents"]}
            className="border-t border-[#D6CBB9]"
          >
            <AccordionItem value="description">
              <AccordionTrigger>Detailed Description</AccordionTrigger>
              <AccordionContent>
                <MarkdownContent content={product.descriptionMarkdown} />
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="contents">
              <AccordionTrigger>
                Batch Specifications &amp; Profile
              </AccordionTrigger>
              <AccordionContent>
                <dl className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                  {product.batchNumber && (
                    <div className="rounded-[4px] border border-[#D6CBB9] bg-white p-3">
                      <dt className="text-[#5F5B52]">Batch Reference</dt>
                      <dd className="font-mono font-semibold text-[#1C1C19] mt-0.5">
                        {product.batchNumber}
                      </dd>
                    </div>
                  )}
                  {product.weightLabel && (
                    <div className="rounded-[4px] border border-[#D6CBB9] bg-white p-3">
                      <dt className="text-[#5F5B52]">Available Weights / Volume</dt>
                      <dd className="font-semibold text-[#1C1C19] mt-0.5">
                        {product.weightLabel}
                      </dd>
                    </div>
                  )}
                  {product.thcContent && (
                    <div className="rounded-[4px] border border-[#D6CBB9] bg-white p-3">
                      <dt className="text-[#5F5B52]">THC (Admin-Entered)</dt>
                      <dd className="font-semibold text-[#1C1C19] mt-0.5">
                        {product.thcContent}
                      </dd>
                    </div>
                  )}
                  {product.cbdContent && (
                    <div className="rounded-[4px] border border-[#D6CBB9] bg-white p-3">
                      <dt className="text-[#5F5B52]">CBD (Admin-Entered)</dt>
                      <dd className="font-semibold text-[#1C1C19] mt-0.5">
                        {product.cbdContent}
                      </dd>
                    </div>
                  )}
                  {product.terpenes && (
                    <div className="rounded-[4px] border border-[#D6CBB9] bg-white p-3 sm:col-span-2">
                      <dt className="text-[#5F5B52]">Dominant Terpenes</dt>
                      <dd className="font-semibold text-[#1C1C19] mt-0.5">
                        {product.terpenes}
                      </dd>
                    </div>
                  )}
                  {product.flavourNotes && (
                    <div className="rounded-[4px] border border-[#D6CBB9] bg-white p-3 sm:col-span-2">
                      <dt className="text-[#5F5B52]">Aromatic &amp; Flavour Notes</dt>
                      <dd className="font-semibold text-[#1C1C19] mt-0.5">
                        {product.flavourNotes}
                      </dd>
                    </div>
                  )}
                </dl>
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="lab">
              <AccordionTrigger>Analytical / Batch Documentation</AccordionTrigger>
              <AccordionContent>
                {product.labTestUrl ? (
                  <div className="space-y-2 text-xs">
                    <p>
                      Admin-provided analytical certificate for batch{" "}
                      <strong>{product.batchNumber || "current"}</strong>:
                    </p>
                    <a
                      href={product.labTestUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-block underline text-[#23452F] font-medium"
                    >
                      View Certificate of Analysis (COA) ↗
                    </a>
                  </div>
                ) : (
                  <p className="text-xs text-[#5F5B52]">
                    No external digital Certificate of Analysis URL has been
                    linked for this batch. Physical batch documentation may be
                    requested from staff at our Pretoria counter.
                  </p>
                )}
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="storage">
              <AccordionTrigger>Storage &amp; Handling</AccordionTrigger>
              <AccordionContent>
                <p className="text-xs text-[#5F5B52]">
                  {product.storageNotes ||
                    "Store in a cool, dry, dark cupboard below 22°C. Keep container tightly sealed and strictly out of reach of children and animals."}
                </p>
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="compliance">
              <AccordionTrigger>
                18+ Compliance &amp; Responsible-Use Notice
              </AccordionTrigger>
              <AccordionContent>
                <p className="text-xs text-[#5F5B52]">
                  {siteConfig.complianceNotice}
                </p>
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </div>
      </div>

      {/* Related Products */}
      {relatedProducts.length > 0 && (
        <section className="mt-16 pt-12 border-t border-[#D6CBB9]">
          <div className="flex items-center justify-between mb-8">
            <h2 className="font-serif text-2xl sm:text-3xl text-[#1C1C19]">
              More in {product.category.name}
            </h2>
            <Link
              href={`/collections/${product.category.slug}`}
              prefetch={false}
              className="text-xs font-medium text-[#23452F] hover:underline"
            >
              View all {product.category.name} →
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {relatedProducts.map((rel) => (
              <ProductCard key={rel.id} product={rel} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
