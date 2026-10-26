import React from "react";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { ProductEditorForm } from "@/components/admin/product-editor-form";

export const dynamic = "force-dynamic";

export default async function AdminEditProductPage({
  params,
}: {
  params: { id: string };
}) {
  const [product, categories, brands] = await Promise.all([
    prisma.product.findUnique({
      where: { id: params.id },
      include: {
        images: { orderBy: { sortOrder: "asc" } },
        variants: { orderBy: { sortOrder: "asc" } },
      },
    }),
    prisma.category.findMany({
      orderBy: { sortOrder: "asc" },
      select: { id: true, name: true },
    }),
    prisma.brand.findMany({
      orderBy: { name: "asc" },
      select: { id: true, name: true },
    }),
  ]);

  if (!product) {
    notFound();
  }

  return (
    <ProductEditorForm
      categories={categories}
      brands={brands}
      initialData={{
        id: product.id,
        name: product.name,
        slug: product.slug,
        brandId: product.brandId,
        categoryId: product.categoryId,
        shortDescription: product.shortDescription,
        descriptionMarkdown: product.descriptionMarkdown,
        status: product.status,
        featured: product.featured,
        productTypeLabel: product.productTypeLabel || "",
        thcContent: product.thcContent || "",
        cbdContent: product.cbdContent || "",
        weightLabel: product.weightLabel || "",
        terpenes: product.terpenes || "",
        flavourNotes: product.flavourNotes || "",
        labTestUrl: product.labTestUrl || "",
        batchNumber: product.batchNumber || "",
        storageNotes: product.storageNotes || "",
        seoTitle: product.seoTitle || "",
        seoDescription: product.seoDescription || "",
        images:
          product.images.length > 0
            ? product.images.map((img) => ({
                id: img.id,
                url: img.url,
                alt: img.alt,
                sortOrder: img.sortOrder,
              }))
            : [
                {
                  url: "/images/demo/product-apricot-reserve.svg",
                  alt: product.name,
                  sortOrder: 0,
                },
              ],
        variants: product.variants.map((v) => ({
          id: v.id,
          name: v.name,
          sku: v.sku,
          priceCents: v.priceCents,
          compareAtPriceCents: v.compareAtPriceCents,
          stockQuantity: v.stockQuantity,
          reservedQuantity: v.reservedQuantity,
          lowStockThreshold: v.lowStockThreshold,
          active: v.active,
          sortOrder: v.sortOrder,
        })),
      }}
    />
  );
}
