import { z } from "zod";

export const WebEnvSchema = z.object({
  CONVEX_DEPLOYMENT: z.string().trim().min(1),
  NEXT_PUBLIC_CONVEX_URL: z.url(),
  NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY: z.string().trim().min(1),
  CLERK_SECRET_KEY: z.string().trim().min(1),
  RESEND_API_KEY: z.string().trim().min(1),
});

export type WebEnv = z.infer<typeof WebEnvSchema>;
