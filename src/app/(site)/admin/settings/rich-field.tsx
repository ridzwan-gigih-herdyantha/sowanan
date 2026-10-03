"use client";

import "summernote/dist/summernote-lite.min.css";
import { useEffect, useId, useRef, useState, type ReactNode } from "react";
import { isEmptyHtml, toHtml } from "@/lib/settings/html";
import { getIn, useSettings } from "./form-context";
import { Chip, cx } from "./ui";

type JQ = ((el: Element) => { summernote: (...args: unknown[]) => unknown; find: (sel: string) => { attr: (a: Record<string, string>) => void } }) & Record<string, unknown>;

// jQuery dan Summernote hanya dimuat saat editor pertama kali dibuka, tidak ikut ke halaman lain.
let loading: Promise<JQ> | null = null;
function loadSummernote(): Promise<JQ> {
  loading ??= (async () => {
    const $ = (await import("jquery")).default as unknown as JQ;
    Object.assign(window, { jQuery: $, $ });
    await import("summernote/dist/summernote-lite.js");
    await import("summernote/dist/lang/summernote-id-ID.js");
    return $;
  })();
  return loading;
}

const TOOLBAR = [
  ["style", ["style"]],
  ["font", ["bold", "italic", "underline", "clear"]],
  ["para", ["ul", "ol"]],
  ["insert", ["link"]],
  ["view", ["undo", "redo", "codeview"]],
];

export function RichField({ path, label, chip, help, height = 200 }: { path: string; label: string; chip?: "sys" | "view"; help?: ReactNode; height?: number }) {
  const { s, set, errors } = useSettings();
  const value = String(getIn(s, path) ?? "");
  const host = useRef<HTMLDivElement>(null);
  const editor = useRef<{ el: HTMLElement; $: JQ } | null>(null);
  const emitted = useRef<string | null>(null);
  const [ready, setReady] = useState(false);
  const id = useId();
  const error = errors[path];

  // Summernote membuat elemennya sendiri, jadi dipasang di dalam wadah yang tidak diisi React.
  useEffect(() => {
    let alive = true;
    const box = host.current!;
    loadSummernote().then(($) => {
      if (!alive) return;
      const el = document.createElement("div");
      box.appendChild(el);
      const initial = toHtml(String(getIn(s, path) ?? ""));
      emitted.current = initial;
      $(el).summernote({
        lang: "id-ID",
        height,
        toolbar: TOOLBAR,
        styleTags: ["p", "h3", "blockquote"],
        disableDragAndDrop: true,
        dialogsInBody: true,
        callbacks: {
          onChange: (html: string) => {
            const next = isEmptyHtml(html) ? "" : html;
            emitted.current = next;
            set(path, next);
          },
        },
      });
      $(el).summernote("code", initial);
      $(box as Element).find(".note-editable").attr({ "aria-label": label, "aria-describedby": `${id}-help`, role: "textbox", "aria-multiline": "true" });
      editor.current = { el, $ };
      setReady(true);
    });
    return () => {
      alive = false;
      const e = editor.current;
      if (e) e.$(e.el).summernote("destroy");
      editor.current = null;
      box.replaceChildren();
    };
    // Dipasang sekali per baris. Perubahan dari luar ditangani efek di bawah.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Nilai berubah dari luar editor, misalnya tombol Batalkan perubahan.
  useEffect(() => {
    const e = editor.current;
    if (!e || value === emitted.current) return;
    emitted.current = value;
    e.$(e.el).summernote("code", toHtml(value));
  }, [value]);

  return (
    <div className="field sowanan-rte mb-[18px]">
      <p className="mb-[7px] text-[12.5px] font-medium text-[#5C5048]">
        {label}
        {chip && <Chip sys={chip === "sys"} />}
      </p>
      <div className={cx("rounded-lg", error && "ring-1 ring-wine")}>
        <div ref={host} />
        {!ready && <div className="flex items-center rounded-lg border border-[#E8E0D6] bg-white px-3 text-[13px] text-ink-mute" style={{ height: height + 42 }}>Memuat editor...</div>}
      </div>
      {(error || help) && (
        <p id={`${id}-help`} className={cx("mt-1.5 text-[11.5px] leading-normal", error ? "text-wine" : "text-ink-mute")}>
          {error || help}
        </p>
      )}
    </div>
  );
}
