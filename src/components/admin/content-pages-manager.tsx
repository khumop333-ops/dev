"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { saveContentPageAction } from "@/server/actions/admin";
import { Button } from "@/components/ui/button";

export interface ContentPageRow {
  id: string;
  slug: string;
  title: string;
  bodyMarkdown: string;
  published: boolean;
  seoTitle: string | null;
  seoDescription: string | null;
  updatedAt: Date | string;
}

export function ContentPagesManager({ pages }: { pages: ContentPageRow[] }) {
  const router = useRouter();
  const [selected, setSelected] = useState<ContentPageRow | null>(
    pages[0] ?? null
  );
  const [title, setTitle] = useState(pages[0]?.title || "");
  const [slug, setSlug] = useState(pages[0]?.slug || "");
  const [bodyMarkdown, setBodyMarkdown] = useState(
    pages[0]?.bodyMarkdown || ""
  );
  const [published, setPublished] = useState(pages[0]?.published ?? true);
  const [seoTitle, setSeoTitle] = useState(pages[0]?.seoTitle || "");
  const [seoDescription, setSeoDescription] = useState(
    pages[0]?.seoDescription || ""
  );

  const [saving, setSaving] = useState(false);
  const [feedback, setFeedback] = useState<string | null>(null);

  const handleSelect = (p: ContentPageRow) => {
    setSelected(p);
    setTitle(p.title);
    setSlug(p.slug);
    setBodyMarkdown(p.bodyMarkdown);
    setPublished(p.published);
    setSeoTitle(p.seoTitle || "");
    setSeoDescription(p.seoDescription || "");
    setFeedback(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selected) return;
    setSaving(true);
    setFeedback(null);

    const res = await saveContentPageAction(selected.id, {
      slug,
      title,
      bodyMarkdown,
      published,
      seoTitle,
      seoDescription,
    });

    setSaving(false);
    if (!res.ok) {
      setFeedback(res.error || "Failed to save content page");
      return;
    }

    setFeedback("Legal / content page updated.");
    router.refresh();
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
      <aside className="lg:col-span-4 rounded-[8px] border border-[#D6CBB9] bg-white p-4 space-y-1">
        <h2 className="font-serif text-lg text-[#1C1C19] border-b border-[#D6CBB9] pb-2 mb-2">
          Legal &amp; Policy Pages
        </h2>
        {pages.map((p) => {
          const isCurrent = selected?.id === p.id;
          return (
            <button
              key={p.id}
              type="button"
              onClick={() => handleSelect(p)}
              className={
                isCurrent
                  ? "w-full text-left rounded-[4px] bg-[#23452F] px-3 py-2 text-xs font-medium text-white"
                  : "w-full text-left rounded-[4px] px-3 py-2 text-xs text-[#1C1C19] hover:bg-[#F7F3EA]"
              }
            >
              <span className="block">{p.title}</span>
              <span className="block text-[10px] opacity-75 font-mono">
                /legal/{p.slug}
              </span>
            </button>
          );
        })}
      </aside>

      {selected && (
        <form
          onSubmit={handleSubmit}
          className="lg:col-span-8 rounded-[8px] border border-[#D6CBB9] bg-white p-6 space-y-4"
        >
          <div className="flex items-center justify-between border-b border-[#D6CBB9] pb-3">
            <div>
              <h2 className="font-serif text-2xl text-[#1C1C19]">
                Edit: {selected.title}
              </h2>
              <Link
                href={`/legal/${selected.slug}`}
                target="_blank"
                className="text-xs text-[#23452F] underline"
              >
                Preview /legal/{selected.slug} ↗
              </Link>
            </div>
            <Button type="submit" variant="primary" size="md" disabled={saving}>
              {saving ? "Saving..." : "Save Document"}
            </Button>
          </div>

          {feedback && (
            <p className="rounded-[4px] border border-[#2F6B4F] bg-[#2F6B4F]/10 p-3 text-xs text-[#2F6B4F] font-medium">
              {feedback}
            </p>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-[#1C1C19] mb-1">
                Document Title *
              </label>
              <input
                type="text"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full rounded-[6px] border border-[#D6CBB9] bg-white px-3 py-1.5 text-xs"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#1C1C19] mb-1">
                URL Slug *
              </label>
              <input
                type="text"
                required
                value={slug}
                onChange={(e) => setSlug(e.target.value)}
                className="w-full rounded-[6px] border border-[#D6CBB9] bg-white px-3 py-1.5 text-xs font-mono"
              />
            </div>
          </div>

          <label className="inline-flex items-center gap-2 text-xs">
            <input
              type="checkbox"
              checked={published}
              onChange={(e) => setPublished(e.target.checked)}
              className="h-4 w-4 accent-[#23452F]"
            />
            <span>Published publicly</span>
          </label>

          <div>
            <label className="block text-xs font-semibold text-[#1C1C19] mb-1">
              Markdown Body (Sanitised on Render) *
            </label>
            <textarea
              rows={16}
              required
              value={bodyMarkdown}
              onChange={(e) => setBodyMarkdown(e.target.value)}
              className="w-full rounded-[6px] border border-[#D6CBB9] bg-white px-3 py-2 text-xs font-mono leading-relaxed"
            />
          </div>
        </form>
      )}
    </div>
  );
}
