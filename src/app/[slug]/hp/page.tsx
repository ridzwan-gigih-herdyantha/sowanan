import type { Metadata } from "next";
import { demoSlugs, DevicePreview } from "@/components/invitation/device-preview";

export const metadata: Metadata = { title: "Tampilan HP", robots: { index: false, follow: false } };

export const generateStaticParams = demoSlugs;

export default async function PhonePreview({ params }: PageProps<"/[slug]/hp">) {
  return <DevicePreview slug={(await params).slug} device="hp" />;
}
