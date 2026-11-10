import type { ThemeHeadings } from "@/lib/invitation/headings";
import { headings as hendrawanLarasati } from "./hendrawan-larasati/headings";

// Judul bawaan section per tema. Tema yang belum terdaftar tetap memakai judul tetap di kodenya.
export const THEME_HEADINGS: Record<string, ThemeHeadings> = {
  "hendrawan-larasati": hendrawanLarasati,
};
