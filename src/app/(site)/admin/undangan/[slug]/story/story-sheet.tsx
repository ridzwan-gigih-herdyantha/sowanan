"use client";

import { useEffect, useRef, useState } from "react";
import { saveBlob, toBlob } from "@/lib/export/canvas-file";
import type { StoryData } from "@/lib/invitation/story";
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

function paint(canvas: HTMLCanvasElement, data: StoryData, t: StoryTemplate, images: Map<string, HTMLImageElement>, fonts?: Fonts) {
  const ctx = canvas.getContext("2d")!;
  ctx.clearRect(0, 0, W, H);
  const kit = createKit(ctx, data, images, (font, text) => {
    if (!fonts) return;
    if (!fonts.has(font)) fonts.set(font, new Set());
    for (const ch of text) fonts.get(font)!.add(ch);
  });
  t.draw(kit);
  kit.watermark();
}

const fileName = (link: string, template: string) => `story-${link.split("/").pop()}-${template}.png`;

function Preview({ data, template, images, ready }: { data: StoryData; template: StoryTemplate; images: Map<string, HTMLImageElement> | null; ready: boolean }) {
  const canvas = useRef<HTMLCanvasElement>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  // Font tema baru diunduh saat diminta, jadi gambar digambar dulu untuk tahu font apa saja yang dipakai,
  // lalu digambar ulang setelah semuanya siap.
  useEffect(() => {
    const c = canvas.current;
    if (!c || !images) return;
    let alive = true;
    const fonts: Fonts = new Map();
    paint(c, data, template, images, fonts);
    void Promise.all([...fonts].map(([font, text]) => document.fonts.load(font, [...text].join("")).catch(() => {})))
      .then(() => document.fonts.ready)
      .then(() => {
        if (alive) paint(c, data, template, images);
      });
    return () => {
      alive = false;
    };
  }, [data, template, images]);

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
        <p className="text-[15px] text-ink">{template.name}</p>
        <button type="button" onClick={download} disabled={busy || !ready} className="mt-2 inline-flex items-center gap-2 rounded-sm bg-wine px-4 py-2.5 text-[14px] text-white transition-colors duration-150 hover:bg-wine-dark disabled:opacity-60">
          {busy && <Spinner />}
          {busy ? "Menyiapkan..." : "Unduh PNG"}
        </button>
        {error && <p className="mt-2 text-[13px] text-wine">{error}</p>}
      </figcaption>
    </figure>
  );
}

export function StorySheet({ data }: { data: StoryData }) {
  const story = themeStory(data.theme);
  const [images, setImages] = useState<Map<string, HTMLImageElement> | null>(null);

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
          <Preview key={t.id} data={data} template={t} images={images} ready={Boolean(images)} />
        ))}
      </div>
    </>
  );
}
