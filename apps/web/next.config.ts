import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactCompiler: true,
  transpilePackages: ["@workspace/ui"],
  typedRoutes: true,
};

export default nextConfig;
