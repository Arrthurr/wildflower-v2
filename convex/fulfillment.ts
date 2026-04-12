import { v } from "convex/values";
import type { Doc } from "./_generated/dataModel";
import { internal } from "./_generated/api";
import { internalAction } from "./_generated/server";

function countryToCode(country: unknown): string {
  if (typeof country === "string") return country;
  if (country && typeof country === "object" && "valueOf" in country) {
    return String(country);
  }
  return String(country ?? "US");
}

export const submitToPrintful = internalAction({
  args: { orderId: v.id("orders") },
  handler: async (ctx, { orderId }) => {
    const order = (await ctx.runQuery(internal.orders.getOrder, {
      orderId,
    })) as Doc<"orders"> | null;
    if (!order) return;

    const key = process.env.PRINTFUL_API_KEY;
    if (!key) {
      await ctx.runMutation(internal.orders.recordFulfillmentFailure, {
        orderId,
        error: "PRINTFUL_API_KEY is not set in Convex environment",
      });
      return;
    }

    const a = order.shippingAddress;
    const recipient: Record<string, string | number | object> = {
      name: a.name,
      address1: a.line1,
      city: a.city,
      zip: a.postalCode,
      country_code: countryToCode(a.country),
    };
    if (a.line2) recipient.address2 = a.line2;
    if (a.state) recipient.state_code = a.state;
    if (a.phone) recipient.phone = a.phone;

    const items = order.lineItems.map((li) => ({
      sync_variant_id: li.printfulVariantId,
      quantity: li.quantity,
    }));

    const body = {
      external_id: orderId,
      recipient,
      items,
      confirm: true,
    };

    const res = await fetch("https://api.printful.com/orders", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${key}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    });

    const json = (await res.json()) as {
      code?: number;
      result?: { id?: number };
      error?: { message?: string };
    };

    if (!res.ok || json.code !== 200 || !json.result?.id) {
      const msg = JSON.stringify(json).slice(0, 2000);
      await ctx.runMutation(internal.orders.recordFulfillmentFailure, {
        orderId,
        error: msg,
      });
      return;
    }

    await ctx.runMutation(internal.orders.recordPrintfulCreated, {
      orderId,
      printfulOrderId: json.result.id,
      externalId: orderId,
    });
  },
});
