import * as React from "react";
import { cn } from "@/lib/utils";
import type { StockBadgeStatus } from "@/lib/inventory";
import type { OrderStatus } from "@prisma/client";

export function StockStatusBadge({
  status,
  label,
  className,
}: {
  status: StockBadgeStatus;
  label?: string;
  className?: string;
}) {
  if (status === "OUT_OF_STOCK") {
    return (
      <span
        className={cn(
          "inline-flex items-center gap-1.5 px-2.5 py-0.5 text-xs font-medium rounded-[4px] border border-[#9E3A32]/30 bg-[#9E3A32]/10 text-[#9E3A32]",
          className
        )}
      >
        <span aria-hidden="true">✕</span>
        <span>{label || "Out of stock"}</span>
      </span>
    );
  }

  if (status === "LOW_STOCK") {
    return (
      <span
        className={cn(
          "inline-flex items-center gap-1.5 px-2.5 py-0.5 text-xs font-medium rounded-[4px] border border-[#956A1C]/35 bg-[#956A1C]/10 text-[#956A1C]",
          className
        )}
      >
        <span aria-hidden="true">▲</span>
        <span>{label || "Low stock"}</span>
      </span>
    );
  }

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 px-2.5 py-0.5 text-xs font-medium rounded-[4px] border border-[#2F6B4F]/30 bg-[#2F6B4F]/10 text-[#2F6B4F]",
        className
      )}
    >
      <span aria-hidden="true">●</span>
      <span>{label || "In stock"}</span>
    </span>
  );
}

export function OrderStatusBadge({ status }: { status: OrderStatus }) {
  const styles: Record<OrderStatus, { label: string; symbol: string; classes: string }> = {
    PENDING: {
      label: "Pending Confirmation",
      symbol: "",
      classes: "border-[#956A1C]/40 bg-[#956A1C]/10 text-[#956A1C]",
    },
    CONFIRMED: {
      label: "Store Confirmed",
      symbol: "✓",
      classes: "border-[#23452F]/40 bg-[#23452F]/10 text-[#23452F]",
    },
    READY_FOR_COLLECTION: {
      label: "Ready for Collection",
      symbol: "◆",
      classes: "border-[#2F6B4F]/40 bg-[#2F6B4F]/10 text-[#2F6B4F]",
    },
    OUT_FOR_DELIVERY: {
      label: "Out for Delivery",
      symbol: "→",
      classes: "border-[#B85C38]/40 bg-[#B85C38]/10 text-[#B85C38]",
    },
    COMPLETED: {
      label: "Completed",
      symbol: "●",
      classes: "border-[#2F6B4F] bg-[#2F6B4F] text-white",
    },
    CANCELLED: {
      label: "Cancelled",
      symbol: "✕",
      classes: "border-[#9E3A32]/40 bg-[#9E3A32]/10 text-[#9E3A32]",
    },
  };

  const info = styles[status];
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium rounded-[4px] border",
        info.classes
      )}
    >
      <span aria-hidden="true">{info.symbol}</span>
      <span>{info.label}</span>
    </span>
  );
}
