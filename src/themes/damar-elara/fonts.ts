import { Cinzel, DM_Sans } from "next/font/google";

const display = Cinzel({ variable: "--font-nc-display", subsets: ["latin"], display: "swap", preload: false });
const body = DM_Sans({ variable: "--font-nc-body", subsets: ["latin"], display: "swap", preload: false });

export const themeFonts = `${display.variable} ${body.variable}`;
export const defaultFonts = { display, body };
