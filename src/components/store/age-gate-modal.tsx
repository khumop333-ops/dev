"use client";

import React, { useEffect, useState } from "react";
import * as Dialog from "@radix-ui/react-dialog";
import { Button } from "@/components/ui/button";

const AGE_STORAGE_KEY = "hhc_age_verified_v1";

export function AgeGateModal({ brandName }: { brandName: string }) {
  const [open, setOpen] = useState(false);
  const [denied, setDenied] = useState(false);

  useEffect(() => {
    try {
      const stored = window.localStorage.getItem(AGE_STORAGE_KEY);
      if (stored !== "verified") {
        setOpen(true);
      }
    } catch {
      setOpen(true);
    }
  }, []);

  const handleConfirm = () => {
    try {
      window.localStorage.setItem(AGE_STORAGE_KEY, "verified");
      document.cookie = "hhc_age_verified=1; path=/; max-age=2592000; SameSite=Lax";
    } catch {
      // Ignore storage errors
    }
    setDenied(false);
    setOpen(false);
  };

  const handleDeny = () => {
    setDenied(true);
  };

  return (
    <Dialog.Root open={open}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-50 bg-[#1C1C19]/80" />
        <Dialog.Content
          onEscapeKeyDown={(e) => e.preventDefault()}
          onPointerDownOutside={(e) => e.preventDefault()}
          onInteractOutside={(e) => e.preventDefault()}
          className="fixed left-1/2 top-1/2 z-50 w-[92vw] max-w-lg -translate-x-1/2 -translate-y-1/2 rounded-[8px] border border-[#D6CBB9] bg-[#F7F3EA] p-6 sm:p-8 text-[#1C1C19] focus:outline-none"
          aria-describedby="age-gate-description"
        >
          <div className="border-b border-[#D6CBB9] pb-4 mb-5 flex items-center justify-between">
            <span className="text-xs uppercase tracking-[0.15em] text-[#5F5B52] font-medium">
              {brandName} • Pretoria, ZA
            </span>
            <span className="inline-block rounded-[4px] border border-[#23452F] bg-[#23452F] px-2 py-0.5 text-[11px] font-medium text-white">
              STRICTLY 18+
            </span>
          </div>

          <Dialog.Title className="font-serif text-2xl sm:text-3xl text-[#1C1C19] mb-3">
            Age Verification Required
          </Dialog.Title>

          {denied ? (
            <div
              role="alert"
              className="rounded-[6px] border border-[#9E3A32] bg-[#9E3A32]/10 p-4 text-sm text-[#9E3A32] space-y-2"
            >
              <p className="font-semibold">Access Restricted to Adults (18+)</p>
              <p>
                In accordance with South African regulations, no person under the
                age of 18 may browse, reserve, or purchase products from{" "}
                {brandName}.
              </p>
            </div>
          ) : (
            <>
              <Dialog.Description
                id="age-gate-description"
                className="text-sm text-[#5F5B52] leading-relaxed space-y-3 mb-6"
              >
                <p>
                  This website presents botanical preparations and accessories
                  intended strictly for adults aged{" "}
                  <strong className="text-[#1C1C19]">18 years and older</strong>{" "}
                  in the Republic of South Africa.
                </p>
                <p className="text-xs">
                  Valid photo identification (South African ID, passport, or
                  driver&apos;s licence) is required upon in-store collection or
                  local Pretoria delivery. Products are not presented as
                  registered medicines and do not diagnose, treat, cure, or
                  prevent disease.
                </p>
              </Dialog.Description>

              <div className="flex flex-col sm:flex-row gap-3">
                <Button
                  variant="primary"
                  size="lg"
                  className="flex-1"
                  onClick={handleConfirm}
                  data-testid="age-gate-confirm"
                >
                  I am 18 years or older — Enter
                </Button>
                <Button
                  variant="outline"
                  size="lg"
                  onClick={handleDeny}
                  data-testid="age-gate-deny"
                >
                  I am under 18
                </Button>
              </div>
            </>
          )}

          <p className="mt-5 text-[11px] text-[#5F5B52] border-t border-[#D6CBB9] pt-3">
            We store only a functional browser flag to remember your age-gate
            confirmation. See our{" "}
            <a href="/legal/privacy" className="underline text-[#23452F]">
              POPIA Privacy Notice
            </a>{" "}
            and{" "}
            <a href="/legal/age-policy" className="underline text-[#23452F]">
              18+ Age Policy
            </a>
            .
          </p>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
