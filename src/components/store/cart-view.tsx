"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { Minus, Plus, Trash2, ArrowRight, ShieldAlert } from "lucide-react";
import { useCart } from "./cart-context";
import {
  resolveCartVariantsAction,
  type HydratedCartVariant,
} from "@/server/actions/checkout";
import { formatZAR, calculateOrderTotals } from "@/lib/money";
import { Button } from "@/components/ui/button";

export function CartView({
  deliveryFeeCents,
  freeDeliveryThresholdCents,
}: {
  deliveryFeeCents: number;
  freeDeliveryThresholdCents: number;
}) {
  const { items, isHydrated, updateQuantity, removeItem, clearCart } = useCart();
  const [hydratedMap, setHydratedMap] = useState<
    Record<string, HydratedCartVariant>
  >({});
  const [loading, setLoading] = useState(true);
  const [fulfilmentPreview, setFulfilmentPreview] = useState<
    "COLLECTION" | "DELIVERY"
  >("COLLECTION");

  useEffect(() => {
    if (!isHydrated) return;

    const variantIds = items.map((i) => i.variantId);
    if (variantIds.length === 0) {
      setHydratedMap({});
      setLoading(false);
      return;
    }

    let cancelled = false;
    setLoading(true);
    resolveCartVariantsAction(variantIds)
      .then((list) => {
        if (cancelled) return;
        const map: Record<string, HydratedCartVariant> = {};
        for (const v of list) {
          map[v.variantId] = v;
        }
        setHydratedMap(map);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [items, isHydrated]);

  if (!isHydrated || loading) {
    return (
      <div className="rounded-[8px] border border-[#D6CBB9] bg-white p-10 text-center text-sm text-[#5F5B52]">
        Verifying live menu prices and stock levels...
      </div>
    );
  }

  const validLines = items
    .map((item) => {
      const variant = hydratedMap[item.variantId];
      if (!variant) return null;
      return {
        ...variant,
        quantity: item.quantity,
        lineTotalCents: variant.priceCents * item.quantity,
      };
    })
    .filter((l): l is NonNullable<typeof l> => l !== null);

  if (validLines.length === 0) {
    return (
      <div className="rounded-[8px] border border-[#D6CBB9] bg-white p-10 text-center space-y-4">
        <h2 className="font-serif text-2xl text-[#1C1C19]">
          Your reservation request is empty
        </h2>
        <p className="text-sm text-[#5F5B52] max-w-md mx-auto">
          Browse our Pretoria dispensary menu to select dried flower, pre-rolls,
          botanical pastilles, extracts, or CBD preparations to reserve.
        </p>
        <div className="pt-2">
          <Link
            href="/shop"
            className="inline-flex items-center justify-center rounded-[6px] bg-[#23452F] px-6 py-3 text-sm font-medium text-white hover:bg-[#1A3523]"
          >
            Browse the Menu
          </Link>
        </div>
      </div>
    );
  }

  const totals = calculateOrderTotals({
    items: validLines.map((l) => ({
      unitPriceCents: l.priceCents,
      quantity: l.quantity,
    })),
    fulfilmentMethod: fulfilmentPreview,
    deliveryFeeCents,
    freeDeliveryThresholdCents,
  });

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
      {/* Line Items Table / Cards */}
      <div className="lg:col-span-8 space-y-4">
        <div className="rounded-[8px] border border-[#D6CBB9] bg-white divide-y divide-[#D6CBB9]">
          {validLines.map((line) => (
            <div
              key={line.variantId}
              data-testid={`cart-line-${line.sku}`}
              className="p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4"
            >
              <div className="flex items-start gap-4">
                <Link
                  href={`/products/${line.productSlug}`}
                  className="h-20 w-20 shrink-0 rounded-[6px] border border-[#D6CBB9] bg-[#F7F3EA] overflow-hidden"
                >
                  <img
                    src={line.imageUrl}
                    alt={line.imageAlt}
                    className="h-full w-full object-cover"
                  />
                </Link>
                <div>
                  <span className="text-[11px] text-[#5F5B52]">
                    {line.categoryName}
                    {line.brandName ? ` • ${line.brandName}` : ""}
                  </span>
                  <h3 className="font-serif text-lg text-[#1C1C19]">
                    <Link
                      href={`/products/${line.productSlug}`}
                      className="hover:text-[#23452F]"
                    >
                      {line.productName}
                    </Link>
                  </h3>
                  <p className="text-xs text-[#5F5B52] mt-0.5">
                    Option:{" "}
                    <strong className="text-[#1C1C19]">{line.variantName}</strong>{" "}
                    (SKU: {line.sku})
                  </p>
                  <p className="text-xs font-medium text-[#1C1C19] mt-1">
                    {formatZAR(line.priceCents)} each
                  </p>
                  {line.quantity > line.availableStock && (
                    <p className="mt-1 text-xs font-medium text-[#9E3A32]">
                      Only {line.availableStock} left in stock — please adjust
                      quantity.
                    </p>
                  )}
                </div>
              </div>

              <div className="flex items-center justify-between sm:justify-end gap-4 pt-2 sm:pt-0 border-t sm:border-t-0 border-[#D6CBB9]">
                <div className="inline-flex items-center rounded-[6px] border border-[#D6CBB9] bg-[#F7F3EA]">
                  <button
                    type="button"
                    aria-label={`Decrease quantity of ${line.productName}`}
                    onClick={() =>
                      updateQuantity(line.variantId, line.quantity - 1)
                    }
                    className="px-2.5 py-1.5 text-[#1C1C19] hover:bg-[#E7DECF]"
                  >
                    <Minus className="h-3.5 w-3.5" />
                  </button>
                  <span
                    data-testid={`cart-qty-${line.sku}`}
                    className="w-10 text-center text-xs font-semibold text-[#1C1C19]"
                  >
                    {line.quantity}
                  </span>
                  <button
                    type="button"
                    aria-label={`Increase quantity of ${line.productName}`}
                    disabled={line.quantity >= line.availableStock}
                    onClick={() =>
                      updateQuantity(line.variantId, line.quantity + 1)
                    }
                    className="px-2.5 py-1.5 text-[#1C1C19] hover:bg-[#E7DECF] disabled:opacity-40"
                  >
                    <Plus className="h-3.5 w-3.5" />
                  </button>
                </div>

                <div className="text-right min-w-[95px]">
                  <span
                    data-testid={`cart-line-total-${line.sku}`}
                    className="text-sm font-semibold text-[#1C1C19]"
                  >
                    {formatZAR(line.lineTotalCents)}
                  </span>
                </div>

                <button
                  type="button"
                  aria-label={`Remove ${line.productName}`}
                  onClick={() => removeItem(line.variantId)}
                  className="rounded-[4px] p-1.5 text-[#5F5B52] hover:text-[#9E3A32] hover:bg-[#9E3A32]/10"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </div>
          ))}
        </div>

        <div className="flex items-center justify-between">
          <Link
            href="/shop"
            className="text-xs font-medium text-[#23452F] hover:underline"
          >
            ← Continue browsing menu
          </Link>
          <Button variant="outline" size="sm" onClick={clearCart}>
            Clear Reservation Cart
          </Button>
        </div>
      </div>

      {/* Summary & Reservation Notice */}
      <aside className="lg:col-span-4 space-y-4">
        <div className="rounded-[8px] border border-[#D6CBB9] bg-white p-6 space-y-5">
          <h2 className="font-serif text-2xl text-[#1C1C19] border-b border-[#D6CBB9] pb-3">
            Reservation Summary
          </h2>

          {/* Fulfilment Estimator Toggle */}
          <div>
            <span className="block text-xs font-semibold uppercase tracking-wider text-[#1C1C19] mb-2">
              Estimate Fulfilment
            </span>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setFulfilmentPreview("COLLECTION")}
                className={
                  fulfilmentPreview === "COLLECTION"
                    ? "rounded-[6px] border border-[#23452F] bg-[#23452F] px-3 py-2 text-xs font-medium text-white"
                    : "rounded-[6px] border border-[#D6CBB9] bg-[#F7F3EA] px-3 py-2 text-xs font-medium text-[#1C1C19]"
                }
              >
                In-Store Collection
              </button>
              <button
                type="button"
                onClick={() => setFulfilmentPreview("DELIVERY")}
                className={
                  fulfilmentPreview === "DELIVERY"
                    ? "rounded-[6px] border border-[#23452F] bg-[#23452F] px-3 py-2 text-xs font-medium text-white"
                    : "rounded-[6px] border border-[#D6CBB9] bg-[#F7F3EA] px-3 py-2 text-xs font-medium text-[#1C1C19]"
                }
              >
                Pretoria Delivery
              </button>
            </div>
          </div>

          <dl className="space-y-2.5 text-sm border-t border-[#D6CBB9] pt-4">
            <div className="flex items-center justify-between text-[#5F5B52]">
              <dt>Subtotal</dt>
              <dd className="font-medium text-[#1C1C19]" data-testid="cart-subtotal">
                {formatZAR(totals.subtotalCents)}
              </dd>
            </div>
            <div className="flex items-center justify-between text-[#5F5B52]">
              <dt>
                {fulfilmentPreview === "COLLECTION"
                  ? "Pretoria Collection"
                  : "Estimated Local Delivery"}
              </dt>
              <dd className="font-medium text-[#1C1C19]">
                {totals.deliveryFeeCents === 0
                  ? "Complimentary"
                  : formatZAR(totals.deliveryFeeCents)}
              </dd>
            </div>
            {fulfilmentPreview === "DELIVERY" &&
              !totals.qualifiesForFreeDelivery &&
              totals.amountUntilFreeDeliveryCents > 0 && (
                <p className="text-[11px] text-[#5F5B52]">
                  Add {formatZAR(totals.amountUntilFreeDeliveryCents)} more for
                  complimentary Pretoria delivery.
                </p>
              )}
            <div className="flex items-center justify-between border-t border-[#D6CBB9] pt-3 text-base font-semibold text-[#1C1C19]">
              <dt>Estimated Total</dt>
              <dd data-testid="cart-total">{formatZAR(totals.totalCents)}</dd>
            </div>
          </dl>

          <div className="rounded-[6px] border border-[#D6CBB9] bg-[#E7DECF]/60 p-3.5 text-xs text-[#1C1C19] flex items-start gap-2.5">
            <ShieldAlert className="h-4 w-4 text-[#23452F] shrink-0 mt-0.5" />
            <p className="leading-relaxed">
              <strong>No online payment is taken.</strong> This is a
              reservation/order request. The store will confirm availability and
              payment.
            </p>
          </div>

          <Link
            href="/checkout"
            data-testid="proceed-to-checkout-btn"
            className="inline-flex w-full items-center justify-center gap-2 rounded-[6px] bg-[#23452F] px-5 py-3.5 text-sm font-medium text-white hover:bg-[#1A3523] transition-colors"
          >
            <span>Proceed to Reservation Checkout</span>
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </aside>
    </div>
  );
}
