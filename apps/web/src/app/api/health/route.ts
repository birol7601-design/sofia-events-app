import { NextResponse } from "next/server";
import "@/lib/env";

export function GET() {
  return NextResponse.json(
    {
      ok: true,
      env: {
        valid: true,
      },
      services: {
        clerk: "configured",
        convex: "configured",
        resend: "configured",
      },
    },
    { status: 200 },
  );
}
