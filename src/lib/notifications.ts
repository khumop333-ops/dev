import { formatZAR } from "./money";
import { buildWhatsAppLink } from "./utils";

export interface OrderNotificationPayload {
  publicId: string;
  customerFirstName: string;
  customerLastName: string;
  email: string;
  phone: string;
  fulfilmentMethod: "COLLECTION" | "DELIVERY";
  subtotalCents: number;
  deliveryFeeCents: number;
  totalCents: number;
  items: Array<{
    productName: string;
    variantName: string;
    quantity: number;
    lineTotalCents: number;
  }>;
}

export async function sendOrderReservationNotification(
  payload: OrderNotificationPayload,
  brandName = "Highveld Herbal Co."
): Promise<void> {
  const itemLines = payload.items
    .map(
      (i) =>
        `  - ${i.quantity}x ${i.productName} (${i.variantName}) — ${formatZAR(
          i.lineTotalCents
        )}`
    )
    .join("\n");

  const summaryText = [
    `[${brandName}] Reservation Request Received: ${payload.publicId}`,
    `Customer: ${payload.customerFirstName} ${payload.customerLastName} (${payload.phone}, ${payload.email})`,
    `Fulfilment: ${
      payload.fulfilmentMethod === "COLLECTION"
        ? "In-Store Collection (Pretoria)"
        : "Pretoria Local Delivery"
    }`,
    `Items:\n${itemLines}`,
    `Subtotal: ${formatZAR(payload.subtotalCents)}`,
    `Delivery Fee: ${formatZAR(payload.deliveryFeeCents)}`,
    `Estimated Total: ${formatZAR(payload.totalCents)}`,
    `Status: PENDING STORE CONFIRMATION (No online card payment taken)`,
  ].join("\n");

  const resendApiKey = process.env.RESEND_API_KEY;
  const emailFrom = process.env.EMAIL_FROM || `${brandName} <orders@example.co.za>`;

  if (resendApiKey) {
    try {
      await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${resendApiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          from: emailFrom,
          to: [payload.email],
          subject: `Reservation Request ${payload.publicId} — ${brandName}`,
          text: summaryText,
        }),
      });
      return;
    } catch (err) {
      console.error("[notifications] Resend delivery failed, falling back to log:", err);
    }
  }

  console.info("\n--- [DEV NOTIFICATION: ORDER RESERVATION] ---");
  console.info(summaryText);
  console.info("---------------------------------------------\n");
}

export function buildOrderWhatsAppConfirmationUrl(params: {
  whatsappNumber: string;
  brandName: string;
  publicId: string;
  customerFirstName: string;
  fulfilmentMethod: "COLLECTION" | "DELIVERY";
  totalCents: number;
}): string {
  const methodLabel =
    params.fulfilmentMethod === "COLLECTION" ? "in-store collection" : "local delivery";
  const message = `Good day ${params.brandName}, I have submitted reservation request ${params.publicId} (${params.customerFirstName}) for ${methodLabel}, total ${formatZAR(
    params.totalCents
  )}. Please confirm availability and payment arrangement.`;
  return buildWhatsAppLink(params.whatsappNumber, message);
}
