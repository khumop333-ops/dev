"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { saveCategoryAction } from "@/server/actions/admin";
import { slugify } from "@/lib/utils";
import { Button } from "@/components/ui/button";

export interface CategoryRecord {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  imageUrl: string | null;
  sortOrder: number;
  active: boolean;
  _count?: { products: number };
}

export function CategoriesManager({
  categories,
}: {
  categories: CategoryRecord[];
}) {
  const router = useRouter();
  const [editingId, setEditingId] = useState<string | null>(null);
  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [description, setDescription] = useState("");
  const [imageUrl, setImageUrl] = useState("/images/demo/category-flower.svg");
  const [sortOrder, setSortOrder] = useState(categories.length + 1);
  const [active, setActive] = useState(true);
  const [saving, setSaving] = useState(false);
  const [feedback, setFeedback] = useState<string | null>(null);

  const loadForEdit = (cat: CategoryRecord) => {
    setEditingId(cat.id);
    setName(cat.name);
    setSlug(cat.slug);
    setDescription(cat.description || "");
    setImageUrl(cat.imageUrl || "/images/demo/category-flower.svg");
    setSortOrder(cat.sortOrder);
    setActive(cat.active);
    setFeedback(null);
  };

  const resetForm = () => {
    setEditingId(null);
    setName("");
    setSlug("");
    setDescription("");
    setImageUrl("/images/demo/category-flower.svg");
    setSortOrder(categories.length + 1);
    setActive(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setFeedback(null);

    const res = await saveCategoryAction(editingId, {
      name,
      slug,
      description,
      imageUrl,
      sortOrder,
      active,
    });

    setSaving(false);
    if (!res.ok) {
      setFeedback(res.error || "Failed to save category");
      return;
    }

    setFeedback("Category saved.");
    resetForm();
    router.refresh();
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
      <div className="lg:col-span-7 rounded-[8px] border border-[#D6CBB9] bg-white overflow-x-auto">
        <table className="w-full text-left text-xs">
          <thead className="bg-[#E7DECF]/60 border-b border-[#D6CBB9] text-[#5F5B52]">
            <tr>
              <th className="py-3 px-4 font-medium">Order</th>
              <th className="py-3 px-4 font-medium">Category</th>
              <th className="py-3 px-4 font-medium">Products</th>
              <th className="py-3 px-4 font-medium">Status</th>
              <th className="py-3 px-4 font-medium text-right">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#D6CBB9]">
            {categories.map((cat) => (
              <tr key={cat.id}>
                <td className="py-3 px-4 font-mono">{cat.sortOrder}</td>
                <td className="py-3 px-4">
                  <p className="font-semibold text-[#1C1C19]">{cat.name}</p>
                  <p className="text-[#5F5B52] font-mono text-[11px]">
                    /collections/{cat.slug}
                  </p>
                </td>
                <td className="py-3 px-4 text-[#5F5B52]">
                  {cat._count?.products ?? 0}
                </td>
                <td className="py-3 px-4">
                  <span className="rounded-[4px] border border-[#D6CBB9] bg-[#F7F3EA] px-2 py-0.5 text-[11px]">
                    {cat.active ? "Active" : "Hidden"}
                  </span>
                </td>
                <td className="py-3 px-4 text-right">
                  <button
                    type="button"
                    onClick={() => loadForEdit(cat)}
                    className="text-[#23452F] underline font-medium"
                  >
                    Edit
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <form
        onSubmit={handleSubmit}
        className="lg:col-span-5 rounded-[8px] border border-[#D6CBB9] bg-white p-6 space-y-4"
      >
        <div className="flex items-center justify-between border-b border-[#D6CBB9] pb-3">
          <h2 className="font-serif text-xl text-[#1C1C19]">
            {editingId ? "Edit Category" : "Create Category"}
          </h2>
          {editingId && (
            <button
              type="button"
              onClick={resetForm}
              className="text-xs text-[#5F5B52] underline"
            >
              Cancel Edit
            </button>
          )}
        </div>

        {feedback && (
          <p className="rounded-[4px] border border-[#D6CBB9] bg-[#F7F3EA] p-2.5 text-xs text-[#1C1C19]">
            {feedback}
          </p>
        )}

        <div>
          <label className="block text-xs font-semibold text-[#1C1C19] mb-1">
            Category Name *
          </label>
          <input
            type="text"
            required
            value={name}
            onChange={(e) => {
              setName(e.target.value);
              if (!editingId) setSlug(slugify(e.target.value));
            }}
            className="w-full rounded-[6px] border border-[#D6CBB9] bg-white px-3 py-1.5 text-xs"
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-[#1C1C19] mb-1">
            Slug *
          </label>
          <input
            type="text"
            required
            value={slug}
            onChange={(e) => setSlug(e.target.value)}
            className="w-full rounded-[6px] border border-[#D6CBB9] bg-white px-3 py-1.5 text-xs font-mono"
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-[#1C1C19] mb-1">
            Description
          </label>
          <textarea
            rows={2}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="w-full rounded-[6px] border border-[#D6CBB9] bg-white px-3 py-1.5 text-xs"
          />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-semibold text-[#1C1C19] mb-1">
              Sort Order
            </label>
            <input
              type="number"
              value={sortOrder}
              onChange={(e) =>
                setSortOrder(Number.parseInt(e.target.value || "0", 10))
              }
              className="w-full rounded-[6px] border border-[#D6CBB9] bg-white px-3 py-1.5 text-xs"
            />
          </div>

          <div className="flex items-end pb-1.5">
            <label className="inline-flex items-center gap-2 text-xs">
              <input
                type="checkbox"
                checked={active}
                onChange={(e) => setActive(e.target.checked)}
                className="h-4 w-4 accent-[#23452F]"
              />
              <span>Active on Menu</span>
            </label>
          </div>
        </div>

        <Button type="submit" variant="primary" size="md" disabled={saving}>
          {saving
            ? "Saving..."
            : editingId
            ? "Update Category"
            : "Create Category"}
        </Button>
      </form>
    </div>
  );
}
