import { webEnvSchema } from "@repo/validators/env";

export const env = webEnvSchema.parse(process.env);
