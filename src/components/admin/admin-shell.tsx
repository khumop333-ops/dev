"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut } from "next-auth/react";
import {
  LayoutDashboard,
  Package,
  FolderTree,
  Tags,
  ClipboardList,
  MessageSquare,
  Users,
  FileText,
  Settings,
  Shield,
  History,
  LogOut,
  ExternalLink,
} from "lucide-react";
import { cn } from "@/lib/utils";
import type { UserRole } from "@prisma/client";

const adminNav = [
  { href: "/admin", label: "Dashboard", icon: LayoutDashboard, exact: true },
  { href: "/admin/orders", label: "Orders & Reservations", icon: ClipboardList },
  { href: "/admin/products", label: "Products", icon: Package },
  { href: "/admin/categories", label: "Categories", icon: FolderTree },
  { href: "/admin/brands", label: "Brands", icon: Tags },
  { href: "/admin/enquiries", label: "Enquiries", icon: MessageSquare },
  { href: "/admin/customers", label: "Customers", icon: Users },
  { href: "/admin/content", label: "Legal & Content", icon: FileText },
  { href: "/admin/settings", label: "Store Settings", icon: Settings },
  { href: "/admin/users", label: "Staff & Users", icon: Shield },
  { href: "/admin/audit", label: "Audit Log", icon: History },
];

export function AdminShell({
  user,
  brandName,
  children,
}: {
  user: { id: string; name: string; email: string; role: UserRole };
  brandName: string;
  children: React.ReactNode;
}) {
  const pathname = usePathname();

  return (
    <div className="min-h-screen flex flex-col lg:flex-row bg-[#F7F3EA] text-[#1C1C19]">
      {/* Sidebar */}
      <aside className="w-full lg:w-64 shrink-0 border-b lg:border-b-0 lg:border-r border-[#D6CBB9] bg-[#E7DECF]/65 flex flex-col justify-between no-print">
        <div>
          <div className="p-5 border-b border-[#D6CBB9] flex items-center justify-between">
            <div>
              <Link
                href="/admin"
                className="font-serif text-xl text-[#1C1C19] block"
              >
                {brandName}
              </Link>
              <span className="text-[11px] uppercase tracking-wider text-[#5F5B52]">
                Admin Portal • {user.role}
              </span>
            </div>
            <Link
              href="/"
              target="_blank"
              className="inline-flex items-center gap-1 rounded-[4px] border border-[#D6CBB9] bg-white px-2 py-1 text-[11px] font-medium text-[#23452F] hover:border-[#23452F]"
              title="Open Public Storefront"
            >
              <span>Store</span>
              <ExternalLink className="h-3 w-3" />
            </Link>
          </div>

          <nav
            aria-label="Admin navigation"
            className="p-3 flex lg:flex-col gap-1 overflow-x-auto"
          >
            {adminNav.map((item) => {
              const Icon = item.icon;
              const isActive = item.exact
                ? pathname === item.href
                : pathname?.startsWith(item.href);

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "flex items-center gap-2.5 rounded-[6px] px-3 py-2 text-xs font-medium whitespace-nowrap transition-colors",
                    isActive
                      ? "bg-[#23452F] text-white"
                      : "text-[#1C1C19] hover:bg-[#D6CBB9]/50"
                  )}
                >
                  <Icon className="h-4 w-4 shrink-0" />
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </nav>
        </div>

        <div className="hidden lg:block p-4 border-t border-[#D6CBB9] space-y-3 text-xs">
          <div className="truncate">
            <p className="font-semibold text-[#1C1C19] truncate">{user.name}</p>
            <p className="text-[#5F5B52] truncate">{user.email}</p>
          </div>

          <button
            type="button"
            onClick={() => signOut({ callbackUrl: "/admin/login" })}
            className="flex w-full items-center justify-center gap-2 rounded-[6px] border border-[#D6CBB9] bg-white px-3 py-2 text-xs font-medium text-[#1C1C19] hover:border-[#9E3A32] hover:text-[#9E3A32]"
          >
            <LogOut className="h-3.5 w-3.5" />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 min-w-0">
        <div className="mx-auto max-w-6xl p-4 sm:p-8">{children}</div>
      </div>
    </div>
  );
}
