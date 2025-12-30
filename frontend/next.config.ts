import type { NextConfig } from "next";

// Extend to allow turbopack.root to silence inferred-root warnings
const nextConfig: NextConfig & { turbopack?: { root?: string } } = {
  images: {
    // Unified image configuration
    remotePatterns: [
      {
        protocol: "https",
        hostname: "images.unsplash.com",
      },
      {
        protocol: "https",
        hostname: "*.supabase.co",
      },
      {
        protocol: "https",
        hostname: "supabase.co",
      },
      {
        protocol: "https",
        hostname: "*.onrender.com",
      },
    ],
    // Preserve PNG transparency - don't force format conversion
    dangerouslyAllowSVG: true,
    contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
    // Disable image optimization cache for development to see logo changes immediately
    minimumCacheTTL: 0,
  },
  turbopack: {
    // Ensure Next picks the frontend folder as the workspace root
    root: __dirname,
  },
};

export default nextConfig;
