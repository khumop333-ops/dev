import React, { cache } from "react";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { ProductCard } from "@/components/store/product-card";

export const dynamic = "force-dynamic";

const getCategoryWithProducts = cache(async (slug: string) => {
  return prisma.category.findUnique({
    where: { slug },
    include: {
      products: {
        where: { status: "ACTIVE" },
        include: {
          category: true,
          brand: true,
          images: { orderBy: { sortOrder: "asc" } },
          variants: { where: { active: true }, orderBy: { sortOrder: "asc" } },
        },
        orderBy: [{ featured: "desc" }, { name: "asc" }],
      },
    },
  });
});

export async function generateMetadata({
  params,
}: {
  params: { slug: string };
}): Promise<Metadata> {
  try {
    const category = await getCategoryWithProducts(params.slug);

    if (!category || !category.active) {
      return { title: "Collection Not Found" };
    }

    return {
      title: `${category.name} Collection`,
      description:
        category.description ||
        `Browse ${category.name} available for reservation in Pretoria.`,
    };
  } catch {
    return { title: "Department Collection" };
  }
}

export default async function CategoryArchivePage({
  params,
}: {
  params: { slug: string };
}) {
  const [category, allCategories] = await Promise.all([
    getCategoryWithProducts(params.slug),
    prisma.category.findMany({
      where: { active: true },
      orderBy: { sortOrder: "asc" },
    }),
  ]);

  if (!category || !category.active) {
    notFound();
  }

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";
  const breadcrumbJsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home", item: siteUrl },
      { "@type": "ListItem", position: 2, name: "Menu", item: `${siteUrl}/shop` },
      {
        "@type": "ListItem",
        position: 3,
        name: category.name,
        item: `${siteUrl}/collections/${category.slug}`,
      },
    ],
  };

  return (
    <div className="mx-auto max-w-container px-4 sm:px-6 lg:px-8 py-10 lg:py-14">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
      />

      {/* Breadcrumbs */}
      <nav aria-label="Breadcrumb" className="mb-6 text-xs text-[#5F5B52]">
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
          <li aria-current="page" className="text-[#1C1C19] font-medium">
            {category.name}
          </li>
        </ol>
      </nav>

      {/* Category Header */}
      <div className="border-b border-[#D6CBB9] pb-8 mb-8">
        <span className="text-xs font-semibold uppercase tracking-[0.15em] text-[#23452F]">
          Department Archive
        </span>
        <h1 className="font-serif text-3xl sm:text-4xl lg:text-5xl text-[#1C1C19] mt-1">
          {category.name}
        </h1>
        {category.description && (
          <p className="mt-2.5 text-sm text-[#5F5B52] max-w-2xl leading-relaxed">
            {category.description}
          </p>
        )}

        {/* Category Switcher Tabs */}
        <div className="mt-6 flex flex-wrap gap-2">
          {allCategories.map((c) => {
            const active = c.slug === category.slug;
            return (
              <Link
                key={c.id}
                href={`/collections/${c.slug}`}
                prefetch={false}
                className={
                  active
                    ? "rounded-[4px] border border-[#23452F] bg-[#23452F] px-3 py-1.5 text-xs font-medium text-white"
                    : "rounded-[4px] border border-[#D6CBB9] bg-white px-3 py-1.5 text-xs font-medium text-[#1C1C19] hover:border-[#23452F]"
                }
              >
                {c.name}
              </Link>
            );
          })}
        </div>
      </div>

      {category.products.length === 0 ? (
        <div className="rounded-[8px] border border-[#D6CBB9] bg-white p-10 text-center space-y-3">
          <h2 className="font-serif text-2xl text-[#1C1C19]">
            No active items in {category.name}
          </h2>
          <p className="text-sm text-[#5F5B52]">
            Please check back soon or explore our other departments.
          </p>
          <Link
            href="/shop"
            className="inline-flex rounded-[6px] bg-[#23452F] px-4 py-2 text-xs font-medium text-white"
          >
            Browse Full Menu
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {category.products.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      )}
    </div>
  );
}
