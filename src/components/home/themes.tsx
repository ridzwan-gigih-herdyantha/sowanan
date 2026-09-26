import Image from "next/image";
import { Container, SectionSub, SectionTitle, cx, reveal, sectionPad } from "@/components/ui";
import { THEMES, type ThemeCard } from "@/lib/themes";

function Card({ theme, index, waHref }: { theme: ThemeCard; index: number; waHref: string }) {
  return (
    <a href={theme.slug ? `/${theme.slug}` : waHref} className="group block text-inherit no-underline" {...reveal(index)}>
      <div
        className={cx(
          "relative flex h-80 items-center justify-center overflow-hidden rounded-sm border border-line text-sm tracking-[1px] text-wine transition-colors duration-200 group-hover:border-wine sm:h-[400px]",
          theme.bg,
        )}
      >
        {theme.image ? (
          <div className="aspect-[390/844] h-[88%] rounded-[22px] bg-ink p-[5px] shadow-[0_14px_30px_rgba(31,26,23,.22)] transition-transform duration-300 group-hover:-translate-y-1 motion-reduce:transform-none">
            <div className="relative size-full overflow-hidden rounded-[17px]">
              <Image
                src={theme.image}
                alt={`Contoh undangan tema ${theme.name}`}
                fill
                loading="eager"
                sizes="(min-width: 760px) 170px, 50vw"
                className="object-cover object-top"
              />
            </div>
          </div>
        ) : (
          <span>[SCREENSHOT TEMA {index + 1}]</span>
        )}
      </div>
      <p className="mt-3.5 font-serif text-2xl transition-colors duration-200 group-hover:text-wine">{theme.name}</p>
      <p className="mt-[3px] text-sm text-ink-mute">{theme.style}</p>
    </a>
  );
}

export function Themes({ waHref }: { waHref: string }) {
  return (
    <section id="tema" className="border-y border-line bg-blush">
      <Container className={sectionPad}>
        <SectionTitle {...reveal()}>Pilihan tema</SectionTitle>
        <SectionSub {...reveal()}>
          Pilih satu, lalu warnanya kami sesuaikan dengan tema acara kalian. Klik untuk membuka contoh aslinya.
        </SectionSub>
        <div className="grid grid-cols-1 gap-6 md:grid-cols-3 md:gap-7">
          {THEMES.map((t, i) => (
            <Card key={i} theme={t} index={i} waHref={waHref} />
          ))}
        </div>
        <p className="mt-9 text-base text-ink-body" {...reveal()}>
          Mau gaya yang belum ada di sini? <a href={waHref}>Kirim contohnya lewat WhatsApp</a>, kami buatkan.
        </p>
      </Container>
    </section>
  );
}
