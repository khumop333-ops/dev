import React from "react";
import type { Metadata } from "next";
import { PhoneCall, Mail, MapPin } from "lucide-react";
import { getStoreSettings } from "@/lib/settings";
import { ContactForm } from "@/components/store/contact-form";
import { buildWhatsAppLink } from "@/lib/utils";

export const metadata: Metadata = {
  title: "Contact & POPIA Enquiries",
  description:
    "Contact Highveld Herbal Co. in Pretoria by telephone, WhatsApp, email, or online enquiry form.",
};

export default async function ContactPage({
  searchParams,
}: {
  searchParams: {
    type?: "GENERAL" | "PRODUCT_ENQUIRY" | "PRIVACY_REQUEST";
    subject?: string;
    product?: string;
  };
}) {
  const siteConfig = await getStoreSettings();
  const whatsappUrl = buildWhatsAppLink(
    siteConfig.whatsappNumber,
    `Good day ${siteConfig.brandName}, I would like to make an enquiry.`
  );

  return (
    <div className="mx-auto max-w-container px-4 sm:px-6 lg:px-8 py-12 lg:py-16 space-y-10">
      <div className="border-b border-[#D6CBB9] pb-8 max-w-3xl">
        <span className="text-xs font-semibold uppercase tracking-[0.15em] text-[#23452F]">
          Pretoria Dispensary Counter
        </span>
        <h1 className="font-serif text-4xl sm:text-5xl text-[#1C1C19] mt-1">
          Contact &amp; Enquiries
        </h1>
        <p className="mt-2.5 text-sm text-[#5F5B52] leading-relaxed">
          Reach our Pretoria team regarding batch availability, reservation
          confirmations, local delivery areas, or POPIA personal information
          requests.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        <div className="lg:col-span-7">
          <ContactForm
            defaultType={searchParams.type || "GENERAL"}
            defaultSubject={searchParams.subject || ""}
            defaultProductSlug={searchParams.product || ""}
          />
        </div>

        <aside className="lg:col-span-5 space-y-5">
          <div className="rounded-[8px] border border-[#D6CBB9] bg-white p-6 space-y-4">
            <h2 className="font-serif text-2xl text-[#1C1C19] border-b border-[#D6CBB9] pb-3">
              Direct Store Contact
            </h2>

            <div className="space-y-3 text-xs text-[#5F5B52]">
              <p className="flex items-start gap-2.5">
                <MapPin className="h-4 w-4 text-[#23452F] shrink-0 mt-0.5" />
                <span>
                  <strong className="text-[#1C1C19] block">
                    Physical Address
                  </strong>
                  {siteConfig.fullAddress}
                </span>
              </p>

              <p className="flex items-start gap-2.5">
                <PhoneCall className="h-4 w-4 text-[#23452F] shrink-0 mt-0.5" />
                <span>
                  <strong className="text-[#1C1C19] block">
                    Telephone &amp; WhatsApp
                  </strong>
                  Tel: {siteConfig.phone}
                  <br />
                  WhatsApp: {siteConfig.whatsappDisplay}
                </span>
              </p>

              <p className="flex items-start gap-2.5">
                <Mail className="h-4 w-4 text-[#23452F] shrink-0 mt-0.5" />
                <span>
                  <strong className="text-[#1C1C19] block">Email</strong>
                  General: {siteConfig.email}
                  <br />
                  POPIA / Information Officer: {siteConfig.privacyEmail}
                </span>
              </p>
            </div>

            <div className="pt-2">
              <a
                href={whatsappUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex w-full items-center justify-center gap-2 rounded-[6px] bg-[#23452F] px-4 py-3 text-xs font-medium text-white hover:bg-[#1A3523]"
              >
                <PhoneCall className="h-4 w-4" />
                <span>Message Us on WhatsApp</span>
              </a>
            </div>
          </div>

          <div className="rounded-[8px] border border-[#D6CBB9] bg-[#E7DECF]/60 p-6 space-y-2 text-xs text-[#5F5B52]">
            <h3 className="font-serif text-lg text-[#1C1C19]">
              POPIA Data Subject Requests
            </h3>
            <p className="leading-relaxed">
              To request access to, correction of, or deletion of personal
              information held in connection with an order or enquiry under the
              Protection of Personal Information Act (POPIA), select{" "}
              <strong>&ldquo;POPIA / Personal Data Request&rdquo;</strong> in
              the form or email <strong>{siteConfig.privacyEmail}</strong>.
            </p>
          </div>
        </aside>
      </div>
    </div>
  );
}
