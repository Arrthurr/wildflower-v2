import { v } from "convex/values";
import type { Doc } from "./_generated/dataModel";
import { internal } from "./_generated/api";
import { internalAction } from "./_generated/server";
import {
  classifyPrintfulSubmissionFailure,
  fulfillmentRetryDelayMs,
  MAX_FULFILLMENT_RETRIES,
} from "./fulfillmentPolicy";

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

    if (order.printfulOrderId) return;
    if (order.status !== "paid") return;

    const key = process.env.PRINTFUL_API_KEY;
    if (!key) {
      await ctx.runMutation(internal.orders.recordFulfillmentFailure, {
        orderId,
        error: "PRINTFUL_API_KEY is not set in Convex environment",
        retryable: false,
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

    let res: Response;
    try {
      res = await fetch("https://api.printful.com/orders", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${key}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(body),
      });
    } catch (e) {
      const msg = e instanceof Error ? e.message : "Printful request failed";
      await ctx.runMutation(internal.orders.recordFulfillmentFailure, {
        orderId,
        error: msg,
        retryable: true,
      });
      return;
    }

    const raw = await res.text();
    let json: {
      code?: number;
      result?: { id?: number };
      error?: { message?: string; reason?: string };
    };
    try {
      json = JSON.parse(raw) as typeof json;
    } catch {
      await ctx.runMutation(internal.orders.recordFulfillmentFailure, {
        orderId,
        error: raw.slice(0, 2000) || `Printful returned ${res.status}`,
        retryable: isRetryableStatus(res.status),
      });
      return;
    }

    if (res.ok && json.code === 200 && json.result?.id) {
      await ctx.runMutation(internal.orders.recordPrintfulCreated, {
        orderId,
        printfulOrderId: json.result.id,
        externalId: orderId,
      });
      return;
    }

    const { retryable, message } = classifyPrintfulSubmissionFailure(
      res.status,
      raw,
    );
    await ctx.runMutation(internal.orders.recordFulfillmentFailure, {
      orderId,
      error: message,
      retryable,
    });
  },
});

function isRetryableStatus(status: number): boolean {
  return status === 408 || status === 429 || status >= 500;
}

export const scheduleFulfillmentRetry = internalAction({
  args: {
    orderId: v.id("orders"),
    failedAttempts: v.number(),
  },
  handler: async (ctx, { orderId, failedAttempts }) => {
    if (failedAttempts >= MAX_FULFILLMENT_RETRIES) return;
    const delayMs = fulfillmentRetryDelayMs(failedAttempts);
    await ctx.scheduler.runAfter(delayMs, internal.fulfillment.submitToPrintful, {
      orderId,
    });
  },
});
