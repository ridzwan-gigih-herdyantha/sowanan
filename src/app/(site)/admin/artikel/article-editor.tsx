"use client";

import { useEffect, useRef, useState } from "react";
import { isEmptyHtml } from "@/lib/settings/html";
import { loadSummernote, type JQ } from "../settings/rich-field";
import { cx } from "../settings/styles";
import { uploadArticleImage } from "./upload";

const HEIGHT = 460;

const TOOLBAR = [
  ["style", ["style"]],
  ["font", ["bold", "italic", "underline", "strikethrough", "clear"]],
  ["color", ["color"]],
  ["para", ["ul", "ol", "paragraph"]],
  ["table", ["table"]],
  ["insert", ["link", "picture", "hr"]],
  ["view", ["undo", "redo", "fullscreen", "codeview"]],
];

export function ArticleEditor({ initial, error, onChange }: { initial: string; error?: string; onChange: (html: string) => void }) {
  const host = useRef<HTMLDivElement>(null);
  const emit = useRef(onChange);
  const [ready, setReady] = useState(false);
  const [status, setStatus] = useState("");

  useEffect(() => {
    emit.current = onChange;
  }, [onChange]);

  // Summernote membuat elemennya sendiri, jadi dipasang di dalam wadah yang tidak diisi React. Isi awal hanya dibaca sekali.
  useEffect(() => {
    let alive = true;
    let mounted: { el: HTMLElement; $: JQ } | null = null;
    const box = host.current!;
    loadSummernote().then(($) => {
      if (!alive) return;
      const el = document.createElement("div");
      box.appendChild(el);
      let loaded = false;
      $(el).summernote({
        lang: "id-ID",
        height: HEIGHT,
        toolbar: TOOLBAR,
        styleTags: ["p", "h2", "h3", "blockquote"],
        dialogsInBody: true,
        callbacks: {
          onChange: (html: string) => {
            if (loaded) emit.current(isEmptyHtml(html) ? "" : html);
          },
          // Tanpa ini Summernote menyimpan gambar sebagai base64 di dalam isi artikel.
          onImageUpload: async (files: FileList) => {
            const list = Array.from(files);
            for (const [i, file] of list.entries()) {
              setStatus(list.length > 1 ? `Mengunggah gambar ${i + 1} dari ${list.length}...` : "Mengunggah gambar...");
              const res = await uploadArticleImage(file, "artimg");
              if (!res.ok) return setStatus(res.error);
              if (alive) $(el).summernote("insertImage", res.url);
            }
            setStatus("");
          },
        },
      });
      $(el).summernote("code", initial);
      loaded = true;
      mounted = { el, $ };
      $(box as Element).find(".note-editable").attr({ "aria-label": "Isi artikel", role: "textbox", "aria-multiline": "true" });
      setReady(true);
    });
    return () => {
      alive = false;
      if (mounted) mounted.$(mounted.el).summernote("destroy");
      box.replaceChildren();
    };
    // Dipasang sekali. Setelah itu editor yang memegang isinya.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="sowanan-rte">
      <div className={cx("rounded-lg", error && "ring-1 ring-wine")}>
        <div ref={host} />
        {!ready && (
          <div className="flex items-center rounded-lg border border-[#E8E0D6] bg-white px-3 text-[13px] text-ink-mute" style={{ height: HEIGHT + 42 }}>
            Memuat editor...
          </div>
        )}
      </div>
      <p className={cx("mt-1.5 text-[11.5px] leading-normal", error ? "text-wine" : "text-ink-mute")} aria-live="polite">
        {error || status || "Gambar bisa dipilih lewat tombol gambar, ditarik ke editor, atau ditempel. Ukurannya diperkecil otomatis."}
      </p>
    </div>
  );
}
