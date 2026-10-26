import React from "react";
import type { Metadata } from "next";
import { requireStaffOrAdmin } from "@/lib/auth";
import { getStoreSettings } from "@/lib/settings";
import { AdminShell } from "@/components/admin/admin-shell";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: {
    default: "Admin Portal",
    template: "%s | Admin Portal",
  },
  robots: { index: false, follow: false },
};

export default async function ProtectedAdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [user, siteConfig] = await Promise.all([
    requireStaffOrAdmin(),
    getStoreSettings(),
  ]);

  return (
    <AdminShell user={user} brandName={siteConfig.brandName}>
      {children}
    </AdminShell>
  );
}
