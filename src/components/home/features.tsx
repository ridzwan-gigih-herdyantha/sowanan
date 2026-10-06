import type { ReactNode } from "react";
import { Container, SectionSub, SectionTitle, reveal, sectionPad } from "@/components/ui";
import { fill, type IconId, type Settings } from "@/lib/settings";

// Gambar ikon fitur. Nama kuncinya sama dengan pilihan ikon di halaman pengaturan.
const ICON_PATHS: Record<IconId, ReactNode> = {
  centang: <path d="M20 6L9 17l-5-5" />,
  peta: (
    <>
      <path d="M12 21s7-5.5 7-11a7 7 0 10-14 0c0 5.5 7 11 7 11z" />
      <circle cx="12" cy="10" r="2.5" />
    </>
  ),
  amplop: (
    <>
      <rect x="3" y="6" width="18" height="12" rx="2" />
      <path d="M3 9h18M7 14h4" />
    </>
  ),
  foto: (
    <>
      <rect x="3" y="5" width="18" height="14" rx="2" />
      <circle cx="8.5" cy="10" r="1.5" />
      <path d="M21 15l-5-5-6 6" />
    </>
  ),
  pesan: <path d="M21 15a2 2 0 01-2 2H8l-5 4V5a2 2 0 012-2h14a2 2 0 012 2z" />,
  jam: (
    <>
      <path d="M21 12a8 8 0 11-3-6.2" />
      <path d="M21 4v5h-5" />
    </>
  ),
  musik: (
    <>
      <path d="M9 18V6l10-2v12" />
      <circle cx="6.5" cy="18" r="2.5" />
      <circle cx="16.5" cy="16" r="2.5" />
    </>
  ),
  bagikan: (
    <>
      <path d="M4 12v7a1 1 0 001 1h14a1 1 0 001-1v-7" />
      <path d="M12 3v13M8 7l4-4 4 4" />
    </>
  ),
  orang: (
    <>
      <circle cx="12" cy="8" r="4" />
      <path d="M4 21a8 8 0 0116 0" />
    </>
  ),
  tautan: (
    <>
      <circle cx="12" cy="12" r="9" />
      <path d="M3 12h18M12 3c2.5 3 2.5 15 0 18M12 3c-2.5 3-2.5 15 0 18" />
    </>
  ),
};

export function Features({ settings, vars }: { settings: Settings; vars: Record<string, string> }) {
  const sec = settings.sections.fitur;
  return (
    <section id="fitur">
      <Container className={sectionPad}>
        <SectionTitle {...reveal()}>{sec.title}</SectionTitle>
        {sec.sub && <SectionSub {...reveal()}>{fill(sec.sub, vars)}</SectionSub>}
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 sm:gap-x-12 sm:gap-y-9 lg:grid-cols-3">
          {settings.features
            .filter((f) => f.on)
            .map((f, i) => (
            <div key={f.id} className="group flex gap-4" {...reveal(i)}>
              <svg
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                aria-hidden="true"
                className="mt-[3px] shrink-0 text-wine transition-transform duration-200 group-hover:scale-[1.12] motion-reduce:transform-none"
              >
                {ICON_PATHS[f.icon]}
              </svg>
              <div>
                <h3 className="mb-1.5 text-lg font-medium">{f.name}</h3>
                {f.label && (
                  <span className="mb-2 inline-block rounded-sm bg-blush px-2 py-0.5 text-[13px] tracking-[0.5px] text-wine">{f.label}</span>
                )}
                {f.text && <p className="text-[16px] leading-[1.6] text-ink-body">{fill(f.text, vars)}</p>}
              </div>
            </div>
          ))}
        </div>
      </Container>
    </section>
  );
}
