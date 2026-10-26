"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Minus, Plus, Check, ShoppingBag } from "lucide-react";
import { useCart } from "./cart-context";
import { formatZAR } from "@/lib/money";
import { getVariantStockStatus } from "@/lib/inventory";
import { StockStatusBadge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import type { SalesMode } from "@/config/features";
import { cn } from "@/lib/utils";

export interface ProductDetailVariant {
  id: string;
  name: string;
  sku: string;
  priceCents: number;
  stockQuantity: number;
  reservedQuantity: number;
  lowStockThreshold: number;
  active: boolean;
}

export function ProductDetailInteractive({
  productName,
  productSlug,
  variants,
  salesMode,
}: {
  productName: string;
  productSlug: string;
  variants: ProductDetailVariant[];
  salesMode: SalesMode;
}) {
  const { addItem } = useCart();
  const activeVariants = variants.filter((v) => v.active);

  // Default to first in-stock variant or first variant
  const defaultVariant =
    activeVariants.find(
      (v) => getVariantStockStatus(v).status !== "OUT_OF_STOCK"
    ) ?? activeVariants[0];

  const [selectedVariantId, setSelectedVariantId] = useState<string>(
    defaultVariant?.id ?? ""
  );
  const [quantity, setQuantity] = useState<number>(1);
  const [justAdded, setJustAdded] = useState(false);

  const selectedVariant =
    activeVariants.find((v) => v.id === selectedVariantId) ?? activeVariants[0];

  if (!selectedVariant) {
    return (
      <div className="rounded-[6px] border border-[#D6CBB9] bg-[#E7DECF]/50 p-4 text-sm text-[#5F5B52]">
        This product currently has no active variants available.
      </div>
    );
  }

  const stockInfo = getVariantStockStatus(selectedVariant);
  const isOutOfStock = stockInfo.status === "OUT_OF_STOCK";
  const maxQty = Math.min(20, Math.max(1, stockInfo.available));

  const handleVariantChange = (vId: string) => {
    setSelectedVariantId(vId);
    setQuantity(1);
    setJustAdded(false);
  };

  const handleAddToReservation = () => {
    if (isOutOfStock) return;
    addItem(selectedVariant.id, quantity);
    setJustAdded(true);
  };

  return (
    <div className="space-y-6">
      {/* Price & Stock Status Row */}
      <div className="flex flex-wrap items-baseline justify-between gap-4 border-y border-[#D6CBB9] py-4">
        <div>
          <span className="block text-xs uppercase tracking-wider text-[#5F5B52]">
            Selected Option Price
          </span>
          <span
            data-testid="selected-variant-price"
            className="font-serif text-3xl font-normal text-[#1C1C19]"
          >
            {formatZAR(selectedVariant.priceCents)}
          </span>
          <span className="ml-2 text-xs text-[#5F5B52]">
            SKU: {selectedVariant.sku}
          </span>
        </div>

        <StockStatusBadge
          status={stockInfo.status}
          label={stockInfo.label}
        />
      </div>

      {/* Variant Selector */}
      {activeVariants.length > 0 && (
        <div>
          <label className="block text-xs font-semibold uppercase tracking-wider text-[#1C1C19] mb-2.5">
            Select Size / Option
          </label>
          <div
            role="radiogroup"
            aria-label="Product options"
            className="grid grid-cols-1 sm:grid-cols-3 gap-2.5"
          >
            {activeVariants.map((v) => {
              const vStock = getVariantStockStatus(v);
              const isSelected = v.id === selectedVariant.id;
              return (
                <button
                  key={v.id}
                  type="button"
                  role="radio"
                  aria-checked={isSelected}
                  onClick={() => handleVariantChange(v.id)}
                  data-testid={`variant-option-${v.sku}`}
                  className={cn(
                    "flex flex-col items-start justify-between rounded-[6px] border p-3 text-left transition-colors",
                    isSelected
                      ? "border-[#23452F] bg-[#23452F] text-white"
                      : "border-[#D6CBB9] bg-white text-[#1C1C19] hover:border-[#23452F]",
                    vStock.status === "OUT_OF_STOCK" && !isSelected
                      ? "opacity-60"
                      : ""
                  )}
                >
                  <span className="text-xs font-medium">{v.name}</span>
                  <span
                    className={cn(
                      "mt-1 text-sm font-semibold",
                      isSelected ? "text-white" : "text-[#1C1C19]"
                    )}
                  >
                    {formatZAR(v.priceCents)}
                  </span>
                  <span
                    className={cn(
                      "mt-1 text-[10px]",
                      isSelected ? "text-[#E7DECF]" : "text-[#5F5B52]"
                    )}
                  >
                    {vStock.label}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Quantity & Action */}
      {salesMode === "enquiry" ? (
        <div className="space-y-3">
          <Link
            href={`/contact?type=PRODUCT_ENQUIRY&product=${encodeURIComponent(
              productSlug
            )}&subject=${encodeURIComponent(`Enquiry: ${productName} (${selectedVariant.name})`)}`}
            className="inline-flex w-full items-center justify-center rounded-[6px] border border-[#23452F] bg-[#23452F] px-6 py-3.5 text-sm font-medium text-white hover:bg-[#1A3523]"
          >
            Enquire About Availability
          </Link>
          <p className="text-xs text-[#5F5B52]">
            Store currently operates in Direct Enquiry Mode. Submit an enquiry
            and our Pretoria dispensary counter will confirm batch availability.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row items-stretch sm:items-end gap-3">
            <div>
              <label
                htmlFor="product-quantity-input"
                className="block text-xs font-semibold uppercase tracking-wider text-[#1C1C19] mb-1.5"
              >
                Quantity
              </label>
              <div className="inline-flex items-center rounded-[6px] border border-[#D6CBB9] bg-white">
                <button
                  type="button"
                  aria-label="Decrease quantity"
                  disabled={isOutOfStock || quantity <= 1}
                  onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                  className="px-3 py-2.5 text-[#1C1C19] disabled:opacity-40"
                >
                  <Minus className="h-3.5 w-3.5" />
                </button>
                <input
                  id="product-quantity-input"
                  type="number"
                  min={1}
                  max={maxQty}
                  disabled={isOutOfStock}
                  value={quantity}
                  onChange={(e) => {
                    const val = Number.parseInt(e.target.value, 10);
                    if (Number.isFinite(val)) {
                      setQuantity(Math.min(maxQty, Math.max(1, val)));
                    }
                  }}
                  className="w-14 text-center text-sm font-medium text-[#1C1C19] bg-transparent focus:outline-none"
                />
                <button
                  type="button"
                  aria-label="Increase quantity"
                  disabled={isOutOfStock || quantity >= maxQty}
                  onClick={() => setQuantity((q) => Math.min(maxQty, q + 1))}
                  className="px-3 py-2.5 text-[#1C1C19] disabled:opacity-40"
                >
                  <Plus className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>

            <Button
              variant="primary"
              size="lg"
              disabled={isOutOfStock}
              onClick={handleAddToReservation}
              data-testid="add-to-reservation-btn"
              className="flex-1 py-3"
            >
              <ShoppingBag className="h-4 w-4" />
              <span>
                {isOutOfStock
                  ? "Currently Out of Stock"
                  : `Add to Reservation — ${formatZAR(
                      selectedVariant.priceCents * quantity
                    )}`}
              </span>
            </Button>
          </div>

          <div aria-live="polite">
            {justAdded && (
              <div
                data-testid="added-to-cart-feedback"
                className="rounded-[6px] border border-[#2F6B4F] bg-[#2F6B4F]/10 p-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs text-[#1C1C19]"
              >
                <div className="flex items-center gap-2">
                  <Check className="h-4 w-4 text-[#2F6B4F] shrink-0" />
                  <span>
                    Added <strong>{quantity} × {selectedVariant.name}</strong> to your
                    reservation request.
                  </span>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <Link
                    href="/cart"
                    className="rounded-[4px] border border-[#23452F] bg-white px-3 py-1.5 font-medium text-[#23452F] hover:bg-[#F7F3EA]"
                  >
                    View Cart
                  </Link>
                  <Link
                    href="/checkout"
                    className="rounded-[4px] bg-[#23452F] px-3 py-1.5 font-medium text-white hover:bg-[#1A3523]"
                  >
                    Reserve Now
                  </Link>
                </div>
              </div>
            )}
          </div>

          <p className="text-xs text-[#5F5B52]">
            No online card payment is taken. Submitting a reservation holds stock
            while our Pretoria store confirms collection or local delivery.
          </p>
        </div>
      )}
    </div>
  );
}
