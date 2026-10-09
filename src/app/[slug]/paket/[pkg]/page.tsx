import type { Metadata, Viewport } from "next";
import { notFound } from "next/navigation";
import { demoSlugs } from "@/components/invitation/device-preview";
import { asPackage } from "@/lib/invitation/demo-packages";
import { PACKAGE_IDS } from "@/lib/settings";
import { InvitationBody, invitationMetadata, invitationViewport, loadInvitationPage } from "../../invitation-page";

// Undangan contoh sesuai aturan satu paket. Hanya untuk undangan contoh dan tema yang tersedia di paket itu.
export function generateStaticParams() {
  return demoSlugs().flatMap(({ slug }) => PACKAGE_IDS.map((pkg) => ({ slug, pkg })));
}

async function load(params: PageProps<"/[slug]/paket/[pkg]">["params"]) {
  const { slug, pkg } = await params;
  const id = asPackage(pkg);
  return id ? loadInvitationPage(slug, id) : null;
}

export async function generateMetadata({ params }: PageProps<"/[slug]/paket/[pkg]">): Promise<Metadata> {
  const { slug, pkg } = await params;
  return invitationMetadata(await load(params), `/${slug}/paket/${pkg}`);
}

export async function generateViewport({ params }: PageProps<"/[slug]/paket/[pkg]">): Promise<Viewport> {
  return invitationViewport(await load(params));
}

export default async function PackageDemoPage({ params }: PageProps<"/[slug]/paket/[pkg]">) {
  const found = await load(params);
  if (!found) notFound();
  return <InvitationBody found={found} />;
}
