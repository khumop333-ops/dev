import React from "react";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { formatZAR } from "@/lib/money";
import { formatDateSAST } from "@/lib/utils";
import { getVariantStockStatus } from "@/lib/inventory";
import { OrderStatusBadge, StockStatusBadge } from "@/components/ui/badge";

export const dynamic = "force-dynamic";

export default async function AdminDashboardPage() {
  const [
    pendingOrdersCount,
    completedOrdersCount,
    activeProductsCount,
    newEnquiriesCount,
    allVariants,
    recentOrders,
    recentEnquiries,
  ] = await Promise.all([
    prisma.order.count({ where: { status: "PENDING" } }),
    prisma.order.count({ where: { status: "COMPLETED" } }),
    prisma.product.count({ where: { status: "ACTIVE" } }),
    prisma.enquiry.count({ where: { status: "NEW" } }),
    prisma.productVariant.findMany({
      where: { active: true, product: { status: "ACTIVE" } },
      include: { product: { select: { id: true, name: true } } },
    }),
    prisma.order.findMany({
      orderBy: { createdAt: "desc" },
      take: 6,
      include: { items: true },
    }),
    prisma.enquiry.findMany({
      orderBy: { createdAt: "desc" },
      take: 5,
    }),
  ]);

  const lowOrOutVariants = allVariants.filter(
    (v) => getVariantStockStatus(v).status !== "IN_STOCK"
  );

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 border-b border-[#D6CBB9] pb-5">
        <div>
          <span className="text-xs font-semibold uppercase tracking-[0.15em] text-[#23452F]">
            Operations Overview
          </span>
          <h1 className="font-serif text-3xl text-[#1C1C19] mt-1">
            Dispensary Dashboard
          </h1>
        </div>
        <div className="flex flex-wrap gap-2">
          <Link
            href="/admin/products/new"
            className="inline-flex rounded-[6px] bg-[#23452F] px-4 py-2 text-xs font-medium text-white hover:bg-[#1A3523]"
          >
            + New Product
          </Link>
          <Link
            href="/admin/orders"
            className="inline-flex rounded-[6px] border border-[#D6CBB9] bg-white px-4 py-2 text-xs font-medium text-[#1C1C19] hover:border-[#23452F]"
          >
            View All Orders
          </Link>
        </div>
      </div>

      {/* Real Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="rounded-[8px] border border-[#D6CBB9] bg-white p-5">
          <span className="text-xs uppercase tracking-wider text-[#5F5B52]">
            Pending Reservations
          </span>
          <p
            data-testid="dashboard-pending-orders"
            className="font-serif text-3xl text-[#1C1C19] mt-2"
          >
            {pendingOrdersCount}
          </p>
          <Link
            href="/admin/orders?status=PENDING"
            className="mt-2 inline-block text-xs text-[#23452F] underline"
          >
            Review pending →
          </Link>
        </div>

        <div className="rounded-[8px] border border-[#D6CBB9] bg-white p-5">
          <span className="text-xs uppercase tracking-wider text-[#5F5B52]">
            Completed Orders
          </span>
          <p className="font-serif text-3xl text-[#1C1C19] mt-2">
            {completedOrdersCount}
          </p>
          <Link
            href="/admin/orders?status=COMPLETED"
            className="mt-2 inline-block text-xs text-[#23452F] underline"
          >
            View completed →
          </Link>
        </div>

        <div className="rounded-[8px] border border-[#D6CBB9] bg-white p-5">
          <span className="text-xs uppercase tracking-wider text-[#5F5B52]">
            Active Menu Products
          </span>
          <p className="font-serif text-3xl text-[#1C1C19] mt-2">
            {activeProductsCount}
          </p>
          <Link
            href="/admin/products"
            className="mt-2 inline-block text-xs text-[#23452F] underline"
          >
            Manage catalogue →
          </Link>
        </div>

        <div className="rounded-[8px] border border-[#D6CBB9] bg-white p-5">
          <span className="text-xs uppercase tracking-wider text-[#5F5B52]">
            Low / Out-of-Stock Variants
          </span>
          <p className="font-serif text-3xl text-[#956A1C] mt-2">
            {lowOrOutVariants.length}
          </p>
          <span className="mt-2 inline-block text-xs text-[#5F5B52]">
            {newEnquiriesCount} unread enquiry(s)
          </span>
        </div>
      </div>

      {/* Low Stock Alerts Table */}
      {lowOrOutVariants.length > 0 && (
        <section className="rounded-[8px] border border-[#D6CBB9] bg-white p-6 space-y-4">
          <h2 className="font-serif text-xl text-[#1C1C19]">
            Inventory Attention Required
          </h2>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="border-b border-[#D6CBB9] text-[#5F5B52]">
                <tr>
                  <th className="py-2 pr-4 font-medium">Product</th>
                  <th className="py-2 px-4 font-medium">Variant / SKU</th>
                  <th className="py-2 px-4 font-medium">Physical Stock</th>
                  <th className="py-2 px-4 font-medium">Reserved</th>
                  <th className="py-2 px-4 font-medium">Status</th>
                  <th className="py-2 pl-4 font-medium text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#D6CBB9]">
                {lowOrOutVariants.map((v) => {
                  const st = getVariantStockStatus(v);
                  return (
                    <tr key={v.id}>
                      <td className="py-2.5 pr-4 font-medium text-[#1C1C19]">
                        {v.product.name}
                      </td>
                      <td className="py-2.5 px-4 text-[#5F5B52]">
                        {v.name} ({v.sku})
                      </td>
                      <td className="py-2.5 px-4 text-[#1C1C19]">
                        {v.stockQuantity}
                      </td>
                      <td className="py-2.5 px-4 text-[#5F5B52]">
                        {v.reservedQuantity}
                      </td>
                      <td className="py-2.5 px-4">
                        <StockStatusBadge status={st.status} label={st.label} />
                      </td>
                      <td className="py-2.5 pl-4 text-right">
                        <Link
                          href={`/admin/products/${v.product.id}`}
                          className="text-[#23452F] underline font-medium"
                        >
                          Edit Stock
                        </Link>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </section>
      )}

      {/* Recent Orders & Enquiries Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <section className="lg:col-span-7 rounded-[8px] border border-[#D6CBB9] bg-white p-6 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="font-serif text-xl text-[#1C1C19]">
              Recent Reservations
            </h2>
            <Link
              href="/admin/orders"
              className="text-xs font-medium text-[#23452F] underline"
            >
              All orders →
            </Link>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="border-b border-[#D6CBB9] text-[#5F5B52]">
                <tr>
                  <th className="py-2 pr-3 font-medium">Reference</th>
                  <th className="py-2 px-3 font-medium">Customer</th>
                  <th className="py-2 px-3 font-medium">Method</th>
                  <th className="py-2 px-3 font-medium">Total</th>
                  <th className="py-2 pl-3 font-medium">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#D6CBB9]">
                {recentOrders.map((o) => (
                  <tr key={o.id}>
                    <td className="py-3 pr-3 font-mono font-semibold">
                      <Link
                        href={`/admin/orders/${o.id}`}
                        className="text-[#23452F] underline"
                      >
                        {o.publicId}
                      </Link>
                    </td>
                    <td className="py-3 px-3">
                      <p className="font-medium text-[#1C1C19]">
                        {o.customerFirstName} {o.customerLastName}
                      </p>
                      <p className="text-[#5F5B52]">{o.phone}</p>
                    </td>
                    <td className="py-3 px-3 text-[#5F5B52]">
                      {o.fulfilmentMethod}
                    </td>
                    <td className="py-3 px-3 font-semibold text-[#1C1C19]">
                      {formatZAR(o.totalCents)}
                    </td>
                    <td className="py-3 pl-3">
                      <OrderStatusBadge status={o.status} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        <section className="lg:col-span-5 rounded-[8px] border border-[#D6CBB9] bg-white p-6 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="font-serif text-xl text-[#1C1C19]">
              Recent Enquiries
            </h2>
            <Link
              href="/admin/enquiries"
              className="text-xs font-medium text-[#23452F] underline"
            >
              Manage →
            </Link>
          </div>

          <ul className="divide-y divide-[#D6CBB9] text-xs">
            {recentEnquiries.map((enq) => (
              <li key={enq.id} className="py-3 space-y-1">
                <div className="flex items-center justify-between gap-2">
                  <span className="font-semibold text-[#1C1C19]">
                    {enq.name}
                  </span>
                  <span className="rounded-[4px] border border-[#D6CBB9] bg-[#F7F3EA] px-2 py-0.5 text-[10px] font-medium">
                    {enq.status}
                  </span>
                </div>
                <p className="text-[#5F5B52] line-clamp-2">{enq.message}</p>
                <p className="text-[11px] text-[#5F5B52]">
                  {formatDateSAST(enq.createdAt)}
                </p>
              </li>
            ))}
          </ul>
        </section>
      </div>
    </div>
  );
}
