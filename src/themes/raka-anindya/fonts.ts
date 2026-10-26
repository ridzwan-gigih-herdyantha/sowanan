import { Cormorant_Garamond, DM_Sans } from "next/font/google";

const display = Cormorant_Garamond({ variable: "--font-el-display", subsets: ["latin"], style: ["normal", "italic"], display: "swap", preload: false });
const body = DM_Sans({ variable: "--font-el-body", subsets: ["latin"], display: "swap", preload: false });

export const themeFonts = `${display.variable} ${body.variable}`;
export const defaultFonts = { display, body };
