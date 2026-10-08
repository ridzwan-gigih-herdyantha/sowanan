import { WaIcon } from "@/components/home/closing";
import { Inline } from "@/components/rich-text";
import { Container, SectionSub, SectionTitle, cx, reveal, sectionPad } from "@/components/ui";
import { cellView, fill, formatRupiah, PACKAGE_NAMES, planWaLink, slaText, visiblePackages, type Settings } from "@/lib/settings";

// Kartu panjang untuk kebutuhan di luar paket, berlatar wine supaya menonjol sebagai tawaran terpisah di atas latar gelap.
function CustomCard({ card, vars }: { card: Settings["sections"]["harga"]["custom"]; vars: Record<string, string> }) {
  const points = card.points.map((p) => fill(p, vars).trim()).filter(Boolean);
  if (!card.title && !card.text) return null;
  return (
    <div className="mt-[54px] grid gap-7 rounded-[14px] bg-wine px-6 py-4 text-paper sm:px-9 sm:py-6 md:grid-cols-[minmax(0,1fr)_auto] md:items-center md:gap-12 lg:px-12" {...reveal()}>
      <div>
        {card.title && <h3 className="font-serif text-[clamp(26px,3vw,32px)] leading-[1.15] font-medium">{fill(card.title, vars)}</h3>}
        {card.text && <p className="mt-3 max-w-[60ch] text-[16px] leading-relaxed text-[#f2dfe2]">{fill(card.text, vars)}</p>}
        {points.length > 0 && (
          <ul className="mt-5 flex flex-col gap-1 text-[12px] text-paper sm:flex-row sm:flex-wrap sm:gap-x-5">
            {points.map((p) => (
              <li className="border-[1.5px] rounded-full border-wine-soft px-2 py-1" key={p}>{p}</li>
            ))}
          </ul>
        )}
      </div>
      {card.button && (
        <a
          href={vars.wa_link}
          className="inline-flex items-center justify-center gap-2.5 rounded-lg bg-paper px-7 py-4 text-base text-wine-dark no-underline transition-[transform,background-color] duration-200 ease-out hover:-translate-y-0.5 hover:bg-white focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-paper motion-reduce:transform-none"
        >
          <WaIcon className="size-5 shrink-0" />
          {card.button}
        </a>
      )}
    </div>
  );
}

type Feature = { label: string; note?: string; on: boolean };
type Plan = { tier: string; badge: string; price: number; blurb: string; specs: [string, string][]; features: Feature[]; waHref: string };

// Semua paket menampilkan daftar isi yang sama supaya mudah dibandingkan.
function plans(s: Settings): Plan[] {
  return visiblePackages(s).map((id) => {
    const p = s.packages[id];
    return {
      tier: PACKAGE_NAMES[id],
      badge: p.badge,
      price: p.price,
      blurb: p.blurb,
      // Strip spesifikasi ada di posisi yang sama di semua kartu.
      specs: [["Jadi dalam", slaText(p, true)], ...(p.revision ? ([["Revisi", p.revision]] as [string, string][]) : [])],
      features: s.matrix.map((row) => ({ label: row.label, ...cellView(s, row, id) })),
      waHref: planWaLink(s, id),
    };
  });
}

function Mark({ on }: { on: boolean }) {
  return (
    <svg viewBox="0 0 16 16" aria-hidden="true" className={cx("absolute top-[0.27em] left-0 size-3.5 fill-none stroke-[1.7]", on ? "stroke-wine-soft lit:stroke-ink" : "stroke-ink-mute lit:stroke-ink/45")}>
      {on ? <path d="M2 8.5l4 4 8-9" /> : <path d="M3 3l10 10M13 3L3 13" />}
    </svg>
  );
}

// Kartu berubah ke warna tombol saat disorot atau saat isinya mendapat fokus (variant lit di globals.css).
function PlanCard({ p }: { p: Plan }) {
  // Paket rekomendasi dibedakan lewat garis tepi kartu saat diam. Tombolnya sama dengan paket lain.
  const rec = !!p.badge;
  const fade = "transition-colors duration-200";
  return (
    <article className={cx("plan relative flex h-full flex-col rounded-[14px] border bg-night px-[22px] pt-7 pb-[26px] transition-[background-color,border-color,transform] duration-200 lit:border-wine-soft lit:bg-wine-soft sm:px-7 sm:pt-[34px] sm:pb-[30px] [@media(hover:hover)]:hover:-translate-y-1 motion-reduce:transform-none", rec ? "border-wine-soft border-2" : "border-night-line")}>
      {p.badge && (
        <span className={cx("absolute top-[26px] right-[22px] rounded-full border border-wine-soft/50 bg-wine-soft/28 px-[11px] py-[5px] text-[11px] font-medium tracking-[.15em] text-paper uppercase lit:border-ink/30 lit:bg-ink/14 lit:text-ink sm:top-[30px] sm:right-[26px]", fade)}>
          {p.badge}
        </span>
      )}
      <h3 className={cx("mb-4 text-[12px] font-medium tracking-[.24em] text-mist uppercase lit:text-ink/70", fade)}>{p.tier}</h3>
      <p className={cx("mb-2.5 font-serif text-[38px] leading-none font-medium text-paper lit:text-ink sm:text-[42px]", fade)}>{formatRupiah(p.price)}</p>
      <p className={cx("mb-[22px] text-[15px] leading-normal text-mist lit:text-ink/70 lg:min-h-[46px]", fade)}>{p.blurb}</p>

      <dl className={cx("mb-[22px] border-y border-night-line lit:border-ink/20", fade)}>
        {p.specs.map(([lab, val], i) => (
          <div key={lab} className={cx("flex items-baseline justify-between gap-3.5 py-[11px]", i > 0 && "border-t border-night-line lit:border-ink/20", fade)}>
            <dt className={cx("flex-none text-[11px] tracking-[.12em] text-mist uppercase lit:text-ink/70 sm:tracking-[.15em]", fade)}>{lab}</dt>
            <dd className={cx("text-right font-serif text-[18px] leading-tight text-paper lit:text-ink sm:text-[19px]", fade)}>{val}</dd>
          </div>
        ))}
      </dl>

      <ul className="mb-7 flex-1 [&>li:last-child]:mb-0">
        {p.features.map((f) => (
          <li
            key={f.label}
            className={cx("relative mb-2.5 pl-[26px] text-[15px] leading-[1.45]", f.on ? "text-dusk-light lit:text-ink" : "text-ink-mute opacity-75 lit:text-ink/45 lit:opacity-100", fade)}
          >
            <Mark on={f.on} />
            <span className="sr-only">{f.on ? "Termasuk: " : "Tidak termasuk: "}</span>
            {f.label}
            {f.note && <span className={cx("text-wine-soft lit:text-ink/66", fade)}> {f.note}</span>}
          </li>
        ))}
      </ul>

      <a
        href={p.waHref}
        aria-label={`Pesan paket ${p.tier}`}
        className={cx(
          "block rounded-lg border px-[18px] py-3.5 text-center text-[15px] tracking-[.04em] no-underline transition-colors duration-200 lit:border-ink lit:bg-ink lit:text-paper focus-visible:outline-2 focus-visible:outline-offset-3 focus-visible:outline-paper",
          rec
            ? "border-2"
            : "",
          "border-wine-soft text-paper",
        )}
      >
        Pesan paket ini
      </a>
    </article>
  );
}

export function Pricing({ settings, vars }: { settings: Settings; vars: Record<string, string> }) {
  const { harga, addon } = settings.sections;
  const addons = settings.addons.filter((a) => a.on);
  const list = plans(settings);
  return (
    <section id="harga" className="bg-ink text-paper">
      <Container className={sectionPad}>
        <SectionTitle className="text-paper" {...reveal()}>
          {harga.title}
        </SectionTitle>
        {harga.sub && (
          <SectionSub className="max-w-[54ch] text-mist" {...reveal()}>
            {fill(harga.sub, vars)}
          </SectionSub>
        )}
        <div className={cx("grid grid-cols-1 gap-[18px] lg:gap-[22px]", list.length === 3 ? "lg:grid-cols-3" : list.length === 2 ? "lg:grid-cols-2" : "mx-auto max-w-[420px]")}>
          {list.map((p, i) => (
            <div key={p.tier} {...reveal(i)}>
              <PlanCard p={p} />
            </div>
          ))}
        </div>
        {settings.payment.note && (
          <p className="mx-auto mt-[26px] max-w-[62ch] text-center text-[14.5px] leading-[1.7] text-mist [&_strong]:font-normal [&_strong]:text-dusk-light" {...reveal()}>
            <Inline text={fill(settings.payment.note, vars)} />
          </p>
        )}

        {addons.length > 0 && (
          <div className="mt-16 md:mt-[78px]" {...reveal()}>
            <h3 className="font-serif text-[28px] font-medium text-paper">{addon.title}</h3>
            {addon.sub && <p className="mt-2 text-[17px] text-mist">{fill(addon.sub, vars)}</p>}
            <ul className="mt-[30px] grid grid-cols-1 md:grid-cols-2 md:gap-x-12">
              {addons.map((a) => (
                <li key={a.id} className="flex items-baseline justify-between gap-[18px] border-t border-night-line py-[18px]">
                  <span className="min-w-0 text-[16px] leading-snug text-dusk-light">
                    {a.name}
                    {a.scope && <small className="mt-[3px] block text-[13px] text-mist">{a.scope}</small>}
                  </span>
                  <span className="shrink-0 font-serif text-[24px] leading-none text-dusk-light">{formatRupiah(a.price)}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        <CustomCard card={harga.custom} vars={vars} />
      </Container>
    </section>
  );
}
