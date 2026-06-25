import { z } from "zod";

export const EventInputSchema = z.object({
  title: z.string().trim().min(3).max(120),
  description: z.string().trim().max(5000).optional(),
  startsAt: z.iso.datetime(),
  venueName: z.string().trim().min(2).max(160),
  city: z.string().trim().min(2).max(80).default("Sofia"),
  category: z.string().trim().min(2).max(80),
  priceText: z.string().trim().max(80).optional(),
  ticketUrl: z.url().optional(),
  imageUrl: z.url().optional(),
  buzzSays: z.string().trim().max(2000).optional(),
  tags: z.array(z.string().trim().min(1).max(40)).max(20).default([]),
});

export type EventInput = z.input<typeof EventInputSchema>;
export type Event = z.infer<typeof EventInputSchema>;
