import type { MetadataRoute } from "next";
import { BRAND } from "@/lib/brand";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Sowanan, Undangan Pernikahan Digital",
    short_name: "Sowanan",
    description: "Undangan pernikahan digital yang dibuat khusus untuk kalian.",
    start_url: "/",
    display: "standalone",
    background_color: BRAND.ivory,
    theme_color: BRAND.wine,
    icons: [
      { src: "/icon.png", sizes: "512x512", type: "image/png" },
      { src: "/apple-icon.png", sizes: "180x180", type: "image/png" },
    ],
  };
}
