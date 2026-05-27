"use client";

import { useAuth } from "@clerk/nextjs";
import { useQuery } from "convex/react";
import Link from "next/link";
import { useState } from "react";
import { PageContainer } from "@/components/layout/page-container";
import { SiteFooter } from "@/components/layout/site-footer";
import { api } from "@/convex/_generated/api";
import { formatCents } from "@/lib/money";
import { Button, buttonVariants } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";

export default function CheckoutPage() {
  const { isSignedIn } = useAuth();
  const summary = useQuery(api.cartItems.summary);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function startCheckout() {
    setError(null);
    setBusy(true);
    try {
      const res = await fetch("/api/checkout", { method: "POST", redirect: "manual" });
      if (res.status === 302 || res.status === 307) {
        const loc = res.headers.get("Location");
        if (loc) {
          window.location.href = loc;
          return;
        }
      }
      const text = await res.text();
      setError(text || `Checkout failed (${res.status})`);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Checkout failed");
    } finally {
      setBusy(false);
    }
  }

  const content = !isSignedIn ? (
    <>
      <h1 className="text-headline-lg-mobile text-primary sm:text-2xl">Checkout</h1>
      <p className="mt-2 text-on-surface-variant">Sign in to continue.</p>
    </>
  ) : (
    <>
      <span className="mb-4 block text-label-caps tracking-widest text-tms-orange">MERCH</span>
      <h1 className="text-headline-lg-mobile text-primary sm:text-2xl">Checkout</h1>
      <p className="mt-2 text-on-surface-variant">
        Pay securely with Polar. After payment, your order is sent to Printful for fulfillment.
      </p>
      <div className="mt-8 rounded-xl border border-tms-orange/30 bg-card p-6 shadow-sm ring-1 ring-tms-orange/20">
        <div className="flex justify-between text-sm">
          <span className="text-on-surface-variant">Items</span>
          <span>{summary?.itemCount ?? 0}</span>
        </div>
        <Separator className="my-4" />
        <div className="flex justify-between text-base font-medium text-primary">
          <span>Subtotal</span>
          <span>{formatCents(summary?.subtotalCents ?? 0)}</span>
        </div>
        <p className="mt-3 text-xs text-on-surface-variant">
          Taxes and shipping are calculated at checkout. Configure a Polar product and set{" "}
          <code className="rounded bg-muted px-1 py-0.5 text-[0.8rem]">
            POLAR_MERCH_PRODUCT_ID
          </code>{" "}
          in your environment.
        </p>
        {error ? (
          <p className="mt-4 text-sm text-destructive" role="alert">
            {error}
          </p>
        ) : null}
        <div className="mt-6 flex flex-col gap-3 sm:flex-row">
          <Button
            variant="brand"
            disabled={busy || (summary?.itemCount ?? 0) === 0}
            onClick={() => void startCheckout()}
          >
            {busy ? "Redirecting…" : "Continue to payment"}
          </Button>
          <Link
            href="/shop"
            className={cn(
              buttonVariants({ variant: "outline" }),
              busy && "pointer-events-none opacity-50",
            )}
          >
            Back to shop
          </Link>
        </div>
      </div>
    </>
  );

  return (
    <>
      <PageContainer className="max-w-3xl py-margin-md">{content}</PageContainer>
      <SiteFooter />
    </>
  );
}
