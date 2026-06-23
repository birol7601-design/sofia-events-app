import type { Metadata } from "next";
import { ClerkProvider } from "@clerk/nextjs";
import "@workspace/ui/globals.css";

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
    <ClerkProvider>
      <html lang="en">
        <body>{children}</body>
      </html>
    </ClerkProvider>
  );
}
