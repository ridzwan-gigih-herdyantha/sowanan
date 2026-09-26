"use client";

import { createClient } from "@supabase/supabase-js";
import { useCallback, useMemo, useState } from "react";
import { createUploadTicket, deleteMedia, finalizeUpload, listMedia, type MediaFile } from "./actions";

type PurposeOption = { key: string; label: string; kind: "image" | "video" | "audio" };
type Job = { id: string; name: string; status: "upload" | "proses" | "selesai" | "gagal"; message?: string };

const ACCEPT = { image: "image/jpeg,image/png,image/webp,image/heic,image/heif,image/avif", video: "video/mp4,video/webm", audio: "audio/mpeg,audio/mp4,audio/ogg" };

const kb = (n: number) => (n >= 1024 * 1024 ? `${(n / 1024 / 1024).toFixed(1)}MB` : `${Math.round(n / 1024)}KB`);

export function MediaManager(props: { slugs: string[]; initialFiles: MediaFile[]; purposes: PurposeOption[]; allowed: Record<string, string[]>; labels: Record<string, string>; bucket: string; supabaseUrl: string; anonKey: string }) {
  const { slugs, bucket } = props;
  const [slug, setSlug] = useState(slugs[0] ?? "");
  const purposes = useMemo(() => props.purposes.filter((p) => props.allowed[slug]?.includes(p.key)), [props.purposes, props.allowed, slug]);
  const [picked, setPurpose] = useState("");
  const purpose = purposes.some((p) => p.key === picked) ? picked : (purposes[0]?.key ?? "");
  const [files, setFiles] = useState<MediaFile[]>(props.initialFiles);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [jobs, setJobs] = useState<Job[]>([]);
  const [copied, setCopied] = useState("");

  const storage = useMemo(
    () => createClient(new URL(props.supabaseUrl).origin, props.anonKey, { auth: { persistSession: false } }).storage.from(bucket),
    [props.supabaseUrl, props.anonKey, bucket],
  );
  const current = purposes.find((p) => p.key === purpose);

  const refresh = useCallback(async (s: string) => {
    if (!s) return;
    setLoading(true);
    const res = await listMedia(s);
    setLoading(false);
    if (res.ok) {
      setFiles(res.data);
      setError("");
    } else setError(res.error);
  }, []);

  const patch = (id: string, next: Partial<Job>) => setJobs((js) => js.map((j) => (j.id === id ? { ...j, ...next } : j)));

  async function upload(list: FileList | null) {
    if (!list?.length || !slug || !purpose) return;
    const batch = Array.from(list).map((f) => ({ file: f, job: { id: crypto.randomUUID(), name: f.name, status: "upload" as const } }));
    setJobs((js) => [...batch.map((b) => b.job), ...js].slice(0, 20));

    for (const { file, job } of batch) {
      const type = file.type || "application/octet-stream";
      const ticket = await createUploadTicket({ slug, purpose, type, size: file.size });
      if (!ticket.ok) {
        patch(job.id, { status: "gagal", message: ticket.error });
        continue;
      }
      const { error: upErr } = await storage.uploadToSignedUrl(ticket.data.path, ticket.data.token, file, { contentType: type });
      if (upErr) {
        patch(job.id, { status: "gagal", message: "Upload terputus. Coba lagi." });
        continue;
      }
      patch(job.id, { status: "proses" });
      const done = await finalizeUpload({ slug, purpose, tmpPath: ticket.data.path, type });
      if (done.ok) patch(job.id, { status: "selesai", message: `${done.data.name} ${kb(done.data.bytes)}` });
      else patch(job.id, { status: "gagal", message: done.error });
    }
    refresh(slug);
  }

  async function remove(f: MediaFile) {
    if (!confirm(`Hapus ${f.name}? Undangan yang memakai file ini akan kehilangan gambarnya.`)) return;
    const res = await deleteMedia(slug, f.name);
    if (res.ok) setFiles((fs) => fs.filter((x) => x.name !== f.name));
    else setError(res.error);
  }

  async function copy(path: string) {
    await navigator.clipboard.writeText(path);
    setCopied(path);
    setTimeout(() => setCopied((c) => (c === path ? "" : c)), 1500);
  }

  const groups = useMemo(() => {
    const map = new Map<string, MediaFile[]>();
    for (const f of files) map.set(f.purpose, [...(map.get(f.purpose) ?? []), f]);
    return [...map.entries()];
  }, [files]);

  if (!slugs.length) return <p className="rounded-sm bg-blush px-4 py-3 text-[15px]">Belum ada undangan. Buat dulu dengan pnpm create-invitation.</p>;

  const field = "mt-2 block w-full rounded-sm border border-line bg-white px-3 py-3 text-base font-normal outline-none focus:border-wine";

  return (
    <div>
      <div className="grid gap-5 sm:grid-cols-2">
        <label className="block text-[14px] font-medium">
          Undangan
          <select value={slug} onChange={(e) => {
              setSlug(e.target.value);
              setFiles([]);
              refresh(e.target.value);
            }} className={field}>
            {slugs.map((s) => (
              <option key={s} value={s}>
                {props.labels[s] ?? s}
              </option>
            ))}
          </select>
        </label>
        <label className="block text-[14px] font-medium">
          Kegunaan file
          <select value={purpose} onChange={(e) => setPurpose(e.target.value)} className={field}>
            {purposes.map((p) => (
              <option key={p.key} value={p.key}>
                {p.label} ({p.key}_n)
              </option>
            ))}
          </select>
        </label>
      </div>

      <label className="mt-5 flex cursor-pointer flex-col items-center justify-center gap-1 rounded-sm border border-dashed border-wine/40 bg-white px-5 py-10 text-center transition-colors duration-150 hover:border-wine focus-within:border-wine">
        <span className="text-[15px] text-wine">Pilih file untuk diunggah</span>
        <span className="text-[13px] text-ink-mute">
          {current?.kind === "image" ? "Foto dikompres otomatis ke WebP. Maksimal 25MB per file." : current?.kind === "video" ? "MP4 atau WebM, maksimal 15MB." : "MP3, M4A, atau OGG, maksimal 8MB."}
        </span>
        <input
          type="file"
          multiple={current?.kind === "image"}
          accept={current ? ACCEPT[current.kind] : undefined}
          className="sr-only"
          onChange={(e) => {
            upload(e.target.files);
            e.target.value = "";
          }}
        />
      </label>

      {jobs.length > 0 && (
        <ul className="mt-4 divide-y divide-line rounded-sm border border-line bg-white text-[14px]">
          {jobs.map((j) => (
            <li key={j.id} className="flex items-center justify-between gap-3 px-4 py-2.5">
              <span className="min-w-0 truncate">{j.name}</span>
              <span className={`shrink-0 text-right ${j.status === "gagal" ? "text-wine" : j.status === "selesai" ? "text-ink-soft" : "text-ink-mute"}`}>
                {j.status === "upload" ? "Mengunggah..." : j.status === "proses" ? "Mengompres..." : j.message}
              </span>
            </li>
          ))}
        </ul>
      )}

      {error && <p className="mt-4 rounded-sm bg-blush px-4 py-3 text-[14px] text-wine">{error}</p>}

      <div className="mt-10 flex items-baseline justify-between border-b border-line pb-3">
        <h2 className="font-serif text-2xl">File {props.labels[slug] ?? slug}</h2>
        <span className="text-[13px] text-ink-mute">{loading ? "Memuat..." : `${files.length} file`}</span>
      </div>

      {!loading && !files.length && <p className="mt-5 text-[15px] text-ink-mute">Belum ada file dengan format nama kegunaan_nomor.</p>}

      {groups.map(([key, list]) => (
        <section key={key} className="mt-6">
          <h3 className="text-[13px] tracking-[2px] text-ink-mute uppercase">{props.purposes.find((p) => p.key === key)?.label ?? key}
            {!props.allowed[slug]?.includes(key) && <span className="ml-2 tracking-normal normal-case text-wine">(tidak dipakai tema ini, aman dihapus)</span>}</h3>
          <ul className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-4">
            {list.map((f) => (
              <li key={f.name} className="overflow-hidden rounded-sm border border-line bg-white">
                <div className="flex aspect-square items-center justify-center bg-blush/50">
                  {f.contentType.startsWith("image/") ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={f.url} alt={f.name} loading="lazy" className="size-full object-cover" />
                  ) : f.contentType.startsWith("video/") ? (
                    <video src={f.url} muted preload="metadata" className="size-full object-cover" />
                  ) : (
                    <audio src={f.url} controls preload="none" className="w-[90%]" />
                  )}
                </div>
                <div className="px-3 py-2 text-[13px]">
                  <p className="truncate font-medium">{f.name}</p>
                  <p className="text-ink-mute">{kb(f.bytes)}</p>
                  <div className="mt-1.5 flex justify-between gap-2">
                    <button type="button" onClick={() => copy(f.path)} className="text-wine underline underline-offset-4">
                      {copied === f.path ? "Tersalin" : "Salin path"}
                    </button>
                    <button type="button" onClick={() => remove(f)} className="text-ink-mute hover:text-wine">
                      Hapus
                    </button>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        </section>
      ))}
    </div>
  );
}
