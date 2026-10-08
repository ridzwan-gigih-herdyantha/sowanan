import type { Metadata } from "next";
import Image from "next/image";
import { notFound } from "next/navigation";
import { DemoViewSwitch } from "@/components/invitation/demo-view-switch";
import { PhoneStage } from "@/components/invitation/phone-stage";
import { isDemo } from "@/lib/invitation/archive";
import { getInvitation } from "@/lib/invitation/load";
import { mediaUrl } from "@/lib/storage/media";
import { THEME_NAMES } from "@/themes/media";

export const metadata: Metadata = { title: "Tampilan HP", robots: { index: false, follow: false } };

// Hanya undangan contoh, yang slug-nya sama dengan nama tema.
export function generateStaticParams() {
  return Object.keys(THEME_NAMES).map((slug) => ({ slug }));
}

// Undangan contoh seukuran layar HP di depan foto hero yang di-blur, supaya calon klien di laptop bisa
// melihat tampilan HP-nya. Halaman terpisah, bukan lapisan di atas undangan, supaya musik latar tidak berbunyi dua kali.
export default async function PhonePreview({ params }: PageProps<"/[slug]/hp">) {
  const { slug } = await params;
  const inv = await getInvitation(slug);
  if (!inv || !inv.published || !isDemo(inv.slug, inv.theme)) notFound();
  const backdrop = mediaUrl(inv.data.media.heroWide || inv.data.media.hero);
  return (
    <main className="relative h-dvh overflow-hidden bg-[#1C1917]">
      {backdrop && <Image src={backdrop} alt="" fill sizes="100vw" quality={75} className="scale-110 object-cover opacity-70 blur-2xl" />}
      <div aria-hidden="true" className="absolute inset-0 bg-[#1C1917]/40" />
      <PhoneStage src={`/${slug}`} title={`Contoh undangan tema ${THEME_NAMES[inv.theme]} di HP`} />
      <DemoViewSwitch slug={slug} mode="hp" />
    </main>
  );
}
