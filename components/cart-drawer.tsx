"use client";

import { SignInButton, useAuth } from "@clerk/nextjs";
import { useMutation, useQuery } from "convex/react";
import Link from "next/link";
import { api } from "@/convex/_generated/api";
import type { Doc } from "@/convex/_generated/dataModel";
import { formatCents } from "@/lib/money";
import { Badge } from "@/components/ui/badge";
import { Button, buttonVariants } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Separator } from "@/components/ui/separator";
import { ShoppingCartIcon } from "lucide-react";
import { cn } from "@/lib/utils";

export function CartDrawer() {
  const { isSignedIn } = useAuth();
  const summary = useQuery(api.cartItems.summary);
  const items = useQuery(api.cartItems.listForUser);
  const updateQuantity = useMutation(api.cartItems.updateQuantity);
  const removeFromCart = useMutation(api.cartItems.removeFromCart);

  const count = summary?.itemCount ?? 0;
  const subtotal = summary?.subtotalCents ?? 0;

  return (
    <Sheet>
      <SheetTrigger
        className={cn(
          buttonVariants({ variant: "outline", size: "sm" }),
          "relative gap-2",
        )}
      >
        <ShoppingCartIcon className="size-4" />
        Cart
        {count > 0 ? (
          <Badge className="absolute -right-2 -top-2 h-5 min-w-5 justify-center px-1 text-[10px]">
            {count > 99 ? "99+" : count}
          </Badge>
        ) : null}
      </SheetTrigger>
      <SheetContent side="right" className="flex w-full flex-col sm:max-w-md">
        <SheetHeader>
          <SheetTitle>Cart</SheetTitle>
        </SheetHeader>

        {!isSignedIn ? (
          <div className="mt-6 space-y-4 text-sm">
            <p className="text-muted-foreground">
              Sign in to view your cart and check out.
            </p>
            <SignInButton mode="modal">
              <Button className="w-full">Sign in</Button>
            </SignInButton>
          </div>
        ) : items === undefined ? (
          <p className="mt-6 text-sm text-muted-foreground">Loading…</p>
        ) : items.length === 0 ? (
          <p className="mt-6 text-sm text-muted-foreground">
            Your cart is empty. Browse the{" "}
            <Link href="/shop" className="text-primary underline">
              shop
            </Link>
            .
          </p>
        ) : (
          <div className="mt-4 flex min-h-0 flex-1 flex-col gap-3 overflow-y-auto pr-1">
            {items.map((line: Doc<"cartItems">) => (
              <div
                key={line._id}
                className="flex flex-col gap-2 rounded-lg border border-border p-3"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium">
                      {line.variantLabel ?? `Variant ${line.printfulVariantId}`}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {formatCents(line.unitPriceCents)} each
                    </p>
                  </div>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="shrink-0 text-destructive"
                    onClick={() => void removeFromCart({ cartItemId: line._id })}
                  >
                    Remove
                  </Button>
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    size="icon-sm"
                    className="h-8 w-8"
                    onClick={() =>
                      void updateQuantity({
                        cartItemId: line._id,
                        quantity: line.quantity - 1,
                      })
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
                    size="icon-sm"
                    className="h-8 w-8"
                    onClick={() =>
                      void updateQuantity({
                        cartItemId: line._id,
                        quantity: line.quantity + 1,
                      })
                    }
                  >
                    +
                  </Button>
                  <span className="ml-auto text-sm font-medium">
                    {formatCents(line.quantity * line.unitPriceCents)}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}

        {isSignedIn && items && items.length > 0 ? (
          <>
            <Separator className="my-2" />
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Subtotal</span>
              <span className="font-semibold">{formatCents(subtotal)}</span>
            </div>
            <SheetFooter className="gap-2 sm:flex-col">
              <Link
                href="/checkout"
                className={cn(buttonVariants(), "w-full justify-center")}
              >
                Checkout
              </Link>
              <Link
                href="/shop"
                className={cn(
                  buttonVariants({ variant: "outline" }),
                  "w-full justify-center",
                )}
              >
                Continue shopping
              </Link>
            </SheetFooter>
          </>
        ) : null}
      </SheetContent>
    </Sheet>
  );
}
