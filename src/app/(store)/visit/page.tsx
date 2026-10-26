import React from "react";
import type { Metadata } from "next";
import Link from "next/link";
import { MapPin, Clock, Car, Truck, ShieldCheck } from "lucide-react";
import { getStoreSettings } from "@/lib/settings";
import { formatZAR } from "@/lib/money";

export const metadata: Metadata = {
  title: "Visit Our Pretoria Store & Delivery Areas",
  description:
    "Address, trading hours, parking notes, in-store collection guide, and covered Pretoria delivery suburbs for Highveld Herbal Co.",
};

export default async function VisitStorePage() {
  const siteConfig = await getStoreSettings();

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "LocalBusiness",
    name: siteConfig.brandName,
    telephone: siteConfig.phone,
    email: siteConfig.email,
    address: {
      "@type": "PostalAddress",
      streetAddress: siteConfig.addressLine1,
      addressLocality: siteConfig.city,
      addressRegion: siteConfig.province,
      postalCode: siteConfig.postalCode,
      addressCountry: "ZA",
    },
  };

  return (
    <div className="mx-auto max-w-container px-4 sm:px-6 lg:px-8 py-12 lg:py-16 space-y-12">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      {/* Header */}
      <div className="border-b border-[#D6CBB9] pb-8 max-w-3xl">
        <span className="text-xs font-semibold uppercase tracking-[0.15em] text-[#23452F]">
          {siteConfig.city}, {siteConfig.province}
        </span>
        <h1 className="font-serif text-4xl sm:text-5xl text-[#1C1C19] mt-1">
          Visit Our Pretoria Dispensary
        </h1>
        <p className="mt-3 text-sm text-[#5F5B52] leading-relaxed">
          Collect reserved orders at our {siteConfig.suburb} counter or arrange
          same-day local courier delivery across covered Pretoria suburbs.
        </p>
      </div>

      {/* Main Grid: Address/Hours + Architectural Map Card */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        <div className="lg:col-span-6 space-y-6">
          <div className="rounded-[8px] border border-[#D6CBB9] bg-white p-7 space-y-5">
            <div className="flex items-start gap-3">
              <MapPin className="h-5 w-5 text-[#23452F] shrink-0 mt-1" />
              <div>
                <h2 className="font-serif text-2xl text-[#1C1C19]">
                  Physical Address
                </h2>
                <p className="text-sm text-[#5F5B52] mt-1">
                  {siteConfig.fullAddress}
                </p>
                <p className="text-xs text-[#5F5B52] mt-1">
                  Tel: {siteConfig.phone} • WhatsApp: {siteConfig.whatsappDisplay}
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3 border-t border-[#D6CBB9] pt-5">
              <Clock className="h-5 w-5 text-[#23452F] shrink-0 mt-1" />
              <div>
                <h2 className="font-serif text-2xl text-[#1C1C19]">
                  Trading Hours ({siteConfig.hours.timezone})
                </h2>
                <ul className="mt-2 space-y-1 text-sm text-[#5F5B52]">
                  <li className="font-medium text-[#1C1C19]">
                    {siteConfig.hours.weekdays}
                  </li>
                  <li>{siteConfig.hours.saturday}</li>
                  <li>{siteConfig.hours.sunday}</li>
                  <li className="text-xs pt-1">
                    {siteConfig.hours.publicHolidays}
                  </li>
                </ul>
              </div>
            </div>

            <div className="flex items-start gap-3 border-t border-[#D6CBB9] pt-5">
              <Car className="h-5 w-5 text-[#23452F] shrink-0 mt-1" />
              <div>
                <h2 className="font-serif text-2xl text-[#1C1C19]">
                  Parking &amp; Access
                </h2>
                <p className="mt-1 text-xs text-[#5F5B52] leading-relaxed">
                  {siteConfig.parkingNotes}
                </p>
              </div>
            </div>

            <div className="pt-2 flex flex-wrap gap-3">
              <a
                href={siteConfig.directionsUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex rounded-[6px] bg-[#23452F] px-5 py-2.5 text-xs font-medium text-white hover:bg-[#1A3523]"
              >
                Open Directions in Google Maps ↗
              </a>
              <Link
                href="/contact"
                className="inline-flex rounded-[6px] border border-[#D6CBB9] bg-[#F7F3EA] px-5 py-2.5 text-xs font-medium text-[#1C1C19] hover:border-[#23452F]"
              >
                Contact the Counter
              </Link>
            </div>
          </div>
        </div>

        {/* Styled Architectural Map Placeholder */}
        <div className="lg:col-span-6">
          <div className="h-full min-h-[360px] rounded-[8px] border border-[#D6CBB9] bg-[#E7DECF] p-6 flex flex-col justify-between relative overflow-hidden">
            <div className="flex items-center justify-between text-xs text-[#5F5B52] border-b border-[#D6CBB9] pb-3">
              <span className="font-mono uppercase">
                PRETORIA EAST / BROOKLYN PRECINCT
              </span>
              <span className="font-mono">25.7689° S, 28.2366° E</span>
            </div>

            {/* Minimalist architectural street grid SVG */}
            <div className="my-6 rounded-[6px] border border-[#D6CBB9] bg-[#F7F3EA] p-6 flex flex-col items-center justify-center text-center space-y-3">
              <div className="h-12 w-12 rounded-full border-2 border-[#23452F] bg-[#23452F]/10 flex items-center justify-center">
                <MapPin className="h-6 w-6 text-[#23452F]" />
              </div>
              <p className="font-serif text-2xl text-[#1C1C19]">
                {siteConfig.brandName}
              </p>
              <p className="text-xs text-[#5F5B52]">{siteConfig.fullAddress}</p>
              <a
                href={siteConfig.directionsUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs font-medium text-[#23452F] underline"
              >
                Launch turn-by-turn navigation →
              </a>
            </div>

            <div className="text-xs text-[#5F5B52] flex items-center justify-between border-t border-[#D6CBB9] pt-3">
              <span>Wheelchair accessible ground-floor entrance</span>
              <span className="font-semibold text-[#1C1C19]">18+ ID Required</span>
            </div>
          </div>
        </div>
      </div>

      {/* Collection & Delivery Instructions */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="rounded-[8px] border border-[#D6CBB9] bg-white p-7 space-y-4">
          <div className="flex items-center gap-2.5">
            <ShieldCheck className="h-5 w-5 text-[#23452F]" />
            <h2 className="font-serif text-2xl text-[#1C1C19]">
              In-Store Collection Instructions
            </h2>
          </div>
          <p className="text-xs text-[#5F5B52] leading-relaxed">
            {siteConfig.collectionInstructions}
          </p>
          <ul className="list-disc pl-5 text-xs text-[#5F5B52] space-y-1.5">
            <li>Bring your order reference code (e.g. HHC-XXXXXX).</li>
            <li>
              Present a valid South African ID card/book, passport, or driver&apos;s
              licence proving you are 18 years or older.
            </li>
            <li>
              Payment at the counter is accepted via card terminal, Instant EFT,
              or cash.
            </li>
          </ul>
        </div>

        <div className="rounded-[8px] border border-[#D6CBB9] bg-white p-7 space-y-4">
          <div className="flex items-center gap-2.5">
            <Truck className="h-5 w-5 text-[#23452F]" />
            <h2 className="font-serif text-2xl text-[#1C1C19]">
              Pretoria Local Delivery Zones
            </h2>
          </div>
          <p className="text-xs text-[#5F5B52] leading-relaxed">
            {siteConfig.deliveryLeadTimeText}
          </p>
          <div className="flex flex-wrap gap-1.5 pt-1">
            {siteConfig.deliveryAreas.map((suburb) => (
              <span
                key={suburb}
                className="rounded-[4px] border border-[#D6CBB9] bg-[#F7F3EA] px-2.5 py-1 text-xs text-[#1C1C19]"
              >
                {suburb}
              </span>
            ))}
          </div>
          <p className="text-xs text-[#1C1C19] font-medium pt-2 border-t border-[#D6CBB9]">
            Standard Delivery Fee: {formatZAR(siteConfig.deliveryFeeCents)} •
            Complimentary on orders over{" "}
            {formatZAR(siteConfig.freeDeliveryThresholdCents)}
          </p>
        </div>
      </div>
    </div>
  );
}
