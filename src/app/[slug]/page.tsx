import type { Metadata, Viewport } from "next";
import { notFound } from "next/navigation";
import { listPublishedSlugs } from "@/lib/invitation/load";
import { InvitationBody, invitationMetadata, invitationViewport, loadInvitationPage } from "./invitation-page";

export async function generateStaticParams() {
  const slugs = await listPublishedSlugs();
  return slugs.map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: PageProps<"/[slug]">): Promise<Metadata> {
  const { slug } = await params;
  return invitationMetadata(await loadInvitationPage(slug), `/${slug}`);
}

export async function generateViewport({ params }: PageProps<"/[slug]">): Promise<Viewport> {
  return invitationViewport(await loadInvitationPage((await params).slug));
}

export default async function InvitationPage({ params }: PageProps<"/[slug]">) {
  const found = await loadInvitationPage((await params).slug);
  if (!found) notFound();
  return <InvitationBody found={found} />;
}
