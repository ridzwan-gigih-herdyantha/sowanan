"use client";

import { useEffect, useRef, useState } from "react";
import { demoHref, TOP_PACKAGE } from "@/lib/invitation/demo-packages";
import { requirements, sectionLocked } from "@/lib/invitation/requirements";
import { EXTRA_KINDS, invitationDataSchema, type ExtraKind } from "@/lib/invitation/schema";
import { forTheme, GROUPS } from "@/lib/invitation/spec";
import { PACKAGE_NAMES, type PackageId, type Settings } from "@/lib/settings/schema";
import { packageRules, type Purchased } from "@/lib/settings/text";
import { SITE_URL } from "@/lib/site";
import { Dropdown } from "../dropdown";

type Theme = { key: string; name: string; packages: string[] };
type Props = { packages: { id: string; name: string }[]; themes: Theme[]; matrix: Settings["matrix"]; addons: Settings["addons"] };
type Extra = { id: number; kind: ExtraKind; title: string };

const field = "block w-full rounded-sm border border-line bg-white px-3 py-2 text-[15px] font-normal outline-none focus:border-wine";
const MULTI = new Set(["galeri_foto", "bagian_tambahan"]);

// Daftar kebutuhan data untuk calon klien, disusun sebelum undangannya dibuat: tema, paket, add-on, bagian yang
// dipakai, isian opsional yang diminta, dan bagian tambahan. Hasilnya disimpan sebagai PDF dari dialog cetak.
export function RequirementsBuilder({ packages, themes, matrix, addons }: Props) {
  const dialog = useRef<HTMLDialogElement>(null);
  const [opened, setOpened] = useState(0);
  const [pkg, setPkg] = useState(packages.at(-1)?.id ?? "");
  const [theme, setTheme] = useState("");
  const [couple, setCouple] = useState("");
  const [bought, setBought] = useState<Purchased>({});
  const [off, setOff] = useState<Set<string>>(new Set());
  const [skip, setSkip] = useState<Set<string>>(new Set());
  const [extras, setExtras] = useState<Extra[]>([]);
  const [kind, setKind] = useState<ExtraKind>("rundown");
  const [title, setTitle] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (opened) dialog.current?.showModal();
  }, [opened]);

  const available = themes.filter((t) => t.packages.includes(pkg));
  const chosen = available.some((t) => t.key === theme) ? theme : (available[0]?.key ?? "");
  const unlockers = addons.filter((a) => a.on && a.unlock);
  const rules = packageRules({ matrix, addons }, pkg, bought);
  const data = invitationDataSchema.parse({
    sections: Object.fromEntries([...off].map((k) => [k, { enabled: false }])),
    extras: extras.map((e) => ({ kind: e.kind, title: e.title })),
  });
  // Semua isian tanpa pilihan opsional, dipakai untuk menampilkan isian yang bisa dicentang.
  const all = chosen ? requirements(chosen, rules, data).sections : [];
  const groups = chosen ? forTheme(GROUPS, chosen).filter((g) => g.key !== "extras") : [];
  const counted = extras.filter((e) => e.kind !== "bebas").length;
  const room = rules.extras ? rules.extras.max - counted : Infinity;

  const toggle = (set: Set<string>, key: string, on: boolean) => {
    const next = new Set(set);
    if (on) next.delete(key);
    else next.add(key);
    return next;
  };
  const addExtra = () => {
    setExtras((list) => [...list, { id: Date.now(), kind, title: title.trim() }]);
    setTitle("");
  };

  async function download() {
    if (!chosen) return;
    setBusy(true);
    try {
      const { printRequirements } = await import("./requirements-pdf");
      await printRequirements({
        theme: chosen,
        themeName: themes.find((t) => t.key === chosen)?.name ?? chosen,
        pkgName: rules.pkg ? PACKAGE_NAMES[rules.pkg] : "",
        rules,
        data,
        skip,
        demoUrl: `${SITE_URL}${demoHref(chosen, (rules.pkg ?? TOP_PACKAGE) as PackageId)}`,
        couple: couple.trim(),
      });
    } finally {
      setBusy(false);
    }
  }

  return (
    <>
      <button type="button" onClick={() => setOpened((n) => n + 1)} className="text-[14px] text-wine underline underline-offset-4">
        Daftar kebutuhan data (PDF)
      </button>
      <dialog
        ref={dialog}
        aria-labelledby="kebutuhan-judul"
        className="m-auto max-h-[calc(100dvh-32px)] w-[min(760px,calc(100vw-32px))] max-w-none overflow-y-auto rounded-sm border border-line bg-ivory p-0 text-ink shadow-[0_20px_60px_rgba(0,0,0,.25)] backdrop:bg-ink/50"
      >
        <div className="p-5 sm:p-6">
          <h2 id="kebutuhan-judul" className="font-serif text-2xl">
            Daftar kebutuhan data
          </h2>
          <p className="mt-1 text-[14px] text-ink-soft">Pilih tema, paket, dan isi undangan yang disepakati. Isian wajib selalu ikut, isian opsional bisa dilepas.</p>

          <div className="mt-5 grid gap-4 sm:grid-cols-3">
            <div className="text-[14px] font-medium">
              <span aria-hidden="true">Paket</span>
              <Dropdown label="Paket" value={pkg} options={packages.map((p) => ({ value: p.id, label: p.name }))} onChange={setPkg} className="mt-2" />
            </div>
            <div className="text-[14px] font-medium">
              <span aria-hidden="true">Tema</span>
              <Dropdown label="Tema" value={chosen} options={available.map((t) => ({ value: t.key, label: t.name }))} onChange={setTheme} className="mt-2" />
            </div>
            <label className="block text-[14px] font-medium">
              Nama mempelai <span className="font-normal text-ink-mute">opsional</span>
              <input value={couple} onChange={(e) => setCouple(e.target.value)} maxLength={80} placeholder="Budi & Ani" className={`${field} mt-2`} />
            </label>
          </div>

          {unlockers.length > 0 && (
            <fieldset className="mt-6">
              <legend className="text-[14px] font-medium">Add-on</legend>
              <div className="mt-2 grid gap-2 sm:grid-cols-2">
                {unlockers.map((a) => {
                  const units = bought[a.id] ?? 0;
                  const set = (n: number) => setBought((b) => ({ ...b, [a.id]: Math.max(0, Math.min(20, n)) }));
                  return MULTI.has(a.unlock) ? (
                    <label key={a.id} className="flex items-center justify-between gap-3 rounded-sm border border-line bg-white px-3 py-2 text-[14px]">
                      <span>{a.name}</span>
                      <input type="number" min={0} max={20} value={units} onChange={(e) => set(Number(e.target.value) || 0)} className="w-16 rounded-sm border border-line px-2 py-1 text-right" />
                    </label>
                  ) : (
                    <label key={a.id} className="flex items-center gap-3 rounded-sm border border-line bg-white px-3 py-2 text-[14px]">
                      <input type="checkbox" checked={units > 0} onChange={(e) => set(e.target.checked ? 1 : 0)} className="accent-wine" />
                      {a.name}
                    </label>
                  );
                })}
              </div>
            </fieldset>
          )}

          <h3 className="mt-7 text-[14px] font-medium">Bagian dan isian</h3>
          <div className="mt-2 grid gap-2">
            {groups.map((g) => {
              const locked = sectionLocked(g.key, rules);
              const on = !locked && !(g.section && off.has(g.section));
              const optional = (all.find((s) => s.key === g.key)?.rows ?? []).filter((r) => !r.required && !(r.heading && !r.type.startsWith("Daftar")));
              return (
                <div key={g.key} className="rounded-sm border border-line bg-white px-3 py-2.5">
                  <label className={`flex items-center gap-3 text-[15px] ${locked ? "text-ink-mute" : ""}`}>
                    <input
                      type="checkbox"
                      checked={on}
                      disabled={!g.section || locked}
                      onChange={(e) => g.section && setOff((s) => toggle(s, g.section!, e.target.checked))}
                      className="accent-wine"
                    />
                    <span className="font-medium">{g.title}</span>
                    {locked && <span className="text-[12px]">tidak termasuk paket</span>}
                    {!g.section && <span className="text-[12px] text-ink-mute">selalu tampil</span>}
                  </label>
                  {on && optional.length > 0 && (
                    <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1.5 pl-7 text-[13px] text-ink-soft">
                      {optional.map((r) => (
                        <label key={r.key} className="inline-flex items-center gap-1.5">
                          <input type="checkbox" checked={!skip.has(r.key)} onChange={(e) => setSkip((s) => toggle(s, r.key, e.target.checked))} className="accent-wine" />
                          {r.label}
                        </label>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {rules.extras?.max !== 0 || extras.length > 0 ? (
            <>
              <h3 className="mt-7 text-[14px] font-medium">Bagian tambahan</h3>
              {rules.extras && <p className="text-[13px] text-ink-mute">Maksimal {rules.extras.max} bagian di paket ini. Blok bebas tidak dihitung.</p>}
              {extras.length > 0 && (
                <ul className="mt-2 grid gap-1.5">
                  {extras.map((e) => (
                    <li key={e.id} className="flex items-center justify-between gap-3 rounded-sm border border-line bg-white px-3 py-2 text-[14px]">
                      <span>
                        {e.title || EXTRA_KINDS[e.kind]} <span className="text-ink-mute">· {EXTRA_KINDS[e.kind]}</span>
                      </span>
                      <button type="button" onClick={() => setExtras((list) => list.filter((x) => x.id !== e.id))} className="text-[13px] text-ink-mute hover:text-wine">
                        Hapus
                      </button>
                    </li>
                  ))}
                </ul>
              )}
              <div className="mt-2 grid gap-2 sm:grid-cols-[200px_minmax(0,1fr)_auto]">
                <Dropdown
                  label="Jenis bagian tambahan"
                  value={kind}
                  options={(Object.keys(EXTRA_KINDS) as ExtraKind[]).map((k) => ({ value: k, label: EXTRA_KINDS[k], disabled: k !== "bebas" && room <= 0 }))}
                  onChange={(v) => setKind(v as ExtraKind)}
                />
                <input value={title} onChange={(e) => setTitle(e.target.value)} maxLength={60} placeholder="Judul, opsional" className={field} />
                <button type="button" onClick={addExtra} disabled={kind !== "bebas" && room <= 0} className="rounded-sm border border-ink px-4 py-2 text-[14px] disabled:opacity-40">
                  Tambah
                </button>
              </div>
            </>
          ) : null}
        </div>

        <div className="sticky bottom-0 flex justify-end gap-3 border-t border-line bg-ivory px-5 py-3 sm:px-6">
          <button type="button" onClick={() => dialog.current?.close()} className="rounded-sm border border-line px-4 py-2 text-[14px]">
            Tutup
          </button>
          <button type="button" onClick={download} disabled={!chosen || busy} className="rounded-sm bg-wine px-4 py-2 text-[14px] text-white disabled:opacity-50">
            {busy ? "Menyiapkan..." : "Unduh PDF"}
          </button>
        </div>
      </dialog>
    </>
  );
}
