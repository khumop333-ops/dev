import React from "react";
import { prisma } from "@/lib/prisma";
import { formatZAR } from "@/lib/money";
import { formatDateSAST } from "@/lib/utils";

export const dynamic = "force-dynamic";

interface DerivedCustomer {
  email: string;
  name: string;
  phone: string;
  orderCount: number;
  enquiryCount: number;
  totalReservedCents: number;
  lastActivityAt: Date;
}

export default async function AdminDerivedCustomersPage() {
  const [orders, enquiries] = await Promise.all([
    prisma.order.findMany({
      orderBy: { createdAt: "desc" },
    }),
    prisma.enquiry.findMany({
      orderBy: { createdAt: "desc" },
    }),
  ]);

  const map = new Map<string, DerivedCustomer>();

  for (const ord of orders) {
    const key = ord.email.toLowerCase();
    const existing = map.get(key);
    const fullName = `${ord.customerFirstName} ${ord.customerLastName}`;

    if (!existing) {
      map.set(key, {
        email: key,
        name: fullName,
        phone: ord.phone,
        orderCount: 1,
        enquiryCount: 0,
        totalReservedCents: ord.totalCents,
        lastActivityAt: ord.createdAt,
      });
    } else {
      existing.orderCount += 1;
      existing.totalReservedCents += ord.totalCents;
      if (ord.createdAt > existing.lastActivityAt) {
        existing.lastActivityAt = ord.createdAt;
      }
    }
  }

  for (const enq of enquiries) {
    const key = enq.email.toLowerCase();
    const existing = map.get(key);

    if (!existing) {
      map.set(key, {
        email: key,
        name: enq.name,
        phone: enq.phone || "—",
        orderCount: 0,
        enquiryCount: 1,
        totalReservedCents: 0,
        lastActivityAt: enq.createdAt,
      });
    } else {
      existing.enquiryCount += 1;
      if (enq.createdAt > existing.lastActivityAt) {
        existing.lastActivityAt = enq.createdAt;
      }
    }
  }

  const customers = Array.from(map.values()).sort(
    (a, b) => b.lastActivityAt.getTime() - a.lastActivityAt.getTime()
  );

  return (
    <div className="space-y-6">
      <div className="border-b border-[#D6CBB9] pb-4">
        <span className="text-xs font-semibold uppercase tracking-[0.15em] text-[#23452F]">
          POPIA-Minimal Directory
        </span>
        <h1 className="font-serif text-3xl text-[#1C1C19] mt-1">
          Customers ({customers.length})
        </h1>
        <p className="text-xs text-[#5F5B52] mt-1">
          Derived from order reservations and enquiries. No persistent customer
          accounts or unnecessary personal profiles are stored in V1.
        </p>
      </div>

      <div className="rounded-[8px] border border-[#D6CBB9] bg-white overflow-x-auto">
        <table className="w-full text-left text-xs">
          <thead className="bg-[#E7DECF]/60 border-b border-[#D6CBB9] text-[#5F5B52]">
            <tr>
              <th className="py-3 px-4 font-medium">Customer</th>
              <th className="py-3 px-4 font-medium">Telephone</th>
              <th className="py-3 px-4 font-medium">Orders</th>
              <th className="py-3 px-4 font-medium">Enquiries</th>
              <th className="py-3 px-4 font-medium">Total Value (ZAR)</th>
              <th className="py-3 px-4 font-medium">Last Activity</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#D6CBB9]">
            {customers.map((c) => (
              <tr key={c.email}>
                <td className="py-3 px-4">
                  <p className="font-semibold text-[#1C1C19]">{c.name}</p>
                  <p className="text-[#5F5B52]">{c.email}</p>
                </td>
                <td className="py-3 px-4 text-[#1C1C19]">{c.phone}</td>
                <td className="py-3 px-4 text-[#1C1C19]">{c.orderCount}</td>
                <td className="py-3 px-4 text-[#5F5B52]">{c.enquiryCount}</td>
                <td className="py-3 px-4 font-semibold text-[#1C1C19]">
                  {formatZAR(c.totalReservedCents)}
                </td>
                <td className="py-3 px-4 text-[#5F5B52]">
                  {formatDateSAST(c.lastActivityAt)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
