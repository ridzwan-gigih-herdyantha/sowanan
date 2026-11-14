import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { BrandLoader } from "@/components/brand-loader";
import { currentAdmin } from "@/lib/admin-auth";
import { hasSupabase, supabaseAdmin } from "@/lib/supabase/admin";
import { AdminFrame } from "../../frame";
import { LoginForm } from "../../login-form";
import { ArticleForm } from "../article-form";
import { uniqueCategories } from "../categories";

export const metadata: Metadata = {
  title: "Edit artikel",
  robots: { index: false, follow: false },
};

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/;

async function Content({ params }: { params: PageProps<"/admin/artikel/[id]">["params"] }) {
  const admin = hasSupabase() ? await currentAdmin() : null;
  if (!admin)
    return (
      <AdminFrame current="/admin/artikel" title="Edit artikel">
        <LoginForm />
      </AdminFrame>
    );
  const { id } = await params;
  if (!UUID.test(id)) notFound();
  const sb = supabaseAdmin();
  const [{ data: row }, { data: others }] = await Promise.all([sb.from("articles").select("*").eq("id", id).maybeSingle(), sb.from("articles").select("category")]);
  if (!row) notFound();
  return (
    <AdminFrame email={admin.email ?? ""} current="/admin/artikel" title="Edit artikel" wide>
      <ArticleForm
        categories={uniqueCategories(others ?? [])}
        article={{
          id: row.id,
          slug: row.slug,
          title: row.title,
          category: row.category,
          thumbnail: row.thumbnail,
          content: row.content,
          published: row.published,
          createdAt: row.created_at,
          updatedAt: row.updated_at,
        }}
      />
    </AdminFrame>
  );
}

export default function EditArticlePage({ params }: PageProps<"/admin/artikel/[id]">) {
  return (
    <div className="min-h-dvh bg-ivory">
      <Suspense fallback={<BrandLoader />}>
        <Content params={params} />
      </Suspense>
    </div>
  );
}
