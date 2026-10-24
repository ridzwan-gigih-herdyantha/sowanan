import { WaIcon } from "@/components/home/closing";
import { Inline } from "@/components/rich-text";
import { Container, SectionSub, SectionTitle, reveal, sectionPad } from "@/components/ui";
import { LineArt } from "./line-art";
import { fill, type Settings } from "@/lib/settings";

// Dua kolom di layar lebar: judul menempel di kiri, pertanyaan bernomor di kanan. Accordion pakai details
// dengan name yang sama, jadi browser hanya membuka satu pertanyaan tanpa JavaScript.
type FaqItem = { id: string; on: boolean; q: string; a: string };

// items, title, dan sub dipakai halaman tema untuk tanya jawab khusus tema dengan tampilan yang sama.
export function Faq({ settings, vars, items, title, sub, id = "tanya" }: { settings: Settings; vars: Record<string, string>; items?: FaqItem[]; title?: string; sub?: string; id?: string }) {
  const sec = { ...settings.sections.faq, ...(title && { title }), ...(sub !== undefined && { sub }) };
  return (
    <section id={id} className="relative overflow-hidden">
      <LineArt kind="mawar" className="top-8 right-3 w-12 opacity-55 lg:hidden" />
      <Container className={`${sectionPad} relative grid grid-cols-1 gap-9 lg:grid-cols-[minmax(0,1fr)_minmax(0,2fr)] lg:gap-16`}>
        <div className="lg:sticky lg:top-28 lg:self-start">
          <SectionTitle {...reveal()}>{sec.title}</SectionTitle>
          {sec.sub && (
            <SectionSub className="mb-0! text-base leading-relaxed" {...reveal()}>
              {fill(sec.sub, vars)}
            </SectionSub>
          )}
          {sec.cta && (
            <a
              href={vars.wa_link}
              className="mt-6 inline-flex items-center gap-2 text-[15px] text-wine underline decoration-wine/30 underline-offset-4 transition-colors duration-150 hover:decoration-wine focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-wine"
              {...reveal()}
            >
              <WaIcon className="size-4 shrink-0" />
              {fill(sec.cta, vars)}
            </a>
          )}
          <div className="relative mt-12 hidden h-56 lg:block">
            <LineArt kind="mawar" className="top-0 left-0 h-full w-auto" />
          </div>
        </div>
        <div className="border-t border-line">
          {(items ?? settings.faq)
            .filter((f) => f.on)
            .map((item, i) => (
              <details key={item.id} name={id} className="faq group border-b border-line" {...reveal(i)}>
                <summary className="flex cursor-pointer list-none items-baseline gap-4 py-5 text-left transition-colors duration-150 hover:text-wine focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-wine sm:gap-5 sm:py-6 [&::-webkit-details-marker]:hidden">
                  <span aria-hidden="true" className="w-7 flex-none font-serif text-lg text-wine/70 italic lining-nums tabular-nums sm:w-8 sm:text-xl">
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <h3 className="min-w-0 flex-1 font-serif text-xl leading-snug font-medium sm:text-[22px]">{item.q}</h3>
                  <svg
                    viewBox="0 0 16 16"
                    aria-hidden="true"
                    className="size-4 flex-none self-center fill-none stroke-wine stroke-[1.6] transition-transform duration-200 group-open:rotate-45 motion-reduce:transition-none"
                  >
                    <path d="M8 2v12M2 8h12" />
                  </svg>
                </summary>
                <div className="faq-answer pr-8 pb-6 pl-11 sm:pl-13">
                  <p className="max-w-[68ch] text-base leading-[1.65] text-ink-soft">
                    <Inline text={fill(item.a, vars)} />
                  </p>
                </div>
              </details>
            ))}
        </div>
      </Container>
    </section>
  );
}
