import Image from "next/image";
import { notFound } from "next/navigation";
import { demoSwitchLinks } from "@/app/[slug]/invitation-page";
import { isDemo } from "@/lib/invitation/archive";
import { demoHref, demoPackages, TOP_PACKAGE } from "@/lib/invitation/demo-packages";
import { getInvitation } from "@/lib/invitation/load";
import { getSettings, type PackageId } from "@/lib/settings";
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
export async function DevicePreview({ slug, device, pkg = TOP_PACKAGE }: { slug: string; device: keyof typeof DEVICES; pkg?: PackageId }) {
  const inv = await getInvitation(slug);
  if (!inv || !inv.published || !isDemo(inv.slug, inv.theme)) notFound();
  const packages = demoPackages(await getSettings(), inv.theme);
  if (!packages.some((p) => p.id === pkg && p.available)) notFound();
  const { w, h, label } = DEVICES[device];
  const backdrop = mediaUrl(inv.data.media.heroWide || inv.data.media.hero);
  return (
    <main className="relative h-dvh overflow-hidden bg-[#1C1917]">
      {backdrop && <Image src={backdrop} alt="" fill sizes="100vw" quality={75} className="scale-110 object-cover opacity-70 blur-2xl" />}
      <div aria-hidden="true" className="absolute inset-0 bg-[#1C1917]/40" />
      <DeviceStage
        src={demoHref(slug, pkg)}
        title={`Contoh undangan tema ${THEME_NAMES[inv.theme]} di ${label}`}
        w={w}
        h={h}
        aside={<DemoViewSwitch {...demoSwitchLinks(slug, pkg, device, packages)} attached />}
      />
    </main>
  );
}
