import { Container, SectionSub, SectionTitle, btn, cx, reveal, sectionPad } from "@/components/ui";
import { formatRevisions, formatRupiah, type Settings } from "@/lib/settings";

type Plan = { tier: string; flag?: string; price: number; forWho: string; items: string[]; highlight?: boolean };

function plans(s: Settings): Plan[] {
  return [
    {
      tier: "HEMAT",
      price: s.priceHemat,
      forWho: "buat yang acaranya sudah dekat",
      items: [
        "Tema pilihan, warna disesuaikan",
        "Semua fitur di atas",
        `Galeri sampai ${s.maxPhotosHemat} foto`,
        `Jadi dalam ${s.sla}`,
        `Aktif ${s.activePeriod}`,
        `Revisi ${formatRevisions(s.revisionsHemat, "×")}`,
      ],
    },
    {
      tier: "LENGKAP",
      flag: "PALING BANYAK DIPESAN",
      highlight: true,
      price: s.priceLengkap,
      forWho: "pilihan sebagian besar pasangan",
      items: [
        "Semua isi paket Hemat",
        "Galeri foto tanpa batas",
        "Nama tamu muncul di undangan",
        "Musik latar pilihan sendiri",
        "Cerita perjalanan kalian",
        `Aktif ${s.activePeriod}`,
        `Revisi ${formatRevisions(s.revisionsLengkap, "×")}`,
      ],
    },
    {
      tier: "DESAIN SENDIRI",
      price: s.priceDesain,
      forWho: "dibuat dari nol, bukan dari tema",
      items: [
        "Semua isi paket Lengkap",
        "Tampilan dirancang khusus",
        "Daftar tamu bisa diunduh ke Excel",
        "Absensi tamu dengan QR di lokasi",
        `Aktif ${s.activePeriod}`,
        `Revisi ${formatRevisions(s.revisionsDesain, "×")}`,
      ],
    },
  ];
}

export function Pricing({ settings, waHref }: { settings: Settings; waHref: string }) {
  return (
    <section id="paket" className="bg-ink text-paper">
      <Container className={sectionPad}>
        <SectionTitle className="text-paper" {...reveal()}>
          Harga
        </SectionTitle>
        <SectionSub className="text-mist" {...reveal()}>
          Bayar sekali, tidak ada biaya bulanan. Domain dan hosting sudah termasuk selama masa aktif.
        </SectionSub>
        <div className="grid grid-cols-1 gap-6 md:grid-cols-3 md:gap-7">
          {plans(settings).map((p, i) => (
            <div key={p.tier} {...reveal(i)}>
              <div
                className={cx(
                  "flex h-full flex-col rounded-sm border px-8 py-[38px] transition-[transform,border-color,background-color] duration-200 hover:-translate-y-1.5 hover:border-wine-soft hover:bg-night-hi motion-reduce:transform-none",
                  p.highlight ? "border-wine-soft bg-night-hi" : "border-night-line bg-night",
                )}
              >
                <div className="mb-4 flex items-center justify-between gap-2">
                  <span className="text-[13px] tracking-[2px] text-wine-soft">{p.tier}</span>
                  {p.flag && (
                    <span className="rounded-sm bg-wine-soft px-2.5 py-[5px] text-[11px] tracking-[1px] text-ink">
                      {p.flag}
                    </span>
                  )}
                </div>
                <p className="mb-1.5 font-serif text-[42px] text-paper">{formatRupiah(p.price)}</p>
                <p className="mb-[26px] text-sm text-dusk">{p.forWho}</p>
                <ul className="mb-8 flex flex-col gap-3 text-[15px] text-dusk-light">
                  {p.items.map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>
                <a
                  href={waHref}
                  className={cx(
                    btn.base,
                    "mt-auto block border border-wine-soft p-[15px] text-center text-[15px]",
                    p.highlight
                      ? "bg-wine-soft text-ink hover:bg-wine-pale"
                      : "text-wine-soft hover:bg-wine-soft hover:text-ink",
                  )}
                >
                  Pesan paket ini
                </a>
              </div>
            </div>
          ))}
        </div>
      </Container>
    </section>
  );
}
