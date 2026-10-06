"use client";

import { useCallback, useEffect, useMemo, useRef, useState, useTransition, type KeyboardEvent } from "react";
import type { Settings } from "@/lib/settings/schema";
import { reloadSettings, saveSettings } from "../actions";
import { FormCtx, setIn } from "./form-context";
import { BerandaPanel, KetentuanPanel, TanyaPanel, TemaPanel } from "./panels-content";
import { AddonPanel, KontakPanel, PaketPanel, PembayaranPanel } from "./panels-data";
import { button, cx } from "./ui";

const TABS = [
  { key: "beranda", label: "Beranda", group: "Konten", paths: ["hero", "sections", "features", "steps", "closing", "footer"], Panel: BerandaPanel },
  { key: "tema", label: "Tema", group: "Konten", paths: ["themes"], Panel: TemaPanel },
  { key: "tanya", label: "Tanya Jawab", group: "Konten", paths: ["faq"], Panel: TanyaPanel },
  { key: "ketentuan", label: "Ketentuan", group: "Konten", paths: ["terms"], Panel: KetentuanPanel },
  { key: "paket", label: "Paket", group: "Data", paths: ["packages", "matrix"], Panel: PaketPanel },
  { key: "addon", label: "Add-on", group: "Data", paths: ["addons"], Panel: AddonPanel },
  { key: "kontak", label: "Kontak", group: "Data", paths: ["contact", "wa"], Panel: KontakPanel },
  { key: "pembayaran", label: "Pembayaran", group: "Data", paths: ["payment"], Panel: PembayaranPanel },
] as const;

type TabKey = (typeof TABS)[number]["key"];
const tabOf = (path: string) => TABS.find((t) => (t.paths as readonly string[]).includes(path.split(".")[0]))?.key;

// Angka kosong disimpan NaN di form. Dikirim sebagai teks kosong supaya server menolaknya dengan pesan yang jelas.
const serialize = (s: Settings) => JSON.stringify(s, (_, v) => (typeof v === "number" && Number.isNaN(v) ? "" : v));

export function SettingsForm({ initial }: { initial: Settings }) {
  const [saved, setSaved] = useState(initial);
  const [s, setS] = useState(initial);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [tab, setTab] = useState<TabKey>("beranda");
  const [toast, setToast] = useState<{ ok: boolean; message: string } | null>(null);
  const [savedAt, setSavedAt] = useState<number | null>(null);
  const [pending, start] = useTransition();
  const tabRefs = useRef<Record<string, HTMLButtonElement | null>>({});
  const dirty = s !== saved;

  const set = useCallback((path: string, value: unknown) => setS((d) => setIn(d, path, value)), []);
  const update = useCallback((fn: (d: Settings) => Settings) => setS(fn), []);
  const ctx = useMemo(() => ({ s, set, update, errors }), [s, set, update, errors]);

  useEffect(() => {
    const fromHash = () => {
      const key = location.hash.slice(1);
      if (TABS.some((t) => t.key === key)) setTab(key as TabKey);
    };
    fromHash();
    window.addEventListener("hashchange", fromHash);
    return () => window.removeEventListener("hashchange", fromHash);
  }, []);

  useEffect(() => {
    if (!dirty) return;
    const warn = (e: BeforeUnloadEvent) => e.preventDefault();
    window.addEventListener("beforeunload", warn);
    return () => window.removeEventListener("beforeunload", warn);
  }, [dirty]);

  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(null), 5000);
    return () => clearTimeout(t);
  }, [toast]);

  const open = (key: TabKey, focus = false) => {
    setTab(key);
    history.replaceState(null, "", `#${key}`);
    if (focus) tabRefs.current[key]?.focus();
  };

  // Panah kiri kanan untuk strip tab di HP, panah atas bawah untuk sidebar di layar lebar.
  const onTabKey = (e: KeyboardEvent<HTMLButtonElement>) => {
    const dir = e.key === "ArrowRight" || e.key === "ArrowDown" ? 1 : e.key === "ArrowLeft" || e.key === "ArrowUp" ? -1 : 0;
    if (!dir) return;
    e.preventDefault();
    const i = TABS.findIndex((t) => t.key === tab);
    open(TABS[(i + dir + TABS.length) % TABS.length].key, true);
  };

  const reload = () => {
    if (dirty && !window.confirm("Perubahan yang belum disimpan akan hilang. Muat ulang dari database?")) return;
    start(async () => {
      const res = await reloadSettings().catch(() => ({ ok: false as const, message: "Gagal memuat. Cek koneksi lalu coba lagi." }));
      if (!res.ok) {
        setToast({ ok: false, message: res.message });
        return;
      }
      setSaved(res.settings);
      setS(res.settings);
      setErrors({});
      setToast({ ok: true, message: "Isi terbaru dari database dimuat. Homepage dan ketentuan memakai isi ini mulai kunjungan berikutnya." });
    });
  };

  const save = () =>
    start(async () => {
      const res = await saveSettings(serialize(s));
      if (res.ok) {
        setSaved(s);
        setErrors({});
        setSavedAt(Date.now());
        setToast({ ok: true, message: res.message });
        return;
      }
      setErrors(res.errors ?? {});
      setToast({ ok: false, message: res.message });
      const first = Object.keys(res.errors ?? {}).map(tabOf).find(Boolean);
      if (first) open(first);
    });

  const errorTabs = new Set(Object.keys(errors).map(tabOf));

  return (
    <FormCtx.Provider value={ctx}>
      <div className="lg:grid lg:grid-cols-[184px_minmax(0,1fr)] lg:items-start lg:gap-8">
        <div
          role="tablist"
          aria-label="Kelompok pengaturan"
          className="-mx-4 mb-[26px] flex items-center gap-1 overflow-x-auto border-b border-[#E8E0D6] px-4 [scrollbar-width:none] sm:mx-0 sm:flex-wrap sm:px-0 lg:sticky lg:top-[86px] lg:mx-0 lg:mb-0 lg:max-h-[calc(100dvh-180px)] lg:flex-col lg:flex-nowrap lg:items-stretch lg:gap-0.5 lg:overflow-y-auto lg:border-b-0 lg:border-r lg:pr-5"
        >
          {TABS.map((t, i) => {
            const head = i === 0 || TABS[i - 1].group !== t.group;
            const sep = head && i > 0;
            return (
              <span key={t.key} className="contents">
                {sep && <span aria-hidden="true" className="mx-3 h-[18px] w-px flex-none bg-[#E8E0D6] lg:hidden" />}
                {head && (
                  <span aria-hidden="true" className={cx("flex-none pr-2 pl-0.5 text-[10px] tracking-[.18em] text-ink-mute uppercase lg:px-3 lg:pb-2", i > 0 && "lg:mt-6")}>
                    {t.group}
                  </span>
                )}
                <button
                  ref={(el) => {
                    tabRefs.current[t.key] = el;
                  }}
                  type="button"
                  role="tab"
                  id={`tab-${t.key}`}
                  aria-selected={tab === t.key}
                  aria-controls={`panel-${t.key}`}
                  tabIndex={tab === t.key ? 0 : -1}
                  onClick={() => open(t.key)}
                  onKeyDown={onTabKey}
                  className={cx(
                    "-mb-px flex flex-none items-center border-b-2 px-3.5 pt-3 pb-[13px] text-[13.5px] whitespace-nowrap transition-colors duration-150 focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-wine",
                    "lg:mb-0 lg:rounded-sm lg:border-b-0 lg:px-3 lg:py-2.5 lg:text-left lg:text-[14px]",
                    tab === t.key
                      ? "border-wine font-medium text-wine lg:bg-blush"
                      : "border-transparent text-ink-mute hover:text-[#2A2320] lg:hover:bg-[#F5EFE8]",
                  )}
                >
                  {t.label}
                  {errorTabs.has(t.key) && <span className="ml-1.5 inline-block size-[7px] rounded-full bg-wine align-middle lg:ml-auto" aria-label="ada isian bermasalah" />}
                </button>
              </span>
            );
          })}
        </div>

        <div className="min-w-0">
          {TABS.map(({ key, Panel }) => (
            <div key={key} id={`panel-${key}`} role="tabpanel" aria-labelledby={`tab-${key}`} hidden={tab !== key}>
              <Panel />
            </div>
          ))}
        </div>
      </div>

      <div className="fixed inset-x-0 bottom-0 z-50 border-t border-[#E8E0D6] bg-white shadow-[0_-2px_14px_rgba(42,35,32,.06)]">
        <div className="mx-auto flex max-w-[1180px] flex-wrap items-center gap-x-4 gap-y-2.5 px-4 py-3.5 sm:px-7">
          <span className="text-[13px] text-ink-mute" aria-live="polite">
            {pending ? "Memproses..." : dirty ? <><b className="font-medium text-[#5C5048]">Ada perubahan</b> yang belum disimpan</> : savedAt ? "Tersimpan baru saja" : "Semua perubahan tersimpan"}
          </span>
          <div className="ml-auto flex flex-wrap gap-2.5">
            <button
              type="button"
              disabled={pending}
              onClick={reload}
              title="Ambil isi terbaru dari database dan perbarui homepage serta ketentuan. Pakai setelah mengubah database lewat SQL editor."
              className={button.quiet}
            >
              Muat ulang dari database
            </button>
            <button
              type="button"
              disabled={!dirty || pending}
              onClick={() => {
                setS(saved);
                setErrors({});
              }}
              className={button.quiet}
            >
              Batalkan perubahan
            </button>
            <button type="button" disabled={!dirty || pending} onClick={save} className={button.primary}>
              Simpan pengaturan
            </button>
          </div>
        </div>
      </div>

      {toast && (
        <div
          role="status"
          className={cx(
            "fixed inset-x-4 top-4 z-[60] mx-auto max-w-md rounded-lg px-5 py-4 text-[14px] text-white shadow-[0_10px_30px_rgba(0,0,0,.15)] motion-safe:animate-[inv-pop_.2s_ease-out]",
            toast.ok ? "bg-[#2F6B4F]" : "bg-wine",
          )}
        >
          {toast.message}
        </div>
      )}
    </FormCtx.Provider>
  );
}
