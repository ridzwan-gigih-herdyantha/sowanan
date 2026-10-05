import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { currentAdmin } from "@/lib/admin-auth";
import { hasSupabase, supabaseAdmin } from "@/lib/supabase/admin";
import { getSettingsFresh, PACKAGE_IDS, PACKAGE_NAMES, themeAvailable, visiblePackages } from "@/lib/settings";
import { THEME_NAMES } from "@/themes/media";
import { LoginForm } from "../login-form";
import { AdminFrame } from "../frame";
import { CreateForm } from "./create-form";
import { PackageSelect } from "./package-select";
import { PaymentToggle } from "./payment-toggle";

export const metadata: Metadata = {
  title: "Undangan",
  robots: { index: false, follow: false },
};

const dateFmt = new Intl.DateTimeFormat("id-ID", { day: "numeric", month: "short", year: "numeric", timeZone: "Asia/Jakarta" });

type Row = {
  slug: string;
  theme: string;
  published: boolean;
  created_at: string;
  dg: string | null;
  db: string | null;
  rg: string | null;
  rb: string | null;
  payment_status?: string;
  package?: string | null;
};

const BASE_COLS =
  "slug, theme, published, created_at, dg:data->couple->groom->>name, db:data->couple->bride->>name, rg:draft->couple->groom->>name, rb:draft->couple->bride->>name";

async function List() {
  if (!hasSupabase()) {
    return (
      <AdminFrame current="/admin/undangan" title="Undangan">
        <p className="rounded-sm bg-blush px-4 py-3 text-[15px]">Supabase belum dikonfigurasi di environment.</p>
      </AdminFrame>
    );
  }
  const admin = await currentAdmin();
  if (!admin)
    return (
      <AdminFrame current="/admin/undangan" title="Undangan">
        <LoginForm />
      </AdminFrame>
    );

  const sb = supabaseAdmin();
  // Kolom payment_status (migrasi 0005) dan package (0006) bisa belum ada, jadi dicoba bertahap.
  let rows: Row[] = [];
  for (const extra of [", payment_status, package", ", payment_status", ""]) {
    const res = await sb.from("invitations").select(BASE_COLS + extra).order("created_at", { ascending: false });
    if (!res.error) {
      rows = (res.data ?? []) as unknown as Row[];
      break;
    }
  }
  // Tema mengikuti kolom Tersedia di paket pada pengaturan, sama dengan validasi di server.
  const settings = await getSettingsFresh();
  const packages = visiblePackages(settings).map((id) => ({ id, name: PACKAGE_NAMES[id] }));
  const themes = Object.entries(THEME_NAMES).map(([key, name]) => {
    const entry = settings.themes.find((t) => t.slug === key);
    return { key, name: entry?.name ?? name, packages: PACKAGE_IDS.filter((p) => !entry || themeAvailable(settings, entry.tier, p)) };
  });
  const couple = (r: Row) => [r.rg || r.dg, r.rb || r.db].filter(Boolean).join(" & ") || "Belum diisi";
  const unpaid = rows.filter((r) => r.payment_status === "belum_lunas").length;

  return (
    <AdminFrame email={admin.email ?? ""} current="/admin/undangan" title="Undangan">
      <CreateForm packages={packages} themes={themes} />

      <div className="mt-10 flex flex-wrap items-baseline justify-between gap-2">
        <h2 className="font-serif text-2xl">Daftar undangan</h2>
        <p className="text-[13px] text-ink-mute">
          {rows.length} undangan, {unpaid} belum lunas
        </p>
      </div>

      <div className="mt-3 hidden grid-cols-[minmax(0,1fr)_140px_110px_80px_100px_150px] gap-4 border-b border-line pb-2 text-[12px] tracking-[1px] text-ink-mute uppercase lg:grid">
        <span>Pasangan</span>
        <span>Paket</span>
        <span>Pembayaran</span>
        <span>Status</span>
        <span>Dibuat</span>
        <span className="sr-only">Aksi</span>
      </div>
      <ul className="divide-y divide-line border-b border-line">
        {rows.map((r) => (
          <li key={r.slug} className="grid grid-cols-2 items-center gap-x-4 gap-y-3 py-4 lg:grid-cols-[minmax(0,1fr)_140px_110px_80px_100px_150px]">
            <div className="col-span-2 min-w-0 lg:col-span-1">
              <Link href={`/admin/undangan/${r.slug}`} prefetch={false} className="block truncate font-serif text-xl text-ink no-underline hover:text-wine">
                {couple(r)}
              </Link>
              <p className="truncate text-[13px] text-ink-mute">
                sowanan.com/{r.slug} · tema {THEME_NAMES[r.theme] ?? r.theme}
                {r.slug === r.theme && " · contoh"}
              </p>
            </div>
            <PackageSelect slug={r.slug} value={r.package ?? ""} />
            <span className="justify-self-end lg:justify-self-start">
              <PaymentToggle slug={r.slug} paid={r.payment_status !== "belum_lunas"} />
            </span>
            <span className={`w-fit rounded-full px-2.5 py-0.5 text-[12px] ${r.published ? "bg-wine text-white" : "bg-blush text-ink-soft"}`}>{r.published ? "Tayang" : "Draf"}</span>
            <span className="justify-self-end text-[13px] text-ink-soft lg:justify-self-start">{dateFmt.format(new Date(r.created_at))}</span>
            <span className="col-span-2 flex gap-4 text-[14px] lg:col-span-1 lg:justify-self-end">
              <Link href={`/admin/undangan/${r.slug}`} prefetch={false} className="text-wine underline underline-offset-4">
                Edit
              </Link>
              <Link href={`/admin/undangan/${r.slug}/tamu`} prefetch={false} className="text-wine underline underline-offset-4">
                Tamu
              </Link>
              <Link href={`/admin/undangan/${r.slug}/respon`} prefetch={false} className="text-wine underline underline-offset-4">
                RSVP
              </Link>
            </span>
          </li>
        ))}
      </ul>
    </AdminFrame>
  );
}

export default function InvitationsPage() {
  return (
    <div className="min-h-dvh bg-ivory">
      <Suspense fallback={<p className="px-5 py-16 text-ink-mute">Memuat...</p>}>
        <List />
      </Suspense>
    </div>
  );
}
