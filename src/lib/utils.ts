import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import { customAlphabet } from "nanoid";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

const orderAlphabet = customAlphabet("23456789ABCDEFGHJKLMNPQRSTUVWXYZ", 6);

export function generatePublicOrderId(prefix = "HHC"): string {
  return `${prefix}-${orderAlphabet()}`;
}

export function slugify(input: string): string {
  return input
    .toLowerCase()
    .trim()
    .replace(/['"]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

/**
 * Formats a Date into South African Standard Time (Africa/Johannesburg).
 */
export function formatDateSAST(date: Date | string, includeTime = true): string {
  const d = typeof date === "string" ? new Date(date) : date;
  if (Number.isNaN(d.getTime())) return "";
  return new Intl.DateTimeFormat("en-ZA", {
    timeZone: "Africa/Johannesburg",
    year: "numeric",
    month: "short",
    day: "2-digit",
    ...(includeTime
      ? {
          hour: "2-digit",
          minute: "2-digit",
          hour12: false,
        }
      : {}),
  }).format(d);
}

/**
 * Builds a WhatsApp wa.me deep link for South African numbers.
 */
export function buildWhatsAppLink(whatsappNumber: string, message: string): string {
  const digits = whatsappNumber.replace(/[^0-9]/g, "");
  const normalized = digits.startsWith("0") ? `27${digits.slice(1)}` : digits;
  const encoded = encodeURIComponent(message);
  return `https://wa.me/${normalized}?text=${encoded}`;
}
