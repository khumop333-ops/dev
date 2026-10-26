import React from "react";
import { CartProvider } from "@/components/store/cart-context";
import { StoreHeader } from "@/components/store/store-header";
import { StoreFooter } from "@/components/store/store-footer";
import { AgeGateModal } from "@/components/store/age-gate-modal";
import { CookieBanner } from "@/components/store/cookie-banner";
import { getStoreSettings } from "@/lib/settings";
import { defaultFeatures } from "@/config/features";

export const dynamic = "force-dynamic";

export default async function StoreLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const siteConfig = await getStoreSettings();
  const demoMode = defaultFeatures.demoMode;

  return (
    <CartProvider>
      <div className="min-h-screen flex flex-col bg-[#F7F3EA] text-[#1C1C19]">
        <StoreHeader siteConfig={siteConfig} demoMode={demoMode} />
        <main className="flex-1">{children}</main>
        <StoreFooter siteConfig={siteConfig} />
        {defaultFeatures.enableAgeGate && (
          <AgeGateModal brandName={siteConfig.brandName} />
        )}
        {defaultFeatures.enableCookieBanner && <CookieBanner />}
      </div>
    </CartProvider>
  );
}
