/**
 * South African Payment Provider Abstraction Layer
 *
 * V1 operates in "Reservation / Order Request" mode (`manual`):
 * - No online card payment is collected at checkout.
 * - Store staff confirm stock availability and arrange payment via EFT, Yoco POS in-store, or cash on collection.
 *
 * Future V2 integration points:
 * - Yoco Online Checkout (`https://payments.yoco.com/api/checkouts`)
 * - Paystack South Africa (`https://api.paystack.co/transaction/initialize`)
 * - Ozow Instant EFT (`https://api.ozow.com/postpaymentrequest`)
 * - Peach Payments (`https://card.peachpayments.com/v1/checkouts`)
 * - PayFast (`https://www.payfast.co.za/eng/process`)
 */

export type SouthAfricanPaymentProviderId =
  | "manual"
  | "yoco"
  | "paystack"
  | "ozow"
  | "peach"
  | "payfast";

export interface PaymentSessionRequest {
  orderPublicId: string;
  amountCents: number;
  currency: "ZAR";
  customerEmail: string;
  successUrl: string;
  cancelUrl: string;
}

export interface PaymentSessionResult {
  provider: SouthAfricanPaymentProviderId;
  requiresRedirect: boolean;
  redirectUrl?: string;
  instructions: string;
}

export interface PaymentProviderAdapter {
  id: SouthAfricanPaymentProviderId;
  displayName: string;
  createSession(req: PaymentSessionRequest): Promise<PaymentSessionResult>;
}

export class ManualReservationPaymentAdapter implements PaymentProviderAdapter {
  id: SouthAfricanPaymentProviderId = "manual";
  displayName = "Store-Confirmed Reservation (In-Store POS / EFT / Cash)";

  async createSession(req: PaymentSessionRequest): Promise<PaymentSessionResult> {
    return {
      provider: "manual",
      requiresRedirect: false,
      redirectUrl: req.successUrl,
      instructions:
        "No online payment is taken at reservation stage. Our Pretoria store team will confirm stock availability and share EFT or in-store card payment details.",
    };
  }
}

export function getPaymentProvider(): PaymentProviderAdapter {
  return new ManualReservationPaymentAdapter();
}
