import Image, { getImageProps } from "next/image";
import Link from "next/link";
import type { CSSProperties, ReactNode } from "react";
import { BigCountdown } from "@/components/invitation/big-countdown";
import { CopyButton } from "@/components/invitation/copy-button";
import { Gallery } from "@/components/invitation/gallery";
import { Greeting } from "@/components/invitation/greeting";
import { Quiz } from "@/components/invitation/quiz";
import { Rsvp } from "@/components/invitation/rsvp";
import { InvitationShell } from "@/components/invitation/shell";
import { Story } from "@/components/invitation/story";
import { Wishes } from "@/components/invitation/wishes";
import { googleCalendarUrl } from "@/lib/calendar";
import { getWishes } from "@/lib/guestbook";
import { invitation as inv } from "./data";
import { themeFonts } from "./fonts";

const vars = {
  "--inv-paper": "#F6EEE3",
  "--inv-wash": "#EAD9C2",
  "--inv-night": "#0B2327",
  "--inv-accent": "#1F4449",
  "--inv-gold": "#B07A3A",
  "--inv-gold-light": "#D39B59",
  "--inv-ink": "#1C1916",
  "--inv-line": "#A08F74",
  "--inv-display": "var(--font-ar-display), Georgia, serif",
  "--inv-body": "var(--font-ar-body), 'Helvetica Neue', Arial, sans-serif",
  "--inv-grain": `url(${inv.images.grain})`,
} as CSSProperties;

export const calendarEvent = {
  title: `Pernikahan ${inv.groom.name} & ${inv.bride.name}`,
  start: inv.date,
  end: inv.end,
  location: `${inv.venue.name}, ${inv.venue.address}`,
  details: `Undangan: https://sowanan.com/${inv.slug}`,
};

const enter = (delay: number) => ({ className: "inv-enter", style: { "--enter-delay": `${delay}s` } as CSSProperties });

function Label({ children, className = "" }: { children: ReactNode; className?: string }) {
  return <p className={`text-[11px] tracking-[0.22em] ${className}`}>{children}</p>;
}

function Wrap({ children, className = "" }: { children: ReactNode; className?: string }) {
  return <div className={`mx-auto w-full max-w-[1120px] px-5 sm:px-8 ${className}`}>{children}</div>;
}

function HeroPhoto() {
  const common = { alt: `${inv.groom.name} dan ${inv.bride.name} bergandengan di jalan saat senja`, fetchPriority: "high" as const };
  const { props: { srcSet: wide } } = getImageProps({ ...common, src: inv.images.heroWide, width: 1800, height: 1200, sizes: "58vw" });
  const { props: { srcSet: tall, ...rest } } = getImageProps({ ...common, src: inv.images.hero, width: 1200, height: 1602, sizes: "88vw" });
  return (
    <picture>
      <source media="(min-width: 980px)" srcSet={wide} sizes="58vw" />
      <img {...rest} srcSet={tall} sizes="88vw" alt={common.alt} className="size-full object-cover object-top" />
    </picture>
  );
}

function Badge() {
  return (
    <svg viewBox="0 0 100 100" className="size-24 text-inv-accent" aria-hidden="true">
      <defs>
        <path id="ar-badge" d="M50 50 m-38 0 a38 38 0 1 1 76 0 a38 38 0 1 1 -76 0" />
      </defs>
      <circle cx="50" cy="50" r="49" fill="var(--inv-paper)" />
      <text fontSize="8.2" fill="currentColor" style={{ fontFamily: "var(--inv-body)" }}>
        <textPath href="#ar-badge" textLength="236" lengthAdjust="spacing">
          ANDI &amp; RINA · 12.12.2026 · SEMARANG ·
        </textPath>
      </text>
      <text x="50" y="57" textAnchor="middle" fontSize="20" fill="var(--inv-gold)" style={{ fontFamily: "var(--inv-display)", fontStyle: "italic" }}>
        &amp;
      </text>
    </svg>
  );
}

function Hero() {
  return (
    <section className="relative mx-auto max-w-[1280px] px-5 pb-16 sm:px-8 lg:px-12 lg:pb-24">
      <div className="flex items-center justify-between pt-5 pb-8 lg:pt-8 lg:pb-12">
        <span className="font-display text-2xl text-inv-accent">{inv.monogram}</span>
        <span className="text-[11px] tracking-[0.22em] text-inv-ink/70">{inv.dateShort.replace(/ /g, "")}</span>
      </div>

      <div className="grid lg:grid-cols-[minmax(0,5fr)_minmax(0,7fr)] lg:grid-rows-[1fr_auto] lg:gap-x-12">
        <div className="lg:col-start-1 lg:row-start-1 lg:self-end">
          <Label className="text-inv-ink/70">
            <span {...enter(0.55)} className="inv-enter inline-block">PERNIKAHAN</span>
          </Label>
          <h1 className="mt-3 font-display text-[clamp(64px,20vw,150px)] leading-[0.92] font-normal text-inv-accent lg:text-[clamp(96px,10vw,150px)]">
            <span {...enter(0.6)} className="inv-enter block">
              {inv.groom.name}
            </span>
            <span {...enter(0.68)} className="inv-enter block pl-[11vw] lg:pl-16">
              <span className="text-inv-gold italic">&amp;</span> {inv.bride.name}
            </span>
          </h1>
          <div {...enter(0.76)}>
            <p className="mt-5 max-w-[24ch] font-display text-xl text-inv-ink/80 italic">{inv.tagline}</p>
            <Greeting className="mt-3 text-[14px] text-inv-accent" />
          </div>
        </div>

        <div
          {...enter(0.84)}
          className="inv-enter relative mt-10 -mr-5 ml-7 sm:-mr-8 sm:ml-16 lg:col-start-2 lg:row-span-2 lg:row-start-1 lg:mt-0 lg:-mr-12 lg:ml-0"
        >
          <div className="torn-bottom relative aspect-[3/4] overflow-hidden bg-inv-wash lg:aspect-auto lg:h-full lg:min-h-[560px]">
            <HeroPhoto />
            <span className="absolute top-4 right-4 text-[12px] tracking-[0.12em] text-[#f0a64b] [text-shadow:0_0_6px_rgba(240,120,40,.7)]">
              {inv.filmStamp}
            </span>
          </div>
          <div className="absolute top-[38%] -left-10 lg:-left-12">
            <Badge />
          </div>
        </div>

        <div className="mt-8 lg:col-start-1 lg:row-start-2 lg:mt-10">
          <div {...enter(0.9)} className="inv-enter border-l border-inv-line pl-4">
            <p className="font-display text-2xl tracking-[0.08em]">{inv.dateShort}</p>
            <p className="mt-1 text-[14px] text-inv-ink/70">{inv.city}</p>
          </div>
          <p className="mt-10 text-[11px] tracking-[0.22em] text-inv-ink/60">GULIR UNTUK MULAI ↓</p>
        </div>
      </div>
    </section>
  );
}

function StorySection() {
  return (
    <section className="inv-wash torn-top relative -mt-3.5 py-20 lg:py-28">
      <Wrap className="lg:grid lg:grid-cols-[minmax(0,4fr)_minmax(0,8fr)] lg:gap-12">
        <div>
          <Label className="text-inv-gold">CERITA KAMI</Label>
          <h2 className="mt-3 font-display text-[clamp(36px,9vw,56px)] leading-[1.05] text-inv-accent italic lg:text-[44px]">
            Serangkaian kebetulan yang indah
          </h2>
          <p className="mt-5 mb-10 max-w-[40ch] text-[15px] leading-relaxed">
            Dari pertemuan yang tak direncanakan, sampai langkah yang kini searah. Ketuk tiap momen untuk membaca ceritanya.
          </p>
        </div>
        <Story items={inv.story} />
      </Wrap>
    </section>
  );
}

function Couple() {
  const person = (p: { name: string; role: string; parents: string }) => (
    <div>
      <p className="font-display text-[clamp(56px,16vw,88px)] leading-none">{p.name}</p>
      <p className="mt-2 text-[11px] tracking-[0.2em] text-inv-paper/70">{p.role.toUpperCase()}</p>
      <p className="mt-1 text-[14px] text-inv-paper/90">{p.parents}</p>
    </div>
  );
  return (
    <section className="torn-top relative -mt-3.5 bg-inv-night text-inv-paper lg:grid lg:grid-cols-2">
      <div className="relative aspect-[2/3] lg:order-2 lg:aspect-auto lg:min-h-[760px]">
        <Image src={inv.images.couple} alt={`${inv.groom.name} dan ${inv.bride.name}`} fill sizes="(min-width: 980px) 50vw, 100vw" className="object-cover" />
        <div className="absolute inset-0 bg-gradient-to-b from-inv-night/90 via-inv-night/25 to-transparent lg:hidden" />
      </div>
      <div className="absolute inset-x-0 top-0 px-5 pt-14 sm:px-8 lg:static lg:flex lg:flex-col lg:justify-center lg:px-16 lg:py-24">
        <Label className="text-inv-gold-light">KEDUA MEMPELAI</Label>
        <div className="mt-6 space-y-5">
          {person(inv.groom)}
          <p className="font-display text-4xl text-inv-gold-light italic">&amp;</p>
          {person(inv.bride)}
        </div>
      </div>
    </section>
  );
}

function Collage() {
  const spots = [
    "left-0 top-0 w-[58%] lg:w-[46%]",
    "right-0 top-16 w-[52%] lg:right-[6%] lg:w-[40%]",
    "left-[16%] top-[190px] w-[56%] lg:left-[22%] lg:top-[230px] lg:w-[42%]",
  ];
  return (
    <section className="inv-paper torn-top relative -mt-3.5 py-20 lg:py-28">
      <Wrap className="lg:grid lg:grid-cols-2 lg:items-center lg:gap-16">
        <div>
          <p className="font-display text-[clamp(24px,6vw,34px)] leading-snug text-inv-accent italic">{inv.quote}</p>
          <div className="mt-6 h-px w-10 bg-inv-line" />
          <p className="mt-4 font-display text-lg tracking-[0.2em] italic">
            {inv.groom.name} &amp; {inv.bride.name}
          </p>
        </div>
        <div className="relative mt-12 h-[480px] sm:h-[560px] lg:mt-0">
          {inv.polaroids.map((p, i) => (
            <figure
              key={p.src}
              className={`absolute bg-[#fbf7f0] p-2 pb-8 shadow-[0_8px_22px_rgba(28,25,22,.2)] ${spots[i]}`}
              style={{ rotate: `${p.rotate}deg` }}
            >
              <div className="relative aspect-square">
                <Image src={p.src} alt="" fill sizes="(min-width: 980px) 240px, 56vw" className="object-cover" />
              </div>
              <figcaption className="absolute bottom-1.5 left-3 font-display text-[15px] text-inv-ink/75 italic">{p.caption}</figcaption>
            </figure>
          ))}
          <div className="absolute right-2 bottom-2 size-24 rotate-[-8deg]">
            <Image src={inv.images.seal} alt="" width={96} height={96} className="size-24" />
            <span className="absolute inset-0 flex items-center justify-center font-display text-lg text-[#f3d6ae]">{inv.monogram}</span>
          </div>
        </div>
      </Wrap>
    </section>
  );
}

function EventDetails() {
  return (
    <section className="inv-wash torn-top relative -mt-3.5 py-20 lg:py-28">
      <Wrap className="lg:grid lg:grid-cols-[minmax(0,3fr)_minmax(0,5fr)_minmax(0,3fr)] lg:items-center lg:gap-12">
        <div>
          <Label className="text-inv-gold">HARI H</Label>
          <p className="mt-6 text-[13px] tracking-[0.22em]">{inv.dayLabel.toUpperCase()}</p>
          <p className="mt-1 font-display text-[clamp(40px,11vw,56px)] leading-none text-inv-accent lg:text-[40px]">{inv.dateShort}</p>
          <ul className="mt-8 space-y-5 border-l border-inv-line pl-5">
            {inv.events.map((e) => (
              <li key={e.name}>
                <p className="font-display text-2xl">
                  {e.time}
                  {"until" in e && <span className="text-inv-ink/60"> sampai {e.until}</span>} WIB
                </p>
                <p className="text-[14px] text-inv-ink/75">{e.name}</p>
              </li>
            ))}
          </ul>
        </div>
        <div className="relative mt-10 aspect-[5/4] overflow-hidden lg:mt-0 lg:aspect-[4/5]">
          <Image src={inv.images.venue} alt={`Suasana ${inv.venue.name}`} fill sizes="(min-width: 980px) 480px, 100vw" className="object-cover" />
        </div>
        <div className="mt-8 lg:mt-0 lg:flex lg:flex-col lg:justify-center">
          <p className="font-display text-[26px] leading-tight">{inv.venue.name}</p>
          <p className="mt-2 text-[14px] leading-relaxed text-inv-ink/75">{inv.venue.address}</p>
          <a
            href={inv.venue.mapUrl}
            target="_blank"
            rel="noopener"
            className="mt-5 inline-flex items-center gap-3 rounded-sm border border-inv-accent px-5 py-3 text-[12px] tracking-[0.16em] text-inv-accent no-underline transition-colors duration-150 hover:bg-inv-accent hover:text-inv-paper"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" aria-hidden="true">
              <path d="M12 21s7-5.5 7-11a7 7 0 10-14 0c0 5.5 7 11 7 11z" />
              <circle cx="12" cy="10" r="2.5" />
            </svg>
            BUKA PETA
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true">
              <path d="M4 12h16M14 6l6 6-6 6" />
            </svg>
          </a>
          <p className="mt-8 max-w-[38ch] font-display text-lg leading-snug italic">{inv.honor}</p>
        </div>
      </Wrap>
    </section>
  );
}

function CountdownSection() {
  const btn =
    "rounded-sm border border-inv-gold-light px-5 py-3 text-[12px] tracking-[0.16em] text-inv-gold-light no-underline transition-colors duration-150 hover:bg-inv-gold-light hover:text-inv-night";
  return (
    <section className="torn-top relative -mt-3.5 bg-inv-night py-24 text-inv-paper lg:py-32">
      <Wrap>
        <Label className="text-inv-paper/70">SAMPAI KAMI BILANG</Label>
        <p className="mt-2 mb-10 font-display text-[clamp(72px,24vw,180px)] leading-[0.85]">SAH.</p>
        <BigCountdown target={inv.date} />
        <div className="mt-12 flex flex-wrap gap-3">
          <a href={`/${inv.slug}/kalender`} className={btn} download={`${inv.slug}.ics`}>
            SIMPAN KE KALENDER
          </a>
          <a href={googleCalendarUrl(calendarEvent)} target="_blank" rel="noopener" className={btn}>
            GOOGLE CALENDAR
          </a>
        </div>
      </Wrap>
    </section>
  );
}

function GallerySection() {
  return (
    <section className="inv-paper torn-top relative -mt-3.5 py-20 lg:py-28">
      <Wrap>
        <Label className="text-inv-gold">GALERI</Label>
        <h2 className="mt-3 mb-12 font-display text-[clamp(36px,9vw,56px)] leading-[1.05] text-inv-accent italic">
          Momen yang ingin kami simpan
        </h2>
        <Gallery photos={inv.gallery} stamp={inv.filmStamp} />
      </Wrap>
    </section>
  );
}

function QuizSection() {
  return (
    <section className="inv-wash torn-top relative -mt-3.5 py-20 lg:py-28">
      <Wrap className="max-w-[640px]">
        <Label className="text-inv-gold">KAMU</Label>
        <h2 className="mt-3 mb-10 font-display text-[clamp(36px,9vw,56px)] leading-[1.05] text-inv-accent">
          Kamu datang bawa apa?
        </h2>
        <Quiz />
      </Wrap>
    </section>
  );
}

function RsvpSection() {
  return (
    <section className="inv-paper torn-top relative -mt-3.5 py-20 lg:py-28">
      <Wrap className="max-w-[640px]">
        <Label className="mb-6 text-inv-gold">KONFIRMASI KEHADIRAN</Label>
        <Rsvp slug={inv.slug} deadline={inv.rsvpDeadline} />
      </Wrap>
    </section>
  );
}

function Gifts() {
  return (
    <section className="inv-wash torn-top relative -mt-3.5 py-20 lg:py-28">
      <Wrap>
        <Label className="text-inv-gold">TANDA KASIH</Label>
        <p className="mt-4 max-w-[36ch] font-display text-[clamp(24px,6vw,32px)] leading-snug text-inv-accent italic">
          Doa restu kalian sudah lebih dari cukup. Bagi yang ingin berbagi,
        </p>
        <div className="mt-10 grid gap-4 md:grid-cols-3">
          {inv.gifts.map((g) => (
            <div key={g.number} className="rounded-sm border border-inv-line bg-inv-paper p-6">
              <p className="text-[11px] tracking-[0.22em] text-inv-ink/65">{g.bank.toUpperCase()}</p>
              <p className="mt-3 font-display text-[28px] tracking-[0.04em] tabular-nums">{g.number}</p>
              <p className="mt-1 text-[14px] text-inv-ink/75">a.n. {g.holder}</p>
              <div className="mt-5">
                <CopyButton value={g.number} label={`nomor rekening ${g.holder}`} />
              </div>
            </div>
          ))}
          <div className="flex items-center gap-5 rounded-sm border border-inv-line bg-inv-paper p-6">
            <Image src={inv.images.qris} alt="Kode QRIS contoh" width={112} height={112} className="size-28" />
            <div>
              <p className="text-[11px] tracking-[0.22em] text-inv-ink/65">QRIS</p>
              <p className="mt-2 text-[13px] leading-relaxed text-inv-ink/75">Pindai dari aplikasi bank atau e-wallet.</p>
            </div>
          </div>
        </div>
        <p className="mt-4 text-[12px] text-inv-ink/60">Nomor rekening dan QRIS di atas hanya contoh, bukan untuk transfer.</p>
      </Wrap>
    </section>
  );
}

async function WishesSection() {
  const wishes = await getWishes(inv.slug);
  return (
    <section className="inv-paper torn-top relative -mt-3.5 py-20 lg:py-28">
      <Wrap>
        <Label className="text-inv-gold">TINGGALKAN PESAN</Label>
        <h2 className="mt-3 mb-10 font-display text-[clamp(36px,9vw,56px)] leading-[1.05] text-inv-accent">
          Tulis sesuatu untuk mereka.
        </h2>
        <Wishes slug={inv.slug} initial={[...wishes, ...inv.sampleWishes]} />
      </Wrap>
    </section>
  );
}

function Closing() {
  return (
    <section className="torn-top relative -mt-3.5 bg-inv-night py-24 text-center text-inv-paper lg:py-32">
      <Wrap className="flex flex-col items-center">
        <p className="max-w-[16ch] font-display text-[clamp(36px,10vw,64px)] leading-[1.05]">Terima kasih atas doa dan kehadirannya.</p>
        <div className="relative mt-12 aspect-[1/1.05] w-40 rotate-[-3deg] bg-[#fbf7f0] p-2 pb-7">
          <Image src={inv.images.closing} alt="" width={144} height={151} sizes="160px" className="h-full w-full object-cover" />
        </div>
        <p className="mt-10 font-display text-2xl tracking-[0.12em]">
          {inv.groom.name} &amp; {inv.bride.name}
        </p>
        <p className="mt-1 text-[13px] tracking-[0.2em] text-inv-paper/70">{inv.dateShort}</p>
        <p className="mt-20 font-display text-xl text-inv-gold-light italic">
          Kamu scroll sampai sini.
          <br />
          Kami sudah suka kamu.
        </p>
      </Wrap>
    </section>
  );
}

function Footer() {
  return (
    <footer className="inv-paper torn-top relative -mt-3.5 py-12 text-center">
      <p className="font-display text-2xl text-inv-accent">{inv.monogram}</p>
      <p className="mt-2 font-display text-[15px] text-inv-ink/70 italic">Entah bagaimana, kami saling menemukan.</p>
      <p className="mt-8 text-[12px] text-inv-ink/60">
        Dibuat dengan{" "}
        <Link href="/" className="text-inv-accent underline underline-offset-4">
          Sowanan
        </Link>
      </p>
      <p className="mt-2 text-[11px] text-inv-ink/45">Foto oleh mornwish di Pexels</p>
    </footer>
  );
}

export function AndiRina() {
  return (
    <InvitationShell
      door={{ kind: "seal", couple: `${inv.groom.name} & ${inv.bride.name}`, monogram: inv.monogram, seal: inv.images.seal }}
      music={inv.music}
      className={`${themeFonts} inv-paper min-h-dvh overflow-x-clip font-body text-inv-ink`}
      style={vars}
    >
      <main>
        <Hero />
        <StorySection />
        <Couple />
        <Collage />
        <EventDetails />
        <CountdownSection />
        <GallerySection />
        <QuizSection />
        <RsvpSection />
        <Gifts />
        <WishesSection />
        <Closing />
      </main>
      <Footer />
    </InvitationShell>
  );
}

export { inv as andiRinaData };
