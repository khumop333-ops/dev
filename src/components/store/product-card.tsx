import React from "react";
import Link from "next/link";
import { formatVariantPriceRange } from "@/lib/money";
import { getProductAggregateStock } from "@/lib/inventory";
import { StockStatusBadge } from "@/components/ui/badge";

export interface ProductCardData {
  id: string;
  name: string;
  slug: string;
  shortDescription: string;
  productTypeLabel: string | null;
  category: { name: string; slug: string };
  brand: { name: string; slug: string } | null;
  images: Array<{ url: string; alt: string }>;
  variants: Array<{
    id: string;
    name: string;
    priceCents: number;
    stockQuantity: number;
    reservedQuantity: number;
    lowStockThreshold: number;
    active: boolean;
  }>;
}

export function ProductCard({ product }: { product: ProductCardData }) {
  const activeVariants = product.variants.filter((v) => v.active);
  const priceLabel = formatVariantPriceRange(
    activeVariants.map((v) => v.priceCents)
  );
  const stockInfo = getProductAggregateStock(activeVariants);
  const primaryImage = product.images[0] ?? {
    url: "/images/demo/category-flower.svg",
    alt: product.name,
  };

  return (
    <article className="group flex flex-col rounded-[8px] border border-[#D6CBB9] bg-white overflow-hidden transition-colors hover:border-[#23452F]">
      <Link
        href={`/products/${product.slug}`}
        prefetch={false}
        className="relative block aspect-square bg-[#F7F3EA] border-b border-[#D6CBB9] overflow-hidden"
      >
        <img
          src={primaryImage.url}
          alt={primaryImage.alt}
          className="h-full w-full object-cover"
          loading="lazy"
        />
        <div className="absolute top-3 left-3 right-3 flex items-center justify-between gap-2">
          <span className="inline-block rounded-[4px] border border-[#D6CBB9] bg-[#F7F3EA] px-2 py-0.5 text-[11px] font-medium text-[#5F5B52]">
            {product.category.name}
          </span>
          <StockStatusBadge
            status={stockInfo.status}
            label={stockInfo.label}
          />
        </div>
      </Link>

      <div className="flex flex-1 flex-col justify-between p-5">
        <div>
          <div className="flex items-center justify-between gap-2 text-xs text-[#5F5B52] mb-1">
            <span>{product.brand?.name || "House Selection"}</span>
            {product.productTypeLabel && (
              <span className="text-[11px] text-[#5F5B52]">
                {product.productTypeLabel}
              </span>
            )}
          </div>

          <h3 className="font-serif text-xl text-[#1C1C19] group-hover:text-[#23452F] transition-colors">
            <Link href={`/products/${product.slug}`} prefetch={false}>
              {product.name}
            </Link>
          </h3>

          <p className="mt-2 text-xs text-[#5F5B52] line-clamp-2 leading-relaxed">
            {product.shortDescription}
          </p>
        </div>

        <div className="mt-5 pt-3.5 border-t border-[#D6CBB9] flex items-center justify-between gap-2">
          <div>
            <span className="block text-[10px] uppercase tracking-wider text-[#5F5B52]">
              Menu Price
            </span>
            <span
              className="text-base font-semibold text-[#1C1C19]"
              data-testid={`product-price-${product.slug}`}
            >
              {priceLabel}
            </span>
          </div>

          <Link
            href={`/products/${product.slug}`}
            prefetch={false}
            className="inline-flex items-center justify-center rounded-[6px] border border-[#23452F] bg-white px-3.5 py-2 text-xs font-medium text-[#23452F] group-hover:bg-[#23452F] group-hover:text-white transition-colors"
          >
            View Details
          </Link>
        </div>
      </div>
    </article>
  );
}
