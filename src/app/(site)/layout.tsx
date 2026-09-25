import type { Viewport } from "next";
import { Cormorant_Garamond, Jost } from "next/font/google";

const cormorant = Cormorant_Garamond({
  variable: "--font-cormorant",
  subsets: ["latin"],
  style: ["normal", "italic"],
  display: "swap",
});

const jost = Jost({
  variable: "--font-jost",
  subsets: ["latin"],
  display: "swap",
});

export const viewport: Viewport = {
  themeColor: "#FAF7F2",
};

export default function SiteLayout({ children }: { children: React.ReactNode }) {
  return <div className={`site ${cormorant.variable} ${jost.variable} font-sans`}>{children}</div>;
}
