import { SalesMode, defaultFeatures } from "./features";

export interface StoreHours {
  weekdays: string;
  saturday: string;
  sunday: string;
  publicHolidays: string;
  timezone: string;
}

export interface SiteConfig {
  brandName: string;
  shortName: string;
  tagline: string;
  description: string;
  city: string;
  province: string;
  country: string;
  addressLine1: string;
  suburb: string;
  postalCode: string;
  fullAddress: string;
  directionsUrl: string;
  parkingNotes: string;
  phone: string;
  whatsappNumber: string;
  whatsappDisplay: string;
  email: string;
  privacyEmail: string;
  hours: StoreHours;
  currencyCode: "ZAR";
  locale: "en-ZA";
  deliveryFeeCents: number;
  freeDeliveryThresholdCents: number;
  deliveryAreas: string[];
  deliveryLeadTimeText: string;
  collectionInstructions: string;
  vatNotice: string;
  salesMode: SalesMode;
  announcementText: string;
  complianceNotice: string;
  legalReviewWarning: string;
  socialLinks: {
    instagram?: string;
    facebook?: string;
  };
}

export const defaultSiteConfig: SiteConfig = {
  brandName: "Highveld Herbal Co.",
  shortName: "Highveld Herbal",
  tagline: "Carefully selected. Clearly presented.",
  description:
    "Pretoria botanical dispensary offering small-batch dried flower, prepared pre-rolls, botanical pastilles, solventless extracts, and apothecary preparations. Store-confirmed reservations for collection or Pretoria local delivery.",
  city: "Pretoria",
  province: "Gauteng",
  country: "South Africa",
  addressLine1: "123 Example Street",
  suburb: "Brooklyn, Pretoria",
  postalCode: "0001",
  fullAddress: "123 Example Street, Pretoria, Gauteng, 0001",
  directionsUrl: "https://maps.google.com/?q=Pretoria+Gauteng+0001",
  parkingNotes:
    "Dedicated off-street client parking is available via the courtyard entrance off Example Street. Security attendant on duty during trading hours.",
  phone: "+27 12 000 0000",
  whatsappNumber: process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || "27820000000",
  whatsappDisplay: "+27 82 000 0000",
  email: "hello@example.co.za",
  privacyEmail: "privacy@example.co.za",
  hours: {
    weekdays: "Mon–Fri: 09:00–18:00",
    saturday: "Sat: 09:00–16:00",
    sunday: "Sun: Closed",
    publicHolidays: "Public Holidays: 09:00–14:00 (By arrangement)",
    timezone: "Africa/Johannesburg",
  },
  currencyCode: "ZAR",
  locale: "en-ZA",
  deliveryFeeCents: 6500, // R 65,00
  freeDeliveryThresholdCents: 85000, // R 850,00
  deliveryAreas: [
    "Brooklyn",
    "Waterkloof",
    "Menlo Park",
    "Hatfield",
    "Lynnwood",
    "Groenkloof",
    "Newlands",
    "Faerie Glen",
    "Garsfontein",
    "Centurion Central",
  ],
  deliveryLeadTimeText:
    "Same-day local Pretoria delivery for reservations confirmed before 14:00 (Mon–Sat). Adult signature and valid 18+ identification required on receipt.",
  collectionInstructions:
    "Once you submit a reservation request, our Pretoria dispensary team verifies stock and messages you via WhatsApp or email to confirm your collection window and payment arrangement (in-store card, EFT, or cash).",
  vatNotice: "All prices shown in South African Rand (ZAR). VAT not applicable / subject to store tax status.",
  salesMode: defaultFeatures.salesMode,
  announcementText:
    "Strictly 18+ only • Store-confirmed reservations in Pretoria, Gauteng • No online card payment taken",
  complianceNotice:
    "Strictly for adults aged 18 years and older. Keep all botanical products out of reach of children and animals. Do not drive or operate heavy machinery after use. Pregnant or breastfeeding persons and individuals with pre-existing health conditions should consult a qualified healthcare professional. Products listed on this website are not registered medicines and are not intended to diagnose, treat, cure, or prevent any disease.",
  legalReviewWarning:
    "Template legal & compliance copy — must be reviewed by a qualified South African attorney before commercial publication.",
  socialLinks: {
    instagram: "https://instagram.com",
    facebook: "https://facebook.com",
  },
};
