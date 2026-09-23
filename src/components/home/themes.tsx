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
          <Image
            src={theme.image}
            alt={`Contoh undangan tema ${theme.name}`}
            fill
            sizes="(min-width: 760px) 340px, 100vw"
            className="object-cover transition-transform duration-500 group-hover:scale-[1.04] motion-reduce:transform-none"
          />
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
