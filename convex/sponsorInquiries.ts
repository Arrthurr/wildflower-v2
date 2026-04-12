import { v } from "convex/values";
import { mutation } from "./_generated/server";

export const submit = mutation({
  args: {
    name: v.string(),
    email: v.string(),
    message: v.string(),
  },
  handler: async (ctx, { name, email, message }) => {
    const n = name.trim();
    const e = email.trim();
    const m = message.trim();
    if (n.length < 1 || n.length > 200) throw new Error("Please enter your name.");
    if (e.length < 3 || e.length > 320 || !e.includes("@"))
      throw new Error("Please enter a valid email.");
    if (m.length < 1 || m.length > 8000)
      throw new Error("Please enter a message.");

    await ctx.db.insert("sponsorInquiries", {
      name: n,
      email: e,
      message: m,
      createdAt: Date.now(),
    });
  },
});
