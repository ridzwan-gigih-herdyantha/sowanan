import { DEFAULT_SETTINGS } from "./defaults";
import { PACKAGE_IDS, settingsSchema, type Settings } from "./schema";

type Legacy = Record<string, unknown>;

const num = (v: unknown, fallback: number) => (typeof v === "number" && Number.isFinite(v) ? v : fallback);
const txt = (v: unknown, fallback: string) => (typeof v === "string" ? v : fallback);
const CAP = { dasar: "Dasar", lengkap: "Lengkap", istimewa: "Istimewa" } as const;
const ADDON_KEYS = ["addonPhotos", "addonStyle", "addonMusic", "addonExport", "addonExpress", "addonDomain", "addonExtend"];

// "08.00 sampai 20.00" menjadi ["08:00", "20:00"]
function legacyHours(v: unknown): [string, string] | null {
  const m = typeof v === "string" ? /(\d{1,2})[.:](\d{2})\D+(\d{1,2})[.:](\d{2})/.exec(v) : null;
  return m ? [`${m[1].padStart(2, "0")}:${m[2]}`, `${m[3].padStart(2, "0")}:${m[4]}`] : null;
}

// Pengaturan versi 1 berbentuk datar (priceDasar, waNumber, dan seterusnya). Nilainya dipindahkan ke bentuk baru.
export function fromLegacy(d: Legacy): Settings {
  const s = structuredClone(DEFAULT_SETTINGS);
  for (const p of PACKAGE_IDS) {
    const pk = s.packages[p];
    pk.price = num(d[`price${CAP[p]}`], pk.price);
    pk.sla = num(d[`sla${CAP[p]}`], pk.sla);
    pk.active = num(d[`active${CAP[p]}`], pk.active);
  }
  const gallery = s.matrix.find((r) => r.key === "galeri_foto");
  if (gallery) {
    for (const p of PACKAGE_IDS) {
      const v = d[`photos${CAP[p]}`];
      if (v === null || typeof v === "number") gallery.cells[p] = { on: true, n: v };
    }
  }
  ADDON_KEYS.forEach((k, i) => {
    if (s.addons[i]) s.addons[i].price = num(d[k], s.addons[i].price);
  });
  s.contact.wa = txt(d.waNumber, s.contact.wa);
  s.contact.instagram = txt(d.instagram, s.contact.instagram);
  const h = legacyHours(d.operatingHours);
  if (h) [s.contact.open, s.contact.close] = h;
  s.wa.general = txt(d.waMessage, s.wa.general);
  s.payment.bank = txt(d.payBank, s.payment.bank);
  s.payment.accountName = txt(d.payAccountName, s.payment.accountName);
  s.payment.accountNumber = txt(d.payAccountNumber, s.payment.accountNumber);
  s.payment.dp = num(d.dpPercent, s.payment.dp);
  s.payment.qrisNmid = txt(d.qrisNmid, s.payment.qrisNmid);
  s.payment.qrisImage = txt(d.qrisImage, s.payment.qrisImage);
  s.terms.date = txt(d.termsDate, s.terms.date);
  return s;
}

// Bagian yang tidak lolos validasi diganti nilai bawaan, supaya satu isian rusak tidak menjatuhkan seluruh halaman.
export function normalizeSettings(raw: unknown): Settings {
  if (!raw || typeof raw !== "object") return DEFAULT_SETTINGS;
  const d = raw as Legacy;
  if (d.version !== 2) return fromLegacy(d);
  const whole = settingsSchema.safeParse(d);
  if (whole.success) return whole.data;
  const s: Record<string, unknown> = { ...DEFAULT_SETTINGS };
  for (const [key, schema] of Object.entries(settingsSchema.shape)) {
    const part = schema.safeParse(d[key]);
    if (part.success) s[key] = part.data;
  }
  const merged = settingsSchema.safeParse(s);
  return merged.success ? merged.data : DEFAULT_SETTINGS;
}
