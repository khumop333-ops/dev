import React from "react";
import Link from "next/link";
import type { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { formatVariantPriceRange } from "@/lib/money";
import { getProductAggregateStock } from "@/lib/inventory";
import { StockStatusBadge } from "@/components/ui/badge";

export const dynamic = "force-dynamic";

export default async function AdminProductsListPage({
  searchParams,
}: {
  searchParams: { q?: string; status?: string; category?: string };
}) {
  const q = searchParams.q?.trim() || "";
  const statusFilter = searchParams.status?.trim() || "";
  const categoryFilter = searchParams.category?.trim() || "";

  const where: Prisma.ProductWhereInput = {};
  if (
    statusFilter === "ACTIVE" ||
    statusFilter === "DRAFT" ||
    statusFilter === "ARCHIVED"
  ) {
    where.status = statusFilter;
  }
  if (categoryFilter) {
    where.categoryId = categoryFilter;
  }
  if (q) {
    where.OR = [
      { name: { contains: q, mode: "insensitive" } },
      { slug: { contains: q, mode: "insensitive" } },
      { batchNumber: { contains: q, mode: "insensitive" } },
    ];
  }

  const [products, categories] = await Promise.all([
    prisma.product.findMany({
      where,
      include: {
        category: true,
        brand: true,
        variants: { orderBy: { sortOrder: "asc" } },
      },
      orderBy: [{ status: "asc" }, { name: "asc" }],
    }),
    prisma.category.findMany({ orderBy: { sortOrder: "asc" } }),
  ]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 border-b border-[#D6CBB9] pb-5">
        <div>
          <span className="text-xs font-semibold uppercase tracking-[0.15em] text-[#23452F]">
            Catalogue Management
          </span>
          <h1 className="font-serif text-3xl text-[#1C1C19] mt-1">
            Products ({products.length})
          </h1>
        </div>
        <Link
          href="/admin/products/new"
          data-testid="admin-new-product-btn"
          className="inline-flex items-center justify-center rounded-[6px] bg-[#23452F] px-4 py-2.5 text-xs font-medium text-white hover:bg-[#1A3523]"
        >
          + Create Product
        </Link>
      </div>

      {/* Filter Bar */}
      <form
        method="get"
        className="rounded-[8px] border border-[#D6CBB9] bg-white p-4 grid grid-cols-1 sm:grid-cols-4 gap-3 items-end"
      >
        <div>
          <label
            htmlFor="admin-prod-q"
            className="block text-[11px] font-semibold uppercase tracking-wider text-[#5F5B52] mb-1"
          >
            Search Name / Batch
          </label>
          <input
            id="admin-prod-q"
            name="q"
            type="search"
            defaultValue={q}
            placeholder="Search products..."
            className="w-full rounded-[6px] border border-[#D6CBB9] bg-white px-3 py-1.5 text-xs text-[#1C1C19]"
          />
        </div>

        <div>
          <label
            htmlFor="admin-prod-cat"
            className="block text-[11px] font-semibold uppercase tracking-wider text-[#5F5B52] mb-1"
          >
            Category
          </label>
          <select
            id="admin-prod-cat"
            name="category"
            defaultValue={categoryFilter}
            className="w-full rounded-[6px] border border-[#D6CBB9] bg-white px-3 py-1.5 text-xs text-[#1C1C19]"
          >
            <option value="">All Categories</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label
            htmlFor="admin-prod-status"
            className="block text-[11px] font-semibold uppercase tracking-wider text-[#5F5B52] mb-1"
          >
            Status
          </label>
          <select
            id="admin-prod-status"
            name="status"
            defaultValue={statusFilter}
            className="w-full rounded-[6px] border border-[#D6CBB9] bg-white px-3 py-1.5 text-xs text-[#1C1C19]"
          >
            <option value="">All Statuses</option>
            <option value="ACTIVE">ACTIVE (Published)</option>
            <option value="DRAFT">DRAFT</option>
            <option value="ARCHIVED">ARCHIVED</option>
          </select>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="submit"
            className="rounded-[6px] bg-[#23452F] px-4 py-1.5 text-xs font-medium text-white"
          >
            Filter
          </button>
          <Link
            href="/admin/products"
            className="rounded-[6px] border border-[#D6CBB9] bg-[#F7F3EA] px-3 py-1.5 text-xs text-[#1C1C19]"
          >
            Reset
          </Link>
        </div>
      </form>

      {/* Products Data Table */}
      <div className="rounded-[8px] border border-[#D6CBB9] bg-white overflow-x-auto">
        <table className="w-full text-left text-xs">
          <thead className="bg-[#E7DECF]/60 border-b border-[#D6CBB9] text-[#5F5B52]">
            <tr>
              <th className="py-3 px-4 font-medium">Product</th>
              <th className="py-3 px-4 font-medium">Category / Brand</th>
              <th className="py-3 px-4 font-medium">Price (ZAR)</th>
              <th className="py-3 px-4 font-medium">Stock Status</th>
              <th className="py-3 px-4 font-medium">Publish Status</th>
              <th className="py-3 px-4 font-medium text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#D6CBB9]">
            {products.map((prod) => {
              const stock = getProductAggregateStock(prod.variants);
              const priceLabel = formatVariantPriceRange(
                prod.variants.filter((v) => v.active).map((v) => v.priceCents)
              );

              return (
                <tr key={prod.id} className="hover:bg-[#F7F3EA]/50">
                  <td className="py-3.5 px-4">
                    <p className="font-semibold text-[#1C1C19]">{prod.name}</p>
                    <p className="text-[#5F5B52] font-mono text-[11px]">
                      /{prod.slug}
                      {prod.featured ? " • ★ Featured" : ""}
                    </p>
                  </td>
                  <td className="py-3.5 px-4">
                    <p className="text-[#1C1C19]">{prod.category.name}</p>
                    <p className="text-[#5F5B52]">
                      {prod.brand?.name || "No brand"}
                    </p>
                  </td>
                  <td className="py-3.5 px-4 font-medium text-[#1C1C19]">
                    {priceLabel}
                    <span className="block text-[11px] text-[#5F5B52]">
                      {prod.variants.length} variant(s)
                    </span>
                  </td>
                  <td className="py-3.5 px-4">
                    <StockStatusBadge
                      status={stock.status}
                      label={`${stock.label} (${stock.totalAvailable} avail)`}
                    />
                  </td>
                  <td className="py-3.5 px-4">
                    <span
                      className={
                        prod.status === "ACTIVE"
                          ? "rounded-[4px] border border-[#2F6B4F]/40 bg-[#2F6B4F]/10 px-2 py-0.5 text-[11px] font-medium text-[#2F6B4F]"
                          : "rounded-[4px] border border-[#D6CBB9] bg-[#E7DECF] px-2 py-0.5 text-[11px] font-medium text-[#5F5B52]"
                      }
                    >
                      {prod.status}
                    </span>
                  </td>
                  <td className="py-3.5 px-4 text-right space-x-3">
                    <Link
                      href={`/admin/products/${prod.id}`}
                      data-testid={`edit-product-${prod.slug}`}
                      className="font-medium text-[#23452F] underline"
                    >
                      Edit
                    </Link>
                    {prod.status === "ACTIVE" && (
                      <Link
                        href={`/products/${prod.slug}`}
                        target="_blank"
                        className="text-[#5F5B52] hover:text-[#1C1C19] underline"
                      >
                        View
                      </Link>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
