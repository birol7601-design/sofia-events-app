import { NextResponse } from "next/server";
import { isEmailConfigured } from "@/server/email";
import { env } from "@/lib/env";

export function GET() {
  return NextResponse.json({
    ok: true,
    services: {
      clerk: Boolean(
        env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY && env.CLERK_SECRET_KEY,
      ),
      convex: Boolean(env.NEXT_PUBLIC_CONVEX_URL && env.CONVEX_DEPLOYMENT),
      resend: isEmailConfigured(),
    },
  });
}
