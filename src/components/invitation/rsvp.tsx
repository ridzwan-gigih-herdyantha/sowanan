"use client";

import { useId, useRef, useState, useTransition } from "react";
import { submitRsvp } from "@/app/[slug]/actions";
import { GUEST_NAME_MAX } from "@/lib/guest-input";
import { useArchived, useGuest } from "./shell";

type Step = "attend" | "count" | "name" | "done";

const OFFLINE = "Gagal terhubung. Periksa internet lalu coba lagi.";

const choice =
  "rounded-sm border border-inv-line px-3 py-4 text-[13px] tracking-[0.1em] transition-colors duration-150 hover:border-inv-accent hover:bg-inv-accent hover:text-inv-paper";

export function Rsvp({ slug, deadline }: { slug: string; deadline: string }) {
  const { guest, setGuest } = useGuest();
  const [step, setStep] = useState<Step>("attend");
  const [attending, setAttending] = useState(true);
  const [guests, setGuests] = useState(1);
  const [name, setName] = useState<string | null>(null);
  const [error, setError] = useState("");
  const [nameError, setNameError] = useState("");
  const [pending, start] = useTransition();
  const nameRef = useRef<HTMLInputElement>(null);
  const nameErrorId = useId();

  const value = name ?? guest;
  const archived = useArchived();

  const send = () =>
    start(async () => {
      setError("");
      const res = await submitRsvp(slug, { name: value, attending, guests: attending ? guests : 0 }).catch(() => ({ ok: false as const, error: OFFLINE }));
      if (!res.ok) return setError(res.error);
      setGuest(value.trim());
      setStep("done");
    });

  if (archived) return <p className="text-[15px] text-inv-ink/75">Konfirmasi kehadiran sudah ditutup karena undangan ini sudah menjadi arsip.</p>;

  return (
    <div aria-live="polite">
      {step === "attend" && (
        <fieldset key="attend" className="animate-[inv-pop_.3s_ease-out]">
          <legend className="font-display text-[32px] leading-tight text-inv-accent">Kamu bisa datang?</legend>
          <p className="mt-2 text-[13px] text-inv-ink/65">Mohon konfirmasi sebelum {deadline}.</p>
          <div className="mt-6 grid grid-cols-2 gap-3">
            <button type="button" className={choice} onClick={() => (setAttending(true), setStep("count"))}>
              HADIR
            </button>
            <button type="button" className={choice} onClick={() => (setAttending(false), setStep("name"))}>
              BERHALANGAN
            </button>
          </div>
        </fieldset>
      )}

      {step === "count" && (
        <fieldset key="count" className="animate-[inv-pop_.3s_ease-out]">
          <legend className="font-display text-[32px] leading-tight text-inv-accent">Datang dengan siapa?</legend>
          <div className="mt-6 grid grid-cols-2 gap-3">
            <button type="button" className={choice} onClick={() => (setGuests(1), setStep("name"))}>
              SENDIRI
            </button>
            <button type="button" className={choice} onClick={() => (setGuests(2), setStep("name"))}>
              BERDUA
            </button>
          </div>
          <button type="button" onClick={() => setStep("attend")} className="mt-5 text-[13px] text-inv-ink/65 underline underline-offset-4">
            Kembali
          </button>
        </fieldset>
      )}

      {step === "name" && (
        <form
          key="name"
          noValidate
          className="animate-[inv-pop_.3s_ease-out]"
          onSubmit={(e) => {
            e.preventDefault();
            if (!value.trim()) {
              setNameError("Tulis namamu dulu.");
              nameRef.current?.focus();
              return;
            }
            send();
          }}
        >
          <p className="font-display text-[32px] leading-tight text-inv-accent">
            {attending ? "Satu hal lagi." : "Terima kasih sudah memberi kabar."}
          </p>
          <label className="mt-6 block text-[12px] tracking-[0.14em] text-inv-ink/70">
            NAMA LENGKAP
            <input
              ref={nameRef}
              required
              maxLength={GUEST_NAME_MAX}
              value={value}
              onChange={(e) => {
                setName(e.target.value);
                setNameError("");
              }}
              autoComplete="name"
              aria-invalid={nameError ? true : undefined}
              aria-describedby={nameError ? nameErrorId : undefined}
              className="mt-2 block w-full rounded-sm border border-inv-line bg-transparent px-4 py-3 text-base tracking-normal text-inv-ink outline-none focus:border-inv-accent aria-invalid:border-[#9b2c1f] aria-invalid:focus:ring-1 aria-invalid:focus:ring-[#9b2c1f]"
            />
          </label>
          {nameError && (
            <p id={nameErrorId} className="mt-2 animate-[inv-pop_.18s_ease-out] text-[13px] text-[#9b2c1f]">
              {nameError}
            </p>
          )}
          <p className="mt-3 text-[13px] text-inv-ink/65">
            {attending ? `Hadir, ${guests === 2 ? "berdua" : "sendiri"}.` : "Berhalangan hadir."}{" "}
            <button type="button" onClick={() => setStep("attend")} className="underline underline-offset-4">
              Ubah
            </button>
          </p>
          {error && <p className="mt-3 text-[13px] text-[#9b2c1f]">{error}</p>}
          <button
            type="submit"
            disabled={pending}
            className="mt-6 inline-flex items-center gap-3 rounded-sm border border-inv-accent px-6 py-3.5 text-[13px] tracking-[0.14em] text-inv-accent transition-colors duration-150 hover:bg-inv-accent hover:text-inv-paper disabled:opacity-50"
          >
            {pending ? "MENGIRIM..." : "KIRIM KONFIRMASI"}
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true">
              <path d="M4 12h16M14 6l6 6-6 6" />
            </svg>
          </button>
        </form>
      )}

      {step === "done" && (
        <div key="done" className="animate-[inv-pop_.3s_ease-out]">
          <p className="font-display text-[40px] leading-tight text-inv-accent">
            {attending ? "Siap. Tempatmu kami simpan." : "Doamu sudah lebih dari cukup."}
          </p>
          <button type="button" onClick={() => setStep("attend")} className="mt-5 text-[13px] text-inv-ink/65 underline underline-offset-4">
            Ubah jawaban
          </button>
        </div>
      )}
    </div>
  );
}
