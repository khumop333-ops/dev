import React from "react";
import Link from "next/link";
import type { OrderStatus, Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { formatZAR } from "@/lib/money";
import { formatDateSAST } from "@/lib/utils";
import { OrderStatusBadge } from "@/components/ui/badge";

export const dynamic = "force-dynamic";

export default async function AdminOrdersListPage({
  searchParams,
}: {
  searchParams: { q?: string; status?: string };
}) {
  const q = searchParams.q?.trim() || "";
  const statusFilter = searchParams.status?.trim() || "";

  const where: Prisma.OrderWhereInput = {};
  if (
    statusFilter &&
    [
      "PENDING",
      "CONFIRMED",
      "READY_FOR_COLLECTION",
      "OUT_FOR_DELIVERY",
      "COMPLETED",
      "CANCELLED",
    ].includes(statusFilter)
  ) {
    where.status = statusFilter as OrderStatus;
  }

  if (q) {
    where.OR = [
      { publicId: { contains: q, mode: "insensitive" } },
      { customerFirstName: { contains: q, mode: "insensitive" } },
      { customerLastName: { contains: q, mode: "insensitive" } },
      { email: { contains: q, mode: "insensitive" } },
      { phone: { contains: q, mode: "insensitive" } },
    ];
  }

  const orders = await prisma.order.findMany({
    where,
    include: { items: true },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="space-y-6">
      <div className="border-b border-[#D6CBB9] pb-4">
        <span className="text-xs font-semibold uppercase tracking-[0.15em] text-[#23452F]">
          Reservations &amp; Fulfilment
        </span>
        <h1 className="font-serif text-3xl text-[#1C1C19] mt-1">
          Orders &amp; Reservations ({orders.length})
        </h1>
      </div>

      {/* Filter Bar */}
      <form
        method="get"
        className="rounded-[8px] border border-[#D6CBB9] bg-white p-4 grid grid-cols-1 sm:grid-cols-3 gap-3 items-end"
      >
        <div>
          <label
            htmlFor="order-q"
            className="block text-[11px] font-semibold uppercase tracking-wider text-[#5F5B52] mb-1"
          >
            Search Reference / Customer
          </label>
          <input
            id="order-q"
            name="q"
            type="search"
            defaultValue={q}
            placeholder="HHC-842K9P, name, email, phone..."
            className="w-full rounded-[6px] border border-[#D6CBB9] bg-white px-3 py-1.5 text-xs"
          />
        </div>

        <div>
          <label
            htmlFor="order-status-filter"
            className="block text-[11px] font-semibold uppercase tracking-wider text-[#5F5B52] mb-1"
          >
            Reservation Status
          </label>
          <select
            id="order-status-filter"
            name="status"
            defaultValue={statusFilter}
            className="w-full rounded-[6px] border border-[#D6CBB9] bg-white px-3 py-1.5 text-xs"
          >
            <option value="">All Statuses</option>
            <option value="PENDING">PENDING</option>
            <option value="CONFIRMED">CONFIRMED</option>
            <option value="READY_FOR_COLLECTION">READY FOR COLLECTION</option>
            <option value="OUT_FOR_DELIVERY">OUT FOR DELIVERY</option>
            <option value="COMPLETED">COMPLETED</option>
            <option value="CANCELLED">CANCELLED</option>
          </select>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="submit"
            className="rounded-[6px] bg-[#23452F] px-4 py-1.5 text-xs font-medium text-white"
          >
            Filter
          </button>
          <Link
            href="/admin/orders"
            className="rounded-[6px] border border-[#D6CBB9] bg-[#F7F3EA] px-3 py-1.5 text-xs text-[#1C1C19]"
          >
            Reset
          </Link>
        </div>
      </form>

      {/* Orders Table */}
      <div className="rounded-[8px] border border-[#D6CBB9] bg-white overflow-x-auto">
        <table className="w-full text-left text-xs">
          <thead className="bg-[#E7DECF]/60 border-b border-[#D6CBB9] text-[#5F5B52]">
            <tr>
              <th className="py-3 px-4 font-medium">Reference</th>
              <th className="py-3 px-4 font-medium">Date (SAST)</th>
              <th className="py-3 px-4 font-medium">Customer</th>
              <th className="py-3 px-4 font-medium">Fulfilment</th>
              <th className="py-3 px-4 font-medium">Total (ZAR)</th>
              <th className="py-3 px-4 font-medium">Payment</th>
              <th className="py-3 px-4 font-medium">Status</th>
              <th className="py-3 px-4 font-medium text-right">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#D6CBB9]">
            {orders.map((order) => (
              <tr key={order.id} className="hover:bg-[#F7F3EA]/50">
                <td className="py-3.5 px-4 font-mono font-semibold">
                  <Link
                    href={`/admin/orders/${order.id}`}
                    className="text-[#23452F] underline"
                  >
                    {order.publicId}
                  </Link>
                </td>
                <td className="py-3.5 px-4 text-[#5F5B52]">
                  {formatDateSAST(order.createdAt)}
                </td>
                <td className="py-3.5 px-4">
                  <p className="font-semibold text-[#1C1C19]">
                    {order.customerFirstName} {order.customerLastName}
                  </p>
                  <p className="text-[#5F5B52]">
                    {order.phone} • {order.email}
                  </p>
                </td>
                <td className="py-3.5 px-4 text-[#1C1C19]">
                  {order.fulfilmentMethod}
                  {order.suburb ? ` (${order.suburb})` : ""}
                </td>
                <td className="py-3.5 px-4 font-semibold text-[#1C1C19]">
                  {formatZAR(order.totalCents)}
                  <span className="block text-[11px] font-normal text-[#5F5B52]">
                    {order.items.length} line(s)
                  </span>
                </td>
                <td className="py-3.5 px-4 text-[#5F5B52]">
                  {order.paymentStatus}
                </td>
                <td className="py-3.5 px-4">
                  <OrderStatusBadge status={order.status} />
                </td>
                <td className="py-3.5 px-4 text-right">
                  <Link
                    href={`/admin/orders/${order.id}`}
                    data-testid={`manage-order-${order.publicId}`}
                    className="font-medium text-[#23452F] underline"
                  >
                    Manage
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
