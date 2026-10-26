"use client";

import React from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="min-h-[65vh] flex items-center justify-center px-4 py-16 bg-[#F7F3EA]">
      <div className="max-w-md w-full rounded-[8px] border border-[#D6CBB9] bg-white p-8 text-center space-y-4">
        <span className="inline-block rounded-[4px] border border-[#9E3A32]/30 bg-[#9E3A32]/10 px-2.5 py-1 text-xs font-medium text-[#9E3A32]">
          Application Error
        </span>
        <h1 className="font-serif text-2xl text-[#1C1C19]">
          Something went wrong
        </h1>
        <p className="text-xs text-[#5F5B52] leading-relaxed">
          {error.message ||
            "An unexpected issue occurred while loading this page."}
        </p>
        <div className="flex items-center justify-center gap-3 pt-2">
          <Button variant="primary" size="md" onClick={() => reset()}>
            Try Again
          </Button>
          <Link
            href="/"
            className="inline-flex rounded-[6px] border border-[#D6CBB9] bg-[#F7F3EA] px-4 py-2.5 text-sm font-medium text-[#1C1C19]"
          >
            Return Home
          </Link>
        </div>
      </div>
    </div>
  );
}
