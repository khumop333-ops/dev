import React from "react";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { PhoneCall, CheckCircle2, MapPin } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { getStoreSettings } from "@/lib/settings";
import { formatZAR } from "@/lib/money";
import { formatDateSAST } from "@/lib/utils";
import { buildOrderWhatsAppConfirmationUrl } from "@/lib/notifications";
import { OrderStatusBadge } from "@/components/ui/badge";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Reservation Reference",
  robots: { index: false, follow: false },
};

export default async function PublicOrderConfirmationPage({
  params,
}: {
  params: { publicId: string };
}) {
  const [siteConfig, order] = await Promise.all([
    getStoreSettings(),
    prisma.order.findUnique({
      where: { publicId: params.publicId.toUpperCase() },
      include: { items: true },
    }),
  ]);

  if (!order) {
    notFound();
  }

  const whatsappConfirmUrl = buildOrderWhatsAppConfirmationUrl({
    whatsappNumber: siteConfig.whatsappNumber,
    brandName: siteConfig.brandName,
    publicId: order.publicId,
    customerFirstName: order.customerFirstName,
    fulfilmentMethod: order.fulfilmentMethod,
    totalCents: order.totalCents,
  });

  return (
    <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8 py-10 lg:py-16">
      <div className="rounded-[8px] border border-[#D6CBB9] bg-white p-6 sm:p-10 space-y-8">
        {/* Header */}
        <div className="border-b border-[#D6CBB9] pb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-[#2F6B4F]">
              <CheckCircle2 className="h-4 w-4" />
              <span>Reservation Request Recorded</span>
            </div>
            <h1 className="font-serif text-3xl text-[#1C1C19]">
              Reference:{" "}
              <span
                data-testid="order-reference-code"
                className="font-mono font-semibold"
              >
                {order.publicId}
              </span>
            </h1>
            <p className="text-xs text-[#5F5B52]">
              Submitted on {formatDateSAST(order.createdAt)} (SAST) for{" "}
              <strong className="text-[#1C1C19]">
                {order.customerFirstName}
              </strong>
            </p>
          </div>

          <OrderStatusBadge status={order.status} />
        </div>

        {/* Important Store Confirmation Notice */}
        <div className="rounded-[6px] border border-[#956A1C]/40 bg-[#956A1C]/10 p-4 text-xs text-[#1C1C19] space-y-1.5">
          <p className="font-semibold text-[#956A1C]">
            Store confirmation required — No online payment has been taken
          </p>
          <p className="text-[#5F5B52] leading-relaxed">
            Your selected items have been provisionally reserved. This order is
            not finally confirmed until our Pretoria dispensary team contacts
            you via WhatsApp or email to verify stock, confirm your{" "}
            {order.fulfilmentMethod === "COLLECTION"
              ? "collection window"
              : "local delivery slot"}
            , and arrange payment.
          </p>
        </div>

        {/* Fast-Track WhatsApp Confirmation CTA */}
        <div className="rounded-[6px] border border-[#23452F] bg-[#F7F3EA] p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <h2 className="font-serif text-xl text-[#1C1C19]">
              Expedite Confirmation on WhatsApp
            </h2>
            <p className="text-xs text-[#5F5B52]">
              Send your reservation reference{" "}
              <strong className="text-[#1C1C19]">{order.publicId}</strong>{" "}
              directly to our Pretoria counter on WhatsApp.
            </p>
          </div>
          <a
            href={whatsappConfirmUrl}
            target="_blank"
            rel="noopener noreferrer"
            data-testid="order-whatsapp-link"
            className="inline-flex items-center justify-center gap-2 rounded-[6px] bg-[#23452F] px-5 py-3 text-xs font-medium text-white hover:bg-[#1A3523] shrink-0"
          >
            <PhoneCall className="h-4 w-4" />
            <span>Confirm on WhatsApp</span>
          </a>
        </div>

        {/* Reserved Items Table */}
        <div>
          <h2 className="font-serif text-xl text-[#1C1C19] mb-3">
            Reserved Preparations
          </h2>
          <div className="rounded-[6px] border border-[#D6CBB9] overflow-hidden">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#E7DECF]/60 border-b border-[#D6CBB9] text-[#5F5B52]">
                <tr>
                  <th className="py-2.5 px-4 font-medium">Preparation</th>
                  <th className="py-2.5 px-4 font-medium text-center">Qty</th>
                  <th className="py-2.5 px-4 font-medium text-right">Unit</th>
                  <th className="py-2.5 px-4 font-medium text-right">Total</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#D6CBB9]">
                {order.items.map((item) => (
                  <tr key={item.id}>
                    <td className="py-3 px-4">
                      <p className="font-medium text-[#1C1C19]">
                        {item.productNameSnapshot}
                      </p>
                      <p className="text-[#5F5B52]">
                        {item.variantNameSnapshot} • SKU: {item.skuSnapshot}
                      </p>
                    </td>
                    <td className="py-3 px-4 text-center font-medium text-[#1C1C19]">
                      {item.quantity}
                    </td>
                    <td className="py-3 px-4 text-right text-[#5F5B52]">
                      {formatZAR(item.unitPriceCents)}
                    </td>
                    <td className="py-3 px-4 text-right font-semibold text-[#1C1C19]">
                      {formatZAR(item.lineTotalCents)}
                    </td>
                  </tr>
                ))}
              </tbody>
              <tfoot className="bg-[#F7F3EA] border-t border-[#D6CBB9]">
                <tr>
                  <td colSpan={3} className="py-2 px-4 text-right text-[#5F5B52]">
                    Subtotal
                  </td>
                  <td className="py-2 px-4 text-right font-medium text-[#1C1C19]">
                    {formatZAR(order.subtotalCents)}
                  </td>
                </tr>
                <tr>
                  <td colSpan={3} className="py-2 px-4 text-right text-[#5F5B52]">
                    {order.fulfilmentMethod === "COLLECTION"
                      ? "In-Store Collection"
                      : "Pretoria Local Delivery"}
                  </td>
                  <td className="py-2 px-4 text-right font-medium text-[#1C1C19]">
                    {order.deliveryFeeCents === 0
                      ? "Complimentary"
                      : formatZAR(order.deliveryFeeCents)}
                  </td>
                </tr>
                <tr className="border-t border-[#D6CBB9] text-sm font-semibold text-[#1C1C19]">
                  <td colSpan={3} className="py-3 px-4 text-right">
                    Total (ZAR)
                  </td>
                  <td className="py-3 px-4 text-right" data-testid="order-total">
                    {formatZAR(order.totalCents)}
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>
        </div>

        {/* Fulfilment & Store Details */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 border-t border-[#D6CBB9] text-xs">
          <div className="rounded-[6px] border border-[#D6CBB9] bg-[#F7F3EA] p-4 space-y-1.5">
            <p className="font-semibold text-[#1C1C19]">
              Fulfilment Method:{" "}
              {order.fulfilmentMethod === "COLLECTION"
                ? "In-Store Collection"
                : "Pretoria Local Delivery"}
            </p>
            {order.fulfilmentMethod === "DELIVERY" && order.suburb && (
              <p className="text-[#5F5B52]">
                Destination Suburb: {order.suburb}, {order.city || "Pretoria"}
              </p>
            )}
            <p className="text-[#5F5B52]">
              Please have valid 18+ photo identification ready at handover.
            </p>
          </div>

          <div className="rounded-[6px] border border-[#D6CBB9] bg-[#F7F3EA] p-4 space-y-1.5">
            <p className="font-semibold text-[#1C1C19] flex items-center gap-1.5">
              <MapPin className="h-3.5 w-3.5 text-[#23452F]" />
              <span>{siteConfig.brandName}</span>
            </p>
            <p className="text-[#5F5B52]">{siteConfig.fullAddress}</p>
            <p className="text-[#5F5B52]">
              Tel: {siteConfig.phone} • WhatsApp: {siteConfig.whatsappDisplay}
            </p>
          </div>
        </div>

        <div className="pt-2 flex flex-wrap items-center justify-between gap-3">
          <Link
            href="/shop"
            className="text-xs font-medium text-[#23452F] hover:underline"
          >
            ← Return to Dispensary Menu
          </Link>
          <Link
            href="/visit"
            className="text-xs font-medium text-[#5F5B52] hover:text-[#1C1C19] underline"
          >
            View Directions &amp; Store Hours
          </Link>
        </div>
      </div>
    </div>
  );
}
