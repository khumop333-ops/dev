import React from "react";
import Link from "next/link";
import type { SiteConfig } from "@/config/site";

export function StoreFooter({ siteConfig }: { siteConfig: SiteConfig }) {
  return (
    <footer className="border-t border-[#D6CBB9] bg-[#E7DECF]/55 text-[#1C1C19] no-print">
      {/* Compliance & Responsible Use Notice Strip */}
      <div className="border-b border-[#D6CBB9] bg-[#E7DECF] px-4 py-6">
        <div className="mx-auto max-w-container flex flex-col md:flex-row md:items-start justify-between gap-4">
          <div className="flex items-center gap-2.5 shrink-0">
            <span className="inline-flex items-center justify-center rounded-[4px] border border-[#23452F] bg-[#23452F] px-2.5 py-1 text-xs font-semibold text-white">
              18+ ONLY
            </span>
            <span className="text-xs font-semibold uppercase tracking-wider text-[#1C1C19]">
              Responsible Use &amp; Non-Medical Notice
            </span>
          </div>
          <p className="text-xs text-[#5F5B52] leading-relaxed max-w-4xl">
            {siteConfig.complianceNotice}
          </p>
        </div>
      </div>

      {/* Main Footer Columns */}
      <div className="mx-auto max-w-container px-4 sm:px-6 lg:px-8 py-12 lg:py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10">
          {/* Column 1: Brand & Address */}
          <div className="space-y-4">
            <div>
              <p className="font-serif text-2xl text-[#1C1C19]">
                {siteConfig.brandName}
              </p>
              <p className="text-xs text-[#5F5B52] mt-1">{siteConfig.tagline}</p>
            </div>
            <div className="text-xs text-[#5F5B52] space-y-1.5 leading-relaxed">
              <p className="font-medium text-[#1C1C19]">Pretoria Dispensary</p>
              <p>{siteConfig.fullAddress}</p>
              <p>Tel: {siteConfig.phone}</p>
              <p>WhatsApp: {siteConfig.whatsappDisplay}</p>
              <p>Email: {siteConfig.email}</p>
            </div>
          </div>

          {/* Column 2: Menu & Store */}
          <div className="space-y-3">
            <h3 className="font-serif text-base font-medium text-[#1C1C19]">
              Dispensary Menu
            </h3>
            <ul className="space-y-2 text-xs text-[#5F5B52]">
              <li>
                <Link href="/shop" className="hover:text-[#23452F]">
                  Full Product Catalogue
                </Link>
              </li>
              <li>
                <Link href="/collections/flower" className="hover:text-[#23452F]">
                  Cured Dried Flower
                </Link>
              </li>
              <li>
                <Link href="/collections/pre-rolls" className="hover:text-[#23452F]">
                  Whole-Flower Pre-Rolls
                </Link>
              </li>
              <li>
                <Link href="/collections/edibles" className="hover:text-[#23452F]">
                  Botanical Confectionery
                </Link>
              </li>
              <li>
                <Link href="/collections/extracts" className="hover:text-[#23452F]">
                  Solventless Extracts
                </Link>
              </li>
              <li>
                <Link href="/collections/cbd-wellness" className="hover:text-[#23452F]">
                  CBD &amp; Apothecary
                </Link>
              </li>
              <li>
                <Link href="/collections/accessories" className="hover:text-[#23452F]">
                  Storage &amp; Accessories
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 3: Trading Hours & Fulfilment */}
          <div className="space-y-3">
            <h3 className="font-serif text-base font-medium text-[#1C1C19]">
              Trading Hours (SAST)
            </h3>
            <ul className="space-y-1.5 text-xs text-[#5F5B52]">
              <li>{siteConfig.hours.weekdays}</li>
              <li>{siteConfig.hours.saturday}</li>
              <li>{siteConfig.hours.sunday}</li>
              <li className="pt-1 text-[11px]">{siteConfig.hours.publicHolidays}</li>
            </ul>
            <div className="pt-2 border-t border-[#D6CBB9] text-xs text-[#5F5B52] space-y-1.5">
              <p className="font-medium text-[#1C1C19]">Information</p>
              <div className="flex flex-wrap gap-x-4 gap-y-1">
                <Link href="/visit" className="hover:text-[#23452F] underline">
                  Visit &amp; Directions
                </Link>
                <Link href="/about" className="hover:text-[#23452F] underline">
                  About Us
                </Link>
                <Link href="/faq" className="hover:text-[#23452F] underline">
                  FAQ
                </Link>
                <Link href="/contact" className="hover:text-[#23452F] underline">
                  Contact &amp; POPIA Requests
                </Link>
              </div>
            </div>
          </div>

          {/* Column 4: Legal & Compliance */}
          <div className="space-y-3">
            <h3 className="font-serif text-base font-medium text-[#1C1C19]">
              Legal &amp; Compliance
            </h3>
            <ul className="space-y-2 text-xs text-[#5F5B52]">
              <li>
                <Link href="/legal/privacy" className="hover:text-[#23452F]">
                  Privacy Policy (POPIA)
                </Link>
              </li>
              <li>
                <Link href="/legal/terms" className="hover:text-[#23452F]">
                  Terms &amp; Conditions
                </Link>
              </li>
              <li>
                <Link href="/legal/age-policy" className="hover:text-[#23452F]">
                  18+ Age Verification Policy
                </Link>
              </li>
              <li>
                <Link href="/legal/responsible-use" className="hover:text-[#23452F]">
                  Responsible Use Notice
                </Link>
              </li>
              <li>
                <Link href="/legal/delivery-collection" className="hover:text-[#23452F]">
                  Collection &amp; Delivery Policy
                </Link>
              </li>
              <li>
                <Link href="/legal/returns-refunds" className="hover:text-[#23452F]">
                  Returns &amp; Refunds Policy
                </Link>
              </li>
              <li>
                <Link href="/legal/cookies" className="hover:text-[#23452F]">
                  Cookie Policy
                </Link>
              </li>
              <li>
                <Link href="/legal/paia" className="hover:text-[#23452F]">
                  PAIA Section 51 Manual
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Copyright & Legal Review Notice */}
        <div className="mt-10 border-t border-[#D6CBB9] pt-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 text-[11px] text-[#5F5B52]">
          <div className="space-y-1">
            <p>
              © {new Date().getFullYear()} {siteConfig.brandName}. All rights
              reserved. {siteConfig.vatNotice}
            </p>
            <p className="text-[#956A1C]">{siteConfig.legalReviewWarning}</p>
          </div>
          <div className="flex items-center gap-4 shrink-0">
            <Link
              href="/admin/login"
              className="text-[#5F5B52] hover:text-[#1C1C19] underline"
            >
              Staff Portal
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
