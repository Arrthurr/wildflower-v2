import { v } from "convex/values";
import type { Id } from "./_generated/dataModel";
import { mutation } from "./_generated/server";

export const recordShare = mutation({
  args: {
    showSlug: v.string(),
    episodeSlug: v.string(),
    episodeTitle: v.optional(v.string()),
    platform: v.string(),
  },
  handler: async (ctx, args) => {
    let userId: Id<"users"> | undefined;
    const identity = await ctx.auth.getUserIdentity();
    if (identity) {
      const user = await ctx.db
        .query("users")
        .withIndex("by_clerk_id", (q) => q.eq("clerkId", identity.subject))
        .unique();
      userId = user?._id;
    }
    await ctx.db.insert("shareEvents", {
      showSlug: args.showSlug,
      episodeSlug: args.episodeSlug,
      episodeTitle: args.episodeTitle,
      platform: args.platform,
      userId,
      createdAt: Date.now(),
    });
  },
});
