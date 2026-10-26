"use server";

import { prisma } from "@/lib/prisma";
import { checkoutSchema, type CheckoutInput } from "@/lib/validation";
import { calculateOrderTotals } from "@/lib/money";
import { getAvailableStock } from "@/lib/inventory";
import { getStoreSettings } from "@/lib/settings";
import { checkRateLimit } from "@/lib/rate-limit";
import { generatePublicOrderId } from "@/lib/utils";
import { sendOrderReservationNotification } from "@/lib/notifications";
import { revalidatePath } from "next/cache";

export interface HydratedCartVariant {
  variantId: string;
  productId: string;
  productName: string;
  productSlug: string;
  categoryName: string;
  brandName: string | null;
  variantName: string;
  sku: string;
  priceCents: number;
  availableStock: number;
  imageUrl: string;
  imageAlt: string;
}

export async function resolveCartVariantsAction(
  variantIds: string[]
): Promise<HydratedCartVariant[]> {
  const uniqueIds = Array.from(new Set(variantIds.filter(Boolean)));
  if (uniqueIds.length === 0) return [];

  const variants = await prisma.productVariant.findMany({
    where: {
      id: { in: uniqueIds },
      active: true,
      product: {
        status: "ACTIVE",
      },
    },
    include: {
      product: {
        include: {
          category: true,
          brand: true,
          images: {
            orderBy: { sortOrder: "asc" },
            take: 1,
          },
        },
      },
    },
  });

  return variants.map((v) => ({
    variantId: v.id,
    productId: v.productId,
    productName: v.product.name,
    productSlug: v.product.slug,
    categoryName: v.product.category.name,
    brandName: v.product.brand?.name ?? null,
    variantName: v.name,
    sku: v.sku,
    priceCents: v.priceCents,
    availableStock: getAvailableStock(v),
    imageUrl: v.product.images[0]?.url || "/images/demo/category-flower.svg",
    imageAlt: v.product.images[0]?.alt || v.product.name,
  }));
}

export async function submitReservationOrderAction(
  rawInput: CheckoutInput
): Promise<
  | { ok: true; publicId: string }
  | { ok: false; error: string; fieldErrors?: Record<string, string[]> }
> {
  const parsed = checkoutSchema.safeParse(rawInput);
  if (!parsed.success) {
    return {
      ok: false,
      error: "Please review the highlighted fields before submitting your reservation.",
      fieldErrors: parsed.error.flatten().fieldErrors as Record<string, string[]>,
    };
  }

  const input = parsed.data;

  // Server-side rate limit by email
  const rate = checkRateLimit(`checkout:${input.email.toLowerCase()}`, {
    maxRequests: 6,
    windowMs: 10 * 60 * 1000, // 10 minutes
  });

  if (!rate.allowed) {
    return {
      ok: false,
      error: `Too many reservation requests submitted recently. Please wait ${rate.resetInSeconds} seconds before trying again.`,
    };
  }

  // Merge duplicate variant lines if any
  const mergedMap = new Map<string, number>();
  for (const item of input.items) {
    mergedMap.set(item.variantId, (mergedMap.get(item.variantId) ?? 0) + item.quantity);
  }

  const requestedItems = Array.from(mergedMap.entries()).map(([variantId, quantity]) => ({
    variantId,
    quantity,
  }));

  const storeSettings = await getStoreSettings();
  const now = new Date();

  try {
    const result = await prisma.$transaction(async (tx) => {
      const variantIds = requestedItems.map((i) => i.variantId);
      const dbVariants = await tx.productVariant.findMany({
        where: {
          id: { in: variantIds },
        },
        include: {
          product: true,
        },
      });

      const variantById = new Map(dbVariants.map((v) => [v.id, v]));

      const orderLineSnapshots: Array<{
        productId: string;
        variantId: string;
        productNameSnapshot: string;
        variantNameSnapshot: string;
        skuSnapshot: string;
        unitPriceCents: number;
        quantity: number;
        lineTotalCents: number;
      }> = [];

      for (const reqItem of requestedItems) {
        const dbVariant = variantById.get(reqItem.variantId);
        if (
          !dbVariant ||
          !dbVariant.active ||
          dbVariant.product.status !== "ACTIVE"
        ) {
          throw new Error(
            "One or more items in your cart are no longer available on our active menu. Please review your cart."
          );
        }

        const available = getAvailableStock(dbVariant);
        if (available < reqItem.quantity) {
          if (available <= 0) {
            throw new Error(
              `"${dbVariant.product.name} (${dbVariant.name})" is currently out of stock.`
            );
          }
          throw new Error(
            `Only ${available} unit(s) of "${dbVariant.product.name} (${dbVariant.name})" remain available to reserve.`
          );
        }

        const unitPriceCents = dbVariant.priceCents;
        const lineTotalCents = unitPriceCents * reqItem.quantity;

        orderLineSnapshots.push({
          productId: dbVariant.productId,
          variantId: dbVariant.id,
          productNameSnapshot: dbVariant.product.name,
          variantNameSnapshot: dbVariant.name,
          skuSnapshot: dbVariant.sku,
          unitPriceCents,
          quantity: reqItem.quantity,
          lineTotalCents,
        });
      }

      const totals = calculateOrderTotals({
        items: orderLineSnapshots.map((l) => ({
          unitPriceCents: l.unitPriceCents,
          quantity: l.quantity,
        })),
        fulfilmentMethod: input.fulfilmentMethod,
        deliveryFeeCents: storeSettings.deliveryFeeCents,
        freeDeliveryThresholdCents: storeSettings.freeDeliveryThresholdCents,
      });

      let publicId = generatePublicOrderId("HHC");
      const existingRef = await tx.order.findUnique({ where: { publicId } });
      if (existingRef) {
        publicId = generatePublicOrderId("HHC");
      }

      const order = await tx.order.create({
        data: {
          publicId,
          status: "PENDING",
          customerFirstName: input.customerFirstName,
          customerLastName: input.customerLastName,
          email: input.email.toLowerCase(),
          phone: input.phone,
          fulfilmentMethod: input.fulfilmentMethod,
          addressLine1:
            input.fulfilmentMethod === "DELIVERY" ? input.addressLine1 || null : null,
          addressLine2:
            input.fulfilmentMethod === "DELIVERY" ? input.addressLine2 || null : null,
          suburb: input.fulfilmentMethod === "DELIVERY" ? input.suburb || null : null,
          city: input.fulfilmentMethod === "DELIVERY" ? input.city || null : null,
          province:
            input.fulfilmentMethod === "DELIVERY"
              ? input.province || "Gauteng"
              : null,
          postalCode:
            input.fulfilmentMethod === "DELIVERY" ? input.postalCode || null : null,
          preferredDateTime: input.preferredDateTime || null,
          notes: input.notes || null,
          subtotalCents: totals.subtotalCents,
          deliveryFeeCents: totals.deliveryFeeCents,
          totalCents: totals.totalCents,
          paymentStatus: "UNPAID",
          paymentMethod: "Pending Store Confirmation",
          ageConfirmedAt: now,
          termsAcceptedAt: now,
          privacyAcceptedAt: now,
          items: {
            create: orderLineSnapshots,
          },
        },
      });

      // Reserve stock for each variant and log movement
      for (const line of orderLineSnapshots) {
        await tx.productVariant.update({
          where: { id: line.variantId },
          data: {
            reservedQuantity: {
              increment: line.quantity,
            },
          },
        });

        await tx.inventoryMovement.create({
          data: {
            variantId: line.variantId,
            orderId: order.id,
            type: "RESERVE",
            quantityDelta: line.quantity,
            note: `Reserved for order ${order.publicId}`,
          },
        });
      }

      return {
        order,
        orderLineSnapshots,
      };
    });

    await sendOrderReservationNotification(
      {
        publicId: result.order.publicId,
        customerFirstName: result.order.customerFirstName,
        customerLastName: result.order.customerLastName,
        email: result.order.email,
        phone: result.order.phone,
        fulfilmentMethod: result.order.fulfilmentMethod,
        subtotalCents: result.order.subtotalCents,
        deliveryFeeCents: result.order.deliveryFeeCents,
        totalCents: result.order.totalCents,
        items: result.orderLineSnapshots.map((l) => ({
          productName: l.productNameSnapshot,
          variantName: l.variantNameSnapshot,
          quantity: l.quantity,
          lineTotalCents: l.lineTotalCents,
        })),
      },
      storeSettings.brandName
    );

    revalidatePath("/shop");
    revalidatePath("/admin");
    revalidatePath("/admin/orders");
    revalidatePath("/admin/products");

    return { ok: true, publicId: result.order.publicId };
  } catch (err: unknown) {
    const message =
      err instanceof Error
        ? err.message
        : "An unexpected error occurred while submitting your reservation.";
    return {
      ok: false,
      error: message,
    };
  }
}
