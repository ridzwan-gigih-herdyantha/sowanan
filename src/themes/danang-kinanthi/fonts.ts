import { Alegreya_Sans, Marcellus, Noto_Sans_Javanese } from "next/font/google";

const marcellus = Marcellus({
  variable: "--font-pk-display",
  subsets: ["latin"],
  weight: "400",
  display: "swap",
  preload: false,
});

const alegreya = Alegreya_Sans({
  variable: "--font-pk-body",
  subsets: ["latin"],
  weight: ["400", "500"],
  style: ["normal", "italic"],
  display: "swap",
  preload: false,
});

const javanese = Noto_Sans_Javanese({
  variable: "--font-pk-jawa",
  subsets: ["javanese"],
  weight: "400",
  display: "swap",
  preload: false,
});

export const themeFonts = `${marcellus.variable} ${alegreya.variable} ${javanese.variable}`;

// Pasangan font bawaan, dipakai juga sebagai pilihan pertama di panel gaya.
export const defaultFonts = { display: marcellus, body: alegreya };
