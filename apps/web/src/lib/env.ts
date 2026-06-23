import { WebEnvSchema } from "@repo/validators/env";
import { z } from "zod";

function formatEnvError(error: z.ZodError) {
  const keys = error.issues.map((issue) => issue.path.join(".")).join(", ");

  return [
    "Invalid web environment. Check apps/web/.env.local.",
    `Invalid keys: ${keys}`,
    z.prettifyError(error),
  ].join("\n");
}

function parseEnv() {
  const result = WebEnvSchema.safeParse(process.env);

  if (!result.success) {
    throw new Error(formatEnvError(result.error));
  }

  return result.data;
}

export const env = parseEnv();
