import type { Metadata } from "next";
import { ClerkProvider } from "@clerk/nextjs";
import "@workspace/ui/globals.css";
import { ConvexClientProvider } from "@/components/convex-client-provider";
import { env } from "@/lib/env";

export const metadata: Metadata = {
  title: "Sofia Buzz",
  description: "Events and nightlife in Sofia.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>
        <ClerkProvider>
          <ConvexClientProvider convexUrl={env.NEXT_PUBLIC_CONVEX_URL}>
            {children}
          </ConvexClientProvider>
        </ClerkProvider>
      </body>
    </html>
  );
}
