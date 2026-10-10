import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { Suspense } from "react";
import { currentCouple, coupleInvitation } from "@/lib/couple-auth";
import { invitationDataSchema } from "@/lib/invitation/schema";
import { SITE_URL } from "@/lib/site";
import { CoupleFrame } from "../frame";

export const metadata: Metadata = {
  title: "Dashboard mempelai",
  robots: { index: false, follow: false },
  referrer: "no-referrer",
};

// Hanya undangan milik akun yang masuk. Belum masuk diarahkan ke halaman masuk, undangan orang lain ke dashboard sendiri.
async function Gate({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const found = await coupleInvitation(slug);
  if (!found) redirect((await currentCouple()) ? "/dashboard/user" : "/dashboard/user/login");
  const { invitation } = found;
  const d = invitationDataSchema.parse(invitation.data ?? {});
  const couple = [d.couple.groom.name, d.couple.bride.name].filter(Boolean).join(" & ") || invitation.slug;

  return (
    <CoupleFrame>
      <p className="text-[13px] tracking-[2px] text-ink-mute uppercase">Dashboard mempelai</p>
      <h1 className="mt-1 font-serif text-4xl leading-tight">{couple}</h1>
      <a href={`${SITE_URL}/${invitation.slug}`} target="_blank" rel="noopener" className="mt-2 inline-block text-[14px] text-wine underline underline-offset-4">
        Buka undangan
      </a>
    </CoupleFrame>
  );
}

export default function CoupleDashboard({ params }: PageProps<"/dashboard/user/[slug]">) {
  return (
    <Suspense fallback={<p className="px-5 py-16 text-ink-mute">Memuat...</p>}>
      <Gate params={params} />
    </Suspense>
  );
}
