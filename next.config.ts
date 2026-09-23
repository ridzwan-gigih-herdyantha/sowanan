import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  cacheComponents: true,
  poweredByHeader: false,
  images: {
    formats: ["image/avif", "image/webp"],
    remotePatterns: [
      // Foto undangan dari Supabase Storage
      { protocol: "https", hostname: "*.supabase.co", pathname: "/storage/v1/object/public/**" },
    ],
  },
  async redirects() {
    // Domain utama non-www (PRD 2.7)
    return [
      {
        source: "/:path*",
        has: [{ type: "host", value: "www.sowanan.com" }],
        destination: "https://sowanan.com/:path*",
        permanent: true,
      },
    ];
  },
};

export default nextConfig;
