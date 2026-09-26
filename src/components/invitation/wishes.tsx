"use client";

import { useRef, useState, useTransition } from "react";
import { submitWish } from "@/app/[slug]/actions";
import type { Wish } from "@/lib/guestbook";
import { useGuest } from "./shell";
import { sway } from "./sway";

const FIRST = 4;
const STEP = 6;
const tilt = [-1.5, 1, -0.5, 2, -2, 0.5];

type Props = { slug: string; initial: readonly Wish[]; variant?: "notes" | "lined" | "curator" | "tags" };

export function Wishes({ slug, initial, variant = "notes" }: Props) {
  const lined = variant === "lined";
  const curator = variant === "curator";
  const tags = variant === "tags";
  const tagTone = ["bg-inv-wash", "bg-[#E6D8E4]", "bg-[#DDE3D3]"];
  const { guest, setGuest } = useGuest();
  const [mine, setMine] = useState<Wish[]>([]);
  const [shown, setShown] = useState(FIRST);
  const listTop = useRef<HTMLDivElement>(null);
  const [name, setName] = useState<string | null>(null);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [pending, start] = useTransition();

  const nameValue = name ?? guest;
  const known = new Set(initial.map((w) => w.id));
  const unsynced = mine.filter((w) => !known.has(w.id));
  const all = [...unsynced, ...initial];

  const send = (form: FormData) =>
    start(async () => {
      setError("");
      const res = await submitWish(slug, { name: nameValue, message, website: String(form.get("website") ?? "") });
      if (!res.ok) return setError(res.error);
      setMine((m) => [res.data, ...m]);
      setGuest(res.data.name);
      setMessage("");
    });

  return (
    <div className="lg:grid lg:grid-cols-[minmax(0,5fr)_minmax(0,7fr)] lg:gap-16">
      <form action={send} className="self-start">
        <label className="block text-[12px] tracking-[0.14em] text-inv-ink/70">
          NAMAMU
          <input
            required
            maxLength={80}
            value={nameValue}
            onChange={(e) => setName(e.target.value)}
            autoComplete="name"
            className="mt-2 block w-full rounded-sm border border-inv-line bg-transparent px-4 py-3 text-base tracking-normal text-inv-ink outline-none focus:border-inv-accent"
          />
        </label>
        <label className="mt-5 block text-[12px] tracking-[0.14em] text-inv-ink/70">
          PESAN UNTUK MEREKA
          <textarea
            required
            maxLength={500}
            rows={4}
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            className="mt-2 block w-full resize-none rounded-sm border border-inv-line bg-transparent px-4 py-3 text-base tracking-normal text-inv-ink outline-none focus:border-inv-accent"
          />
        </label>
        <input type="text" name="website" tabIndex={-1} autoComplete="off" aria-hidden="true" className="hidden" />
        {error && <p className="mt-3 text-[13px] text-[#9b2c1f]">{error}</p>}
        <button
          type="submit"
          disabled={pending}
          className="mt-6 rounded-sm border border-inv-accent px-6 py-3.5 text-[13px] tracking-[0.14em] text-inv-accent transition-colors duration-150 hover:bg-inv-accent hover:text-inv-paper disabled:opacity-50"
        >
          {pending ? (lined || curator || tags ? "MENGIRIM..." : "MENEMPELKAN...") : tags ? "GANTUNGKAN UCAPAN" : curator ? "SIMPAN CATATAN" : lined ? "KIRIM UCAPAN" : "TEMPELKAN DI SINI"}
        </button>
      </form>

      <div className="mt-12 lg:mt-0">
        <div ref={listTop} className="scroll-mt-24" />
        <ul className={lined ? "border-t border-inv-line" : tags ? "columns-1 gap-5 pt-2 sm:columns-2" : "columns-1 gap-4 sm:columns-2"} aria-live="polite">
          {all.slice(0, shown).map((w, i) =>
            tags ? (
              <li
                key={w.id}
                className={`inv-swing mb-5 break-inside-avoid origin-top ${i < unsynced.length ? "animate-[inv-pin_.45s_cubic-bezier(.22,.61,.36,1)]" : ""}`}
                style={{ "--tilt": `${tilt[i % tilt.length]}deg`, ...sway(i) } as React.CSSProperties}
                tabIndex={0}
              >
                <div
                  className={`relative px-6 pt-10 pb-5 ${tagTone[i % tagTone.length]} [clip-path:polygon(10%_0,90%_0,100%_12%,100%_100%,0_100%,0_12%)]`}
                >
                  <span className="absolute top-3.5 left-1/2 size-3 -translate-x-1/2 rounded-full bg-inv-paper ring-1 ring-inv-line" aria-hidden="true" />
                  <p className="font-display text-[19px] leading-snug">&ldquo;{w.message}&rdquo;</p>
                  <p className="mt-4 border-t border-inv-ink/15 pt-2 text-[10px] font-medium tracking-[0.2em] text-inv-ink/60">
                    DARI {w.name.toUpperCase()}
                  </p>
                </div>
              </li>
            ) : (
            <li
              key={w.id}
              className={`${
                lined
                  ? "border-b border-inv-line py-6"
                  : curator
                    ? "mb-4 break-inside-avoid border border-inv-line bg-inv-wash px-5 pt-5 pb-4"
                    : "mb-4 break-inside-avoid bg-[#fbf7f0] px-5 pt-5 pb-4 shadow-[0_4px_14px_rgba(28,25,22,.14)]"
              } ${i < unsynced.length ? (lined ? "animate-[inv-pop_.3s_ease-out]" : "animate-[inv-pin_.45s_cubic-bezier(.22,.61,.36,1)]") : ""}`}
              style={lined || curator ? undefined : { rotate: `${tilt[i % tilt.length]}deg` }}
            >
              <p className="font-display text-[19px] leading-snug italic">&ldquo;{w.message}&rdquo;</p>
              <p className="mt-3 text-[11px] tracking-[0.18em] text-inv-ink/60">
                {curator ? `DICATAT OLEH ${w.name.toUpperCase()}` : w.name.toUpperCase()}
              </p>
            </li>
            ),
          )}
        </ul>
        {all.length > FIRST && (
          <div className="mt-6 flex flex-wrap items-center gap-x-6 gap-y-3">
            <p className="text-[12px] tracking-[0.12em] text-inv-ink/60">
              {Math.min(shown, all.length)} DARI {all.length} UCAPAN
            </p>
            {shown < all.length && (
              <button
                type="button"
                onClick={() => setShown((s) => s + STEP)}
                className="rounded-sm border border-inv-accent px-4 py-2.5 text-[12px] tracking-[0.12em] text-inv-accent transition-colors duration-150 hover:bg-inv-accent hover:text-inv-paper"
              >
                TAMPILKAN {Math.min(STEP, all.length - shown)} LAGI
              </button>
            )}
            {shown > FIRST && (
              <button
                type="button"
                onClick={() => {
                  setShown(FIRST);
                  listTop.current?.scrollIntoView({ behavior: "smooth", block: "start" });
                }}
                className="text-[12px] tracking-[0.12em] text-inv-accent underline underline-offset-4"
              >
                TAMPILKAN LEBIH SEDIKIT
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
