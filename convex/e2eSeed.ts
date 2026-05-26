import { v } from "convex/values";
import type { Id } from "./_generated/dataModel";
import { internal } from "./_generated/api";
import { internalMutation, internalQuery } from "./_generated/server";

type PolarPaidResult =
  | { duplicate: true }
  | { duplicate: false; orderId: Id<"orders"> };

/** Dev helper: seed a fulfilling order for Printful webhook simulator tests. */
const e2eLineItemArgs = {
  printfulVariantId: v.number(),
  printfulProductId: v.number(),
  name: v.string(),
  unitPriceCents: v.optional(v.number()),
};

export const seedFulfillingOrder = internalMutation({
  args: {
    clerkId: v.optional(v.string()),
    printfulOrderId: v.optional(v.number()),
    ...e2eLineItemArgs,
  },
  handler: async (ctx, args) => {
    const clerkId = args.clerkId;
    const user = clerkId
      ? await ctx.db
          .query("users")
          .withIndex("by_clerk_id", (q) => q.eq("clerkId", clerkId))
          .unique()
      : (await ctx.db.query("users").take(1))[0] ?? null;

    if (!user) {
      throw new Error("No Convex user — sign in once so upsertFromClerk creates a users row.");
    }

    const now = Date.now();
    const printfulOrderId = args.printfulOrderId ?? 99_001;
    const orderId = await ctx.db.insert("orders", {
      userId: user._id,
      clerkUserId: user.clerkId,
      polarCheckoutId: `e2e-seed-${now}`,
      polarOrderId: `e2e-polar-${now}`,
      status: "fulfilling",
      lineItems: [
        {
          printfulVariantId: args.printfulVariantId,
          printfulProductId: args.printfulProductId,
          name: args.name,
          quantity: 1,
          unitPriceCents: args.unitPriceCents ?? 2500,
        },
      ],
      shippingAddress: {
        name: "E2E Tester",
        line1: "123 Test St",
        city: "Los Angeles",
        state: "CA",
        postalCode: "90001",
        country: "US",
      },
      totalCents: args.unitPriceCents ?? 2500,
      printfulOrderId,
      printfulExternalId: "pending",
      createdAt: now,
      updatedAt: now,
    });

    await ctx.db.patch(orderId, { printfulExternalId: orderId });

    return { orderId, printfulOrderId, clerkId: user.clerkId };
  },
});

/** Simulate Polar order.paid → paid → Printful submit (requires PRINTFUL_API_KEY on Convex). */
export const simulatePolarPaid = internalMutation({
  args: {
    clerkId: v.optional(v.string()),
    ...e2eLineItemArgs,
  },
  handler: async (ctx, args): Promise<PolarPaidResult> => {
    const clerkId = args.clerkId;
    const user = clerkId
      ? await ctx.db
          .query("users")
          .withIndex("by_clerk_id", (q) => q.eq("clerkId", clerkId))
          .unique()
      : (await ctx.db.query("users").take(1))[0] ?? null;

    if (!user) {
      throw new Error("No Convex user — sign in once so upsertFromClerk creates a users row.");
    }

    const now = Date.now();
    const unitPriceCents = args.unitPriceCents ?? 2500;
    const lineItems = [
      {
        printfulVariantId: args.printfulVariantId,
        printfulProductId: args.printfulProductId,
        name: args.name,
        quantity: 1,
        unitPriceCents,
      },
    ];

    const draftId = await ctx.db.insert("checkoutDrafts", {
      userId: user._id,
      clerkUserId: user.clerkId,
      lineItems,
      totalCents: unitPriceCents,
      createdAt: now,
    });

    return (await ctx.runMutation(internal.orders.handlePolarOrderPaid, {
      polarOrderId: `e2e-polar-${now}`,
      polarCheckoutId: `e2e-checkout-${now}`,
      checkoutDraftId: draftId,
      clerkExternalId: user.clerkId,
      totalAmountCents: unitPriceCents,
      billingName: "E2E Tester",
      addressLine1: "123 Test St",
      city: "Los Angeles",
      state: "CA",
      postalCode: "90001",
      country: "US",
    })) as PolarPaidResult;
  },
});

export const getOrderStatus = internalQuery({
  args: { orderId: v.id("orders") },
  handler: async (ctx, { orderId }) => {
    const order = await ctx.db.get(orderId);
    if (!order) return null;
    return {
      status: order.status,
      printfulOrderId: order.printfulOrderId,
      trackingNumber: order.trackingNumber,
      trackingUrl: order.trackingUrl,
      lastFulfillmentError: order.lastFulfillmentError,
    };
  },
});
