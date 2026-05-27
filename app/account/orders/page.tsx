"use client";

import { useQuery } from "convex/react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useEffect, useState } from "react";
import { api } from "@/convex/_generated/api";
import type { Doc } from "@/convex/_generated/dataModel";
import { formatCents } from "@/lib/money";
import { labelOrderStatus } from "@/lib/order-status";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const CHECKOUT_THANKS_DISMISS_MS = 12_000;

function AccountOrdersContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const checkoutId = searchParams.get("checkout_id");
  const [showCheckoutThanks, setShowCheckoutThanks] = useState(
    () => checkoutId != null,
  );
  const orders = useQuery(api.orders.listForUser);

  useEffect(() => {
    if (!checkoutId) return;
    router.replace("/account/orders", { scroll: false });
  }, [checkoutId, router]);

  // After the URL is cleaned, dismiss the banner (setState in timer callback, not sync in effect).
  useEffect(() => {
    if (checkoutId != null || !showCheckoutThanks) return;
    const timer = window.setTimeout(
      () => setShowCheckoutThanks(false),
      CHECKOUT_THANKS_DISMISS_MS,
    );
    return () => window.clearTimeout(timer);
  }, [checkoutId, showCheckoutThanks]);

  if (orders === undefined) {
    return <p className="text-sm text-muted-foreground">Loading…</p>;
  }

  return (
    <div>
      {showCheckoutThanks ? (
        <div
          className="mb-6 flex items-start justify-between gap-3 rounded-md border border-outline-variant bg-surface-container-low px-4 py-3 text-sm text-primary"
          role="status"
        >
          <p>
            Thanks — your payment went through. Your order will appear below as soon as it&apos;s
            recorded (usually within a few seconds).
          </p>
          <button
            type="button"
            className="shrink-0 text-on-surface-variant hover:text-primary"
            aria-label="Dismiss thank-you message"
            onClick={() => setShowCheckoutThanks(false)}
          >
            ×
          </button>
        </div>
      ) : null}
      <h2 className="text-lg font-semibold tracking-tight">Orders</h2>
      <p className="mt-1 text-sm text-muted-foreground">
        Orders appear here after checkout. Fulfillment is sent to Printful automatically.
      </p>

      {orders.length === 0 ? (
        <p className="mt-8 text-sm text-muted-foreground">
          No orders yet.{" "}
          <Link href="/shop" className="text-primary underline-offset-4 hover:underline">
            Browse the shop
          </Link>
          .
        </p>
      ) : (
        <ul className="mt-8 flex flex-col gap-4">
          {orders.map((o: Doc<"orders">) => (
            <li key={o._id}>
              <Link href={`/account/orders/${o._id}`} className="block rounded-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">
                <Card className="transition-colors hover:bg-muted/40">
                  <CardHeader className="flex flex-row items-center justify-between gap-2 space-y-0 pb-2">
                    <CardTitle className="text-base font-medium">
                      {new Date(o.createdAt).toLocaleString()}
                    </CardTitle>
                    <Badge variant="secondary">{labelOrderStatus(o.status)}</Badge>
                  </CardHeader>
                  <CardContent className="text-sm text-muted-foreground">
                    <p>Total {formatCents(o.totalCents)}</p>
                    {o.printfulOrderId ? (
                      <p className="mt-1">Printful #{o.printfulOrderId}</p>
                    ) : null}
                    {o.lastFulfillmentError ? (
                      <p className="mt-2 text-destructive">{o.lastFulfillmentError}</p>
                    ) : null}
                    <p className="mt-3 text-primary">View details →</p>
                  </CardContent>
                </Card>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export default function AccountOrdersPage() {
  return (
    <Suspense fallback={<p className="text-sm text-muted-foreground">Loading…</p>}>
      <AccountOrdersContent />
    </Suspense>
  );
}
