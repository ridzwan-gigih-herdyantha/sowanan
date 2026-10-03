"use client";

import { createClient } from "@supabase/supabase-js";
import { useId, useState } from "react";
import { BUCKET, mediaUrl } from "@/lib/storage/media";
import { getIn, useSettings } from "./form-context";
import { button, Chip, cx } from "./ui";
import { createSiteUpload, finalizeSiteUpload, type SitePurpose } from "./upload-actions";

export function ImagePicker({ path, label, purpose, chip, help, className, tall }: { path: string; label: string; purpose: SitePurpose; chip?: "sys" | "view"; help?: string; className?: string; tall?: boolean }) {
  const { s, set, errors } = useSettings();
  const value = String(getIn(s, path) ?? "");
  const [status, setStatus] = useState("");
  const [busy, setBusy] = useState(false);
  const id = useId();

  async function upload(file: File) {
    setBusy(true);
    setStatus("Mengunggah...");
    try {
      const type = file.type || "application/octet-stream";
      const ticket = await createSiteUpload(type, file.size);
      if (!ticket.ok) return setStatus(ticket.error);
      const storage = createClient(new URL(process.env.NEXT_PUBLIC_SUPABASE_URL!).origin, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!, {
        auth: { persistSession: false },
      }).storage.from(BUCKET);
      const { error } = await storage.uploadToSignedUrl(ticket.data.path, ticket.data.token, file, { contentType: type });
      if (error) return setStatus("Upload terputus. Coba lagi.");
      setStatus("Memproses...");
      const done = await finalizeSiteUpload(ticket.data.path, type, purpose);
      if (!done.ok) return setStatus(done.error);
      set(path, done.data.path);
      setStatus("Terunggah. Simpan pengaturan untuk memakainya.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className={cx("field mb-[18px]", className)}>
      <p id={`${id}-l`} className="mb-[7px] text-[12.5px] font-medium text-[#5C5048]">
        {label}
        {chip && <Chip sys={chip === "sys"} />}
      </p>
      <div className="flex items-center gap-3 rounded-lg border border-dashed border-[#E8E0D6] bg-[#FCFAF7] px-3.5 py-3">
        <span className={cx("flex flex-none items-center justify-center overflow-hidden rounded-md bg-[#F5F1EB] text-[11px] text-ink-mute", tall ? "h-14 w-[26px]" : "size-12")}>
          {value ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={mediaUrl(value)} alt="" className={cx("size-full", tall ? "object-cover object-top" : "object-contain")} />
          ) : (
            <span aria-hidden="true">-</span>
          )}
        </span>
        <span className="min-w-0 flex-1 text-[13px] text-ink-mute" aria-live="polite">
          {status || (value ? "" : "Belum ada")}
        </span>
        {value && !busy && (
          <button type="button" onClick={() => set(path, "")} className="text-[12.5px] text-ink-mute underline-offset-4 hover:text-wine hover:underline">
            Hapus
          </button>
        )}
        <label className={cx(button.ghost, button.sm, "relative cursor-pointer focus-within:outline-2 focus-within:outline-offset-2 focus-within:outline-wine", busy && "pointer-events-none opacity-50")}>
          {value ? "Ganti" : "Pilih gambar"}
          <input
            type="file"
            accept="image/jpeg,image/png,image/webp,image/heic,image/heif,image/avif"
            aria-labelledby={`${id}-l`}
            disabled={busy}
            className="absolute inset-0 cursor-pointer opacity-0"
            onChange={(e) => {
              const file = e.target.files?.[0];
              e.target.value = "";
              if (file) upload(file);
            }}
          />
        </label>
      </div>
      {(errors[path] || help) && <p className={cx("mt-1.5 text-[11.5px] leading-normal", errors[path] ? "text-wine" : "text-ink-mute")}>{errors[path] || help}</p>}
    </div>
  );
}
