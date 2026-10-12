import { Italiana, Marcellus_SC, Newsreader } from "next/font/google";

const italiana = Italiana({
  variable: "--font-rb-display",
  subsets: ["latin"],
  weight: "400",
  display: "swap",
  preload: false,
});

const newsreader = Newsreader({
  variable: "--font-rb-body",
  subsets: ["latin"],
  style: ["normal", "italic"],
  display: "swap",
  preload: false,
});

const marcellus = Marcellus_SC({
  variable: "--font-rb-label",
  subsets: ["latin"],
  weight: "400",
  display: "swap",
  preload: false,
});

export const themeFonts = `${italiana.variable} ${newsreader.variable} ${marcellus.variable}`;

// Pasangan font bawaan, dipakai juga sebagai pilihan pertama di panel gaya.
export const defaultFonts = { display: italiana, body: newsreader };
