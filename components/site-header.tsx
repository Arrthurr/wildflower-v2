"use client";

import Link from "next/link";
import { SignInButton, UserButton, useAuth } from "@clerk/nextjs";
import { CartDrawer } from "@/components/cart-drawer";
import { Button } from "@/components/ui/button";

export function SiteHeader() {
  const { isSignedIn, isLoaded } = useAuth();

  return (
    <header className="border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="mx-auto flex h-14 max-w-5xl items-center justify-between gap-4 px-4">
        <Link href="/" className="font-semibold tracking-tight">
          Wildflower Media
        </Link>
        <nav className="flex items-center gap-2 text-sm">
          <Link
            href="/shows"
            className="text-muted-foreground hover:text-foreground"
          >
            Shows
          </Link>
          <Link
            href="/shop"
            className="text-muted-foreground hover:text-foreground"
          >
            Shop
          </Link>
          <Link
            href="/about"
            className="text-muted-foreground hover:text-foreground"
          >
            About
          </Link>
          <Link
            href="/sponsor"
            className="text-muted-foreground hover:text-foreground"
          >
            Sponsor
          </Link>
          {isLoaded && isSignedIn ? (
            <Link
              href="/account"
              className="text-muted-foreground hover:text-foreground"
            >
              Account
            </Link>
          ) : null}
          <CartDrawer />
          {!isLoaded ? (
            <span className="inline-block h-8 w-16 rounded-md bg-muted" />
          ) : !isSignedIn ? (
            <SignInButton mode="modal">
              <Button variant="outline" size="sm">
                Sign in
              </Button>
            </SignInButton>
          ) : (
            <UserButton />
          )}
        </nav>
      </div>
    </header>
  );
}
