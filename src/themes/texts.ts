import type { ThemeTexts } from "@/lib/invitation/texts";
import { texts as andiRina } from "./andi-rina/texts";
import { texts as arkasaMentari } from "./arkasa-mentari/texts";
import { texts as aryaKirana } from "./arya-kirana/texts";
import { texts as bagasSekar } from "./bagas-sekar/texts";
import { texts as bimaNadia } from "./bima-nadia/texts";
import { texts as bonarAnggi } from "./bonar-anggi/texts";
import { texts as damarElara } from "./damar-elara/texts";
import { texts as danangKinanthi } from "./danang-kinanthi/texts";
import { texts as dimasSalsa } from "./dimas-salsa/texts";
import { texts as fadhilNayla } from "./fadhil-nayla/texts";
import { texts as farisNajwa } from "./faris-najwa/texts";
import { texts as galihArdila } from "./galih-ardila/texts";
import { texts as hendrawanLarasati } from "./hendrawan-larasati/texts";
import { texts as ivanMawar } from "./ivan-mawar/texts";
import { texts as rafiKayla } from "./rafi-kayla/texts";
import { texts as rakaAnindya } from "./raka-anindya/texts";
import { texts as toniLayla } from "./toni-layla/texts";

// Teks bawaan per tema. Teks yang belum terdaftar di sini tetap tertulis langsung di kode temanya.
export const THEME_TEXTS: Record<string, ThemeTexts> = {
  "andi-rina": andiRina,
  "arkasa-mentari": arkasaMentari,
  "arya-kirana": aryaKirana,
  "bagas-sekar": bagasSekar,
  "bima-nadia": bimaNadia,
  "bonar-anggi": bonarAnggi,
  "damar-elara": damarElara,
  "danang-kinanthi": danangKinanthi,
  "dimas-salsa": dimasSalsa,
  "fadhil-nayla": fadhilNayla,
  "faris-najwa": farisNajwa,
  "galih-ardila": galihArdila,
  "hendrawan-larasati": hendrawanLarasati,
  "ivan-mawar": ivanMawar,
  "rafi-kayla": rafiKayla,
  "raka-anindya": rakaAnindya,
  "toni-layla": toniLayla,
};
