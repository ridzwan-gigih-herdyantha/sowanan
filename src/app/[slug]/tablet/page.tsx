import type { Metadata } from "next";
import { demoSlugs, DevicePreview } from "@/components/invitation/device-preview";

export const metadata: Metadata = { title: "Tampilan tablet", robots: { index: false, follow: false } };

export const generateStaticParams = demoSlugs;

export default async function TabletPreview({ params }: PageProps<"/[slug]/tablet">) {
  return <DevicePreview slug={(await params).slug} device="tablet" />;
}
