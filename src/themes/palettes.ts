import type { InvitationData } from "@/lib/invitation/schema";
import { palette as andiRina } from "./andi-rina/palette";
import { palette as bagasSekar } from "./bagas-sekar/palette";
import { palette as danangKinanthi } from "./danang-kinanthi/palette";
import { palette as fadhilNayla } from "./fadhil-nayla/palette";
import { palette as hendrawanLarasati } from "./hendrawan-larasati/palette";
import { CUSTOM, isHex, type ThemePalette, type Vars } from "./palette";

export const PALETTES: Record<string, ThemePalette> = {
  "andi-rina": andiRina,
  "bagas-sekar": bagasSekar,
  "hendrawan-larasati": hendrawanLarasati,
  "danang-kinanthi": danangKinanthi,
  "fadhil-nayla": fadhilNayla,
};

// Palet yang dipakai undangan: kustom bila ketiga warnanya sah, preset yang dipilih, atau preset pertama sebagai bawaan.
export function resolvePalette(theme: string, style?: InvitationData["style"]): Vars {
  const p = PALETTES[theme];
  if (!p) return {};
  if (style?.palette === CUSTOM) {
    const { paper, accent, ink } = style.custom;
    if ([paper, accent, ink].every(isHex)) return p.derive({ paper, accent, ink });
  }
  return (p.presets.find((x) => x.id === style?.palette) ?? p.presets[0]).vars;
}
