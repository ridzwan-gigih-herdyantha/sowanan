import { Bebas_Neue, Shrikhand, Special_Elite, Work_Sans } from "next/font/google";

const shrikhand = Shrikhand({
  variable: "--font-tp-display",
  subsets: ["latin"],
  weight: "400",
  display: "swap",
  preload: false,
});

const bebas = Bebas_Neue({
  variable: "--font-tp-label",
  subsets: ["latin"],
  weight: "400",
  display: "swap",
  preload: false,
});

const workSans = Work_Sans({
  variable: "--font-tp-body",
  subsets: ["latin"],
  style: ["normal", "italic"],
  display: "swap",
  preload: false,
});

const elite = Special_Elite({
  variable: "--font-tp-type",
  subsets: ["latin"],
  weight: "400",
  display: "swap",
  preload: false,
});

export const themeFonts = `${shrikhand.variable} ${bebas.variable} ${workSans.variable} ${elite.variable}`;

// Pasangan font bawaan, dipakai juga sebagai pilihan pertama di panel gaya.
export const defaultFonts = { display: shrikhand, body: workSans };
