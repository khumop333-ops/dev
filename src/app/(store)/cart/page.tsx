import React from "react";
import type { Metadata } from "next";
import { getStoreSettings } from "@/lib/settings";
import { CartView } from "@/components/store/cart-view";

export const metadata: Metadata = {
  title: "Reservation Cart",
  description:
    "Review your selected botanical preparations before submitting a reservation request for Pretoria collection or local delivery.",
};

export default async function CartPage() {
  const siteConfig = await getStoreSettings();

  return (
    <div className="mx-auto max-w-container px-4 sm:px-6 lg:px-8 py-10 lg:py-14">
      <div className="border-b border-[#D6CBB9] pb-6 mb-8">
        <span className="text-xs font-semibold uppercase tracking-[0.15em] text-[#23452F]">
          Store-Confirmed Request
        </span>
        <h1 className="font-serif text-3xl sm:text-4xl text-[#1C1C19] mt-1">
          Your Reservation Cart
        </h1>
      </div>

      <CartView
        deliveryFeeCents={siteConfig.deliveryFeeCents}
        freeDeliveryThresholdCents={siteConfig.freeDeliveryThresholdCents}
      />
    </div>
  );
}
