import { Ballet, Fraunces, Plus_Jakarta_Sans } from "next/font/google";

const fraunces = Fraunces({
  variable: "--font-mm-display",
  subsets: ["latin"],
  style: ["normal", "italic"],
  display: "swap",
  preload: false,
});

const ballet = Ballet({
  variable: "--font-mm-script",
  subsets: ["latin"],
  weight: "400",
  display: "swap",
  preload: false,
});

const jakarta = Plus_Jakarta_Sans({
  variable: "--font-mm-body",
  subsets: ["latin"],
  display: "swap",
  preload: false,
});

export const themeFonts = `${fraunces.variable} ${ballet.variable} ${jakarta.variable}`;

// Pasangan font bawaan, dipakai juga sebagai pilihan pertama di panel gaya.
export const defaultFonts = { display: fraunces, body: jakarta };
