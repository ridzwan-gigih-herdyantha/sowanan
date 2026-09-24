"use client";

import { useState, useTransition } from "react";
import { submitWish } from "@/app/[slug]/actions";
import type { Wish } from "@/lib/guestbook";
import { useGuest } from "./shell";

const PAGE = 12;
const tilt = [-1.5, 1, -0.5, 2, -2, 0.5];

export function Wishes({ slug, initial }: { slug: string; initial: readonly Wish[] }) {
  const { guest, setGuest } = useGuest();
  const [mine, setMine] = useState<Wish[]>([]);
  const [shown, setShown] = useState(PAGE);
  const [name, setName] = useState<string | null>(null);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [pending, start] = useTransition();

  const nameValue = name ?? guest;
  const all = [...mine, ...initial];

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
          {pending ? "MENEMPELKAN..." : "TEMPELKAN DI SINI"}
        </button>
      </form>

      <div className="mt-12 lg:mt-0">
        <ul className="columns-1 gap-4 sm:columns-2" aria-live="polite">
          {all.slice(0, shown).map((w, i) => (
            <li
              key={`${w.name}-${i}-${w.message.slice(0, 12)}`}
              className={`mb-4 break-inside-avoid bg-[#fbf7f0] px-5 pt-5 pb-4 shadow-[0_4px_14px_rgba(28,25,22,.14)] ${
                i < mine.length ? "animate-[inv-pin_.45s_cubic-bezier(.22,.61,.36,1)]" : ""
              }`}
              style={{ rotate: `${tilt[i % tilt.length]}deg` }}
            >
              <p className="font-display text-[19px] leading-snug italic">&ldquo;{w.message}&rdquo;</p>
              <p className="mt-3 text-[11px] tracking-[0.18em] text-inv-ink/60">{w.name.toUpperCase()}</p>
            </li>
          ))}
        </ul>
        {all.length > shown && (
          <button
            type="button"
            onClick={() => setShown((s) => s + PAGE)}
            className="mt-4 text-[13px] tracking-[0.12em] text-inv-accent underline underline-offset-4"
          >
            MUAT LAGI
          </button>
        )}
      </div>
    </div>
  );
}
