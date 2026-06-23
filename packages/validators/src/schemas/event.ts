import { z } from "zod";

export const EventInputSchema = z.object({
  title: z.string().trim().min(3).max(120),
  description: z.string().trim().max(5000).optional(),
  startsAt: z.iso.datetime(),
  venueName: z.string().trim().min(2).max(160),
  city: z.string().trim().min(2).max(80).default("Sofia"),
  category: z.string().trim().min(2).max(80),
});
