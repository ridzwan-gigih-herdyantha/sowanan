import { Gilda_Display, Lora, Pinyon_Script } from "next/font/google";

const gilda = Gilda_Display({
  variable: "--font-su-display",
  subsets: ["latin"],
  weight: "400",
  display: "swap",
  preload: false,
});

const pinyon = Pinyon_Script({
  variable: "--font-su-script",
  subsets: ["latin"],
  weight: "400",
  display: "swap",
  preload: false,
});

const lora = Lora({
  variable: "--font-su-body",
  subsets: ["latin"],
  style: ["normal", "italic"],
  display: "swap",
  preload: false,
});

export const themeFonts = `${gilda.variable} ${pinyon.variable} ${lora.variable}`;

// Pasangan font bawaan, dipakai juga sebagai pilihan pertama di panel gaya.
export const defaultFonts = { display: gilda, body: lora };
