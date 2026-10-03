import { Inline } from "@/components/rich-text";
import { Container, SectionSub, SectionTitle, reveal, sectionPad } from "@/components/ui";
import { fill, type Settings } from "@/lib/settings";

export function Faq({ settings, vars }: { settings: Settings; vars: Record<string, string> }) {
  const sec = settings.sections.faq;
  return (
    <section id="tanya">
      <Container className={sectionPad}>
        <SectionTitle className={sec.sub ? undefined : "mb-11"} {...reveal()}>
          {sec.title}
        </SectionTitle>
        {sec.sub && <SectionSub {...reveal()}>{fill(sec.sub, vars)}</SectionSub>}
        <div className="grid grid-cols-1 gap-[26px] md:grid-cols-2 md:gap-x-14 md:gap-y-9">
          {settings.faq
            .filter((f) => f.on)
            .map((item, i) => (
              <div key={item.id} {...reveal(i)}>
                <h3 className="mb-[9px] text-lg font-medium">{item.q}</h3>
                <p className="text-base leading-[1.65] text-ink-soft">
                  <Inline text={fill(item.a, vars)} />
                </p>
              </div>
            ))}
        </div>
      </Container>
    </section>
  );
}
