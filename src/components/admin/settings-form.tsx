"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { saveStoreSettingsAction } from "@/server/actions/admin";
import { formatZAR } from "@/lib/money";
import { Button } from "@/components/ui/button";
import type { SiteConfig } from "@/config/site";
import type { UserRole } from "@prisma/client";

export function StoreSettingsForm({
  siteConfig,
  userRole,
}: {
  siteConfig: SiteConfig;
  userRole: UserRole;
}) {
  const router = useRouter();
  const isReadOnly = userRole !== "ADMIN";

  const [brandName, setBrandName] = useState(siteConfig.brandName);
  const [tagline, setTagline] = useState(siteConfig.tagline);
  const [description, setDescription] = useState(siteConfig.description);
  const [addressLine1, setAddressLine1] = useState(siteConfig.addressLine1);
  const [suburb, setSuburb] = useState(siteConfig.suburb);
  const [city, setCity] = useState(siteConfig.city);
  const [province, setProvince] = useState(siteConfig.province);
  const [postalCode, setPostalCode] = useState(siteConfig.postalCode);
  const [phone, setPhone] = useState(siteConfig.phone);
  const [whatsappNumber, setWhatsappNumber] = useState(
    siteConfig.whatsappNumber
  );
  const [whatsappDisplay, setWhatsappDisplay] = useState(
    siteConfig.whatsappDisplay
  );
  const [email, setEmail] = useState(siteConfig.email);
  const [weekdaysHours, setWeekdaysHours] = useState(
    siteConfig.hours.weekdays
  );
  const [saturdayHours, setSaturdayHours] = useState(
    siteConfig.hours.saturday
  );
  const [sundayHours, setSundayHours] = useState(siteConfig.hours.sunday);
  const [deliveryFeeCents, setDeliveryFeeCents] = useState(
    siteConfig.deliveryFeeCents
  );
  const [freeDeliveryThresholdCents, setFreeDeliveryThresholdCents] = useState(
    siteConfig.freeDeliveryThresholdCents
  );
  const [deliveryAreasText, setDeliveryAreasText] = useState(
    siteConfig.deliveryAreas.join(", ")
  );
  const [salesMode, setSalesMode] = useState(siteConfig.salesMode);
  const [vatNotice, setVatNotice] = useState(siteConfig.vatNotice);
  const [announcementText, setAnnouncementText] = useState(
    siteConfig.announcementText
  );
  const [complianceNotice, setComplianceNotice] = useState(
    siteConfig.complianceNotice
  );

  const [saving, setSaving] = useState(false);
  const [feedback, setFeedback] = useState<{
    type: "ok" | "error";
    text: string;
  } | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isReadOnly) return;
    setSaving(true);
    setFeedback(null);

    const res = await saveStoreSettingsAction({
      brandName,
      tagline,
      description,
      addressLine1,
      suburb,
      city,
      province,
      postalCode,
      phone,
      whatsappNumber,
      whatsappDisplay,
      email,
      weekdaysHours,
      saturdayHours,
      sundayHours,
      deliveryFeeCents,
      freeDeliveryThresholdCents,
      deliveryAreasText,
      salesMode,
      vatNotice,
      announcementText,
      complianceNotice,
    });

    setSaving(false);
    if (!res.ok) {
      setFeedback({
        type: "error",
        text: res.error || "Failed to save store settings",
      });
      return;
    }

    setFeedback({
      type: "ok",
      text: "Store configuration saved and live storefront updated.",
    });
    router.refresh();
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {isReadOnly && (
        <div className="rounded-[6px] border border-[#956A1C] bg-[#956A1C]/10 p-4 text-xs text-[#956A1C]">
          You are signed in with <strong>STAFF</strong> privileges. Viewing
          settings is permitted, but modifying store-wide settings requires an{" "}
          <strong>ADMIN</strong> account.
        </div>
      )}

      {feedback && (
        <div
          role="status"
          className={
            feedback.type === "error"
              ? "rounded-[6px] border border-[#9E3A32] bg-[#9E3A32]/10 p-4 text-xs text-[#9E3A32]"
              : "rounded-[6px] border border-[#2F6B4F] bg-[#2F6B4F]/10 p-4 text-xs text-[#2F6B4F] font-medium"
          }
        >
          {feedback.text}
        </div>
      )}

      {/* Brand & Sales Mode */}
      <section className="rounded-[8px] border border-[#D6CBB9] bg-white p-6 space-y-4">
        <h2 className="font-serif text-xl text-[#1C1C19] border-b border-[#D6CBB9] pb-2">
          1. White-Label Brand &amp; Sales Mode
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-[#1C1C19] mb-1">
              Store Brand Name *
            </label>
            <input
              type="text"
              disabled={isReadOnly}
              value={brandName}
              onChange={(e) => setBrandName(e.target.value)}
              className="w-full rounded-[6px] border border-[#D6CBB9] bg-white px-3 py-1.5 text-xs"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#1C1C19] mb-1">
              Tagline *
            </label>
            <input
              type="text"
              disabled={isReadOnly}
              value={tagline}
              onChange={(e) => setTagline(e.target.value)}
              className="w-full rounded-[6px] border border-[#D6CBB9] bg-white px-3 py-1.5 text-xs"
            />
          </div>

          <div className="sm:col-span-2">
            <label className="block text-xs font-semibold text-[#1C1C19] mb-1">
              Storefront Description *
            </label>
            <textarea
              rows={2}
              disabled={isReadOnly}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full rounded-[6px] border border-[#D6CBB9] bg-white px-3 py-1.5 text-xs"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#1C1C19] mb-1">
              Sales / Fulfilment Mode
            </label>
            <select
              disabled={isReadOnly}
              value={salesMode}
              onChange={(e) =>
                setSalesMode(
                  e.target.value as "reservation" | "enquiry" | "checkout"
                )
              }
              className="w-full rounded-[6px] border border-[#D6CBB9] bg-white px-3 py-2 text-xs font-semibold"
            >
              <option value="reservation">
                reservation (Default — Cart + Reservation Request, No Online Payment)
              </option>
              <option value="enquiry">
                enquiry (Direct Product Enquiry Only — Hides Cart)
              </option>
              <option value="checkout">
                checkout (Future Payment Gateway Placeholder)
              </option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#1C1C19] mb-1">
              VAT Display Notice
            </label>
            <input
              type="text"
              disabled={isReadOnly}
              value={vatNotice}
              onChange={(e) => setVatNotice(e.target.value)}
              className="w-full rounded-[6px] border border-[#D6CBB9] bg-white px-3 py-1.5 text-xs"
            />
          </div>
        </div>
      </section>

      {/* Contact, Address & Trading Hours */}
      <section className="rounded-[8px] border border-[#D6CBB9] bg-white p-6 space-y-4">
        <h2 className="font-serif text-xl text-[#1C1C19] border-b border-[#D6CBB9] pb-2">
          2. Pretoria Location, Contact &amp; Hours
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <label className="block text-xs font-semibold text-[#1C1C19] mb-1">
              Street Address
            </label>
            <input
              type="text"
              disabled={isReadOnly}
              value={addressLine1}
              onChange={(e) => setAddressLine1(e.target.value)}
              className="w-full rounded-[6px] border border-[#D6CBB9] bg-white px-3 py-1.5 text-xs"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#1C1C19] mb-1">
              Suburb
            </label>
            <input
              type="text"
              disabled={isReadOnly}
              value={suburb}
              onChange={(e) => setSuburb(e.target.value)}
              className="w-full rounded-[6px] border border-[#D6CBB9] bg-white px-3 py-1.5 text-xs"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#1C1C19] mb-1">
              Postal Code
            </label>
            <input
              type="text"
              disabled={isReadOnly}
              value={postalCode}
              onChange={(e) => setPostalCode(e.target.value)}
              className="w-full rounded-[6px] border border-[#D6CBB9] bg-white px-3 py-1.5 text-xs"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#1C1C19] mb-1">
              City
            </label>
            <input
              type="text"
              disabled={isReadOnly}
              value={city}
              onChange={(e) => setCity(e.target.value)}
              className="w-full rounded-[6px] border border-[#D6CBB9] bg-white px-3 py-1.5 text-xs"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#1C1C19] mb-1">
              Province
            </label>
            <input
              type="text"
              disabled={isReadOnly}
              value={province}
              onChange={(e) => setProvince(e.target.value)}
              className="w-full rounded-[6px] border border-[#D6CBB9] bg-white px-3 py-1.5 text-xs"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#1C1C19] mb-1">
              Store Email
            </label>
            <input
              type="email"
              disabled={isReadOnly}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full rounded-[6px] border border-[#D6CBB9] bg-white px-3 py-1.5 text-xs"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#1C1C19] mb-1">
              Telephone (+27)
            </label>
            <input
              type="text"
              disabled={isReadOnly}
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="w-full rounded-[6px] border border-[#D6CBB9] bg-white px-3 py-1.5 text-xs"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#1C1C19] mb-1">
              WhatsApp Display (+27...)
            </label>
            <input
              type="text"
              disabled={isReadOnly}
              value={whatsappDisplay}
              onChange={(e) => setWhatsappDisplay(e.target.value)}
              className="w-full rounded-[6px] border border-[#D6CBB9] bg-white px-3 py-1.5 text-xs"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#1C1C19] mb-1">
              WhatsApp Deep-Link Digits (2782...)
            </label>
            <input
              type="text"
              disabled={isReadOnly}
              value={whatsappNumber}
              onChange={(e) => setWhatsappNumber(e.target.value)}
              className="w-full rounded-[6px] border border-[#D6CBB9] bg-white px-3 py-1.5 text-xs font-mono"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#1C1C19] mb-1">
              Weekday Hours
            </label>
            <input
              type="text"
              disabled={isReadOnly}
              value={weekdaysHours}
              onChange={(e) => setWeekdaysHours(e.target.value)}
              className="w-full rounded-[6px] border border-[#D6CBB9] bg-white px-3 py-1.5 text-xs"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#1C1C19] mb-1">
              Saturday Hours
            </label>
            <input
              type="text"
              disabled={isReadOnly}
              value={saturdayHours}
              onChange={(e) => setSaturdayHours(e.target.value)}
              className="w-full rounded-[6px] border border-[#D6CBB9] bg-white px-3 py-1.5 text-xs"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#1C1C19] mb-1">
              Sunday Hours
            </label>
            <input
              type="text"
              disabled={isReadOnly}
              value={sundayHours}
              onChange={(e) => setSundayHours(e.target.value)}
              className="w-full rounded-[6px] border border-[#D6CBB9] bg-white px-3 py-1.5 text-xs"
            />
          </div>
        </div>
      </section>

      {/* Delivery & Compliance */}
      <section className="rounded-[8px] border border-[#D6CBB9] bg-white p-6 space-y-4">
        <h2 className="font-serif text-xl text-[#1C1C19] border-b border-[#D6CBB9] pb-2">
          3. Delivery Fees &amp; Compliance Disclaimers
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-[#1C1C19] mb-1">
              Delivery Fee Cents ({formatZAR(deliveryFeeCents)})
            </label>
            <input
              type="number"
              min={0}
              disabled={isReadOnly}
              value={deliveryFeeCents}
              onChange={(e) =>
                setDeliveryFeeCents(Number.parseInt(e.target.value || "0", 10))
              }
              className="w-full rounded-[6px] border border-[#D6CBB9] bg-white px-3 py-1.5 text-xs"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#1C1C19] mb-1">
              Free Delivery Threshold Cents (
              {formatZAR(freeDeliveryThresholdCents)})
            </label>
            <input
              type="number"
              min={0}
              disabled={isReadOnly}
              value={freeDeliveryThresholdCents}
              onChange={(e) =>
                setFreeDeliveryThresholdCents(
                  Number.parseInt(e.target.value || "0", 10)
                )
              }
              className="w-full rounded-[6px] border border-[#D6CBB9] bg-white px-3 py-1.5 text-xs"
            />
          </div>

          <div className="sm:col-span-2">
            <label className="block text-xs font-semibold text-[#1C1C19] mb-1">
              Covered Pretoria Delivery Suburbs (Comma-Separated)
            </label>
            <input
              type="text"
              disabled={isReadOnly}
              value={deliveryAreasText}
              onChange={(e) => setDeliveryAreasText(e.target.value)}
              className="w-full rounded-[6px] border border-[#D6CBB9] bg-white px-3 py-1.5 text-xs"
            />
          </div>

          <div className="sm:col-span-2">
            <label className="block text-xs font-semibold text-[#1C1C19] mb-1">
              Top Announcement Bar Text
            </label>
            <input
              type="text"
              disabled={isReadOnly}
              value={announcementText}
              onChange={(e) => setAnnouncementText(e.target.value)}
              className="w-full rounded-[6px] border border-[#D6CBB9] bg-white px-3 py-1.5 text-xs"
            />
          </div>

          <div className="sm:col-span-2">
            <label className="block text-xs font-semibold text-[#1C1C19] mb-1">
              18+ Compliance &amp; Responsible-Use Disclaimer
            </label>
            <textarea
              rows={3}
              disabled={isReadOnly}
              value={complianceNotice}
              onChange={(e) => setComplianceNotice(e.target.value)}
              className="w-full rounded-[6px] border border-[#D6CBB9] bg-white px-3 py-1.5 text-xs"
            />
          </div>
        </div>

        {!isReadOnly && (
          <Button type="submit" variant="primary" size="md" disabled={saving}>
            {saving ? "Saving Settings..." : "Save Store Settings"}
          </Button>
        )}
      </section>
    </form>
  );
}
