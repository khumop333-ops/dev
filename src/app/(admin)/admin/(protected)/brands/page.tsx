import React from "react";
import { prisma } from "@/lib/prisma";
import { BrandsManager } from "@/components/admin/brands-manager";

export const dynamic = "force-dynamic";

export default async function AdminBrandsPage() {
  const brands = await prisma.brand.findMany({
    orderBy: { name: "asc" },
    include: {
      _count: { select: { products: true } },
    },
  });

  return (
    <div className="space-y-6">
      <div className="border-b border-[#D6CBB9] pb-4">
        <span className="text-xs font-semibold uppercase tracking-[0.15em] text-[#23452F]">
          Catalogue Structure
        </span>
        <h1 className="font-serif text-3xl text-[#1C1C19] mt-1">
          Brands &amp; Producers ({brands.length})
        </h1>
      </div>

      <BrandsManager brands={brands} />
    </div>
  );
}
