import { Container, SectionSub, SectionTitle, cx, reveal, sectionPad } from "@/components/ui";
import { formatPhotos, formatRupiah, type Settings } from "@/lib/settings";
import { THEME_NAMES } from "@/themes/media";

type Feature = { label: string; note?: string; on: boolean };
type Plan = { tier: string; badge?: string; price: number; blurb: string; sla: number; active: number; features: Feature[] };

const THEME_COUNT = Object.keys(THEME_NAMES).length;

const masa = (bulan: number) => (bulan >= 24 && bulan % 12 === 0 ? `${bulan / 12} tahun` : `${bulan} bulan`);
const galeri = (n: number | null) => {
  const s = formatPhotos(n);
  return s[0].toUpperCase() + s.slice(1);
};

// Semua paket menampilkan daftar yang sama supaya mudah dibandingkan. Tingkat 0 Dasar, 1 Lengkap, 2 Istimewa.
function features(level: number, photos: number | null): Feature[] {
  return [
    { label: "Pilihan tema", note: level === 0 ? `2 dari ${THEME_COUNT} tema` : `Semua ${THEME_COUNT} tema`, on: true },
    { label: "Warna tema disesuaikan", on: level >= 1 },
    { label: "Galeri foto", note: galeri(photos), on: true },
    { label: "Musik latar bawaan tema", on: true },
    { label: "Musik latar pilihan sendiri", on: level >= 1 },
    { label: "Cerita perjalanan kalian", on: level >= 1 },
    { label: "Nama tamu muncul di undangan", on: level >= 1 },
    { label: "Peta lokasi dan hitung mundur", on: true },
    { label: "RSVP dan buku ucapan", on: true },
    { label: "Amplop digital", on: true },
    { label: "Sebar tanpa batas jumlah tamu", on: true },
    { label: "Daftar tamu diunduh ke Excel", on: level >= 2 },
    { label: "QR absensi tamu di lokasi", on: level >= 2 },
    { label: "Revisi bebas sampai undangan disebar", on: true },
  ];
}

function plans(s: Settings): Plan[] {
  return [
    {
      tier: "Dasar",
      price: s.priceDasar,
      blurb: "Yang penting undangan cepat tersebar",
      sla: s.slaDasar,
      active: s.activeDasar,
      features: features(0, s.photosDasar),
    },
    {
      tier: "Lengkap",
      badge: "Rekomendasi kami",
      price: s.priceLengkap,
      blurb: "Paling seimbang antara fitur dan harga",
      sla: s.slaLengkap,
      active: s.activeLengkap,
      features: features(1, s.photosLengkap),
    },
    {
      tier: "Istimewa",
      price: s.priceIstimewa,
      blurb: "Paling cepat jadi, siap untuk hari H",
      sla: s.slaIstimewa,
      active: s.activeIstimewa,
      features: features(2, s.photosIstimewa),
    },
  ];
}

function addons(s: Settings) {
  return [
    { name: "Tambah 10 foto galeri", for: "Dasar dan Lengkap", price: s.addonPhotos },
    { name: "Ganti font atau palet warna", for: "Dasar", price: s.addonStyle },
    { name: "Musik pilihan sendiri", for: "Dasar", price: s.addonMusic },
    { name: "Ekspor daftar tamu ke Excel", for: "Lengkap", price: s.addonExport },
    { name: "Pengerjaan kilat 24 jam", for: "Dasar dan Lengkap", price: s.addonExpress },
    { name: "Alamat domain sendiri (.com)", for: "Semua paket, termasuk domain 1 tahun", price: s.addonDomain },
    { name: "Perpanjangan masa aktif 1 tahun", for: "Semua paket", price: s.addonExtend },
  ];
}

function Mark({ on }: { on: boolean }) {
  return (
    <svg viewBox="0 0 16 16" aria-hidden="true" className={cx("absolute top-[0.35em] left-0 size-3.5 fill-none stroke-[1.7]", on ? "stroke-wine-soft lit:stroke-ink" : "stroke-ink-mute lit:stroke-ink/45")}>
      {on ? <path d="M2 8.5l4 4 8-9" /> : <path d="M3 3l10 10M13 3L3 13" />}
    </svg>
  );
}

// Kartu berubah ke warna tombol saat disorot atau saat isinya mendapat fokus (variant lit di globals.css).
function PlanCard({ p, waHref, rec }: { p: Plan; waHref: string; rec: boolean }) {
  const fade = "transition-colors duration-200";
  return (
    <article className="plan relative flex h-full flex-col rounded-[14px] border border-night-line bg-night px-[22px] pt-7 pb-[26px] transition-[background-color,border-color,transform] duration-200 lit:border-wine-soft lit:bg-wine-soft sm:px-7 sm:pt-[34px] sm:pb-[30px] [@media(hover:hover)]:hover:-translate-y-1 motion-reduce:transform-none">
      {p.badge && (
        <span className={cx("absolute top-[26px] right-[22px] rounded-full border border-wine-soft/50 bg-wine-soft/28 px-[11px] py-[5px] text-[10px] font-medium tracking-[.17em] text-paper uppercase lit:border-ink/30 lit:bg-ink/14 lit:text-ink sm:top-[30px] sm:right-[26px]", fade)}>
          {p.badge}
        </span>
      )}
      <h3 className={cx("mb-4 text-[11px] font-medium tracking-[.26em] text-mist uppercase lit:text-ink/70", fade)}>{p.tier}</h3>
      <p className={cx("mb-2.5 font-serif text-[38px] leading-none font-medium text-paper lit:text-ink sm:text-[42px]", fade)}>{formatRupiah(p.price)}</p>
      <p className={cx("mb-[22px] text-sm leading-normal font-light text-mist lit:text-ink/70", fade)}>{p.blurb}</p>

      <dl className={cx("mb-[22px] flex border-y border-night-line lit:border-ink/20", fade)}>
        {[
          ["Jadi dalam", `${p.sla} hari kerja`],
          ["Masa aktif", masa(p.active)],
        ].map(([lab, val], i) => (
          <div key={lab} className={cx("flex-1 py-3.5", i > 0 && "border-l border-night-line pl-4 lit:border-ink/20", fade)}>
            <dt className={cx("mb-[5px] text-[10px] tracking-[.17em] text-mist uppercase lit:text-ink/70", fade)}>{lab}</dt>
            <dd className={cx("font-serif text-lg leading-tight text-paper lit:text-ink sm:text-xl", fade)}>{val}</dd>
          </div>
        ))}
      </dl>

      <ul className="mb-7 flex-1">
        {p.features.map((f) => (
          <li
            key={f.label}
            className={cx("relative py-1 pl-7 text-[14.5px] leading-snug font-light", f.on ? "text-dusk-light lit:text-ink" : "text-ink-mute opacity-75 lit:text-ink/45 lit:opacity-100", fade)}
          >
            <Mark on={f.on} />
            <span className="sr-only">{f.on ? "Termasuk: " : "Tidak termasuk: "}</span>
            {f.label}
            {f.note && <span className={cx("mt-0.5 block text-[12.5px] tracking-[.02em] text-mist lit:text-ink/70", fade)}>{f.note}</span>}
          </li>
        ))}
      </ul>

      <a
        href={waHref}
        aria-label={`Pesan paket ${p.tier}`}
        className={cx(
          "block rounded-lg border px-[18px] py-3.5 text-center text-sm tracking-[.04em] no-underline transition-colors duration-200 lit:border-ink lit:bg-ink lit:text-paper focus-visible:outline-2 focus-visible:outline-offset-3 focus-visible:outline-paper",
          rec ? "border-wine-soft bg-wine-soft text-ink" : "border-wine-soft text-paper",
        )}
      >
        Pesan paket ini
      </a>
    </article>
  );
}

export function Pricing({ settings, waHref }: { settings: Settings; waHref: string }) {
  return (
    <section id="paket" className="bg-ink text-paper">
      <Container className={sectionPad}>
        <SectionTitle className="text-paper" {...reveal()}>
          Harga
        </SectionTitle>
        <SectionSub className="max-w-[52ch] font-light text-mist" {...reveal()}>
          Bayar sekali, tidak ada biaya bulanan. Tautan undangan dan hosting sudah termasuk selama masa aktif.
        </SectionSub>
        <div className="grid grid-cols-1 gap-[18px] lg:grid-cols-3 lg:gap-[22px]">
          {plans(settings).map((p, i) => (
            <div key={p.tier} {...reveal(i)}>
              <PlanCard p={p} waHref={waHref} rec={!!p.badge} />
            </div>
          ))}
        </div>
        <p className="mt-[26px] text-center text-[13.5px] font-light text-mist" {...reveal()}>
          Pembayaran dengan uang muka 50 persen. Undangan dilepas tanpa watermark setelah pelunasan.
        </p>

        <div className="mt-16 md:mt-[78px]" {...reveal()}>
          <h3 className="font-serif text-[28px] font-medium text-paper">Tambahan di luar paket</h3>
          <p className="mt-2 text-base font-light text-mist">Bisa ditambahkan saat memesan. Sebutkan saja lewat WhatsApp.</p>
          <ul className="mt-[30px] grid grid-cols-1 md:grid-cols-2 md:gap-x-12">
            {addons(settings).map((a) => (
              <li key={a.name} className="flex items-baseline justify-between gap-[18px] border-t border-night-line py-[18px]">
                <span className="min-w-0 text-[15px] leading-snug font-light text-dusk-light">
                  {a.name}
                  <small className="mt-[3px] block text-xs text-mist">{a.for}</small>
                </span>
                <span className="shrink-0 font-serif text-[19px] text-wine-soft">{formatRupiah(a.price)}</span>
              </li>
            ))}
          </ul>
        </div>
      </Container>
    </section>
  );
}
