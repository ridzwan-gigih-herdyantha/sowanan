import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { DEMO_SLUGS } from "@/lib/invitations";

export function generateStaticParams() {
  return DEMO_SLUGS.map((slug) => ({ slug }));
}

export const metadata: Metadata = {
  robots: { index: false, follow: false },
};

export default async function InvitationPage({ params }: PageProps<"/[slug]">) {
  const { slug } = await params;
  if (!(DEMO_SLUGS as readonly string[]).includes(slug)) notFound();

  return (
    <main className="mx-auto max-w-md px-5 py-24 text-center">
      <p className="font-serif text-4xl">{slug}</p>
    </main>
  );
}
