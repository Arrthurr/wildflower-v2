import { mutation } from "./_generated/server";

export const createDraftFromCart = mutation({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");
    const user = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", identity.subject))
      .unique();
    if (!user) throw new Error("User record missing — sign in again.");

    const cart = await ctx.db
      .query("cartItems")
      .withIndex("by_user", (q) => q.eq("userId", user._id))
      .collect();
    if (cart.length === 0) {
      throw new Error("Cart is empty");
    }

    const lineItems = cart.map((item) => ({
      printfulVariantId: item.printfulVariantId,
      printfulProductId: item.printfulProductId,
      name: item.variantLabel ?? `Item ${item.printfulVariantId}`,
      quantity: item.quantity,
      unitPriceCents: item.unitPriceCents,
    }));

    const totalCents = lineItems.reduce(
      (acc, i) => acc + i.quantity * i.unitPriceCents,
      0,
    );
    if (totalCents < 50) {
      throw new Error("Order total is below the minimum charge ($0.50)");
    }

    const draftId = await ctx.db.insert("checkoutDrafts", {
      userId: user._id,
      clerkUserId: identity.subject,
      lineItems,
      totalCents,
      createdAt: Date.now(),
    });

    return { draftId, totalCents };
  },
});
