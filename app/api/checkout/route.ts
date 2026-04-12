import { auth, currentUser } from "@clerk/nextjs/server";
import { Polar } from "@polar-sh/sdk";
import { fetchMutation } from "convex/nextjs";
import { api } from "@/convex/_generated/api";

export async function POST() {
  const { userId, getToken } = await auth();
  if (!userId) {
    return new Response("Unauthorized", { status: 401 });
  }

  const token = await getToken({ template: "convex" });
  if (!token) {
    return new Response("Missing Convex auth token", { status: 401 });
  }

  const polarProductId = process.env.POLAR_MERCH_PRODUCT_ID;
  const accessToken = process.env.POLAR_ACCESS_TOKEN;
  if (!polarProductId || !accessToken) {
    return new Response("Polar is not configured (POLAR_MERCH_PRODUCT_ID, POLAR_ACCESS_TOKEN)", {
      status: 500,
    });
  }

  const { draftId, totalCents } = await fetchMutation(
    api.checkout.createDraftFromCart,
    {},
    { token },
  );

  const server =
    process.env.POLAR_SERVER === "sandbox" ? "sandbox" : "production";

  const polar = new Polar({
    accessToken,
    server,
  });

  const appUrl =
    process.env.NEXT_PUBLIC_APP_URL?.replace(/\/$/, "") ??
    "http://localhost:3000";
  const successUrl = `${appUrl}/account/orders?checkout_id={CHECKOUT_ID}`;

  const user = await currentUser();
  const checkout = await polar.checkouts.create({
    products: [polarProductId],
    prices: {
      [polarProductId]: [
        {
          amountType: "fixed",
          priceAmount: totalCents,
        },
      ],
    },
    metadata: {
      checkoutDraftId: draftId,
    },
    externalCustomerId: userId,
    customerEmail: user?.emailAddresses?.[0]?.emailAddress ?? undefined,
    customerName: user?.fullName ?? undefined,
    successUrl,
    returnUrl: `${appUrl}/checkout`,
    requireBillingAddress: true,
  });

  return Response.redirect(checkout.url);
}
