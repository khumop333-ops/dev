"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

const COOKIE_STORAGE_KEY = "hhc_cookie_consent_v1";

export function CookieBanner() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    try {
      const saved = window.localStorage.getItem(COOKIE_STORAGE_KEY);
      if (!saved) {
        setVisible(true);
      }
    } catch {
      // Ignore storage errors
    }
  }, []);

  const handleAccept = (choice: "essential" | "all") => {
    try {
      window.localStorage.setItem(COOKIE_STORAGE_KEY, choice);
    } catch {
      // Ignore
    }
    setVisible(false);
  };

  if (!visible) return null;

  return (
    <aside
      aria-label="Cookie and POPIA privacy notice"
      className="fixed bottom-0 inset-x-0 z-40 border-t border-[#D6CBB9] bg-[#F7F3EA] px-4 py-3.5 text-[#1C1C19] no-print"
    >
      <div className="mx-auto max-w-container flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <p className="text-xs text-[#5F5B52] leading-relaxed max-w-3xl">
          <strong className="text-[#1C1C19]">POPIA &amp; Cookie Notice:</strong>{" "}
          This site uses strictly necessary browser storage to remember your 18+
          age verification and reservation cart items. We do not use invasive
          third-party advertising trackers. Read our{" "}
          <Link href="/legal/cookies" className="underline text-[#23452F]">
            Cookie Policy
          </Link>{" "}
          and{" "}
          <Link href="/legal/privacy" className="underline text-[#23452F]">
            Privacy Notice
          </Link>
          .
        </p>
        <div className="flex items-center gap-2 shrink-0">
          <Button
            size="sm"
            variant="primary"
            onClick={() => handleAccept("essential")}
          >
            Acknowledge
          </Button>
        </div>
      </div>
    </aside>
  );
}
