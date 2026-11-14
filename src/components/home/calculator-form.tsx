"use client";

import Image from "next/image";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { useState } from "react";
import { cx } from "@/components/ui";

export type CalcPackage = { id: string; name: string; price: number; sla: string; badge: string };
export type CalcTheme = { id: string; name: string; style: string; image: string; packages: string[] };
export type CalcAddon = { id: string; name: string; price: number; perUnit: boolean; packages: string[] };

const MAX_UNITS = 20;
const rupiah = (n: number) => "Rp" + n.toLocaleString("id-ID");

function Step({ no, title, hint, children }: { no: number; title: string; hint?: string; children: React.ReactNode }) {
  return (
    <div className="min-w-0 border-t border-line pt-7 first:border-t-0 first:pt-0">
    <fieldset className="min-w-0">
      <legend className="w-full">
        <span className="flex items-baseline gap-3">
          <span className="font-serif text-[18px] text-wine">{no}</span>
          <span className="font-serif text-[24px] leading-tight font-medium text-ink">{title}</span>
        </span>
      </legend>
      {hint && <p className="mt-1.5 text-[14.5px] text-ink-mute">{hint}</p>}
      <div className="mt-4">{children}</div>
    </fieldset>
    </div>
  );
}

// Angka yang berganti dengan geser-pudar singkat, supaya perubahan total terlihat tanpa harus dibandingkan.
function Amount({ value, className }: { value: number; className?: string }) {
  const still = useReducedMotion();
  return (
    <span className={cx("relative inline-grid overflow-hidden", className)} aria-live="polite">
      <AnimatePresence initial={false} mode="popLayout">
        <motion.span
          key={value}
          initial={still ? false : { y: "60%", opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={still ? { opacity: 0, transition: { duration: 0 } } : { y: "-60%", opacity: 0 }}
          transition={{ duration: 0.16, ease: "easeOut" }}
          className="[grid-area:1/1]"
        >
          {rupiah(value)}
        </motion.span>
      </AnimatePresence>
    </span>
  );
}

export function CalculatorForm({ packages, themes, addons, dp, wa }: { packages: CalcPackage[]; themes: CalcTheme[]; addons: CalcAddon[]; dp: number; wa: string }) {
  const [pkgId, setPkgId] = useState(packages.find((p) => p.badge)?.id ?? packages[0].id);
  const [themeId, setThemeId] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const [units, setUnits] = useState<Record<string, number>>({});
  const still = useReducedMotion();

  const filteredThemes = themes.filter((t) => t.name.toLowerCase().includes(searchTerm.toLowerCase()));

  const pkg = packages.find((p) => p.id === pkgId) ?? packages[0];
  const theme = themes.find((t) => t.id === themeId) ?? null;
  const fitting = addons.filter((a) => a.packages.includes(pkg.id));
  const chosen = fitting.filter((a) => (units[a.id] ?? 0) > 0).map((a) => ({ ...a, n: units[a.id], total: a.price * units[a.id] }));
  const total = pkg.price + chosen.reduce((sum, a) => sum + a.total, 0);
  const down = Math.round((total * dp) / 100 / 1000) * 1000;

  // Ganti paket membuang add-on yang tidak berlaku lagi, dan tema yang tidak tersedia di paket itu.
  const pickPackage = (id: string) => {
    setPkgId(id);
    if (theme && !theme.packages.includes(id)) setThemeId(null);
  };
  // Tema yang hanya ada di paket lebih tinggi menaikkan paketnya ke paket termurah yang menyediakannya.
  const pickTheme = (t: CalcTheme) => {
    if (themeId === t.id) return setThemeId(null);
    setThemeId(t.id);
    if (!t.packages.includes(pkg.id)) setPkgId(t.packages[0]);
  };
  const setUnit = (id: string, n: number) => setUnits((u) => ({ ...u, [id]: Math.max(0, Math.min(MAX_UNITS, n)) }));

  const lines = [
      "Halo Sowanan, saya mau pesan undangan dengan rincian berikut:",
      `Tema: ${theme ? theme.name : "belum memilih"}`,
      `Paket: ${pkg.name} (${rupiah(pkg.price)})`,
      ...(chosen.length ? ["Tambahan:", ...chosen.map((a) => `- ${a.name}${a.perUnit ? ` x${a.n}` : ""} (${rupiah(a.total)})`)] : []),
      `Perkiraan total: ${rupiah(total)}`,
      "Acaranya tanggal ",
  ];
  const waHref = `https://wa.me/${wa}?text=${encodeURIComponent(lines.join("\n"))}`;

  const focusRing = "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-wine";

  return (
    <div className="grid gap-10 lg:grid-cols-[minmax(0,1fr)_360px] lg:gap-14">
      <div className="flex min-w-0 flex-col gap-8">
        {themes.length > 0 && (
          <Step no={1} title="Tema" hint="Opsional. Harga tidak berubah, tapi beberapa tema hanya ada di paket tertentu.">
            <div className="relative">
              <input
                type="text"
                placeholder="Cari tema..."
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value);
                  setIsOpen(true);
                }}
                onFocus={() => setIsOpen(true)}
                className={cx(
                  "w-full rounded-[6px] border border-line bg-ivory px-4 py-3 text-[15px] text-ink",
                  focusRing
                )}
              />
              {isOpen && (
                <div className="absolute z-10 mt-1 max-h-80 w-full overflow-auto rounded-[6px] border border-line bg-ivory shadow-lg">
                  {filteredThemes.length > 0 ? (
                    filteredThemes.map((t) => (
                      <button
                        key={t.id}
                        type="button"
                        onClick={() => {
                          pickTheme(t);
                          setSearchTerm(t.name);
                          setIsOpen(false);
                        }}
                        className="group flex w-full items-center gap-3 px-3 py-2 text-left transition-colors hover:bg-wine hover:text-white"
                      >
                        {t.image && (
                          <Image
                            src={t.image}
                            alt=""
                            width={36}
                            height={64}
                            className="h-16 w-9 shrink-0 rounded object-cover object-top "
                          />
                        )}
                        <span className="text-[14px] leading-snug text-">
                          {t.name} <span>({t.style})</span>
                        </span>
                      </button>
                    ))
                  ) : (
                    <div className="px-4 py-2 text-[14px] text-ink-mute">Tema tidak ditemukan</div>
                  )}
                </div>
              )}
            </div>
          </Step>
        )}

        <Step no={themes.length ? 2 : 1} title="Paket">
          <div role="radiogroup" aria-label="Paket" className="grid gap-3 sm:grid-cols-3">
            {packages.map((p) => {
              const on = p.id === pkg.id;
              return (
                <button
                  key={p.id}
                  type="button"
                  role="radio"
                  aria-checked={on}
                  onClick={() => pickPackage(p.id)}
                  className={cx(
                    "rounded-[10px] border px-4 py-3.5 text-left transition-colors duration-150",
                    focusRing,
                    on ? "border-wine bg-wine text-white" : "border-line bg-ivory text-ink hover:border-wine-soft",
                  )}
                >
                  <span className="flex items-center justify-between gap-2">
                    <span className="text-[13px] font-medium tracking-[.14em] uppercase">{p.name}</span>
                    {p.badge && <span className={cx("text-[11px]", on ? "text-white/80" : "text-wine")}>{p.badge}</span>}
                  </span>
                  <span className="mt-1 block font-serif text-[26px] leading-tight">{rupiah(p.price)}</span>
                  <span className={cx("block text-[13px]", on ? "text-white/80" : "text-ink-mute")}>Jadi dalam {p.sla}</span>
                </button>
              );
            })}
          </div>
        </Step>

        <Step no={themes.length ? 3 : 2} title="Tambahan" hint={fitting.length ? `Hanya tambahan yang berlaku untuk paket ${pkg.name} yang ditampilkan.` : undefined}>
          {fitting.length === 0 ? (
            <p className="text-[15px] text-ink-body">Paket {pkg.name} sudah mencakup semua tambahan yang tersedia.</p>
          ) : (
            <ul className="border-b border-line">
              {fitting.map((a) => {
                const n = units[a.id] ?? 0;
                const label = `add-${a.id}`;
                return (
                  <li key={a.id} className="flex flex-wrap items-center gap-x-4 gap-y-2 border-t border-line py-3.5">
                    <label htmlFor={label} className="flex min-w-0 flex-1 cursor-pointer items-start gap-3">
                      <input
                        id={label}
                        type="checkbox"
                        checked={n > 0}
                        onChange={(e) => setUnit(a.id, e.target.checked ? 1 : 0)}
                        className="mt-[3px] size-[18px] shrink-0 cursor-pointer accent-wine"
                      />
                      <span className="text-[15.5px] leading-snug text-ink">{a.name}</span>
                    </label>
                    <span className="ml-auto flex items-center gap-4">
                      {a.perUnit && n > 0 && (
                        <span className="flex items-center rounded-full border border-line bg-ivory">
                          <button type="button" aria-label={`Kurangi ${a.name}`} onClick={() => setUnit(a.id, n - 1)} className={cx("size-8 rounded-full text-[18px] text-ink hover:text-wine", focusRing)}>
                            −
                          </button>
                          <span className="w-6 text-center text-[14px] tabular-nums" aria-label={`Jumlah ${n}`}>
                            {n}
                          </span>
                          <button
                            type="button"
                            aria-label={`Tambah ${a.name}`}
                            disabled={n >= MAX_UNITS}
                            onClick={() => setUnit(a.id, n + 1)}
                            className={cx("size-8 rounded-full text-[18px] text-ink hover:text-wine disabled:opacity-40", focusRing)}
                          >
                            +
                          </button>
                        </span>
                      )}
                      <span className="w-[86px] text-right font-serif text-[19px] text-ink">{rupiah(a.price)}</span>
                    </span>
                  </li>
                );
              })}
            </ul>
          )}
        </Step>
      </div>

      {/* Di HP nota ada di bawah daftar tambahan, jadi totalnya menempel di bawah layar selama memilih dan berhenti tepat di atas nota. */}
      <a
        href="#ringkasan"
        className={cx(
          "sticky bottom-3 z-30 -my-4 flex items-center justify-between gap-4 rounded-full bg-ink px-5 py-3 text-paper no-underline shadow-[0_10px_30px_rgba(31,26,23,.35)] lg:hidden",
          focusRing,
        )}
      >
        <span className="text-[13px] tracking-[.06em] text-mist">Total perkiraan</span>
        <Amount value={total} className="font-serif text-[22px] leading-none tabular-nums" />
      </a>

      <aside id="ringkasan" aria-label="Ringkasan biaya" className="scroll-mt-24 lg:sticky lg:top-24 lg:self-start">
        <div className="rounded-[4px] border border-line bg-ivory px-6 pt-6 pb-7 shadow-[0_18px_40px_-28px_rgba(31,26,23,.45)]">
          <h3 className="font-serif text-[24px] font-medium text-ink">Ringkasan</h3>
          <dl className="mt-4 text-[15px]">
            <div className="flex justify-between gap-4 border-t border-dashed border-line py-2.5">
              <dt className="text-ink-mute">Tema</dt>
              <dd className="text-right text-ink">{theme ? theme.name : "Belum dipilih"}</dd>
            </div>
            <div className="flex justify-between gap-4 border-t border-dashed border-line py-2.5">
              <dt className="text-ink">Paket {pkg.name}</dt>
              <dd className="text-right text-ink tabular-nums">{rupiah(pkg.price)}</dd>
            </div>
            <AnimatePresence initial={false}>
              {chosen.map((a) => (
                <motion.div
                  key={a.id}
                  initial={still ? false : { opacity: 0, x: -6 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={still ? { opacity: 0, transition: { duration: 0 } } : { opacity: 0 }}
                  transition={{ duration: 0.16, ease: "easeOut" }}
                  className="flex justify-between gap-4 border-t border-dashed border-line py-2.5"
                >
                  <dt className="min-w-0 text-ink-body">
                    {a.name}
                    {a.perUnit && <span className="text-ink-mute"> x{a.n}</span>}
                  </dt>
                  <dd className="text-right text-ink tabular-nums">{rupiah(a.total)}</dd>
                </motion.div>
              ))}
            </AnimatePresence>
          </dl>
          <div className="mt-2 flex items-end justify-between gap-4 border-t border-ink pt-4">
            <span className="text-[14px] tracking-[.08em] text-ink-mute uppercase">Total</span>
            <Amount value={total} className="font-serif text-[40px] leading-none text-ink tabular-nums" />
          </div>
          {dp > 0 && dp < 100 && (
            <p className="mt-2 flex justify-between gap-4 text-[14px] text-ink-body">
              <span>Uang muka {dp}%</span>
              <span className="tabular-nums">{rupiah(down)}</span>
            </p>
          )}
          <a
            href={waHref}
            target="_blank"
            rel="noopener"
            className={cx("mt-6 block rounded-sm bg-wine px-5 py-3.5 text-center text-[15px] tracking-[.04em] text-white no-underline transition-colors duration-150 hover:bg-wine-dark", focusRing)}
          >
            Kirim pilihan ini lewat WhatsApp
          </a>
          <p className="mt-3 text-[13px] leading-normal text-ink-mute">Perkiraan harga. Total akhir kami konfirmasi lewat chat sebelum pembayaran.</p>
        </div>
      </aside>

    </div>
  );
}
