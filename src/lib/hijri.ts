// Tanggal Hijriah (kalender Ummul Qura) dan angka Arab untuk tema islami.
const MONTHS = ["Muharram", "Safar", "Rabiul Awal", "Rabiul Akhir", "Jumadil Awal", "Jumadil Akhir", "Rajab", "Sya'ban", "Ramadhan", "Syawal", "Dzulqa'dah", "Dzulhijjah"];
const ZONES = { WIB: "Asia/Jakarta", WITA: "Asia/Makassar", WIT: "Asia/Jayapura" } as const;

export function hijri(iso: string, tz: keyof typeof ZONES = "WIB") {
  const parts = new Intl.DateTimeFormat("en-u-ca-islamic-umalqura-nu-latn", { timeZone: ZONES[tz], day: "numeric", month: "numeric", year: "numeric" }).formatToParts(new Date(iso));
  const get = (t: string) => Number(parts.find((p) => p.type === t)?.value ?? 0);
  return `${get("day")} ${MONTHS[get("month") - 1]} ${get("year")} H`;
}

const ARABIC = "٠١٢٣٤٥٦٧٨٩";
export const angkaArab = (v: string | number) => String(v).replace(/[0-9]/g, (d) => ARABIC[Number(d)]);
