import { story as andiRina } from "./andi-rina/story";
import { story as arkasaMentari } from "./arkasa-mentari/story";
import { story as aryaKirana } from "./arya-kirana/story";
import { story as bagasSekar } from "./bagas-sekar/story";
import { story as bimaNadia } from "./bima-nadia/story";
import { story as bonarAnggi } from "./bonar-anggi/story";
import { story as nocturne } from "./damar-elara/story";
import { story as danangKinanthi } from "./danang-kinanthi/story";
import { story as fadhilNayla } from "./fadhil-nayla/story";
import { story as mawaddah } from "./faris-najwa/story";
import { story as galihArdila } from "./galih-ardila/story";
import { story as hendrawanLarasati } from "./hendrawan-larasati/story";
import { story as ivanMawar } from "./ivan-mawar/story";
import { story as isometrik } from "./rafi-kayla/story";
import { story as elaris } from "./raka-anindya/story";
import type { ThemeStory } from "./story-kit";
import { story as toniLayla } from "./toni-layla/story";

// Tiga template gambar story per tema.
export const STORIES: Record<string, ThemeStory> = {
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
  "rafi-kayla": isometrik,
};

// Halaman story hanya membuka undangan dengan tema terdaftar, jadi cadangan ini hanya berjaga-jaga.
export const themeStory = (theme: string): ThemeStory => STORIES[theme] ?? andiRina;
