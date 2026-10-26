"use client";

import React, { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export function AdminLoginForm({ brandName }: { brandName: string }) {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const res = await signIn("credentials", {
        redirect: false,
        email,
        password,
      });

      if (res?.error) {
        setError(res.error);
        setLoading(false);
        return;
      }

      router.push("/admin");
      router.refresh();
    } catch {
      setError("Authentication failed. Please check your credentials.");
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#F7F3EA] px-4 py-12">
      <div className="w-full max-w-md rounded-[8px] border border-[#D6CBB9] bg-white p-8 space-y-6">
        <div className="border-b border-[#D6CBB9] pb-4">
          <span className="text-xs font-semibold uppercase tracking-[0.15em] text-[#23452F]">
            Staff &amp; Admin Portal
          </span>
          <h1 className="font-serif text-3xl text-[#1C1C19] mt-1">
            {brandName}
          </h1>
          <p className="text-xs text-[#5F5B52] mt-1">
            Sign in with your authorised dispensary staff credentials.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div aria-live="assertive">
            {error && (
              <div
                role="alert"
                data-testid="admin-login-error"
                className="rounded-[6px] border border-[#9E3A32] bg-[#9E3A32]/10 p-3 text-xs text-[#9E3A32]"
              >
                {error}
              </div>
            )}
          </div>

          <div>
            <label
              htmlFor="admin-email"
              className="block text-xs font-semibold uppercase tracking-wider text-[#1C1C19] mb-1.5"
            >
              Email Address
            </label>
            <input
              id="admin-email"
              type="email"
              required
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="admin@highveldherbal.co.za"
              className="w-full rounded-[6px] border border-[#D6CBB9] bg-white px-3 py-2 text-sm text-[#1C1C19]"
            />
          </div>

          <div>
            <label
              htmlFor="admin-password"
              className="block text-xs font-semibold uppercase tracking-wider text-[#1C1C19] mb-1.5"
            >
              Password
            </label>
            <input
              id="admin-password"
              type="password"
              required
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full rounded-[6px] border border-[#D6CBB9] bg-white px-3 py-2 text-sm text-[#1C1C19]"
            />
          </div>

          <Button
            type="submit"
            variant="primary"
            size="lg"
            disabled={loading}
            data-testid="admin-login-submit"
            className="w-full"
          >
            {loading ? "Signing in..." : "Sign In to Admin Portal"}
          </Button>
        </form>

        <div className="border-t border-[#D6CBB9] pt-4 flex items-center justify-between text-xs text-[#5F5B52]">
          <Link href="/" className="hover:text-[#23452F] underline">
            ← Return to Public Storefront
          </Link>
          <span>Pretoria, ZA</span>
        </div>
      </div>
    </div>
  );
}
