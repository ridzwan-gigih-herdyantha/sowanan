import type { InvitationData } from "@/lib/invitation/schema";
import { palette as andiRina } from "./andi-rina/palette";
import { palette as arkasaMentari } from "./arkasa-mentari/palette";
import { palette as aryaKirana } from "./arya-kirana/palette";
import { palette as bagasSekar } from "./bagas-sekar/palette";
import { palette as bimaNadia } from "./bima-nadia/palette";
import { palette as toniLayla } from "./toni-layla/palette";
import { palette as danangKinanthi } from "./danang-kinanthi/palette";
import { palette as fadhilNayla } from "./fadhil-nayla/palette";
import { palette as hendrawanLarasati } from "./hendrawan-larasati/palette";
import { palette as ivanMawar } from "./ivan-mawar/palette";
import { palette as galihArdila } from "./galih-ardila/palette";
import { palette as bonarAnggi } from "./bonar-anggi/palette";
import { palette as elaris } from "./raka-anindya/palette";
import { palette as nocturne } from "./damar-elara/palette";
import { palette as mawaddah } from "./faris-najwa/palette";
import { CUSTOM, isHex, type ThemePalette, type Vars } from "./palette";

export const PALETTES: Record<string, ThemePalette> = {
  "andi-rina": andiRina,
  "bagas-sekar": bagasSekar,
  "hendrawan-larasati": hendrawanLarasati,
  "danang-kinanthi": danangKinanthi,
  "fadhil-nayla": fadhilNayla,
  "arya-kirana": aryaKirana,
  "bima-nadia": bimaNadia,
  "toni-layla": toniLayla,
  "arkasa-mentari": arkasaMentari,
  "ivan-mawar": ivanMawar,
  "galih-ardila": galihArdila,
  "bonar-anggi": bonarAnggi,
  "raka-anindya": elaris,
  "damar-elara": nocturne,
  "faris-najwa": mawaddah,
};

// Palet undangan: kustom bila ketiga warnanya sah, lalu preset yang dipilih, lalu preset pertama.
export function resolvePalette(theme: string, style?: InvitationData["style"]): Vars {
  const p = PALETTES[theme];
  if (!p) return {};
  if (style?.palette === CUSTOM) {
    const { paper, accent, ink } = style.custom;
    if ([paper, accent, ink].every(isHex)) return p.derive({ paper, accent, ink });
  }
  return (p.presets.find((x) => x.id === style?.palette) ?? p.presets[0]).vars;
}
