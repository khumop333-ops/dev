import React from "react";
import { requireStaffOrAdmin } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { UsersManager } from "@/components/admin/users-manager";

export const dynamic = "force-dynamic";

export default async function AdminUsersPage() {
  const user = await requireStaffOrAdmin();
  const users =
    user.role === "ADMIN"
      ? await prisma.user.findMany({
          orderBy: { createdAt: "asc" },
          select: {
            id: true,
            name: true,
            email: true,
            role: true,
            active: true,
            createdAt: true,
          },
        })
      : [];

  return (
    <div className="space-y-6">
      <div className="border-b border-[#D6CBB9] pb-4">
        <span className="text-xs font-semibold uppercase tracking-[0.15em] text-[#23452F]">
          Access Control
        </span>
        <h1 className="font-serif text-3xl text-[#1C1C19] mt-1">
          Staff &amp; Admin Users
        </h1>
      </div>

      <UsersManager
        users={users}
        currentUserId={user.id}
        currentUserRole={user.role}
      />
    </div>
  );
}
