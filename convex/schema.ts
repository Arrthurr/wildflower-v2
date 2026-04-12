import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

const orderStatus = v.union(
  v.literal("paid"),
  v.literal("fulfilling"),
  v.literal("shipped"),
  v.literal("failed"),
  v.literal("refunded"),
);

const lineItem = v.object({
  printfulVariantId: v.number(),
  printfulProductId: v.number(),
  name: v.string(),
  quantity: v.number(),
  unitPriceCents: v.number(),
});

const shippingAddress = v.object({
  name: v.string(),
  line1: v.string(),
  line2: v.optional(v.string()),
  city: v.string(),
  state: v.optional(v.string()),
  postalCode: v.string(),
  country: v.string(),
  phone: v.optional(v.string()),
});

export default defineSchema({
  users: defineTable({
    clerkId: v.string(),
    email: v.optional(v.string()),
    name: v.optional(v.string()),
    imageUrl: v.optional(v.string()),
    updatedAt: v.number(),
  }).index("by_clerk_id", ["clerkId"]),

  /** Snapshot of cart at checkout start; fulfilled after Polar `order.paid`. */
  checkoutDrafts: defineTable({
    userId: v.id("users"),
    clerkUserId: v.string(),
    lineItems: v.array(lineItem),
    totalCents: v.number(),
    createdAt: v.number(),
  }).index("by_user", ["userId"]),

  cartItems: defineTable({
    userId: v.id("users"),
    printfulVariantId: v.number(),
    printfulProductId: v.number(),
    quantity: v.number(),
    unitPriceCents: v.number(),
    variantLabel: v.optional(v.string()),
    updatedAt: v.number(),
  })
    .index("by_user", ["userId"])
    .index("by_user_variant", ["userId", "printfulVariantId"]),

  orders: defineTable({
    userId: v.id("users"),
    clerkUserId: v.string(),
    polarCheckoutId: v.string(),
    polarOrderId: v.optional(v.string()),
    status: orderStatus,
    lineItems: v.array(lineItem),
    shippingAddress: shippingAddress,
    totalCents: v.number(),
    printfulOrderId: v.optional(v.number()),
    printfulExternalId: v.optional(v.string()),
    trackingNumber: v.optional(v.string()),
    trackingUrl: v.optional(v.string()),
    fulfillmentAttempts: v.optional(v.number()),
    lastFulfillmentError: v.optional(v.string()),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_user", ["userId"])
    .index("by_clerk_user", ["clerkUserId"])
    .index("by_polar_checkout", ["polarCheckoutId"])
    .index("by_polar_order", ["polarOrderId"]),

  shareEvents: defineTable({
    showSlug: v.string(),
    episodeSlug: v.string(),
    episodeTitle: v.optional(v.string()),
    platform: v.string(),
    userId: v.optional(v.id("users")),
    createdAt: v.number(),
  }).index("by_created", ["createdAt"]),

  sponsorInquiries: defineTable({
    name: v.string(),
    email: v.string(),
    message: v.string(),
    createdAt: v.number(),
  }).index("by_created", ["createdAt"]),

  processedWebhookEvents: defineTable({
    provider: v.union(v.literal("polar"), v.literal("printful")),
    externalEventId: v.string(),
    createdAt: v.number(),
  }).index("by_provider_event", ["provider", "externalEventId"]),
});
