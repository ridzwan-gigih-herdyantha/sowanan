import { Container, SectionSub, SectionTitle, reveal, sectionPad } from "@/components/ui";
import { demoHref, demoPackages, TOP_PACKAGE } from "@/lib/invitation/demo-packages";
import { fill, PACKAGE_IDS, PACKAGE_NAMES, type Settings, type ThemeEntry } from "@/lib/settings";
import { mediaUrl } from "@/lib/storage/media";
import { OfferCard } from "./offer-card";
import { ThemeGallery, type GalleryTheme } from "./theme-gallery";

// Warna latar kartu mengikuti nuansa tiap tema.
const CARD_BG: Record<string, string> = {
  "andi-rina": "bg-[#eadac4]",
  "bagas-sekar": "bg-[#d9d5ce]",
  "hendrawan-larasati": "bg-[#e8dce2]",
  "danang-kinanthi": "bg-[#eadfc8]",
  "fadhil-nayla": "bg-[#e3e0cc]",
};

// Demo bawaan (/slug) bisa dilihat per paket. Kalau tema belum tersedia di paket yang dipilih, kartu menuju paket
// terendah yang memuatnya. Tautan demo lain, misalnya ke luar situs, tetap satu tautan.
function galleryTheme(s: Settings, t: ThemeEntry, waHref: string): GalleryTheme {
  const links: GalleryTheme["links"] = {};
  if (t.demo === `/${t.slug}`) {
    const pkgs = demoPackages(s, t.slug);
    const first = pkgs.find((p) => p.available);
    for (const p of pkgs) {
      if (p.available) links[p.id] = { href: demoHref(t.slug, p.id) };
      else if (first) links[p.id] = { href: demoHref(t.slug, first.id), note: `Mulai paket ${first.name}` };
    }
  }
  return {
    id: t.id,
    name: t.name,
    style: t.style,
    image: t.image ? mediaUrl(t.image) : "",
    bg: CARD_BG[t.slug] ?? "bg-blush",
    label: t.demo ? `Lihat demo tema ${t.name}` : `Tanya tema ${t.name} lewat WhatsApp`,
    links,
    href: t.demo || waHref,
  };
}

export function Themes({ settings, vars, waHref }: { settings: Settings; vars: Record<string, string>; waHref: string }) {
  const sec = settings.sections.tema;
  const packages = PACKAGE_IDS.filter((id) => settings.packages[id].on).map((id) => ({ id, name: PACKAGE_NAMES[id] }));
  return (
    <section id="tema" className="border-y border-line bg-blush">
      <Container className={sectionPad}>
        <ThemeGallery
          header={
            <>
              <SectionTitle {...reveal()}>{sec.title}</SectionTitle>
              {sec.sub && (
                <SectionSub className="mb-0" {...reveal()}>
                  {fill(sec.sub, vars)}
                </SectionSub>
              )}
            </>
          }
          themes={settings.themes.filter((t) => t.on).map((t) => galleryTheme(settings, t, waHref))}
          packages={packages}
          initial={packages.some((p) => p.id === TOP_PACKAGE) ? TOP_PACKAGE : (packages.at(-1)?.id ?? TOP_PACKAGE)}
        />
        <OfferCard card={sec.custom} vars={vars} className="mt-12" />
      </Container>
    </section>
  );
}
