"use client";

import { useState } from "react";
import {
  Sheet,
  SheetContent,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { MaterialIcon } from "@/components/ui/material-icon";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { SiteSidebar, SiteSidebarContent } from "./site-sidebar";

export function AppShell({ children }: { children: React.ReactNode }) {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <div className="flex h-dvh overflow-hidden bg-background">
      <SiteSidebar />
      <div className="flex min-w-0 flex-1 flex-col">
        <header className="flex h-14 shrink-0 items-center border-b border-tms-orange/30 bg-surface-container-low px-4 lg:hidden">
          <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
            <SheetTrigger
              className={cn(buttonVariants({ variant: "ghost", size: "icon" }))}
              aria-label="Open menu"
            >
              <MaterialIcon name="menu" className="text-2xl" />
            </SheetTrigger>
            <SheetContent side="left" className="w-64 p-0" showCloseButton>
              <SheetTitle className="sr-only">Navigation</SheetTitle>
              <div className="flex h-full flex-col bg-surface-container-low">
                <SiteSidebarContent onNavigate={() => setMobileOpen(false)} />
              </div>
            </SheetContent>
          </Sheet>
          <span className="ml-3 font-semibold text-sof-navy">Wildflower Media</span>
        </header>
        <main className="main-scroll-area flex-1 overflow-y-auto">{children}</main>
      </div>
    </div>
  );
}
