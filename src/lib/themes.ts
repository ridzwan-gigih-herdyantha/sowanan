// TODO: isi nama tema, gaya, screenshot (/img/tema-N.webp, maks 200KB), dan slug contoh ke-3.
export type ThemeCard = {
  slug: string | null;
  name: string;
  style: string;
  image: string | null;
  bg: string;
};

export const THEMES: ThemeCard[] = [
  { slug: "andi-rina", name: "[NAMA TEMA]", style: "[GAYA: klasik / minimalis / bunga]", image: null, bg: "bg-ivory" },
  { slug: "bagas-sekar", name: "[NAMA TEMA]", style: "[GAYA: klasik / minimalis / bunga]", image: null, bg: "bg-[#efe6df]" },
  { slug: "hendrawan-larasati", name: "[NAMA TEMA]", style: "[GAYA: klasik / minimalis / bunga]", image: null, bg: "bg-[#e9e2da]" },
];
