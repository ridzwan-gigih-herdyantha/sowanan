import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { checkinPage } from "@/lib/checkin";
import { isDemo } from "@/lib/invitation/archive";
import { hasSupabase } from "@/lib/supabase/admin";
import { CheckinForm } from "./checkin-form";

export const metadata: Metadata = {
  title: "Kehadiran tamu",
  robots: { index: false, follow: false },
  referrer: "no-referrer",
};

async function Checkin({ params }: { params: Promise<{ token: string }> }) {
  if (!hasSupabase()) notFound();
  const { token } = await params;
  const page = await checkinPage(token);
  if (!page) notFound();
  return (
    <div className="mx-auto flex min-h-dvh max-w-md flex-col justify-center px-5 py-12">
      <p className="text-center text-[12px] tracking-[0.2em] text-ink-mute uppercase">Kehadiran tamu</p>
      <h1 className="mt-2 text-center font-serif text-[40px] leading-tight text-balance">{page.couple}</h1>
      {page.open ? (
        <CheckinForm token={token} slug={page.row.slug} demo={isDemo(page.row.slug, page.row.theme)} />
      ) : (
        <p className="mt-8 rounded-sm bg-white px-5 py-4 text-center text-[15px] text-ink-soft ring-1 ring-line">{page.reason}</p>
      )}
    </div>
  );
}

export default function CheckinRoute({ params }: PageProps<"/absen/[token]">) {
  return (
    <main className="min-h-dvh bg-ivory text-ink">
      <Suspense fallback={<p className="px-5 py-16 text-center text-ink-mute">Memuat...</p>}>
        <Checkin params={params} />
      </Suspense>
    </main>
  );
}
