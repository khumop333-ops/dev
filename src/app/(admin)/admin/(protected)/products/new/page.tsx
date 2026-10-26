import React from "react";
import { prisma } from "@/lib/prisma";
import { ProductEditorForm } from "@/components/admin/product-editor-form";

export const dynamic = "force-dynamic";

export default async function AdminNewProductPage() {
  const [categories, brands] = await Promise.all([
    prisma.category.findMany({
      orderBy: { sortOrder: "asc" },
      select: { id: true, name: true },
    }),
    prisma.brand.findMany({
      orderBy: { name: "asc" },
      select: { id: true, name: true },
    }),
  ]);

  return (
    <ProductEditorForm
      categories={categories}
      brands={brands}
      initialData={{
        name: "",
        slug: "",
        brandId: brands[0]?.id || null,
        categoryId: categories[0]?.id || "",
        shortDescription: "",
        descriptionMarkdown: "### Preparation Overview\n\nEnter factual preparation details here.",
        status: "ACTIVE",
        featured: false,
        productTypeLabel: "",
        thcContent: "",
        cbdContent: "",
        weightLabel: "",
        terpenes: "",
        flavourNotes: "",
        labTestUrl: "",
        batchNumber: "",
        storageNotes:
          "Store sealed in a cool, dark cupboard below 22°C out of reach of children.",
        seoTitle: "",
        seoDescription: "",
        images: [
          {
            url: "/images/demo/product-apricot-reserve.svg",
            alt: "Botanical preparation specimen illustration",
            sortOrder: 0,
          },
        ],
        variants: [
          {
            name: "3.5g Glass Jar",
            sku: `HHC-${Date.now().toString().slice(-4)}`,
            priceCents: 35000,
            stockQuantity: 10,
            reservedQuantity: 0,
            lowStockThreshold: 3,
            active: true,
            sortOrder: 0,
          },
        ],
      }}
    />
  );
}
