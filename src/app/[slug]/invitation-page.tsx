import type { Metadata, Viewport } from "next";
import { DemoViewSwitch } from "@/components/invitation/demo-view-switch";
import { Archived, GuestNames, InvitationSlug } from "@/components/invitation/shell";
import { Watermark } from "@/components/invitation/watermark";
import { isDemo } from "@/lib/invitation/archive";
import { applyPackage, demoHref, demoPackages, TOP_PACKAGE, type DemoDevice, type DemoPackage } from "@/lib/invitation/demo-packages";
import { getInvitation } from "@/lib/invitation/load";
import { toView } from "@/lib/invitation/view";
import { getSettings, packageRules, type PackageId } from "@/lib/settings";
import { THEMES } from "@/themes";

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
  const data = demo ? applyPackage(inv.data, rules) : rules.extras ? { ...inv.data, extras: inv.data.extras.slice(0, rules.extras.max) } : inv.data;
  const view = toView(inv.slug, data, inv.theme);
  // Arsip: hitung mundur, RSVP, dan amplop digital disembunyikan. Isi lain dan buku ucapan tetap tampil.
  if (archived) view.on = { ...view.on, countdown: false, rsvp: false, gifts: false };
  return {
    theme: THEMES[inv.theme],
    paid: inv.paid,
    archived,
    demo,
    pkg: demo ? (pkg as PackageId) : null,
    packages,
    guestNames: !rules.locked.nama_tamu && !archived,
    view,
  };
}

export type InvitationPageData = NonNullable<Awaited<ReturnType<typeof loadInvitationPage>>>;

export function invitationMetadata(found: InvitationPageData | null, path: string): Metadata {
  if (!found) return { robots: { index: false, follow: false } };
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
      images: [{ url: v.images.og, width: 1200, height: 630, alt: `${v.groom.name} dan ${v.bride.name}` }],
    },
  };
}

export const invitationViewport = (found: InvitationPageData | null): Viewport => ({ themeColor: found?.view.pageColor || found?.theme.themeColor || "#FAF7F2" });

// Tautan sakelar contoh: pilihan paket di perangkat yang sama, dan pilihan perangkat di paket yang sama.
export function demoSwitchLinks(slug: string, pkg: PackageId, device: DemoDevice, packages: DemoPackage[]) {
  return {
    packages: packages.map((p) => ({ ...p, href: demoHref(slug, p.id, device), on: p.id === pkg })),
    devices: (["desktop", "tablet", "hp"] as const).map((d) => ({ id: d, href: demoHref(slug, pkg, d), on: d === device })),
  };
}

export function InvitationBody({ found }: { found: InvitationPageData }) {
  const { Component } = found.theme;
  return (
    <>
      <Archived archived={found.archived}>
        <GuestNames allowed={found.guestNames}>
          <InvitationSlug slug={found.demo ? "" : found.view.slug}>
            <Component inv={found.view} />
          </InvitationSlug>
        </GuestNames>
      </Archived>
      {!found.paid && <Watermark />}
      {found.demo && found.pkg && <DemoViewSwitch {...demoSwitchLinks(found.view.slug, found.pkg, "desktop", found.packages)} />}
    </>
  );
}
