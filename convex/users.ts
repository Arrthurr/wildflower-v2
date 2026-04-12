import { v } from "convex/values";
import { internalQuery, mutation, query } from "./_generated/server";

export const current = query({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return null;
    return ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", identity.subject))
      .unique();
  },
});

export const upsertFromClerk = mutation({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");

    const now = Date.now();
    const existing = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", identity.subject))
      .unique();

    const email =
      typeof identity.email === "string" ? identity.email : undefined;
    const name =
      typeof identity.name === "string" ? identity.name : undefined;
    const imageUrl =
      typeof identity.pictureUrl === "string"
        ? identity.pictureUrl
        : undefined;

    if (existing) {
      await ctx.db.patch(existing._id, {
        email: email ?? existing.email,
        name: name ?? existing.name,
        imageUrl: imageUrl ?? existing.imageUrl,
        updatedAt: now,
      });
      return existing._id;
    }

    return ctx.db.insert("users", {
      clerkId: identity.subject,
      email,
      name,
      imageUrl,
      updatedAt: now,
    });
  },
});

/** Internal: resolve Convex user from Clerk subject (for webhooks / fulfillment). */
export const internalGetByClerkId = internalQuery({
  args: { clerkId: v.string() },
  handler: async (ctx, { clerkId }) => {
    return ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", clerkId))
      .unique();
  },
});
