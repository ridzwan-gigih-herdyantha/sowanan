import type { Viewport } from "next";
import { siteFonts } from "@/lib/fonts";

export const viewport: Viewport = {
  themeColor: "#FAF7F2",
};

export default function SiteLayout({ children }: { children: React.ReactNode }) {
  return <div className={`site ${siteFonts}`}>{children}</div>;
}
