import React from "react";
import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getAdminSession } from "@/lib/auth";
import { getStoreSettings } from "@/lib/settings";
import { AdminLoginForm } from "@/components/admin/login-form";

export const metadata: Metadata = {
  title: "Staff Portal Sign In",
  robots: { index: false, follow: false },
};

export default async function AdminLoginPage() {
  const session = await getAdminSession();
  if (session?.user?.id) {
    redirect("/admin");
  }

  const siteConfig = await getStoreSettings();
  return <AdminLoginForm brandName={siteConfig.brandName} />;
}
