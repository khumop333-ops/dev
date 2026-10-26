"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { Printer } from "lucide-react";
import { updateOrderAdminAction } from "@/server/actions/admin";
import { Button } from "@/components/ui/button";
import type { OrderStatus, PaymentStatus } from "@prisma/client";

export function OrderStatusForm({
  orderId,
  initialStatus,
  initialPaymentStatus,
  initialPaymentMethod,
  initialAdminNotes,
}: {
  orderId: string;
  initialStatus: OrderStatus;
  initialPaymentStatus: PaymentStatus;
  initialPaymentMethod: string;
  initialAdminNotes: string;
}) {
  const router = useRouter();
  const [status, setStatus] = useState<OrderStatus>(initialStatus);
  const [paymentStatus, setPaymentStatus] =
    useState<PaymentStatus>(initialPaymentStatus);
  const [paymentMethod, setPaymentMethod] = useState(initialPaymentMethod);
  const [adminNotes, setAdminNotes] = useState(initialAdminNotes);

  const [saving, setSaving] = useState(false);
  const [feedback, setFeedback] = useState<{
    type: "ok" | "error";
    text: string;
  } | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setFeedback(null);

    const res = await updateOrderAdminAction({
      orderId,
      status,
      paymentStatus,
      paymentMethod,
      adminNotes,
    });

    setSaving(false);
    if (!res.ok) {
      setFeedback({ type: "error", text: res.error || "Failed to update order" });
      return;
    }

    setFeedback({
      type: "ok",
      text: "Order status, inventory reservation, and payment details updated.",
    });
    router.refresh();
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="rounded-[8px] border border-[#D6CBB9] bg-white p-6 space-y-4 no-print"
    >
      <div className="flex items-center justify-between border-b border-[#D6CBB9] pb-3">
        <h2 className="font-serif text-xl text-[#1C1C19]">
          Manage Order Status &amp; Payment
        </h2>
        <button
          type="button"
          onClick={() => window.print()}
          className="inline-flex items-center gap-1.5 rounded-[4px] border border-[#D6CBB9] bg-[#F7F3EA] px-3 py-1.5 text-xs font-medium text-[#1C1C19] hover:border-[#23452F]"
        >
          <Printer className="h-3.5 w-3.5" />
          <span>Print Packing Slip</span>
        </button>
      </div>

      {feedback && (
        <div
          role={feedback.type === "error" ? "alert" : "status"}
          data-testid="order-update-feedback"
          className={
            feedback.type === "error"
              ? "rounded-[6px] border border-[#9E3A32] bg-[#9E3A32]/10 p-3 text-xs text-[#9E3A32]"
              : "rounded-[6px] border border-[#2F6B4F] bg-[#2F6B4F]/10 p-3 text-xs text-[#2F6B4F] font-medium"
          }
        >
          {feedback.text}
        </div>
      )}

      <div>
        <label
          htmlFor="admin-order-status"
          className="block text-xs font-semibold uppercase tracking-wider text-[#1C1C19] mb-1.5"
        >
          Order Fulfilment Status
        </label>
        <select
          id="admin-order-status"
          value={status}
          onChange={(e) => setStatus(e.target.value as OrderStatus)}
          data-testid="admin-order-status-select"
          className="w-full rounded-[6px] border border-[#D6CBB9] bg-white px-3 py-2 text-xs font-semibold text-[#1C1C19]"
        >
          <option value="PENDING">PENDING (Stock Reserved)</option>
          <option value="CONFIRMED">CONFIRMED (Stock Reserved)</option>
          <option value="READY_FOR_COLLECTION">
            READY FOR COLLECTION (Stock Reserved)
          </option>
          <option value="OUT_FOR_DELIVERY">
            OUT FOR DELIVERY (Stock Reserved)
          </option>
          <option value="COMPLETED">
            COMPLETED (Deduct Physical Stock &amp; Release Reservation)
          </option>
          <option value="CANCELLED">
            CANCELLED (Release Reserved Stock Back to Menu)
          </option>
        </select>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div>
          <label
            htmlFor="admin-payment-status"
            className="block text-xs font-semibold uppercase tracking-wider text-[#1C1C19] mb-1.5"
          >
            Payment Status
          </label>
          <select
            id="admin-payment-status"
            value={paymentStatus}
            onChange={(e) => setPaymentStatus(e.target.value as PaymentStatus)}
            className="w-full rounded-[6px] border border-[#D6CBB9] bg-white px-3 py-2 text-xs text-[#1C1C19]"
          >
            <option value="UNPAID">UNPAID</option>
            <option value="PAID_CASH">PAID_CASH (In-Store Cash)</option>
            <option value="PAID_EFT">PAID_EFT (Bank EFT)</option>
            <option value="PAID_OTHER">PAID_OTHER (Card Terminal / POS)</option>
          </select>
        </div>

        <div>
          <label
            htmlFor="admin-payment-method"
            className="block text-xs font-semibold uppercase tracking-wider text-[#1C1C19] mb-1.5"
          >
            Payment Method Note
          </label>
          <input
            id="admin-payment-method"
            type="text"
            value={paymentMethod}
            onChange={(e) => setPaymentMethod(e.target.value)}
            placeholder="e.g. Yoco Terminal / Instant EFT"
            className="w-full rounded-[6px] border border-[#D6CBB9] bg-white px-3 py-2 text-xs text-[#1C1C19]"
          />
        </div>
      </div>

      <div>
        <label
          htmlFor="admin-order-notes"
          className="block text-xs font-semibold uppercase tracking-wider text-[#1C1C19] mb-1.5"
        >
          Internal Staff Notes
        </label>
        <textarea
          id="admin-order-notes"
          rows={3}
          value={adminNotes}
          onChange={(e) => setAdminNotes(e.target.value)}
          placeholder="Record ID verification, WhatsApp confirmation time, or courier reference..."
          className="w-full rounded-[6px] border border-[#D6CBB9] bg-white px-3 py-2 text-xs text-[#1C1C19]"
        />
      </div>

      <Button
        type="submit"
        variant="primary"
        size="md"
        disabled={saving}
        data-testid="save-order-status-btn"
        className="w-full"
      >
        {saving ? "Updating Order..." : "Save Order Changes"}
      </Button>
    </form>
  );
}
