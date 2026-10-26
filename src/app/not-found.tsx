import React from "react";
import Link from "next/link";
import { defaultSiteConfig } from "@/config/site";

export default function NotFound() {
  return (
    <main className="min-h-[75vh] flex items-center justify-center px-4 py-16 bg-[#F7F3EA]">
      <div className="max-w-lg w-full rounded-[8px] border border-[#D6CBB9] bg-white p-8 sm:p-10 text-center space-y-5">
        <span className="inline-block rounded-[4px] border border-[#D6CBB9] bg-[#E7DECF] px-2.5 py-1 text-xs font-medium text-[#5F5B52]">
          404 • Page Not Found
        </span>
        <h1 className="font-serif text-3xl text-[#1C1C19]">
          We could not find that page
        </h1>
        <p className="text-sm text-[#5F5B52] leading-relaxed">
          The page or product preparation you requested may have been moved,
          archived, or is no longer on the active {defaultSiteConfig.brandName}{" "}
          menu.
        </p>
        <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
          <Link
            href="/shop"
            className="w-full sm:w-auto inline-flex items-center justify-center rounded-[6px] bg-[#23452F] px-5 py-2.5 text-sm font-medium text-white hover:bg-[#1A3523]"
          >
            Browse the Menu
          </Link>
          <Link
            href="/"
            className="w-full sm:w-auto inline-flex items-center justify-center rounded-[6px] border border-[#D6CBB9] bg-white px-5 py-2.5 text-sm font-medium text-[#1C1C19] hover:border-[#23452F]"
          >
            Return Home
          </Link>
        </div>
      </div>
    </main>
  );
}
