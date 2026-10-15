import { Inline, paragraphs } from "@/components/rich-text";
import { Container, Sprig, btn } from "@/components/ui";
import { fill, resolveHref, type Settings } from "@/lib/settings";
import { mediaUrl } from "@/lib/storage/media";
import { HeroSlider } from "./hero-slider";
import { LineArt, Scribble } from "./line-art";

type Props = { settings: Settings; vars: Record<string, string>; waHref: string };

const ICONS = {
  check: <path d="M5 12.5l4.5 4.5L19 7.5" />,
  share: <path d="M12 15V4m0 0L8 8m4-4l4 4M5 13v5a2 2 0 002 2h10a2 2 0 002-2v-5" />,
  gift: (
    <>
      <rect x="4" y="9" width="16" height="11" rx="1.5" />
      <path d="M3 9h18M12 9v11M12 9c-1.5-4-6-4-6-1.5S10 9 12 9zm0 0c1.5-4 6-4 6-1.5S14 9 12 9z" />
    </>
  ),
};

// Kartu kecil yang melayang di sisi HP hero. Hanya di layar lebar, di HP ruangnya dipakai untuk HP itu sendiri.
function FloatChip({ className, icon, title, note }: { className: string; icon: keyof typeof ICONS; title: string; note: string }) {
  return (
    <div aria-hidden="true" className={`home-float absolute z-10 hidden items-center gap-3 rounded-xl border border-line bg-white/90 px-3.5 py-2.5 shadow-[0_12px_30px_rgba(31,26,23,.12)] backdrop-blur-sm md:flex ${className}`}>
      <span className="grid size-8 shrink-0 place-items-center rounded-full bg-blush text-wine">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="size-4">
          {ICONS[icon]}
        </svg>
      </span>
      <span className="leading-tight">
        <span className="block text-[13px] font-medium whitespace-nowrap text-ink">{title}</span>
        <span className="block text-[11px] whitespace-nowrap text-ink-mute">{note}</span>
      </span>
    </div>
  );
}

export function Hero({ settings, vars, waHref }: Props) {
  const h = settings.hero;
  // Slider memakai tema yang tampil di bagian Pilihan tema dan punya gambar sampul.
  const slides = settings.themes
    .filter((t) => t.on && t.image)
    .map((t) => ({ name: t.name, style: t.style, image: mediaUrl(t.image), href: t.demo || waHref }));
  return (
    <section className="relative overflow-hidden">
      <Sprig className="-bottom-6 -left-6 h-44 text-wine/10 lg:-left-4 lg:h-72 lg:text-wine/15" />
      {/* Hiasan khusus HP: cahaya lembut, coretan dari pojok kanan atas, dan mawar kecil di samping judul. */}
      <div aria-hidden="true" className="pointer-events-none absolute -top-54 -right-24 size-80 md:size-[520px] rounded-full bg-[radial-gradient(closest-side,rgba(124,43,62,.15),transparent)]" />
      <Scribble kind="atas" className="top-0 right-0 w-[78vw] text-wine/15 md:hidden" />
      <LineArt kind="mawar" className="top-[280px] right-3 w-14 opacity-30 md:hidden" />
      <Container className="relative flex flex-col items-stretch gap-11 pt-11 pb-10 sm:pt-16 sm:pb-14 md:flex-row md:items-center lg:gap-[144px] lg:pt-[clamp(36px,8svh,84px)] lg:pb-[clamp(36px,8svh,76px)]">
        <div className="flex-auto md:max-w-[560px]">
          {h.eyebrow && <p className="mb-[22px] text-[14px] tracking-[3px] text-wine uppercase">{fill(h.eyebrow, vars)}</p>}
          <h1 className="mb-6 font-serif text-[clamp(46px,7.4vw,84px)] leading-[1.0] font-medium tracking-[-0.01em]">{fill(h.title, vars)}</h1>
          {paragraphs(fill(h.sub, vars)).map((p, i) => (
            <p key={i} className="mb-7 max-w-[46ch] text-[clamp(14px,1.2vw,16px)] leading-[1.65] text-ink-soft">
              <Inline text={p} />
            </p>
          ))}
          <div className="flex flex-col items-stretch gap-4 text-center sm:flex-row sm:flex-wrap sm:items-center sm:text-left">
            <a href={resolveHref(h.cta1Href, waHref)} className={btn.primary}>
              {h.cta1}
            </a>
            {h.cta2 && (
              <a href={resolveHref(h.cta2Href, waHref)} className={btn.ghost}>
                {h.cta2}
              </a>
            )}
          </div>
          {h.note && <p className="mt-[26px] text-[16px] text-ink-mute">{fill(h.note, vars)}</p>}
        </div>

        {/* Cahaya lembut di belakang HP dan dua kartu kecil yang melayang, menunjukkan fitur tanpa perlu dibaca. */}
        <div className="relative isolate mx-auto w-full flex-none md:mx-0 md:w-auto">
          <div aria-hidden="true" className="pointer-events-none absolute -inset-[22%] -z-10 rounded-full bg-[radial-gradient(closest-side,rgba(122,31,52,.14),rgba(244,234,230,.5)_55%,transparent)]" />
          <HeroSlider slides={slides} />
          <FloatChip className="top-[8%] -left-[46%]" icon="check" title="Konfirmasi hadir" note="124 tamu sudah membalas" />
          <FloatChip className="-right-[40%] bottom-[22%] [animation-delay:-2.5s]" icon="gift" title="Amplop digital" note="Rekening dan QRIS" />
          <FloatChip className="bottom-[6%] -left-[40%] [animation-delay:-1.2s]" icon="share" title="Sebar tanpa batas" note="Satu link untuk semua tamu" />
        </div>
      </Container>
    </section>
  );
}
