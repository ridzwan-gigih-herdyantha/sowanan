"use client";

import { createClient } from "@supabase/supabase-js";
import { useCallback, useMemo } from "react";
import { BUCKET } from "@/lib/storage/media";
import { createUploadTicket, finalizeUpload } from "./actions";

export type Uploaded = { path: string; url: string; name: string; bytes: number; width?: number; height?: number };
export type UploadResult = { ok: true; data: Uploaded } | { ok: false; error: string };

export const ACCEPT = {
  image: "image/jpeg,image/png,image/webp,image/heic,image/heif,image/avif",
  video: "video/mp4,video/webm",
  audio: "audio/mpeg,audio/mp4,audio/ogg",
};

export const formatBytes = (n: number) => (n >= 1024 * 1024 ? `${(n / 1024 / 1024).toFixed(1)}MB` : `${Math.round(n / 1024)}KB`);

export function useUploader(slug: string) {
  const storage = useMemo(
    () =>
      createClient(new URL(process.env.NEXT_PUBLIC_SUPABASE_URL!).origin, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!, {
        auth: { persistSession: false },
      }).storage.from(BUCKET),
    [],
  );

  return useCallback(
    async (file: File, purpose: string, onStage?: (stage: "upload" | "proses") => void): Promise<UploadResult> => {
      const type = file.type || "application/octet-stream";
      onStage?.("upload");
      const ticket = await createUploadTicket({ slug, purpose, type, size: file.size });
      if (!ticket.ok) return ticket;
      const { error } = await storage.uploadToSignedUrl(ticket.data.path, ticket.data.token, file, { contentType: type });
      if (error) return { ok: false, error: "Upload terputus. Coba lagi." };
      onStage?.("proses");
      const done = await finalizeUpload({ slug, purpose, tmpPath: ticket.data.path, type });
      if (!done.ok) return done;
      const { path, url, name, bytes, width, height } = done.data;
      return { ok: true, data: { path, url, name, bytes, width, height } };
    },
    [slug, storage],
  );
}
