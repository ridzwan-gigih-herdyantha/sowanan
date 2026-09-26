import type { Metadata } from "next";
import Link from "next/link";
import type { ReactNode } from "react";
import { formatRevisions, getSettings, waLink } from "@/lib/settings";

export const metadata: Metadata = {
  title: "Ketentuan Layanan",
  description: "Syarat layanan, kebijakan revisi, masa aktif dan arsip, serta kebijakan data tamu undangan pernikahan digital Sowanan.",
  alternates: { canonical: "/ketentuan" },
  openGraph: { title: "Ketentuan Layanan | Sowanan", url: "/ketentuan", images: [{ url: "/img/og.jpg", width: 1200, height: 630 }] },
};

function Section({ id, title, children }: { id: string; title: string; children: ReactNode }) {
  return (
    <section id={id} className="scroll-mt-8 border-t border-line pt-8">
      <h2 className="font-serif text-[30px] leading-tight font-medium">{title}</h2>
      <div className="mt-4 space-y-4 text-ink-soft [&_li]:mt-2 [&_ul]:list-disc [&_ul]:pl-5">{children}</div>
    </section>
  );
}

export default async function KetentuanPage() {
  const s = await getSettings();
  const toc = [
    ["layanan", "Syarat layanan"],
    ["revisi", "Kebijakan revisi"],
    ["masa-aktif", "Masa aktif dan arsip"],
    ["data-tamu", "Kebijakan data tamu"],
    ["pembayaran", "Pembayaran"],
  ];

  return (
    <main className="mx-auto max-w-[72ch] px-5 py-16 sm:py-24">
      <Link prefetch={false} href="/" className="text-sm text-ink-mute no-underline hover:text-wine">
        Sowanan
      </Link>
      <h1 className="mt-6 font-serif text-[clamp(40px,8vw,56px)] leading-[1.05] font-medium">Ketentuan Layanan</h1>
      <p className="mt-4 text-ink-soft">
        Ketentuan ini berlaku untuk semua pesanan undangan pernikahan digital di Sowanan. Dengan memesan, kalian dianggap sudah membaca dan
        menyetujuinya.
      </p>

      <nav aria-label="Daftar isi" className="mt-8 rounded-sm bg-blush px-5 py-4 text-[15px]">
        <ol className="list-decimal space-y-1 pl-5">
          {toc.map(([id, label]) => (
            <li key={id}>
              <a href={`#${id}`}>{label}</a>
            </li>
          ))}
        </ol>
      </nav>

      <div className="mt-12 space-y-12">
        <Section id="layanan" title="Syarat layanan">
          <ul>
            <li>Sowanan membuatkan undangan pernikahan digital berdasarkan tema dan data yang kalian kirim lewat WhatsApp.</li>
            <li>Undangan dikerjakan dalam {s.sla} setelah data dan foto lengkap kami terima.</li>
            <li>
              Kalian bertanggung jawab atas kebenaran data (nama, tanggal, lokasi) dan memastikan foto serta lagu yang dikirim boleh dipakai.
            </li>
            <li>
              Alamat undangan (sowanan.com/nama-kalian) dikonfirmasi sebelum draf disetujui. Setelah link disebar, alamat ini tidak bisa diubah.
            </li>
            <li>Kami berhak menolak konten yang melanggar hukum atau menyinggung SARA.</li>
          </ul>
        </Section>

        <Section id="revisi" title="Kebijakan revisi">
          <ul>
            <li>
              Jumlah revisi mengikuti paket: Hemat {formatRevisions(s.revisionsHemat, " kali")}, Lengkap {formatRevisions(s.revisionsLengkap, " kali")}, Desain Sendiri{" "}
              {formatRevisions(s.revisionsDesain, " kali")}.
            </li>
            <li>Satu revisi adalah satu kumpulan perubahan yang dikirim sekaligus, bukan satu perubahan per pesan.</li>
            <li>Ganti tema masih bisa selama draf belum disetujui. Setelah disetujui, ganti tema dihitung sebagai pesanan baru.</li>
            <li>Perbaikan kesalahan dari pihak kami tidak mengurangi jatah revisi.</li>
          </ul>
        </Section>

        <Section id="masa-aktif" title="Masa aktif dan arsip">
          <ul>
            <li>Undangan aktif selama {s.activePeriod} sejak undangan jadi.</li>
            <li>
              Setelah masa aktif berakhir, undangan tersimpan sebagai arsip selama layanan beroperasi. Arsip tetap bisa dibuka, tetapi RSVP dan
              buku ucapan ditutup.
            </li>
            <li>Kalian bisa meminta undangan dihapus kapan saja lewat WhatsApp.</li>
          </ul>
        </Section>

        <Section id="data-tamu" title="Kebijakan data tamu">
          <ul>
            <li>RSVP hanya mengumpulkan nama dan jumlah kehadiran. Kami tidak meminta nomor telepon, email, atau alamat tamu.</li>
            <li>Buku ucapan menyimpan nama dan pesan yang ditulis tamu, dan tampil di halaman undangan.</li>
            <li>Data tamu hanya dipakai untuk undangan tersebut, tidak dijual, dan tidak dibagikan ke pihak lain.</li>
            <li>Halaman undangan tidak ditampilkan di mesin pencari.</li>
            <li>Kalian bisa meminta data RSVP dan ucapan dihapus lewat WhatsApp.</li>
          </ul>
        </Section>

        <Section id="pembayaran" title="Pembayaran">
          <ul>
            <li>DP {s.dpPercent}% di awal pemesanan, sisanya setelah draf disetujui.</li>
            <li>Pembayaran lewat transfer bank atau QRIS.</li>
            <li>DP tidak dapat dikembalikan setelah pengerjaan dimulai.</li>
          </ul>
        </Section>
      </div>

      <p className="mt-16 border-t border-line pt-8 text-ink-soft">
        Ada yang belum jelas? <a href={waLink(s.waNumber)}>Tanya kami lewat WhatsApp</a>.
      </p>
    </main>
  );
}
