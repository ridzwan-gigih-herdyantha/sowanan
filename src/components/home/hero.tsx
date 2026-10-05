import { Inline, paragraphs } from "@/components/rich-text";
import { Container, btn } from "@/components/ui";
import { fill, resolveHref, type Settings } from "@/lib/settings";
import { mediaUrl } from "@/lib/storage/media";
import { HeroSlider } from "./hero-slider";

type Props = { settings: Settings; vars: Record<string, string>; waHref: string };

export function Hero({ settings, vars, waHref }: Props) {
  const h = settings.hero;
  // Slider memakai tema yang tampil di bagian Pilihan tema dan punya gambar sampul.
  const slides = settings.themes
    .filter((t) => t.on && t.image)
    .map((t) => ({ name: t.name, style: t.style, image: mediaUrl(t.image), href: t.demo || waHref }));
  return (
    <section>
      <Container className="flex flex-col items-stretch gap-11 pt-11 pb-10 sm:pt-16 sm:pb-14 md:flex-row md:items-center lg:gap-[144px] lg:pt-[clamp(36px,8svh,84px)] lg:pb-[clamp(36px,8svh,76px)]">
        <div className="flex-auto md:max-w-[560px]">
          {h.eyebrow && <p className="mb-[22px] text-[13px] tracking-[3px] text-wine uppercase">{fill(h.eyebrow, vars)}</p>}
          <h1 className="mb-6 font-serif text-[clamp(38px,6vw,64px)] leading-[1.06] font-medium">{fill(h.title, vars)}</h1>
          {paragraphs(fill(h.sub, vars)).map((p, i) => (
            <p key={i} className="mb-[18px] max-w-[62ch] text-[clamp(16px,1.6vw,19px)] leading-[1.65] text-ink-soft">
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
          {h.note && <p className="mt-[26px] text-[15px] text-ink-mute">{fill(h.note, vars)}</p>}
        </div>

        <HeroSlider slides={slides} />
      </Container>
    </section>
  );
}
