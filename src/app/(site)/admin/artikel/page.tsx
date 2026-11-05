import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { Pending } from "@/app/(site)/admin/pending";
import { currentAdmin } from "@/lib/admin-auth";
import { formatArticleDate } from "@/lib/article/format";
import { mediaUrl } from "@/lib/storage/media";
import { hasSupabase, supabaseAdmin } from "@/lib/supabase/admin";
import { AdminFrame } from "../frame";
import { LoginForm } from "../login-form";
import { button, cx } from "../settings/styles";
import { DeleteArticle } from "./delete-article";

export const metadata: Metadata = {
  title: "Artikel",
  robots: { index: false, follow: false },
};

type Row = { id: string; slug: string; title: string; category: string; thumbnail: string; published: boolean; created_at: string; updated_at: string };

const COLUMNS = "lg:grid-cols-[72px_minmax(0,1fr)_120px_80px_130px_130px_70px]";

async function List() {
  if (!hasSupabase()) {
    return (
      <AdminFrame current="/admin/artikel" title="Artikel">
        <p className="rounded-sm bg-blush px-4 py-3 text-[15px]">Supabase belum dikonfigurasi di environment.</p>
      </AdminFrame>
    );
  }
  const admin = await currentAdmin();
  if (!admin)
    return (
      <AdminFrame current="/admin/artikel" title="Artikel">
        <LoginForm />
      </AdminFrame>
    );

  const { data, error } = await supabaseAdmin().from("articles").select("id, slug, title, category, thumbnail, published, created_at, updated_at").order("created_at", { ascending: false });
  const rows = (data ?? []) as Row[];

  return (
    <AdminFrame email={admin.email ?? ""} current="/admin/artikel" title="Artikel" wide>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="text-[13px] text-ink-mute">
          {rows.length} artikel, {rows.filter((r) => r.published).length} tayang
        </p>
        <Link href="/admin/artikel/baru" prefetch={false} className={cx(button.primary, "has-[[data-pending]]:opacity-55")}>
          Tulis artikel
          <Pending />
        </Link>
      </div>

      {error && <p className="mt-6 rounded-sm bg-blush px-4 py-3 text-[15px]">Tabel artikel belum bisa dibaca. Pastikan migrasi 0029_articles.sql sudah dijalankan.</p>}

      <div className={`mt-6 hidden gap-4 border-b border-line pb-2 text-[12px] tracking-[1px] text-ink-mute uppercase lg:grid ${COLUMNS}`}>
        <span aria-hidden="true" />
        <span>Judul</span>
        <span>Kategori</span>
        <span>Status</span>
        <span>Dibuat</span>
        <span>Diperbarui</span>
        <span aria-hidden="true" />
      </div>
      <ul className="divide-y divide-line border-b border-line">
        {!error && rows.length === 0 && <li className="py-10 text-center text-[15px] text-ink-mute">Belum ada artikel.</li>}
        {rows.map((r) => (
          <li key={r.id} className={`grid grid-cols-[72px_minmax(0,1fr)] items-center gap-x-4 gap-y-2 py-4 ${COLUMNS}`}>
            <span className="flex aspect-3/2 items-center justify-center overflow-hidden rounded-sm border border-line bg-blush text-[11px] text-ink-mute">
              {r.thumbnail ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={mediaUrl(r.thumbnail)} alt="" loading="lazy" className="size-full object-cover" />
              ) : (
                <span aria-hidden="true">-</span>
              )}
            </span>
            <div className="min-w-0">
              <Link href={`/admin/artikel/${r.id}`} prefetch={false} className="block truncate font-serif text-xl text-ink no-underline hover:text-wine has-[[data-pending]]:opacity-55">
                {r.title}
                <Pending />
              </Link>
              <p className="truncate text-[13px] text-ink-mute">/artikel/{r.slug}</p>
            </div>
            <span className="col-start-2 text-[13px] text-ink-soft lg:col-start-auto">{r.category || "-"}</span>
            <span className={`col-start-2 w-fit rounded-full px-2.5 py-0.5 text-[12px] lg:col-start-auto ${r.published ? "bg-wine text-white" : "bg-blush text-ink-soft"}`}>{r.published ? "Live" : "Draft"}</span>
            <span className="col-start-2 text-[13px] text-ink-soft lg:col-start-auto">
              <span className="lg:hidden">Dibuat </span>
              {formatArticleDate(r.created_at)}
            </span>
            <span className="col-start-2 text-[13px] text-ink-soft lg:col-start-auto">
              <span className="lg:hidden">Diperbarui </span>
              {formatArticleDate(r.updated_at)}
            </span>
            <span className="col-start-2 lg:col-start-auto lg:justify-self-end">
              <DeleteArticle id={r.id} title={r.title} published={r.published} />
            </span>
          </li>
        ))}
      </ul>
    </AdminFrame>
  );
}

export default function ArticlesAdminPage() {
  return (
    <div className="min-h-dvh bg-ivory">
      <Suspense fallback={<p className="px-5 py-16 text-ink-mute">Memuat...</p>}>
        <List />
      </Suspense>
    </div>
  );
}
