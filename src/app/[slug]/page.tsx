import type { Metadata, Viewport } from "next";
import { notFound } from "next/navigation";
import { DEMO_SLUGS } from "@/lib/invitations";
import { THEMES } from "@/themes";

export function generateStaticParams() {
  return DEMO_SLUGS.map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: PageProps<"/[slug]">): Promise<Metadata> {
  const { slug } = await params;
  return { ...THEMES[slug]?.metadata, robots: { index: false, follow: false } };
}

export async function generateViewport({ params }: PageProps<"/[slug]">): Promise<Viewport> {
  const { slug } = await params;
  return { themeColor: THEMES[slug]?.themeColor ?? "#FAF7F2" };
}

export default async function InvitationPage({ params }: PageProps<"/[slug]">) {
  const { slug } = await params;
  const theme = THEMES[slug];
  if (theme) return <theme.Component />;
  if (!(DEMO_SLUGS as readonly string[]).includes(slug)) notFound();

  return (
    <main className="mx-auto max-w-md px-5 py-24 text-center font-[Georgia,serif]">
      <p className="text-4xl">{slug}</p>
      <p className="mt-2 text-ink-mute">Undangan contoh sedang disiapkan.</p>
    </main>
  );
}
