import { Lexend, Pixelify_Sans, Silkscreen } from "next/font/google";

// Pixelify Sans untuk judul, Silkscreen untuk label kecil seperti tulisan di layar game, Lexend untuk isi
// supaya tetap mudah dibaca semua tamu.
const pixelify = Pixelify_Sans({
  variable: "--font-pt-display",
  subsets: ["latin"],
  display: "swap",
  preload: false,
});

const lexend = Lexend({
  variable: "--font-pt-body",
  subsets: ["latin"],
  display: "swap",
  preload: false,
});

const silkscreen = Silkscreen({
  variable: "--font-pt-label",
  subsets: ["latin"],
  weight: ["400", "700"],
  display: "swap",
  preload: false,
});

export const themeFonts = `${pixelify.variable} ${lexend.variable} ${silkscreen.variable}`;

// Pasangan font bawaan, dipakai juga sebagai pilihan pertama di panel gaya.
export const defaultFonts = { display: pixelify, body: lexend };
