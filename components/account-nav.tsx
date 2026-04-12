"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

const links = [
  { href: "/account", label: "Overview" },
  { href: "/account/profile", label: "Profile" },
  { href: "/account/orders", label: "Orders" },
] as const;

export function AccountNav() {
  const pathname = usePathname();

  return (
    <nav
      className="flex flex-wrap gap-2 border-b border-border pb-4 md:flex-col md:gap-0 md:border-b-0 md:border-r md:pb-0 md:pr-6"
      aria-label="Account"
    >
      {links.map(({ href, label }) => {
        const active =
          href === "/account"
            ? pathname === "/account"
            : pathname === href || pathname.startsWith(`${href}/`);
        return (
          <Link
            key={href}
            href={href}
            className={cn(
              "rounded-md px-3 py-2 text-sm font-medium transition-colors",
              active
                ? "bg-muted text-foreground"
                : "text-muted-foreground hover:bg-muted/60 hover:text-foreground",
            )}
          >
            {label}
          </Link>
        );
      })}
    </nav>
  );
}
