import type { Metadata } from "next";
import { formatRupiah, getSettings, waLink } from "@/lib/settings";

export async function generateMetadata(): Promise<Metadata> {
  const s = await getSettings();
  const price = formatRupiah(s.priceHemat);
  return {
    title: { absolute: `Sowanan — Undangan Pernikahan Digital Mulai ${price}` },
    description: `Sowanan, jasa undangan pernikahan digital. Kirim data lewat WhatsApp, undangan jadi dalam ${s.sla}. Sudah termasuk RSVP, peta lokasi, buku ucapan, dan amplop digital.`,
    alternates: { canonical: "/" },
    openGraph: {
      title: "Sowanan — Undangan Pernikahan Digital",
      description: `Kabarnya sampai dulu, sebelum tamunya datang. Undangan pernikahan digital mulai ${price}.`,
      url: "/",
      images: [{ url: "/img/og.jpg", width: 1200, height: 630 }],
    },
  };
}

// Placeholder: homepage dari sowanan-homepage.html dipindahkan di langkah berikutnya.
export default async function Home() {
  const s = await getSettings();
  return (
    <main className="mx-auto max-w-[1120px] px-5 py-24">
      <h1 className="font-serif text-5xl">Undangan nikah digital, mulai {formatRupiah(s.priceHemat)}.</h1>
      <p className="mt-6">
        <a href={waLink(s.waNumber)}>Pesan lewat WhatsApp</a>
      </p>
    </main>
  );
}
