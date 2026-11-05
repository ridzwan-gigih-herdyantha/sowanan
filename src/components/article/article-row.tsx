import Image from "next/image";
import Link from "next/link";
import { formatArticleDate } from "@/lib/article/format";
import type { ArticleSummary } from "@/lib/article/load";
import { mediaUrl } from "@/lib/storage/media";

const focus = "focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-wine";

// Tulisan terbaru di puncak daftar. Thumbnail-nya elemen terbesar di layar pertama, jadi dimuat lebih dulu.
export function ArticleLead({ article }: { article: ArticleSummary }) {
  return (
    <Link prefetch={false} href={`/artikel/${article.slug}`} className={`group grid gap-5 text-ink no-underline md:grid-cols-[minmax(0,1.2fr)_minmax(0,1fr)] md:items-center md:gap-10 ${focus}`}>
      <span className="relative block aspect-3/2 overflow-hidden rounded-sm border border-line bg-blush">
        <Image src={mediaUrl(article.thumbnail)} alt="" fill loading="eager" fetchPriority="high" sizes="(min-width: 760px) 600px, 100vw" className="object-cover" />
      </span>
      <span className="block">
        <span className="block text-[14px] font-medium text-wine">{article.category}</span>
        <span className="mt-2 block font-serif text-[clamp(30px,4vw,44px)] leading-[1.12] font-medium transition-colors duration-150 group-hover:text-wine motion-reduce:transition-none">{article.title}</span>
        <span className="mt-3 block max-w-[52ch] text-[16px] leading-relaxed text-ink-soft">{article.excerpt}</span>
        <time dateTime={article.createdAt} className="mt-4 block text-[14px] text-ink-mute">
          {formatArticleDate(article.createdAt)}
        </time>
      </span>
    </Link>
  );
}

export function ArticleRow({ article }: { article: ArticleSummary }) {
  return (
    <Link prefetch={false} href={`/artikel/${article.slug}`} className={`group grid grid-cols-[minmax(0,1fr)_96px] items-center gap-4 py-5 text-ink no-underline sm:grid-cols-[minmax(0,1fr)_150px_150px] sm:gap-6 ${focus}`}>
      <span className="block min-w-0">
        <span className="mb-1 block text-[14px] font-medium text-wine sm:hidden">{article.category}</span>
        <span className="block font-serif text-2xl leading-tight font-medium transition-colors duration-150 group-hover:text-wine motion-reduce:transition-none">{article.title}</span>
        <time dateTime={article.createdAt} className="mt-1.5 block text-[14px] text-ink-mute">
          {formatArticleDate(article.createdAt)}
        </time>
      </span>
      <span className="hidden text-[14px] font-medium text-wine sm:block">{article.category}</span>
      <span className="relative block aspect-3/2 overflow-hidden rounded-sm border border-line bg-blush">
        <Image src={mediaUrl(article.thumbnail)} alt="" fill sizes="150px" className="object-cover" />
      </span>
    </Link>
  );
}
