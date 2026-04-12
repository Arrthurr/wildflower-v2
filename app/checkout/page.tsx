"use client";

import { useAuth } from "@clerk/nextjs";
import { useQuery } from "convex/react";
import Link from "next/link";
import { useState } from "react";
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

  if (!isSignedIn) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-10">
        <h1 className="text-2xl font-semibold tracking-tight">Checkout</h1>
        <p className="mt-2 text-muted-foreground">Sign in to continue.</p>
      </div>
    );
  }

  const subtotal = summary?.subtotalCents ?? 0;
  const itemCount = summary?.itemCount ?? 0;

  return (
    <div className="mx-auto max-w-3xl px-4 py-10">
      <h1 className="text-2xl font-semibold tracking-tight">Checkout</h1>
      <p className="mt-2 text-muted-foreground">
        Pay securely with Polar. After payment, your order is sent to Printful for fulfillment.
      </p>

      <div className="mt-8 rounded-xl border bg-card p-6 shadow-sm">
        <div className="flex justify-between text-sm">
          <span className="text-muted-foreground">Items</span>
          <span>{itemCount}</span>
        </div>
        <Separator className="my-4" />
        <div className="flex justify-between text-base font-medium">
          <span>Subtotal</span>
          <span>{formatCents(subtotal)}</span>
        </div>
        <p className="mt-3 text-xs text-muted-foreground">
          Taxes and shipping are calculated at checkout. Configure a Polar product (fixed price
          overridden from your cart) and set{" "}
          <code className="rounded bg-muted px-1 py-0.5 text-[0.8rem]">POLAR_MERCH_PRODUCT_ID</code>{" "}
          in your environment.
        </p>
        {error ? (
          <p className="mt-4 text-sm text-destructive" role="alert">
            {error}
          </p>
        ) : null}
        <div className="mt-6 flex flex-col gap-3 sm:flex-row">
          <Button disabled={busy || itemCount === 0} onClick={() => void startCheckout()}>
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
    </div>
  );
}
