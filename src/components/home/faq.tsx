import { Inline } from "@/components/rich-text";
import { Container, SectionSub, SectionTitle, reveal, sectionPad } from "@/components/ui";
import { fill, type Settings } from "@/lib/settings";

// Accordion dari elemen details bawaan. Atribut name yang sama membuat browser hanya membuka satu
// pertanyaan sekaligus, tanpa JavaScript. Semua tertutup saat halaman dibuka.
export function Faq({ settings, vars }: { settings: Settings; vars: Record<string, string> }) {
  const sec = settings.sections.faq;
  return (
    <section id="tanya">
      <Container className={sectionPad}>
        <SectionTitle className={sec.sub ? undefined : "mb-11"} {...reveal()}>
          {sec.title}
        </SectionTitle>
        {sec.sub && <SectionSub {...reveal()}>{fill(sec.sub, vars)}</SectionSub>}
        <div className="max-w-[820px] border-t border-line">
          {settings.faq
            .filter((f) => f.on)
            .map((item, i) => (
              <details key={item.id} name="faq" className="faq group border-b border-line" {...reveal(i)}>
                <summary className="flex cursor-pointer list-none items-center gap-4 py-5 text-left transition-colors duration-150 hover:text-wine focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-wine [&::-webkit-details-marker]:hidden">
                  <h3 className="min-w-0 flex-1 text-lg font-medium">{item.q}</h3>
                  <svg
                    viewBox="0 0 16 16"
                    aria-hidden="true"
                    className="size-4 flex-none fill-none stroke-wine stroke-[1.6] transition-transform duration-200 group-open:rotate-45 motion-reduce:transition-none"
                  >
                    <path d="M8 2v12M2 8h12" />
                  </svg>
                </summary>
                <div className="faq-answer pr-8 pb-6">
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
