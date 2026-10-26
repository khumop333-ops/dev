"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Plus, Trash2, Upload } from "lucide-react";
import { saveProductAction } from "@/server/actions/admin";
import { formatZAR } from "@/lib/money";
import { slugify } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import type { ProductStatus } from "@prisma/client";

export interface ProductEditorInitialData {
  id?: string;
  name: string;
  slug: string;
  brandId: string | null;
  categoryId: string;
  shortDescription: string;
  descriptionMarkdown: string;
  status: ProductStatus;
  featured: boolean;
  productTypeLabel: string;
  thcContent: string;
  cbdContent: string;
  weightLabel: string;
  terpenes: string;
  flavourNotes: string;
  labTestUrl: string;
  batchNumber: string;
  storageNotes: string;
  seoTitle: string;
  seoDescription: string;
  images: Array<{
    id?: string;
    url: string;
    alt: string;
    sortOrder: number;
  }>;
  variants: Array<{
    id?: string;
    name: string;
    sku: string;
    priceCents: number;
    compareAtPriceCents?: number | null;
    stockQuantity: number;
    reservedQuantity: number;
    lowStockThreshold: number;
    active: boolean;
    sortOrder: number;
  }>;
}

export function ProductEditorForm({
  initialData,
  categories,
  brands,
}: {
  initialData: ProductEditorInitialData;
  categories: Array<{ id: string; name: string }>;
  brands: Array<{ id: string; name: string }>;
}) {
  const router = useRouter();
  const isEditing = Boolean(initialData.id);

  const [name, setName] = useState(initialData.name);
  const [slug, setSlug] = useState(initialData.slug);
  const [slugTouched, setSlugTouched] = useState(isEditing);
  const [brandId, setBrandId] = useState(initialData.brandId || "");
  const [categoryId, setCategoryId] = useState(
    initialData.categoryId || categories[0]?.id || ""
  );
  const [shortDescription, setShortDescription] = useState(
    initialData.shortDescription
  );
  const [descriptionMarkdown, setDescriptionMarkdown] = useState(
    initialData.descriptionMarkdown
  );
  const [status, setStatus] = useState<ProductStatus>(initialData.status);
  const [featured, setFeatured] = useState(initialData.featured);

  const [productTypeLabel, setProductTypeLabel] = useState(
    initialData.productTypeLabel
  );
  const [thcContent, setThcContent] = useState(initialData.thcContent);
  const [cbdContent, setCbdContent] = useState(initialData.cbdContent);
  const [weightLabel, setWeightLabel] = useState(initialData.weightLabel);
  const [terpenes, setTerpenes] = useState(initialData.terpenes);
  const [flavourNotes, setFlavourNotes] = useState(initialData.flavourNotes);
  const [labTestUrl, setLabTestUrl] = useState(initialData.labTestUrl);
  const [batchNumber, setBatchNumber] = useState(initialData.batchNumber);
  const [storageNotes, setStorageNotes] = useState(initialData.storageNotes);
  const [seoTitle, setSeoTitle] = useState(initialData.seoTitle);
  const [seoDescription, setSeoDescription] = useState(
    initialData.seoDescription
  );

  const [images, setImages] = useState(initialData.images);
  const [variants, setVariants] = useState(initialData.variants);

  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [uploadWarning, setUploadWarning] = useState<string | null>(null);

  const handleNameChange = (val: string) => {
    setName(val);
    if (!slugTouched) {
      setSlug(slugify(val));
    }
  };

  const handleLocalFileUpload = async (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const formData = new FormData();
    formData.append("file", file);

    try {
      const res = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });
      const json = await res.json();
      if (!res.ok) {
        setError(json.error || "Upload failed");
        return;
      }
      setImages((prev) => [
        ...prev,
        {
          url: json.url,
          alt: name || "Product image",
          sortOrder: prev.length,
        },
      ]);
      if (json.warning) {
        setUploadWarning(json.warning);
      }
    } catch {
      setError("Failed to upload image file.");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccessMsg(null);
    setSaving(true);

    try {
      const res = await saveProductAction(initialData.id || null, {
        name,
        slug,
        brandId: brandId || null,
        categoryId,
        shortDescription,
        descriptionMarkdown,
        status,
        featured,
        productTypeLabel,
        thcContent,
        cbdContent,
        weightLabel,
        terpenes,
        flavourNotes,
        labTestUrl,
        batchNumber,
        storageNotes,
        seoTitle,
        seoDescription,
        images,
        variants,
      });

      if (!res.ok) {
        setError(res.error);
        setSaving(false);
        return;
      }

      setSuccessMsg("Product saved and menu cache updated.");
      setSaving(false);
      if (!isEditing) {
        router.push(`/admin/products/${res.id}`);
      } else {
        router.refresh();
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to save product.");
      setSaving(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#D6CBB9] pb-4">
        <div>
          <Link
            href="/admin/products"
            className="text-xs text-[#23452F] underline"
          >
            ← Back to Products
          </Link>
          <h1 className="font-serif text-3xl text-[#1C1C19] mt-1">
            {isEditing ? `Edit: ${initialData.name}` : "Create New Product"}
          </h1>
        </div>

        <div className="flex items-center gap-3">
          <select
            aria-label="Product status"
            value={status}
            onChange={(e) => setStatus(e.target.value as ProductStatus)}
            data-testid="product-status-select"
            className="rounded-[6px] border border-[#D6CBB9] bg-white px-3 py-2 text-xs font-semibold text-[#1C1C19]"
          >
            <option value="DRAFT">DRAFT (Hidden)</option>
            <option value="ACTIVE">ACTIVE (Published)</option>
            <option value="ARCHIVED">ARCHIVED</option>
          </select>

          <Button
            type="submit"
            variant="primary"
            size="md"
            disabled={saving}
            data-testid="save-product-btn"
          >
            {saving ? "Saving..." : "Save Product"}
          </Button>
        </div>
      </div>

      <div aria-live="polite">
        {error && (
          <div
            role="alert"
            className="rounded-[6px] border border-[#9E3A32] bg-[#9E3A32]/10 p-4 text-xs text-[#9E3A32]"
          >
            {error}
          </div>
        )}
        {successMsg && (
          <div
            role="status"
            data-testid="product-saved-banner"
            className="rounded-[6px] border border-[#2F6B4F] bg-[#2F6B4F]/10 p-4 text-xs text-[#2F6B4F] font-medium"
          >
            {successMsg}
          </div>
        )}
      </div>

      {/* Core Details */}
      <section className="rounded-[8px] border border-[#D6CBB9] bg-white p-6 space-y-4">
        <h2 className="font-serif text-xl text-[#1C1C19] border-b border-[#D6CBB9] pb-2">
          1. Core Product Details
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label
              htmlFor="prod-name"
              className="block text-xs font-semibold uppercase tracking-wider text-[#1C1C19] mb-1"
            >
              Product Name *
            </label>
            <input
              id="prod-name"
              type="text"
              required
              value={name}
              onChange={(e) => handleNameChange(e.target.value)}
              className="w-full rounded-[6px] border border-[#D6CBB9] bg-white px-3 py-2 text-sm text-[#1C1C19]"
            />
          </div>

          <div>
            <label
              htmlFor="prod-slug"
              className="block text-xs font-semibold uppercase tracking-wider text-[#1C1C19] mb-1"
            >
              URL Slug *
            </label>
            <input
              id="prod-slug"
              type="text"
              required
              value={slug}
              onChange={(e) => {
                setSlugTouched(true);
                setSlug(e.target.value);
              }}
              className="w-full rounded-[6px] border border-[#D6CBB9] bg-white px-3 py-2 text-sm font-mono text-[#1C1C19]"
            />
          </div>

          <div>
            <label
              htmlFor="prod-category"
              className="block text-xs font-semibold uppercase tracking-wider text-[#1C1C19] mb-1"
            >
              Category *
            </label>
            <select
              id="prod-category"
              value={categoryId}
              onChange={(e) => setCategoryId(e.target.value)}
              className="w-full rounded-[6px] border border-[#D6CBB9] bg-white px-3 py-2 text-sm text-[#1C1C19]"
            >
              {categories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label
              htmlFor="prod-brand"
              className="block text-xs font-semibold uppercase tracking-wider text-[#1C1C19] mb-1"
            >
              Brand / Producer
            </label>
            <select
              id="prod-brand"
              value={brandId}
              onChange={(e) => setBrandId(e.target.value)}
              className="w-full rounded-[6px] border border-[#D6CBB9] bg-white px-3 py-2 text-sm text-[#1C1C19]"
            >
              <option value="">House / Unbranded</option>
              {brands.map((b) => (
                <option key={b.id} value={b.id}>
                  {b.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        <label className="inline-flex items-center gap-2 text-xs text-[#1C1C19] cursor-pointer">
          <input
            type="checkbox"
            checked={featured}
            onChange={(e) => setFeatured(e.target.checked)}
            className="h-4 w-4 accent-[#23452F]"
          />
          <span>Feature on homepage (&ldquo;Featured Preparations&rdquo;)</span>
        </label>

        <div>
          <label
            htmlFor="prod-short-desc"
            className="block text-xs font-semibold uppercase tracking-wider text-[#1C1C19] mb-1"
          >
            Short Card Summary *
          </label>
          <textarea
            id="prod-short-desc"
            rows={2}
            required
            value={shortDescription}
            onChange={(e) => setShortDescription(e.target.value)}
            className="w-full rounded-[6px] border border-[#D6CBB9] bg-white px-3 py-2 text-sm text-[#1C1C19]"
          />
        </div>

        <div>
          <label
            htmlFor="prod-markdown"
            className="block text-xs font-semibold uppercase tracking-wider text-[#1C1C19] mb-1"
          >
            Detailed Description (Markdown — Avoid Medical Claims) *
          </label>
          <textarea
            id="prod-markdown"
            rows={6}
            required
            value={descriptionMarkdown}
            onChange={(e) => setDescriptionMarkdown(e.target.value)}
            className="w-full rounded-[6px] border border-[#D6CBB9] bg-white px-3 py-2 text-sm font-mono text-[#1C1C19]"
          />
        </div>
      </section>

      {/* Variants & ZAR Pricing */}
      <section className="rounded-[8px] border border-[#D6CBB9] bg-white p-6 space-y-4">
        <div className="flex items-center justify-between border-b border-[#D6CBB9] pb-2">
          <div>
            <h2 className="font-serif text-xl text-[#1C1C19]">
              2. Variants, ZAR Pricing &amp; Inventory
            </h2>
            <p className="text-xs text-[#5F5B52]">
              Enter prices in integer ZAR cents (e.g. 25000 = R 250,00).
            </p>
          </div>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() =>
              setVariants((prev) => [
                ...prev,
                {
                  name: "3.5g Jar",
                  sku: `HHC-${Date.now().toString().slice(-4)}`,
                  priceCents: 25000,
                  stockQuantity: 10,
                  reservedQuantity: 0,
                  lowStockThreshold: 3,
                  active: true,
                  sortOrder: prev.length,
                },
              ])
            }
          >
            <Plus className="h-3.5 w-3.5" />
            <span>Add Variant</span>
          </Button>
        </div>

        <div className="space-y-3">
          {variants.map((v, idx) => (
            <div
              key={v.id || idx}
              className="rounded-[6px] border border-[#D6CBB9] bg-[#F7F3EA] p-4 grid grid-cols-1 sm:grid-cols-7 gap-3 items-end"
            >
              <div className="sm:col-span-2">
                <label className="block text-[11px] font-semibold text-[#1C1C19] mb-1">
                  Option Name *
                </label>
                <input
                  type="text"
                  required
                  value={v.name}
                  onChange={(e) => {
                    const next = [...variants];
                    next[idx] = { ...next[idx], name: e.target.value };
                    setVariants(next);
                  }}
                  className="w-full rounded-[4px] border border-[#D6CBB9] bg-white px-2.5 py-1.5 text-xs"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-[#1C1C19] mb-1">
                  SKU *
                </label>
                <input
                  type="text"
                  required
                  value={v.sku}
                  onChange={(e) => {
                    const next = [...variants];
                    next[idx] = { ...next[idx], sku: e.target.value };
                    setVariants(next);
                  }}
                  className="w-full rounded-[4px] border border-[#D6CBB9] bg-white px-2.5 py-1.5 text-xs font-mono"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-[#1C1C19] mb-1">
                  Price Cents ({formatZAR(v.priceCents)})
                </label>
                <input
                  type="number"
                  min={0}
                  required
                  value={v.priceCents}
                  onChange={(e) => {
                    const next = [...variants];
                    next[idx] = {
                      ...next[idx],
                      priceCents: Number.parseInt(e.target.value || "0", 10),
                    };
                    setVariants(next);
                  }}
                  className="w-full rounded-[4px] border border-[#D6CBB9] bg-white px-2.5 py-1.5 text-xs"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-[#1C1C19] mb-1">
                  Physical Stock
                </label>
                <input
                  type="number"
                  min={0}
                  required
                  value={v.stockQuantity}
                  onChange={(e) => {
                    const next = [...variants];
                    next[idx] = {
                      ...next[idx],
                      stockQuantity: Math.max(
                        0,
                        Number.parseInt(e.target.value || "0", 10)
                      ),
                    };
                    setVariants(next);
                  }}
                  className="w-full rounded-[4px] border border-[#D6CBB9] bg-white px-2.5 py-1.5 text-xs"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-[#1C1C19] mb-1">
                  Reserved
                </label>
                <input
                  type="number"
                  min={0}
                  value={v.reservedQuantity}
                  onChange={(e) => {
                    const next = [...variants];
                    next[idx] = {
                      ...next[idx],
                      reservedQuantity: Math.max(
                        0,
                        Number.parseInt(e.target.value || "0", 10)
                      ),
                    };
                    setVariants(next);
                  }}
                  className="w-full rounded-[4px] border border-[#D6CBB9] bg-white px-2.5 py-1.5 text-xs"
                />
              </div>

              <div className="flex items-center justify-between gap-2">
                <label className="inline-flex items-center gap-1.5 text-xs">
                  <input
                    type="checkbox"
                    checked={v.active}
                    onChange={(e) => {
                      const next = [...variants];
                      next[idx] = { ...next[idx], active: e.target.checked };
                      setVariants(next);
                    }}
                    className="h-3.5 w-3.5 accent-[#23452F]"
                  />
                  <span>Active</span>
                </label>

                {variants.length > 1 && (
                  <button
                    type="button"
                    aria-label="Remove variant"
                    onClick={() =>
                      setVariants((prev) => prev.filter((_, i) => i !== idx))
                    }
                    className="p-1.5 text-[#9E3A32] hover:bg-[#9E3A32]/10 rounded-[4px]"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Images */}
      <section className="rounded-[8px] border border-[#D6CBB9] bg-white p-6 space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-[#D6CBB9] pb-2">
          <div>
            <h2 className="font-serif text-xl text-[#1C1C19]">
              3. Product Images &amp; Accessibility Alt Text
            </h2>
            <p className="text-xs text-[#5F5B52]">
              Use `/images/demo/...` placeholders, external HTTPS URLs, or local
              development upload.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <label className="inline-flex items-center gap-1.5 rounded-[6px] border border-[#D6CBB9] bg-[#F7F3EA] px-3 py-1.5 text-xs font-medium text-[#1C1C19] cursor-pointer hover:border-[#23452F]">
              <Upload className="h-3.5 w-3.5" />
              <span>Upload Local File</span>
              <input
                type="file"
                accept="image/*"
                onChange={handleLocalFileUpload}
                className="sr-only"
              />
            </label>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() =>
                setImages((prev) => [
                  ...prev,
                  {
                    url: "/images/demo/product-apricot-reserve.svg",
                    alt: name || "Botanical specimen placeholder",
                    sortOrder: prev.length,
                  },
                ])
              }
            >
              <Plus className="h-3.5 w-3.5" />
              <span>Add Image URL</span>
            </Button>
          </div>
        </div>

        {uploadWarning && (
          <p className="text-xs text-[#956A1C] bg-[#956A1C]/10 border border-[#956A1C]/30 rounded-[4px] p-2.5">
            {uploadWarning}
          </p>
        )}

        <div className="space-y-3">
          {images.map((img, idx) => (
            <div
              key={idx}
              className="rounded-[6px] border border-[#D6CBB9] bg-[#F7F3EA] p-3 grid grid-cols-1 sm:grid-cols-12 gap-3 items-center"
            >
              <div className="sm:col-span-6">
                <label className="block text-[11px] font-semibold text-[#1C1C19] mb-1">
                  Image URL *
                </label>
                <input
                  type="text"
                  required
                  value={img.url}
                  onChange={(e) => {
                    const next = [...images];
                    next[idx] = { ...next[idx], url: e.target.value };
                    setImages(next);
                  }}
                  className="w-full rounded-[4px] border border-[#D6CBB9] bg-white px-2.5 py-1.5 text-xs font-mono"
                />
              </div>

              <div className="sm:col-span-5">
                <label className="block text-[11px] font-semibold text-[#1C1C19] mb-1">
                  Alt Text (Required for WCAG Accessibility) *
                </label>
                <input
                  type="text"
                  required
                  value={img.alt}
                  onChange={(e) => {
                    const next = [...images];
                    next[idx] = { ...next[idx], alt: e.target.value };
                    setImages(next);
                  }}
                  className="w-full rounded-[4px] border border-[#D6CBB9] bg-white px-2.5 py-1.5 text-xs"
                />
              </div>

              <div className="sm:col-span-1 text-right">
                {images.length > 1 && (
                  <button
                    type="button"
                    onClick={() =>
                      setImages((prev) => prev.filter((_, i) => i !== idx))
                    }
                    className="p-1.5 text-[#9E3A32] hover:bg-[#9E3A32]/10 rounded-[4px]"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Optional Botanical Metadata & Batch Details */}
      <section className="rounded-[8px] border border-[#D6CBB9] bg-white p-6 space-y-4">
        <h2 className="font-serif text-xl text-[#1C1C19] border-b border-[#D6CBB9] pb-2">
          4. Optional Batch &amp; Botanical Metadata
        </h2>
        <p className="text-xs text-[#5F5B52]">
          Enter factual batch values only. Leave blank if not applicable. Never
          fabricate lab results or medical claims.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <label className="block text-xs font-semibold text-[#1C1C19] mb-1">
              Product Type Label
            </label>
            <input
              type="text"
              placeholder="e.g. Indoor Whole Flower"
              value={productTypeLabel}
              onChange={(e) => setProductTypeLabel(e.target.value)}
              className="w-full rounded-[6px] border border-[#D6CBB9] bg-white px-3 py-1.5 text-xs"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#1C1C19] mb-1">
              Batch Number
            </label>
            <input
              type="text"
              placeholder="e.g. HHC-FL-2026-10A"
              value={batchNumber}
              onChange={(e) => setBatchNumber(e.target.value)}
              className="w-full rounded-[6px] border border-[#D6CBB9] bg-white px-3 py-1.5 text-xs font-mono"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#1C1C19] mb-1">
              Weight / Volume Summary
            </label>
            <input
              type="text"
              placeholder="e.g. 1g / 3.5g / 5g"
              value={weightLabel}
              onChange={(e) => setWeightLabel(e.target.value)}
              className="w-full rounded-[6px] border border-[#D6CBB9] bg-white px-3 py-1.5 text-xs"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#1C1C19] mb-1">
              THC Content (Optional Factual Value)
            </label>
            <input
              type="text"
              value={thcContent}
              onChange={(e) => setThcContent(e.target.value)}
              className="w-full rounded-[6px] border border-[#D6CBB9] bg-white px-3 py-1.5 text-xs"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#1C1C19] mb-1">
              CBD Content (Optional Factual Value)
            </label>
            <input
              type="text"
              value={cbdContent}
              onChange={(e) => setCbdContent(e.target.value)}
              className="w-full rounded-[6px] border border-[#D6CBB9] bg-white px-3 py-1.5 text-xs"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#1C1C19] mb-1">
              External Lab Certificate URL (Optional)
            </label>
            <input
              type="text"
              value={labTestUrl}
              onChange={(e) => setLabTestUrl(e.target.value)}
              className="w-full rounded-[6px] border border-[#D6CBB9] bg-white px-3 py-1.5 text-xs"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#1C1C19] mb-1">
              Terpenes
            </label>
            <input
              type="text"
              value={terpenes}
              onChange={(e) => setTerpenes(e.target.value)}
              className="w-full rounded-[6px] border border-[#D6CBB9] bg-white px-3 py-1.5 text-xs"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#1C1C19] mb-1">
              Aromatic / Flavour Notes
            </label>
            <input
              type="text"
              value={flavourNotes}
              onChange={(e) => setFlavourNotes(e.target.value)}
              className="w-full rounded-[6px] border border-[#D6CBB9] bg-white px-3 py-1.5 text-xs"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#1C1C19] mb-1">
              Storage Notes
            </label>
            <input
              type="text"
              value={storageNotes}
              onChange={(e) => setStorageNotes(e.target.value)}
              className="w-full rounded-[6px] border border-[#D6CBB9] bg-white px-3 py-1.5 text-xs"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-3 border-t border-[#D6CBB9]">
          <div>
            <label className="block text-xs font-semibold text-[#1C1C19] mb-1">
              SEO Title
            </label>
            <input
              type="text"
              value={seoTitle}
              onChange={(e) => setSeoTitle(e.target.value)}
              className="w-full rounded-[6px] border border-[#D6CBB9] bg-white px-3 py-1.5 text-xs"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#1C1C19] mb-1">
              SEO Meta Description
            </label>
            <input
              type="text"
              value={seoDescription}
              onChange={(e) => setSeoDescription(e.target.value)}
              className="w-full rounded-[6px] border border-[#D6CBB9] bg-white px-3 py-1.5 text-xs"
            />
          </div>
        </div>
      </section>
    </form>
  );
}
