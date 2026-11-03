"use client";

import { useEffect, useRef, useState } from "react";
import { saveBlob, toBlob } from "@/lib/export/canvas-file";
import type { StoryData } from "@/lib/invitation/story";
import { contrast } from "@/themes/palette";
import { Spinner } from "../spinner";

const W = 1080;
const H = 1920;
const CX = W / 2;
const TEXT_W = 800;
const NAME_WRAP = 96;

// Ukuran terbesar yang muat selebar teks, supaya nama panjang tidak terpotong.
function fit(ctx: CanvasRenderingContext2D, text: string, font: (size: number) => string, max: number, min: number) {
  let size = max;
  ctx.font = font(size);
  while (size > min && ctx.measureText(text).width > TEXT_W) {
    size -= 2;
    ctx.font = font(size);
  }
  return size;
}

// Lokasi yang panjang dibagi dua baris, lebih terbaca daripada diperkecil terus.
function lines(ctx: CanvasRenderingContext2D, text: string) {
  if (ctx.measureText(text).width <= TEXT_W) return [text];
  const words = text.split(" ");
  let cut = 1;
  while (cut < words.length - 1 && ctx.measureText(words.slice(0, cut + 1).join(" ")).width <= TEXT_W) cut += 1;
  return [words.slice(0, cut).join(" "), words.slice(cut).join(" ")];
}

function diamond(ctx: CanvasRenderingContext2D, x: number, y: number, r: number) {
  ctx.beginPath();
  ctx.moveTo(x, y - r);
  ctx.lineTo(x + r, y);
  ctx.lineTo(x, y + r);
  ctx.lineTo(x - r, y);
  ctx.closePath();
  ctx.fill();
}

// Isi berada di 250 sampai 1670 piksel supaya tidak tertutup nama akun dan kolom balas di story.
function draw(canvas: HTMLCanvasElement, d: StoryData) {
  const ctx = canvas.getContext("2d")!;
  const { paper, ink, accent, gold } = d.colors;
  ctx.fillStyle = paper;
  ctx.fillRect(0, 0, W, H);

  ctx.strokeStyle = gold;
  ctx.lineWidth = 3;
  ctx.strokeRect(56, 56, W - 112, H - 112);
  ctx.lineWidth = 1;
  ctx.strokeRect(74, 74, W - 148, H - 148);
  ctx.fillStyle = gold;
  for (const [x, y] of [[CX, 65], [CX, H - 65], [65, H / 2], [W - 65, H / 2]]) diamond(ctx, x, y, 10);

  ctx.textAlign = "center";
  ctx.textBaseline = "alphabetic";
  // Warna aksen beberapa palet terlalu gelap di atas latarnya untuk teks sekecil ini.
  ctx.fillStyle = contrast(accent, paper) >= 3 ? accent : ink;
  ctx.font = `400 30px ${d.fonts.body}`;
  ctx.letterSpacing = "10px";
  ctx.fillText("UNDANGAN PERNIKAHAN", CX, 400);
  ctx.letterSpacing = "0px";

  const nameFont = (size: number) => `400 ${size}px ${d.fonts.name}`;
  // Nama panjang dibagi dua baris, lalu ukurannya disamakan supaya kedua nama seimbang.
  ctx.font = nameFont(NAME_WRAP);
  const groom = lines(ctx, d.groom);
  const bride = lines(ctx, d.bride);
  const size = Math.min(...[...groom, ...bride].map((line) => fit(ctx, line, nameFont, 168, 48)));
  let name = 540 + size * 0.95;
  const writeName = (rows: string[]) => {
    ctx.fillStyle = ink;
    ctx.font = nameFont(size);
    rows.forEach((row, i) => ctx.fillText(row, CX, name + i * size * 1.12));
    name += (rows.length - 1) * size * 1.12;
  };
  writeName(groom);
  name += size * 0.95;
  ctx.fillStyle = gold;
  ctx.font = `400 ${Math.round(size * 0.6)}px ${d.fonts.display}`;
  ctx.fillText("&", CX, name);
  name += size * 0.95;
  writeName(bride);

  const rule = name + 100;
  ctx.strokeStyle = gold;
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(CX - 170, rule);
  ctx.lineTo(CX - 26, rule);
  ctx.moveTo(CX + 26, rule);
  ctx.lineTo(CX + 170, rule);
  ctx.stroke();
  ctx.fillStyle = gold;
  diamond(ctx, CX, rule, 9);

  let y = rule + 88;
  const dateFont = (s: number) => `400 ${s}px ${d.fonts.display}`;
  ctx.fillStyle = ink;
  ctx.font = dateFont(fit(ctx, d.date, dateFont, 50, 34));
  ctx.fillText(d.date, CX, y);
  y += 72;
  ctx.font = `400 36px ${d.fonts.body}`;
  for (const line of lines(ctx, d.venue)) {
    ctx.fillText(line, CX, y);
    y += 50;
  }
  if (d.city) {
    ctx.globalAlpha = 0.75;
    ctx.font = `400 30px ${d.fonts.body}`;
    ctx.fillText(d.city, CX, y);
    ctx.globalAlpha = 1;
  }

  // Alamat link selalu di dasar area aman, warnanya dipilih yang paling terbaca di atas warna aksen.
  const linkFont = (s: number) => `400 ${s}px ${d.fonts.body}`;
  const pill = 1590;
  ctx.fillStyle = ink;
  ctx.globalAlpha = 0.75;
  ctx.font = `400 28px ${d.fonts.body}`;
  ctx.fillText("Buka undangan di", CX, pill - 28);
  ctx.globalAlpha = 1;
  const linkSize = fit(ctx, d.link, linkFont, 38, 24);
  ctx.font = linkFont(linkSize);
  const pillW = Math.min(ctx.measureText(d.link).width + 96, TEXT_W + 60);
  ctx.fillStyle = accent;
  ctx.beginPath();
  ctx.roundRect(CX - pillW / 2, pill, pillW, 84, 42);
  ctx.fill();
  ctx.fillStyle = contrast(paper, accent) >= contrast(ink, accent) ? paper : ink;
  ctx.fillText(d.link, CX, pill + 54);
}

const fileName = (link: string) => `story-${link.split("/").pop()}.png`;

export function StorySheet({ data }: { data: StoryData }) {
  const canvas = useRef<HTMLCanvasElement>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  // Font tema baru diunduh saat diminta, jadi gambar digambar ulang setelah semuanya siap.
  useEffect(() => {
    const c = canvas.current;
    if (!c) return;
    let alive = true;
    draw(c, data);
    void Promise.all([data.fonts.display, data.fonts.body, data.fonts.name].map((f) => document.fonts.load(`400 72px ${f}`)))
      .catch(() => {})
      .then(() => document.fonts.ready)
      .then(() => {
        if (alive) draw(c, data);
      });
    return () => {
      alive = false;
    };
  }, [data]);

  async function download() {
    const c = canvas.current;
    if (!c) return;
    setBusy(true);
    setError("");
    try {
      saveBlob(await toBlob(c, "image/png"), fileName(data.link));
    } catch (e) {
      setError(e instanceof Error ? e.message : "Gagal mengunduh.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="mt-6 grid gap-6 sm:grid-cols-[300px_minmax(0,1fr)] sm:items-start">
      <canvas ref={canvas} width={W} height={H} role="img" aria-label={`Gambar story ${data.groom} dan ${data.bride}`} className="w-full max-w-[300px] rounded-sm ring-1 ring-line" />
      <div>
        <button type="button" onClick={download} disabled={busy} className="inline-flex items-center gap-2 rounded-sm bg-wine px-4 py-2.5 text-[14px] text-white transition-colors duration-150 hover:bg-wine-dark disabled:opacity-60">
          {busy && <Spinner />}
          {busy ? "Menyiapkan..." : "Unduh gambar (PNG)"}
        </button>
        <p className="mt-3 max-w-prose text-[14px] text-ink-soft">Ukuran 1080 x 1920, siap diunggah ke story Instagram atau status WhatsApp. Teks berada di area aman, jadi tidak tertutup nama akun dan kolom balas.</p>
        {error && <p className="mt-3 text-[13px] text-wine">{error}</p>}
      </div>
    </div>
  );
}
