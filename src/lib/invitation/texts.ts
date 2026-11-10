// Teks tetap di tiap bagian undangan (label, judul, petunjuk, tombol). Tiap tema mendaftarkan teks bawaannya per
// grup editor, mempelai boleh menggantinya. Isian kosong berarti memakai bawaan tema.
// Kode dalam kurung kurawal diganti data undangan, jadi teks tetap ikut bila nama atau tanggal diubah.
export const TOKENS = {
  pria: "nama panggilan mempelai pria",
  wanita: "nama panggilan mempelai wanita",
  tanggal: "tanggal singkat",
  hari: "hari dan tanggal lengkap",
  koleksi: "nomor koleksi",
  tempat: "kota",
} as const;
export type TokenValues = Record<keyof typeof TOKENS, string>;

// [nama isian di editor, teks bawaan]
export type TextSlot = [label: string, value: string];
export type ThemeTexts = Record<string, Record<string, TextSlot>>;

export const textPath = (group: string, slot: string) => `copy.texts.${group}.${slot}`;

const fill = (value: string, vars: TokenValues) => value.replace(/\{(\w+)\}/g, (all, k: string) => (k in vars ? vars[k as keyof TokenValues] : all));

// Teks yang dipakai tema per grup, dan tanda mana yang diganti mempelai. Tema memakai tanda itu untuk teks bawaan yang
// punya gaya khusus, misalnya tanda & bergaya miring di antara nama.
export function resolveTexts(defs: ThemeTexts = {}, own: Record<string, Record<string, string>> = {}, vars: TokenValues) {
  const texts: Record<string, Record<string, string>> = {};
  const custom: Record<string, Record<string, boolean>> = {};
  for (const [group, slots] of Object.entries(defs)) {
    texts[group] = {};
    custom[group] = {};
    for (const [slot, [, value]] of Object.entries(slots)) {
      const mine = own[group]?.[slot]?.trim() ?? "";
      texts[group][slot] = fill(mine || value, vars);
      custom[group][slot] = Boolean(mine);
    }
  }
  return { texts, custom };
}
