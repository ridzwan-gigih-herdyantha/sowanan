import Image from "next/image";
import type { ExtraAnchor, ExtraTone } from "@/lib/invitation/schema";
import type { ExtraView, InvitationView } from "@/lib/invitation/view";
import { ExtraTracks, ExtraVideos } from "./extras-media";
import { Gallery } from "./gallery";

// Warna latar mengikuti palet tema yang aktif, termasuk palet kustom dari tab Palet.
const TONES: Record<ExtraTone, { section: string; line: string; dot: string }> = {
  paper: { section: "inv-paper text-inv-ink", line: "bg-inv-gold", dot: "bg-inv-gold" },
  wash: { section: "inv-wash text-inv-ink", line: "bg-inv-gold", dot: "bg-inv-gold" },
  accent: { section: "bg-inv-accent text-inv-paper", line: "bg-current opacity-60", dot: "bg-current" },
  ink: { section: "bg-inv-ink text-inv-paper", line: "bg-current opacity-60", dot: "bg-current" },
};
type Tone = (typeof TONES)[ExtraTone];

// Susunan acara sebagai linimasa: jam di kiri, titik di garis, nama acara dan keterangannya di kanan.
function Rundown({ items, tone }: { items: ExtraView["rundown"]; tone: Tone }) {
  return (
    <ol className="mx-auto mt-12 max-w-[480px]">
      {items.map((r, i) => (
        <li key={i} className="grid grid-cols-[64px_1fr] gap-x-5 sm:grid-cols-[84px_1fr] sm:gap-x-7">
          <p className="pt-0.5 text-right font-display text-[21px] leading-tight tabular-nums sm:text-[25px]">{r.time}</p>
          <div className={`relative border-l border-current/25 pl-6 ${i === items.length - 1 ? "" : "pb-9"}`}>
            <span aria-hidden="true" className={`absolute top-[9px] -left-[5px] size-[9px] rounded-full ${tone.dot}`} />
            <p className="text-[17px] leading-snug font-medium text-pretty">{r.name}</p>
            {r.note && <p className="mt-1 text-[14px] leading-relaxed text-pretty opacity-75">{r.note}</p>}
          </div>
        </li>
      ))}
    </ol>
  );
}

// Blok bebas: teks, foto, video, dan lagu sesuai isian.
function Free({ e }: { e: ExtraView }) {
  const [one] = e.photos;
  return (
    <>
      {e.body && <p className="mx-auto mt-8 max-w-[56ch] text-[16px] leading-[1.75] whitespace-pre-line text-pretty">{e.body}</p>}
      {e.photos.length === 1 && (
        <Image src={one.src} alt={one.alt} width={one.w} height={one.h} sizes="(min-width: 720px) 680px, 100vw" className="mt-10 h-auto w-full rounded-[2px]" />
      )}
      {e.photos.length > 1 && (
        <div className="mt-10">
          <Gallery photos={e.photos} variant="grid" />
        </div>
      )}
      {e.videos.length > 0 && (
        <div className="mt-10">
          <ExtraVideos videos={e.videos} />
        </div>
      )}
      {e.tracks.length > 0 && (
        <div className="mt-10">
          <ExtraTracks tracks={e.tracks} />
        </div>
      )}
    </>
  );
}

// Bagian tambahan di luar tema, misalnya susunan acara atau denah parkir.
// Satu komponen dipakai semua tema lewat token inv-*.
export function Extras({ inv, at }: { inv: InvitationView; at: ExtraAnchor }) {
  const items = inv.extras[at];
  if (!items?.length) return null;
  return items.map((e, i) => {
    const tone = TONES[e.tone] ?? TONES.paper;
    return (
      <section key={`${at}-${i}`} className={`${tone.section} px-5 py-20 sm:px-8 lg:py-28`}>
        <div className={`mx-auto ${e.kind === "bebas" && e.photos.length > 2 ? "max-w-[960px]" : "max-w-[680px]"}`}>
          <span aria-hidden="true" className={`mx-auto block h-px w-12 ${tone.line}`} />
          {e.title && <h2 className="mt-6 text-center font-display text-[clamp(30px,7vw,48px)] leading-[1.1] text-balance">{e.title}</h2>}
          {e.kind === "rundown" ? <Rundown items={e.rundown} tone={tone} /> : <Free e={e} />}
        </div>
      </section>
    );
  });
}
