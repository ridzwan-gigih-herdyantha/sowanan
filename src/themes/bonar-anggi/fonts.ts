import { Alegreya_Sans, Cinzel, Pinyon_Script } from "next/font/google";

const cinzel = Cinzel({
  variable: "--font-hr-display",
  subsets: ["latin"],
  weight: ["400", "600"],
  display: "swap",
  preload: false,
});

const pinyon = Pinyon_Script({
  variable: "--font-hr-script",
  subsets: ["latin"],
  weight: "400",
  display: "swap",
  preload: false,
});

const alegreya = Alegreya_Sans({
  variable: "--font-hr-body",
  subsets: ["latin"],
  weight: ["400", "500"],
  style: ["normal", "italic"],
  display: "swap",
  preload: false,
});

export const themeFonts = `${cinzel.variable} ${pinyon.variable} ${alegreya.variable}`;

// Pasangan font bawaan, dipakai juga sebagai pilihan pertama di panel gaya.
export const defaultFonts = { display: cinzel, body: alegreya };
