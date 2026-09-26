"use client";

import { useActionState, useEffect, useState, type ReactNode } from "react";
import type { Settings } from "@/lib/settings";
import { saveSettings, type FormState } from "./actions";

type Field = { name: keyof Settings; label: string; hint?: string; type?: "number" | "text" | "price" | "revision"; prefix?: string; suffix?: string };

const groups: { title: string; fields: Field[] }[] = [
  {
    title: "Kontak",
    fields: [
      { name: "waNumber", label: "Nomor WhatsApp", hint: "Format 628xxx, tanpa spasi atau tanda +" },
      { name: "instagram", label: "Username Instagram", prefix: "@" },
      { name: "operatingHours", label: "Jam operasional", hint: 'Contoh: "08.00 sampai 20.00"' },
    ],
  },
  {
    title: "Harga paket",
    fields: [
      { name: "priceHemat", label: "Hemat", type: "price", prefix: "Rp" },
      { name: "priceLengkap", label: "Lengkap", type: "price", prefix: "Rp" },
      { name: "priceDesain", label: "Desain Sendiri", type: "price", prefix: "Rp" },
    ],
  },
  {
    title: "Jumlah revisi",
    fields: [
      { name: "revisionsHemat", label: "Hemat", type: "revision", suffix: "kali" },
      { name: "revisionsLengkap", label: "Lengkap", type: "revision", suffix: "kali" },
      { name: "revisionsDesain", label: "Desain Sendiri", type: "revision", suffix: "kali" },
    ],
  },
  {
    title: "Layanan",
    fields: [
      { name: "sla", label: "SLA pengerjaan", hint: 'Contoh: "2 sampai 3 hari kerja"' },
      { name: "activePeriod", label: "Masa aktif link", hint: 'Contoh: "12 bulan"' },
      { name: "maxPhotosHemat", label: "Maksimal foto paket Hemat", type: "number", suffix: "foto" },
      { name: "dpPercent", label: "Persentase DP", type: "number", suffix: "%" },
    ],
  },
];

function Affix({ children }: { children: ReactNode }) {
  return <span className="flex items-center bg-blush px-3 text-[14px] text-ink-mute">{children}</span>;
}

const toRupiah = (v: string) => {
  const digits = v.replace(/\D/g, "").replace(/^0+(?=\d)/, "").slice(0, 12);
  return digits ? Number(digits).toLocaleString("id-ID") : "";
};

function PriceInput({ name, initial, invalid }: { name: string; initial: number; invalid: boolean }) {
  const [value, setValue] = useState(toRupiah(String(initial)));
  return (
    <input
      name={name}
      value={value}
      onChange={(e) => setValue(toRupiah(e.target.value))}
      inputMode="numeric"
      aria-invalid={invalid}
      className="min-w-0 flex-1 px-3 py-3 text-base font-normal tabular-nums outline-none"
    />
  );
}

type RevisionProps = { name: string; label: string; initial: number | null; invalid: boolean; suffix?: string };

function RevisionInput({ name, label, initial, invalid, suffix }: RevisionProps) {
  const [unlimited, setUnlimited] = useState(initial === null);
  return (
    <>
      <span
        className={`mt-2 flex overflow-hidden rounded-sm border bg-white focus-within:border-wine ${invalid ? "border-wine" : "border-line"}`}
      >
        {unlimited ? (
          <span className="flex-1 px-3 py-3 text-base font-normal text-ink-mute">Tanpa batas</span>
        ) : (
          <>
            <input
              name={name}
              defaultValue={initial === null ? "3" : String(initial)}
              aria-label={label}
              inputMode="numeric"
              aria-invalid={invalid}
              className="min-w-0 flex-1 px-3 py-3 text-base font-normal outline-none"
            />
            {suffix && <Affix>{suffix}</Affix>}
          </>
        )}
      </span>
      <label className="mt-2.5 inline-flex cursor-pointer items-center gap-2.5 text-[13px] font-normal text-ink-soft">
        <input
          type="checkbox"
          role="switch"
          name={`${name}Unlimited`}
          checked={unlimited}
          onChange={(e) => setUnlimited(e.target.checked)}
          className="peer sr-only"
        />
        <span
          aria-hidden="true"
          className="relative h-5 w-9 rounded-full bg-line transition-colors duration-150 peer-checked:bg-wine peer-focus-visible:outline-3 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-wine after:absolute after:top-0.5 after:left-0.5 after:size-4 after:rounded-full after:bg-white after:shadow after:transition-transform after:duration-150 peer-checked:after:translate-x-4"
        />
        Tanpa batas
      </label>
    </>
  );
}

export function SettingsForm({ initial }: { initial: Settings }) {
  const [state, action, pending] = useActionState<FormState, FormData>(saveSettings, { ok: false, message: "" });
  const [dismissed, setDismissed] = useState<FormState | null>(null);
  const toast = state.message && dismissed !== state ? state : null;

  useEffect(() => {
    if (!state.message) return;
    const t = setTimeout(() => setDismissed(state), 5000);
    return () => clearTimeout(t);
  }, [state]);

  return (
    <form action={action} noValidate className="space-y-10">
      {groups.map((g) => (
        <fieldset key={g.title}>
          <legend className="mb-4 font-serif text-2xl font-medium">{g.title}</legend>
          <div className="grid gap-5 sm:grid-cols-2">
            {g.fields.map((f) => {
              const err = state.errors?.[f.name];
              const Wrap = f.type === "revision" ? "div" : "label";
              return (
                <Wrap key={f.name} className="block text-[14px] font-medium">
                  {f.label}
                  {f.type === "revision" ? (
                    <RevisionInput
                      name={f.name}
                      label={`Revisi ${f.label}`}
                      initial={initial[f.name] as number | null}
                      invalid={Boolean(err)}
                      suffix={f.suffix}
                    />
                  ) : (
                    <span className={`mt-2 flex overflow-hidden rounded-sm border bg-white focus-within:border-wine ${err ? "border-wine" : "border-line"}`}>
                      {f.prefix && <Affix>{f.prefix}</Affix>}
                      {f.type === "price" ? (
                        <PriceInput name={f.name} initial={initial[f.name] as number} invalid={Boolean(err)} />
                      ) : (
                        <input
                          name={f.name}
                          defaultValue={String(initial[f.name])}
                          inputMode={f.type === "number" ? "numeric" : undefined}
                          aria-invalid={Boolean(err)}
                          className="min-w-0 flex-1 px-3 py-3 text-base font-normal outline-none"
                        />
                      )}
                      {f.suffix && <Affix>{f.suffix}</Affix>}
                    </span>
                  )}
                  {err ? (
                    <span className="mt-1.5 block text-[13px] font-normal text-wine">{err}</span>
                  ) : (
                    f.hint && <span className="mt-1.5 block text-[13px] font-normal text-ink-mute">{f.hint}</span>
                  )}
                </Wrap>
              );
            })}
          </div>
        </fieldset>
      ))}

      <div className="sticky bottom-0 -mx-5 border-t border-line bg-ivory/95 px-5 py-4 backdrop-blur">
        <button
          type="submit"
          disabled={pending}
          className="w-full rounded-sm bg-wine px-6 py-3.5 text-[15px] text-white transition-colors duration-150 hover:bg-wine-dark disabled:opacity-60 sm:w-auto"
        >
          {pending ? "Menyimpan..." : "Simpan pengaturan"}
        </button>
      </div>

      {toast && (
        <div
          role="status"
          aria-live="polite"
          className={`fixed inset-x-4 top-4 z-50 mx-auto max-w-md rounded-sm px-5 py-4 text-[15px] shadow-[0_10px_30px_rgba(0,0,0,.15)] animate-[inv-pop_.25s_ease-out] ${
            toast.ok ? "bg-[#1f6b45] text-white" : "bg-wine text-white"
          }`}
        >
          {toast.message}
        </div>
      )}
    </form>
  );
}
