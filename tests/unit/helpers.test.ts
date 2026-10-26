import { describe, it, expect } from "vitest";
import {
  formatZAR,
  randsToCents,
  formatVariantPriceRange,
  calculateOrderTotals,
} from "@/lib/money";
import {
  getAvailableStock,
  getVariantStockStatus,
  getProductAggregateStock,
  computeOrderInventoryTransition,
} from "@/lib/inventory";
import { checkoutSchema, enquirySchema } from "@/lib/validation";

describe("South African Rand (ZAR) Money Helpers", () => {
  it("formats integer cents into ZAR currency string", () => {
    expect(formatZAR(25000)).toBe("R 250,00");
    expect(formatZAR(12050)).toBe("R 120,50");
    expect(formatZAR(0)).toBe("R 0,00");
  });

  it("converts Rand inputs to integer cents accurately", () => {
    expect(randsToCents("250,00")).toBe(25000);
    expect(randsToCents("R 480.50")).toBe(48050);
    expect(randsToCents(120)).toBe(12000);
    expect(randsToCents(-50)).toBe(0);
  });

  it("formats single and multi-variant price ranges", () => {
    expect(formatVariantPriceRange([25000, 25000])).toBe("R 250,00");
    expect(formatVariantPriceRange([16000, 48000, 65000])).toBe("From R 160,00");
    expect(formatVariantPriceRange([])).toBe("Price on enquiry");
  });

  it("calculates order subtotal, delivery fee, and free delivery threshold", () => {
    const collectionOrder = calculateOrderTotals({
      items: [
        { unitPriceCents: 48000, quantity: 1 },
        { unitPriceCents: 11000, quantity: 2 },
      ],
      fulfilmentMethod: "COLLECTION",
      deliveryFeeCents: 6500,
      freeDeliveryThresholdCents: 85000,
    });
    expect(collectionOrder.subtotalCents).toBe(70000);
    expect(collectionOrder.deliveryFeeCents).toBe(0);
    expect(collectionOrder.totalCents).toBe(70000);

    const deliveryUnderThreshold = calculateOrderTotals({
      items: [{ unitPriceCents: 48000, quantity: 1 }],
      fulfilmentMethod: "DELIVERY",
      deliveryFeeCents: 6500,
      freeDeliveryThresholdCents: 85000,
    });
    expect(deliveryUnderThreshold.subtotalCents).toBe(48000);
    expect(deliveryUnderThreshold.deliveryFeeCents).toBe(6500);
    expect(deliveryUnderThreshold.totalCents).toBe(54500);
    expect(deliveryUnderThreshold.qualifiesForFreeDelivery).toBe(false);

    const deliveryOverThreshold = calculateOrderTotals({
      items: [{ unitPriceCents: 48000, quantity: 2 }],
      fulfilmentMethod: "DELIVERY",
      deliveryFeeCents: 6500,
      freeDeliveryThresholdCents: 85000,
    });
    expect(deliveryOverThreshold.subtotalCents).toBe(96000);
    expect(deliveryOverThreshold.deliveryFeeCents).toBe(0);
    expect(deliveryOverThreshold.totalCents).toBe(96000);
    expect(deliveryOverThreshold.qualifiesForFreeDelivery).toBe(true);
  });
});

describe("Inventory & Stock Reservation Logic", () => {
  it("never returns negative available stock", () => {
    expect(
      getAvailableStock({ stockQuantity: 10, reservedQuantity: 3, active: true })
    ).toBe(7);
    expect(
      getAvailableStock({ stockQuantity: 2, reservedQuantity: 5, active: true })
    ).toBe(0);
    expect(
      getAvailableStock({ stockQuantity: 10, reservedQuantity: 0, active: false })
    ).toBe(0);
  });

  it("classifies variant stock status (IN_STOCK, LOW_STOCK, OUT_OF_STOCK)", () => {
    expect(
      getVariantStockStatus({
        stockQuantity: 12,
        reservedQuantity: 1,
        lowStockThreshold: 3,
        active: true,
      }).status
    ).toBe("IN_STOCK");

    expect(
      getVariantStockStatus({
        stockQuantity: 4,
        reservedQuantity: 2,
        lowStockThreshold: 3,
        active: true,
      }).status
    ).toBe("LOW_STOCK");

    expect(
      getVariantStockStatus({
        stockQuantity: 2,
        reservedQuantity: 2,
        lowStockThreshold: 3,
        active: true,
      }).status
    ).toBe("OUT_OF_STOCK");
  });

  it("computes aggregate product stock status", () => {
    const agg = getProductAggregateStock([
      { stockQuantity: 0, reservedQuantity: 0, lowStockThreshold: 2, active: true },
      { stockQuantity: 2, reservedQuantity: 0, lowStockThreshold: 3, active: true },
    ]);
    expect(agg.status).toBe("LOW_STOCK");
    expect(agg.totalAvailable).toBe(2);
  });

  it("computes correct inventory transitions across order statuses", () => {
    expect(computeOrderInventoryTransition("PENDING", "CONFIRMED")).toBe("NONE");
    expect(computeOrderInventoryTransition("CONFIRMED", "CANCELLED")).toBe(
      "RELEASE_RESERVATION"
    );
    expect(computeOrderInventoryTransition("READY_FOR_COLLECTION", "COMPLETED")).toBe(
      "DEDUCT_PHYSICAL_AND_RELEASE"
    );
    expect(computeOrderInventoryTransition("CANCELLED", "PENDING")).toBe("RE_RESERVE");
  });
});

describe("Checkout & Compliance Validation", () => {
  it("rejects checkout without 18+ age confirmation or terms acceptance", () => {
    const invalid = checkoutSchema.safeParse({
      customerFirstName: "Pieter",
      customerLastName: "Botha",
      email: "pieter@example.co.za",
      phone: "+27 82 123 4567",
      fulfilmentMethod: "COLLECTION",
      ageConfirmed: false,
      termsAccepted: true,
      privacyAccepted: true,
      items: [{ variantId: "var-1", quantity: 1 }],
    });
    expect(invalid.success).toBe(false);
  });

  it("requires street address, suburb, city, and 4-digit SA postal code for DELIVERY", () => {
    const missingAddress = checkoutSchema.safeParse({
      customerFirstName: "Thandi",
      customerLastName: "Nkosi",
      email: "thandi@example.co.za",
      phone: "082 123 4567",
      fulfilmentMethod: "DELIVERY",
      ageConfirmed: true,
      termsAccepted: true,
      privacyAccepted: true,
      items: [{ variantId: "var-1", quantity: 1 }],
    });
    expect(missingAddress.success).toBe(false);

    const validDelivery = checkoutSchema.safeParse({
      customerFirstName: "Thandi",
      customerLastName: "Nkosi",
      email: "thandi@example.co.za",
      phone: "+27 82 123 4567",
      fulfilmentMethod: "DELIVERY",
      addressLine1: "123 Example Street",
      suburb: "Brooklyn",
      city: "Pretoria",
      province: "Gauteng",
      postalCode: "0181",
      ageConfirmed: true,
      termsAccepted: true,
      privacyAccepted: true,
      items: [{ variantId: "var-1", quantity: 2 }],
    });
    expect(validDelivery.success).toBe(true);
  });

  it("validates enquiry submission with SA phone and 18+ confirmation", () => {
    const valid = enquirySchema.safeParse({
      name: "Sipho Dlamini",
      email: "sipho@example.co.za",
      phone: "+27 83 000 1111",
      type: "GENERAL",
      message: "Please advise if you have stock of the 600mg CBD drops for collection.",
      ageConfirmed: true,
    });
    expect(valid.success).toBe(true);
  });
});
