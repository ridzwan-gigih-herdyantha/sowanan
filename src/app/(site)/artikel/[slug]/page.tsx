import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArticleRow } from "@/components/article/article-row";
import { ReadingProgress } from "@/components/article/reading-progress";
import { SiteFooter, WhatsAppFloat } from "@/components/home/closing";
import { SiteHeader } from "@/components/home/site-header";
import { Container } from "@/components/ui";
import { formatArticleDate, updatedLater } from "@/lib/article/format";
import { getArticle, getArticles } from "@/lib/article/load";
import { excerptOf } from "@/lib/article/sanitize";
import { articleSeo } from "@/lib/seo";
import { generalWaLink, getSettings, textVars } from "@/lib/settings";
import { OG_BASE } from "@/lib/site";
import { mediaUrl } from "@/lib/storage/media";

const BODY_ID = "isi-artikel";

// Cache Components menolak daftar kosong saat build, padahal artikel bisa saja belum ada. Slug pengganti berujung 404.
export async function generateStaticParams() {
  const articles = await getArticles();
  return articles.length ? articles.map((a) => ({ slug: a.slug })) : [{ slug: "__placeholder__" }];
}

export async function generateMetadata({ params }: PageProps<"/artikel/[slug]">): Promise<Metadata> {
  const article = await getArticle((await params).slug);
  if (!article) return {};
  const url = `/artikel/${article.slug}`;
  const seo = articleSeo({ title: article.title, category: article.category, text: excerptOf(article.content, 400) });
  return {
    title: { absolute: seo.title },
    description: seo.description,
    alternates: { canonical: url },
    openGraph: {
      ...OG_BASE,
      type: "article",
      title: seo.title,
      description: seo.description,
      url,
      publishedTime: article.createdAt,
      modifiedTime: article.updatedAt,
      images: [{ url: mediaUrl(article.thumbnail) }],
    },
  };
}

export default async function ArticlePage({ params }: PageProps<"/artikel/[slug]">) {
  const { slug } = await params;
  const [article, s, all] = await Promise.all([getArticle(slug), getSettings(), getArticles()]);
  if (!article) notFound();
  const wa = generalWaLink(s);
  const others = all.filter((a) => a.slug !== slug).slice(0, 3);

  return (
    <>
      <SiteHeader settings={s} waHref={wa}>
        <ReadingProgress targetId={BODY_ID} />
      </SiteHeader>
      <main className="bg-ivory">
        <Container className="pt-8 pb-14 sm:pt-12 sm:pb-20">
          <article className="mx-auto max-w-[820px]">
            <Link prefetch={false} href="/artikel" className="text-[14px] text-ink-mute underline-offset-4 hover:text-wine hover:underline">
              Semua artikel
            </Link>
            <p className="mt-6 text-[14px] font-medium text-wine">{article.category}</p>
            <h1 className="mt-2 font-serif text-[clamp(36px,5.5vw,56px)] leading-[1.08] font-medium text-ink">{article.title}</h1>
            <p className="mt-4 flex flex-wrap gap-x-5 gap-y-1 text-[14px] text-ink-mute">
              <span>
                Dibuat <time dateTime={article.createdAt}>{formatArticleDate(article.createdAt)}</time>
              </span>
              {updatedLater(article.createdAt, article.updatedAt) && (
                <span>
                  Diperbarui <time dateTime={article.updatedAt}>{formatArticleDate(article.updatedAt)}</time>
                </span>
              )}
            </p>
            <div className="relative mt-7 aspect-3/2 overflow-hidden rounded-sm border border-line bg-blush">
              <Image src={mediaUrl(article.thumbnail)} alt="" fill loading="eager" fetchPriority="high" sizes="(min-width: 860px) 820px, 100vw" className="object-cover" />
            </div>
            <div id={BODY_ID} className="article-body mt-9" dangerouslySetInnerHTML={{ __html: article.content }} />
          </article>

          {others.length > 0 && (
            <section aria-labelledby="tulisan-lain" className="mx-auto mt-16 max-w-[820px]">
              <h2 id="tulisan-lain" className="font-serif text-[30px] leading-tight font-medium text-ink">
                Tulisan lain
              </h2>
              <ul className="mt-4 divide-y divide-line border-y border-line">
                {others.map((a) => (
                  <li key={a.slug}>
                    <ArticleRow article={a} />
                  </li>
                ))}
              </ul>
            </section>
          )}
        </Container>
      </main>
      <SiteFooter settings={s} vars={textVars(s)} waHref={wa} />
      <WhatsAppFloat waHref={wa} />
    </>
  );
}
