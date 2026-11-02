// node --no-warnings scripts/google-fonts.ts
// Perbarui daftar font di src/themes/google-fonts.ts dari katalog Google Fonts. Jalankan bila ada font baru yang diminta.
import { writeFileSync } from "node:fs";

type Family = { family: string; category: string; classifications?: string[]; subsets: string[] };

const raw = await (await fetch("https://fonts.google.com/metadata/fonts")).text();
const { familyMetadataList: all } = JSON.parse(raw.slice(raw.indexOf("{"))) as { familyMetadataList: Family[] };

const tagged = (f: Family, ...tags: string[]) => tags.includes(f.category) || tags.some((t) => f.classifications?.includes(t));
// Undangan berbahasa Indonesia, jadi font tanpa huruf Latin dan font simbol tidak ditawarkan.
const usable = all.filter((f) => f.subsets.includes("latin") && !tagged(f, "Symbols"));
const names = (list: Family[]) => list.map((f) => f.family).sort();
const decorative = (f: Family) => tagged(f, "Display", "Handwriting");

const out = `// Dibuat oleh scripts/google-fonts.ts, jangan diubah manual.
// Font tulisan tangan dan dekoratif hanya untuk judul dan nama mempelai, font teks boleh untuk semua tempat.
export const GOOGLE_TEXT_FONTS: readonly string[] = ${JSON.stringify(names(usable.filter((f) => !decorative(f))))};
export const GOOGLE_DECORATIVE_FONTS: readonly string[] = ${JSON.stringify(names(usable.filter(decorative)))};
`;
writeFileSync(new URL("../src/themes/google-fonts.ts", import.meta.url), out.replace(/\n/g, "\r\n"));
console.log(`${usable.length} font`);
