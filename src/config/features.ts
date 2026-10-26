export type SalesMode = "reservation" | "enquiry" | "checkout";

export interface FeatureFlags {
  salesMode: SalesMode;
  enableCollection: boolean;
  enableLocalDelivery: boolean;
  enableAgeGate: boolean;
  enableCookieBanner: boolean;
  enableWhatsappOrderLink: boolean;
  demoMode: boolean;
}

export const defaultFeatures: FeatureFlags = {
  /**
   * Default store mode:
   * - "reservation": Customers add items to a reservation request and submit without online card payment.
   * - "enquiry": Replaces add-to-cart with direct product enquiry actions.
   * - "checkout": Reserved for future South African payment gateway integration (Yoco, Paystack, Ozow, Peach, PayFast).
   */
  salesMode: "reservation",
  enableCollection: true,
  enableLocalDelivery: true,
  enableAgeGate: true,
  enableCookieBanner: true,
  enableWhatsappOrderLink: true,
  demoMode: process.env.NEXT_PUBLIC_DEMO_MODE === "true",
};
