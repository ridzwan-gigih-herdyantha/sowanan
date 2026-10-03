import Image from "next/image";
import { Inline } from "@/components/rich-text";
import { Container, SectionSub, SectionTitle, cx, reveal, sectionPad } from "@/components/ui";
import { fill, type Settings, type ThemeEntry } from "@/lib/settings";
import { mediaUrl } from "@/lib/storage/media";

// Warna latar kartu mengikuti nuansa tiap tema.
const CARD_BG: Record<string, string> = {
  "andi-rina": "bg-[#eadac4]",
  "bagas-sekar": "bg-[#d9d5ce]",
  "hendrawan-larasati": "bg-[#e8dce2]",
  "danang-kinanthi": "bg-[#eadfc8]",
  "fadhil-nayla": "bg-[#e3e0cc]",
};

function Card({ theme, index, waHref }: { theme: ThemeEntry; index: number; waHref: string }) {
  return (
    <a href={theme.demo || waHref} className="group block text-inherit no-underline" {...reveal(index)}>
      <div
        className={cx(
          "relative flex h-80 items-center justify-center overflow-hidden rounded-sm border border-line text-sm tracking-[1px] text-wine transition-colors duration-200 group-hover:border-wine sm:h-[400px]",
          CARD_BG[theme.slug] ?? "bg-blush",
        )}
      >
        {theme.image ? (
          <div className="aspect-[390/844] h-[88%] rounded-[22px] bg-ink p-[5px] shadow-[0_14px_30px_rgba(31,26,23,.22)] transition-transform duration-300 group-hover:-translate-y-1 motion-reduce:transform-none">
            <div className="relative size-full overflow-hidden rounded-[17px]">
              <Image
                src={mediaUrl(theme.image)}
                alt={`Contoh undangan tema ${theme.name}`}
                fill
                loading="eager"
                sizes="(min-width: 640px) 170px, 50vw"
                className="object-cover object-top"
              />
            </div>
          </div>
        ) : (
          <span>{theme.name}</span>
        )}
      </div>
      <p className="mt-3.5 font-serif text-2xl transition-colors duration-200 group-hover:text-wine">{theme.name}</p>
      {theme.style && <p className="mt-[3px] text-sm text-ink-mute">{theme.style}</p>}
    </a>
  );
}

export function Themes({ settings, vars, waHref }: { settings: Settings; vars: Record<string, string>; waHref: string }) {
  const sec = settings.sections.tema;
  return (
    <section id="tema" className="border-y border-line bg-blush">
      <Container className={sectionPad}>
        <SectionTitle {...reveal()}>{sec.title}</SectionTitle>
        {sec.sub && <SectionSub {...reveal()}>{fill(sec.sub, vars)}</SectionSub>}
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-3 md:gap-5 lg:grid-cols-5">
          {settings.themes
            .filter((t) => t.on)
            .map((t, i) => (
              <Card key={t.id} theme={t} index={i} waHref={waHref} />
            ))}
        </div>
        {sec.foot && (
          <p className="mt-9 text-base text-ink-body" {...reveal()}>
            <Inline text={fill(sec.foot, vars)} />
          </p>
        )}
      </Container>
    </section>
  );
}
