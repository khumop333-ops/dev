const zarFormatter = new Intl.NumberFormat("en-ZA", {
  style: "currency",
  currency: "ZAR",
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

/**
 * Formats integer ZAR cents into South African Rand string, e.g. 25000 -> "R 250,00"
 */
export function formatZAR(cents: number): string {
  if (!Number.isFinite(cents)) {
    return "R 0,00";
  }
  const rands = Math.round(cents) / 100;
  return zarFormatter.format(rands).replace(/\u00A0/g, " ");
}

/**
 * Converts a Rand decimal or string (e.g. "250.00" or "250,00" or 250) to integer cents.
 */
export function randsToCents(randsInput: string | number): number {
  if (typeof randsInput === "number") {
    if (!Number.isFinite(randsInput) || randsInput < 0) return 0;
    return Math.round(randsInput * 100);
  }
  const normalized = randsInput
    .replace(/[R\s]/gi, "")
    .replace(",", ".")
    .trim();
  const parsed = Number.parseFloat(normalized);
  if (!Number.isFinite(parsed) || parsed < 0) return 0;
  return Math.round(parsed * 100);
}

/**
 * Formats a product's active variant prices, returning "R 250,00" if uniform or "From R 120,00" if tiered.
 */
export function formatVariantPriceRange(pricesCents: number[]): string {
  if (!pricesCents.length) return "Price on enquiry";
  const min = Math.min(...pricesCents);
  const max = Math.max(...pricesCents);
  if (min === max) {
    return formatZAR(min);
  }
  return `From ${formatZAR(min)}`;
}

export interface OrderLineInput {
  unitPriceCents: number;
  quantity: number;
}

export interface OrderTotalsResult {
  subtotalCents: number;
  deliveryFeeCents: number;
  totalCents: number;
  qualifiesForFreeDelivery: boolean;
  amountUntilFreeDeliveryCents: number;
}

export function calculateOrderTotals(params: {
  items: OrderLineInput[];
  fulfilmentMethod: "COLLECTION" | "DELIVERY";
  deliveryFeeCents: number;
  freeDeliveryThresholdCents: number;
}): OrderTotalsResult {
  const subtotalCents = params.items.reduce((acc, item) => {
    const qty = Math.max(0, Math.floor(item.quantity));
    const unit = Math.max(0, Math.round(item.unitPriceCents));
    return acc + unit * qty;
  }, 0);

  const qualifiesForFreeDelivery =
    params.freeDeliveryThresholdCents > 0 &&
    subtotalCents >= params.freeDeliveryThresholdCents;

  const amountUntilFreeDeliveryCents =
    params.freeDeliveryThresholdCents > 0
      ? Math.max(0, params.freeDeliveryThresholdCents - subtotalCents)
      : 0;

  let deliveryFeeCents = 0;
  if (params.fulfilmentMethod === "DELIVERY" && subtotalCents > 0) {
    deliveryFeeCents = qualifiesForFreeDelivery
      ? 0
      : Math.max(0, Math.round(params.deliveryFeeCents));
  }

  const totalCents = subtotalCents + deliveryFeeCents;

  return {
    subtotalCents,
    deliveryFeeCents,
    totalCents,
    qualifiesForFreeDelivery,
    amountUntilFreeDeliveryCents,
  };
}
