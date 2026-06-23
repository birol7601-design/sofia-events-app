import "server-only";

import { Resend } from "resend";
import { env } from "@/lib/env";

let resend: Resend | null = null;

export function isEmailConfigured() {
  return true;
}

export function getResendClient() {
  resend ??= new Resend(env.RESEND_API_KEY);

  return resend;
}
