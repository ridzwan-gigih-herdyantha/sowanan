import Image, { getImageProps } from "next/image";
import Link from "next/link";
import type { CSSProperties, ReactNode } from "react";
import { BigCountdown } from "@/components/invitation/big-countdown";
import { CopyButton } from "@/components/invitation/copy-button";
import { ContactSheet } from "@/components/invitation/contact-sheet";
import { GuestName } from "@/components/invitation/guest-name";
import { Greeting } from "@/components/invitation/greeting";
import { Quiz } from "@/components/invitation/quiz";
import { Rsvp } from "@/components/invitation/rsvp";
import { InvitationShell } from "@/components/invitation/shell";
import { Story } from "@/components/invitation/story";
import { Wishes } from "@/components/invitation/wishes";
import { googleCalendarUrl } from "@/lib/calendar";
import { calendarEventOf, type InvitationView } from "@/lib/invitation/view";
import { getWishes } from "@/lib/guestbook";
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
  "--inv-grain": "url(/img/andi-rina/grain.webp)",
} as CSSProperties;

const enter = (delay: number) => ({ className: "inv-enter", style: { "--enter-delay": `${delay}s` } as CSSProperties });

function Label({ children, className = "" }: { children: ReactNode; className?: string }) {
  return <p className={`text-[11px] tracking-[0.22em] ${className}`}>{children}</p>;
}

function Wrap({ children, className = "" }: { children: ReactNode; className?: string }) {
  return <div className={`mx-auto w-full max-w-[1120px] px-5 sm:px-8 ${className}`}>{children}</div>;
}

function HeroPhoto({ inv }: { inv: InvitationView }) {
  const common = { alt: `${inv.groom.name} dan ${inv.bride.name} bergandengan di jalan saat senja`, fetchPriority: "high" as const };
  const { props: { srcSet: wide } } = getImageProps({ ...common, src: inv.images.heroWide, width: 1800, height: 1200, sizes: "100vw" });
  const { props: { srcSet: tall, ...rest } } = getImageProps({ ...common, src: inv.images.hero, width: 1200, height: 1602, sizes: "100vw" });
  return (
    <picture>
      <source media="(min-width: 760px)" srcSet={wide} sizes="100vw" />
      <img {...rest} srcSet={tall} sizes="100vw" alt={common.alt} className="absolute inset-0 size-full object-cover md:object-[50%_22%]" />
    </picture>
  );
}

function Badge({ inv }: { inv: InvitationView }) {
  return (
    <svg viewBox="0 0 100 100" className="size-24 text-inv-accent" aria-hidden="true">
      <defs>
        <path id="ar-badge" d="M50 50 m-38 0 a38 38 0 1 1 76 0 a38 38 0 1 1 -76 0" />
      </defs>
      <circle cx="50" cy="50" r="49" fill="var(--inv-paper)" />
      <text fontSize="8.2" fill="currentColor" style={{ fontFamily: "var(--inv-body)" }}>
        <textPath href="#ar-badge" textLength="236" lengthAdjust="spacing">
          {`${inv.groom.name} & ${inv.bride.name} · ${inv.dateShort.replace(/ /g, "")} · ${inv.cityShort} ·`.toUpperCase()}
        </textPath>
      </text>
      <text x="50" y="57" textAnchor="middle" fontSize="20" fill="var(--inv-gold)" style={{ fontFamily: "var(--inv-display)", fontStyle: "italic" }}>
        &amp;
      </text>
    </svg>
  );
}

function Hero({ inv }: { inv: InvitationView }) {
  return (
    <section className="relative h-[100svh] min-h-[620px] overflow-hidden bg-inv-night text-inv-paper">
      <HeroPhoto inv={inv} />
      <div className="absolute inset-0 bg-gradient-to-t from-inv-night via-inv-night/35 to-inv-night/20" />
      <div className="absolute inset-x-0 top-0 flex items-center justify-between px-5 pt-5 sm:px-8 lg:px-12 lg:pt-8">
        <span className="font-display text-2xl">{inv.monogram}</span>
        <span className="text-[11px] tracking-[0.22em] text-inv-paper/80">{inv.dateShort.replace(/ /g, "")}</span>
      </div>
      <span className="absolute top-16 right-5 text-[12px] tracking-[0.12em] text-[#f0a64b] [text-shadow:0_0_6px_rgba(240,120,40,.7)] sm:right-8 lg:top-20 lg:right-12">
        {inv.filmStamp}
      </span>
      <div className="absolute top-24 right-5 scale-75 sm:right-8 lg:top-28 lg:right-12 lg:scale-100">
        <Badge inv={inv} />
      </div>

      <div className="absolute inset-x-0 bottom-0 px-5 pb-12 sm:px-8 lg:px-12 lg:pb-14">
        <Label className="text-inv-paper/80">
          <span {...enter(0.55)} className="inv-enter inline-block">PERNIKAHAN</span>
        </Label>
        <h1 className="mt-2 font-display text-[clamp(84px,26vw,280px)] leading-[0.82] font-normal tracking-[-0.02em] lg:text-[clamp(120px,15vw,220px)]">
          <span {...enter(0.6)} className="inv-enter block">
            {inv.groom.name}
          </span>
          <span {...enter(0.68)} className="inv-enter block text-right lg:pl-[16vw] lg:text-left">
            <span className="text-inv-gold-light italic">&amp;</span> {inv.bride.name}
          </span>
        </h1>
        <div {...enter(0.76)} className="inv-enter mt-6 flex flex-col gap-3 border-t border-inv-paper/30 pt-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="font-display text-lg text-inv-paper/90 italic">{inv.tagline}</p>
            <Greeting className="mt-1 text-[13px] text-inv-gold-light" />
          </div>
          <p className="flex gap-4 text-[12px] tracking-[0.22em] text-inv-paper/80 sm:pr-16">
            <span>{inv.dateShort}</span>
            <span>{inv.cityShort.toUpperCase()}</span>
          </p>
        </div>
      </div>
    </section>
  );
}

function StorySection({ inv }: { inv: InvitationView }) {
  return (
    <section className="film-pin bg-[#070f11] text-inv-paper">
      <div className="film-stage py-16">
        <Story
          items={inv.story}
          variant="film"
          lead={
            <div className="flex h-full flex-col justify-end p-5 sm:p-6">
              <Label className="text-inv-gold-light">CERITA KAMI</Label>
              <h2 className="mt-3 font-display text-[clamp(34px,8vw,52px)] leading-[1.05] italic">Serangkaian kebetulan yang indah</h2>
              <p className="film-hint-scroll mt-6 text-[11px] tracking-[0.18em] text-inv-paper/60">SCROLL UNTUK MEMUTAR FILM &darr;</p>
              <p className="film-hint-swipe mt-6 text-[11px] tracking-[0.18em] text-inv-paper/60">GESER UNTUK MEMUTAR FILM &rarr;</p>
            </div>
          }
          tail={
            <div className="flex h-full flex-col justify-center p-5 text-center sm:p-6">
              <p className="font-display text-[clamp(30px,7vw,44px)] leading-tight text-balance italic">Bersambung di hari H.</p>
              <p className="mt-4 text-[11px] tracking-[0.18em] text-inv-gold-light">{inv.dateShort}</p>
            </div>
          }
        />
      </div>
    </section>
  );
}

function Couple({ inv }: { inv: InvitationView }) {
  const parents = (p: { role: string; parents: string }, align: string) => (
    <div className={align}>
      <p className="text-[11px] tracking-[0.2em] text-inv-gold">{p.role.toUpperCase()}</p>
      <p className="mt-1 text-[15px]">{p.parents}</p>
    </div>
  );
  return (
    <section className="inv-paper torn-top relative -mt-3.5 overflow-hidden py-20 lg:py-28">
      <Wrap>
        <Label className="text-inv-gold">KEDUA MEMPELAI</Label>
        <p className="mt-4 font-display text-[clamp(88px,28vw,240px)] leading-[0.82] tracking-[-0.02em] text-inv-accent">{inv.groom.name}</p>
        {parents(inv.groom, "mt-5 border-l border-inv-line pl-4")}
      </Wrap>
      <div className="relative mx-auto mt-10 max-w-[1280px] border-y-[10px] border-inv-night bg-inv-night lg:border-y-[16px]">
        <div className="relative aspect-[16/10] lg:aspect-[2.39/1]">
          <Image
            src={inv.images.couple}
            alt={`${inv.groom.name} dan ${inv.bride.name}`}
            fill
            sizes="(min-width: 1280px) 1280px, 100vw"
            className="object-cover object-[60%_48%]"
          />
        </div>
        <span className="absolute right-5 -bottom-14 font-display text-[112px] leading-none text-inv-gold italic sm:right-8 lg:right-12" aria-hidden="true">
          &amp;
        </span>
      </div>
      <Wrap className="mt-14 text-right">
        <p className="font-display text-[clamp(88px,28vw,240px)] leading-[0.82] tracking-[-0.02em] text-inv-accent">{inv.bride.name}</p>
        {parents(inv.bride, "mt-5 ml-auto w-fit border-r border-inv-line pr-4")}
      </Wrap>
    </section>
  );
}

function Collage({ inv }: { inv: InvitationView }) {
  const spots = [
    "left-0 top-0 w-[58%] lg:w-[46%]",
    "right-0 top-16 w-[52%] lg:right-[6%] lg:w-[40%]",
    "left-[16%] top-[190px] w-[56%] lg:left-[22%] lg:top-[230px] lg:w-[42%]",
  ];
  return (
    <section className="inv-wash torn-top relative -mt-3.5 py-20 lg:py-28">
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
            <Image src={"/img/andi-rina/seal.webp"} alt="" width={96} height={96} className="size-24" />
            <span className="absolute inset-0 flex items-center justify-center font-display text-lg text-[#f3d6ae]">{inv.monogram}</span>
          </div>
        </div>
      </Wrap>
    </section>
  );
}

function EventDetails({ inv }: { inv: InvitationView }) {
  const rows: [string, string][] = [
    [inv.dayLabel.toUpperCase(), inv.dateShort.replace(/ /g, "")],
    ...inv.events.map((e): [string, string] => [e.name.toUpperCase(), `${e.time}${"until" in e ? ` sampai ${e.until}` : ""} WIB`]),
    ["TEMPAT", inv.venue.name],
  ];
  return (
    <section className="inv-paper torn-top relative -mt-3.5 py-20 lg:py-28">
      <Wrap className="max-w-[980px]">
        <Label className="text-inv-gold">HARI H</Label>
        <h2 className="mt-3 mb-10 font-display text-[clamp(34px,9vw,56px)] leading-[1.05] text-inv-accent">Simpan tiketmu.</h2>
        <div className="relative flex flex-col drop-shadow-[0_12px_22px_rgba(28,25,22,.14)] lg:flex-row">
          <div className="ticket-main flex flex-1 flex-col bg-[#fbf7f0] lg:flex-row">
          <div className="relative aspect-[16/10] lg:aspect-auto lg:w-[46%]">
            <Image src={inv.images.venue} alt={`Suasana ${inv.venue.name}`} fill sizes="(min-width: 980px) 360px, 100vw" className="object-cover" />
          </div>
          <div className="flex-1 p-6 sm:p-8">
            <div className="flex items-baseline justify-between text-[11px] tracking-[0.22em] text-inv-gold">
              <span>TIKET MASUK</span>
              <span>No. {inv.code}</span>
            </div>
            <p className="mt-5 text-[11px] tracking-[0.22em] text-inv-ink/60">UNTUK</p>
            <GuestName fallback="Tamu Undangan" className="block font-display text-[30px] leading-tight text-inv-accent italic" />
            <dl className="mt-6 grid grid-cols-2 gap-x-6 gap-y-5">
              {rows.map(([k, v]) => (
                <div key={k}>
                  <dt className="text-[10px] tracking-[0.22em] text-inv-ink/60">{k}</dt>
                  <dd className="mt-1 font-display text-[19px] leading-snug">{v}</dd>
                </div>
              ))}
            </dl>
            <p className="mt-5 text-[13px] text-inv-ink/65">{inv.venue.address}</p>
          </div>
          </div>
          <div className="ticket-stub flex flex-col justify-between gap-5 border-t-2 border-dashed border-inv-line bg-[#fbf7f0] p-6 sm:px-8 lg:w-[22%] lg:border-t-0 lg:border-l-2">
            <div>
              <p className="font-display text-[44px] leading-none text-inv-accent">{inv.dayMonth}</p>
              <p className="mt-2 text-[10px] tracking-[0.22em] text-inv-ink/60">SIMPAN SOBEKAN INI</p>
            </div>
            <a
              href={inv.venue.mapUrl}
              target="_blank"
              rel="noopener"
              className="inline-flex items-center justify-center gap-2 rounded-sm border border-inv-accent px-4 py-3 text-[11px] tracking-[0.16em] text-inv-accent no-underline transition-colors duration-150 hover:bg-inv-accent hover:text-inv-paper"
            >
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" aria-hidden="true">
                <path d="M12 21s7-5.5 7-11a7 7 0 10-14 0c0 5.5 7 11 7 11z" />
                <circle cx="12" cy="10" r="2.5" />
              </svg>
              BUKA PETA
            </a>
          </div>
        </div>
        <p className="mt-10 max-w-[48ch] font-display text-lg leading-snug italic">{inv.honor}</p>
      </Wrap>
    </section>
  );
}

function CountdownSection({ inv }: { inv: InvitationView }) {
  const btn =
    "rounded-sm border border-inv-night px-5 py-3 text-[12px] tracking-[0.16em] text-inv-night no-underline transition-colors duration-150 hover:bg-inv-night hover:text-[#D39B59]";
  return (
    <section
      className="torn-top relative -mt-3.5 bg-[#D39B59] py-24 text-inv-night lg:py-32"
      style={{ "--inv-gold-light": "#0B2327" } as CSSProperties}
    >
      <Wrap className="lg:flex lg:items-end lg:justify-between lg:gap-12">
        <div>
          <Label className="text-inv-night/80">SAMPAI KAMI BILANG</Label>
          <p className="mt-2 font-display text-[clamp(72px,24vw,180px)] leading-[0.85]">SAH.</p>
        </div>
        <div className="mt-10 lg:mt-0">
          <BigCountdown target={inv.date} />
        </div>
      </Wrap>
      <Wrap className="mt-12 flex flex-wrap gap-3">
        <a href={`/${inv.slug}/kalender`} className={btn} download={`${inv.slug}.ics`}>
          SIMPAN KE KALENDER
        </a>
        <a href={googleCalendarUrl(calendarEventOf(inv))} target="_blank" rel="noopener" className={btn}>
          GOOGLE CALENDAR
        </a>
      </Wrap>
    </section>
  );
}

function GallerySection({ inv }: { inv: InvitationView }) {
  return (
    <section className="torn-top relative -mt-3.5 bg-[#070f11] py-20 text-inv-paper lg:py-28">
      <Wrap>
        <div className="flex items-end justify-between gap-4">
          <div>
            <Label className="text-inv-gold-light">LEMBAR KONTAK</Label>
            <h2 className="mt-3 font-display text-[clamp(34px,9vw,56px)] leading-[1.05] italic">Momen yang ingin kami simpan</h2>
          </div>
          <p className="hidden text-[11px] tracking-[0.2em] text-inv-paper/50 sm:block">ROL 01</p>
        </div>
        <div className="-mx-5 mt-10 sm:mx-0">
          <ContactSheet photos={inv.gallery} stamp={inv.filmStamp} />
        </div>
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

function RsvpSection({ inv }: { inv: InvitationView }) {
  return (
    <section className="inv-paper torn-top relative -mt-3.5 py-20 lg:py-28">
      <Wrap className="max-w-[640px]">
        <Label className="mb-6 text-inv-gold">KONFIRMASI KEHADIRAN</Label>
        <Rsvp slug={inv.slug} deadline={inv.rsvpDeadline} />
      </Wrap>
    </section>
  );
}

function Gifts({ inv }: { inv: InvitationView }) {
  const envelope = "relative overflow-hidden bg-[#fbf7f0] px-6 pt-20 pb-6 shadow-[0_8px_22px_rgba(28,25,22,.12)]";
  const flap = (
    <>
      <span className="absolute inset-x-0 top-0 h-16 bg-[#e3cdb0] [clip-path:polygon(0_0,100%_0,50%_100%)]" aria-hidden="true" />
      <Image src={"/img/andi-rina/seal.webp"} alt="" width={40} height={40} className="absolute top-9 left-1/2 size-10 -translate-x-1/2" />
    </>
  );
  return (
    <section className="inv-wash torn-top relative -mt-3.5 py-20 lg:py-28">
      <Wrap>
        <Label className="text-inv-gold">TANDA KASIH</Label>
        <p className="mt-4 max-w-[36ch] font-display text-[clamp(24px,6vw,32px)] leading-snug text-inv-accent italic">
          Doa restu kalian sudah lebih dari cukup. Bagi yang ingin berbagi,
        </p>
        <div className="mt-10 grid gap-6 md:grid-cols-3">
          {inv.gifts.map((g) => (
            <div key={g.number} className={envelope}>
              {flap}
              <p className="text-[11px] tracking-[0.22em] text-inv-ink/65">{g.bank.toUpperCase()}</p>
              <p className="mt-3 font-display text-[28px] tracking-[0.04em] tabular-nums">{g.number}</p>
              <p className="mt-1 text-[14px] text-inv-ink/75">a.n. {g.holder}</p>
              <div className="mt-5">
                <CopyButton value={g.number} label={`nomor rekening ${g.holder}`} />
              </div>
            </div>
          ))}
          {inv.images.qris && (
          <div className={envelope}>
            {flap}
            <div className="flex items-center gap-5">
              <Image src={inv.images.qris} alt="Kode QRIS" width={104} height={104} className="size-26" />
              <div>
                <p className="text-[11px] tracking-[0.22em] text-inv-ink/65">QRIS</p>
                <p className="mt-2 text-[13px] leading-relaxed text-inv-ink/75">Pindai dari aplikasi bank atau e-wallet.</p>
              </div>
            </div>
          </div>
          )}
        </div>
        {inv.giftNote && <p className="mt-4 text-[12px] text-inv-ink/60">{inv.giftNote}</p>}
      </Wrap>
    </section>
  );
}

async function WishesSection({ inv }: { inv: InvitationView }) {
  const wishes = await getWishes(inv.slug);
  return (
    <section className="inv-paper torn-top relative -mt-3.5 py-20 lg:py-28">
      <Wrap>
        <Label className="text-inv-gold">TINGGALKAN PESAN</Label>
        <h2 className="mt-3 mb-10 font-display text-[clamp(36px,9vw,56px)] leading-[1.05] text-inv-accent">
          Tulis sesuatu untuk mereka.
        </h2>
        <Wishes slug={inv.slug} initial={wishes} />
      </Wrap>
    </section>
  );
}

function Closing({ inv }: { inv: InvitationView }) {
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

function Footer({ inv }: { inv: InvitationView }) {
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
      {inv.credit && <p className="mt-2 text-[11px] text-inv-ink/45">{inv.credit}</p>}
    </footer>
  );
}

export function AndiRina({ inv }: { inv: InvitationView }) {
  return (
    <InvitationShell
      door={{ kind: "seal", couple: `${inv.groom.name} & ${inv.bride.name}`, monogram: inv.monogram, seal: "/img/andi-rina/seal.webp" }}
      music={inv.music}
      className={`${themeFonts} inv-paper min-h-dvh overflow-x-clip font-body text-inv-ink`}
      style={vars}
    >
      <main>
        <Hero inv={inv} />
        {inv.on.story && <StorySection inv={inv} />}
        {inv.on.couple && <Couple inv={inv} />}
        {inv.on.collage && <Collage inv={inv} />}
        {inv.on.event && <EventDetails inv={inv} />}
        {inv.on.countdown && <CountdownSection inv={inv} />}
        {inv.on.gallery && <GallerySection inv={inv} />}
        {inv.on.quiz && <QuizSection />}
        {inv.on.rsvp && <RsvpSection inv={inv} />}
        {inv.on.gifts && <Gifts inv={inv} />}
        {inv.on.wishes && <WishesSection inv={inv} />}
        {inv.on.closing && <Closing inv={inv} />}
      </main>
      <Footer inv={inv} />
    </InvitationShell>
  );
}

