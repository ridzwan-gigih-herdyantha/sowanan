"use client";

import { createClient } from "@supabase/supabase-js";
import { useState } from "react";
import { BUCKET, mediaUrl } from "@/lib/storage/media";
import { createQrisTicket, finalizeQris } from "./qris-actions";

export function QrisInput({ initial }: { initial: string }) {
  const [path, setPath] = useState(initial);
  const [status, setStatus] = useState("");

  async function upload(file: File) {
    setStatus("Mengunggah...");
    const type = file.type || "application/octet-stream";
    const ticket = await createQrisTicket(type, file.size);
    if (!ticket.ok) return setStatus(ticket.error);
    const storage = createClient(new URL(process.env.NEXT_PUBLIC_SUPABASE_URL!).origin, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!, {
      auth: { persistSession: false },
    }).storage.from(BUCKET);
    const { error } = await storage.uploadToSignedUrl(ticket.data.path, ticket.data.token, file, { contentType: type });
    if (error) return setStatus("Upload terputus. Coba lagi.");
    setStatus("Memproses...");
    const done = await finalizeQris(ticket.data.path, type);
    if (!done.ok) return setStatus(done.error);
    setPath(done.data.path);
    setStatus("Terunggah. Tekan Simpan pengaturan untuk memakainya.");
  }

  return (
    <span className="mt-2 flex items-center gap-4 rounded-sm border border-line bg-white p-3 font-normal">
      <input type="hidden" name="qrisImage" value={path} />
      <span className="flex size-24 shrink-0 items-center justify-center overflow-hidden rounded-sm bg-blush/60 text-[12px] text-ink-mute">
        {path ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={mediaUrl(path)} alt="QRIS pembayaran" className="size-full object-contain" />
        ) : (
          "belum ada"
        )}
      </span>
      <span className="min-w-0 flex-1 text-[13px]">
        <span className="block text-ink-soft">{status || "Gambar dikompres tanpa mengurangi ketajaman supaya tetap bisa dipindai."}</span>
        <span className="mt-2 flex gap-4">
          <span className="relative cursor-pointer text-wine underline underline-offset-4 focus-within:outline-2 focus-within:outline-wine">
            {path ? "Ganti gambar" : "Unggah gambar"}
            <input
              type="file"
              accept="image/jpeg,image/png,image/webp,image/heic,image/heif,image/avif"
              className="absolute inset-0 cursor-pointer opacity-0"
              onChange={(e) => {
                const file = e.target.files?.[0];
                e.target.value = "";
                if (file) upload(file);
              }}
            />
          </span>
          {path && (
            <button
              type="button"
              className="text-ink-mute hover:text-wine"
              onClick={() => {
                setPath("");
                setStatus("Dihapus dari pengaturan. Tekan Simpan pengaturan.");
              }}
            >
              Hapus
            </button>
          )}
        </span>
      </span>
    </span>
  );
}
