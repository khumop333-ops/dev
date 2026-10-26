"use client";

import React, { useState } from "react";
import { submitEnquiryAction } from "@/server/actions/enquiry";
import { Button } from "@/components/ui/button";
import { CheckCircle2 } from "lucide-react";

export function ContactForm({
  defaultType = "GENERAL",
  defaultSubject = "",
  defaultProductSlug = "",
}: {
  defaultType?: "GENERAL" | "PRODUCT_ENQUIRY" | "PRIVACY_REQUEST";
  defaultSubject?: string;
  defaultProductSlug?: string;
}) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [type, setType] = useState<
    "GENERAL" | "PRODUCT_ENQUIRY" | "PRIVACY_REQUEST"
  >(defaultType);
  const [subject, setSubject] = useState(defaultSubject);
  const [message, setMessage] = useState("");
  const [ageConfirmed, setAgeConfirmed] = useState(false);

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSubmitting(true);

    try {
      const res = await submitEnquiryAction({
        name,
        email,
        phone,
        type,
        subject,
        productSlug: defaultProductSlug,
        message,
        ageConfirmed,
      });

      if (!res.ok) {
        setError(res.error);
        setSubmitting(false);
        return;
      }

      setSubmitted(true);
      setSubmitting(false);
    } catch (err: unknown) {
      setError(
        err instanceof Error ? err.message : "Could not send enquiry."
      );
      setSubmitting(false);
    }
  };

  if (submitted) {
    return (
      <div
        role="status"
        data-testid="enquiry-success-banner"
        className="rounded-[8px] border border-[#2F6B4F] bg-[#2F6B4F]/10 p-8 text-center space-y-3"
      >
        <CheckCircle2 className="h-8 w-8 text-[#2F6B4F] mx-auto" />
        <h3 className="font-serif text-2xl text-[#1C1C19]">
          Enquiry Received
        </h3>
        <p className="text-sm text-[#5F5B52] max-w-md mx-auto">
          Thank you, <strong>{name}</strong>. Your message has been logged for
          our Pretoria team and we will respond during trading hours.
        </p>
        <Button
          variant="outline"
          size="sm"
          onClick={() => {
            setSubmitted(false);
            setMessage("");
          }}
        >
          Send another message
        </Button>
      </div>
    );
  }

  return (
    <form
      onSubmit={handleSubmit}
      noValidate
      className="rounded-[8px] border border-[#D6CBB9] bg-white p-6 sm:p-8 space-y-5"
    >
      <h2 className="font-serif text-2xl text-[#1C1C19] border-b border-[#D6CBB9] pb-3">
        Submit an Enquiry
      </h2>

      <div aria-live="assertive">
        {error && (
          <div
            role="alert"
            className="rounded-[6px] border border-[#9E3A32] bg-[#9E3A32]/10 p-3.5 text-xs text-[#9E3A32]"
          >
            {error}
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label
            htmlFor="contact-name"
            className="block text-xs font-semibold uppercase tracking-wider text-[#1C1C19] mb-1.5"
          >
            Full Name *
          </label>
          <input
            id="contact-name"
            type="text"
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full rounded-[6px] border border-[#D6CBB9] bg-white px-3 py-2 text-sm text-[#1C1C19]"
          />
        </div>

        <div>
          <label
            htmlFor="contact-email"
            className="block text-xs font-semibold uppercase tracking-wider text-[#1C1C19] mb-1.5"
          >
            Email Address *
          </label>
          <input
            id="contact-email"
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full rounded-[6px] border border-[#D6CBB9] bg-white px-3 py-2 text-sm text-[#1C1C19]"
          />
        </div>

        <div>
          <label
            htmlFor="contact-phone"
            className="block text-xs font-semibold uppercase tracking-wider text-[#1C1C19] mb-1.5"
          >
            Telephone (+27 / 082...)
          </label>
          <input
            id="contact-phone"
            type="tel"
            placeholder="+27 82 000 0000"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            className="w-full rounded-[6px] border border-[#D6CBB9] bg-white px-3 py-2 text-sm text-[#1C1C19]"
          />
        </div>

        <div>
          <label
            htmlFor="contact-type"
            className="block text-xs font-semibold uppercase tracking-wider text-[#1C1C19] mb-1.5"
          >
            Enquiry Category
          </label>
          <select
            id="contact-type"
            value={type}
            onChange={(e) =>
              setType(
                e.target.value as
                  | "GENERAL"
                  | "PRODUCT_ENQUIRY"
                  | "PRIVACY_REQUEST"
              )
            }
            className="w-full rounded-[6px] border border-[#D6CBB9] bg-white px-3 py-2 text-sm text-[#1C1C19]"
          >
            <option value="GENERAL">General Store Enquiry</option>
            <option value="PRODUCT_ENQUIRY">Product / Batch Availability</option>
            <option value="PRIVACY_REQUEST">
              POPIA / Personal Data Request
            </option>
          </select>
        </div>
      </div>

      <div>
        <label
          htmlFor="contact-subject"
          className="block text-xs font-semibold uppercase tracking-wider text-[#1C1C19] mb-1.5"
        >
          Subject
        </label>
        <input
          id="contact-subject"
          type="text"
          value={subject}
          onChange={(e) => setSubject(e.target.value)}
          placeholder="How can our Pretoria team assist?"
          className="w-full rounded-[6px] border border-[#D6CBB9] bg-white px-3 py-2 text-sm text-[#1C1C19]"
        />
      </div>

      <div>
        <label
          htmlFor="contact-message"
          className="block text-xs font-semibold uppercase tracking-wider text-[#1C1C19] mb-1.5"
        >
          Message *
        </label>
        <textarea
          id="contact-message"
          rows={4}
          required
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="Please include any relevant product names or preferred collection times..."
          className="w-full rounded-[6px] border border-[#D6CBB9] bg-white px-3 py-2 text-sm text-[#1C1C19]"
        />
      </div>

      <label className="flex items-start gap-2.5 text-xs text-[#1C1C19] cursor-pointer">
        <input
          type="checkbox"
          checked={ageConfirmed}
          onChange={(e) => setAgeConfirmed(e.target.checked)}
          className="mt-0.5 h-4 w-4 accent-[#23452F]"
        />
        <span>
          I confirm that I am <strong>18 years of age or older</strong> and
          consent to the store processing this enquiry in line with the POPIA
          Privacy Policy. *
        </span>
      </label>

      <Button
        type="submit"
        variant="primary"
        size="lg"
        disabled={submitting}
        className="w-full sm:w-auto"
      >
        {submitting ? "Sending Enquiry..." : "Send Enquiry"}
      </Button>
    </form>
  );
}
