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
    createdBy: v.optional(v.string()),
  })
    .index("by_start", ["startsAt"])
    .index("by_category", ["category"]),
});
