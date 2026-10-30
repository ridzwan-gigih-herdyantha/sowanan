import Image from "next/image";
import Link from "next/link";
import { Container, SectionSub, SectionTitle, Sprig, cx, reveal, sectionPad } from "@/components/ui";
import { fill, HOME_THEMES, themeScreen, type Settings, type ThemeEntry } from "@/lib/settings";
import { mediaUrl } from "@/lib/storage/media";
import { OfferCard } from "./offer-card";
import { Corner } from "@/components/invitation/sutra/ornaments";

// Warna latar kartu mengikuti nuansa tiap tema.
const CARD_BG: Record<string, string> = {
  "andi-rina": "bg-[#eadac4]",
  "bagas-sekar": "bg-[#d9d5ce]",
  "hendrawan-larasati": "bg-[#e8dce2]",
  "danang-kinanthi": "bg-[#eadfc8]",
  "fadhil-nayla": "bg-[#e3e0cc]",
  "arya-kirana": "bg-[#ece2cf]",
  "raka-anindya": "bg-[#e9e0d2]",
  "bima-nadia": "bg-[#c9ccd6]",
  "toni-layla": "bg-[#dcd6cc]",
  "arkasa-mentari": "bg-[#f3d9c4]",
  "ivan-mawar": "bg-[#f3dcdc]",
  "galih-ardila": "bg-[#ecd3a8]",
  "bonar-anggi": "bg-[#e8cfc4]",
  // Hijau taman di depan gedung pada peta Isometrik.
  "rafi-kayla": "bg-[#d5e5c6]",
};

// Bingkai ponsel berisi tangkapan layar tema.
function Phone({ src, alt, className, elaris = false, elarisCover = false, mawaddahDoor = false, nocturneCover = false, nocturneScreen = false }: { src: string; alt: string; className: string; elaris?: boolean; elarisCover?: boolean; mawaddahDoor?: boolean; nocturneCover?: boolean; nocturneScreen?: boolean }) {
  return (
    <div className={cx("aspect-[390/844] rounded-[20px] bg-ink p-[4px] shadow-[0_14px_30px_rgba(31,26,23,.22)] transition-transform duration-300 motion-reduce:transform-none", className)}>
      <div className={cx("relative size-full overflow-hidden rounded-[16px] bg-blush", elaris && "flex flex-col bg-[#f5f2e9]", elarisCover && "bg-[#fbf8f0] p-[5px]", mawaddahDoor && "bg-[#143e42]", (nocturneCover || nocturneScreen) && "bg-[#090708]")}>
        {nocturneCover ? (
          <div className="relative size-full overflow-hidden rounded-[16px] bg-[#090708] text-[#f0e8df]">
            <Image src={mediaUrl(src)} alt="" fill loading="eager" sizes="(min-width: 640px) 170px, 34vw" className="object-cover object-[50%_35%] opacity-[.12] grayscale" />
            <div aria-hidden="true" className="absolute inset-0 bg-[linear-gradient(180deg,rgba(9,7,8,.8),rgba(9,7,8,.88)_48%,rgba(9,7,8,.98))]" />
            <div aria-hidden="true" className="absolute inset-[4%] border border-[#c59a68]/50" />
            <div className="absolute inset-[10%] flex flex-col items-center justify-between py-[8%] text-center">
              <div className="w-full">
                <p className="text-[clamp(4px,.48vw,6px)] tracking-[.2em] text-[#c59a68] uppercase">Nocturne · Invitation</p>
                <p className="mt-1 text-[clamp(4px,.44vw,5.5px)] tracking-[.12em] text-[#f0e8df]/65 uppercase">Sabtu, 30 Oktober 2027</p>
              </div>
              <div className="flex flex-col items-center">
                <p className="text-[clamp(4px,.46vw,6px)] tracking-[.2em] text-[#f0e8df]/70 uppercase">A love letter after dark</p>
                <span className="mt-[15%] grid size-[34px] place-items-center rounded-full border border-[#c59a68]/65 font-serif text-[clamp(6px,.7vw,9px)] tracking-[.08em] text-[#c59a68]">D &amp; E</span>
                <h2 className="mt-[14%] font-serif text-[clamp(10px,1.05vw,14px)] leading-[1.05] tracking-[-.015em] text-[#f0e8df]">Damar <span className="text-[#c59a68]">&amp;</span> Elara</h2>
                <p className="mt-[9%] max-w-[25ch] font-serif text-[clamp(5px,.5vw,7px)] italic leading-[1.4] text-[#f0e8df]/75">Sebuah malam, dua hati, satu janji.</p>
              </div>
              <div className="flex flex-col items-center">
                <span className="whitespace-nowrap border border-[#c59a68]/70 px-2 py-1 text-[clamp(4px,.45vw,5.5px)] tracking-[.14em] text-[#f0e8df] uppercase">Buka undangan →</span>
                <p className="mt-3 border-t border-[#c59a68]/30 pt-2 text-[clamp(4px,.43vw,5.5px)] tracking-[.13em] text-[#c59a68] uppercase">Maison Arang · Bandung</p>
              </div>
            </div>
          </div>
        ) : nocturneScreen ? (
          <div className="relative size-full overflow-hidden rounded-[16px] bg-[#090708] text-[#f0e8df]">
            <div className="absolute inset-0 flex">
              <div className="relative z-10 flex w-[49%] flex-col justify-between border-r border-[#c59a68]/35 bg-[#090708] px-[7%] py-[10%]">
                <div>
                  <p className="text-[clamp(4px,.42vw,5.5px)] tracking-[.14em] text-[#c59a68] uppercase">Nocturne</p>
                  <p className="mt-1 text-[clamp(4px,.4vw,5px)] tracking-[.08em] text-[#f0e8df]/65 uppercase">30 Oktober 2027</p>
                </div>
                <div>
                  <h2 className="font-serif text-[clamp(9px,.95vw,13px)] leading-[1.04]">Damar<br /><span className="text-[#c59a68]">&amp;</span><br />Elara</h2>
                  <p className="mt-[13%] font-serif text-[clamp(4px,.44vw,6px)] italic leading-[1.35] text-[#f0e8df]/75">Di bawah cahaya redup, kami memilih satu sama lain.</p>
                </div>
                <div>
                  <p className="text-[clamp(4px,.4vw,5px)] leading-[1.35] tracking-[.08em] text-[#c59a68] uppercase">Maison Arang<br />Bandung</p>
                  <span className="mt-2 inline-flex whitespace-nowrap border border-[#c59a68]/60 px-1.5 py-1 text-[clamp(4px,.4vw,5px)] tracking-[.1em] uppercase">Jelajahi →</span>
                </div>
              </div>
              <div className="relative min-w-0 flex-1">
                <Image src={mediaUrl(src)} alt="" fill loading="eager" sizes="(min-width: 640px) 170px, 34vw" className="object-cover object-[58%_38%] grayscale" />
                <div aria-hidden="true" className="absolute inset-0 bg-[linear-gradient(180deg,rgba(9,7,8,.08),transparent_58%,rgba(9,7,8,.42))]" />
                <span className="absolute right-1 bottom-[8%] left-1 text-center text-[clamp(4px,.4vw,5px)] tracking-[.1em] text-[#f0e8df]/90 uppercase">Damar &amp; Elara</span>
              </div>
            </div>
            <div aria-hidden="true" className="absolute inset-[4%] border border-[#c59a68]/45" />
          </div>
        ) : mawaddahDoor ? (
          <div className="relative size-full overflow-hidden rounded-[16px] bg-[#143e42] text-center text-[#f6e7c7]">
            <div aria-hidden="true" className="absolute inset-0 opacity-50" style={{ backgroundImage: "repeating-linear-gradient(45deg, transparent 0 17px, rgba(216,188,134,.16) 18px 19px), radial-gradient(circle, rgba(216,188,134,.12) 1px, transparent 1.5px)", backgroundSize: "auto, 18px 18px" }} />
            <div aria-hidden="true" className="absolute inset-[4%] border border-[#55a0a0]/65" />
            <div aria-hidden="true" className="absolute inset-[6%] border border-[#55a0a0]/30" />
            <div aria-hidden="true" className="absolute left-1/2 top-[50%] aspect-square w-[86%] -translate-x-1/2 -translate-y-1/2 rotate-45 border border-[#b96f4e]/55" />
            <div aria-hidden="true" className="absolute left-1/2 top-[50%] aspect-square w-[62%] -translate-x-1/2 -translate-y-1/2 rotate-45 border border-[#55a0a0]/55" />
            <div aria-hidden="true" className="absolute left-1/2 top-[50%] aspect-square w-[70%] -translate-x-1/2 -translate-y-1/2 rounded-full border border-[#55a0a0]/20" />
            <div aria-hidden="true" className="absolute left-1/2 top-[50%] aspect-square w-[54%] -translate-x-1/2 -translate-y-1/2 rounded-full border border-[#55a0a0]/25" />
            <p className="absolute left-0 right-0 top-[31%] text-[5px] tracking-[.25em] text-[#f6e7c7] uppercase">Mawaddah · Walimatul &lsquo;Ursy</p>
            <span className="absolute left-1/2 top-[50%] grid size-[28%] -translate-x-1/2 -translate-y-1/2 place-items-center border border-[#55a0a0]/60 font-serif text-[clamp(18px,2.2vw,28px)] tracking-[.12em] text-[#f6e7c7]">F <span className="text-[.6em]">&amp;</span> N</span>
            <p className="absolute left-1/2 top-[68%] w-[72%] -translate-x-1/2 font-serif text-[clamp(8px,1.1vw,12px)] italic leading-snug text-[#f6e7c7]/90">Sebuah ikrar, dalam kasih dan rahmat-Nya.</p>
            <p className="absolute left-0 right-0 top-[77%] text-[5px] tracking-[.18em] text-[#f6e7c7]/85 uppercase">22 Jumadil Akhir 1449 H</p>
          </div>
        ) : elarisCover ? (
          <div className="relative flex size-full flex-col items-center border border-[#b49a63]/80 px-1.5 text-center text-[#493b23]">
            <div aria-hidden="true" className="absolute inset-[3px] border border-[#b49a63]/35" />
            {(["tl", "tr", "bl", "br"] as const).map((at, i) => <Corner key={at} at={at} size="size-5 sm:size-8" className="m-1.5 text-[#b49a63]" order={i} />)}
            <span className="relative mt-[24%] text-[5px] tracking-[.28em] uppercase">Undangan Pernikahan</span>
            <span className="relative mt-[15%] grid size-[27%] place-items-center rounded-full border border-[#b49a63] font-serif text-[10px] text-[#493b23] shadow-[inset_0_0_0_3px_#fbf8f0,inset_0_0_0_4px_#b49a63]/45">R<span className="text-[7px]">&amp;</span>A</span>
            <span className="relative mt-[12%] text-[4px] tracking-[.24em] text-[#9a8357] uppercase">Dengan penuh syukur</span>
            <span className="relative mt-[5%] font-serif text-[clamp(10px,1.55vw,16px)] leading-[1.15] italic">Raka &amp; Anindya</span>
            <span aria-hidden="true" className="relative mt-[10%] h-px w-[58%] bg-[#b49a63]/70" />
            <span className="relative mt-[8%] text-[4px] tracking-[.18em] uppercase">Minggu · 14 Februari 2027</span>
            <span className="relative mt-[4%] max-w-[20ch] font-serif text-[6px] leading-[1.35]">Taman Sari · Sleman</span>
            <span className="relative mt-auto mb-[18%] border border-[#b49a63]/75 px-2 py-1 text-[4px] tracking-[.2em] uppercase">Buka Undangan</span>
          </div>
        ) : elaris ? (
          <>
            <div className="relative h-[54%] shrink-0 overflow-hidden">
              <Image src={mediaUrl(src)} alt={alt} fill loading="eager" sizes="(min-width: 640px) 170px, 34vw" className="object-cover object-[50%_32%]" />
            </div>
            <div className="relative flex min-h-0 flex-1 flex-col items-center justify-center border-t border-[#b49a63]/55 px-1.5 text-center text-[#263d2a]">
              <span aria-hidden="true" className="absolute inset-[5px] border border-[#b49a63]/35" />
              <span className="relative text-[5px] tracking-[.22em] uppercase">Undangan Pernikahan</span>
              <span className="relative mt-[7%] font-serif text-[clamp(8px,1.35vw,14px)] leading-none">Raka &amp; Anindya</span>
              <span aria-hidden="true" className="relative mt-[7%] h-px w-1/2 bg-[#b49a63]/70" />
              <span className="relative mt-[6%] max-w-[18ch] font-serif text-[clamp(5px,.72vw,8px)] italic leading-[1.5]">Dengan penuh syukur, kami mengundang Anda untuk merayakan hari bahagia kami.</span>
              <span className="relative mt-[7%] text-[4px] tracking-[.18em] uppercase">Minggu · 14 Februari 2027</span>
              <span className="relative mt-[4%] text-[4px] tracking-[.14em] uppercase">Sleman · Yogyakarta</span>
            </div>
          </>
        ) : (
          <Image src={mediaUrl(src)} alt={alt} fill loading="eager" sizes="(min-width: 640px) 170px, 34vw" className="object-cover object-top" />
        )}
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
            <Phone src={theme.slug === "faris-najwa" ? theme.image : themeScreen(theme)} alt={theme.slug === "faris-najwa" ? `Tampilan undangan setelah dibuka: foto dan nama pasangan ${theme.name}` : ""} elaris={theme.slug === "raka-anindya"} nocturneScreen={theme.slug === "damar-elara"} className="absolute top-1/2 right-[5%] w-[45%] -translate-y-[44%] rotate-[4deg] group-hover:translate-x-1 group-hover:rotate-[6deg]" />
            <Phone src={theme.slug === "damar-elara" ? themeScreen(theme) : theme.image} alt={`Cover pembuka tema ${theme.name}`} elarisCover={theme.slug === "raka-anindya"} mawaddahDoor={theme.slug === "faris-najwa"} nocturneCover={theme.slug === "damar-elara"} className="absolute top-1/2 left-[5%] z-10 w-[50%] -translate-y-[54%] -rotate-[3deg] group-hover:-translate-y-[56%]" />
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
