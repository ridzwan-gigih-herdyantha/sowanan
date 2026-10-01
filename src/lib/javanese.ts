const PASARAN = ["Legi", "Pahing", "Pon", "Wage", "Kliwon"] as const;
const ZONES = { WIB: "Asia/Jakarta", WITA: "Asia/Makassar", WIT: "Asia/Jayapura" } as const;

// Acuan: 17 Agustus 1945 jatuh pada Jumat Legi.
const REF = Date.UTC(1945, 7, 17);

export function pasaran(iso: string, tz: keyof typeof ZONES = "WIB"): string {
  const [y, m, d] = new Intl.DateTimeFormat("en-CA", { timeZone: ZONES[tz], year: "numeric", month: "2-digit", day: "2-digit" })
    .format(new Date(iso))
    .split("-")
    .map(Number);
  const days = Math.round((Date.UTC(y, m - 1, d) - REF) / 86400000);
  return PASARAN[((days % 5) + 5) % 5];
}

// Angka Jawa ꧐ sampai ꧙
export const angkaJawa = (value: number | string) => String(value).replace(/\d/g, (c) => String.fromCharCode(0xa9d0 + Number(c)));
