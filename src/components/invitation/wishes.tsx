"use client";

import { useId, useRef, useState, useTransition } from "react";
import { submitWish } from "@/app/[slug]/actions";
import { GUEST_NAME_MAX, WISH_MAX } from "@/lib/guest-input";
import type { Wish } from "@/lib/guestbook";
import { useArchived, useGuest } from "./shell";
import { sway } from "./sway";

const FIRST = 4;
const STEP = 6;
const tilt = [-1.5, 1, -0.5, 2, -2, 0.5];

type Props = { slug: string; initial: readonly Wish[]; variant?: "notes" | "lined" | "curator" | "tags" | "lontar" | "serat" | "doa" };

export function Wishes({ slug, initial, variant = "notes" }: Props) {
  const lined = variant === "lined";
  const curator = variant === "curator";
  const tags = variant === "tags";
  const lontar = variant === "lontar";
  const serat = variant === "serat";
  const doa = variant === "doa";
  const tagTone = ["bg-inv-wash", "bg-[var(--inv-note-a,#E6D8E4)]", "bg-[var(--inv-note-b,#DDE3D3)]"];
  const { guest, setGuest } = useGuest();
  const archived = useArchived();
  const [mine, setMine] = useState<Wish[]>([]);
  const [shown, setShown] = useState(FIRST);
  const listTop = useRef<HTMLDivElement>(null);
  const [name, setName] = useState<string | null>(null);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [invalid, setInvalid] = useState({ name: "", message: "" });
  const [pending, start] = useTransition();
  const nameRef = useRef<HTMLInputElement>(null);
  const messageRef = useRef<HTMLTextAreaElement>(null);
  const ids = { name: useId(), message: useId(), count: useId() };

  const nameValue = name ?? guest;
  const known = new Set(initial.map((w) => w.id));
  const unsynced = mine.filter((w) => !known.has(w.id));
  const all = [...unsynced, ...initial];
  const full = message.length >= WISH_MAX;

  const send = (form: FormData) => {
    const missing = { name: nameValue.trim() ? "" : "Tulis namamu dulu.", message: message.trim() ? "" : "Tulis ucapanmu dulu." };
    setInvalid(missing);
    if (missing.name || missing.message) {
      (missing.name ? nameRef : messageRef).current?.focus();
      return;
    }
    start(async () => {
      setError("");
      const res = await submitWish(slug, { name: nameValue, message, website: String(form.get("website") ?? "") });
      if (!res.ok) return setError(res.error);
      setMine((m) => [res.data, ...m]);
      setGuest(res.data.name);
      setMessage("");
    });
  };

  return (
    <div className="lg:grid lg:grid-cols-[minmax(0,5fr)_minmax(0,7fr)] lg:gap-16">
      {archived ? (
        <p className="self-start rounded-sm border border-inv-line px-4 py-3.5 text-[14px] leading-relaxed text-inv-ink/75">
          Undangan ini sudah menjadi arsip. Ucapan baru tidak lagi diterima, ucapan yang sudah masuk tetap tersimpan di sini.
        </p>
      ) : (
      <form action={send} noValidate className="self-start">
        <label className="block text-[12px] tracking-[0.14em] text-inv-ink/70">
          NAMAMU
          <input
            ref={nameRef}
            required
            maxLength={GUEST_NAME_MAX}
            value={nameValue}
            onChange={(e) => {
              setName(e.target.value);
              setInvalid((v) => ({ ...v, name: "" }));
            }}
            autoComplete="name"
            aria-invalid={invalid.name ? true : undefined}
            aria-describedby={invalid.name ? ids.name : undefined}
            className="mt-2 block w-full rounded-sm border border-inv-line bg-transparent px-4 py-3 text-base tracking-normal text-inv-ink outline-none focus:border-inv-accent aria-invalid:border-[#9b2c1f] aria-invalid:focus:ring-1 aria-invalid:focus:ring-[#9b2c1f]"
          />
        </label>
        {invalid.name && (
          <p id={ids.name} className="mt-2 animate-[inv-pop_.18s_ease-out] text-[13px] text-[#9b2c1f]">
            {invalid.name}
          </p>
        )}
        <label className="mt-5 block text-[12px] tracking-[0.14em] text-inv-ink/70">
          PESAN UNTUK MEREKA
          <textarea
            ref={messageRef}
            required
            maxLength={WISH_MAX}
            rows={4}
            value={message}
            onChange={(e) => {
              setMessage(e.target.value);
              setInvalid((v) => ({ ...v, message: "" }));
            }}
            aria-invalid={invalid.message ? true : undefined}
            aria-describedby={invalid.message ? `${ids.message} ${ids.count}` : ids.count}
            className="mt-2 block w-full resize-none rounded-sm border border-inv-line bg-transparent px-4 py-3 text-base tracking-normal text-inv-ink outline-none focus:border-inv-accent aria-invalid:border-[#9b2c1f] aria-invalid:focus:ring-1 aria-invalid:focus:ring-[#9b2c1f]"
          />
        </label>
        <div className="mt-2 flex items-start gap-4 text-[13px]">
          {invalid.message && (
            <p id={ids.message} className="animate-[inv-pop_.18s_ease-out] text-[#9b2c1f]">
              {invalid.message}
            </p>
          )}
          <p id={ids.count} className={`ml-auto shrink-0 tabular-nums ${full ? "text-[#9b2c1f]" : "text-inv-ink/60"}`}>
            {message.length}/{WISH_MAX}
            {full && <span className="sr-only"> karakter, batas tercapai</span>}
          </p>
        </div>
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
      )}

      <div className="mt-12 lg:mt-0">
        <div ref={listTop} className="scroll-mt-24" />
        <ul className={serat || doa ? "columns-1 gap-4 sm:columns-2" : lontar ? "inv-lontar-list relative flex flex-col gap-3" : lined ? "border-t border-inv-line" : tags ? "columns-1 gap-5 pt-2 sm:columns-2" : "columns-1 gap-4 sm:columns-2"} aria-live="polite">
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
                doa
                  ? "sk-doa relative mb-4 break-inside-avoid rounded-sm px-5 pt-12 pb-4"
                  : serat
                  ? "inv-serat relative mb-4 break-inside-avoid rounded-sm px-5 pt-7 pb-4"
                  : lontar
                  ? "inv-lontar relative py-4 pr-8 pl-16"
                  : lined
                  ? "border-b border-inv-line py-6"
                  : curator
                    ? "mb-4 break-inside-avoid border border-inv-line bg-inv-wash px-5 pt-5 pb-4"
                    : "mb-4 break-inside-avoid bg-[var(--inv-card,#fbf7f0)] px-5 pt-5 pb-4 shadow-[0_4px_14px_rgba(28,25,22,.14)]"
              } ${i < unsynced.length ? (lined ? "animate-[inv-pop_.3s_ease-out]" : "animate-[inv-pin_.45s_cubic-bezier(.22,.61,.36,1)]") : ""}`}
              style={lined || curator || serat || doa ? undefined : { rotate: `${(lontar ? 0.4 : 1) * tilt[i % tilt.length]}deg` }}
            >
              {lontar && <span className="inv-lontar-hole" aria-hidden="true" />}
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
