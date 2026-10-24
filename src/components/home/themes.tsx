import Image from "next/image";
import Link from "next/link";
import { Container, SectionSub, SectionTitle, Sprig, cx, reveal, sectionPad } from "@/components/ui";
import { fill, HOME_THEMES, themeScreen, type Settings, type ThemeEntry } from "@/lib/settings";
import { mediaUrl } from "@/lib/storage/media";
import { OfferCard } from "./offer-card";

// Warna latar kartu mengikuti nuansa tiap tema.
const CARD_BG: Record<string, string> = {
  "andi-rina": "bg-[#eadac4]",
  "bagas-sekar": "bg-[#d9d5ce]",
  "hendrawan-larasati": "bg-[#e8dce2]",
  "danang-kinanthi": "bg-[#eadfc8]",
  "fadhil-nayla": "bg-[#e3e0cc]",
  "arya-kirana": "bg-[#ece2cf]",
  "bima-nadia": "bg-[#c9ccd6]",
  "toni-layla": "bg-[#dcd6cc]",
  "arkasa-mentari": "bg-[#f3d9c4]",
  "ivan-mawar": "bg-[#f3dcdc]",
  "galih-ardila": "bg-[#ecd3a8]",
  "bonar-anggi": "bg-[#e8cfc4]",
};

// Bingkai ponsel berisi tangkapan layar tema.
function Phone({ src, alt, className }: { src: string; alt: string; className: string }) {
  return (
    <div className={cx("aspect-[390/844] rounded-[20px] bg-ink p-[4px] shadow-[0_14px_30px_rgba(31,26,23,.22)] transition-transform duration-300 motion-reduce:transform-none", className)}>
      <div className="relative size-full overflow-hidden rounded-[16px] bg-blush">
        <Image src={mediaUrl(src)} alt={alt} fill loading="eager" sizes="(min-width: 640px) 170px, 34vw" className="object-cover object-top" />
      </div>
    </div>
  );
}

// Seluruh kartu satu tautan ke demo tema. animate false untuk kartu di dalam Suspense, karena animasi muncul
// saat digulir mengubah class kartu sebelum bagian itu selesai dimuat.
export function ThemeCard({ theme, index, waHref, animate = true }: { theme: ThemeEntry; index: number; waHref: string; animate?: boolean }) {
  const demo = Boolean(theme.demo);
  return (
    <a
      href={theme.demo || waHref}
      aria-label={demo ? `Lihat demo tema ${theme.name}` : `Tanya tema ${theme.name} lewat WhatsApp`}
      className="group flex flex-col text-ink no-underline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-wine"
      {...(animate ? reveal(index) : {})}
    >
      <div
        className={cx(
          "relative flex h-64 items-center justify-center overflow-hidden rounded-sm border border-line text-sm tracking-[1px] text-wine transition-colors duration-200 group-hover:border-wine sm:h-[400px]",
          CARD_BG[theme.slug] ?? "bg-blush",
        )}
      >
        {theme.image ? (
          <>
            <Phone src={themeScreen(theme)} alt="" className="absolute top-1/2 right-[5%] w-[45%] -translate-y-[44%] rotate-[4deg] group-hover:translate-x-1 group-hover:rotate-[6deg]" />
            <Phone src={theme.image} alt={`Contoh undangan tema ${theme.name}`} className="absolute top-1/2 left-[5%] z-10 w-[50%] -translate-y-[54%] -rotate-[3deg] group-hover:-translate-y-[56%]" />
          </>
        ) : (
          <span>{theme.name}</span>
        )}
      </div>
      <p className="mt-3.5 font-serif text-xl leading-tight transition-colors duration-200 group-hover:text-wine sm:text-2xl">{theme.name}</p>
      {theme.style && <p className="mt-1 text-[13px] text-ink-mute sm:text-[15px]">{theme.style}</p>}
      <span className="mt-4 inline-flex self-start rounded-sm border border-wine px-4 py-2 text-[14px] text-wine transition-colors duration-200 group-hover:bg-wine group-hover:text-white motion-reduce:transition-none sm:text-[15px]">
        {demo ? "Lihat demo" : "Tanya di WhatsApp"}
      </span>
    </a>
  );
}

// Tema di beranda sesuai pilihan dan urutan admin. Bila belum ada yang dipilih, tema aktif pertama.
function homeThemes(s: Settings) {
  const active = s.themes.filter((t) => t.on);
  const picked = s.homeThemes.map((id) => active.find((t) => t.id === id)).filter((t) => t !== undefined);
  return (picked.length ? picked : active).slice(0, HOME_THEMES);
}

export function Themes({ settings, vars, waHref }: { settings: Settings; vars: Record<string, string>; waHref: string }) {
  const sec = settings.sections.tema;
  return (
    <section id="tema" className="relative overflow-x-clip border-y border-line bg-blush">
      <Sprig className="-top-4 -right-8 h-44 -scale-x-100 rotate-[200deg] text-wine/10 lg:-right-6 lg:h-80 lg:text-wine/12" />
      <Container className={cx(sectionPad, "relative")}>
        <SectionTitle {...reveal()}>{sec.title}</SectionTitle>
        {sec.sub && (
          <SectionSub className="mb-7!" {...reveal()}>
            {fill(sec.sub, vars)}
          </SectionSub>
        )}
        <div className="grid grid-cols-2 gap-x-4 gap-y-9 sm:gap-x-5 lg:grid-cols-4">
          {homeThemes(settings).map((t, i) => (
            <ThemeCard key={t.id} theme={t} index={i} waHref={waHref} />
          ))}
        </div>
        <div className="mt-10 flex justify-center" {...reveal()}>
          <Link prefetch={false} href="/tema" className="inline-flex items-center gap-2 rounded-sm border border-wine px-6 py-3 text-[15px] text-wine no-underline transition-colors duration-200 hover:bg-wine hover:text-white">
            Lihat semua tema <span aria-hidden="true">&rarr;</span>
          </Link>
        </div>
        <OfferCard card={sec.custom} vars={vars} className="mt-12" />
      </Container>
    </section>
  );
}
