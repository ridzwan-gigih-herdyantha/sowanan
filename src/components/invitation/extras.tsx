import Image from "next/image";
import type { CSSProperties, ReactNode } from "react";
import type { ExtraAnchor, ExtraKind, ExtraTone } from "@/lib/invitation/schema";
import type { ExtraView, InvitationView } from "@/lib/invitation/view";
import { ExtraTracks, ExtraVideos } from "./extras-media";
import { Gallery } from "./gallery";
import { Lung, Motif, texture } from "./pakeliran-ornaments";
import { rows } from "./rows";
import { RuleIconSvg } from "./rule-icons";
import { Pita, Star } from "./sakinah/ornaments";

// Warna latar mengikuti palet tema yang aktif, termasuk palet kustom dari tab Palet.
// bg dipakai sebagai celah antara isi dan bingkai emas supaya bingkainya tampak lepas dari isi.
const TONES: Record<ExtraTone, { section: string; line: string; dot: string; bg: string; dark: boolean }> = {
  paper: { section: "inv-paper text-inv-ink", line: "bg-inv-gold", dot: "bg-inv-gold", bg: "var(--inv-paper)", dark: false },
  wash: { section: "inv-wash text-inv-ink", line: "bg-inv-gold", dot: "bg-inv-gold", bg: "var(--inv-wash)", dark: false },
  accent: { section: "bg-inv-accent text-inv-paper", line: "bg-current opacity-60", dot: "bg-current", bg: "var(--inv-accent)", dark: true },
  ink: { section: "bg-inv-ink text-inv-paper", line: "bg-current opacity-60", dot: "bg-current", bg: "var(--inv-ink)", dark: true },
};
type Tone = (typeof TONES)[ExtraTone];

// Gaya per tema. Tema tanpa skin memakai tampilan umum yang rata tengah.
type Skin = "film" | "ruang" | "herbarium" | "pakeliran" | "sakinah";
const SKINS: Record<string, Skin> = {
  "andi-rina": "film",
  "bagas-sekar": "ruang",
  "hendrawan-larasati": "herbarium",
  "danang-kinanthi": "pakeliran",
  "fadhil-nayla": "sakinah",
};
// Tema editorial meratakan judul dan isi ke kiri, tema berornamen ke tengah.
const isLeft = (skin?: Skin) => skin === "film" || skin === "ruang" || skin === "herbarium";

// Teks kecil di atas judul, mengikuti pola judul section di tiap tema.
const EYEBROW: Record<ExtraKind, string> = { rundown: "Jalannya acara", denah: "Menuju lokasi", dresscode: "Busana tamu", imbauan: "Untuk tamu", bebas: "" };

function Heading({ skin, eyebrow, title, tone }: { skin?: Skin; eyebrow: string; title: string; tone: Tone }) {
  if (skin === "pakeliran") {
    return (
      <div className="flex flex-col items-center text-center">
        {eyebrow && (
          <div className={`flex items-center gap-3 ${tone.dark ? "text-inv-gold-light" : "text-inv-accent"}`}>
            <Motif name="kawung" />
            <p className="text-[12px] tracking-[0.2em] uppercase">{eyebrow}</p>
            <Motif name="kawung" />
          </div>
        )}
        {title && <h2 className="mt-2 font-display text-[clamp(34px,8.6vw,56px)] leading-[1.05] text-balance">{title}</h2>}
        <Lung name="tepi" className={`mt-3 w-52 lg:w-64 ${tone.dark ? "text-inv-gold-light/70" : "text-pk-ukir"}`} />
      </div>
    );
  }
  if (skin === "sakinah") {
    return (
      <div className="flex flex-col items-center text-center">
        {eyebrow && (
          <div className={`flex items-center gap-3 ${tone.dark ? "text-inv-gold-light" : "text-inv-accent"}`}>
            <Star className="size-4" />
            <p className="text-[12px] tracking-[0.2em] uppercase">{eyebrow}</p>
            <Star className="size-4" />
          </div>
        )}
        {title && <h2 className="mt-3 font-display text-[clamp(34px,8.6vw,54px)] leading-[1.05] text-balance">{title}</h2>}
        <Pita className={`mt-4 h-4 w-48 sm:w-60 ${tone.dark ? "text-sk-emas/80" : "text-sk-emas"}`} />
      </div>
    );
  }
  if (isLeft(skin)) {
    // Judul berwarna aksen hanya di latar terang. Tema Ruang tetap hitam putih.
    const accent = !tone.dark && skin !== "ruang";
    return (
      <div>
        {eyebrow && <p className={`text-[11px] font-medium tracking-[0.22em] uppercase ${tone.dark ? "opacity-70" : "text-inv-gold"}`}>{eyebrow}</p>}
        {title && <h2 className={`mt-3 font-display text-[clamp(32px,8vw,52px)] leading-[1.06] text-balance ${accent ? "text-inv-accent" : ""}`}>{title}</h2>}
      </div>
    );
  }
  return (
    <>
      <span aria-hidden="true" className={`mx-auto block h-px w-12 ${tone.line}`} />
      {title && <h2 className="mt-6 text-center font-display text-[clamp(30px,7vw,48px)] leading-[1.1] text-balance">{title}</h2>}
    </>
  );
}

function Note({ text, left }: { text: string; left: boolean }) {
  if (!text) return null;
  return <p className={`mt-10 max-w-[56ch] text-[16px] leading-[1.75] whitespace-pre-line text-pretty ${left ? "" : "mx-auto text-center"}`}>{text}</p>;
}

// Susunan acara sebagai linimasa: jam di kiri, titik di garis, nama acara dan keterangannya di kanan.
function Rundown({ items, tone, left }: { items: ExtraView["rundown"]; tone: Tone; left: boolean }) {
  return (
    <ol className={`mt-12 max-w-[480px] ${left ? "" : "mx-auto"}`}>
      {items.map((r, i) => (
        <li key={i} className="grid grid-cols-[64px_1fr] gap-x-5 sm:grid-cols-[84px_1fr] sm:gap-x-7">
          <p className="pt-0.5 text-right font-display text-[21px] leading-tight tabular-nums sm:text-[25px]">{r.time}</p>
          <div className={`relative border-l border-current/25 pl-6 ${i === items.length - 1 ? "" : "pb-9"}`}>
            <span aria-hidden="true" className={`absolute top-[9px] -left-[5px] size-[9px] rounded-full ${tone.dot}`} />
            <p className="text-[17px] leading-snug font-medium text-pretty">{r.name}</p>
            {r.note && <p className="mt-1 text-[14px] leading-relaxed text-pretty opacity-75">{r.note}</p>}
          </div>
        </li>
      ))}
    </ol>
  );
}

// Denah dibuka dalam ukuran penuh di tab baru supaya tamu bisa memperbesarnya dengan jari.
function Plan({ plan, note, left }: { plan: NonNullable<ExtraView["plan"]>; note: string; left: boolean }) {
  return (
    <>
      <a
        href={plan.src}
        target="_blank"
        rel="noopener"
        className="group mt-10 block text-inherit no-underline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-current"
      >
        <span className="block overflow-hidden rounded-[2px] border border-current/15">
          <Image src={plan.src} alt={plan.alt} width={plan.w} height={plan.h} quality={85} sizes="(min-width: 720px) 680px, 100vw" className="h-auto w-full" />
        </span>
        <span className={`mt-3 flex items-center gap-1.5 text-[13px] opacity-70 transition-opacity group-hover:opacity-100 ${left ? "" : "justify-center"}`}>
          Buka denah ukuran penuh
          <svg viewBox="0 0 16 16" aria-hidden="true" className="size-3 fill-none stroke-current stroke-[1.6]">
            <path d="M6 3h7v7M13 3 4 12" />
          </svg>
        </span>
      </a>
      <Note text={note} left={left} />
    </>
  );
}

type Color = ExtraView["colors"][number];
const label = (c: Color) => c.name || c.hex.toUpperCase();
const fill = (c: Color): CSSProperties => ({ backgroundColor: c.hex });
const tilt = (deg: number[], i: number): CSSProperties => ({ rotate: `${deg[i % deg.length]}deg` });

// Satu bentuk contoh warna per tema. desktop menentukan ukuran, per adalah isi baris terpanjang.
type Look = {
  cap: { mobile: number; desktop: number };
  center: boolean;
  gap: { mobile: string; desktop: string };
  rowGap: string;
  item: (c: Color, i: number, per: number, desktop: boolean) => ReactNode;
};

// Kartu editorial: di HP setengah atau sepertiga lebar sesuai isi baris terpanjang, di desktop seperempat.
const cardWidth = (per: number, desktop: boolean) => (desktop ? "w-[calc((100%-60px)/4)]" : per <= 2 ? "w-[calc(50%-10px)]" : "w-[calc((100%-40px)/3)]");
const cardText = (per: number, desktop: boolean) => (desktop ? "text-[18px]" : per <= 2 ? "text-[17px]" : "text-[15px]");
const editorial = (item: Look["item"], rowGap: string): Look => ({ cap: { mobile: 3, desktop: 4 }, center: false, gap: { mobile: "gap-x-5", desktop: "gap-x-5" }, rowGap, item });

const LOOKS: Record<Skin | "plain", Look> = {
  // Senja Kota: cetakan polaroid yang sedikit miring, seperti foto di tema ini.
  film: editorial(
    (c, i, per, desktop) => (
      <li key={i} className={`${cardWidth(per, desktop)} bg-inv-card p-2 pb-3 text-inv-ink shadow-[0_8px_22px_rgba(28,25,22,.2)]`} style={tilt([-2, 1.5, -1, 2.5], i)}>
        <span aria-hidden="true" className="block aspect-square" style={fill(c)} />
        <span className={`mt-2.5 block text-center font-display leading-tight italic ${cardText(per, desktop)}`}>{label(c)}</span>
      </li>
    ),
    "gap-y-7",
  ),
  // Ruang: kartu warna bergaris tipis dengan nama dan kode, tanpa hiasan.
  ruang: editorial(
    (c, i, per, desktop) => (
      <li key={i} className={`${cardWidth(per, desktop)} border border-current/20`}>
        <span aria-hidden="true" className="block aspect-[4/3]" style={fill(c)} />
        <span className="block border-t border-current/20 px-3 pt-2.5 pb-3">
          <span className={`block font-display leading-tight ${cardText(per, desktop)}`}>{c.name || "Warna"}</span>
          <span className="mt-1 block text-[11px] tracking-[0.2em] uppercase tabular-nums opacity-60">{c.hex}</span>
        </span>
      </li>
    ),
    "gap-y-5",
  ),
  // Herbarium: contoh warna ditempel selotip di kartu koleksi bernomor.
  herbarium: editorial(
    (c, i, per, desktop) => (
      <li
        key={i}
        className={`${cardWidth(per, desktop)} relative border border-inv-line bg-inv-paper p-2.5 pb-3 text-inv-ink shadow-[0_10px_24px_rgba(0,0,0,.07)]`}
        style={tilt([-1, 0.8, -0.6, 1.2], i)}
      >
        <span aria-hidden="true" className="inv-tape -top-3 left-[calc(50%-38px)] z-10 -rotate-2" />
        <span aria-hidden="true" className="block aspect-square" style={fill(c)} />
        <span className="mt-2.5 block text-[10px] font-medium tracking-[0.2em] text-inv-gold">NO. {String(i + 1).padStart(2, "0")}</span>
        <span className={`mt-0.5 block font-display leading-tight text-inv-accent italic ${cardText(per, desktop)}`}>{label(c)}</span>
      </li>
    ),
    "gap-y-10",
  ),
  // Pakeliran: wajik berbingkai emas dengan tekstur kawung tipis, seperti potongan kain.
  pakeliran: {
    cap: { mobile: 4, desktop: 4 },
    center: true,
    gap: { mobile: "gap-x-3", desktop: "gap-x-6" },
    rowGap: "gap-y-9",
    item: (c, i, _per, desktop) => (
      <li key={i} className={`flex flex-col items-center text-center ${desktop ? "w-36" : "w-[72px]"}`}>
        <span
          aria-hidden="true"
          className={`relative block rotate-45 overflow-hidden ${desktop ? "mt-4 size-20" : "mt-2 size-12"}`}
          style={{ ...fill(c), boxShadow: "0 0 0 3px var(--extra-bg), 0 0 0 4px var(--pk-emas)" }}
        >
          <span className="absolute inset-0" style={texture("kawung", "#000", 0.14, desktop ? 0.6 : 0.45)} />
        </span>
        <span className={`font-display leading-tight ${desktop ? "mt-8 text-[18px]" : "mt-5 text-[15px]"}`}>{label(c)}</span>
      </li>
    ),
  },
  // Sakinah: lengkung mihrab berbingkai emas, dengan bintang delapan di atasnya.
  sakinah: {
    cap: { mobile: 4, desktop: 4 },
    center: true,
    gap: { mobile: "gap-x-3", desktop: "gap-x-6" },
    rowGap: "gap-y-9",
    item: (c, i, _per, desktop) => (
      <li key={i} className={`flex flex-col items-center text-center ${desktop ? "w-36" : "w-[74px]"}`}>
        <Star className={`text-[var(--extra-star)] ${desktop ? "mb-4 size-4" : "mb-3 size-3.5"}`} />
        <span
          aria-hidden="true"
          className={`block rounded-t-full ${desktop ? "h-[124px] w-[88px]" : "h-[76px] w-[54px]"}`}
          style={{ ...fill(c), boxShadow: "0 0 0 3px var(--extra-bg), 0 0 0 4px var(--sk-emas)" }}
        />
        <span className={`font-display leading-tight ${desktop ? "mt-4 text-[18px]" : "mt-3 text-[15px]"}`}>{label(c)}</span>
      </li>
    ),
  },
  plain: {
    cap: { mobile: 4, desktop: 4 },
    center: true,
    gap: { mobile: "gap-x-3", desktop: "gap-x-8" },
    rowGap: "gap-y-7",
    item: (c, i, _per, desktop) => (
      <li key={i} className={`flex flex-col items-center text-center ${desktop ? "w-28" : "w-17"}`}>
        <span aria-hidden="true" className={`rounded-full ring-1 ring-current/20 ${desktop ? "size-20" : "size-14"}`} style={fill(c)} />
        <span className={`mt-3 leading-snug text-pretty ${desktop ? "text-[15px]" : "text-[13px]"}`}>{label(c)}</span>
      </li>
    ),
  },
};

// Contoh palet dress code dalam bahasa visual tiap tema. Susunan baris dihitung untuk HP dan desktop,
// lalu yang tampil dipilih lewat CSS sesuai lebar layar.
function Swatches({ colors, skin, tone }: { colors: Color[]; skin?: Skin; tone: Tone }) {
  const look = LOOKS[skin ?? "plain"];
  const vars = { "--extra-bg": tone.bg, "--extra-star": tone.dark ? "var(--inv-gold-light)" : "var(--sk-emas)" } as CSSProperties;
  const layout = (cap: number, desktop: boolean) => {
    const groups = rows(
      colors.map((c, i) => ({ c, i })),
      cap,
    );
    const per = groups[0]?.length ?? 0;
    return groups.map((row, r) => (
      <ul key={r} className={`flex ${look.center ? "justify-center" : ""} ${desktop ? look.gap.desktop : look.gap.mobile}`}>
        {row.map(({ c, i }) => look.item(c, i, per, desktop))}
      </ul>
    ));
  };
  return (
    <div className="mt-12" style={vars}>
      <div className={`flex flex-col sm:hidden ${look.rowGap}`}>{layout(look.cap.mobile, false)}</div>
      <div className={`hidden flex-col sm:flex ${look.rowGap}`}>{layout(look.cap.desktop, true)}</div>
    </div>
  );
}

// Blok bebas: teks, foto, video, dan lagu sesuai isian.
function Free({ e, left }: { e: ExtraView; left: boolean }) {
  const [one] = e.photos;
  return (
    <>
      {e.body && <p className={`mt-8 max-w-[56ch] text-[16px] leading-[1.75] whitespace-pre-line text-pretty ${left ? "" : "mx-auto"}`}>{e.body}</p>}
      {e.photos.length === 1 && (
        <Image src={one.src} alt={one.alt} width={one.w} height={one.h} sizes="(min-width: 720px) 680px, 100vw" className="mt-10 h-auto w-full rounded-[2px]" />
      )}
      {e.photos.length > 1 && (
        <div className="mt-10">
          <Gallery photos={e.photos} variant="grid" />
        </div>
      )}
      {e.videos.length > 0 && (
        <div className="mt-10">
          <ExtraVideos videos={e.videos} />
        </div>
      )}
      {e.tracks.length > 0 && (
        <div className="mt-10">
          <ExtraTracks tracks={e.tracks} />
        </div>
      )}
    </>
  );
}

const no = (i: number) => String(i + 1).padStart(2, "0");
const ruleText = "text-[16px] leading-snug text-pretty sm:text-[17px]";

// Imbauan untuk tamu sebagai daftar baris supaya kalimat panjang tetap enak dibaca.
// Wadah ikon dan pemisah barisnya mengikuti tema.
function Rules({ rules, skin, tone }: { rules: ExtraView["rules"]; skin?: Skin; tone: Tone }) {
  // Senja Kota: garis putus-putus seperti sobekan tiket.
  if (skin === "film") {
    return (
      <ul className="mt-10 border-t border-dashed border-current/30">
        {rules.map((r, i) => (
          <li key={i} className="flex items-center gap-4 border-b border-dashed border-current/30 py-4">
            <span className={`grid size-10 shrink-0 place-items-center rounded-full border border-current/25 ${tone.dark ? "" : "text-inv-gold"}`}>
              <RuleIconSvg name={r.icon} />
            </span>
            <p className={ruleText}>{r.text}</p>
          </li>
        ))}
      </ul>
    );
  }
  // Ruang: garis tipis bernomor, ikon kecil di kanan, tanpa hiasan.
  if (skin === "ruang") {
    return (
      <ol className="mt-10 border-t border-current/20">
        {rules.map((r, i) => (
          <li key={i} className="grid grid-cols-[28px_1fr_auto] items-center gap-4 border-b border-current/20 py-5">
            <span className="text-[11px] tracking-[0.2em] tabular-nums opacity-60">{no(i)}</span>
            <p className={ruleText}>{r.text}</p>
            <RuleIconSvg name={r.icon} className="size-5 opacity-70" />
          </li>
        ))}
      </ol>
    );
  }
  // Herbarium: tabel label spesimen, kolom kiri berisi ikon dan nomor.
  if (skin === "herbarium") {
    return (
      <div className="mt-10 border border-inv-line bg-inv-wash text-inv-ink">
        <p className="border-b border-inv-line px-4 py-2 text-[10px] font-medium tracking-[0.2em] text-inv-gold">LABEL IMBAUAN</p>
        <ol>
          {rules.map((r, i) => (
            <li key={i} className="grid grid-cols-[56px_1fr] border-b border-inv-line last:border-b-0">
              <span className="flex flex-col items-center justify-center gap-1 border-r border-inv-line py-3 text-inv-gold">
                <RuleIconSvg name={r.icon} />
                <span className="text-[9px] font-medium tracking-[0.15em] tabular-nums">{no(i)}</span>
              </span>
              <p className="px-4 py-3.5 text-[15px] leading-snug text-pretty sm:text-[16px]">{r.text}</p>
            </li>
          ))}
        </ol>
      </div>
    );
  }
  // Pakeliran: ikon di dalam wajik emas, pemisah garis emas tipis.
  if (skin === "pakeliran") {
    return (
      <ul className="mx-auto mt-10 max-w-[520px]">
        {rules.map((r, i) => (
          <li key={i} className="flex items-center gap-5 border-b border-pk-emas/30 py-4 last:border-b-0">
            <span className={`relative grid size-11 shrink-0 place-items-center ${tone.dark ? "text-inv-gold-light" : "text-pk-ukir"}`}>
              <span aria-hidden="true" className="absolute inset-[6px] rotate-45 border border-pk-emas" />
              <RuleIconSvg name={r.icon} className="relative size-[18px]" />
            </span>
            <p className={ruleText}>{r.text}</p>
          </li>
        ))}
      </ul>
    );
  }
  // Sakinah: ikon di dalam lengkung mihrab berbingkai emas.
  if (skin === "sakinah") {
    return (
      <ul className="mx-auto mt-10 max-w-[520px]">
        {rules.map((r, i) => (
          <li key={i} className="flex items-center gap-5 border-b border-sk-emas/30 py-4 last:border-b-0">
            <span className={`grid h-12 w-10 shrink-0 place-items-center rounded-t-full border border-sk-emas pt-1 ${tone.dark ? "text-inv-gold-light" : "text-sk-emas"}`}>
              <RuleIconSvg name={r.icon} className="size-[18px]" />
            </span>
            <p className={ruleText}>{r.text}</p>
          </li>
        ))}
      </ul>
    );
  }
  return (
    <ul className="mx-auto mt-10 max-w-[520px]">
      {rules.map((r, i) => (
        <li key={i} className="flex items-center gap-4 border-b border-current/15 py-4 last:border-b-0">
          <span className="grid size-10 shrink-0 place-items-center rounded-full border border-current/25">
            <RuleIconSvg name={r.icon} />
          </span>
          <p className={ruleText}>{r.text}</p>
        </li>
      ))}
    </ul>
  );
}

function Body({ e, skin, tone, left }: { e: ExtraView; skin?: Skin; tone: Tone; left: boolean }): ReactNode {
  if (e.kind === "imbauan") {
    return (
      <>
        <Rules rules={e.rules} skin={skin} tone={tone} />
        <Note text={e.note} left={left} />
      </>
    );
  }
  if (e.kind === "rundown") return <Rundown items={e.rundown} tone={tone} left={left} />;
  if (e.kind === "denah" && e.plan) return <Plan plan={e.plan} note={e.note} left={left} />;
  if (e.kind === "dresscode") {
    return (
      <>
        <Swatches colors={e.colors} skin={skin} tone={tone} />
        <Note text={e.note} left={left} />
      </>
    );
  }
  return <Free e={e} left={left} />;
}

// Bagian tambahan di luar tema, misalnya susunan acara atau denah parkir.
// Satu komponen dipakai semua tema lewat token inv-*, dengan judul dan bentuk yang mengikuti gaya tiap tema.
export function Extras({ inv, at }: { inv: InvitationView; at: ExtraAnchor }) {
  const items = inv.extras[at];
  if (!items?.length) return null;
  const skin = SKINS[inv.theme];
  const left = isLeft(skin);
  return items.map((e, i) => {
    const tone = TONES[e.tone] ?? TONES.paper;
    return (
      // Senja Kota memakai tepi kertas sobek di setiap pergantian section.
      <section key={`${at}-${i}`} className={`${tone.section} px-5 py-20 sm:px-8 lg:py-28 ${skin === "film" ? "torn-top relative -mt-3.5" : ""}`}>
        <div className={`mx-auto ${e.kind === "bebas" && e.photos.length > 2 ? "max-w-[960px]" : "max-w-[680px]"}`}>
          <Heading skin={skin} eyebrow={EYEBROW[e.kind]} title={e.title} tone={tone} />
          <Body e={e} skin={skin} tone={tone} left={left} />
        </div>
      </section>
    );
  });
}
