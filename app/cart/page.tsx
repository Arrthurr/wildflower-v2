"use client";

import { SignInButton, useAuth } from "@clerk/nextjs";
import { useMutation, useQuery } from "convex/react";
import Link from "next/link";
import { useState } from "react";
import { api } from "@/convex/_generated/api";
import type { Id } from "@/convex/_generated/dataModel";
import { formatCents } from "@/lib/money";
import { PageContainer } from "@/components/layout/page-container";
import { SiteFooter } from "@/components/layout/site-footer";
import { Button, buttonVariants } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";

function errorMessage(err: unknown): string {
  return err instanceof Error ? err.message : "Something went wrong.";
}

export default function CartPage() {
  const { isSignedIn, isLoaded } = useAuth();
  const items = useQuery(api.cartItems.listForUser);
  const updateQuantity = useMutation(api.cartItems.updateQuantity);
  const removeFromCart = useMutation(api.cartItems.removeFromCart);
  const clearCart = useMutation(api.cartItems.clearCart);

  const [pending, setPending] = useState<Set<Id<"cartItems">>>(new Set());
  const [lineErrors, setLineErrors] = useState<
    Record<Id<"cartItems">, string>
  >({} as Record<Id<"cartItems">, string>);
  const [clearing, setClearing] = useState(false);
  const [clearError, setClearError] = useState<string | null>(null);

  const itemCount = items?.reduce((acc, line) => acc + line.quantity, 0) ?? 0;
  const subtotal =
    items?.reduce((acc, line) => acc + line.quantity * line.unitPriceCents, 0) ??
    0;

  async function runLineMutation(
    cartItemId: Id<"cartItems">,
    fn: () => Promise<unknown>,
  ) {
    setPending((prev) => {
      const next = new Set(prev);
      next.add(cartItemId);
      return next;
    });
    setLineErrors((prev) => {
      if (!(cartItemId in prev)) return prev;
      const next = { ...prev };
      delete next[cartItemId];
      return next;
    });
    try {
      await fn();
    } catch (err) {
      setLineErrors((prev) => ({ ...prev, [cartItemId]: errorMessage(err) }));
    } finally {
      setPending((prev) => {
        const next = new Set(prev);
        next.delete(cartItemId);
        return next;
      });
    }
  }

  async function handleClearCart() {
    if (
      typeof window !== "undefined" &&
      !window.confirm("Clear your cart? This can't be undone.")
    ) {
      return;
    }
    setClearing(true);
    setClearError(null);
    try {
      await clearCart();
    } catch (err) {
      setClearError(errorMessage(err));
    } finally {
      setClearing(false);
    }
  }

  return (
    <>
    <div className="border-b border-outline-variant bg-surface-container py-margin-md">
      <PageContainer>
        <span className="mb-4 block text-label-caps tracking-widest text-tms-orange">MERCH</span>
        <h1 className="text-headline-lg-mobile text-primary sm:text-headline-lg">Cart</h1>
      </PageContainer>
    </div>
    <PageContainer className="py-margin-md">
      {!isLoaded ? (
        <p className="mt-6 text-sm text-on-surface-variant">Loading…</p>
      ) : !isSignedIn ? (
        <Card className="mt-8">
          <CardContent className="flex flex-col items-start gap-4 py-8">
            <p className="text-sm text-on-surface-variant">
              Sign in to view your cart and check out.
            </p>
            <SignInButton mode="modal">
              <Button>Sign in</Button>
            </SignInButton>
          </CardContent>
        </Card>
      ) : items === undefined ? (
        <p className="mt-6 text-sm text-on-surface-variant">Loading…</p>
      ) : items.length === 0 ? (
        <Card className="mt-8">
          <CardContent className="flex flex-col items-start gap-4 py-8">
            <p className="text-sm text-on-surface-variant">
              Your cart is empty.
            </p>
            <Link href="/shop" className={cn(buttonVariants({ variant: "brand" }))}>
              Browse the shop
            </Link>
          </CardContent>
        </Card>
      ) : (
        <div className="mt-8 grid gap-8 lg:grid-cols-[1fr_320px]">
          <div className="flex flex-col gap-3">
            <ul className="flex flex-col gap-3">
              {items.map((line) => {
                const isPending = pending.has(line._id);
                const error = lineErrors[line._id];
                return (
                  <li
                    key={line._id}
                    className="flex flex-col gap-2 rounded-lg border border-outline-variant bg-card p-4"
                  >
                    <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-medium">
                          {line.variantLabel ??
                            `Variant ${line.printfulVariantId}`}
                        </p>
                        <p className="text-xs text-on-surface-variant">
                          {formatCents(line.unitPriceCents)} each
                        </p>
                      </div>

                      <div className="flex items-center gap-2">
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          aria-label="Decrease quantity"
                          className="h-8 w-8 p-0"
                          disabled={isPending || line.quantity <= 1}
                          onClick={() =>
                            void runLineMutation(line._id, () =>
                              updateQuantity({
                                cartItemId: line._id,
                                quantity: line.quantity - 1,
                              }),
                            )
                          }
                        >
                          −
                        </Button>
                        <span className="w-8 text-center text-sm tabular-nums">
                          {line.quantity}
                        </span>
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          aria-label="Increase quantity"
                          className="h-8 w-8 p-0"
                          disabled={isPending}
                          onClick={() =>
                            void runLineMutation(line._id, () =>
                              updateQuantity({
                                cartItemId: line._id,
                                quantity: line.quantity + 1,
                              }),
                            )
                          }
                        >
                          +
                        </Button>
                      </div>

                      <div className="flex items-center justify-between gap-3 sm:w-40 sm:justify-end">
                        <span className="text-sm font-medium tabular-nums">
                          {formatCents(line.quantity * line.unitPriceCents)}
                        </span>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          className="text-destructive"
                          disabled={isPending}
                          onClick={() =>
                            void runLineMutation(line._id, () =>
                              removeFromCart({ cartItemId: line._id }),
                            )
                          }
                        >
                          Remove
                        </Button>
                      </div>
                    </div>

                    {error ? (
                      <p
                        role="alert"
                        className="text-xs text-destructive"
                      >
                        {error}
                      </p>
                    ) : null}
                  </li>
                );
              })}
            </ul>

            <div className="flex flex-col items-start gap-1">
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="text-muted-foreground"
                disabled={clearing}
                onClick={() => void handleClearCart()}
              >
                {clearing ? "Clearing…" : "Clear cart"}
              </Button>
              {clearError ? (
                <p role="alert" className="text-xs text-destructive">
                  {clearError}
                </p>
              ) : null}
            </div>
          </div>

          <aside className="lg:sticky lg:top-20 lg:self-start">
            <Card className="border-tms-orange/30 ring-1 ring-tms-orange/20">
              <CardContent className="py-6">
                <h2 className="text-base font-semibold">Order summary</h2>
                <div className="mt-4 flex justify-between text-sm">
                  <span className="text-on-surface-variant">Items</span>
                  <span>{itemCount}</span>
                </div>
                <Separator className="my-4" />
                <div className="flex justify-between text-base font-medium">
                  <span>Subtotal</span>
                  <span>{formatCents(subtotal)}</span>
                </div>
                <p className="mt-2 text-xs text-on-surface-variant">
                  Taxes and shipping calculated at checkout.
                </p>
                <Link
                  href="/checkout"
                  className={cn(buttonVariants({ variant: "brand" }), "mt-6 w-full justify-center")}
                >
                  Checkout
                </Link>
                <Link
                  href="/shop"
                  className={cn(
                    buttonVariants({ variant: "outline" }),
                    "mt-3 w-full justify-center",
                  )}
                >
                  Continue shopping
                </Link>
              </CardContent>
            </Card>
          </aside>
        </div>
      )}
    </PageContainer>
    <SiteFooter />
    </>
  );
}
