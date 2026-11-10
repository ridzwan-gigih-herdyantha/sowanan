import type { ThemeTexts } from "@/lib/invitation/texts";
import { texts as hendrawanLarasati } from "./hendrawan-larasati/texts";

// Teks bawaan per tema. Tema yang belum terdaftar tetap memakai teks tetap di kodenya.
export const THEME_TEXTS: Record<string, ThemeTexts> = {
  "hendrawan-larasati": hendrawanLarasati,
};
