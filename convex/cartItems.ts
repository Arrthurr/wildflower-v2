import { v } from "convex/values";
import type { MutationCtx, QueryCtx } from "./_generated/server";
import { mutation, query } from "./_generated/server";

async function requireUserId(ctx: MutationCtx | QueryCtx) {
  const identity = await ctx.auth.getUserIdentity();
  if (!identity) throw new Error("Not authenticated");
  const user = await ctx.db
    .query("users")
    .withIndex("by_clerk_id", (q) => q.eq("clerkId", identity.subject))
    .unique();
  if (!user) throw new Error("User record missing — sign in again.");
  return user._id;
}

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
    return ctx.db
      .query("cartItems")
      .withIndex("by_user", (q) => q.eq("userId", user._id))
      .collect();
  },
});

export const summary = query({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      return { itemCount: 0, subtotalCents: 0 };
    }
    const user = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", identity.subject))
      .unique();
    if (!user) {
      return { itemCount: 0, subtotalCents: 0 };
    }
    const items = await ctx.db
      .query("cartItems")
      .withIndex("by_user", (q) => q.eq("userId", user._id))
      .collect();
    const itemCount = items.reduce((acc, i) => acc + i.quantity, 0);
    const subtotalCents = items.reduce(
      (acc, i) => acc + i.quantity * i.unitPriceCents,
      0,
    );
    return { itemCount, subtotalCents };
  },
});

export const addToCart = mutation({
  args: {
    printfulVariantId: v.number(),
    printfulProductId: v.number(),
    quantity: v.number(),
    unitPriceCents: v.number(),
    variantLabel: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const userId = await requireUserId(ctx);
    const now = Date.now();
    const qty = Math.max(1, Math.floor(args.quantity));

    const existing = await ctx.db
      .query("cartItems")
      .withIndex("by_user_variant", (q) =>
        q.eq("userId", userId).eq("printfulVariantId", args.printfulVariantId),
      )
      .unique();

    if (existing) {
      await ctx.db.patch(existing._id, {
        quantity: existing.quantity + qty,
        unitPriceCents: args.unitPriceCents,
        variantLabel: args.variantLabel ?? existing.variantLabel,
        updatedAt: now,
      });
      return existing._id;
    }

    return ctx.db.insert("cartItems", {
      userId,
      printfulVariantId: args.printfulVariantId,
      printfulProductId: args.printfulProductId,
      quantity: qty,
      unitPriceCents: args.unitPriceCents,
      variantLabel: args.variantLabel,
      updatedAt: now,
    });
  },
});

export const updateQuantity = mutation({
  args: {
    cartItemId: v.id("cartItems"),
    quantity: v.number(),
  },
  handler: async (ctx, { cartItemId, quantity }) => {
    const userId = await requireUserId(ctx);
    const row = await ctx.db.get(cartItemId);
    if (!row || row.userId !== userId) {
      throw new Error("Cart item not found");
    }
    const q = Math.max(0, Math.floor(quantity));
    if (q === 0) {
      await ctx.db.delete(cartItemId);
      return;
    }
    await ctx.db.patch(cartItemId, { quantity: q, updatedAt: Date.now() });
  },
});

export const removeFromCart = mutation({
  args: { cartItemId: v.id("cartItems") },
  handler: async (ctx, { cartItemId }) => {
    const userId = await requireUserId(ctx);
    const row = await ctx.db.get(cartItemId);
    if (!row || row.userId !== userId) {
      throw new Error("Cart item not found");
    }
    await ctx.db.delete(cartItemId);
  },
});

export const clearCart = mutation({
  args: {},
  handler: async (ctx) => {
    const userId = await requireUserId(ctx);
    const items = await ctx.db
      .query("cartItems")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .collect();
    for (const item of items) {
      await ctx.db.delete(item._id);
    }
  },
});
