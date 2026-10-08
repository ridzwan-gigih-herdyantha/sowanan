import type { Metadata, Viewport } from "next";
import { notFound } from "next/navigation";
import { isDemo } from "@/lib/invitation/archive";
import { getInvitation, listPublishedSlugs } from "@/lib/invitation/load";
import { toView } from "@/lib/invitation/view";
import { DemoViewSwitch } from "@/components/invitation/demo-view-switch";
import { Archived, GuestNames, InvitationSlug } from "@/components/invitation/shell";
import { Watermark } from "@/components/invitation/watermark";
import { getSettings, packageRules } from "@/lib/settings";
import { THEMES } from "@/themes";

export async function generateStaticParams() {
  const slugs = await listPublishedSlugs();
  return slugs.map((slug) => ({ slug }));
}

async function load(slug: string) {
  const inv = await getInvitation(slug);
  if (!inv || !inv.published || !THEMES[inv.theme]) return null;
  const rules = packageRules(await getSettings(), inv.pkg ?? null, inv.addons);
  const archived = Boolean(inv.archived);
  // Bagian tambahan di luar tema dibatasi paket, kelebihannya tidak ditampilkan.
  const data = rules.extras ? { ...inv.data, extras: inv.data.extras.slice(0, rules.extras.max) } : inv.data;
  const view = toView(inv.slug, data, inv.theme);
  // Arsip: hitung mundur, RSVP, dan amplop digital disembunyikan. Isi lain dan buku ucapan tetap tampil.
  if (archived) view.on = { ...view.on, countdown: false, rsvp: false, gifts: false };
  return { theme: THEMES[inv.theme], paid: inv.paid, archived, demo: isDemo(inv.slug, inv.theme), guestNames: !rules.locked.nama_tamu && !archived, view };
}

export async function generateMetadata({ params }: PageProps<"/[slug]">): Promise<Metadata> {
  const found = await load((await params).slug);
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
      url: `/${v.slug}`,
      images: [{ url: v.images.og, width: 1200, height: 630, alt: `${v.groom.name} dan ${v.bride.name}` }],
    },
  };
}

export async function generateViewport({ params }: PageProps<"/[slug]">): Promise<Viewport> {
  const found = await load((await params).slug);
  return { themeColor: found?.view.pageColor || found?.theme.themeColor || "#FAF7F2" };
}

export default async function InvitationPage({ params }: PageProps<"/[slug]">) {
  const found = await load((await params).slug);
  if (!found) notFound();
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
      {found.demo && <DemoViewSwitch slug={found.view.slug} mode="desktop" />}
    </>
  );
}
