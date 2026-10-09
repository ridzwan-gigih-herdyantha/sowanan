import { WaIcon } from "@/components/home/closing";
import { cx, reveal } from "@/components/ui";
import { fill, type OfferCardData } from "@/lib/settings";

// Kartu panjang berlatar wine untuk tawaran di luar pilihan yang tersedia. Tombolnya menuju WhatsApp.
export function OfferCard({ card, vars, className }: { card: OfferCardData; vars: Record<string, string>; className?: string }) {
  const points = card.points.map((p) => fill(p, vars).trim()).filter(Boolean);
  if (!card.title && !card.text) return null;
  return (
    <div className={cx("grid grid-cols-1 gap-7 rounded-[14px] bg-wine px-6 py-8 text-paper sm:px-9 sm:py-9 md:grid-cols-[minmax(0,1fr)_auto] md:items-center md:gap-12 lg:px-12", className)} {...reveal()}>
      <div>
        {card.title && <h3 className="font-serif text-[clamp(26px,3vw,32px)] leading-[1.15] font-medium text-balance">{fill(card.title, vars)}</h3>}
        {card.text && <p className="mt-3 max-w-[60ch] text-[15px] leading-relaxed text-[#f2dfe2] sm:text-[16px]">{fill(card.text, vars)}</p>}
        {points.length > 0 && (
          // Di HP pil selalu satu baris, dan bisa digeser ke samping kalau layar terlalu sempit. Di sm ke atas boleh membungkus.
          <ul className="mt-5 flex gap-1.5 overflow-x-auto text-[11px] text-paper [scrollbar-width:none] sm:flex-wrap sm:gap-2 sm:overflow-visible sm:text-[13px] [&::-webkit-scrollbar]:hidden">
            {points.map((p) => (
              <li key={p} className="shrink-0 rounded-full border border-wine-soft/80 px-2.5 py-1 whitespace-nowrap sm:px-3.5">
                {p}
              </li>
            ))}
          </ul>
        )}
      </div>
      {card.button && (
        <a
          href={vars.wa_link}
          className="inline-flex items-center justify-center gap-2.5 rounded-lg bg-paper px-4 py-4 text-center text-[14px] leading-snug text-wine-dark sm:px-7 sm:text-base no-underline transition-[transform,background-color] duration-200 ease-out hover:-translate-y-0.5 hover:bg-white focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-paper motion-reduce:transform-none"
        >
          <WaIcon className="size-5 shrink-0" />
          {card.button}
        </a>
      )}
    </div>
  );
}
