import { v } from "convex/values";
import type { Id } from "./_generated/dataModel";
import { internal } from "./_generated/api";
import { internalMutation, internalQuery, query } from "./_generated/server";

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
  },
  handler: async (ctx, { orderId, error }) => {
    const order = await ctx.db.get(orderId);
    if (!order) return;
    const attempts = (order.fulfillmentAttempts ?? 0) + 1;
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
    await ctx.db.patch(orderId, {
      printfulOrderId,
      printfulExternalId: externalId,
      status: "fulfilling",
      updatedAt: Date.now(),
    });
  },
});
