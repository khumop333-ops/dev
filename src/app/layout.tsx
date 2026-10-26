import type { Metadata } from "next";
import "@fontsource/newsreader/400.css";
import "@fontsource/newsreader/500.css";
import "@fontsource/newsreader/600.css";
import "@fontsource/inter/400.css";
import "@fontsource/inter/500.css";
import "@fontsource/inter/600.css";
import "./globals.css";
import { defaultSiteConfig } from "@/config/site";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: `${defaultSiteConfig.brandName} | Pretoria Botanical Dispensary`,
    template: `%s | ${defaultSiteConfig.brandName}`,
  },
  description: defaultSiteConfig.description,
  openGraph: {
    type: "website",
    locale: "en_ZA",
    url: siteUrl,
    siteName: defaultSiteConfig.brandName,
    title: `${defaultSiteConfig.brandName} — ${defaultSiteConfig.tagline}`,
    description: defaultSiteConfig.description,
    images: [
      {
        url: "/images/demo/hero-botanical.svg",
        width: 800,
        height: 900,
        alt: defaultSiteConfig.brandName,
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: `${defaultSiteConfig.brandName} | Pretoria Botanical Dispensary`,
    description: defaultSiteConfig.description,
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en-ZA">
      <body className="min-h-screen flex flex-col bg-[#F7F3EA] text-[#1C1C19] font-sans antialiased">
        {children}
      </body>
    </html>
  );
}
