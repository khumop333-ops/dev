import React from "react";
import { prisma } from "@/lib/prisma";
import { formatDateSAST } from "@/lib/utils";

export const dynamic = "force-dynamic";

export default async function AdminAuditLogPage() {
  const logs = await prisma.auditLog.findMany({
    orderBy: { createdAt: "desc" },
    take: 100,
  });

  return (
    <div className="space-y-6">
      <div className="border-b border-[#D6CBB9] pb-4">
        <span className="text-xs font-semibold uppercase tracking-[0.15em] text-[#23452F]">
          Security &amp; Accountability
        </span>
        <h1 className="font-serif text-3xl text-[#1C1C19] mt-1">
          Audit Log ({logs.length})
        </h1>
        <p className="text-xs text-[#5F5B52] mt-1">
          Chronological record of staff sign-ins, catalogue edits, order status
          transitions, and store setting updates.
        </p>
      </div>

      <div className="rounded-[8px] border border-[#D6CBB9] bg-white overflow-x-auto">
        <table className="w-full text-left text-xs">
          <thead className="bg-[#E7DECF]/60 border-b border-[#D6CBB9] text-[#5F5B52]">
            <tr>
              <th className="py-3 px-4 font-medium">Timestamp (SAST)</th>
              <th className="py-3 px-4 font-medium">Actor</th>
              <th className="py-3 px-4 font-medium">Action</th>
              <th className="py-3 px-4 font-medium">Entity</th>
              <th className="py-3 px-4 font-medium">Metadata</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#D6CBB9]">
            {logs.map((log) => (
              <tr key={log.id}>
                <td className="py-3 px-4 text-[#5F5B52] whitespace-nowrap">
                  {formatDateSAST(log.createdAt)}
                </td>
                <td className="py-3 px-4 font-medium text-[#1C1C19]">
                  {log.userEmail || "System"}
                </td>
                <td className="py-3 px-4 font-mono text-[11px] text-[#23452F] font-semibold">
                  {log.action}
                </td>
                <td className="py-3 px-4 text-[#1C1C19]">
                  {log.entityType}
                  {log.entityId ? ` (${log.entityId.slice(0, 10)})` : ""}
                </td>
                <td className="py-3 px-4 font-mono text-[11px] text-[#5F5B52] max-w-md truncate">
                  {log.metadataJson ? JSON.stringify(log.metadataJson) : "—"}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
