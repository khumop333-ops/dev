"use server";

import { prisma } from "@/lib/prisma";
import { enquirySchema, type EnquiryInput } from "@/lib/validation";
import { checkRateLimit } from "@/lib/rate-limit";
import { revalidatePath } from "next/cache";

export async function submitEnquiryAction(
  rawInput: EnquiryInput
): Promise<{ ok: true } | { ok: false; error: string }> {
  const parsed = enquirySchema.safeParse(rawInput);
  if (!parsed.success) {
    const firstIssue = parsed.error.issues[0]?.message || "Please check your enquiry details.";
    return { ok: false, error: firstIssue };
  }

  const input = parsed.data;

  const rate = checkRateLimit(`enquiry:${input.email.toLowerCase()}`, {
    maxRequests: 5,
    windowMs: 10 * 60 * 1000,
  });

  if (!rate.allowed) {
    return {
      ok: false,
      error: `Too many messages sent recently. Please wait ${rate.resetInSeconds} seconds before sending another enquiry.`,
    };
  }

  await prisma.enquiry.create({
    data: {
      name: input.name,
      email: input.email.toLowerCase(),
      phone: input.phone || null,
      subject: input.subject || null,
      productSlug: input.productSlug || null,
      type: input.type || "GENERAL",
      message: input.message,
      status: "NEW",
    },
  });

  console.info(
    `\n--- [DEV NOTIFICATION: NEW ENQUIRY] ---\nFrom: ${input.name} (${input.email})\nType: ${input.type}\nMessage: ${input.message}\n---------------------------------------\n`
  );

  revalidatePath("/admin");
  revalidatePath("/admin/enquiries");

  return { ok: true };
}
