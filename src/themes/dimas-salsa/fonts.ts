import { Fredoka, Nunito, Press_Start_2P } from "next/font/google";

// Fredoka yang bulat dan tebal untuk judul dan label seperti papan di dalam game, Nunito untuk isi supaya
// tetap lembut dan mudah dibaca semua tamu.
const fredoka = Fredoka({
  variable: "--font-gd-display",
  subsets: ["latin"],
  display: "swap",
  preload: false,
});

const nunito = Nunito({
  variable: "--font-gd-body",
  subsets: ["latin"],
  display: "swap",
  preload: false,
});

// Huruf piksel untuk tulisan yang menyatu dengan lukisan peta, misalnya inisial di kanvas kuda-kuda.
const pixel = Press_Start_2P({
  variable: "--font-gd-pixel",
  weight: "400",
  subsets: ["latin"],
  display: "swap",
  preload: false,
});

export const themeFonts = `${fredoka.variable} ${nunito.variable} ${pixel.variable}`;

// Pasangan font bawaan, dipakai juga sebagai pilihan pertama di panel gaya.
export const defaultFonts = { display: fredoka, body: nunito };
