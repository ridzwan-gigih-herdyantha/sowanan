import type { NextConfig } from "next";

const supabaseHost = process.env.NEXT_PUBLIC_SUPABASE_URL ? new URL(process.env.NEXT_PUBLIC_SUPABASE_URL).hostname : "*.supabase.co";

const nextConfig: NextConfig = {
  cacheComponents: true,
  poweredByHeader: false,
  // Hanya untuk dev: izinkan membuka dev server lewat tunnel ngrok, misalnya untuk mencoba undangan di HP.
  allowedDevOrigins: ["*.ngrok-free.app", "*.ngrok.app"],
  images: {
    formats: ["image/avif", "image/webp"],
    qualities: [75, 85],
    remotePatterns: [
      { protocol: "https", hostname: supabaseHost, pathname: "/storage/v1/object/public/**" },
    ],
  },
  async redirects() {
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
