import {
  Cinzel,
  Cormorant_Garamond,
  DM_Sans,
  DM_Serif_Display,
  EB_Garamond,
  Fraunces,
  Great_Vibes,
  Inter,
  Jost,
  Karla,
  Lora,
  Manrope,
  Parisienne,
  Pinyon_Script,
  Playfair_Display,
  Sacramento,
  Work_Sans,
} from "next/font/google";
import type { InvitationData } from "@/lib/invitation/schema";
import { defaultFonts as andiRina } from "./andi-rina/fonts";
import { defaultFonts as bagasSekar } from "./bagas-sekar/fonts";
import { defaultFonts as danangKinanthi } from "./danang-kinanthi/fonts";
import { defaultFonts as fadhilNayla } from "./fadhil-nayla/fonts";
import { defaultFonts as hendrawanLarasati } from "./hendrawan-larasati/fonts";

// Font pilihan untuk add-on ganti font. Semua di-host sendiri lewat next/font dan tidak dipreload,
// jadi berkasnya hanya diunduh bila undangan benar-benar memakainya.
// Argumen font loader harus literal, jadi setiap pemanggilan ditulis lengkap.
const playfair = Playfair_Display({ subsets: ["latin"], style: ["normal", "italic"], display: "swap", preload: false });
const cormorant = Cormorant_Garamond({ subsets: ["latin"], style: ["normal", "italic"], display: "swap", preload: false });
const fraunces = Fraunces({ subsets: ["latin"], style: ["normal", "italic"], display: "swap", preload: false });
const lora = Lora({ subsets: ["latin"], style: ["normal", "italic"], display: "swap", preload: false });
const dmSerif = DM_Serif_Display({ subsets: ["latin"], weight: "400", style: ["normal", "italic"], display: "swap", preload: false });
const ebGaramond = EB_Garamond({ subsets: ["latin"], style: ["normal", "italic"], display: "swap", preload: false });
const cinzel = Cinzel({ subsets: ["latin"], display: "swap", preload: false });
const dmSans = DM_Sans({ subsets: ["latin"], display: "swap", preload: false });
const jost = Jost({ subsets: ["latin"], display: "swap", preload: false });
const manrope = Manrope({ subsets: ["latin"], display: "swap", preload: false });
const workSans = Work_Sans({ subsets: ["latin"], display: "swap", preload: false });
const inter = Inter({ subsets: ["latin"], display: "swap", preload: false });
const karla = Karla({ subsets: ["latin"], display: "swap", preload: false });
const greatVibes = Great_Vibes({ subsets: ["latin"], weight: "400", display: "swap", preload: false });
const pinyon = Pinyon_Script({ subsets: ["latin"], weight: "400", display: "swap", preload: false });
const parisienne = Parisienne({ subsets: ["latin"], weight: "400", display: "swap", preload: false });
const sacramento = Sacramento({ subsets: ["latin"], weight: "400", display: "swap", preload: false });

type Font = { style: { fontFamily: string } };
export type FontPreset = { id: string; name: string; display: Font; body: Font };

// Font skrip untuk nama mempelai saja. Judul lain, angka, dan teks ucapan tetap memakai font judul supaya terbaca.
export const NAME_FONTS: { id: string; name: string; font: Font }[] = [
  { id: "klasik", name: "Great Vibes", font: greatVibes },
  { id: "kaligrafi", name: "Pinyon Script", font: pinyon },
  { id: "lembut", name: "Parisienne", font: parisienne },
  { id: "modern", name: "Sacramento", font: sacramento },
];

const SERIF = "Georgia, serif";
const SANS = "'Helvetica Neue', Arial, sans-serif";

export const FONT_PRESETS: Record<string, FontPreset[]> = {
  "andi-rina": [
    { id: "", name: "Bodoni & Archivo", ...andiRina },
    { id: "editorial", name: "Playfair & DM Sans", display: playfair, body: dmSans },
    { id: "klasik", name: "Cormorant & Jost", display: cormorant, body: jost },
    { id: "lunak", name: "Fraunces & Manrope", display: fraunces, body: manrope },
  ],
  "bagas-sekar": [
    { id: "", name: "Newsreader & Schibsted", ...bagasSekar },
    { id: "hangat", name: "Lora & Work Sans", display: lora, body: workSans },
    { id: "tegas", name: "DM Serif & Inter", display: dmSerif, body: inter },
    { id: "lembut", name: "Cormorant & Jost", display: cormorant, body: jost },
  ],
  "hendrawan-larasati": [
    { id: "", name: "Ibarra & Hanken", ...hendrawanLarasati },
    { id: "botani", name: "EB Garamond & Karla", display: ebGaramond, body: karla },
    { id: "romantis", name: "Cormorant & Jost", display: cormorant, body: jost },
    { id: "anggun", name: "Playfair & DM Sans", display: playfair, body: dmSans },
  ],
  "danang-kinanthi": [
    { id: "", name: "Marcellus & Alegreya Sans", ...danangKinanthi },
    { id: "prasasti", name: "Cinzel & Alegreya Sans", display: cinzel, body: danangKinanthi.body },
    { id: "keraton", name: "Cormorant & Alegreya Sans", display: cormorant, body: danangKinanthi.body },
    { id: "serat", name: "EB Garamond & Karla", display: ebGaramond, body: karla },
  ],
  "fadhil-nayla": [
    { id: "", name: "Castoro & Figtree", ...fadhilNayla },
    { id: "anggun", name: "Playfair & DM Sans", display: playfair, body: dmSans },
    { id: "lembut", name: "Cormorant & Jost", display: cormorant, body: jost },
    { id: "klasik", name: "EB Garamond & Karla", display: ebGaramond, body: karla },
  ],
};

export const fontStack = (f: Font, kind: "display" | "body") => `${f.style.fontFamily}, ${kind === "display" ? SERIF : SANS}`;

// Font bawaan memakai pengaturan tema sendiri, jadi hanya pilihan lain yang menimpa variabel font.
// --inv-script yang kosong membuat nama mempelai kembali ke font judul.
export function resolveFonts(theme: string, style?: InvitationData["style"]): Record<string, string> {
  const preset = style?.font && FONT_PRESETS[theme]?.find((x) => x.id === style.font);
  const name = style?.nameFont && NAME_FONTS.find((x) => x.id === style.nameFont);
  return {
    ...(preset && { "--inv-display": fontStack(preset.display, "display"), "--inv-body": fontStack(preset.body, "body") }),
    ...(name && { "--inv-script": fontStack(name.font, "display") }),
  };
}
