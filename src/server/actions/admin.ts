"use server";

import bcrypt from "bcryptjs";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireStaffOrAdmin, requireAdminOnly } from "@/lib/auth";
import { writeAuditLog } from "@/lib/audit";
import {
  productFormSchema,
  categoryFormSchema,
  brandFormSchema,
  orderAdminUpdateSchema,
  contentPageFormSchema,
  storeSettingsFormSchema,
  staffUserCreateSchema,
  passwordChangeSchema,
  type ProductFormInput,
} from "@/lib/validation";
import {
  computeOrderInventoryTransition,
  getAvailableStock,
} from "@/lib/inventory";
import { STORE_SETTINGS_KEY } from "@/lib/settings";
import type { EnquiryStatus, ProductStatus } from "@prisma/client";

export async function saveProductAction(
  productId: string | null,
  rawInput: ProductFormInput
): Promise<{ ok: true; id: string } | { ok: false; error: string }> {
  try {
    const actor = await requireStaffOrAdmin();
    const parsed = productFormSchema.safeParse(rawInput);

    if (!parsed.success) {
      const issue = parsed.error.issues[0];
      return {
        ok: false,
        error: issue
          ? `${issue.path.join(".")}: ${issue.message}`
          : "Invalid product input.",
      };
    }

    const data = parsed.data;

    const saved = await prisma.$transaction(async (tx) => {
      let product;
      if (productId) {
        product = await tx.product.update({
          where: { id: productId },
          data: {
            name: data.name,
            slug: data.slug,
            brandId: data.brandId || null,
            categoryId: data.categoryId,
            shortDescription: data.shortDescription,
            descriptionMarkdown: data.descriptionMarkdown,
            status: data.status,
            featured: data.featured,
            productTypeLabel: data.productTypeLabel || null,
            thcContent: data.thcContent || null,
            cbdContent: data.cbdContent || null,
            weightLabel: data.weightLabel || null,
            terpenes: data.terpenes || null,
            flavourNotes: data.flavourNotes || null,
            labTestUrl: data.labTestUrl || null,
            batchNumber: data.batchNumber || null,
            storageNotes: data.storageNotes || null,
            seoTitle: data.seoTitle || null,
            seoDescription: data.seoDescription || null,
          },
        });
      } else {
        product = await tx.product.create({
          data: {
            name: data.name,
            slug: data.slug,
            brandId: data.brandId || null,
            categoryId: data.categoryId,
            shortDescription: data.shortDescription,
            descriptionMarkdown: data.descriptionMarkdown,
            status: data.status,
            featured: data.featured,
            productTypeLabel: data.productTypeLabel || null,
            thcContent: data.thcContent || null,
            cbdContent: data.cbdContent || null,
            weightLabel: data.weightLabel || null,
            terpenes: data.terpenes || null,
            flavourNotes: data.flavourNotes || null,
            labTestUrl: data.labTestUrl || null,
            batchNumber: data.batchNumber || null,
            storageNotes: data.storageNotes || null,
            seoTitle: data.seoTitle || null,
            seoDescription: data.seoDescription || null,
          },
        });
      }

      // Sync images
      await tx.productImage.deleteMany({
        where: { productId: product.id },
      });

      await tx.productImage.createMany({
        data: data.images.map((img, idx) => ({
          productId: product.id,
          url: img.url,
          alt: img.alt,
          sortOrder: idx,
        })),
      });

      // Upsert or create variants
      const existingVariants = await tx.productVariant.findMany({
        where: { productId: product.id },
      });
      const existingIds = new Set(existingVariants.map((v) => v.id));
      const incomingIds = new Set(
        data.variants.map((v) => v.id).filter(Boolean) as string[]
      );

      for (const oldVar of existingVariants) {
        if (!incomingIds.has(oldVar.id)) {
          await tx.productVariant.delete({
            where: { id: oldVar.id },
          });
        }
      }

      for (let i = 0; i < data.variants.length; i++) {
        const v = data.variants[i];
        if (v.id && existingIds.has(v.id)) {
          await tx.productVariant.update({
            where: { id: v.id },
            data: {
              name: v.name,
              sku: v.sku,
              priceCents: v.priceCents,
              compareAtPriceCents: v.compareAtPriceCents ?? null,
              stockQuantity: Math.max(0, v.stockQuantity),
              reservedQuantity: Math.max(0, v.reservedQuantity ?? 0),
              lowStockThreshold: Math.max(0, v.lowStockThreshold),
              active: v.active,
              sortOrder: i,
            },
          });
        } else {
          await tx.productVariant.create({
            data: {
              productId: product.id,
              name: v.name,
              sku: v.sku,
              priceCents: v.priceCents,
              compareAtPriceCents: v.compareAtPriceCents ?? null,
              stockQuantity: Math.max(0, v.stockQuantity),
              reservedQuantity: Math.max(0, v.reservedQuantity ?? 0),
              lowStockThreshold: Math.max(0, v.lowStockThreshold),
              active: v.active,
              sortOrder: i,
            },
          });
        }
      }

      return product;
    });

    await writeAuditLog({
      userId: actor.id,
      userEmail: actor.email,
      action: productId ? "UPDATE_PRODUCT" : "CREATE_PRODUCT",
      entityType: "Product",
      entityId: saved.id,
      metadata: { name: saved.name, slug: saved.slug, status: saved.status },
    });

    revalidatePath("/");
    revalidatePath("/shop");
    revalidatePath(`/products/${saved.slug}`);
    revalidatePath("/admin/products");
    revalidatePath(`/admin/products/${saved.id}`);

    return { ok: true, id: saved.id };
  } catch (err: unknown) {
    return {
      ok: false,
      error: err instanceof Error ? err.message : "Failed to save product.",
    };
  }
}

export async function quickUpdateProductStatusAction(
  productId: string,
  status: ProductStatus
): Promise<{ ok: boolean; error?: string }> {
  try {
    const actor = await requireStaffOrAdmin();
    const updated = await prisma.product.update({
      where: { id: productId },
      data: { status },
    });

    await writeAuditLog({
      userId: actor.id,
      userEmail: actor.email,
      action: "CHANGE_PRODUCT_STATUS",
      entityType: "Product",
      entityId: productId,
      metadata: { status, slug: updated.slug },
    });

    revalidatePath("/");
    revalidatePath("/shop");
    revalidatePath(`/products/${updated.slug}`);
    revalidatePath("/admin/products");

    return { ok: true };
  } catch (err: unknown) {
    return {
      ok: false,
      error: err instanceof Error ? err.message : "Failed to update status",
    };
  }
}

export async function saveCategoryAction(
  categoryId: string | null,
  rawInput: unknown
): Promise<{ ok: boolean; error?: string }> {
  try {
    const actor = await requireStaffOrAdmin();
    const parsed = categoryFormSchema.safeParse(rawInput);
    if (!parsed.success) {
      return {
        ok: false,
        error: parsed.error.issues[0]?.message || "Invalid category data",
      };
    }

    const d = parsed.data;
    const saved = categoryId
      ? await prisma.category.update({
          where: { id: categoryId },
          data: {
            name: d.name,
            slug: d.slug,
            description: d.description || null,
            imageUrl: d.imageUrl || "/images/demo/category-flower.svg",
            sortOrder: d.sortOrder,
            active: d.active,
          },
        })
      : await prisma.category.create({
          data: {
            name: d.name,
            slug: d.slug,
            description: d.description || null,
            imageUrl: d.imageUrl || "/images/demo/category-flower.svg",
            sortOrder: d.sortOrder,
            active: d.active,
          },
        });

    await writeAuditLog({
      userId: actor.id,
      userEmail: actor.email,
      action: categoryId ? "UPDATE_CATEGORY" : "CREATE_CATEGORY",
      entityType: "Category",
      entityId: saved.id,
      metadata: { name: saved.name, slug: saved.slug },
    });

    revalidatePath("/");
    revalidatePath("/shop");
    revalidatePath(`/collections/${saved.slug}`);
    revalidatePath("/admin/categories");

    return { ok: true };
  } catch (err: unknown) {
    return {
      ok: false,
      error: err instanceof Error ? err.message : "Failed to save category",
    };
  }
}

export async function saveBrandAction(
  brandId: string | null,
  rawInput: unknown
): Promise<{ ok: boolean; error?: string }> {
  try {
    const actor = await requireStaffOrAdmin();
    const parsed = brandFormSchema.safeParse(rawInput);
    if (!parsed.success) {
      return {
        ok: false,
        error: parsed.error.issues[0]?.message || "Invalid brand data",
      };
    }

    const d = parsed.data;
    const saved = brandId
      ? await prisma.brand.update({
          where: { id: brandId },
          data: {
            name: d.name,
            slug: d.slug,
            description: d.description || null,
            logoUrl: d.logoUrl || null,
            active: d.active,
          },
        })
      : await prisma.brand.create({
          data: {
            name: d.name,
            slug: d.slug,
            description: d.description || null,
            logoUrl: d.logoUrl || null,
            active: d.active,
          },
        });

    await writeAuditLog({
      userId: actor.id,
      userEmail: actor.email,
      action: brandId ? "UPDATE_BRAND" : "CREATE_BRAND",
      entityType: "Brand",
      entityId: saved.id,
      metadata: { name: saved.name, slug: saved.slug },
    });

    revalidatePath("/shop");
    revalidatePath("/admin/brands");

    return { ok: true };
  } catch (err: unknown) {
    return {
      ok: false,
      error: err instanceof Error ? err.message : "Failed to save brand",
    };
  }
}

export async function updateOrderAdminAction(
  rawInput: unknown
): Promise<{ ok: boolean; error?: string }> {
  try {
    const actor = await requireStaffOrAdmin();
    const parsed = orderAdminUpdateSchema.safeParse(rawInput);
    if (!parsed.success) {
      return {
        ok: false,
        error: parsed.error.issues[0]?.message || "Invalid order update data",
      };
    }

    const input = parsed.data;

    await prisma.$transaction(async (tx) => {
      const order = await tx.order.findUnique({
        where: { id: input.orderId },
        include: { items: true },
      });

      if (!order) {
        throw new Error("Order not found.");
      }

      const transition = computeOrderInventoryTransition(
        order.status,
        input.status
      );

      if (transition === "RELEASE_RESERVATION") {
        for (const item of order.items) {
          if (!item.variantId) continue;
          const variant = await tx.productVariant.findUnique({
            where: { id: item.variantId },
          });
          if (!variant) continue;

          const nextReserved = Math.max(0, variant.reservedQuantity - item.quantity);
          await tx.productVariant.update({
            where: { id: variant.id },
            data: { reservedQuantity: nextReserved },
          });

          await tx.inventoryMovement.create({
            data: {
              variantId: variant.id,
              orderId: order.id,
              type: "RELEASE",
              quantityDelta: -item.quantity,
              note: `Released reservation on order cancellation (${order.publicId})`,
            },
          });
        }
      } else if (transition === "DEDUCT_PHYSICAL_AND_RELEASE") {
        for (const item of order.items) {
          if (!item.variantId) continue;
          const variant = await tx.productVariant.findUnique({
            where: { id: item.variantId },
          });
          if (!variant) continue;

          const nextStock = Math.max(0, variant.stockQuantity - item.quantity);
          const nextReserved = Math.max(0, variant.reservedQuantity - item.quantity);

          await tx.productVariant.update({
            where: { id: variant.id },
            data: {
              stockQuantity: nextStock,
              reservedQuantity: nextReserved,
            },
          });

          await tx.inventoryMovement.create({
            data: {
              variantId: variant.id,
              orderId: order.id,
              type: "DEDUCT_COMPLETE",
              quantityDelta: -item.quantity,
              note: `Deducted physical stock on order completion (${order.publicId})`,
            },
          });
        }
      } else if (transition === "RE_RESERVE") {
        for (const item of order.items) {
          if (!item.variantId) continue;
          const variant = await tx.productVariant.findUnique({
            where: { id: item.variantId },
          });
          if (!variant) continue;

          const available = getAvailableStock(variant);
          if (available < item.quantity) {
            throw new Error(
              `Cannot re-activate cancelled order: insufficient stock for ${item.productNameSnapshot} (${item.variantNameSnapshot}).`
            );
          }

          await tx.productVariant.update({
            where: { id: variant.id },
            data: {
              reservedQuantity: variant.reservedQuantity + item.quantity,
            },
          });

          await tx.inventoryMovement.create({
            data: {
              variantId: variant.id,
              orderId: order.id,
              type: "RESERVE",
              quantityDelta: item.quantity,
              note: `Re-reserved stock on order status change (${order.publicId})`,
            },
          });
        }
      }

      await tx.order.update({
        where: { id: order.id },
        data: {
          status: input.status,
          paymentStatus: input.paymentStatus,
          paymentMethod: input.paymentMethod || null,
          adminNotes: input.adminNotes || null,
        },
      });

      await writeAuditLog({
        userId: actor.id,
        userEmail: actor.email,
        action: "UPDATE_ORDER",
        entityType: "Order",
        entityId: order.id,
        metadata: {
          publicId: order.publicId,
          previousStatus: order.status,
          newStatus: input.status,
          paymentStatus: input.paymentStatus,
          inventoryTransition: transition,
        },
      });
    });

    revalidatePath("/shop");
    revalidatePath("/admin");
    revalidatePath("/admin/orders");
    revalidatePath(`/admin/orders/${input.orderId}`);
    revalidatePath("/admin/products");

    return { ok: true };
  } catch (err: unknown) {
    return {
      ok: false,
      error: err instanceof Error ? err.message : "Failed to update order",
    };
  }
}

export async function updateEnquiryStatusAction(
  enquiryId: string,
  status: EnquiryStatus
): Promise<{ ok: boolean; error?: string }> {
  try {
    const actor = await requireStaffOrAdmin();
    await prisma.enquiry.update({
      where: { id: enquiryId },
      data: { status },
    });

    await writeAuditLog({
      userId: actor.id,
      userEmail: actor.email,
      action: "UPDATE_ENQUIRY_STATUS",
      entityType: "Enquiry",
      entityId: enquiryId,
      metadata: { status },
    });

    revalidatePath("/admin");
    revalidatePath("/admin/enquiries");

    return { ok: true };
  } catch (err: unknown) {
    return {
      ok: false,
      error: err instanceof Error ? err.message : "Failed to update enquiry",
    };
  }
}

export async function saveContentPageAction(
  pageId: string | null,
  rawInput: unknown
): Promise<{ ok: boolean; error?: string }> {
  try {
    const actor = await requireStaffOrAdmin();
    const parsed = contentPageFormSchema.safeParse(rawInput);
    if (!parsed.success) {
      return {
        ok: false,
        error: parsed.error.issues[0]?.message || "Invalid content page input",
      };
    }

    const d = parsed.data;
    const saved = pageId
      ? await prisma.contentPage.update({
          where: { id: pageId },
          data: {
            slug: d.slug,
            title: d.title,
            bodyMarkdown: d.bodyMarkdown,
            published: d.published,
            seoTitle: d.seoTitle || null,
            seoDescription: d.seoDescription || null,
          },
        })
      : await prisma.contentPage.create({
          data: {
            slug: d.slug,
            title: d.title,
            bodyMarkdown: d.bodyMarkdown,
            published: d.published,
            seoTitle: d.seoTitle || null,
            seoDescription: d.seoDescription || null,
          },
        });

    await writeAuditLog({
      userId: actor.id,
      userEmail: actor.email,
      action: pageId ? "UPDATE_CONTENT_PAGE" : "CREATE_CONTENT_PAGE",
      entityType: "ContentPage",
      entityId: saved.id,
      metadata: { slug: saved.slug, published: saved.published },
    });

    revalidatePath(`/legal/${saved.slug}`);
    revalidatePath("/admin/content");

    return { ok: true };
  } catch (err: unknown) {
    return {
      ok: false,
      error: err instanceof Error ? err.message : "Failed to save content page",
    };
  }
}

export async function saveStoreSettingsAction(
  rawInput: unknown
): Promise<{ ok: boolean; error?: string }> {
  try {
    const actor = await requireAdminOnly();
    const parsed = storeSettingsFormSchema.safeParse(rawInput);
    if (!parsed.success) {
      return {
        ok: false,
        error: parsed.error.issues[0]?.message || "Invalid settings input",
      };
    }

    const d = parsed.data;
    await prisma.siteSetting.upsert({
      where: { key: STORE_SETTINGS_KEY },
      update: {
        valueJson: d,
      },
      create: {
        key: STORE_SETTINGS_KEY,
        valueJson: d,
      },
    });

    await writeAuditLog({
      userId: actor.id,
      userEmail: actor.email,
      action: "UPDATE_STORE_SETTINGS",
      entityType: "SiteSetting",
      entityId: STORE_SETTINGS_KEY,
      metadata: {
        brandName: d.brandName,
        salesMode: d.salesMode,
        deliveryFeeCents: d.deliveryFeeCents,
      },
    });

    revalidatePath("/", "layout");
    revalidatePath("/admin/settings");

    return { ok: true };
  } catch (err: unknown) {
    return {
      ok: false,
      error: err instanceof Error ? err.message : "Failed to save store settings",
    };
  }
}

export async function createStaffUserAction(
  rawInput: unknown
): Promise<{ ok: boolean; error?: string }> {
  try {
    const actor = await requireAdminOnly();
    const parsed = staffUserCreateSchema.safeParse(rawInput);
    if (!parsed.success) {
      return {
        ok: false,
        error: parsed.error.issues[0]?.message || "Invalid user input",
      };
    }

    const d = parsed.data;
    const email = d.email.toLowerCase();
    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
      return { ok: false, error: "A user with this email already exists." };
    }

    const passwordHash = await bcrypt.hash(d.password, 10);
    const created = await prisma.user.create({
      data: {
        name: d.name,
        email,
        passwordHash,
        role: d.role,
        active: true,
      },
    });

    await writeAuditLog({
      userId: actor.id,
      userEmail: actor.email,
      action: "CREATE_ADMIN_USER",
      entityType: "User",
      entityId: created.id,
      metadata: { email: created.email, role: created.role },
    });

    revalidatePath("/admin/users");
    return { ok: true };
  } catch (err: unknown) {
    return {
      ok: false,
      error: err instanceof Error ? err.message : "Failed to create user",
    };
  }
}

export async function toggleUserActiveAction(
  targetUserId: string
): Promise<{ ok: boolean; error?: string }> {
  try {
    const actor = await requireAdminOnly();

    if (actor.id === targetUserId) {
      return {
        ok: false,
        error: "You cannot deactivate your own active admin account.",
      };
    }

    const target = await prisma.user.findUnique({
      where: { id: targetUserId },
    });
    if (!target) {
      return { ok: false, error: "User not found." };
    }

    if (target.role === "ADMIN" && target.active) {
      const activeAdminsCount = await prisma.user.count({
        where: { role: "ADMIN", active: true },
      });
      if (activeAdminsCount <= 1) {
        return {
          ok: false,
          error: "Cannot deactivate the last remaining active ADMIN user.",
        };
      }
    }

    const updated = await prisma.user.update({
      where: { id: targetUserId },
      data: { active: !target.active },
    });

    await writeAuditLog({
      userId: actor.id,
      userEmail: actor.email,
      action: updated.active ? "ACTIVATE_USER" : "DEACTIVATE_USER",
      entityType: "User",
      entityId: updated.id,
      metadata: { email: updated.email, active: updated.active },
    });

    revalidatePath("/admin/users");
    return { ok: true };
  } catch (err: unknown) {
    return {
      ok: false,
      error: err instanceof Error ? err.message : "Failed to update user status",
    };
  }
}

export async function changeOwnPasswordAction(
  rawInput: unknown
): Promise<{ ok: boolean; error?: string }> {
  try {
    const actor = await requireStaffOrAdmin();
    const parsed = passwordChangeSchema.safeParse(rawInput);
    if (!parsed.success) {
      return {
        ok: false,
        error: parsed.error.issues[0]?.message || "Invalid password input",
      };
    }

    const user = await prisma.user.findUnique({ where: { id: actor.id } });
    if (!user) {
      return { ok: false, error: "User record not found." };
    }

    const matches = await bcrypt.compare(
      parsed.data.currentPassword,
      user.passwordHash
    );
    if (!matches) {
      return { ok: false, error: "Current password is incorrect." };
    }

    const nextHash = await bcrypt.hash(parsed.data.newPassword, 10);
    await prisma.user.update({
      where: { id: user.id },
      data: { passwordHash: nextHash },
    });

    await writeAuditLog({
      userId: actor.id,
      userEmail: actor.email,
      action: "CHANGE_OWN_PASSWORD",
      entityType: "User",
      entityId: user.id,
    });

    return { ok: true };
  } catch (err: unknown) {
    return {
      ok: false,
      error: err instanceof Error ? err.message : "Failed to change password",
    };
  }
}
