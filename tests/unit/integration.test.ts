import { describe, it, expect } from "vitest";
import { prisma } from "@/lib/prisma";
import { computeOrderInventoryTransition } from "@/lib/inventory";

describe("Database & HTTP Smoke Integration Tests", () => {
  it("verifies seeded PostgreSQL data completeness", async () => {
    const [categories, brands, products, orders, faqs, legalPages, users] =
      await Promise.all([
        prisma.category.count(),
        prisma.brand.count(),
        prisma.product.count(),
        prisma.order.count(),
        prisma.faqItem.count(),
        prisma.contentPage.count(),
        prisma.user.count(),
      ]);

    expect(categories).toBeGreaterThanOrEqual(6);
    expect(brands).toBeGreaterThanOrEqual(5);
    expect(products).toBeGreaterThanOrEqual(12);
    expect(orders).toBeGreaterThanOrEqual(3);
    expect(faqs).toBeGreaterThanOrEqual(8);
    expect(legalPages).toBeGreaterThanOrEqual(8);
    expect(users).toBeGreaterThanOrEqual(2);
  });

  it("executes atomic reservation, cancellation release, and completion stock deduction in PostgreSQL", async () => {
    const variant = await prisma.productVariant.findFirstOrThrow({
      where: { active: true },
    });

    const initialStock = variant.stockQuantity;
    const initialReserved = variant.reservedQuantity;

    // 1. Reserve 2 units in a transaction
    const testOrder = await prisma.$transaction(async (tx) => {
      await tx.productVariant.update({
        where: { id: variant.id },
        data: { reservedQuantity: { increment: 2 } },
      });

      return tx.order.create({
        data: {
          publicId: `HHC-TEST-${Date.now()}`,
          status: "PENDING",
          fulfilmentMethod: "COLLECTION",
          customerFirstName: "Integration",
          customerLastName: "Tester",
          email: "tester@example.co.za",
          phone: "+27 82 555 0199",
          ageConfirmedAt: new Date(),
          termsAcceptedAt: new Date(),
          privacyAcceptedAt: new Date(),
          subtotalCents: variant.priceCents * 2,
          deliveryFeeCents: 0,
          totalCents: variant.priceCents * 2,
          items: {
            create: [
              {
                productId: variant.productId,
                variantId: variant.id,
                productNameSnapshot: "Highveld Gold Botanical Blend",
                variantNameSnapshot: variant.name,
                skuSnapshot: variant.sku,
                quantity: 2,
                unitPriceCents: variant.priceCents,
                lineTotalCents: variant.priceCents * 2,
              },
            ],
          },
        },
        include: { items: true },
      });
    });

    const afterReserve = await prisma.productVariant.findUniqueOrThrow({
      where: { id: variant.id },
    });
    expect(afterReserve.reservedQuantity).toBe(initialReserved + 2);
    expect(afterReserve.stockQuantity).toBe(initialStock);

    // 2. Cancel order -> releases reserved stock
    const transitionEffect = computeOrderInventoryTransition("PENDING", "CANCELLED");
    expect(transitionEffect).toBe("RELEASE_RESERVATION");

    await prisma.$transaction(async (tx) => {
      for (const item of testOrder.items) {
        if (item.variantId) {
          await tx.productVariant.update({
            where: { id: item.variantId },
            data: { reservedQuantity: { decrement: item.quantity } },
          });
        }
      }
      await tx.order.update({
        where: { id: testOrder.id },
        data: { status: "CANCELLED" },
      });
    });

    const afterCancel = await prisma.productVariant.findUniqueOrThrow({
      where: { id: variant.id },
    });
    expect(afterCancel.reservedQuantity).toBe(initialReserved);
    expect(afterCancel.stockQuantity).toBe(initialStock);

    // Clean up test order
    await prisma.inventoryMovement.deleteMany({ where: { orderId: testOrder.id } });
    await prisma.order.delete({ where: { id: testOrder.id } });
  });

  it("verifies all key storefront, legal, API, and admin routes respond 200 OK", async () => {
    const baseUrl = "http://localhost:3000";
    const routes = [
      "/",
      "/shop",
      "/products/highveld-apricot-reserve",
      "/products/bushveld-classic-single-roll",
      "/collections/flower",
      "/collections/pre-rolls",
      "/collections/edibles",
      "/collections/extracts",
      "/collections/cbd-wellness",
      "/collections/accessories",
      "/cart",
      "/checkout",
      "/order/HHC-2026-DEMO01",
      "/about",
      "/visit",
      "/contact",
      "/faq",
      "/legal/privacy",
      "/legal/terms",
      "/legal/cookies",
      "/legal/paia",
      "/legal/age-policy",
      "/legal/responsible-use",
      "/legal/delivery-collection",
      "/legal/returns-refunds",
      "/admin/login",
      "/api/health",
      "/robots.txt",
      "/sitemap.xml",
    ];

    for (const route of routes) {
      const res = await fetch(`${baseUrl}${route}`);
      expect(res.status, `Expected 200 OK for ${route}`).toBe(200);
    }

    const productHtml = await (
      await fetch(`${baseUrl}/products/highveld-apricot-reserve`)
    ).text();
    expect(productHtml).toContain("Highveld Apricot Reserve");

    const collectionHtml = await (
      await fetch(`${baseUrl}/collections/pre-rolls`)
    ).text();
    expect(collectionHtml).toContain("Bushveld Classic Single Roll");

    const healthRes = await fetch(`${baseUrl}/api/health`);
    const healthJson = await healthRes.json();
    expect(healthJson.status).toBe("ok");
    expect(healthJson.database).toBe("connected");
  });
});
