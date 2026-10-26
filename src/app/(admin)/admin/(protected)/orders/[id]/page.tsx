import React from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { PhoneCall } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { getStoreSettings } from "@/lib/settings";
import { formatZAR } from "@/lib/money";
import { formatDateSAST, buildWhatsAppLink } from "@/lib/utils";
import { OrderStatusBadge } from "@/components/ui/badge";
import { OrderStatusForm } from "@/components/admin/order-status-form";

export const dynamic = "force-dynamic";

export default async function AdminOrderDetailPage({
  params,
}: {
  params: { id: string };
}) {
  const [siteConfig, order] = await Promise.all([
    getStoreSettings(),
    prisma.order.findUnique({
      where: { id: params.id },
      include: {
        items: true,
        movements: {
          orderBy: { createdAt: "desc" },
        },
      },
    }),
  ]);

  if (!order) {
    notFound();
  }

  const whatsappCustomerUrl = buildWhatsAppLink(
    order.phone,
    `Good day ${order.customerFirstName}, this is ${siteConfig.brandName} regarding your reservation request ${order.publicId} (${formatZAR(
      order.totalCents
    )}).`
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#D6CBB9] pb-4">
        <div>
          <Link
            href="/admin/orders"
            className="text-xs text-[#23452F] underline no-print"
          >
            ← Back to Orders
          </Link>
          <h1 className="font-serif text-3xl text-[#1C1C19] mt-1">
            Order{" "}
            <span className="font-mono font-semibold">{order.publicId}</span>
          </h1>
          <p className="text-xs text-[#5F5B52]">
            Placed on {formatDateSAST(order.createdAt)} (SAST) •{" "}
            {siteConfig.brandName}
          </p>
        </div>

        <div className="flex items-center gap-3">
          <OrderStatusBadge status={order.status} />
          <a
            href={whatsappCustomerUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="no-print inline-flex items-center gap-1.5 rounded-[6px] bg-[#23452F] px-3.5 py-2 text-xs font-medium text-white hover:bg-[#1A3523]"
          >
            <PhoneCall className="h-3.5 w-3.5" />
            <span>WhatsApp Customer</span>
          </a>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left: Items, Customer Details, Compliance Timestamps */}
        <div className="lg:col-span-7 space-y-6">
          {/* Line Items */}
          <section className="rounded-[8px] border border-[#D6CBB9] bg-white p-6 space-y-4">
            <h2 className="font-serif text-xl text-[#1C1C19] border-b border-[#D6CBB9] pb-2">
              Reserved Line Items
            </h2>

            <table className="w-full text-left text-xs">
              <thead className="border-b border-[#D6CBB9] text-[#5F5B52]">
                <tr>
                  <th className="py-2 pr-3 font-medium">Preparation</th>
                  <th className="py-2 px-3 font-medium text-center">Qty</th>
                  <th className="py-2 px-3 font-medium text-right">Unit</th>
                  <th className="py-2 pl-3 font-medium text-right">Total</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#D6CBB9]">
                {order.items.map((item) => (
                  <tr key={item.id}>
                    <td className="py-3 pr-3">
                      <p className="font-semibold text-[#1C1C19]">
                        {item.productNameSnapshot}
                      </p>
                      <p className="text-[#5F5B52] font-mono text-[11px]">
                        {item.variantNameSnapshot} • SKU: {item.skuSnapshot}
                      </p>
                    </td>
                    <td className="py-3 px-3 text-center font-medium">
                      {item.quantity}
                    </td>
                    <td className="py-3 px-3 text-right text-[#5F5B52]">
                      {formatZAR(item.unitPriceCents)}
                    </td>
                    <td className="py-3 pl-3 text-right font-semibold text-[#1C1C19]">
                      {formatZAR(item.lineTotalCents)}
                    </td>
                  </tr>
                ))}
              </tbody>
              <tfoot className="border-t border-[#D6CBB9]">
                <tr>
                  <td colSpan={3} className="pt-3 pr-3 text-right text-[#5F5B52]">
                    Subtotal
                  </td>
                  <td className="pt-3 pl-3 text-right font-medium">
                    {formatZAR(order.subtotalCents)}
                  </td>
                </tr>
                <tr>
                  <td colSpan={3} className="py-1 pr-3 text-right text-[#5F5B52]">
                    Delivery Fee ({order.fulfilmentMethod})
                  </td>
                  <td className="py-1 pl-3 text-right font-medium">
                    {formatZAR(order.deliveryFeeCents)}
                  </td>
                </tr>
                <tr className="text-sm font-semibold text-[#1C1C19]">
                  <td colSpan={3} className="pt-2 pr-3 text-right">
                    Total (ZAR)
                  </td>
                  <td className="pt-2 pl-3 text-right">
                    {formatZAR(order.totalCents)}
                  </td>
                </tr>
              </tfoot>
            </table>
          </section>

          {/* Customer & Fulfilment Details */}
          <section className="rounded-[8px] border border-[#D6CBB9] bg-white p-6 space-y-4">
            <h2 className="font-serif text-xl text-[#1C1C19] border-b border-[#D6CBB9] pb-2">
              Customer &amp; Fulfilment Details
            </h2>

            <dl className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div>
                <dt className="text-[#5F5B52]">Customer Name</dt>
                <dd className="font-semibold text-[#1C1C19] mt-0.5">
                  {order.customerFirstName} {order.customerLastName}
                </dd>
              </div>
              <div>
                <dt className="text-[#5F5B52]">Contact Details</dt>
                <dd className="font-semibold text-[#1C1C19] mt-0.5">
                  {order.phone} • {order.email}
                </dd>
              </div>
              <div>
                <dt className="text-[#5F5B52]">Fulfilment Method</dt>
                <dd className="font-semibold text-[#1C1C19] mt-0.5">
                  {order.fulfilmentMethod}
                </dd>
              </div>
              <div>
                <dt className="text-[#5F5B52]">Preferred Window</dt>
                <dd className="font-semibold text-[#1C1C19] mt-0.5">
                  {order.preferredDateTime || "Not specified"}
                </dd>
              </div>

              {order.fulfilmentMethod === "DELIVERY" && (
                <div className="sm:col-span-2 rounded-[4px] border border-[#D6CBB9] bg-[#F7F3EA] p-3">
                  <dt className="text-[#5F5B52] font-semibold">
                    Delivery Address
                  </dt>
                  <dd className="text-[#1C1C19] mt-1">
                    {order.addressLine1}
                    {order.addressLine2 ? `, ${order.addressLine2}` : ""},{" "}
                    {order.suburb}, {order.city}, {order.province},{" "}
                    {order.postalCode}
                  </dd>
                </div>
              )}

              {order.notes && (
                <div className="sm:col-span-2 rounded-[4px] border border-[#D6CBB9] bg-[#F7F3EA] p-3">
                  <dt className="text-[#5F5B52] font-semibold">
                    Customer Notes
                  </dt>
                  <dd className="text-[#1C1C19] mt-1">{order.notes}</dd>
                </div>
              )}
            </dl>

            {/* Recorded Compliance Timestamps */}
            <div className="border-t border-[#D6CBB9] pt-4 text-[11px] text-[#5F5B52] space-y-1">
              <p className="font-semibold text-[#1C1C19]">
                Recorded Compliance Timestamps (Server-Validated)
              </p>
              <p>18+ Age Confirmed At: {formatDateSAST(order.ageConfirmedAt)}</p>
              <p>Terms Accepted At: {formatDateSAST(order.termsAcceptedAt)}</p>
              <p>
                POPIA Notice Accepted At:{" "}
                {formatDateSAST(order.privacyAcceptedAt)}
              </p>
            </div>
          </section>
        </div>

        {/* Right: Status Form & Inventory Movements */}
        <div className="lg:col-span-5 space-y-6">
          <OrderStatusForm
            orderId={order.id}
            initialStatus={order.status}
            initialPaymentStatus={order.paymentStatus}
            initialPaymentMethod={order.paymentMethod || ""}
            initialAdminNotes={order.adminNotes || ""}
          />

          <section className="rounded-[8px] border border-[#D6CBB9] bg-white p-6 space-y-3 no-print">
            <h2 className="font-serif text-lg text-[#1C1C19] border-b border-[#D6CBB9] pb-2">
              Inventory Movements for Order
            </h2>
            {order.movements.length === 0 ? (
              <p className="text-xs text-[#5F5B52]">
                No inventory movements logged for this order.
              </p>
            ) : (
              <ul className="divide-y divide-[#D6CBB9] text-xs">
                {order.movements.map((m) => (
                  <li key={m.id} className="py-2.5 space-y-0.5">
                    <div className="flex items-center justify-between font-medium text-[#1C1C19]">
                      <span>{m.type}</span>
                      <span className="font-mono">
                        {m.quantityDelta > 0
                          ? `+${m.quantityDelta}`
                          : m.quantityDelta}
                      </span>
                    </div>
                    <p className="text-[#5F5B52]">{m.note}</p>
                    <p className="text-[10px] text-[#5F5B52]">
                      {formatDateSAST(m.createdAt)}
                    </p>
                  </li>
                ))}
              </ul>
            )}
          </section>
        </div>
      </div>
    </div>
  );
}
