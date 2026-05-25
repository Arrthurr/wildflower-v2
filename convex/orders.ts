import { v } from "convex/values";
import type { Id } from "./_generated/dataModel";
import { internal } from "./_generated/api";
import {
  internalMutation,
  internalQuery,
  query,
  type MutationCtx,
} from "./_generated/server";
import {
  MAX_FULFILLMENT_RETRIES,
  STUCK_ORDER_AGE_MS,
} from "./fulfillmentPolicy";

export const listForUser = query({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return [];
    const user = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", identity.subject))
      .unique();
    if (!user) return [];
    const rows = await ctx.db
      .query("orders")
      .withIndex("by_user", (q) => q.eq("userId", user._id))
      .collect();
    return rows.sort((a, b) => b.createdAt - a.createdAt);
  },
});

export const getByIdForUser = query({
  args: { orderId: v.id("orders") },
  handler: async (ctx, { orderId }) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return null;
    const user = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", identity.subject))
      .unique();
    if (!user) return null;
    const order = await ctx.db.get(orderId);
    if (!order || order.userId !== user._id) return null;
    return order;
  },
});

export const getOrder = internalQuery({
  args: { orderId: v.id("orders") },
  handler: async (ctx, { orderId }) => {
    return ctx.db.get(orderId);
  },
});

export const handlePolarOrderPaid = internalMutation({
  args: {
    polarOrderId: v.string(),
    polarCheckoutId: v.optional(v.string()),
    checkoutDraftId: v.string(),
    clerkExternalId: v.optional(v.string()),
    totalAmountCents: v.number(),
    billingName: v.optional(v.string()),
    addressLine1: v.optional(v.string()),
    addressLine2: v.optional(v.string()),
    city: v.optional(v.string()),
    state: v.optional(v.string()),
    postalCode: v.optional(v.string()),
    country: v.string(),
  },
  handler: async (ctx, args) => {
    const dup = await ctx.db
      .query("processedWebhookEvents")
      .withIndex("by_provider_event", (q) =>
        q.eq("provider", "polar").eq("externalEventId", args.polarOrderId),
      )
      .unique();
    if (dup) {
      return { duplicate: true as const };
    }

    const existingOrder = await ctx.db
      .query("orders")
      .withIndex("by_polar_order", (q) => q.eq("polarOrderId", args.polarOrderId))
      .unique();
    if (existingOrder) {
      await ctx.db.insert("processedWebhookEvents", {
        provider: "polar",
        externalEventId: args.polarOrderId,
        createdAt: Date.now(),
      });
      return { duplicate: true as const };
    }

    const draft = await ctx.db.get(
      args.checkoutDraftId as Id<"checkoutDrafts">,
    );
    if (!draft) {
      throw new Error("Checkout draft not found");
    }
    if (args.clerkExternalId && draft.clerkUserId !== args.clerkExternalId) {
      throw new Error("Customer mismatch");
    }
    if (args.totalAmountCents < draft.totalCents) {
      throw new Error("Paid amount is lower than the cart total");
    }

    const shippingAddress = {
      name: args.billingName ?? "Customer",
      line1: args.addressLine1 ?? "",
      line2: args.addressLine2,
      city: args.city ?? "",
      state: args.state,
      postalCode: args.postalCode ?? "",
      country: args.country,
    };

    const now = Date.now();
    const orderId = await ctx.db.insert("orders", {
      userId: draft.userId,
      clerkUserId: draft.clerkUserId,
      polarCheckoutId: args.polarCheckoutId ?? "",
      polarOrderId: args.polarOrderId,
      status: "paid",
      lineItems: draft.lineItems,
      shippingAddress,
      totalCents: draft.totalCents,
      createdAt: now,
      updatedAt: now,
    });

    await ctx.db.delete(draft._id);

    const cartRows = await ctx.db
      .query("cartItems")
      .withIndex("by_user", (q) => q.eq("userId", draft.userId))
      .collect();
    for (const row of cartRows) {
      await ctx.db.delete(row._id);
    }

    await ctx.db.insert("processedWebhookEvents", {
      provider: "polar",
      externalEventId: args.polarOrderId,
      createdAt: Date.now(),
    });

    await ctx.scheduler.runAfter(0, internal.fulfillment.submitToPrintful, {
      orderId,
    });

    return { duplicate: false as const, orderId };
  },
});

export const recordFulfillmentFailure = internalMutation({
  args: {
    orderId: v.id("orders"),
    error: v.string(),
    retryable: v.boolean(),
  },
  handler: async (ctx, { orderId, error, retryable }) => {
    const order = await ctx.db.get(orderId);
    if (!order) return;
    const attempts = (order.fulfillmentAttempts ?? 0) + 1;

    if (retryable && attempts < MAX_FULFILLMENT_RETRIES) {
      await ctx.db.patch(orderId, {
        fulfillmentAttempts: attempts,
        lastFulfillmentError: error.slice(0, 2000),
        updatedAt: Date.now(),
      });
      await ctx.scheduler.runAfter(
        0,
        internal.fulfillment.scheduleFulfillmentRetry,
        { orderId, failedAttempts: attempts },
      );
      return;
    }

    await ctx.db.patch(orderId, {
      status: "failed",
      fulfillmentAttempts: attempts,
      lastFulfillmentError: error.slice(0, 2000),
      updatedAt: Date.now(),
    });
  },
});

export const recordPrintfulCreated = internalMutation({
  args: {
    orderId: v.id("orders"),
    printfulOrderId: v.number(),
    externalId: v.string(),
  },
  handler: async (ctx, { orderId, printfulOrderId, externalId }) => {
    const order = await ctx.db.get(orderId);
    if (!order) return;
    if (order.printfulOrderId) return;

    await ctx.db.patch(orderId, {
      printfulOrderId,
      printfulExternalId: externalId,
      status: "fulfilling",
      updatedAt: Date.now(),
    });
  },
});

async function findOrderForPrintfulEvent(
  ctx: MutationCtx,
  orderExternalId: string | undefined,
  printfulOrderId: number | undefined,
) {
  if (orderExternalId) {
    try {
      const byExternal = await ctx.db.get(orderExternalId as Id<"orders">);
      if (byExternal) return byExternal;
    } catch {
      // Not a valid Convex document id.
    }
  }

  if (printfulOrderId !== undefined) {
    const match = await ctx.db
      .query("orders")
      .withIndex("by_printful_order_id", (q) =>
        q.eq("printfulOrderId", printfulOrderId),
      )
      .unique();
    if (match) return match;
  }

  return null;
}

export const handlePrintfulWebhook = internalMutation({
  args: {
    externalEventId: v.string(),
    eventKind: v.union(v.literal("package_shipped"), v.literal("order_failed")),
    orderExternalId: v.optional(v.string()),
    printfulOrderId: v.optional(v.number()),
    trackingNumber: v.optional(v.string()),
    trackingUrl: v.optional(v.string()),
    failureReason: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const dup = await ctx.db
      .query("processedWebhookEvents")
      .withIndex("by_provider_event", (q) =>
        q.eq("provider", "printful").eq("externalEventId", args.externalEventId),
      )
      .unique();
    if (dup) {
      return { duplicate: true as const };
    }

    const order = await findOrderForPrintfulEvent(
      ctx,
      args.orderExternalId,
      args.printfulOrderId,
    );
    if (!order) {
      return { duplicate: false as const, missing: true as const };
    }

    const now = Date.now();

    if (args.eventKind === "package_shipped") {
      if (order.status !== "shipped") {
        await ctx.db.patch(order._id, {
          status: "shipped",
          trackingNumber: args.trackingNumber ?? order.trackingNumber,
          trackingUrl: args.trackingUrl ?? order.trackingUrl,
          printfulOrderId: args.printfulOrderId ?? order.printfulOrderId,
          updatedAt: now,
        });
      }
    } else {
      if (order.status !== "failed" && order.status !== "shipped") {
        await ctx.db.patch(order._id, {
          status: "failed",
          lastFulfillmentError: (args.failureReason ?? "Printful order failed").slice(
            0,
            2000,
          ),
          printfulOrderId: args.printfulOrderId ?? order.printfulOrderId,
          updatedAt: now,
        });
      }
    }

    await ctx.db.insert("processedWebhookEvents", {
      provider: "printful",
      externalEventId: args.externalEventId,
      createdAt: now,
    });

    return { duplicate: false as const };
  },
});

export const reconcileStuckPaidOrders = internalMutation({
  args: {},
  handler: async (ctx) => {
    const cutoff = Date.now() - STUCK_ORDER_AGE_MS;
    const paid = await ctx.db
      .query("orders")
      .withIndex("by_status", (q) => q.eq("status", "paid"))
      .collect();

    let scheduled = 0;
    for (const order of paid) {
      if (order.printfulOrderId) continue;
      if (order.createdAt > cutoff) continue;
      if ((order.fulfillmentAttempts ?? 0) >= MAX_FULFILLMENT_RETRIES) continue;

      await ctx.scheduler.runAfter(0, internal.fulfillment.submitToPrintful, {
        orderId: order._id,
      });
      scheduled += 1;
    }

    return { scheduled };
  },
});
