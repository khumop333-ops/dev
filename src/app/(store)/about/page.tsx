import React from "react";
import type { Metadata } from "next";
import Link from "next/link";
import { getStoreSettings } from "@/lib/settings";

export const metadata: Metadata = {
  title: "About Our Dispensary",
  description:
    "Learn about Highveld Herbal Co., our Pretoria botanical dispensary standards, batch documentation, and responsible-use principles.",
};

export default async function AboutPage() {
  const siteConfig = await getStoreSettings();

  return (
    <div className="mx-auto max-w-container px-4 sm:px-6 lg:px-8 py-12 lg:py-16 space-y-14">
      {/* Header */}
      <div className="max-w-3xl border-b border-[#D6CBB9] pb-10 space-y-4">
        <span className="text-xs font-semibold uppercase tracking-[0.15em] text-[#23452F]">
          About {siteConfig.brandName}
        </span>
        <h1 className="font-serif text-4xl sm:text-5xl text-[#1C1C19] leading-tight">
          {siteConfig.tagline}
        </h1>
        <p className="text-base text-[#5F5B52] leading-relaxed">
          Based in {siteConfig.city}, {siteConfig.province},{" "}
          {siteConfig.brandName} is an independent botanical dispensary focused
          on small-batch dried flower, solventless preparations, and apothecary
          formulations presented with clear, verifiable product information.
        </p>
      </div>

      {/* Three Pillars */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="rounded-[8px] border border-[#D6CBB9] bg-white p-7 space-y-3">
          <span className="font-mono text-xs text-[#23452F] font-semibold">
            01 • CURATION
          </span>
          <h2 className="font-serif text-2xl text-[#1C1C19]">
            Small-Batch Selection
          </h2>
          <p className="text-sm text-[#5F5B52] leading-relaxed">
            We partner with regional South African cultivators and botanical
            formulators who prioritise clean cultivation inputs, slow cold-curing,
            and protective ultraviolet glass packaging.
          </p>
        </div>

        <div className="rounded-[8px] border border-[#D6CBB9] bg-white p-7 space-y-3">
          <span className="font-mono text-xs text-[#23452F] font-semibold">
            02 • CLARITY
          </span>
          <h2 className="font-serif text-2xl text-[#1C1C19]">
            Honest Documentation
          </h2>
          <p className="text-sm text-[#5F5B52] leading-relaxed">
            Every preparation on our menu lists its batch reference, weight or
            volume, storage requirements, and aromatic profile in plain
            language—without unverified claims or medical promises.
          </p>
        </div>

        <div className="rounded-[8px] border border-[#D6CBB9] bg-white p-7 space-y-3">
          <span className="font-mono text-xs text-[#23452F] font-semibold">
            03 • STEWARDSHIP
          </span>
          <h2 className="font-serif text-2xl text-[#1C1C19]">
            Strict 18+ Responsibility
          </h2>
          <p className="text-sm text-[#5F5B52] leading-relaxed">
            We enforce mandatory age verification (18+) at every point of
            interaction and practise POPIA-aligned data minimisation when
            handling customer reservations.
          </p>
        </div>
      </section>

      {/* Editorial Narrative & Compliance Placeholder Box */}
      <section className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        <div className="lg:col-span-7 rounded-[8px] border border-[#D6CBB9] bg-white p-8 space-y-5">
          <h2 className="font-serif text-3xl text-[#1C1C19]">
            Designed Like an Apothecary, Operated for Adults
          </h2>
          <div className="space-y-4 text-sm text-[#5F5B52] leading-relaxed">
            <p>
              Whether you are visiting our {siteConfig.suburb} counter in person
              or submitting an online reservation request for local Pretoria
              delivery, our process is designed to be unhurried and transparent.
            </p>
            <p>
              Because stock moves in small harvest batches, our website operates
              in live reservation mode: when you submit a reservation request,
              your chosen variants are held while our staff verify your order and
              confirm collection or delivery directly with you.
            </p>
          </div>
          <div className="pt-3 flex flex-wrap gap-3">
            <Link
              href="/shop"
              className="inline-flex rounded-[6px] bg-[#23452F] px-5 py-2.5 text-xs font-medium text-white hover:bg-[#1A3523]"
            >
              Browse the Menu
            </Link>
            <Link
              href="/visit"
              className="inline-flex rounded-[6px] border border-[#D6CBB9] bg-[#F7F3EA] px-5 py-2.5 text-xs font-medium text-[#1C1C19] hover:border-[#23452F]"
            >
              Visit Pretoria Store
            </Link>
          </div>
        </div>

        <div className="lg:col-span-5 rounded-[8px] border border-[#D6CBB9] bg-[#E7DECF]/65 p-8 space-y-4">
          <h2 className="font-serif text-2xl text-[#1C1C19]">
            Compliance &amp; Regulatory Notice
          </h2>
          <p className="text-xs text-[#5F5B52] leading-relaxed">
            {siteConfig.complianceNotice}
          </p>
          <p className="text-xs text-[#956A1C] border-t border-[#D6CBB9] pt-3">
            {siteConfig.legalReviewWarning}
          </p>
          <div className="pt-2 flex flex-wrap gap-3 text-xs">
            <Link
              href="/legal/responsible-use"
              className="underline text-[#23452F] font-medium"
            >
              Responsible Use Policy
            </Link>
            <Link
              href="/legal/age-policy"
              className="underline text-[#23452F] font-medium"
            >
              18+ Age Policy
            </Link>
            <Link
              href="/legal/privacy"
              className="underline text-[#23452F] font-medium"
            >
              POPIA Privacy Notice
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
