import type { Metadata } from "next";
import { Suspense } from "react";
import { BrandLoader } from "@/components/brand-loader";
import { currentAdmin } from "@/lib/admin-auth";
import { hasSupabase, supabaseAdmin } from "@/lib/supabase/admin";
import { AdminFrame } from "../../frame";
import { LoginForm } from "../../login-form";
import { ArticleForm } from "../article-form";
import { uniqueCategories } from "../categories";

export const metadata: Metadata = {
  title: "Tulis artikel",
  robots: { index: false, follow: false },
};

async function Content() {
  const admin = hasSupabase() ? await currentAdmin() : null;
  if (!admin)
    return (
      <AdminFrame current="/admin/artikel" title="Tulis artikel">
        <LoginForm />
      </AdminFrame>
    );
  const { data } = await supabaseAdmin().from("articles").select("category");
  return (
    <AdminFrame email={admin.email ?? ""} current="/admin/artikel" title="Tulis artikel" wide>
      <ArticleForm categories={uniqueCategories(data ?? [])} />
    </AdminFrame>
  );
}

export default function NewArticlePage() {
  return (
    <div className="min-h-dvh bg-ivory">
      <Suspense fallback={<BrandLoader />}>
        <Content />
      </Suspense>
    </div>
  );
}
