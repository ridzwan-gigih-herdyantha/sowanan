import { Newsreader, Schibsted_Grotesk } from "next/font/google";

const newsreader = Newsreader({
  variable: "--font-bs-display",
  subsets: ["latin"],
  weight: "400",
  style: ["normal", "italic"],
  display: "swap",
  preload: false,
});

const schibsted = Schibsted_Grotesk({
  variable: "--font-bs-body",
  subsets: ["latin"],
  weight: ["400", "500"],
  display: "swap",
  preload: false,
});

export const themeFonts = `${newsreader.variable} ${schibsted.variable}`;
