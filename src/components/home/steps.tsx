import { Container, Eyebrow, cx, SectionSub, SectionTitle, reveal, sectionPad } from "@/components/ui";
import { LineArt } from "./line-art";
import { fill, type Settings } from "@/lib/settings";

export function Steps({ settings, vars }: { settings: Settings; vars: Record<string, string> }) {
  const sec = settings.sections.cara;
  return (
    <section id="cara" className="relative overflow-hidden border-y border-line bg-blush">
      <LineArt kind="cincin" className="top-8 right-2 w-20 opacity-55 lg:top-12 lg:right-[max(1.5rem,calc(50%-540px))] lg:w-40 lg:opacity-100" />
      <Container className={cx(sectionPad, "relative")}>
        <Eyebrow no="04" {...reveal()}>
          Cara pesan
        </Eyebrow>
        <SectionTitle className={sec.sub ? undefined : "mb-11"} {...reveal()}>
          {sec.title}
        </SectionTitle>
        {sec.sub && <SectionSub {...reveal()}>{fill(sec.sub, vars)}</SectionSub>}
        <ol className="grid grid-cols-1 gap-[26px] sm:grid-cols-2 sm:gap-8 lg:grid-cols-4 lg:gap-9">
          {settings.steps.map((s, i) => (
            <li key={s.id} className="flex gap-4 sm:block" {...reveal(i)}>
              <p className="w-11 shrink-0 font-serif text-[38px] leading-none text-wine-soft sm:mb-3.5 sm:w-auto sm:text-[52px]">
                {String(i + 1).padStart(2, "0")}
              </p>
              <div>
                <h3 className="mb-[9px] text-[19px] font-medium">{s.title}</h3>
                {s.text && <p className="text-[16px] leading-[1.65] text-ink-soft">{fill(s.text, vars)}</p>}
              </div>
            </li>
          ))}
        </ol>
      </Container>
    </section>
  );
}
