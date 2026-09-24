import { Archivo, Bodoni_Moda } from "next/font/google";

const bodoni = Bodoni_Moda({
  variable: "--font-ar-display",
  subsets: ["latin"],
  style: ["normal", "italic"],
  display: "swap",
});

const archivo = Archivo({
  variable: "--font-ar-body",
  subsets: ["latin"],
  weight: "400",
  display: "swap",
});

export const themeFonts = `${bodoni.variable} ${archivo.variable}`;
