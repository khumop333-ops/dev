import React from "react";
import type { Metadata } from "next";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import {
  Accordion,
  AccordionItem,
  AccordionTrigger,
  AccordionContent,
} from "@/components/ui/accordion";
import { MarkdownContent } from "@/components/ui/markdown-content";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Frequently Asked Questions",
  description:
    "Answers to common questions about 18+ age verification, online reservations, payment methods, Pretoria collection, local delivery, returns, and POPIA privacy.",
};

export default async function FaqPage() {
  const faqs = await prisma.faqItem.findMany({
    where: { active: true },
    orderBy: { sortOrder: "asc" },
  });

  return (
    <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 py-12 lg:py-16 space-y-10">
      <div className="border-b border-[#D6CBB9] pb-8 space-y-3">
        <span className="text-xs font-semibold uppercase tracking-[0.15em] text-[#23452F]">
          Dispensary Guide
        </span>
        <h1 className="font-serif text-4xl sm:text-5xl text-[#1C1C19]">
          Frequently Asked Questions
        </h1>
        <p className="text-sm text-[#5F5B52] leading-relaxed">
          Clear information regarding how our Pretoria reservation process,
          collection counter, local delivery service, and 18+ verification work.
        </p>
      </div>

      <div className="rounded-[8px] border border-[#D6CBB9] bg-white px-6 sm:px-8 py-4">
        <Accordion type="single" collapsible defaultValue={faqs[0]?.id}>
          {faqs.map((faq) => (
            <AccordionItem key={faq.id} value={faq.id}>
              <AccordionTrigger className="text-base sm:text-lg font-serif">
                {faq.question}
              </AccordionTrigger>
              <AccordionContent>
                <MarkdownContent content={faq.answerMarkdown} />
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </div>

      <div className="rounded-[8px] border border-[#D6CBB9] bg-[#E7DECF]/55 p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="font-serif text-xl text-[#1C1C19]">
            Have another question?
          </h2>
          <p className="text-xs text-[#5F5B52] mt-1">
            Contact our Pretoria dispensary counter directly via WhatsApp or
            our enquiry form.
          </p>
        </div>
        <Link
          href="/contact"
          className="inline-flex items-center justify-center rounded-[6px] bg-[#23452F] px-5 py-2.5 text-xs font-medium text-white hover:bg-[#1A3523] shrink-0"
        >
          Contact the Store
        </Link>
      </div>
    </div>
  );
}
