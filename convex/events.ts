import { EventInputSchema } from "@repo/validators";
import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

export const list = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db.query("events").order("desc").take(50);
  },
});

export const getById = query({
  args: { id: v.id("events") },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.id);
  },
});

export const create = mutation({
  args: {
    title: v.string(),
    description: v.optional(v.string()),
    startsAt: v.string(),
    venueName: v.string(),
    city: v.optional(v.string()),
    category: v.string(),
    priceText: v.optional(v.string()),
    ticketUrl: v.optional(v.string()),
    imageUrl: v.optional(v.string()),
    buzzSays: v.optional(v.string()),
    tags: v.optional(v.array(v.string())),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (identity === null) {
      throw new Error("Not signed in.");
    }

    const data = EventInputSchema.parse(args);

    return await ctx.db.insert("events", {
      ...data,
      createdBy: identity.subject,
    });
  },
});
