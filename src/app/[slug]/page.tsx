import type { Metadata, Viewport } from "next";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { BrandLoader } from "@/components/brand-loader";
import { listPublishedSlugs } from "@/lib/invitation/load";
import { InvitationBody, invitationMetadata, invitationViewport, loadInvitationPage, PrivateInvitation } from "./invitation-page";

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

export default async function InvitationPage({ params, searchParams }: PageProps<"/[slug]">) {
  const { slug } = await params;
  const found = await loadInvitationPage(slug);
  if (!found) notFound();
  if (found.private) {
    return (
      <Suspense fallback={<BrandLoader />}>
        <PrivateInvitation slug={slug} searchParams={searchParams} />
      </Suspense>
    );
  }
  return <InvitationBody found={found} />;
}
