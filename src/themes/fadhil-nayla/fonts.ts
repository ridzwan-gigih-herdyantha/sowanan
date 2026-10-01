import { Amiri, Castoro, Figtree } from "next/font/google";

const castoro = Castoro({
  variable: "--font-sk-display",
  subsets: ["latin"],
  weight: "400",
  style: ["normal", "italic"],
  display: "swap",
  preload: false,
});

const figtree = Figtree({
  variable: "--font-sk-body",
  subsets: ["latin"],
  display: "swap",
  preload: false,
});

const amiri = Amiri({
  variable: "--font-sk-arab",
  subsets: ["arabic"],
  weight: ["400", "700"],
  display: "swap",
  preload: false,
});

export const themeFonts = `${castoro.variable} ${figtree.variable} ${amiri.variable}`;

// Pasangan font bawaan, dipakai juga sebagai pilihan pertama di panel gaya.
export const defaultFonts = { display: castoro, body: figtree };
