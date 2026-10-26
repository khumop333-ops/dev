import type { OrderStatus } from "@prisma/client";

export type StockBadgeStatus = "IN_STOCK" | "LOW_STOCK" | "OUT_OF_STOCK";

export interface VariantInventoryShape {
  stockQuantity: number;
  reservedQuantity: number;
  lowStockThreshold: number;
  active: boolean;
}

/**
 * Available stock = physical stock minus reserved stock (never negative).
 */
export function getAvailableStock(
  variant: Pick<VariantInventoryShape, "stockQuantity" | "reservedQuantity" | "active">
): number {
  if (!variant.active) return 0;
  return Math.max(0, variant.stockQuantity - variant.reservedQuantity);
}

/**
 * Computes stock badge status for a single variant.
 */
export function getVariantStockStatus(variant: VariantInventoryShape): {
  status: StockBadgeStatus;
  available: number;
  label: string;
} {
  const available = getAvailableStock(variant);
  if (available <= 0) {
    return {
      status: "OUT_OF_STOCK",
      available: 0,
      label: "Out of stock",
    };
  }
  if (available <= variant.lowStockThreshold) {
    return {
      status: "LOW_STOCK",
      available,
      label: `Low stock (${available} left)`,
    };
  }
  return {
    status: "IN_STOCK",
    available,
    label: "In stock",
  };
}

/**
 * Computes aggregate stock status across all variants of a product.
 */
export function getProductAggregateStock(variants: VariantInventoryShape[]): {
  status: StockBadgeStatus;
  totalAvailable: number;
  label: string;
} {
  const activeVariants = variants.filter((v) => v.active);
  if (activeVariants.length === 0) {
    return {
      status: "OUT_OF_STOCK",
      totalAvailable: 0,
      label: "Out of stock",
    };
  }

  const totalAvailable = activeVariants.reduce(
    (sum, v) => sum + getAvailableStock(v),
    0
  );

  if (totalAvailable <= 0) {
    return {
      status: "OUT_OF_STOCK",
      totalAvailable: 0,
      label: "Out of stock",
    };
  }

  const minThreshold = Math.max(
    1,
    Math.min(...activeVariants.map((v) => v.lowStockThreshold))
  );

  if (totalAvailable <= minThreshold) {
    return {
      status: "LOW_STOCK",
      totalAvailable,
      label: "Low stock",
    };
  }

  return {
    status: "IN_STOCK",
    totalAvailable,
    label: "In stock",
  };
}

export type InventoryTransitionEffect =
  | "NONE"
  | "RELEASE_RESERVATION"
  | "DEDUCT_PHYSICAL_AND_RELEASE"
  | "RE_RESERVE";

/**
 * Determines what inventory transition should occur when an Order moves from `prevStatus` to `nextStatus`.
 * Active reservation states: PENDING, CONFIRMED, READY_FOR_COLLECTION, OUT_FOR_DELIVERY
 * Terminal states: COMPLETED (physical stock deducted, reservation released), CANCELLED (reservation released)
 */
export function computeOrderInventoryTransition(
  prevStatus: OrderStatus,
  nextStatus: OrderStatus
): InventoryTransitionEffect {
  if (prevStatus === nextStatus) return "NONE";

  const reservedStates: OrderStatus[] = [
    "PENDING",
    "CONFIRMED",
    "READY_FOR_COLLECTION",
    "OUT_FOR_DELIVERY",
  ];

  const wasReserved = reservedStates.includes(prevStatus);
  const willBeReserved = reservedStates.includes(nextStatus);

  if (wasReserved && willBeReserved) {
    return "NONE";
  }

  if (wasReserved && nextStatus === "CANCELLED") {
    return "RELEASE_RESERVATION";
  }

  if (wasReserved && nextStatus === "COMPLETED") {
    return "DEDUCT_PHYSICAL_AND_RELEASE";
  }

  if (prevStatus === "CANCELLED" && willBeReserved) {
    return "RE_RESERVE";
  }

  return "NONE";
}
