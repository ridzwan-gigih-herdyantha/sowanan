"use client";

import { useEffect, useRef, useState } from "react";
import { saveBlob, toBlob } from "@/lib/export/canvas-file";
import type { StoryData, StoryPhoto } from "@/lib/invitation/story";
import { createKit, H, W, type StoryTemplate } from "@/themes/story-kit";
import { themeStory } from "@/themes/stories";
import { Spinner } from "../spinner";

type Fonts = Map<string, Set<string>>;

const IMAGE_TIMEOUT = 20000;

// SVG tanpa ukuran tidak bisa digambar ke canvas di Firefox, jadi ukurannya ditambahkan dulu.
async function svgUrl(src: string) {
  const text = await (await fetch(src)).text();
  const sized = text.replace(/<svg\b(?![^>]*\bwidth=)/, '<svg width="1600" height="1600"');
  return URL.createObjectURL(new Blob([sized], { type: "image/svg+xml" }));
}

// Gambar yang gagal dimuat dilewati. Foto kosong digantikan monogram dan aset kosong tidak digambar.
// Batas waktu menjaga supaya satu gambar yang macet tidak menahan semua pratinjau.
function loadImage(src: string) {
  return new Promise<HTMLImageElement | null>((done) => {
    window.setTimeout(() => done(null), IMAGE_TIMEOUT);
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => done(img);
    img.onerror = () => done(null);
    if (/\.svg(\?|$)/.test(src)) void svgUrl(src).then((url) => (img.src = url)).catch(() => done(null));
    else img.src = src;
  });
}

async function loadImages(data: StoryData, assets: string[]) {
  const p = data.photos;
  const photos = [p.hero, p.wide, p.couple, p.closing, p.venue, p.groom, p.bride, ...p.extra].flatMap((x) => (x ? [x.src] : []));
  const sources = [...new Set([...photos, ...assets])];
  const loaded = await Promise.all(sources.map(async (src) => [src, await loadImage(src)] as const));
  return new Map(loaded.flatMap(([src, img]) => (img ? [[src, img] as const] : [])));
}

// Mengembalikan foto bawaan tiap bingkai, supaya tombol ganti foto tahu ada berapa bingkai di template ini.
function paint(canvas: HTMLCanvasElement, data: StoryData, t: StoryTemplate, images: Map<string, HTMLImageElement>, override: Override, fonts?: Fonts) {
  const ctx = canvas.getContext("2d")!;
  ctx.clearRect(0, 0, W, H);
  const seen: (StoryPhoto | null)[] = [];
  const kit = createKit(
    ctx,
    data,
    images,
    (font, text) => {
      if (!fonts) return;
      if (!fonts.has(font)) fonts.set(font, new Set());
      for (const ch of text) fonts.get(font)!.add(ch);
    },
    { override, seen },
  );
  t.draw(kit);
  kit.watermark();
  return seen;
}

const fileName = (link: string, template: string) => `story-${link.split("/").pop()}-${template}.png`;

// Foto pilihan dari galeri dipasang di tengah bingkai tanpa zoom.
const picked = (src: string): StoryPhoto => ({ src, x: 50, y: 50, z: 1 });
const sameSrc = (a: string, b: string) => a.split("?")[0] === b.split("?")[0];

type Override = (StoryPhoto | undefined)[];

function Preview({ data, template, images, ready, choices, onNeed }: { data: StoryData; template: StoryTemplate; images: Map<string, HTMLImageElement> | null; ready: boolean; choices: string[]; onNeed: (src: string) => Promise<void> }) {
  const canvas = useRef<HTMLCanvasElement>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [override, setOverride] = useState<Override>([]);
  const [frames, setFrames] = useState<(string | null)[]>([]);
  const [open, setOpen] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);

  // Font tema baru diunduh saat diminta, jadi gambar digambar dulu untuk tahu font apa saja yang dipakai,
  // lalu digambar ulang setelah semuanya siap.
  useEffect(() => {
    const c = canvas.current;
    if (!c || !images) return;
    let alive = true;
    const fonts: Fonts = new Map();
    const seen = paint(c, data, template, images, override, fonts).map((p) => p?.src ?? null);
    setFrames((old) => (old.join("|") === seen.join("|") ? old : seen));
    void Promise.all([...fonts].map(([font, text]) => document.fonts.load(font, [...text].join("")).catch(() => {})))
      .then(() => document.fonts.ready)
      .then(() => {
        if (alive) paint(c, data, template, images, override);
      });
    return () => {
      alive = false;
    };
  }, [data, template, images, override]);

  // Dialog dibuka lewat effect supaya ref tidak disentuh saat render.
  const dialog = useRef<HTMLDialogElement>(null);
  useEffect(() => {
    if (open !== null && !dialog.current?.open) dialog.current?.showModal();
  }, [open]);

  async function choose(i: number, src: string | null) {
    dialog.current?.close();
    if (src) {
      setLoading(true);
      await onNeed(src);
      setLoading(false);
    }
    setOverride((o) => {
      const next = [...o];
      next[i] = src ? picked(src) : undefined;
      return next;
    });
  }

  async function download() {
    const c = canvas.current;
    if (!c) return;
    setBusy(true);
    setError("");
    try {
      saveBlob(await toBlob(c, "image/png"), fileName(data.link, template.id));
    } catch (e) {
      setError(e instanceof Error ? e.message : "Gagal mengunduh.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <figure className="min-w-0">
      <canvas ref={canvas} width={W} height={H} role="img" aria-label={`Gambar story ${template.name}, ${data.groom} dan ${data.bride}`} className={`aspect-[9/16] w-full rounded-sm bg-ivory ring-1 ring-line ${ready ? "" : "animate-pulse"}`} />
      <figcaption className="mt-3">
        <div className="flex flex-wrap items-baseline justify-between gap-x-3 gap-y-1">
          <p className="text-[15px] text-ink">{template.name}</p>
          {frames.length > 0 && choices.length > 0 && (
            // Template dengan dua bingkai foto memakai tombol bernomor supaya tetap muat di kolom yang sempit.
            <div className="flex items-center gap-2 text-[14px]">
              {loading && <Spinner />}
              {frames.length > 1 && <span className="text-ink-mute">Ganti foto</span>}
              {frames.map((_, i) => (
                <button key={i} type="button" onClick={() => setOpen(i)} disabled={!ready || loading} aria-haspopup="dialog" aria-label={frames.length > 1 ? `Ganti foto ${i + 1}` : undefined} className="text-wine underline underline-offset-4 disabled:opacity-60">
                  {frames.length > 1 ? i + 1 : "Ganti foto"}
                </button>
              ))}
            </div>
          )}
        </div>
        <dialog
          ref={dialog}
          aria-labelledby={`foto-${template.id}`}
          onClose={() => setOpen(null)}
          // Klik di luar kotak (di backdrop) menutup dialog.
          onClick={(e) => e.target === e.currentTarget && dialog.current?.close()}
          className="m-auto w-[min(640px,calc(100vw-32px))] rounded-sm border border-line bg-white p-0 text-ink shadow-[0_20px_60px_rgba(0,0,0,.25)] backdrop:bg-ink/50"
        >
          {open !== null && (
            <div className="flex max-h-[min(720px,calc(100dvh-48px))] flex-col">
              <div className="flex items-baseline justify-between gap-4 border-b border-line px-5 py-4">
                <h2 id={`foto-${template.id}`} className="font-serif text-xl">
                  Ganti foto{frames.length > 1 ? ` ${open + 1}` : ""} · {template.name}
                </h2>
                <button type="button" onClick={() => dialog.current?.close()} className="text-[14px] text-ink-mute hover:text-ink">
                  Tutup
                </button>
              </div>
              <ul className="grid grid-cols-3 gap-2 overflow-y-auto p-5 sm:grid-cols-4">
                <li>
                  <button type="button" onClick={() => choose(open, null)} aria-pressed={!override[open]} className={`flex aspect-square w-full items-center justify-center rounded-sm bg-ivory px-2 text-center text-[13px] leading-tight text-ink-soft ${override[open] ? "ring-1 ring-line" : "ring-2 ring-wine"}`}>
                    Foto bawaan template
                  </button>
                </li>
                {choices.map((src) => {
                  const active = override[open] ? sameSrc(override[open]!.src, src) : false;
                  return (
                    <li key={src}>
                      <button type="button" onClick={() => choose(open, src)} aria-pressed={active} aria-label="Pakai foto ini" className={`block aspect-square w-full overflow-hidden rounded-sm transition-opacity duration-150 hover:opacity-85 ${active ? "ring-2 ring-wine" : "ring-1 ring-line"}`}>
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={src} alt="" loading="lazy" className="size-full object-cover" />
                      </button>
                    </li>
                  );
                })}
              </ul>
            </div>
          )}
        </dialog>
        <button type="button" onClick={download} disabled={busy || !ready} className="mt-2 inline-flex items-center gap-2 rounded-sm bg-wine px-4 py-2.5 text-[14px] text-white transition-colors duration-150 hover:bg-wine-dark disabled:opacity-60">
          {busy && <Spinner />}
          {busy ? "Menyiapkan..." : "Unduh PNG"}
        </button>
        {error && <p className="mt-2 text-[13px] text-wine">{error}</p>}
      </figcaption>
    </figure>
  );
}

export function StorySheet({ data, choices }: { data: StoryData; choices: string[] }) {
  const story = themeStory(data.theme);
  const [images, setImages] = useState<Map<string, HTMLImageElement> | null>(null);

  // Foto galeri baru dimuat saat dipilih, supaya halaman tidak mengunduh semua foto sekaligus.
  async function need(src: string) {
    if (images?.has(src)) return;
    const img = await loadImage(src);
    if (img) setImages((m) => new Map(m ?? []).set(src, img));
  }

  useEffect(() => {
    let alive = true;
    void loadImages(data, story.assets?.(data) ?? []).then((loaded) => {
      if (alive) setImages(loaded);
    });
    return () => {
      alive = false;
    };
  }, [data, story]);

  return (
    <>
      <p className="mt-6 max-w-prose text-[14px] text-ink-soft">Tiga pilihan desain mengikuti tema, foto, palet, dan font undangan ini. Ukuran 1080 x 1920, siap diunggah ke story Instagram atau status WhatsApp. Teks berada di area aman, jadi tidak tertutup nama akun dan kolom balas.</p>
      <div className="mt-5 grid max-w-[1040px] grid-cols-2 gap-x-5 gap-y-8 md:grid-cols-3">
        {story.templates.map((t) => (
          <Preview key={t.id} data={data} template={t} images={images} ready={Boolean(images)} choices={choices} onNeed={need} />
        ))}
      </div>
    </>
  );
}
