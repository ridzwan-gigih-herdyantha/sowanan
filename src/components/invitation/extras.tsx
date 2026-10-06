import Image from "next/image";
import type { ExtraAnchor, ExtraTone } from "@/lib/invitation/schema";
import type { InvitationView } from "@/lib/invitation/view";
import { ExtraTracks, ExtraVideos } from "./extras-media";
import { Gallery } from "./gallery";

// Warna latar mengikuti palet tema yang aktif, termasuk palet kustom dari tab Palet.
const TONES: Record<ExtraTone, { section: string; line: string }> = {
  paper: { section: "inv-paper text-inv-ink", line: "bg-inv-gold" },
  wash: { section: "inv-wash text-inv-ink", line: "bg-inv-gold" },
  accent: { section: "bg-inv-accent text-inv-paper", line: "bg-current opacity-60" },
  ink: { section: "bg-inv-ink text-inv-paper", line: "bg-current opacity-60" },
};

// Bagian tambahan di luar tema, misalnya denah parkir atau informasi akomodasi.
// Satu komponen dipakai semua tema lewat token inv-*.
export function Extras({ inv, at }: { inv: InvitationView; at: ExtraAnchor }) {
  const items = inv.extras[at];
  if (!items?.length) return null;
  return items.map((e, i) => {
    const tone = TONES[e.tone] ?? TONES.paper;
    const [one] = e.photos;
    return (
      <section key={`${at}-${i}`} className={`${tone.section} px-5 py-20 sm:px-8 lg:py-28`}>
        <div className={`mx-auto ${e.photos.length > 2 ? "max-w-[960px]" : "max-w-[680px]"}`}>
          <span aria-hidden="true" className={`mx-auto block h-px w-12 ${tone.line}`} />
          {e.title && <h2 className="mt-6 text-center font-display text-[clamp(30px,7vw,48px)] leading-[1.1] text-balance">{e.title}</h2>}
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
        </div>
      </section>
    );
  });
}
