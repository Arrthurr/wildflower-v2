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
      className="flex flex-wrap gap-2 border-b border-outline-variant pb-4 md:flex-col md:gap-0 md:border-b-0 md:border-r md:pb-0 md:pr-6"
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
                ? "border-l-2 border-tms-orange bg-tms-orange/10 pl-2.5 text-primary"
                : "border-l-2 border-transparent pl-2.5 text-on-surface-variant hover:bg-surface-container-low hover:text-primary",
            )}
          >
            {label}
          </Link>
        );
      })}
    </nav>
  );
}
