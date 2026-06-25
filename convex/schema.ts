import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  events: defineTable({
    title: v.string(),
    description: v.optional(v.string()),
    startsAt: v.string(),
    venueName: v.string(),
    city: v.string(),
    category: v.string(),
    priceText: v.optional(v.string()),
    ticketUrl: v.optional(v.string()),
    imageUrl: v.optional(v.string()),
    buzzSays: v.optional(v.string()),
    tags: v.array(v.string()),
    createdBy: v.string(),
  })
    .index("by_startsAt", ["startsAt"])
    .index("by_category", ["category"])
    .index("by_createdBy", ["createdBy"]),
});
