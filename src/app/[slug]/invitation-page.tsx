import type { Metadata, Viewport } from "next";
import { notFound } from "next/navigation";
import { WaIcon } from "@/components/home/closing";
import { CustomFontLinks } from "@/components/invitation/custom-font-links";
import { DemoOrderButton } from "@/components/invitation/demo-order-button";
import { DemoViewSwitch } from "@/components/invitation/demo-view-switch";
import { TrackThemeView } from "@/components/meta-pixel";
import { PrivateNotice } from "@/components/invitation/private-notice";
import { Archived, GuestNames, Inactive, InvitationSlug } from "@/components/invitation/shell";
import { Watermark } from "@/components/invitation/watermark";
import { isDemo } from "@/lib/invitation/archive";
import { applyPackage, demoHref, demoOrderLink, demoPackages, TOP_PACKAGE, type DemoDevice, type DemoPackage } from "@/lib/invitation/demo-packages";
import { getInvitation } from "@/lib/invitation/load";
import { checkPass, guestView } from "@/lib/invitation/private";
import { requirementsText } from "@/lib/invitation/requirements-text";
import { limitExtras } from "@/lib/invitation/schema";
import { toView } from "@/lib/invitation/view";
import { getSettings, packageRules, type PackageId } from "@/lib/settings";
import { THEMES } from "@/themes";
import { THEME_NAMES } from "@/themes/media";

// Dipakai halaman undangan (/slug) dan halaman contoh per paket (/slug/paket/<id>).
// demoPkg hanya berlaku untuk undangan contoh. Tanpa demoPkg, undangan contoh tampil sebagai paket tertinggi.
export async function loadInvitationPage(slug: string, demoPkg?: PackageId) {
  const inv = await getInvitation(slug);
  if (!inv || !inv.published || !THEMES[inv.theme]) return null;
  const demo = isDemo(inv.slug, inv.theme);
  if (demoPkg && !demo) return null;
  const settings = await getSettings();
  const packages = demo ? demoPackages(settings, inv.theme) : [];
  const pkg = demo ? (demoPkg ?? TOP_PACKAGE) : (inv.pkg ?? null);
  if (demoPkg && !packages.some((p) => p.id === demoPkg && p.available)) return null;

  const rules = packageRules(settings, pkg, demo ? {} : inv.addons);
  const archived = Boolean(inv.archived);
  // Undangan contoh disesuaikan seluruh aturan paket. Undangan klien sudah dijaga editor, jadi di sini
  // hanya bagian tambahan yang melebihi paket yang tidak ditampilkan.
  const data = demo ? applyPackage(inv.data, rules) : rules.extras ? { ...inv.data, extras: limitExtras(inv.data.extras, rules.extras.max) } : inv.data;
  const view = toView(inv.slug, data, inv.theme);
  // Arsip: hitung mundur, RSVP, dan amplop digital disembunyikan. Isi lain dan buku ucapan tetap tampil.
  if (archived) view.on = { ...view.on, countdown: false, rsvp: false, gifts: false };
  return {
    id: inv.id ?? "",
    private: Boolean(inv.private),
    theme: THEMES[inv.theme],
    paid: inv.paid,
    archived,
    demo,
    pkg: demo ? (pkg as PackageId) : null,
    packages,
    orderHref: demo ? demoOrderLink(settings, THEME_NAMES[inv.theme] ?? inv.theme, pkg as PackageId) : "",
    dataList: demo ? requirementsText(inv.theme, THEME_NAMES[inv.theme] ?? inv.theme, rules) : "",
    guestNames: !rules.locked.nama_tamu && !archived,
    view,
  };
}

export type InvitationPageData = NonNullable<Awaited<ReturnType<typeof loadInvitationPage>>>;

const PRIVATE_TITLE = "Undangan Pernikahan";
const PRIVATE_DESCRIPTION = "Undangan ini khusus tamu terundang. Silakan buka lewat link pribadi yang dikirimkan kepadamu.";

export function invitationMetadata(found: InvitationPageData | null, path: string): Metadata {
  if (!found) return { robots: { index: false, follow: false } };
  // Metadata tidak membaca kode, jadi sama untuk semua pembuka link: tanpa nama tamu, mempelai, tanggal, dan foto.
  if (found.private) {
    return {
      title: { absolute: PRIVATE_TITLE },
      description: PRIVATE_DESCRIPTION,
      robots: { index: false, follow: false },
      referrer: "no-referrer",
      openGraph: { title: PRIVATE_TITLE, description: PRIVATE_DESCRIPTION, url: path },
    };
  }
  const { view: v } = found;
  const title = `${v.groom.name} & ${v.bride.name} | ${v.dateLong}`;
  return {
    title: { absolute: title },
    description: v.share.description,
    robots: { index: false, follow: false },
    openGraph: {
      title,
      description: v.share.ogDescription,
      url: path,
      // Tanpa gambar, pratinjau WhatsApp memakai gambar bawaan situs.
      ...(v.images.og ? { images: [{ url: v.images.og, width: 1200, height: 630, alt: `${v.groom.name} dan ${v.bride.name}` }] } : {}),
    },
  };
}

export const invitationViewport = (found: InvitationPageData | null): Viewport => ({ themeColor: (!found?.private && (found?.view.pageColor || found?.theme.themeColor)) || "#FAF7F2" });

// Kode dibaca di sini, di dalam Suspense halaman. Undangan publik tidak melewati komponen ini, jadi tetap statis.
export async function PrivateInvitation({ slug, searchParams }: { slug: string; searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  const { k } = await searchParams;
  const found = await loadInvitationPage(slug);
  if (!found) notFound();
  const pass = await checkPass(found.id, slug, typeof k === "string" ? k : "");
  if (!pass.ok) return <PrivateNotice limited={pass.limited} />;
  // Nama tamu tetap tampil di arsip, karena pembuka link sudah terbukti pemilik kode.
  return <InvitationBody found={{ ...found, view: await guestView(found.view, found.id, pass), guestNames: true }} guestName={pass.name} />;
}

// Tautan sakelar contoh: pilihan paket di perangkat yang sama, dan pilihan perangkat di paket yang sama.
export function demoSwitchLinks(slug: string, pkg: PackageId, device: DemoDevice, packages: DemoPackage[]) {
  return {
    packages: packages.map((p) => ({ ...p, href: demoHref(slug, p.id, device), on: p.id === pkg })),
    devices: (["desktop", "tablet", "hp"] as const).map((d) => ({ id: d, href: demoHref(slug, pkg, d), on: d === device })),
  };
}

// guestName hanya diisi undangan private, dari kode tamu. Kosong untuk kode mempelai.
export function InvitationBody({ found, guestName }: { found: InvitationPageData; guestName?: string }) {
  const { Component } = found.theme;
  return (
    <>
      <CustomFontLinks hrefs={found.view.fontLinks} />
      <Archived archived={found.archived}>
        <Inactive inactive={!found.paid && !found.demo}>
          <GuestNames allowed={found.guestNames} fixed={guestName}>
            <InvitationSlug slug={found.demo ? "" : found.view.slug}>
              <Component inv={found.view} />
            </InvitationSlug>
          </GuestNames>
        </Inactive>
      </Archived>
      {!found.paid && <Watermark />}
      {found.demo && found.pkg && (
        <>
          <DemoViewSwitch {...demoSwitchLinks(found.view.slug, found.pkg, "desktop", found.packages)} dataList={found.dataList} />
          <DemoOrderButton href={found.orderHref} theme={THEME_NAMES[found.view.slug] ?? found.view.slug}>
            <WaIcon className="size-6" />
          </DemoOrderButton>
          <TrackThemeView theme={found.view.slug} name={THEME_NAMES[found.view.slug] ?? found.view.slug} pkg={found.pkg} device="desktop" />
        </>
      )}
    </>
  );
}
