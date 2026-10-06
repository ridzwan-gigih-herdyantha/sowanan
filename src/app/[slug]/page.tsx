import type { Metadata, Viewport } from "next";
import { notFound } from "next/navigation";
import { getInvitation, listPublishedSlugs } from "@/lib/invitation/load";
import { toView } from "@/lib/invitation/view";
import { Archived, GuestNames } from "@/components/invitation/shell";
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
  const view = toView(inv.slug, inv.data, inv.theme);
  // Arsip: hitung mundur, RSVP, dan amplop digital disembunyikan. Isi lain dan buku ucapan tetap tampil.
  if (archived) view.on = { ...view.on, countdown: false, rsvp: false, gifts: false };
  return { theme: THEMES[inv.theme], paid: inv.paid, archived, guestNames: !rules.locked.nama_tamu && !archived, view };
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
          <Component inv={found.view} />
        </GuestNames>
      </Archived>
      {!found.paid && <Watermark />}
    </>
  );
}
