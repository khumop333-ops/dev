"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { updateEnquiryStatusAction } from "@/server/actions/admin";
import { formatDateSAST } from "@/lib/utils";
import type { EnquiryStatus } from "@prisma/client";

export interface EnquiryRow {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  subject: string | null;
  productSlug: string | null;
  message: string;
  type: string;
  status: EnquiryStatus;
  createdAt: Date | string;
}

export function EnquiriesManager({ enquiries }: { enquiries: EnquiryRow[] }) {
  const router = useRouter();

  const handleStatusChange = async (id: string, nextStatus: EnquiryStatus) => {
    await updateEnquiryStatusAction(id, nextStatus);
    router.refresh();
  };

  if (enquiries.length === 0) {
    return (
      <div className="rounded-[8px] border border-[#D6CBB9] bg-white p-8 text-center text-xs text-[#5F5B52]">
        No customer enquiries recorded yet.
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {enquiries.map((enq) => (
        <div
          key={enq.id}
          className="rounded-[8px] border border-[#D6CBB9] bg-white p-6 space-y-3"
        >
          <div className="flex flex-wrap items-start justify-between gap-3 border-b border-[#D6CBB9] pb-3">
            <div>
              <div className="flex items-center gap-2">
                <h2 className="font-serif text-lg text-[#1C1C19]">{enq.name}</h2>
                <span className="rounded-[4px] border border-[#D6CBB9] bg-[#F7F3EA] px-2 py-0.5 text-[10px] font-medium">
                  {enq.type}
                </span>
              </div>
              <p className="text-xs text-[#5F5B52] mt-0.5">
                {enq.email}
                {enq.phone ? ` • ${enq.phone}` : ""} •{" "}
                {formatDateSAST(enq.createdAt)}
              </p>
            </div>

            <div className="flex items-center gap-2">
              <label
                htmlFor={`enq-status-${enq.id}`}
                className="text-xs text-[#5F5B52]"
              >
                Status:
              </label>
              <select
                id={`enq-status-${enq.id}`}
                value={enq.status}
                onChange={(e) =>
                  handleStatusChange(enq.id, e.target.value as EnquiryStatus)
                }
                className="rounded-[4px] border border-[#D6CBB9] bg-[#F7F3EA] px-2.5 py-1 text-xs font-medium text-[#1C1C19]"
              >
                <option value="NEW">NEW</option>
                <option value="READ">READ</option>
                <option value="CLOSED">CLOSED</option>
              </select>
            </div>
          </div>

          {enq.subject && (
            <p className="text-xs font-semibold text-[#1C1C19]">
              Subject: {enq.subject}
            </p>
          )}
          <p className="text-sm text-[#1C1C19] leading-relaxed whitespace-pre-line">
            {enq.message}
          </p>
        </div>
      ))}
    </div>
  );
}
