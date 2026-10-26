import React from "react";
import type { Metadata } from "next";
import Link from "next/link";
import type { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { ProductCard } from "@/components/store/product-card";
import { ShopFiltersLayout } from "@/components/store/shop-filters";
import { getProductAggregateStock } from "@/lib/inventory";
import { randsToCents } from "@/lib/money";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Dispensary Menu & Catalogue",
  description:
    "Browse dried flower, whole-flower pre-rolls, botanical pastilles, solventless extracts, CBD drops, and storage hardware available for reservation in Pretoria.",
};

interface ShopSearchParams {
  q?: string;
  category?: string;
  brand?: string;
  availability?: string;
  minPrice?: string;
  maxPrice?: string;
  sort?: string;
  page?: string;
}

export default async function ShopPage({
  searchParams,
}: {
  searchParams: ShopSearchParams;
}) {
  const q = searchParams.q?.trim() || "";
  const categorySlug = searchParams.category?.trim() || "";
  const brandSlug = searchParams.brand?.trim() || "";
  const availability = searchParams.availability?.trim() || "";
  const minPriceStr = searchParams.minPrice?.trim() || "";
  const maxPriceStr = searchParams.maxPrice?.trim() || "";
  const sort = searchParams.sort?.trim() || "featured";
  const page = Math.max(1, Number.parseInt(searchParams.page || "1", 10) || 1);
  const pageSize = 12;

  const minCents = minPriceStr ? randsToCents(minPriceStr) : null;
  const maxCents = maxPriceStr ? randsToCents(maxPriceStr) : null;

  const where: Prisma.ProductWhereInput = {
    status: "ACTIVE",
  };

  if (categorySlug) {
    where.category = { slug: categorySlug };
  }

  if (brandSlug) {
    where.brand = { slug: brandSlug };
  }

  if (q) {
    where.OR = [
      { name: { contains: q, mode: "insensitive" } },
      { shortDescription: { contains: q, mode: "insensitive" } },
      { descriptionMarkdown: { contains: q, mode: "insensitive" } },
      { terpenes: { contains: q, mode: "insensitive" } },
      { flavourNotes: { contains: q, mode: "insensitive" } },
      { category: { name: { contains: q, mode: "insensitive" } } },
      { brand: { name: { contains: q, mode: "insensitive" } } },
    ];
  }

  if (minCents !== null || maxCents !== null) {
    where.variants = {
      some: {
        active: true,
        ...(minCents !== null ? { priceCents: { gte: minCents } } : {}),
        ...(maxCents !== null ? { priceCents: { lte: maxCents } } : {}),
      },
    };
  }

  const [categories, brands, rawProducts] = await Promise.all([
    prisma.category.findMany({
      where: { active: true },
      orderBy: { sortOrder: "asc" },
      select: { slug: true, name: true },
    }),
    prisma.brand.findMany({
      where: { active: true },
      orderBy: { name: "asc" },
      select: { slug: true, name: true },
    }),
    prisma.product.findMany({
      where,
      include: {
        category: true,
        brand: true,
        images: { orderBy: { sortOrder: "asc" } },
        variants: { where: { active: true }, orderBy: { sortOrder: "asc" } },
      },
    }),
  ]);

  // Filter by stock availability if requested
  let filteredProducts = rawProducts;
  if (availability === "in_stock") {
    filteredProducts = filteredProducts.filter(
      (p) => getProductAggregateStock(p.variants).status !== "OUT_OF_STOCK"
    );
  }

  // Sort products
  filteredProducts.sort((a, b) => {
    const minPriceA = a.variants.length
      ? Math.min(...a.variants.map((v) => v.priceCents))
      : 0;
    const minPriceB = b.variants.length
      ? Math.min(...b.variants.map((v) => v.priceCents))
      : 0;

    switch (sort) {
      case "newest":
        return b.createdAt.getTime() - a.createdAt.getTime();
      case "price_asc":
        return minPriceA - minPriceB;
      case "price_desc":
        return minPriceB - minPriceA;
      case "name_asc":
        return a.name.localeCompare(b.name);
      case "featured":
      default:
        if (a.featured !== b.featured) return a.featured ? -1 : 1;
        return a.name.localeCompare(b.name);
    }
  });

  const totalCount = filteredProducts.length;
  const totalPages = Math.max(1, Math.ceil(totalCount / pageSize));
  const paginatedProducts = filteredProducts.slice(
    (page - 1) * pageSize,
    page * pageSize
  );

  return (
    <div className="mx-auto max-w-container px-4 sm:px-6 lg:px-8 py-10 lg:py-14">
      {/* Page Header */}
      <div className="border-b border-[#D6CBB9] pb-8 mb-8">
        <span className="text-xs font-semibold uppercase tracking-[0.15em] text-[#23452F]">
          Pretoria Dispensary Catalogue
        </span>
        <h1 className="font-serif text-3xl sm:text-4xl lg:text-5xl text-[#1C1C19] mt-1">
          Browse the Menu
        </h1>
        <p className="mt-2.5 text-sm text-[#5F5B52] max-w-2xl leading-relaxed">
          All items are displayed in South African Rand (ZAR). Select items to
          submit a store-confirmed reservation request for Pretoria collection
          or local suburban delivery.
        </p>
      </div>

      <ShopFiltersLayout
        categories={categories}
        brands={brands}
        totalCount={totalCount}
        current={{
          q,
          category: categorySlug,
          brand: brandSlug,
          availability,
          minPrice: minPriceStr,
          maxPrice: maxPriceStr,
          sort,
        }}
      >
        {paginatedProducts.length === 0 ? (
          <div className="rounded-[8px] border border-[#D6CBB9] bg-white p-10 text-center space-y-4">
            <h2 className="font-serif text-2xl text-[#1C1C19]">
              No matching preparations found
            </h2>
            <p className="text-sm text-[#5F5B52] max-w-md mx-auto">
              We could not find any active products matching your selected
              search or filter criteria.
            </p>
            <div>
              <Link
                href="/shop"
                className="inline-flex items-center justify-center rounded-[6px] bg-[#23452F] px-4 py-2 text-xs font-medium text-white hover:bg-[#1A3523]"
              >
                Clear All Filters
              </Link>
            </div>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
              {paginatedProducts.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>

            {totalPages > 1 && (
              <nav
                aria-label="Pagination"
                className="mt-10 flex items-center justify-center gap-2 border-t border-[#D6CBB9] pt-6"
              >
                {Array.from({ length: totalPages }, (_, idx) => idx + 1).map(
                  (pageNum) => {
                    const params = new URLSearchParams();
                    if (q) params.set("q", q);
                    if (categorySlug) params.set("category", categorySlug);
                    if (brandSlug) params.set("brand", brandSlug);
                    if (availability) params.set("availability", availability);
                    if (minPriceStr) params.set("minPrice", minPriceStr);
                    if (maxPriceStr) params.set("maxPrice", maxPriceStr);
                    if (sort !== "featured") params.set("sort", sort);
                    params.set("page", String(pageNum));

                    const isCurrent = pageNum === page;
                    return (
                      <Link
                        key={pageNum}
                        href={`/shop?${params.toString()}`}
                        aria-current={isCurrent ? "page" : undefined}
                        className={
                          isCurrent
                            ? "inline-flex h-9 w-9 items-center justify-center rounded-[4px] bg-[#23452F] text-xs font-semibold text-white"
                            : "inline-flex h-9 w-9 items-center justify-center rounded-[4px] border border-[#D6CBB9] bg-white text-xs font-medium text-[#1C1C19] hover:border-[#23452F]"
                        }
                      >
                        {pageNum}
                      </Link>
                    );
                  }
                )}
              </nav>
            )}
          </>
        )}
      </ShopFiltersLayout>
    </div>
  );
}
