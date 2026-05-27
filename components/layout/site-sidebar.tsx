"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { SignInButton, UserButton, useAuth } from "@clerk/nextjs";
import { CartDrawer } from "@/components/cart-drawer";
import { MaterialIcon } from "@/components/ui/material-icon";
import { Button } from "@/components/ui/button";
import { BRAND_ASSETS } from "@/lib/brand";
import { FLAGSHIP_SHOW } from "@/lib/shows";
import { cn } from "@/lib/utils";

const NAV = [
  { href: "/shows", label: "Shows", icon: "podcasts" as const },
  { href: "/shop", label: "Merch", icon: "shopping_bag" as const },
  { href: "/about", label: "About", icon: "info" as const },
  { href: "/sponsor", label: "Sponsor", icon: "campaign" as const },
] as const;

function NavLink({
  href,
  label,
  icon,
  onNavigate,
}: {
  href: string;
  label: string;
  icon: string;
  onNavigate?: () => void;
}) {
  const pathname = usePathname();
  const active =
    href === "/shows"
      ? pathname === "/shows" || pathname.startsWith("/shows/")
      : pathname === href || pathname.startsWith(`${href}/`);

  return (
    <Link
      href={href}
      onClick={onNavigate}
      className={cn(
        "flex items-center gap-3 text-ui-medium transition-all",
        active
          ? "font-bold text-tms-orange"
          : "text-primary hover:text-tms-orange",
      )}
    >
      <MaterialIcon name={icon} className="text-xl" />
      {label}
    </Link>
  );
}

export function SiteSidebarContent({ onNavigate }: { onNavigate?: () => void }) {
  const { isSignedIn, isLoaded } = useAuth();

  return (
    <>
      <div className="p-8">
        <Link href="/" className="mb-12 flex items-center" onClick={onNavigate}>
          <Image
            src={BRAND_ASSETS.wildflowerLockup}
            alt="wildflower"
            width={160}
            height={32}
            className="h-8 w-auto object-contain"
            priority
          />
        </Link>
        <nav className="flex flex-col space-y-6" aria-label="Main">
          {NAV.map((item) => (
            <NavLink key={item.href} {...item} onNavigate={onNavigate} />
          ))}
          <button
            type="button"
            disabled
            aria-disabled
            className="flex cursor-not-allowed items-center gap-3 text-ui-medium text-primary/50"
            title="Search coming soon"
          >
            <MaterialIcon name="search" className="text-xl" />
            Search
          </button>
        </nav>
      </div>
      <div className="mt-auto space-y-4 border-t border-outline-variant p-8">
        <div className="flex flex-wrap items-center gap-2">
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
            <>
              <Link
                href="/account"
                onClick={onNavigate}
                className="text-sm font-medium text-primary hover:text-tms-orange"
              >
                Account
              </Link>
              <UserButton />
            </>
          )}
        </div>
        <a
          href={FLAGSHIP_SHOW.firesideSiteUrl}
          target="_blank"
          rel="noreferrer"
          className="block w-full rounded-lg bg-sof-navy px-4 py-3 text-center text-ui-medium text-white shadow-sm transition-all hover:opacity-90"
          aria-label={`Subscribe to ${FLAGSHIP_SHOW.title} on Fireside`}
        >
          Subscribe
        </a>
      </div>
    </>
  );
}

export function SiteSidebar() {
  return (
    <aside className="z-50 hidden h-full w-64 shrink-0 flex-col border-r border-outline-variant bg-surface-container-low lg:flex">
      <SiteSidebarContent />
    </aside>
  );
}
