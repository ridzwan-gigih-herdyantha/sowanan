import { Container, SectionSub, SectionTitle, btn, cx, reveal, sectionPad } from "@/components/ui";
import { formatPhotos, formatRupiah, type Settings } from "@/lib/settings";

type Plan = { tier: string; flag?: string; price: number; forWho: string; lead?: string; items: string[]; highlight?: boolean };

const REVISI = "Revisi bebas sampai undangan disebar";
const galeri = (n: number | null) => (n === null ? "Galeri foto tanpa batas" : `Galeri ${formatPhotos(n)}`);

function plans(s: Settings): Plan[] {
  return [
    {
      tier: "DASAR",
      price: s.priceDasar,
      forWho: "yang penting undangan cepat tersebar",
      items: [
        "Pilihan 2 tema",
        galeri(s.photosDasar),
        "Musik latar bawaan tema",
        "RSVP dan buku ucapan",
        "Peta lokasi dan hitung mundur",
        "Amplop digital",
        "Sebar tanpa batas jumlah tamu",
        `Jadi dalam ${s.slaDasar} hari kerja`,
        `Aktif ${s.activeDasar} bulan`,
        REVISI,
      ],
    },
    {
      tier: "LENGKAP",
      flag: "PALING BANYAK DIPESAN",
      highlight: true,
      price: s.priceLengkap,
      forWho: "pilihan sebagian besar pasangan",
      lead: "Semua isi paket Dasar, ditambah:",
      items: [
        "Semua tema, warna disesuaikan",
        galeri(s.photosLengkap),
        "Musik latar pilihan sendiri",
        "Nama tamu muncul di undangan",
        "Cerita perjalanan kalian",
        `Jadi dalam ${s.slaLengkap} hari kerja`,
        `Aktif ${s.activeLengkap} bulan`,
        REVISI,
      ],
    },
    {
      tier: "ISTIMEWA",
      price: s.priceIstimewa,
      forWho: "paling cepat jadi, siap untuk hari H",
      lead: "Semua isi paket Lengkap, ditambah:",
      items: [
        galeri(s.photosIstimewa),
        "Daftar tamu bisa diunduh ke Excel",
        "QR absensi tamu di lokasi",
        `Jadi dalam ${s.slaIstimewa} hari kerja`,
        `Aktif ${s.activeIstimewa} bulan`,
        REVISI,
      ],
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
                {p.lead && <p className="mb-3 text-sm text-mist">{p.lead}</p>}
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

        <div className="mt-14 md:mt-16" {...reveal()}>
          <h3 className="font-serif text-[28px] text-paper">Tambahan di luar paket</h3>
          <p className="mt-1.5 text-sm text-dusk">Bisa ditambahkan saat memesan. Sebutkan saja lewat WhatsApp.</p>
          <ul className="mt-6 grid grid-cols-1 border-t border-night-line md:grid-cols-2 md:gap-x-10">
            {addons(settings).map((a) => (
              <li key={a.name} className="flex items-baseline justify-between gap-4 border-b border-night-line py-3.5">
                <span className="min-w-0">
                  <span className="block text-[15px] text-dusk-light">{a.name}</span>
                  <span className="block text-[13px] text-dusk">{a.for}</span>
                </span>
                <span className="shrink-0 font-serif text-xl text-paper">{formatRupiah(a.price)}</span>
              </li>
            ))}
          </ul>
        </div>
      </Container>
    </section>
  );
}
