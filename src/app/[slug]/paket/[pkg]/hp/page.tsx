import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { demoSlugs, DevicePreview } from "@/components/invitation/device-preview";
import { asPackage } from "@/lib/invitation/demo-packages";
import { PACKAGE_IDS } from "@/lib/settings";

export const metadata: Metadata = { title: "Tampilan HP", robots: { index: false, follow: false } };

export function generateStaticParams() {
  return demoSlugs().flatMap(({ slug }) => PACKAGE_IDS.map((pkg) => ({ slug, pkg })));
}

export default async function PackagePhonePreview({ params }: PageProps<"/[slug]/paket/[pkg]/hp">) {
  const { slug, pkg } = await params;
  const id = asPackage(pkg);
  if (!id) notFound();
  return <DevicePreview slug={slug} device="hp" pkg={id} />;
}
