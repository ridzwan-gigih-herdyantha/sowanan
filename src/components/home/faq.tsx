import Link from "next/link";
import type { ReactNode } from "react";
import { Container, SectionTitle, reveal, sectionPad } from "@/components/ui";
import type { Settings } from "@/lib/settings";

export function faqItems(s: Settings): { q: string; a: ReactNode; text: string }[] {
  const aktif = `${s.activePeriod} sejak undangan jadi, lalu tersimpan sebagai arsip selama layanan beroperasi.`;
  return [
    {
      q: "Berapa lama jadinya?",
      text: `${s.sla.charAt(0).toUpperCase()}${s.sla.slice(1)} setelah data dan foto lengkap. Kalau antrean sedang penuh, kami kabari di awal, bukan setelah lewat.`,
      a: null,
    },
    {
      q: "Saya tidak paham teknis, bisa?",
      text: "Bisa. Kalian cukup kirim data lewat WhatsApp, sisanya kami yang kerjakan sampai link siap sebar.",
      a: null,
    },
    {
      q: "Link-nya aktif sampai kapan?",
      text: `${aktif} Ketentuan lengkapnya ada di halaman ketentuan.`,
      a: (
        <>
          {aktif} Ketentuan lengkapnya ada di <Link prefetch={false} href="/ketentuan">halaman ketentuan</Link>.
        </>
      ),
    },
    {
      q: "Bisa untuk berapa tamu?",
      text: "Tidak dibatasi. Satu link bisa disebar ke berapa pun tamu tanpa biaya tambahan.",
      a: null,
    },
    {
      q: "Kalau mau ganti tema di tengah jalan?",
      text: "Masih bisa selama draf belum disetujui. Setelah disetujui, ganti tema dihitung pesanan baru.",
      a: null,
    },
    {
      q: "Cara bayarnya?",
      text: `DP ${s.dpPercent}% di awal, sisanya setelah draf disetujui. Transfer atau QRIS.`,
      a: null,
    },
  ].map((item) => ({ ...item, a: item.a ?? item.text }));
}

export function Faq({ settings }: { settings: Settings }) {
  return (
    <section id="tanya">
      <Container className={sectionPad}>
        <SectionTitle className="mb-11" {...reveal()}>
          Yang sering ditanyakan
        </SectionTitle>
        <div className="grid grid-cols-1 gap-[26px] md:grid-cols-2 md:gap-x-14 md:gap-y-9">
          {faqItems(settings).map((item, i) => (
            <div key={item.q} {...reveal(i)}>
              <h3 className="mb-[9px] text-lg font-medium">{item.q}</h3>
              <p className="text-base leading-[1.65] text-ink-soft">{item.a}</p>
            </div>
          ))}
        </div>
      </Container>
    </section>
  );
}
