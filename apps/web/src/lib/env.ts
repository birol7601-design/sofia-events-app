import { WebEnvSchema } from "@repo/validators/env";
import { z } from "zod";

function parseEnv() {
  try {
    return WebEnvSchema.parse(process.env);
  } catch (error) {
    if (error instanceof z.ZodError) {
      const issues = error.issues.map((issue) => issue.path.join("."));
      throw new Error(
        `Invalid web environment. Check apps/web/.env.local. Invalid keys: ${issues.join(", ")}`,
      );
    }

    throw error;
  }
}

export const env = parseEnv();
