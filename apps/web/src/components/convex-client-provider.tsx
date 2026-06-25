"use client";

import { type ReactNode, useState } from "react";
import { useAuth } from "@clerk/nextjs";
import { ConvexReactClient } from "convex/react";
import { ConvexProviderWithClerk } from "convex/react-clerk";

export function ConvexClientProvider({
  convexUrl,
  children,
}: {
  convexUrl: string;
  children: ReactNode;
}) {
  const [client] = useState(() => new ConvexReactClient(convexUrl));

  return (
    <ConvexProviderWithClerk client={client} useAuth={useAuth}>
      {children}
    </ConvexProviderWithClerk>
  );
}
