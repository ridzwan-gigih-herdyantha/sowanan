import { Amiri, Cormorant_Garamond, Figtree } from "next/font/google";

const display = Cormorant_Garamond({
  variable: "--font-fw-display",
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  style: ["normal", "italic"],
  display: "swap",
  preload: false,
});

const body = Figtree({
  variable: "--font-fw-body",
  subsets: ["latin"],
  display: "swap",
  preload: false,
});

const arab = Amiri({
  variable: "--font-fw-arab",
  subsets: ["arabic"],
  weight: ["400", "700"],
  display: "swap",
  preload: false,
});

export const themeFonts = `${display.variable} ${body.variable} ${arab.variable}`;
export const defaultFonts = { display, body };
