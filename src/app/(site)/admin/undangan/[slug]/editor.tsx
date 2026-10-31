"use client";

import { useCallback, useEffect, useMemo, useRef, useState, type ReactNode, type RefObject } from "react";
import type { InvitationData } from "@/lib/invitation/schema";
import { packageIssues } from "@/lib/invitation/package-check";
import { checkInvitation, fieldPatterns, forTheme, GROUPS, patternOf, setIn, type Group, type Issue } from "@/lib/invitation/spec";
import type { Settings } from "@/lib/settings/schema";
import { packageRules, type Purchased } from "@/lib/settings/text";
import type { BridgeMessage } from "@/app/admin/pratinjau/[slug]/bridge";
import { publishDraft, saveDraft, setPublished, unlockArchive } from "../actions";
import { InvitationHeader } from "../tabs";
import { AddonPanel } from "./addon-panel";
import { FieldInput, FormProvider } from "./fields";
import { Spinner } from "./spinner";
import { StylePanel } from "./style-panel";

type Props = {
  slug: string;
  theme: string;
  label: string;
  published: boolean;
  paid: boolean;
  pkg: string | null;
  draft: InvitationData;
  live: InvitationData;
  packageData: Pick<Settings, "matrix" | "addons" | "packages">;
  bought: Purchased;
  dp: number;
  // Status arsip. Kosong berarti tanggal acara belum diisi atau undangan contoh.
  archive: { archived: boolean; locked: boolean; archiveAt: string; unlockedUntil: string | null } | null;
};
type Toast = { tone: "ok" | "error"; text: string } | null;

// Ukuran layar HP yang benar-benar terlihat: lebar HP umum, tinggi layar dikurangi status bar dan bar
// alamat peramban. Pratinjau digambar di ukuran ini lalu diperkecil supaya muat.
const PHONE = { w: 390, h: 760 };

// Panel di luar isi tema. Kunci issue "gaya" berasal dari pemeriksaan paket.
const SETUP = [
  { key: "package", title: "Package & add-ons" },
  { key: "style", title: "Style" },
];
const MORE = new Set(["extras", "share"]);
const TITLES: Record<string, string> = { extras: "Custom sections", share: "Footer & share" };
const panelOfIssue = (group: string) => (group === "gaya" ? "style" : group);

const groupOf = (() => {
  let map: Map<string, string> | null = null;
  return (path: string) => {
    if (!map) {
      map = new Map();
      for (const g of GROUPS) {
        const walk = (fields: typeof g.fields, prefix: string) => {
          for (const f of fields) {
            if (f.kind === "list") {
              map!.set(prefix + f.path, g.key);
              walk(f.fields, `${prefix}${f.path}.*.`);
            } else map!.set(prefix + f.path, g.key);
          }
        };
        walk(g.fields, "");
      }
    }
    const p = patternOf(path);
    return map.get(p) ?? [...map.entries()].find(([k]) => p.startsWith(`${k}.`))?.[1];
  };
})();

function Switch({ on, onChange, label, disabled }: { on: boolean; onChange: (v: boolean) => void; label: string; disabled?: boolean }) {
  return (
    <label className={`inline-flex shrink-0 items-center gap-2 text-[13px] text-ink-soft ${disabled ? "cursor-not-allowed opacity-50" : "cursor-pointer"}`}>
      <span>{on ? "Shown" : "Hidden"}</span>
      <input type="checkbox" checked={on} disabled={disabled} onChange={(e) => onChange(e.target.checked)} className="peer sr-only" aria-label={label} />
      <span className="relative h-5 w-9 rounded-full bg-line transition-colors duration-150 peer-checked:bg-wine peer-focus-visible:outline-3 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-wine after:absolute after:top-0.5 after:left-0.5 after:size-4 after:rounded-full after:bg-white after:shadow after:transition-transform after:duration-150 peer-checked:after:translate-x-4" />
    </label>
  );
}

// Kepala panel: judul, keterangan singkat, dan aksi di kanan (misalnya saklar tampil).
function PanelHead({ title, note, action }: { title: string; note?: ReactNode; action?: ReactNode }) {
  return (
    <div className="flex flex-wrap items-start justify-between gap-x-4 gap-y-2 border-b border-line pb-4">
      <div className="min-w-0">
        <h2 className="font-serif text-[26px] leading-tight">{title}</h2>
        {note && <p className="mt-1 text-[13px] text-ink-mute">{note}</p>}
      </div>
      {action}
    </div>
  );
}

// Pratinjau seukuran layar HP, diskalakan mengikuti tinggi tempatnya (dan lebar, di layar kecil). Isinya tetap
// tampilan HP karena lebar halamannya selalu 390, hanya gambarnya yang membesar atau mengecil.
function PhoneFrame({ frame, src, fitWidth, overlay }: { frame: RefObject<HTMLIFrameElement | null>; src: string; fitWidth: boolean; overlay: ReactNode }) {
  const box = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(1);
  useEffect(() => {
    const el = box.current;
    if (!el) return;
    const fit = () => setScale(Math.min(1.4, el.clientHeight / PHONE.h, fitWidth ? el.clientWidth / PHONE.w : 1.4));
    fit();
    const ro = new ResizeObserver(fit);
    ro.observe(el);
    return () => ro.disconnect();
  }, [fitWidth]);
  return (
    <div ref={box} className="flex min-h-0 flex-1 justify-center">
      <div className="relative shrink-0 overflow-hidden rounded-sm bg-white ring-1 ring-line shadow-[0_12px_32px_rgba(28,25,23,.12)]" style={{ width: PHONE.w * scale, height: PHONE.h * scale }}>
        <iframe ref={frame} src={src} title="Preview" className="origin-top-left border-0" style={{ width: PHONE.w, height: PHONE.h, transform: `scale(${scale})` }} />
        {overlay}
      </div>
    </div>
  );
}

export function Editor({ slug, theme, label, published: initialPublished, paid, pkg, draft, live, packageData, bought: initialBought, dp, archive }: Props) {
  // Bagian yang tidak termasuk paket langsung dimatikan, lalu draf tersimpan otomatis.
  const [data, setData] = useState(() =>
    packageRules(packageData, pkg, initialBought).locked.cerita && draft.sections.story.enabled ? setIn(draft, "sections.story.enabled", false) : draft,
  );
  const [saved, setSaved] = useState(() => JSON.stringify(live));
  const [published, setPub] = useState(initialPublished);
  const [draftState, setDraftState] = useState<"saved" | "saving" | "error">("saved");
  const [showIssues, setShowIssues] = useState(false);
  const [active, setActive] = useState("hero");
  // Kelompok navigasi yang ditutup di sidebar. Panel yang sedang dibuka tetap terlihat walau kelompoknya ditutup.
  const [shut, setShut] = useState<Set<string>>(() => new Set());
  const [focus, setFocus] = useState("");
  const [mobilePreview, setMobilePreview] = useState(false);
  const [toast, setToast] = useState<Toast>(null);
  const [busy, setBusy] = useState(false);
  const frame = useRef<HTMLIFrameElement>(null);
  const lastSent = useRef(JSON.stringify(draft));
  const latest = useRef(data);
  const top = useRef<HTMLDivElement>(null);
  // Palet yang sedang diterapkan ke pratinjau. Hilang setelah pratinjau selesai dirender ulang.
  const [applying, setApplying] = useState<string | null>(null);

  const [bought, setBought] = useState(initialBought);
  // Undangan beku tidak bisa diubah kecuali admin membuka kunci sementara.
  const [locked, setLocked] = useState(archive?.locked ?? false);
  const [unlockedUntil, setUnlockedUntil] = useState(archive?.unlockedUntil ?? null);
  const lockedRef = useRef(locked);
  useEffect(() => {
    lockedRef.current = locked;
  }, [locked]);
  const rules = useMemo(() => packageRules(packageData, pkg, bought), [packageData, pkg, bought]);
  const limits = useMemo(() => {
    const out: Record<string, { max: number; note: string }> = {};
    if (rules.photos) out["sections.gallery.photos"] = rules.photos;
    if (rules.extras) out.extras = rules.extras;
    return out;
  }, [rules]);
  const locks = useMemo(() => (rules.locked.musik_sendiri ? { "media.music": rules.locked.musik_sendiri } : undefined), [rules]);

  const groups = useMemo(() => forTheme(GROUPS, theme), [theme]);
  const issues = useMemo(() => [...checkInvitation(data, theme), ...packageIssues(data, theme, rules)], [data, theme, rules]);
  const errors = useMemo(() => (showIssues ? Object.fromEntries(issues.map((i) => [i.path, i.message])) : {}), [issues, showIssues]);
  const dirty = JSON.stringify(data) !== saved;
  const names = [data.couple.groom.name, data.couple.bride.name].filter(Boolean).join(" dan ") || "mempelai";

  // Urutan panel di navigasi: pengaturan, isi tema, lalu tambahan.
  const content = groups.filter((g) => !MORE.has(g.key));
  const more = groups.filter((g) => MORE.has(g.key));
  const order = [...SETUP.map((s) => s.key), ...content.map((g) => g.key), ...more.map((g) => g.key)];
  const titleOf = (key: string) => SETUP.find((s) => s.key === key)?.title ?? TITLES[key] ?? groups.find((g) => g.key === key)?.title ?? key;

  const update = useCallback((fn: (d: InvitationData) => InvitationData) => setData(fn), []);

  useEffect(() => {
    latest.current = data;
  }, [data]);

  useEffect(() => {
    if (!applying) return;
    const t = window.setTimeout(() => setApplying(null), 12000);
    return () => window.clearTimeout(t);
  }, [applying]);

  useEffect(() => {
    const json = JSON.stringify(data);
    if (locked || json === lastSent.current) return;
    const t = window.setTimeout(async () => {
      setDraftState("saving");
      const res = await saveDraft(slug, data);
      if (!res.ok) {
        setDraftState("error");
        setApplying(null);
        return;
      }
      lastSent.current = json;
      setDraftState("saved");
      frame.current?.contentWindow?.postMessage({ type: "sowanan:refresh" }, window.location.origin);
    }, 700);
    return () => window.clearTimeout(t);
  }, [data, slug, locked]);

  const open = useCallback((key: string) => {
    setActive(key);
    top.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  }, []);

  const jump = useCallback((path: string) => {
    setMobilePreview(false);
    if (path.startsWith("style")) return open("style");
    const g = groupOf(path);
    if (g) setActive(g);
    setFocus(path);
    window.setTimeout(() => {
      const el = document.getElementById(`f-${path}`);
      el?.scrollIntoView({ behavior: "smooth", block: "center" });
      el?.querySelector<HTMLElement>("input:not([type=file]),textarea,select")?.focus({ preventScroll: true });
    }, 60);
  }, [open]);

  useEffect(() => {
    const fields = fieldPatterns();
    const onMessage = (e: MessageEvent<BridgeMessage>) => {
      if (e.origin !== window.location.origin || e.source !== frame.current?.contentWindow) return;
      const m = e.data;
      if (m.type === "sowanan:edit") {
        if (lockedRef.current) return;
        const f = fields.get(patternOf(m.path));
        const max = f && (f.kind === "text" || f.kind === "textarea") ? f.max : 2000;
        setData((d) => setIn(d, m.path, m.value.replace(/\s+/g, " ").slice(0, max)));
      } else if (m.type === "sowanan:focus") jump(m.path);
      else if (m.type === "sowanan:refreshed" && JSON.stringify(latest.current) === lastSent.current) setApplying(null);
    };
    window.addEventListener("message", onMessage);
    return () => window.removeEventListener("message", onMessage);
  }, [jump]);

  useEffect(() => {
    if (!toast) return;
    const t = window.setTimeout(() => setToast(null), 4000);
    return () => window.clearTimeout(t);
  }, [toast]);

  const flagIssues = (list: Issue[]) => {
    setShowIssues(true);
    if (list[0]) jump(list[0].path);
  };

  async function unlock() {
    if (!window.confirm("Buka kunci arsip selama 24 jam? Selama itu isi undangan bisa diubah dan disimpan lagi.")) return;
    setBusy(true);
    const res = await unlockArchive(slug).catch(() => ({ ok: false as const, error: "Gagal membuka kunci. Cek koneksi." }));
    setBusy(false);
    if (!res.ok) return setToast({ tone: "error", text: res.error });
    setLocked(false);
    setUnlockedUntil(res.at);
    setToast({ tone: "ok", text: "Kunci arsip dibuka selama 24 jam." });
  }

  async function publish() {
    if (locked) {
      setToast({ tone: "error", text: "Undangan ini sudah menjadi arsip. Buka kunci dulu kalau perlu koreksi." });
      return;
    }
    if (issues.length) {
      flagIssues(issues);
      setToast({ tone: "error", text: `${issues.length} isian perlu dilengkapi. Yang bermasalah ditandai merah.` });
      return;
    }
    setBusy(true);
    const res = await publishDraft(slug, data);
    setBusy(false);
    if (!res.ok) {
      if (res.issues) flagIssues(res.issues);
      setToast({ tone: "error", text: res.error });
      return;
    }
    setSaved(JSON.stringify(data));
    setShowIssues(false);
    setToast({ tone: "ok", text: published ? "Perubahan sudah live." : "Versi tersimpan. Nyalakan Live kalau undangan sudah siap dibagikan." });
    frame.current?.contentWindow?.postMessage({ type: "sowanan:refresh" }, window.location.origin);
  }

  async function togglePublished(next: boolean) {
    setBusy(true);
    const res = await setPublished(slug, next);
    setBusy(false);
    if (!res.ok) {
      if (res.issues?.length) flagIssues(res.issues);
      setToast({ tone: "error", text: res.error });
      return;
    }
    setPub(next);
    setToast({ tone: "ok", text: next ? `Live di sowanan.com/${slug}` : "Undangan disembunyikan dari publik." });
  }

  const setSection = (key: string, on: boolean) => setData((d) => setIn(d, `sections.${key}.enabled`, on));

  const issueCount = (key: string) => (showIssues ? issues.filter((i) => panelOfIssue(i.group) === key).length : 0);
  // Bagian yang tidak termasuk paket selalu mati dan saklarnya dikunci.
  const lockOf = (g: Group) => (g.section === "story" ? rules.locked.cerita : g.key === "extras" && rules.extras?.max === 0 ? rules.extras.note : undefined);
  const isOn = (g: Group) => (g.section ? data.sections[g.section].enabled && !lockOf(g) : true);

  const navItem = (key: string, folded: boolean) => {
    const g = groups.find((x) => x.key === key);
    const n = issueCount(key);
    const off = g ? !isOn(g) : false;
    const current = active === key;
    return (
      <button
        key={key}
        type="button"
        role="tab"
        aria-selected={current}
        onClick={() => open(key)}
        className={`-mb-px flex flex-none items-center gap-2 border-b-2 px-3.5 pt-3 pb-[13px] text-[13.5px] whitespace-nowrap transition-colors duration-150 focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-wine xl:mb-0 xl:rounded-sm xl:border-b-0 xl:px-3 xl:py-2 xl:text-left xl:text-[14px] ${
          current ? "border-wine font-medium text-wine xl:bg-blush" : "border-transparent text-ink-soft hover:text-ink xl:hover:bg-[#F5EFE8]"
        } ${folded && !current ? "xl:hidden" : ""}`}
      >
        <span className={off ? "text-ink-mute line-through decoration-1" : ""}>{titleOf(key)}</span>
        {n > 0 && <span className="rounded-full bg-wine px-1.5 text-[11px] leading-[18px] text-white xl:ml-auto">{n}</span>}
        {n === 0 && off && <span className="text-[11px] text-ink-mute xl:ml-auto">off</span>}
      </button>
    );
  };
  // Di sidebar, judul kelompok menjadi tombol buka tutup. Di baris tab layar kecil semua item selalu tampil.
  const navGroup = (label: string, keys: string[], first = false) => {
    const folded = shut.has(label);
    const issuesHere = keys.reduce((sum, k) => sum + issueCount(k), 0);
    const toggle = () =>
      setShut((s) => {
        const next = new Set(s);
        if (next.has(label)) next.delete(label);
        else next.add(label);
        return next;
      });
    return (
      <span className="contents">
        {!first && <span aria-hidden="true" className="mx-3 h-[18px] w-px flex-none bg-line xl:hidden" />}
        <span aria-hidden="true" className="flex-none pr-2 pl-0.5 text-[10px] tracking-[.18em] text-ink-mute uppercase xl:hidden">
          {label}
        </span>
        <button
          type="button"
          onClick={toggle}
          aria-expanded={!folded}
          className={`hidden items-center gap-2 rounded-sm px-3 py-1.5 text-left text-[10px] tracking-[.18em] text-ink-mute uppercase hover:text-ink xl:flex ${first ? "" : "xl:mt-4"}`}
        >
          {label}
          {folded && issuesHere > 0 && <span className="rounded-full bg-wine px-1.5 text-[10px] leading-4 tracking-normal text-white">{issuesHere}</span>}
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className={`ml-auto shrink-0 transition-transform duration-150 ${folded ? "-rotate-90" : ""}`} aria-hidden="true">
            <path d="m6 9 6 6 6-6" />
          </svg>
        </button>
        {keys.map((k) => navItem(k, folded))}
      </span>
    );
  };

  const step = order.indexOf(active);
  const prev = order[step - 1];
  const next = order[step + 1];

  const panel = (() => {
    if (active === "package") {
      return (
        <>
          <PanelHead title="Package & add-ons" note="Paket dipilih di daftar undangan. Centang add-on yang sudah dibayar supaya batas isian dan total harga ikut menyesuaikan." />
          <div className="pt-5">
            <AddonPanel slug={slug} pkg={pkg} packages={packageData.packages} addons={packageData.addons} bought={bought} dp={dp} onChange={setBought} />
          </div>
        </>
      );
    }
    if (active === "style") {
      return (
        <>
          <PanelHead title="Style" note="Palet warna dan font undangan. Preview langsung menyesuaikan." />
          <div className="pt-5">
            <StylePanel
              theme={theme}
              style={data.style}
              couple={[data.couple.groom.name, data.couple.bride.name].filter(Boolean).join(" & ") || "Andi & Rina"}
              locked={{ palette: rules.locked.palet_varian, custom: rules.locked.palet_custom, font: rules.locked.font_varian }}
              applying={applying}
              onChange={(style) => {
                if (JSON.stringify(style) === JSON.stringify(data.style)) return;
                setApplying(
                  style.font !== data.style.font
                    ? `font:${style.font || "bawaan"}`
                    : style.nameFont !== data.style.nameFont
                      ? `nama:${style.nameFont || "bawaan"}`
                      : style.palette || "bawaan",
                );
                setData((d) => ({ ...d, style }));
              }}
            />
          </div>
        </>
      );
    }
    const g = groups.find((x) => x.key === active);
    if (!g) return null;
    const lock = lockOf(g);
    const on = isOn(g);
    const fields = forTheme(g.fields, theme);
    const note = lock ?? (g.key === "extras" ? "Bagian di luar isi tema, misalnya susunan acara, denah, atau dress code." : g.section ? undefined : g.note);
    return (
      <>
        <PanelHead title={titleOf(g.key)} note={note} action={g.section && <Switch on={on} disabled={Boolean(lock)} onChange={(v) => setSection(g.section!, v)} label={`Tampilkan ${g.title}`} />} />
        <div className="pt-5">
          {!on ? (
            <p className="rounded-sm bg-ivory px-4 py-3 text-[14px] text-ink-mute">Section ini disembunyikan dari undangan, jadi isiannya boleh dikosongkan.</p>
          ) : fields.length ? (
            <div className="grid gap-5 sm:grid-cols-2">
              {fields.map((f) => (
                <FieldInput key={f.path + f.label} f={f} path={f.path} />
              ))}
            </div>
          ) : (
            <p className="rounded-sm bg-ivory px-4 py-3 text-[14px] text-ink-mute">Section ini tampil otomatis dan tidak perlu diisi.</p>
          )}
        </div>
      </>
    );
  })();

  const saveLabel = busy ? "Processing..." : published ? "Publish changes" : "Save version";

  return (
    <FormProvider value={{ slug, theme, data, update, errors, focus, names, limits, locks }}>
      <InvitationHeader
        slug={slug}
        label={label}
        current="edit"
        published={published}
        paid={paid}
        actions={
          <>
            <span className="hidden text-[12px] text-ink-mute sm:inline" aria-live="polite">
              {draftState === "saving" ? (
                "Saving..."
              ) : draftState === "error" ? (
                <span className="text-wine" title="Draft gagal tersimpan. Cek koneksi.">
                  Gagal menyimpan
                </span>
              ) : dirty ? (
                <span className="text-wine">{published ? "Belum live" : "Belum disimpan"}</span>
              ) : (
                "Saved"
              )}
            </span>
            <label className="inline-flex cursor-pointer items-center gap-2 text-[14px]" title="Live berarti undangan bisa dibuka publik">
              <input type="checkbox" checked={published} disabled={busy} onChange={(e) => togglePublished(e.target.checked)} className="peer sr-only" />
              <span className="relative h-5 w-9 rounded-full bg-line transition-colors duration-150 peer-checked:bg-wine peer-focus-visible:outline-3 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-wine after:absolute after:top-0.5 after:left-0.5 after:size-4 after:rounded-full after:bg-white after:shadow after:transition-transform after:duration-150 peer-checked:after:translate-x-4" />
              Live
            </label>
            {published && (
              <a href={`/${slug}`} target="_blank" rel="noreferrer" className="text-[14px] text-wine underline underline-offset-4">
                View
              </a>
            )}
            <button type="button" onClick={publish} disabled={busy || locked} className="hidden rounded-sm bg-wine px-4 py-2 text-[14px] text-white transition-colors duration-150 hover:bg-wine-dark disabled:opacity-60 lg:block">
              {saveLabel}
            </button>
          </>
        }
      />

      <div ref={top} className="mt-5 scroll-mt-24 pb-28 lg:mt-0 lg:grid lg:grid-cols-[minmax(0,1fr)_auto] lg:items-start lg:gap-8 lg:pb-0 xl:grid-cols-[200px_minmax(0,1fr)_auto]">
        <nav
          role="tablist"
          aria-label="Section undangan"
          className="-mx-5 mb-5 flex items-center gap-1 overflow-x-auto border-b border-line px-5 [scrollbar-width:none] lg:col-span-2 xl:sticky xl:top-14 xl:col-span-1 xl:mx-0 xl:mb-0 xl:h-[calc(100dvh-3.5rem)] xl:flex-col xl:items-stretch xl:gap-0.5 xl:overflow-y-auto xl:border-b-0 xl:border-r xl:px-0 xl:py-6 xl:pr-4 xl:[scrollbar-color:var(--color-wine)_transparent] xl:[scrollbar-width:thin]"
        >
          {navGroup("Setup", SETUP.map((s) => s.key), true)}
          {navGroup("Content", content.map((g) => g.key))}
          {more.length > 0 && navGroup("More", more.map((g) => g.key))}
        </nav>

        <div role="tabpanel" aria-label={titleOf(active)} className="min-w-0 lg:pt-6 lg:pb-12">
          {archive && (locked || unlockedUntil) && (
            <div role="status" className={`mb-5 rounded-sm border p-4 text-[14px] ${locked ? "border-line bg-blush/60" : "border-amber-300 bg-amber-50 text-amber-900"}`}>
              {locked ? (
                <>
                  <p>
                    Undangan ini sudah menjadi arsip sejak <b className="font-medium">{archive.archiveAt}</b>. Isinya tetap tayang, tapi tidak bisa diubah lagi. RSVP, ucapan baru, amplop
                    digital, hitung mundur, dan link nama tamu sudah berhenti.
                  </p>
                  <button type="button" onClick={unlock} disabled={busy} className="mt-2 text-wine underline underline-offset-4 disabled:opacity-50">
                    Buka kunci 24 jam untuk koreksi
                  </button>
                </>
              ) : (
                <p>
                  Kunci arsip dibuka sementara sampai{" "}
                  {new Date(unlockedUntil!).toLocaleString("id-ID", { day: "numeric", month: "long", hour: "2-digit", minute: "2-digit", timeZone: "Asia/Jakarta" })} WIB. Setelah itu undangan
                  kembali terkunci.
                </p>
              )}
            </div>
          )}

          {showIssues && issues.length > 0 && (
            <div role="alert" className="mb-5 rounded-sm border border-wine/40 bg-blush/60 p-4 text-[14px]">
              <p className="font-medium text-wine">{issues.length} isian perlu dilengkapi sebelum disimpan</p>
              <ul className="mt-2 grid gap-1">
                {issues.slice(0, 8).map((i) => (
                  <li key={i.path + i.message}>
                    <button type="button" onClick={() => jump(i.path)} className="text-left underline-offset-4 hover:underline">
                      {titleOf(panelOfIssue(i.group))}: {i.message}
                    </button>
                  </li>
                ))}
                {issues.length > 8 && <li className="text-ink-mute">dan {issues.length - 8} lainnya</li>}
              </ul>
            </div>
          )}
          <fieldset disabled={locked} className="m-0 min-w-0 border-0 p-0">
            <div className="rounded-sm border border-line bg-white p-5 sm:p-6">{panel}</div>
          </fieldset>
          <div className="mt-4 flex justify-between gap-3 text-[14px]">
            {prev ? (
              <button type="button" onClick={() => open(prev)} className="text-ink-soft hover:text-wine">
                &larr; {titleOf(prev)}
              </button>
            ) : (
              <span />
            )}
            {next && (
              <button type="button" onClick={() => open(next)} className="text-wine hover:text-wine-dark">
                {titleOf(next)} &rarr;
              </button>
            )}
          </div>
        </div>

        <aside className={mobilePreview ? "fixed inset-0 z-50 flex flex-col bg-ink/80 p-4 backdrop-blur-sm" : "hidden lg:sticky lg:top-[100px] lg:flex lg:h-[calc(100dvh-100px)] lg:flex-col lg:py-6 xl:top-14 xl:h-[calc(100dvh-3.5rem)]"}>
          {mobilePreview && (
            <div className="mb-3 flex justify-end">
              <button type="button" onClick={() => setMobilePreview(false)} className="rounded-sm bg-white px-3 py-1.5 text-[13px] text-ink">
                Close
              </button>
            </div>
          )}
          <PhoneFrame
            frame={frame}
            src={`/admin/pratinjau/${slug}`}
            fitWidth={mobilePreview}
            overlay={
              applying && (
                <div role="status" className="absolute inset-0 flex items-start justify-center bg-ivory/55 pt-6 backdrop-blur-[1px] animate-[inv-pop_.2s_ease-out]">
                  <span className="inline-flex items-center gap-2.5 rounded-full bg-ink px-4 py-2 text-[13px] text-white shadow-[0_8px_24px_rgba(0,0,0,.2)]">
                    <Spinner />
                    {applying.startsWith("font:") || applying.startsWith("nama:") ? "Menerapkan font..." : "Menerapkan palet..."}
                  </span>
                </div>
              )
            }
          />
          <p className={`mt-2 max-w-[400px] self-center text-center text-[12px] leading-snug ${mobilePreview ? "text-white/75" : "text-ink-mute"}`}>
            Klik teks di preview untuk mengubahnya. Garis kuning menandai teks contoh.
          </p>
        </aside>
      </div>

      {!mobilePreview && (
        <div className="fixed inset-x-0 bottom-0 z-40 flex gap-2 border-t border-line bg-ivory/95 px-4 py-3 backdrop-blur lg:hidden">
          <button type="button" onClick={() => setMobilePreview(true)} className="flex-1 rounded-sm border border-ink px-4 py-3 text-[14px]">
            Preview
          </button>
          <button type="button" onClick={publish} disabled={busy || locked} className="flex-1 rounded-sm bg-wine px-4 py-3 text-[14px] text-white disabled:opacity-60">
            {saveLabel}
          </button>
        </div>
      )}

      {toast && (
        <div
          role="status"
          className={`fixed inset-x-4 bottom-24 z-50 mx-auto max-w-md rounded-sm px-5 py-4 text-[15px] shadow-[0_10px_30px_rgba(0,0,0,.15)] animate-[inv-pop_.25s_ease-out] lg:bottom-6 ${
            toast.tone === "ok" ? "bg-ink text-white" : "bg-wine text-white"
          }`}
        >
          {toast.text}
        </div>
      )}
    </FormProvider>
  );
}
