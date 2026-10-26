import { z } from "zod";

export const saPhoneRegex = /^(\+27|27|0)[\s-]*[1-9][0-9\s-]{7,12}$/;

export const cartLineSchema = z.object({
  variantId: z.string().min(1, "Variant ID is required"),
  quantity: z.number().int().min(1, "Quantity must be at least 1").max(50, "Maximum 50 per item"),
});

export const checkoutSchema = z
  .object({
    customerFirstName: z.string().trim().min(2, "First name is required").max(80),
    customerLastName: z.string().trim().min(2, "Last name is required").max(80),
    email: z.string().trim().email("Please enter a valid email address").max(120),
    phone: z
      .string()
      .trim()
      .regex(saPhoneRegex, "Please enter a valid South African phone number (e.g. +27 82 000 0000 or 082 000 0000)"),
    fulfilmentMethod: z.enum(["COLLECTION", "DELIVERY"]),
    addressLine1: z.string().trim().max(160).optional().or(z.literal("")),
    addressLine2: z.string().trim().max(160).optional().or(z.literal("")),
    suburb: z.string().trim().max(100).optional().or(z.literal("")),
    city: z.string().trim().max(100).optional().or(z.literal("")),
    province: z.string().trim().max(100).optional().or(z.literal("")),
    postalCode: z.string().trim().max(10).optional().or(z.literal("")),
    preferredDateTime: z.string().trim().max(120).optional().or(z.literal("")),
    notes: z.string().trim().max(600).optional().or(z.literal("")),
    ageConfirmed: z.literal(true, {
      errorMap: () => ({ message: "You must confirm that you are 18 years of age or older." }),
    }),
    termsAccepted: z.literal(true, {
      errorMap: () => ({ message: "You must accept the store Terms & Conditions." }),
    }),
    privacyAccepted: z.literal(true, {
      errorMap: () => ({ message: "You must acknowledge the POPIA Privacy Notice." }),
    }),
    items: z.array(cartLineSchema).min(1, "Your reservation request must contain at least one item."),
  })
  .superRefine((data, ctx) => {
    if (data.fulfilmentMethod === "DELIVERY") {
      if (!data.addressLine1 || data.addressLine1.trim().length < 4) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["addressLine1"],
          message: "Street address is required for local delivery.",
        });
      }
      if (!data.suburb || data.suburb.trim().length < 2) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["suburb"],
          message: "Suburb is required for local delivery.",
        });
      }
      if (!data.city || data.city.trim().length < 2) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["city"],
          message: "City is required for local delivery.",
        });
      }
      if (!data.postalCode || !/^[0-9]{4}$/.test(data.postalCode.trim())) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["postalCode"],
          message: "Please enter a valid 4-digit South African postal code (e.g. 0001).",
        });
      }
    }
  });

export type CheckoutInput = z.infer<typeof checkoutSchema>;

export const enquirySchema = z.object({
  name: z.string().trim().min(2, "Your name is required").max(100),
  email: z.string().trim().email("Please enter a valid email address").max(120),
  phone: z
    .string()
    .trim()
    .regex(saPhoneRegex, "Please enter a valid South African phone number (+27 or 0...)")
    .optional()
    .or(z.literal("")),
  subject: z.string().trim().max(140).optional().or(z.literal("")),
  productSlug: z.string().trim().max(140).optional().or(z.literal("")),
  type: z.enum(["GENERAL", "PRODUCT_ENQUIRY", "PRIVACY_REQUEST"]).default("GENERAL"),
  message: z.string().trim().min(10, "Please provide a message of at least 10 characters").max(2000),
  ageConfirmed: z.boolean().refine((val) => val === true, {
    message: "Please confirm that you are 18 years or older.",
  }),
});

export type EnquiryInput = z.infer<typeof enquirySchema>;

export const productVariantInputSchema = z.object({
  id: z.string().optional(),
  name: z.string().trim().min(1, "Variant name is required (e.g. 3.5g)"),
  sku: z.string().trim().min(2, "SKU is required"),
  priceCents: z.coerce.number().int().min(0, "Price cannot be negative"),
  compareAtPriceCents: z.coerce.number().int().min(0).optional().nullable(),
  stockQuantity: z.coerce.number().int().min(0, "Stock cannot be negative"),
  reservedQuantity: z.coerce.number().int().min(0).default(0),
  lowStockThreshold: z.coerce.number().int().min(0).default(3),
  active: z.boolean().default(true),
  sortOrder: z.coerce.number().int().default(0),
});

export const productImageInputSchema = z.object({
  id: z.string().optional(),
  url: z.string().trim().min(1, "Image URL is required"),
  alt: z.string().trim().min(2, "Alt text is required for accessibility"),
  sortOrder: z.coerce.number().int().default(0),
});

export const productFormSchema = z.object({
  name: z.string().trim().min(2, "Product name is required").max(140),
  slug: z
    .string()
    .trim()
    .min(2, "Slug is required")
    .regex(/^[a-z0-9-]+$/, "Slug must contain lowercase letters, numbers, and hyphens only"),
  brandId: z.string().optional().nullable(),
  categoryId: z.string().min(1, "Category is required"),
  shortDescription: z.string().trim().min(10, "Short description is required").max(320),
  descriptionMarkdown: z.string().trim().min(10, "Detailed description is required"),
  status: z.enum(["DRAFT", "ACTIVE", "ARCHIVED"]),
  featured: z.boolean().default(false),
  productTypeLabel: z.string().trim().max(80).optional().or(z.literal("")),
  thcContent: z.string().trim().max(60).optional().or(z.literal("")),
  cbdContent: z.string().trim().max(60).optional().or(z.literal("")),
  weightLabel: z.string().trim().max(60).optional().or(z.literal("")),
  terpenes: z.string().trim().max(200).optional().or(z.literal("")),
  flavourNotes: z.string().trim().max(200).optional().or(z.literal("")),
  labTestUrl: z.string().trim().max(300).optional().or(z.literal("")),
  batchNumber: z.string().trim().max(80).optional().or(z.literal("")),
  storageNotes: z.string().trim().max(400).optional().or(z.literal("")),
  seoTitle: z.string().trim().max(120).optional().or(z.literal("")),
  seoDescription: z.string().trim().max(240).optional().or(z.literal("")),
  images: z.array(productImageInputSchema).min(1, "At least one product image with alt text is required"),
  variants: z.array(productVariantInputSchema).min(1, "At least one product variant is required"),
});

export type ProductFormInput = z.infer<typeof productFormSchema>;

export const categoryFormSchema = z.object({
  name: z.string().trim().min(2, "Category name is required").max(80),
  slug: z
    .string()
    .trim()
    .min(2)
    .regex(/^[a-z0-9-]+$/, "Slug must be lowercase alphanumeric with hyphens"),
  description: z.string().trim().max(400).optional().or(z.literal("")),
  imageUrl: z.string().trim().max(300).optional().or(z.literal("")),
  sortOrder: z.coerce.number().int().default(0),
  active: z.boolean().default(true),
});

export const brandFormSchema = z.object({
  name: z.string().trim().min(2, "Brand name is required").max(80),
  slug: z
    .string()
    .trim()
    .min(2)
    .regex(/^[a-z0-9-]+$/, "Slug must be lowercase alphanumeric with hyphens"),
  description: z.string().trim().max(400).optional().or(z.literal("")),
  logoUrl: z.string().trim().max(300).optional().or(z.literal("")),
  active: z.boolean().default(true),
});

export const orderAdminUpdateSchema = z.object({
  orderId: z.string().min(1),
  status: z.enum([
    "PENDING",
    "CONFIRMED",
    "READY_FOR_COLLECTION",
    "OUT_FOR_DELIVERY",
    "COMPLETED",
    "CANCELLED",
  ]),
  paymentStatus: z.enum(["UNPAID", "PAID_CASH", "PAID_EFT", "PAID_OTHER"]),
  paymentMethod: z.string().trim().max(80).optional().or(z.literal("")),
  adminNotes: z.string().trim().max(1000).optional().or(z.literal("")),
});

export const contentPageFormSchema = z.object({
  slug: z
    .string()
    .trim()
    .min(2)
    .regex(/^[a-z0-9-]+$/),
  title: z.string().trim().min(2, "Title is required").max(140),
  bodyMarkdown: z.string().trim().min(20, "Content body is required"),
  published: z.boolean().default(true),
  seoTitle: z.string().trim().max(120).optional().or(z.literal("")),
  seoDescription: z.string().trim().max(240).optional().or(z.literal("")),
});

export const storeSettingsFormSchema = z.object({
  brandName: z.string().trim().min(2).max(100),
  tagline: z.string().trim().min(2).max(160),
  description: z.string().trim().min(10).max(500),
  addressLine1: z.string().trim().min(2).max(160),
  suburb: z.string().trim().min(2).max(100),
  city: z.string().trim().min(2).max(80),
  province: z.string().trim().min(2).max(80),
  postalCode: z.string().trim().min(4).max(10),
  phone: z.string().trim().min(6).max(40),
  whatsappNumber: z.string().trim().min(8).max(30),
  whatsappDisplay: z.string().trim().min(6).max(40),
  email: z.string().trim().email(),
  weekdaysHours: z.string().trim().min(2).max(80),
  saturdayHours: z.string().trim().min(2).max(80),
  sundayHours: z.string().trim().min(2).max(80),
  deliveryFeeCents: z.coerce.number().int().min(0),
  freeDeliveryThresholdCents: z.coerce.number().int().min(0),
  deliveryAreasText: z.string().trim().min(2).max(800),
  salesMode: z.enum(["reservation", "enquiry", "checkout"]),
  vatNotice: z.string().trim().max(240),
  announcementText: z.string().trim().max(240),
  complianceNotice: z.string().trim().min(20).max(1200),
});

export const staffUserCreateSchema = z.object({
  name: z.string().trim().min(2, "Name is required").max(80),
  email: z.string().trim().email("Valid email required"),
  password: z.string().min(8, "Password must be at least 8 characters"),
  role: z.enum(["ADMIN", "STAFF"]),
});

export const passwordChangeSchema = z.object({
  currentPassword: z.string().min(1, "Current password is required"),
  newPassword: z.string().min(8, "New password must be at least 8 characters"),
});
