import React from "react";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getStoreSettings } from "@/lib/settings";
import { MarkdownContent } from "@/components/ui/markdown-content";
import { formatDateSAST } from "@/lib/utils";

export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
}: {
  params: { slug: string };
}): Promise<Metadata> {
  const page = await prisma.contentPage.findUnique({
    where: { slug: params.slug },
  });

  if (!page || !page.published) {
    return { title: "Document Not Found" };
  }

  return {
    title: page.seoTitle || page.title,
    description: page.seoDescription || `${page.title} policy document.`,
  };
}

export default async function LegalContentPage({
  params,
}: {
  params: { slug: string };
}) {
  const [siteConfig, page, allPages] = await Promise.all([
    getStoreSettings(),
    prisma.contentPage.findUnique({
      where: { slug: params.slug },
    }),
    prisma.contentPage.findMany({
      where: { published: true },
      orderBy: { title: "asc" },
      select: { id: true, slug: true, title: true },
    }),
  ]);

  if (!page || !page.published) {
    notFound();
  }

  return (
    <div className="mx-auto max-w-container px-4 sm:px-6 lg:px-8 py-12 lg:py-16">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Sidebar Navigation of Legal Documents */}
        <aside className="lg:col-span-4 space-y-4">
          <div className="rounded-[8px] border border-[#D6CBB9] bg-[#E7DECF]/50 p-5">
            <h2 className="font-serif text-lg text-[#1C1C19] border-b border-[#D6CBB9] pb-3 mb-3">
              Store Policies &amp; Legal
            </h2>
            <nav aria-label="Legal policies" className="flex flex-col space-y-1">
              {allPages.map((p) => {
                const active = p.slug === page.slug;
                return (
                  <Link
                    key={p.id}
                    href={`/legal/${p.slug}`}
                    className={
                      active
                        ? "rounded-[4px] bg-[#23452F] px-3 py-2 text-xs font-medium text-white"
                        : "rounded-[4px] px-3 py-2 text-xs text-[#1C1C19] hover:bg-[#D6CBB9]/40"
                    }
                  >
                    {p.title}
                  </Link>
                );
              })}
            </nav>
          </div>

          <div className="rounded-[8px] border border-[#956A1C]/40 bg-[#956A1C]/10 p-4 text-xs text-[#956A1C]">
            <strong>Attorney Review Notice:</strong>{" "}
            {siteConfig.legalReviewWarning}
          </div>
        </aside>

        {/* Main Policy Document */}
        <article className="lg:col-span-8 rounded-[8px] border border-[#D6CBB9] bg-white p-6 sm:p-10 space-y-6">
          <header className="border-b border-[#D6CBB9] pb-5 space-y-2">
            <span className="text-xs font-semibold uppercase tracking-[0.15em] text-[#23452F]">
              {siteConfig.brandName} • Policy Document
            </span>
            <h1 className="font-serif text-3xl sm:text-4xl text-[#1C1C19]">
              {page.title}
            </h1>
            <p className="text-xs text-[#5F5B52]">
              Last updated: {formatDateSAST(page.updatedAt, false)}
            </p>
          </header>

          <MarkdownContent content={page.bodyMarkdown} />
        </article>
      </div>
    </div>
  );
}
