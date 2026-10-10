import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { Suspense } from "react";
import { currentCouple } from "@/lib/couple-auth";
import { invitationDataSchema } from "@/lib/invitation/schema";
import { CoupleFrame } from "./frame";

export const metadata: Metadata = {
  title: "Dashboard mempelai",
  robots: { index: false, follow: false },
  referrer: "no-referrer",
};

const names = (data: unknown) => {
  const d = invitationDataSchema.parse(data ?? {});
  return [d.couple.groom.name, d.couple.bride.name].filter(Boolean).join(" & ");
};

// Akun dengan satu undangan langsung dibawa ke undangannya. Kalau lebih dari satu, pilih dulu.
async function Gate() {
  const couple = await currentCouple();
  if (!couple) redirect("/dashboard/user/login");
  if (couple.invitations.length === 1) redirect(`/dashboard/user/${couple.invitations[0].slug}`);
  return (
    <CoupleFrame>
      <h1 className="font-serif text-3xl">Undangan kalian</h1>
      {couple.invitations.length === 0 ? (
        <p className="mt-4 text-[15px] text-ink-soft">Akun ini belum terhubung ke undangan. Hubungi tim Sowanan lewat WhatsApp.</p>
      ) : (
        <ul className="mt-6 divide-y divide-line border-y border-line">
          {couple.invitations.map((inv) => (
            <li key={inv.id}>
              <Link href={`/dashboard/user/${inv.slug}`} prefetch={false} className="block py-4 no-underline hover:text-wine">
                <span className="block font-serif text-xl">{names(inv.data) || inv.slug}</span>
                <span className="text-[13px] text-ink-mute">sowanan.com/{inv.slug}</span>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </CoupleFrame>
  );
}

export default function CoupleHome() {
  return (
    <Suspense fallback={<p className="px-5 py-16 text-ink-mute">Memuat...</p>}>
      <Gate />
    </Suspense>
  );
}
