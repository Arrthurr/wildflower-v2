"use client";

import { ClerkProvider, useAuth } from "@clerk/nextjs";
import { ConvexProviderWithClerk } from "convex/react-clerk";
import { ConvexReactClient, useConvexAuth, useMutation } from "convex/react";
import { useEffect } from "react";
import { api } from "@/convex/_generated/api";

const convexUrl =
  process.env.NEXT_PUBLIC_CONVEX_URL ?? "https://placeholder.convex.cloud";
const convex = new ConvexReactClient(convexUrl);

function ClerkUserSync() {
  const { isAuthenticated, isLoading } = useConvexAuth();
  const upsert = useMutation(api.users.upsertFromClerk);

  useEffect(() => {
    if (!isLoading && isAuthenticated) {
      void upsert({});
    }
  }, [isAuthenticated, isLoading, upsert]);

  return null;
}

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ClerkProvider>
      <ConvexProviderWithClerk client={convex} useAuth={useAuth}>
        <ClerkUserSync />
        {children}
      </ConvexProviderWithClerk>
    </ClerkProvider>
  );
}
