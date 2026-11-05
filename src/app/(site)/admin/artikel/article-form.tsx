"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { formatArticleDate, slugify } from "@/lib/article/format";
import { mediaUrl } from "@/lib/storage/media";
import { Card, Field, button, cx, input } from "../settings/ui";
import { useWorking } from "../use-working";
import { saveArticle } from "./actions";
import { ArticleEditor } from "./article-editor";
import { DeleteArticle } from "./delete-article";
import { uploadArticleImage } from "./upload";

export type EditableArticle = { id: string; slug: string; title: string; category: string; thumbnail: string; content: string; published: boolean; createdAt: string; updatedAt: string };

export function ArticleForm({ article, categories }: { article?: EditableArticle; categories: string[] }) {
  const router = useRouter();
  const [title, setTitle] = useState(article?.title ?? "");
  const [slug, setSlug] = useState(article?.slug ?? "");
  // Artikel baru mengikuti judul sampai alamatnya diubah sendiri. Alamat artikel lama tidak ikut berubah saat judul diganti.
  const [slugTouched, setSlugTouched] = useState(Boolean(article));
  const [category, setCategory] = useState(article?.category ?? "");
  const [thumbnail, setThumbnail] = useState(article?.thumbnail ?? "");
  const [content, setContent] = useState(article?.content ?? "");
  const [published, setPublished] = useState(article?.published ?? false);
  const [updatedAt, setUpdatedAt] = useState(article?.updatedAt ?? "");
  const [savedSlug, setSavedSlug] = useState(article?.slug ?? "");
  const [dirty, setDirty] = useState(false);
  const [message, setMessage] = useState("");
  const [fields, setFields] = useState<Record<string, string>>({});
  const [uploadStatus, setUploadStatus] = useState("");
  const [uploading, setUploading] = useState(false);
  const { working, run } = useWorking(setMessage);

  useEffect(() => {
    if (!dirty) return;
    const warn = (e: BeforeUnloadEvent) => e.preventDefault();
    window.addEventListener("beforeunload", warn);
    return () => window.removeEventListener("beforeunload", warn);
  }, [dirty]);

  const touched = <T,>(set: (v: T) => void) => (v: T) => {
    set(v);
    setDirty(true);
    setMessage("");
  };

  const save = (nextPublished: boolean) =>
    run(nextPublished ? "terbit" : "draf", async () => {
      setFields({});
      setMessage("");
      const res = await saveArticle(article?.id ?? null, { title, slug, category, thumbnail, content, published: nextPublished });
      if (!res.ok) {
        setFields(res.fields ?? {});
        setMessage(res.error);
        return;
      }
      setDirty(false);
      if (!article) {
        router.replace(`/admin/artikel/${res.id}`);
        return;
      }
      setPublished(nextPublished);
      setUpdatedAt(res.updatedAt);
      setSavedSlug(slug);
      setMessage(nextPublished ? "Tersimpan dan tayang di situs." : "Tersimpan sebagai draf.");
    });

  async function pickThumbnail(file: File) {
    setUploading(true);
    setUploadStatus("Mengunggah...");
    const res = await uploadArticleImage(file, "artcover");
    setUploading(false);
    if (!res.ok) return setUploadStatus(res.error);
    touched(setThumbnail)(res.path);
    setUploadStatus("");
  }

  return (
    <form onSubmit={(e) => e.preventDefault()} className="grid items-start gap-x-[18px] lg:grid-cols-[minmax(0,1fr)_320px]">
      <Card title="Tulisan">
        <Field label="Judul" max={160} count={title.length} error={fields.title}>
          {(id, describedBy) => (
            <input
              id={id}
              value={title}
              aria-describedby={describedBy}
              aria-invalid={!!fields.title}
              onChange={(e) => {
                touched(setTitle)(e.target.value);
                if (!slugTouched) setSlug(slugify(e.target.value));
              }}
              className={cx(input, fields.title ? "border-wine" : "border-[#E8E0D6]")}
            />
          )}
        </Field>
        <Field label="Alamat" help={`sowanan.com/artikel/${slug || "..."}${article?.published ? ". Mengubah alamat artikel yang sudah tayang membuat tautan lama tidak berlaku." : ""}`} error={fields.slug}>
          {(id, describedBy) => (
            <input
              id={id}
              value={slug}
              spellCheck={false}
              aria-describedby={describedBy}
              aria-invalid={!!fields.slug}
              onChange={(e) => {
                setSlugTouched(true);
                touched(setSlug)(e.target.value);
              }}
              onBlur={() => setSlug(slugify(slug))}
              className={cx(input, fields.slug ? "border-wine" : "border-[#E8E0D6]")}
            />
          )}
        </Field>
        <p className="mb-[7px] text-[12.5px] font-medium text-[#5C5048]">Isi</p>
        <ArticleEditor initial={article?.content ?? ""} error={fields.content} onChange={touched(setContent)} />
      </Card>

      <div>
        <Card title="Publikasi" hint={published ? "Artikel ini tayang di situs." : "Draf belum terlihat oleh pengunjung."}>
          <div className="grid gap-2">
            <button type="button" disabled={working !== null || uploading} onClick={() => save(true)} className={button.primary}>
              {working === "terbit" ? "Menyimpan..." : published ? "Simpan perubahan" : "Terbitkan"}
            </button>
            <button type="button" disabled={working !== null || uploading} onClick={() => save(false)} className={button.quiet}>
              {working === "draf" ? "Menyimpan..." : published ? "Jadikan draf" : "Simpan draf"}
            </button>
          </div>
          <p className={cx("mt-3 min-h-[18px] text-[12.5px]", Object.keys(fields).length ? "text-wine" : "text-ink-mute")} aria-live="polite">
            {message || (dirty ? "Ada perubahan yang belum disimpan." : "")}
          </p>
          {article && (
            <dl className="mt-3 grid grid-cols-[auto_1fr] gap-x-4 gap-y-1 border-t border-[#F0EAE2] pt-3 text-[12.5px]">
              <dt className="text-ink-mute">Dibuat</dt>
              <dd>{formatArticleDate(article.createdAt)}</dd>
              <dt className="text-ink-mute">Diperbarui</dt>
              <dd>{formatArticleDate(updatedAt)}</dd>
            </dl>
          )}
          {article && (
            <div className="mt-4 flex flex-wrap items-center justify-between gap-2">
              {published ? (
                <a href={`/artikel/${savedSlug}`} target="_blank" rel="noopener" className="text-[12.5px] text-wine underline-offset-4 hover:underline">
                  Lihat di situs
                </a>
              ) : (
                <span />
              )}
              <DeleteArticle id={article.id} title={title} published={published} redirectTo="/admin/artikel" />
            </div>
          )}
        </Card>

        <Card title="Detail">
          <div className="field mb-[18px]">
            <p id="thumb-label" className="mb-[7px] text-[12.5px] font-medium text-[#5C5048]">
              Thumbnail
            </p>
            <div className={cx("relative flex aspect-3/2 items-center justify-center overflow-hidden rounded-lg border border-dashed bg-[#FCFAF7] text-[12.5px] text-ink-mute", fields.thumbnail ? "border-wine" : "border-[#E8E0D6]")}>
              {thumbnail ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={mediaUrl(thumbnail)} alt="" className="size-full object-cover" />
              ) : (
                "Belum ada"
              )}
            </div>
            <div className="mt-2 flex items-center gap-3">
              <label className={cx(button.ghost, button.sm, "relative cursor-pointer focus-within:outline-2 focus-within:outline-offset-2 focus-within:outline-wine", uploading && "pointer-events-none opacity-50")}>
                {thumbnail ? "Ganti" : "Pilih gambar"}
                <input
                  type="file"
                  accept="image/jpeg,image/png,image/webp,image/heic,image/heif,image/avif"
                  aria-labelledby="thumb-label"
                  disabled={uploading}
                  className="absolute inset-0 cursor-pointer opacity-0"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    e.target.value = "";
                    if (file) pickThumbnail(file);
                  }}
                />
              </label>
              {thumbnail && !uploading && (
                <button type="button" onClick={() => touched(setThumbnail)("")} className="text-[12.5px] text-ink-mute underline-offset-4 hover:text-wine hover:underline">
                  Hapus
                </button>
              )}
            </div>
            <p className={cx("mt-1.5 text-[11.5px] leading-normal", fields.thumbnail ? "text-wine" : "text-ink-mute")} aria-live="polite">
              {fields.thumbnail || uploadStatus || "Ditampilkan dengan rasio 3:2."}
            </p>
          </div>
          <Field label="Kategori" help="Ketik baru atau pilih yang sudah ada." error={fields.category} className="mb-0">
            {(id, describedBy) => (
              <>
                <input
                  id={id}
                  list={`${id}-list`}
                  value={category}
                  maxLength={40}
                  aria-describedby={describedBy}
                  aria-invalid={!!fields.category}
                  onChange={(e) => touched(setCategory)(e.target.value)}
                  className={cx(input, fields.category ? "border-wine" : "border-[#E8E0D6]")}
                />
                <datalist id={`${id}-list`}>
                  {categories.map((c) => (
                    <option key={c} value={c} />
                  ))}
                </datalist>
              </>
            )}
          </Field>
        </Card>
      </div>
    </form>
  );
}
