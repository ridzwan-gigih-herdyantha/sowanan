"use client";

export type MawaddahDoorProps = {
  groom: string;
  bride: string;
  monogram: string;
  date: string;
  hijri: string;
  city: string;
  invited: string;
  open: boolean;
  onOpen: () => void;
};

export function MawaddahDoor({ groom, bride, monogram, date, hijri, city, invited, open, onOpen }: MawaddahDoorProps) {
  return (
    <div className="mawaddah-door fixed inset-0 z-50 overflow-y-auto bg-inv-night text-inv-ink [perspective:1800px]" role="dialog" aria-modal={!open} aria-hidden={open} aria-label="Sampul undangan Mawaddah">
      <div className="mawaddah-door__page relative min-h-dvh bg-inv-paper">
        <div aria-hidden="true" className="pointer-events-none absolute inset-4 border border-inv-gold/35 sm:inset-7" />
        <div aria-hidden="true" className="pointer-events-none absolute inset-6 border border-inv-gold/15 sm:inset-9" />
        <div className="grid min-h-dvh lg:grid-cols-[.92fr_1.08fr]">
          <div className="relative order-2 flex flex-col justify-center px-8 pb-14 pt-9 sm:px-14 lg:order-1 lg:px-[clamp(48px,8vw,130px)] lg:py-16">
            <p lang="ar" dir="rtl" className="font-arab text-[clamp(24px,4vw,34px)] leading-loose text-inv-accent">بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ</p>
            <p className="mt-2 text-[9px] tracking-[.3em] text-inv-gold uppercase">WALIMATUL &lsquo;URSY</p>
            <div aria-hidden="true" className="my-7 flex items-center gap-3 sm:my-9"><span className="h-px w-12 bg-inv-gold/70" /><span className="size-2 rotate-45 border border-inv-gold" /><span className="h-px w-12 bg-inv-gold/70" /></div>
            <h1 className="font-display text-[clamp(44px,8vw,82px)] leading-[.92] tracking-[-.035em] text-inv-accent">
              {groom}<span className="mx-2 text-[.58em] text-inv-gold">&amp;</span><br />{bride}
            </h1>
            <p className="mt-6 max-w-[34ch] font-display text-[clamp(19px,2.5vw,25px)] italic leading-snug text-inv-ink/70">Dengan kasih dan rahmat, kami mengundang Anda untuk hadir dalam hari bahagia kami.</p>
            <div className="mt-7 border-l border-inv-gold/60 pl-4 text-[10px] leading-relaxed tracking-[.13em] text-inv-ink/65 uppercase">
              <p>{date}</p><p className="mt-1 text-inv-gold">{hijri}</p><p className="mt-1">{city}</p>
            </div>
            {invited && <p className="mt-6 text-[12px] text-inv-ink/60">Kepada Yth. <span className="font-medium text-inv-accent">{invited}</span></p>}
            <button type="button" onClick={onOpen} aria-label={`Buka undangan ${groom} dan ${bride}`} className="group mt-8 inline-flex w-fit items-center gap-4 border border-inv-accent/65 px-5 py-3.5 text-[10px] tracking-[.2em] text-inv-accent uppercase transition-colors hover:bg-inv-accent hover:text-inv-paper focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-inv-accent">
              Buka lembar undangan <span aria-hidden="true" className="font-display text-lg transition-transform group-hover:translate-x-1">→</span>
            </button>
          </div>
          <div className="relative order-1 grid min-h-[34svh] place-items-center overflow-hidden bg-inv-night text-inv-paper lg:order-2 lg:min-h-dvh">
            <div aria-hidden="true" className="mw-geometry pointer-events-none absolute inset-0 opacity-70" />
            <div aria-hidden="true" className="pointer-events-none absolute inset-4 border border-inv-gold/45 sm:inset-7" />
            <div aria-hidden="true" className="pointer-events-none absolute inset-6 border border-inv-gold/15 sm:inset-9" />
            <div aria-hidden="true" className="pointer-events-none absolute left-1/2 top-1/2 aspect-square w-[min(68%,68svh)] -translate-x-1/2 -translate-y-1/2 rotate-45 border border-inv-gold/35" />
            <div aria-hidden="true" className="pointer-events-none absolute left-1/2 top-1/2 aspect-square w-[min(48%,48svh)] -translate-x-1/2 -translate-y-1/2 rotate-45 border border-inv-gold/25" />
            <div className="relative z-10 flex flex-col items-center px-6 text-center">
              <p className="text-[9px] tracking-[.34em] text-inv-gold-light uppercase">MAWADDAH · WALIMATUL &lsquo;URSY</p>
              <div className="relative mt-5 grid size-[min(48vw,240px)] place-items-center sm:mt-7">
                <span aria-hidden="true" className="absolute inset-[12%] rotate-45 border border-inv-gold/65" />
                <span aria-hidden="true" className="absolute inset-[24%] border border-inv-gold/35" />
                <span aria-hidden="true" className="absolute inset-[24%] rotate-45 border border-inv-gold/30" />
                <span className="relative font-display text-[clamp(32px,7vw,54px)] tracking-[.08em] text-inv-gold-light">{monogram}</span>
              </div>
              <p className="mt-5 max-w-[22ch] font-display text-[clamp(17px,2.4vw,24px)] italic leading-snug text-inv-paper/85">Sebuah ikrar, dalam kasih dan rahmat-Nya.</p>
              <p className="mt-4 text-[9px] tracking-[.2em] text-inv-gold-light/75 uppercase">{hijri}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
