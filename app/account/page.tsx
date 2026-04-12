"use client";

import Link from "next/link";
import { useUser } from "@clerk/nextjs";
import { Package, User } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default function AccountOverviewPage() {
  const { user, isLoaded } = useUser();

  if (!isLoaded) {
    return <p className="text-sm text-muted-foreground">Loading…</p>;
  }

  const name = user?.fullName ?? user?.primaryEmailAddress?.emailAddress ?? "there";

  return (
    <div>
      <h2 className="text-lg font-semibold tracking-tight">Overview</h2>
      <p className="mt-1 text-sm text-muted-foreground">
        Signed in as <span className="text-foreground">{name}</span>
        {user?.primaryEmailAddress?.emailAddress ? (
          <span className="text-muted-foreground">
            {" "}
            · {user.primaryEmailAddress.emailAddress}
          </span>
        ) : null}
      </p>

      <div className="mt-8 grid gap-4 sm:grid-cols-2">
        <Link href="/account/orders">
          <Card className="h-full transition-colors hover:bg-muted/40">
            <CardHeader className="pb-2">
              <div className="flex items-center gap-2">
                <Package className="h-5 w-5 text-muted-foreground" aria-hidden />
                <CardTitle className="text-base">Orders</CardTitle>
              </div>
              <CardDescription>View order history and tracking</CardDescription>
            </CardHeader>
            <CardContent className="text-sm text-primary">View orders →</CardContent>
          </Card>
        </Link>
        <Link href="/account/profile">
          <Card className="h-full transition-colors hover:bg-muted/40">
            <CardHeader className="pb-2">
              <div className="flex items-center gap-2">
                <User className="h-5 w-5 text-muted-foreground" aria-hidden />
                <CardTitle className="text-base">Profile</CardTitle>
              </div>
              <CardDescription>Email, password, and connected accounts</CardDescription>
            </CardHeader>
            <CardContent className="text-sm text-primary">Manage profile →</CardContent>
          </Card>
        </Link>
      </div>
    </div>
  );
}
