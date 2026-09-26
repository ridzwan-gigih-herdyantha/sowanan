"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { InvitationData } from "@/lib/invitation/schema";
import { checkInvitation, fieldPatterns, forTheme, GROUPS, patternOf, setIn, type Issue } from "@/lib/invitation/spec";
import type { BridgeMessage } from "@/app/admin/pratinjau/[slug]/bridge";
import { publishDraft, saveDraft, setPublished } from "../actions";
import { FieldInput, FormProvider } from "./fields";

type Props = { slug: string; theme: string; label: string; published: boolean; draft: InvitationData; live: InvitationData };
type Toast = { tone: "ok" | "error"; text: string } | null;

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

function Switch({ on, onChange, label }: { on: boolean; onChange: (v: boolean) => void; label: string }) {
  return (
    <label className="inline-flex shrink-0 cursor-pointer items-center gap-2 text-[13px] text-ink-soft">
      <span className="hidden sm:inline">{on ? "Tampil" : "Disembunyikan"}</span>
      <input type="checkbox" checked={on} onChange={(e) => onChange(e.target.checked)} className="peer sr-only" aria-label={label} />
      <span className="relative h-5 w-9 rounded-full bg-line transition-colors duration-150 peer-checked:bg-wine peer-focus-visible:outline-3 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-wine after:absolute after:top-0.5 after:left-0.5 after:size-4 after:rounded-full after:bg-white after:shadow after:transition-transform after:duration-150 peer-checked:after:translate-x-4" />
    </label>
  );
}

export function Editor({ slug, theme, label, published: initialPublished, draft, live }: Props) {
  const [data, setData] = useState(draft);
  const [saved, setSaved] = useState(() => JSON.stringify(live));
  const [published, setPub] = useState(initialPublished);
  const [draftState, setDraftState] = useState<"saved" | "saving" | "error">("saved");
  const [showIssues, setShowIssues] = useState(false);
  const [open, setOpen] = useState<Set<string>>(() => new Set(["hero"]));
  const [focus, setFocus] = useState("");
  const [mobilePreview, setMobilePreview] = useState(false);
  const [toast, setToast] = useState<Toast>(null);
  const [busy, setBusy] = useState(false);
  const frame = useRef<HTMLIFrameElement>(null);
  const lastSent = useRef(JSON.stringify(draft));

  const groups = useMemo(() => forTheme(GROUPS, theme), [theme]);
  const issues = useMemo(() => checkInvitation(data, theme), [data, theme]);
  const errors = useMemo(() => (showIssues ? Object.fromEntries(issues.map((i) => [i.path, i.message])) : {}), [issues, showIssues]);
  const dirty = JSON.stringify(data) !== saved;
  const names = [data.couple.groom.name, data.couple.bride.name].filter(Boolean).join(" dan ") || "mempelai";

  const update = useCallback((fn: (d: InvitationData) => InvitationData) => setData(fn), []);

  useEffect(() => {
    const json = JSON.stringify(data);
    if (json === lastSent.current) return;
    const t = window.setTimeout(async () => {
      setDraftState("saving");
      const res = await saveDraft(slug, data);
      if (!res.ok) {
        setDraftState("error");
        return;
      }
      lastSent.current = json;
      setDraftState("saved");
      frame.current?.contentWindow?.postMessage({ type: "sowanan:refresh" }, window.location.origin);
    }, 700);
    return () => window.clearTimeout(t);
  }, [data, slug]);

  const jump = useCallback((path: string) => {
    const g = groupOf(path);
    if (g) setOpen((s) => new Set(s).add(g));
    setFocus(path);
    setMobilePreview(false);
    window.setTimeout(() => {
      const el = document.getElementById(`f-${path}`);
      el?.scrollIntoView({ behavior: "smooth", block: "center" });
      el?.querySelector<HTMLElement>("input:not([type=file]),textarea,select")?.focus({ preventScroll: true });
    }, 60);
  }, []);

  useEffect(() => {
    const fields = fieldPatterns();
    const onMessage = (e: MessageEvent<BridgeMessage>) => {
      if (e.origin !== window.location.origin || e.source !== frame.current?.contentWindow) return;
      const m = e.data;
      if (m.type === "sowanan:edit") {
        const f = fields.get(patternOf(m.path));
        const max = f && (f.kind === "text" || f.kind === "textarea") ? f.max : 2000;
        setData((d) => setIn(d, m.path, m.value.replace(/\s+/g, " ").slice(0, max)));
      } else if (m.type === "sowanan:focus") jump(m.path);
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
    setOpen((s) => new Set([...s, ...list.map((i) => i.group)]));
    if (list[0]) jump(list[0].path);
  };

  async function publish() {
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
    setToast({ tone: "ok", text: published ? "Perubahan sudah tayang." : "Versi final tersimpan. Nyalakan Tayang kalau sudah siap dibagikan." });
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
    setToast({ tone: "ok", text: next ? `Tayang di sowanan.com/${slug}` : "Undangan disembunyikan dari publik." });
  }

  const setSection = (key: string, on: boolean) => {
    setData((d) => setIn(d, `sections.${key}.enabled`, on));
    if (on) setOpen((s) => new Set(s).add(key));
  };

  const count = (key: string) => (showIssues ? issues.filter((i) => i.group === key).length : 0);

  return (
    <FormProvider value={{ slug, theme, data, update, errors, focus, names }}>
      <div className="sticky top-0 z-30 -mx-5 border-b border-line bg-ivory/95 px-5 py-3 backdrop-blur">
        <div className="flex flex-wrap items-center gap-x-5 gap-y-2">
          <div className="min-w-0 flex-1">
            <Link href="/admin/undangan" prefetch={false} className="text-[13px] text-ink-mute hover:text-wine">
              Semua undangan
            </Link>
            <h1 className="truncate font-serif text-2xl leading-tight">{label}</h1>
            <p className="text-[12px] text-ink-mute">
              {draftState === "saving" ? "Menyimpan draf..." : draftState === "error" ? <span className="text-wine">Draf gagal tersimpan. Cek koneksi.</span> : "Draf tersimpan otomatis"}
              <span className="mx-1.5">·</span>
              {dirty ? <span className="text-wine">Ada perubahan belum {published ? "ditayangkan" : "disimpan final"}</span> : "Versi final sudah terbaru"}
            </p>
          </div>
          <div className="flex items-center gap-4">
            <label className="inline-flex cursor-pointer items-center gap-2 text-[14px]">
              <input type="checkbox" checked={published} disabled={busy} onChange={(e) => togglePublished(e.target.checked)} className="peer sr-only" />
              <span className="relative h-5 w-9 rounded-full bg-line transition-colors duration-150 peer-checked:bg-wine peer-focus-visible:outline-3 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-wine after:absolute after:top-0.5 after:left-0.5 after:size-4 after:rounded-full after:bg-white after:shadow after:transition-transform after:duration-150 peer-checked:after:translate-x-4" />
              Tayang
            </label>
            {published && (
              <a href={`/${slug}`} target="_blank" rel="noreferrer" className="text-[14px] text-wine underline underline-offset-4">
                Buka
              </a>
            )}
            <button
              type="button"
              onClick={publish}
              disabled={busy}
              className="rounded-sm bg-wine px-5 py-2.5 text-[14px] text-white transition-colors duration-150 hover:bg-wine-dark disabled:opacity-60"
            >
              {busy ? "Memproses..." : published ? "Tayangkan perubahan" : "Simpan versi final"}
            </button>
          </div>
        </div>
      </div>

      <div className="mt-6 lg:grid lg:grid-cols-[minmax(0,1fr)_400px] lg:gap-8">
        <div className="grid content-start gap-3">
          {showIssues && issues.length > 0 && (
            <div role="alert" className="rounded-sm border border-wine/40 bg-blush/60 p-4 text-[14px]">
              <p className="font-medium text-wine">{issues.length} isian perlu dilengkapi sebelum disimpan final</p>
              <ul className="mt-2 grid gap-1">
                {issues.slice(0, 8).map((i) => (
                  <li key={i.path + i.message}>
                    <button type="button" onClick={() => jump(i.path)} className="text-left underline-offset-4 hover:underline">
                      {groups.find((g) => g.key === i.group)?.title}: {i.message}
                    </button>
                  </li>
                ))}
                {issues.length > 8 && <li className="text-ink-mute">dan {issues.length - 8} lainnya</li>}
              </ul>
            </div>
          )}

          {groups.map((g) => {
            const enabled = g.section ? data.sections[g.section].enabled : true;
            const isOpen = open.has(g.key);
            const fields = forTheme(g.fields, theme);
            const n = count(g.key);
            return (
              <section key={g.key} id={`g-${g.key}`} className={`rounded-sm border bg-white ${n ? "border-wine" : "border-line"}`}>
                <div className="flex items-center gap-3 px-4 py-3">
                  <button
                    type="button"
                    onClick={() =>
                      setOpen((s) => {
                        const next = new Set(s);
                        if (next.has(g.key)) next.delete(g.key);
                        else next.add(g.key);
                        return next;
                      })
                    }
                    aria-expanded={isOpen}
                    disabled={!fields.length}
                    className="flex min-w-0 flex-1 items-center gap-2 text-left"
                  >
                    <span className={`font-serif text-xl ${enabled ? "" : "text-ink-mute line-through decoration-1"}`}>{g.title}</span>
                    {n > 0 && <span className="rounded-full bg-wine px-2 py-0.5 text-[11px] text-white">{n}</span>}
                    {!g.section && <span className="text-[12px] text-ink-mute">{g.note}</span>}
                    {fields.length > 0 && (
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className={`ml-auto shrink-0 text-ink-mute transition-transform duration-150 ${isOpen ? "rotate-180" : ""}`} aria-hidden="true">
                        <path d="m6 9 6 6 6-6" />
                      </svg>
                    )}
                  </button>
                  {g.section && <Switch on={enabled} onChange={(v) => setSection(g.section!, v)} label={`Tampilkan ${g.title}`} />}
                </div>
                {isOpen && fields.length > 0 && (
                  <div className="border-t border-line p-4">
                    {enabled ? (
                      <div className="grid gap-4 sm:grid-cols-2">
                        {fields.map((f) => (
                          <FieldInput key={f.path + f.label} f={f} path={f.path} />
                        ))}
                      </div>
                    ) : (
                      <p className="text-[14px] text-ink-mute">Section ini tidak ditampilkan di undangan, isiannya boleh kosong.</p>
                    )}
                  </div>
                )}
              </section>
            );
          })}
        </div>

        <aside className={mobilePreview ? "fixed inset-0 z-50 flex flex-col bg-ink/70 p-3 backdrop-blur-sm" : "hidden lg:block"}>
          <div className={mobilePreview ? "flex min-h-0 flex-1 flex-col" : "sticky top-28"}>
            <div className="mb-2 flex items-center justify-between text-[12px]">
              <span className={mobilePreview ? "text-white/80" : "text-ink-mute"}>Klik teks di preview untuk mengubahnya. Garis kuning berarti teks contoh.</span>
              {mobilePreview && (
                <button type="button" onClick={() => setMobilePreview(false)} className="ml-3 shrink-0 rounded-sm bg-white px-3 py-1.5 text-[13px] text-ink">
                  Tutup
                </button>
              )}
            </div>
            <iframe
              ref={frame}
              src={`/admin/pratinjau/${slug}`}
              title="Pratinjau undangan"
              className={`w-full rounded-sm border border-line bg-white ${mobilePreview ? "min-h-0 flex-1" : "h-[calc(100dvh-160px)]"}`}
            />
          </div>
        </aside>
      </div>

      {!mobilePreview && (
        <button
          type="button"
          onClick={() => setMobilePreview(true)}
          className="fixed right-4 bottom-4 z-40 rounded-sm bg-ink px-5 py-3 text-[14px] text-white shadow-[0_10px_30px_rgba(0,0,0,.2)] lg:hidden"
        >
          Lihat preview
        </button>
      )}

      {toast && (
        <div
          role="status"
          className={`fixed inset-x-4 bottom-20 z-50 mx-auto max-w-md rounded-sm px-5 py-4 text-[15px] shadow-[0_10px_30px_rgba(0,0,0,.15)] animate-[inv-pop_.25s_ease-out] lg:bottom-6 ${
            toast.tone === "ok" ? "bg-ink text-white" : "bg-wine text-white"
          }`}
        >
          {toast.text}
        </div>
      )}
    </FormProvider>
  );
}
