"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import * as Dialog from "@radix-ui/react-dialog";
import { Menu, X, ShoppingBag, PhoneCall } from "lucide-react";
import { useCart } from "./cart-context";
import type { SiteConfig } from "@/config/site";
import { buildWhatsAppLink, cn } from "@/lib/utils";

const navItems = [
  { href: "/shop", label: "Browse Menu" },
  { href: "/collections/flower", label: "Flower" },
  { href: "/collections/edibles", label: "Edibles" },
  { href: "/collections/cbd-wellness", label: "CBD & Apothecary" },
  { href: "/visit", label: "Visit Store" },
  { href: "/about", label: "About" },
  { href: "/faq", label: "FAQ" },
  { href: "/contact", label: "Contact" },
];

export function StoreHeader({
  siteConfig,
  demoMode,
}: {
  siteConfig: SiteConfig;
  demoMode: boolean;
}) {
  const pathname = usePathname();
  const { totalQuantity } = useCart();
  const [mobileOpen, setMobileOpen] = useState(false);

  const whatsappUrl = buildWhatsAppLink(
    siteConfig.whatsappNumber,
    `Good day ${siteConfig.brandName}, I have a question regarding your Pretoria dispensary menu.`
  );

  return (
    <header className="border-b border-[#D6CBB9] bg-[#F7F3EA] no-print">
      {demoMode && (
        <div className="bg-[#E7DECF] border-b border-[#D6CBB9] px-4 py-1.5 text-center text-[11px] text-[#5F5B52]">
          <span className="font-semibold text-[#1C1C19]">
            White-Label Demo Template:
          </span>{" "}
          Fictional Pretoria dispensary showcase ({siteConfig.brandName}).{" "}
          <Link href="/admin" prefetch={false} className="underline text-[#23452F] font-medium">
            Open Admin Portal
          </Link>
        </div>
      )}

      {/* Compliance & Fulfilment Announcement Bar */}
      <div className="bg-[#23452F] text-white px-4 py-2 text-xs">
        <div className="mx-auto max-w-container flex flex-col sm:flex-row items-center justify-between gap-1 text-center sm:text-left">
          <p className="tracking-wide">{siteConfig.announcementText}</p>
          <div className="hidden md:flex items-center gap-4 text-[11px] text-[#E7DECF]">
            <span>{siteConfig.hours.weekdays}</span>
            <span aria-hidden="true">•</span>
            <span>{siteConfig.city}, {siteConfig.province}</span>
          </div>
        </div>
      </div>

      {/* Main Navigation Row */}
      <div className="mx-auto max-w-container px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between gap-4">
        <div className="flex items-center gap-8">
          <Link
            href="/"
            className="group flex flex-col focus:outline-none"
            aria-label={`${siteConfig.brandName} Home`}
          >
            <span className="font-serif text-xl sm:text-2xl font-normal tracking-tight text-[#1C1C19] group-hover:text-[#23452F] transition-colors">
              {siteConfig.brandName}
            </span>
            <span className="text-[10px] uppercase tracking-[0.2em] text-[#5F5B52]">
              {siteConfig.city} • {siteConfig.province}
            </span>
          </Link>

          <nav
            aria-label="Main navigation"
            className="hidden lg:flex items-center gap-6"
          >
            {navItems.map((item) => {
              const isActive =
                pathname === item.href ||
                (item.href !== "/" && pathname?.startsWith(item.href));
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  prefetch={false}
                  className={cn(
                    "text-sm transition-colors py-1 border-b-2",
                    isActive
                      ? "border-[#23452F] text-[#1C1C19] font-medium"
                      : "border-transparent text-[#5F5B52] hover:text-[#1C1C19]"
                  )}
                >
                  {item.label}
                </Link>
              );
            })}
          </nav>
        </div>

        <div className="flex items-center gap-2.5 sm:gap-3">
          <a
            href={whatsappUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="hidden sm:inline-flex items-center gap-1.5 rounded-[6px] border border-[#D6CBB9] bg-white px-3 py-2 text-xs font-medium text-[#1C1C19] hover:border-[#23452F] transition-colors"
          >
            <PhoneCall className="h-3.5 w-3.5 text-[#23452F]" />
            <span>WhatsApp</span>
          </a>

          {siteConfig.salesMode !== "enquiry" && (
            <Link
              href="/cart"
              data-testid="header-cart-link"
              className="inline-flex items-center gap-2 rounded-[6px] border border-[#23452F] bg-[#23452F] px-3.5 py-2 text-xs sm:text-sm font-medium text-white hover:bg-[#1A3523] transition-colors"
              aria-label={`Reservation cart with ${totalQuantity} items`}
            >
              <ShoppingBag className="h-4 w-4" />
              <span className="hidden sm:inline">Reservation</span>
              <span
                data-testid="cart-count-badge"
                className="inline-flex h-5 min-w-[20px] items-center justify-center rounded-[4px] bg-white px-1.5 text-xs font-semibold text-[#23452F]"
              >
                {totalQuantity}
              </span>
            </Link>
          )}

          {/* Mobile Drawer Trigger */}
          <Dialog.Root open={mobileOpen} onOpenChange={setMobileOpen}>
            <Dialog.Trigger asChild>
              <button
                type="button"
                aria-label="Open navigation menu"
                className="lg:hidden inline-flex items-center justify-center rounded-[6px] border border-[#D6CBB9] bg-white p-2 text-[#1C1C19] hover:border-[#23452F]"
              >
                <Menu className="h-5 w-5" />
              </button>
            </Dialog.Trigger>

            <Dialog.Portal>
              <Dialog.Overlay className="fixed inset-0 z-50 bg-[#1C1C19]/60" />
              <Dialog.Content
                aria-describedby={undefined}
                className="fixed inset-y-0 right-0 z-50 w-full max-w-xs border-l border-[#D6CBB9] bg-[#F7F3EA] p-6 flex flex-col justify-between focus:outline-none"
              >
                <div>
                  <div className="flex items-center justify-between border-b border-[#D6CBB9] pb-4">
                    <Dialog.Title className="font-serif text-xl text-[#1C1C19]">
                      {siteConfig.brandName}
                    </Dialog.Title>
                    <Dialog.Close asChild>
                      <button
                        type="button"
                        aria-label="Close navigation menu"
                        className="rounded-[4px] border border-[#D6CBB9] bg-white p-1.5 text-[#1C1C19]"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </Dialog.Close>
                  </div>

                  <nav
                    aria-label="Mobile navigation"
                    className="mt-6 flex flex-col space-y-1"
                  >
                    {navItems.map((item) => (
                      <Link
                        key={item.href}
                        href={item.href}
                        prefetch={false}
                        onClick={() => setMobileOpen(false)}
                        className="rounded-[4px] px-3 py-2.5 text-base font-medium text-[#1C1C19] hover:bg-[#E7DECF]"
                      >
                        {item.label}
                      </Link>
                    ))}
                  </nav>
                </div>

                <div className="border-t border-[#D6CBB9] pt-4 space-y-3 text-xs text-[#5F5B52]">
                  <p className="font-medium text-[#1C1C19]">
                    {siteConfig.fullAddress}
                  </p>
                  <p>{siteConfig.hours.weekdays}</p>
                  <a
                    href={whatsappUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex w-full items-center justify-center gap-2 rounded-[6px] border border-[#23452F] bg-white px-4 py-2.5 text-xs font-medium text-[#23452F]"
                  >
                    <PhoneCall className="h-3.5 w-3.5" />
                    <span>WhatsApp {siteConfig.whatsappDisplay}</span>
                  </a>
                </div>
              </Dialog.Content>
            </Dialog.Portal>
          </Dialog.Root>
        </div>
      </div>
    </header>
  );
}
