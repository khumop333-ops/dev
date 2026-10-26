import React from "react";
import { prisma } from "@/lib/prisma";
import { EnquiriesManager } from "@/components/admin/enquiries-manager";

export const dynamic = "force-dynamic";

export default async function AdminEnquiriesPage() {
  const enquiries = await prisma.enquiry.findMany({
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="space-y-6">
      <div className="border-b border-[#D6CBB9] pb-4">
        <span className="text-xs font-semibold uppercase tracking-[0.15em] text-[#23452F]">
          Customer Messages
        </span>
        <h1 className="font-serif text-3xl text-[#1C1C19] mt-1">
          Enquiries ({enquiries.length})
        </h1>
      </div>

      <EnquiriesManager enquiries={enquiries} />
    </div>
  );
}
