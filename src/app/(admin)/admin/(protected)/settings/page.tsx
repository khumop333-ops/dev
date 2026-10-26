import React from "react";
import { requireStaffOrAdmin } from "@/lib/auth";
import { getStoreSettings } from "@/lib/settings";
import { StoreSettingsForm } from "@/components/admin/settings-form";

export const dynamic = "force-dynamic";

export default async function AdminSettingsPage() {
  const [user, siteConfig] = await Promise.all([
    requireStaffOrAdmin(),
    getStoreSettings(),
  ]);

  return (
    <div className="space-y-6">
      <div className="border-b border-[#D6CBB9] pb-4">
        <span className="text-xs font-semibold uppercase tracking-[0.15em] text-[#23452F]">
          White-Label Configuration
        </span>
        <h1 className="font-serif text-3xl text-[#1C1C19] mt-1">
          Store Settings
        </h1>
        <p className="text-xs text-[#5F5B52] mt-1">
          Configure store branding, Pretoria address, delivery fees, sales mode,
          and compliance notices.
        </p>
      </div>

      <StoreSettingsForm siteConfig={siteConfig} userRole={user.role} />
    </div>
  );
}
