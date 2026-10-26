import React from "react";
import { prisma } from "@/lib/prisma";
import { ContentPagesManager } from "@/components/admin/content-pages-manager";

export const dynamic = "force-dynamic";

export default async function AdminContentPages() {
  const pages = await prisma.contentPage.findMany({
    orderBy: { title: "asc" },
  });

  return (
    <div className="space-y-6">
      <div className="border-b border-[#D6CBB9] pb-4">
        <span className="text-xs font-semibold uppercase tracking-[0.15em] text-[#23452F]">
          CMS &amp; Legal Copy
        </span>
        <h1 className="font-serif text-3xl text-[#1C1C19] mt-1">
          Legal &amp; Policy Content ({pages.length})
        </h1>
        <p className="text-xs text-[#5F5B52] mt-1">
          Edit POPIA, PAIA, Terms, 18+ Age Policy, Responsible Use, Collection,
          and Returns pages in Markdown.
        </p>
      </div>

      <ContentPagesManager pages={pages} />
    </div>
  );
}
