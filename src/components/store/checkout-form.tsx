"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useCart } from "./cart-context";
import {
  resolveCartVariantsAction,
  submitReservationOrderAction,
  type HydratedCartVariant,
} from "@/server/actions/checkout";
import { formatZAR, calculateOrderTotals } from "@/lib/money";
import { Button } from "@/components/ui/button";
import type { SiteConfig } from "@/config/site";

export function CheckoutForm({ siteConfig }: { siteConfig: SiteConfig }) {
  const router = useRouter();
  const { items, isHydrated, clearCart } = useCart();

  const [hydratedMap, setHydratedMap] = useState<
    Record<string, HydratedCartVariant>
  >({});
  const [loadingCart, setLoadingCart] = useState(true);

  const [customerFirstName, setCustomerFirstName] = useState("");
  const [customerLastName, setCustomerLastName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [fulfilmentMethod, setFulfilmentMethod] = useState<
    "COLLECTION" | "DELIVERY"
  >("COLLECTION");
  const [addressLine1, setAddressLine1] = useState("");
  const [addressLine2, setAddressLine2] = useState("");
  const [suburb, setSuburb] = useState("");
  const [city, setCity] = useState("Pretoria");
  const [province, setProvince] = useState("Gauteng");
  const [postalCode, setPostalCode] = useState("");
  const [preferredDateTime, setPreferredDateTime] = useState("");
  const [notes, setNotes] = useState("");

  const [ageConfirmed, setAgeConfirmed] = useState(false);
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [privacyAccepted, setPrivacyAccepted] = useState(false);

  const [submitting, setSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string[]>>({});

  useEffect(() => {
    if (!isHydrated) return;
    const ids = items.map((i) => i.variantId);
    if (ids.length === 0) {
      setHydratedMap({});
      setLoadingCart(false);
      return;
    }

    let cancelled = false;
    setLoadingCart(true);
    resolveCartVariantsAction(ids)
      .then((res) => {
        if (cancelled) return;
        const map: Record<string, HydratedCartVariant> = {};
        for (const v of res) {
          map[v.variantId] = v;
        }
        setHydratedMap(map);
      })
      .finally(() => {
        if (!cancelled) setLoadingCart(false);
      });

    return () => {
      cancelled = true;
    };
  }, [items, isHydrated]);

  if (!isHydrated || loadingCart) {
    return (
      <div className="rounded-[8px] border border-[#D6CBB9] bg-white p-10 text-center text-sm text-[#5F5B52]">
        Preparing reservation checkout...
      </div>
    );
  }

  const validLines = items
    .map((i) => {
      const v = hydratedMap[i.variantId];
      if (!v) return null;
      return {
        ...v,
        quantity: i.quantity,
        lineTotalCents: v.priceCents * i.quantity,
      };
    })
    .filter((l): l is NonNullable<typeof l> => l !== null);

  if (validLines.length === 0) {
    return (
      <div className="rounded-[8px] border border-[#D6CBB9] bg-white p-10 text-center space-y-4">
        <h2 className="font-serif text-2xl text-[#1C1C19]">
          Your reservation cart is empty
        </h2>
        <p className="text-sm text-[#5F5B52]">
          Please add at least one product to your cart before completing a
          reservation request.
        </p>
        <Link
          href="/shop"
          className="inline-flex rounded-[6px] bg-[#23452F] px-5 py-2.5 text-sm font-medium text-white"
        >
          Browse the Menu
        </Link>
      </div>
    );
  }

  const totals = calculateOrderTotals({
    items: validLines.map((l) => ({
      unitPriceCents: l.priceCents,
      quantity: l.quantity,
    })),
    fulfilmentMethod,
    deliveryFeeCents: siteConfig.deliveryFeeCents,
    freeDeliveryThresholdCents: siteConfig.freeDeliveryThresholdCents,
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setFieldErrors({});

    if (!ageConfirmed || !termsAccepted || !privacyAccepted) {
      setErrorMessage(
        "Please confirm that you are 18+ and accept the Terms & Conditions and POPIA Privacy Notice."
      );
      return;
    }

    setSubmitting(true);
    try {
      const response = await submitReservationOrderAction({
        customerFirstName,
        customerLastName,
        email,
        phone,
        fulfilmentMethod,
        addressLine1,
        addressLine2,
        suburb,
        city,
        province,
        postalCode,
        preferredDateTime,
        notes,
        ageConfirmed: true,
        termsAccepted: true,
        privacyAccepted: true,
        items: validLines.map((l) => ({
          variantId: l.variantId,
          quantity: l.quantity,
        })),
      });

      if (!response.ok) {
        setErrorMessage(response.error);
        if (response.fieldErrors) {
          setFieldErrors(response.fieldErrors);
        }
        setSubmitting(false);
        return;
      }

      clearCart();
      router.push(`/order/${response.publicId}`);
    } catch (err: unknown) {
      setErrorMessage(
        err instanceof Error
          ? err.message
          : "Could not submit your reservation request. Please try again."
      );
      setSubmitting(false);
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      noValidate
      className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start"
    >
      {/* Left: Customer & Fulfilment Details */}
      <div className="lg:col-span-7 space-y-6">
        <div aria-live="assertive">
          {errorMessage && (
            <div
              role="alert"
              data-testid="checkout-error-banner"
              className="rounded-[6px] border border-[#9E3A32] bg-[#9E3A32]/10 p-4 text-sm text-[#9E3A32]"
            >
              {errorMessage}
            </div>
          )}
        </div>

        {/* Section 1: Customer Contact Details */}
        <section className="rounded-[8px] border border-[#D6CBB9] bg-white p-6 space-y-4">
          <h2 className="font-serif text-2xl text-[#1C1C19] border-b border-[#D6CBB9] pb-3">
            1. Contact Information
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label
                htmlFor="checkout-first-name"
                className="block text-xs font-semibold uppercase tracking-wider text-[#1C1C19] mb-1.5"
              >
                First Name *
              </label>
              <input
                id="checkout-first-name"
                name="customerFirstName"
                type="text"
                required
                value={customerFirstName}
                onChange={(e) => setCustomerFirstName(e.target.value)}
                className="w-full rounded-[6px] border border-[#D6CBB9] bg-white px-3 py-2 text-sm text-[#1C1C19]"
              />
              {fieldErrors.customerFirstName?.[0] && (
                <p className="mt-1 text-xs text-[#9E3A32]">
                  {fieldErrors.customerFirstName[0]}
                </p>
              )}
            </div>

            <div>
              <label
                htmlFor="checkout-last-name"
                className="block text-xs font-semibold uppercase tracking-wider text-[#1C1C19] mb-1.5"
              >
                Last Name *
              </label>
              <input
                id="checkout-last-name"
                name="customerLastName"
                type="text"
                required
                value={customerLastName}
                onChange={(e) => setCustomerLastName(e.target.value)}
                className="w-full rounded-[6px] border border-[#D6CBB9] bg-white px-3 py-2 text-sm text-[#1C1C19]"
              />
              {fieldErrors.customerLastName?.[0] && (
                <p className="mt-1 text-xs text-[#9E3A32]">
                  {fieldErrors.customerLastName[0]}
                </p>
              )}
            </div>

            <div>
              <label
                htmlFor="checkout-phone"
                className="block text-xs font-semibold uppercase tracking-wider text-[#1C1C19] mb-1.5"
              >
                Mobile Number (+27 / 082...) *
              </label>
              <input
                id="checkout-phone"
                name="phone"
                type="tel"
                required
                placeholder="+27 82 000 0000"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full rounded-[6px] border border-[#D6CBB9] bg-white px-3 py-2 text-sm text-[#1C1C19]"
              />
              {fieldErrors.phone?.[0] && (
                <p className="mt-1 text-xs text-[#9E3A32]">
                  {fieldErrors.phone[0]}
                </p>
              )}
            </div>

            <div>
              <label
                htmlFor="checkout-email"
                className="block text-xs font-semibold uppercase tracking-wider text-[#1C1C19] mb-1.5"
              >
                Email Address *
              </label>
              <input
                id="checkout-email"
                name="email"
                type="email"
                required
                placeholder="name@example.co.za"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full rounded-[6px] border border-[#D6CBB9] bg-white px-3 py-2 text-sm text-[#1C1C19]"
              />
              {fieldErrors.email?.[0] && (
                <p className="mt-1 text-xs text-[#9E3A32]">
                  {fieldErrors.email[0]}
                </p>
              )}
            </div>
          </div>
        </section>

        {/* Section 2: Fulfilment Method */}
        <section className="rounded-[8px] border border-[#D6CBB9] bg-white p-6 space-y-5">
          <h2 className="font-serif text-2xl text-[#1C1C19] border-b border-[#D6CBB9] pb-3">
            2. Fulfilment Method
          </h2>

          <div
            role="radiogroup"
            aria-label="Fulfilment method"
            className="grid grid-cols-1 sm:grid-cols-2 gap-3"
          >
            <button
              type="button"
              role="radio"
              aria-checked={fulfilmentMethod === "COLLECTION"}
              onClick={() => setFulfilmentMethod("COLLECTION")}
              className={
                fulfilmentMethod === "COLLECTION"
                  ? "rounded-[6px] border border-[#23452F] bg-[#23452F] p-4 text-left text-white"
                  : "rounded-[6px] border border-[#D6CBB9] bg-[#F7F3EA] p-4 text-left text-[#1C1C19]"
              }
            >
              <span className="block text-sm font-semibold">
                In-Store Collection (Pretoria)
              </span>
              <span className="block text-xs mt-1 opacity-85">
                {siteConfig.fullAddress} • Complimentary
              </span>
            </button>

            <button
              type="button"
              role="radio"
              aria-checked={fulfilmentMethod === "DELIVERY"}
              onClick={() => setFulfilmentMethod("DELIVERY")}
              className={
                fulfilmentMethod === "DELIVERY"
                  ? "rounded-[6px] border border-[#23452F] bg-[#23452F] p-4 text-left text-white"
                  : "rounded-[6px] border border-[#D6CBB9] bg-[#F7F3EA] p-4 text-left text-[#1C1C19]"
              }
            >
              <span className="block text-sm font-semibold">
                Pretoria Local Delivery
              </span>
              <span className="block text-xs mt-1 opacity-85">
                {formatZAR(siteConfig.deliveryFeeCents)} (Free over{" "}
                {formatZAR(siteConfig.freeDeliveryThresholdCents)})
              </span>
            </button>
          </div>

          {fulfilmentMethod === "COLLECTION" ? (
            <div className="rounded-[6px] border border-[#D6CBB9] bg-[#F7F3EA] p-4 text-xs text-[#5F5B52] space-y-1">
              <p className="font-semibold text-[#1C1C19]">
                Collection Address: {siteConfig.fullAddress}
              </p>
              <p>{siteConfig.collectionInstructions}</p>
            </div>
          ) : (
            <div className="space-y-4 pt-2 border-t border-[#D6CBB9]">
              <p className="text-xs text-[#5F5B52]">
                Covered Pretoria areas: {siteConfig.deliveryAreas.join(", ")}.
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="sm:col-span-2">
                  <label
                    htmlFor="checkout-address1"
                    className="block text-xs font-semibold uppercase tracking-wider text-[#1C1C19] mb-1.5"
                  >
                    Street Address *
                  </label>
                  <input
                    id="checkout-address1"
                    type="text"
                    required
                    value={addressLine1}
                    onChange={(e) => setAddressLine1(e.target.value)}
                    placeholder="e.g. 48 Anderson Street"
                    className="w-full rounded-[6px] border border-[#D6CBB9] bg-white px-3 py-2 text-sm text-[#1C1C19]"
                  />
                  {fieldErrors.addressLine1?.[0] && (
                    <p className="mt-1 text-xs text-[#9E3A32]">
                      {fieldErrors.addressLine1[0]}
                    </p>
                  )}
                </div>

                <div className="sm:col-span-2">
                  <label
                    htmlFor="checkout-address2"
                    className="block text-xs font-semibold uppercase tracking-wider text-[#1C1C19] mb-1.5"
                  >
                    Complex / Unit / Gate Instructions (Optional)
                  </label>
                  <input
                    id="checkout-address2"
                    type="text"
                    value={addressLine2}
                    onChange={(e) => setAddressLine2(e.target.value)}
                    className="w-full rounded-[6px] border border-[#D6CBB9] bg-white px-3 py-2 text-sm text-[#1C1C19]"
                  />
                </div>

                <div>
                  <label
                    htmlFor="checkout-suburb"
                    className="block text-xs font-semibold uppercase tracking-wider text-[#1C1C19] mb-1.5"
                  >
                    Suburb *
                  </label>
                  <input
                    id="checkout-suburb"
                    type="text"
                    required
                    placeholder="e.g. Brooklyn"
                    value={suburb}
                    onChange={(e) => setSuburb(e.target.value)}
                    className="w-full rounded-[6px] border border-[#D6CBB9] bg-white px-3 py-2 text-sm text-[#1C1C19]"
                  />
                  {fieldErrors.suburb?.[0] && (
                    <p className="mt-1 text-xs text-[#9E3A32]">
                      {fieldErrors.suburb[0]}
                    </p>
                  )}
                </div>

                <div>
                  <label
                    htmlFor="checkout-postal"
                    className="block text-xs font-semibold uppercase tracking-wider text-[#1C1C19] mb-1.5"
                  >
                    4-Digit Postal Code *
                  </label>
                  <input
                    id="checkout-postal"
                    type="text"
                    required
                    placeholder="0181"
                    value={postalCode}
                    onChange={(e) => setPostalCode(e.target.value)}
                    className="w-full rounded-[6px] border border-[#D6CBB9] bg-white px-3 py-2 text-sm text-[#1C1C19]"
                  />
                  {fieldErrors.postalCode?.[0] && (
                    <p className="mt-1 text-xs text-[#9E3A32]">
                      {fieldErrors.postalCode[0]}
                    </p>
                  )}
                </div>

                <div>
                  <label
                    htmlFor="checkout-city"
                    className="block text-xs font-semibold uppercase tracking-wider text-[#1C1C19] mb-1.5"
                  >
                    City *
                  </label>
                  <input
                    id="checkout-city"
                    type="text"
                    required
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    className="w-full rounded-[6px] border border-[#D6CBB9] bg-white px-3 py-2 text-sm text-[#1C1C19]"
                  />
                </div>

                <div>
                  <label
                    htmlFor="checkout-province"
                    className="block text-xs font-semibold uppercase tracking-wider text-[#1C1C19] mb-1.5"
                  >
                    Province
                  </label>
                  <input
                    id="checkout-province"
                    type="text"
                    value={province}
                    onChange={(e) => setProvince(e.target.value)}
                    className="w-full rounded-[6px] border border-[#D6CBB9] bg-white px-3 py-2 text-sm text-[#1C1C19]"
                  />
                </div>
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 gap-4 pt-2">
            <div>
              <label
                htmlFor="checkout-preferred-time"
                className="block text-xs font-semibold uppercase tracking-wider text-[#1C1C19] mb-1.5"
              >
                Preferred Collection / Delivery Window (Optional)
              </label>
              <input
                id="checkout-preferred-time"
                type="text"
                placeholder="e.g. Tomorrow afternoon between 14:00 and 16:00"
                value={preferredDateTime}
                onChange={(e) => setPreferredDateTime(e.target.value)}
                className="w-full rounded-[6px] border border-[#D6CBB9] bg-white px-3 py-2 text-sm text-[#1C1C19]"
              />
            </div>

            <div>
              <label
                htmlFor="checkout-notes"
                className="block text-xs font-semibold uppercase tracking-wider text-[#1C1C19] mb-1.5"
              >
                Reservation Notes (Optional)
              </label>
              <textarea
                id="checkout-notes"
                rows={2}
                placeholder="Preferred payment method (In-store card, EFT, or cash) or special instructions..."
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="w-full rounded-[6px] border border-[#D6CBB9] bg-white px-3 py-2 text-sm text-[#1C1C19]"
              />
            </div>
          </div>
        </section>

        {/* Section 3: Mandatory 18+ & Legal Confirmations */}
        <section className="rounded-[8px] border border-[#D6CBB9] bg-white p-6 space-y-4">
          <h2 className="font-serif text-2xl text-[#1C1C19] border-b border-[#D6CBB9] pb-3">
            3. Mandatory Age &amp; Legal Confirmations
          </h2>

          <div className="space-y-3 text-xs text-[#1C1C19]">
            <label className="flex items-start gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={ageConfirmed}
                onChange={(e) => setAgeConfirmed(e.target.checked)}
                data-testid="checkout-age-checkbox"
                className="mt-0.5 h-4 w-4 accent-[#23452F]"
              />
              <span>
                <strong>I confirm that I am 18 years of age or older</strong>{" "}
                and understand that valid photo identification will be verified
                upon collection or delivery in accordance with the{" "}
                <Link
                  href="/legal/age-policy"
                  className="underline text-[#23452F]"
                >
                  18+ Age Policy
                </Link>
                . *
              </span>
            </label>

            <label className="flex items-start gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={termsAccepted}
                onChange={(e) => setTermsAccepted(e.target.checked)}
                data-testid="checkout-terms-checkbox"
                className="mt-0.5 h-4 w-4 accent-[#23452F]"
              />
              <span>
                I accept the{" "}
                <Link href="/legal/terms" className="underline text-[#23452F]">
                  Terms &amp; Conditions
                </Link>{" "}
                and{" "}
                <Link
                  href="/legal/responsible-use"
                  className="underline text-[#23452F]"
                >
                  Responsible Use Notice
                </Link>
                , and acknowledge that no online payment is taken until the
                store confirms my reservation. *
              </span>
            </label>

            <label className="flex items-start gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={privacyAccepted}
                onChange={(e) => setPrivacyAccepted(e.target.checked)}
                data-testid="checkout-privacy-checkbox"
                className="mt-0.5 h-4 w-4 accent-[#23452F]"
              />
              <span>
                I acknowledge the{" "}
                <Link
                  href="/legal/privacy"
                  className="underline text-[#23452F]"
                >
                  POPIA Privacy Notice
                </Link>{" "}
                regarding the processing of my contact details to fulfil this
                reservation request. *
              </span>
            </label>
          </div>
        </section>
      </div>

      {/* Right: Server-Verified Order Summary */}
      <aside className="lg:col-span-5 space-y-4">
        <div className="rounded-[8px] border border-[#D6CBB9] bg-white p-6 space-y-5">
          <h2 className="font-serif text-2xl text-[#1C1C19] border-b border-[#D6CBB9] pb-3">
            Reservation Items
          </h2>

          <ul className="divide-y divide-[#D6CBB9] text-xs">
            {validLines.map((line) => (
              <li
                key={line.variantId}
                className="py-3 flex items-start justify-between gap-3"
              >
                <div>
                  <p className="font-medium text-[#1C1C19]">
                    {line.quantity} × {line.productName}
                  </p>
                  <p className="text-[#5F5B52]">
                    {line.variantName} ({line.sku})
                  </p>
                </div>
                <span className="font-semibold text-[#1C1C19] shrink-0">
                  {formatZAR(line.lineTotalCents)}
                </span>
              </li>
            ))}
          </ul>

          <dl className="space-y-2 text-sm border-t border-[#D6CBB9] pt-4">
            <div className="flex items-center justify-between text-[#5F5B52]">
              <dt>Subtotal</dt>
              <dd className="font-medium text-[#1C1C19]">
                {formatZAR(totals.subtotalCents)}
              </dd>
            </div>
            <div className="flex items-center justify-between text-[#5F5B52]">
              <dt>
                {fulfilmentMethod === "COLLECTION"
                  ? "In-Store Collection"
                  : "Pretoria Local Delivery"}
              </dt>
              <dd className="font-medium text-[#1C1C19]">
                {totals.deliveryFeeCents === 0
                  ? "Complimentary"
                  : formatZAR(totals.deliveryFeeCents)}
              </dd>
            </div>
            <div className="flex items-center justify-between border-t border-[#D6CBB9] pt-3 text-base font-semibold text-[#1C1C19]">
              <dt>Estimated Total (ZAR)</dt>
              <dd data-testid="checkout-total">
                {formatZAR(totals.totalCents)}
              </dd>
            </div>
          </dl>

          <div className="rounded-[6px] border border-[#D6CBB9] bg-[#E7DECF]/50 p-3.5 text-xs text-[#5F5B52]">
            All prices are recalculated server-side from our database. No card
            payment is charged now.
          </div>

          <Button
            type="submit"
            variant="primary"
            size="lg"
            disabled={submitting}
            data-testid="submit-reservation-btn"
            className="w-full py-3.5"
          >
            {submitting
              ? "Submitting Reservation Request..."
              : `Submit Reservation Request (${formatZAR(totals.totalCents)})`}
          </Button>
        </div>
      </aside>
    </form>
  );
}
