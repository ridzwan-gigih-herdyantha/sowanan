import { Hanken_Grotesk, Ibarra_Real_Nova } from "next/font/google";

const ibarra = Ibarra_Real_Nova({
  variable: "--font-hl-display",
  subsets: ["latin"],
  weight: "400",
  style: ["normal", "italic"],
  display: "swap",
  preload: false,
});

const hanken = Hanken_Grotesk({
  variable: "--font-hl-body",
  subsets: ["latin"],
  weight: ["400", "500"],
  display: "swap",
  preload: false,
});

export const themeFonts = `${ibarra.variable} ${hanken.variable}`;
