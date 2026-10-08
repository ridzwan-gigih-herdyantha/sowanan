import Image from "next/image";
import { notFound } from "next/navigation";
import { isDemo } from "@/lib/invitation/archive";
import { getInvitation } from "@/lib/invitation/load";
import { mediaUrl } from "@/lib/storage/media";
import { THEME_NAMES } from "@/themes/media";
import { DemoViewSwitch } from "./demo-view-switch";
import { DeviceStage } from "./device-stage";

// Ukuran layar logis. HP mengikuti ponsel umum, tablet mengikuti iPad potret.
const DEVICES = {
  hp: { w: 390, h: 844, label: "HP" },
  tablet: { w: 820, h: 1180, label: "tablet" },
} as const;

// Hanya undangan contoh, yang slug-nya sama dengan nama tema.
export const demoSlugs = () => Object.keys(THEME_NAMES).map((slug) => ({ slug }));

// Undangan contoh seukuran layar HP atau tablet di depan foto hero yang di-blur, supaya calon klien di laptop bisa
// melihat tampilannya di perangkat lain. Halaman terpisah, bukan lapisan di atas undangan, supaya musik latar tidak berbunyi dua kali.
export async function DevicePreview({ slug, device }: { slug: string; device: keyof typeof DEVICES }) {
  const inv = await getInvitation(slug);
  if (!inv || !inv.published || !isDemo(inv.slug, inv.theme)) notFound();
  const { w, h, label } = DEVICES[device];
  const backdrop = mediaUrl(inv.data.media.heroWide || inv.data.media.hero);
  return (
    <main className="relative h-dvh overflow-hidden bg-[#1C1917]">
      {backdrop && <Image src={backdrop} alt="" fill sizes="100vw" quality={75} className="scale-110 object-cover opacity-70 blur-2xl" />}
      <div aria-hidden="true" className="absolute inset-0 bg-[#1C1917]/40" />
      <DeviceStage src={`/${slug}`} title={`Contoh undangan tema ${THEME_NAMES[inv.theme]} di ${label}`} w={w} h={h} aside={<DemoViewSwitch slug={slug} mode={device} attached />} />
    </main>
  );
}
