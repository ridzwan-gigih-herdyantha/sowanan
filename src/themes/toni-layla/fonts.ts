import { Archivo, Bodoni_Moda, Instrument_Sans } from "next/font/google";

// Archivo dipakai lebar dan tebal untuk judul besar, Instrument Sans untuk isi.
const archivo = Archivo({
  variable: "--font-ls-display",
  subsets: ["latin"],
  axes: ["wdth"],
  display: "swap",
  preload: false,
});

const instrument = Instrument_Sans({
  variable: "--font-ls-body",
  subsets: ["latin"],
  display: "swap",
  preload: false,
});

// Didone miring berkontras tinggi khusus nama mempelai di hero, lawan dari judul kota yang tebal.
const serif = Bodoni_Moda({
  variable: "--font-ls-script",
  subsets: ["latin"],
  style: ["italic"],
  axes: ["opsz"],
  display: "swap",
  preload: false,
});

export const themeFonts = `${archivo.variable} ${instrument.variable} ${serif.variable}`;

// Pasangan font bawaan, dipakai juga sebagai pilihan pertama di panel gaya.
export const defaultFonts = { display: archivo, body: instrument };
