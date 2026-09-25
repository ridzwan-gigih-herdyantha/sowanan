export type ThemeCard = {
  slug: string | null;
  name: string;
  style: string;
  image: string | null;
  bg: string;
};

export const THEMES: ThemeCard[] = [
  { slug: "andi-rina", name: "Senja Kota", style: "film / urban", image: "/img/tema-andi-rina.webp", bg: "bg-[#eadac4]" },
  { slug: "bagas-sekar", name: "Ruang", style: "monokrom / minimalis", image: "/img/tema-bagas-sekar.webp", bg: "bg-[#d9d5ce]" },
  { slug: "hendrawan-larasati", name: "Herbarium", style: "bunga / botani", image: "/img/tema-hendrawan-larasati.webp", bg: "bg-[#e8dce2]" },
];
