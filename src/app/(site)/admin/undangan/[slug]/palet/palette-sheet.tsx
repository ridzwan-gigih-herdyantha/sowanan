"use client";

import { useState } from "react";
import { jpegPdf } from "@/lib/export/image-pdf";
import { luminance } from "@/themes/palette";
import { Spinner } from "../spinner";

export type SheetPalette = { id: string; name: string; inUse: boolean; colors: { label: string; hex: string }[] };
type Format = "png" | "jpg" | "pdf";

const W = 1200;
const PAD = 72;
const COLS = 4;
const GAP = 24;
const CHIP = Math.floor((W - PAD * 2 - GAP * (COLS - 1)) / COLS);
const SWATCH_H = 132;
const ROW_H = SWATCH_H + 78;
const INK = "#1F1A17";
const MUTE = "#6E6158";

const fonts = () => {
  const probe = (cls: string) => {
    const el = document.createElement("span");
    el.className = cls;
    document.body.append(el);
    const f = getComputedStyle(el).fontFamily;
    el.remove();
    return f;
  };
  return { serif: probe("font-serif"), sans: probe("font-sans") };
};

function roundRect(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number) {
  ctx.beginPath();
  ctx.roundRect(x, y, w, h, r);
}

const blockHeight = (p: SheetPalette) => 84 + Math.ceil(p.colors.length / COLS) * ROW_H;

// Gambar kartu palet: judul tema, lalu tiap palet dengan kotak warna, nama peran, dan kode hex.
function render(theme: string, list: SheetPalette[], scale = 2) {
  const { serif, sans } = fonts();
  const head = 220;
  const foot = 72;
  const H = head + list.reduce((a, p) => a + blockHeight(p) + 40, 0) + foot;
  const canvas = document.createElement("canvas");
  canvas.width = W * scale;
  canvas.height = H * scale;
  const ctx = canvas.getContext("2d")!;
  ctx.scale(scale, scale);
  ctx.fillStyle = "#FAF7F2";
  ctx.fillRect(0, 0, W, H);
  ctx.textBaseline = "alphabetic";

  ctx.fillStyle = "#7C2B3E";
  ctx.font = `500 15px ${sans}`;
  ctx.letterSpacing = "4px";
  ctx.fillText("SOWANAN  ·  PALET WARNA", PAD, PAD + 8);
  ctx.letterSpacing = "0px";
  ctx.fillStyle = INK;
  ctx.font = `500 64px ${serif}`;
  ctx.fillText(`Tema ${theme}`, PAD, PAD + 82);
  ctx.fillStyle = MUTE;
  ctx.font = `400 18px ${sans}`;
  ctx.fillText(list.length > 1 ? `${list.length} pilihan palet, lengkap dengan kode warnanya` : "Kode warna tiap bagian undangan", PAD, PAD + 118);

  let y = head;
  for (const p of list) {
    ctx.strokeStyle = "#E7DDD4";
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(PAD, y + 0.5);
    ctx.lineTo(W - PAD, y + 0.5);
    ctx.stroke();

    ctx.fillStyle = INK;
    ctx.font = `500 38px ${serif}`;
    ctx.fillText(p.name, PAD, y + 58);
    if (p.inUse) {
      const x = PAD + ctx.measureText(p.name).width + 18;
      ctx.font = `500 13px ${sans}`;
      const label = "DIPAKAI UNDANGAN INI";
      ctx.letterSpacing = "2px";
      const w = ctx.measureText(label).width + 24;
      ctx.fillStyle = "#7C2B3E";
      roundRect(ctx, x, y + 34, w, 30, 15);
      ctx.fill();
      ctx.fillStyle = "#FFFFFF";
      ctx.fillText(label, x + 12, y + 54);
      ctx.letterSpacing = "0px";
    }

    p.colors.forEach((c, i) => {
      const cx = PAD + (i % COLS) * (CHIP + GAP);
      const cy = y + 84 + Math.floor(i / COLS) * ROW_H;
      ctx.fillStyle = c.hex;
      roundRect(ctx, cx, cy, CHIP, SWATCH_H, 6);
      ctx.fill();
      if (luminance(c.hex) > 0.8) {
        ctx.strokeStyle = "rgba(31,26,23,.14)";
        ctx.stroke();
      }
      ctx.fillStyle = INK;
      ctx.font = `500 19px ${sans}`;
      ctx.fillText(c.label, cx, cy + SWATCH_H + 30);
      ctx.fillStyle = MUTE;
      ctx.font = `400 17px ui-monospace, "SFMono-Regular", Consolas, monospace`;
      ctx.fillText(c.hex.toUpperCase(), cx, cy + SWATCH_H + 56);
    });
    y += blockHeight(p) + 40;
  }

  ctx.fillStyle = MUTE;
  ctx.font = `400 15px ${sans}`;
  ctx.fillText("sowanan.com", PAD, H - PAD + 30);
  return canvas;
}

const toBlob = (c: HTMLCanvasElement, type: string, q?: number) => new Promise<Blob>((ok, fail) => c.toBlob((b) => (b ? ok(b) : fail(new Error("Gagal membuat gambar"))), type, q));

function save(blob: Blob, name: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = name;
  a.click();
  window.setTimeout(() => URL.revokeObjectURL(url), 2000);
}

const slugify = (s: string) => s.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");

export function PaletteSheet({ theme, palettes }: { theme: string; palettes: SheetPalette[] }) {
  const [format, setFormat] = useState<Format>("png");
  const [busy, setBusy] = useState<string | null>(null);
  const [error, setError] = useState("");

  async function download(list: SheetPalette[], key: string) {
    setBusy(key);
    setError("");
    try {
      await document.fonts.ready;
      const base = `palet-${slugify(theme)}${list.length === 1 ? `-${slugify(list[0].name)}` : ""}`;
      if (format === "pdf") {
        const pages = await Promise.all(
          list.map(async (p) => {
            const c = render(theme, [p]);
            const bytes = new Uint8Array(await (await toBlob(c, "image/jpeg", 0.92)).arrayBuffer());
            return { bytes, width: c.width, height: c.height };
          }),
        );
        save(jpegPdf(pages, 0.375), `${base}.pdf`);
      } else {
        const c = render(theme, list);
        save(await toBlob(c, format === "png" ? "image/png" : "image/jpeg", 0.92), `${base}.${format}`);
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : "Gagal mengunduh.");
    } finally {
      setBusy(null);
    }
  }

  const btn = "inline-flex items-center gap-2 rounded-sm px-4 py-2.5 text-[14px] transition-colors duration-150 disabled:opacity-60";

  return (
    <div className="mt-6">
      <div className="flex flex-wrap items-center gap-3 rounded-sm border border-line bg-white p-4">
        <span className="text-[14px] text-ink-soft">Format</span>
        <div role="radiogroup" aria-label="Format unduhan" className="flex rounded-sm border border-line p-0.5">
          {(["png", "jpg", "pdf"] as const).map((f) => (
            <button
              key={f}
              type="button"
              role="radio"
              aria-checked={format === f}
              onClick={() => setFormat(f)}
              className={`rounded-sm px-3 py-1.5 text-[13px] uppercase ${format === f ? "bg-ink text-white" : "text-ink-soft hover:bg-blush"}`}
            >
              {f}
            </button>
          ))}
        </div>
        <button type="button" onClick={() => download(palettes, "all")} disabled={busy !== null} className={`${btn} ml-auto bg-wine text-white hover:bg-wine-dark`}>
          {busy === "all" && <Spinner />}
          {busy === "all" ? "Menyiapkan..." : `Unduh semua palet (${format.toUpperCase()})`}
        </button>
        <p className="basis-full text-[12px] text-ink-mute">PNG dan JPG berisi semua palet dalam satu gambar. PDF berisi satu palet per halaman.</p>
        {error && <p className="basis-full text-[13px] text-wine">{error}</p>}
      </div>

      <div className="mt-5 grid gap-4">
        {palettes.map((p) => (
          <section key={p.id} className="rounded-sm border border-line bg-white p-5">
            <div className="flex flex-wrap items-center gap-3">
              <h2 className="font-serif text-2xl">{p.name}</h2>
              {p.inUse && <span className="rounded-full bg-wine px-2.5 py-0.5 text-[11px] tracking-[0.12em] text-white">DIPAKAI UNDANGAN INI</span>}
              <button type="button" onClick={() => download([p], p.id)} disabled={busy !== null} className={`${btn} ml-auto border border-ink hover:bg-ink hover:text-white`}>
                {busy === p.id && <Spinner />}
                {busy === p.id ? "Menyiapkan..." : `Unduh ${format.toUpperCase()}`}
              </button>
            </div>
            <ul className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
              {p.colors.map((c) => (
                <li key={c.label}>
                  <span className="block h-16 rounded-sm ring-1 ring-black/10" style={{ background: c.hex }} />
                  <span className="mt-1.5 block text-[13px]">{c.label}</span>
                  <button
                    type="button"
                    onClick={() => navigator.clipboard?.writeText(c.hex.toUpperCase())}
                    title="Salin kode warna"
                    className="font-mono text-[12px] text-ink-mute hover:text-wine"
                  >
                    {c.hex.toUpperCase()}
                  </button>
                </li>
              ))}
            </ul>
          </section>
        ))}
      </div>
    </div>
  );
}
