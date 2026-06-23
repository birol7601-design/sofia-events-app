import "server-only";

import { Resend } from "resend";
import { env } from "@/lib/env";

let resend: Resend | null = null;

export function isEmailConfigured() {
  return Boolean(env.RESEND_API_KEY);
}

export function getResendClient() {
  if (!env.RESEND_API_KEY) {
    throw new Error("RESEND_API_KEY is required to send email.");
  }

  resend ??= new Resend(env.RESEND_API_KEY);

  return resend;
}
