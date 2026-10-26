import React from "react";
import type { Metadata } from "next";
import { getStoreSettings } from "@/lib/settings";
import { CheckoutForm } from "@/components/store/checkout-form";

export const metadata: Metadata = {
  title: "Complete Reservation Request",
  description:
    "Submit your reservation request for Pretoria in-store collection or local delivery.",
  robots: { index: false, follow: false },
};

export default async function CheckoutPage() {
  const siteConfig = await getStoreSettings();

  return (
    <div className="mx-auto max-w-container px-4 sm:px-6 lg:px-8 py-10 lg:py-14">
      <div className="border-b border-[#D6CBB9] pb-6 mb-8">
        <span className="text-xs font-semibold uppercase tracking-[0.15em] text-[#23452F]">
          Reservation Request
        </span>
        <h1 className="font-serif text-3xl sm:text-4xl text-[#1C1C19] mt-1">
          Complete Your Reservation
        </h1>
        <p className="mt-2 text-sm text-[#5F5B52]">
          No online card payment is taken. Submitting this form reserves your
          selected items while our Pretoria dispensary confirms availability and
          arranges collection or delivery.
        </p>
      </div>

      <CheckoutForm siteConfig={siteConfig} />
    </div>
  );
}
