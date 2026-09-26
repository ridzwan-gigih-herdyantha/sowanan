import Image, { getImageProps } from "next/image";
import Link from "next/link";
import type { CSSProperties, ReactNode } from "react";
import { BigCountdown } from "@/components/invitation/big-countdown";
import { CopyButton } from "@/components/invitation/copy-button";
import { Gallery } from "@/components/invitation/gallery";
import { Greeting } from "@/components/invitation/greeting";
import { Rsvp } from "@/components/invitation/rsvp";
import { InvitationShell } from "@/components/invitation/shell";
import { Timeline } from "@/components/invitation/timeline";
import { Wishes } from "@/components/invitation/wishes";
import { googleCalendarUrl } from "@/lib/calendar";
import { calendarEventOf, type InvitationView } from "@/lib/invitation/view";
import { getWishes } from "@/lib/guestbook";
import { themeFonts } from "./fonts";

const vars = {
  "--inv-paper": "#E8E5E0",
  "--inv-wash": "#D6D2CB",
  "--inv-night": "#1A1A19",
  "--inv-accent": "#121212",
  "--inv-gold": "#5C5853",
  "--inv-gold-light": "#BDB8B0",
  "--inv-ink": "#121212",
  "--inv-line": "#9D978F",
  "--inv-display": "var(--font-bs-display), Georgia, serif",
  "--inv-body": "var(--font-bs-body), 'Helvetica Neue', Arial, sans-serif",
  "--inv-grain": "url(/img/bagas-sekar/grain.webp)",
} as CSSProperties;

const dark = {
  "--inv-paper": "#1A1A19",
  "--inv-accent": "#E8E5E0",
  "--inv-ink": "#E8E5E0",
  "--inv-gold": "#BDB8B0",
  "--inv-line": "#5E5A55",
} as CSSProperties;

const enter = (delay: number) => ({ className: "inv-enter", style: { "--enter-delay": `${delay}s` } as CSSProperties });

function Wrap({ children, className = "" }: { children: ReactNode; className?: string }) {
  return <div className={`mx-auto w-full max-w-[1180px] px-5 sm:px-8 lg:px-12 ${className}`}>{children}</div>;
}

function Title({ children, className = "" }: { children: ReactNode; className?: string }) {
  return <h2 className={`mt-4 font-display text-[clamp(34px,8vw,56px)] leading-[1.05] tracking-[-0.01em] ${className}`}>{children}</h2>;
}

function Label({ children, className = "" }: { children: ReactNode; className?: string }) {
  return <p className={`text-[11px] font-medium tracking-[0.24em] text-inv-gold ${className}`}>{children}</p>;
}

function HeroPhoto({ inv }: { inv: InvitationView }) {
  const common = { alt: `${inv.groom.name} dan ${inv.bride.name} berdiri berdampingan membawa buket`, fetchPriority: "high" as const };
  const { props: { srcSet: wide } } = getImageProps({ ...common, src: inv.images.heroWide, width: 2400, height: 1600, sizes: "100vw" });
  const { props: { srcSet: tall, ...rest } } = getImageProps({ ...common, src: inv.images.hero, width: 1600, height: 2135, sizes: "100vw" });
  return (
    <picture>
      <source media="(min-width: 760px)" srcSet={wide} sizes="100vw" />
      <img {...rest} srcSet={tall} sizes="100vw" alt={common.alt} className="size-full object-cover object-[50%_35%]" />
    </picture>
  );
}

function Hero({ inv }: { inv: InvitationView }) {
  return (
    <section className="inv-paper relative">
      <Wrap className="flex items-center justify-between py-5">
        <span className="font-display text-xl">{inv.monogram}</span>
        <span className="text-[11px] font-medium tracking-[0.24em] text-inv-gold">{inv.dateShort.replace(/ /g, "")}</span>
      </Wrap>
      <Wrap className="pt-6 pb-8 text-center lg:pt-10 lg:pb-12">
        <p {...enter(0.45)} className="inv-enter text-[11px] font-medium tracking-[0.24em] text-inv-gold">
          KAMI MENGUNDANGMU KE PERNIKAHAN
        </p>
        <h1 {...enter(0.52)} className="inv-enter mt-4 font-display text-[clamp(52px,15vw,80px)] leading-[0.95] tracking-[-0.02em] lg:text-[clamp(96px,10.5vw,168px)]">
          {inv.groom.name} <span className="italic">&amp;</span> {inv.bride.name}
        </h1>
      </Wrap>
      <div {...enter(0.62)} className="inv-enter">
        <div className="clip-hero relative aspect-[4/5] w-full overflow-hidden bg-inv-wash md:aspect-[16/9]">
          <HeroPhoto inv={inv} />
        </div>
      </div>
      <Wrap className="flex flex-col gap-3 py-8 sm:flex-row sm:items-baseline sm:justify-between">
        <div>
          <p className="font-display text-xl italic">{inv.tagline}</p>
          <Greeting className="mt-1 text-[14px] text-inv-gold" />
        </div>
        <p className="text-[12px] font-medium tracking-[0.24em]">
          {inv.dayLabel.toUpperCase()}, {inv.dateShort} &middot; {inv.cityShort.toUpperCase()}
        </p>
      </Wrap>
    </section>
  );
}

function Couple({ inv }: { inv: InvitationView }) {
  const person = (p: { full: string; role: string; parents: string }, align = "") => (
    <div className={align}>
      <p className="font-display text-[clamp(30px,8vw,52px)] leading-[1.05]">{p.full}</p>
      <p className="mt-2 text-[13px] text-inv-gold italic">{p.role}</p>
      <p className="text-[15px]">{p.parents}</p>
    </div>
  );
  return (
    <section className="inv-wash relative pt-20 pb-20 lg:pt-28 lg:pb-28">
      <Wrap>
        <Label>KEDUA MEMPELAI</Label>
      </Wrap>
      <div className="clip-circle relative mt-8 aspect-[4/5] w-full md:aspect-[16/10]">
        <Image src={inv.images.couple} alt={`${inv.groom.name} dan ${inv.bride.name}`} fill sizes="100vw" className="object-cover object-[50%_40%]" />
      </div>
      <Wrap className="mt-10 grid gap-8 sm:grid-cols-2 sm:gap-10">
        {person(inv.groom)}
        {person(inv.bride, "sm:text-right")}
      </Wrap>
      <Wrap>
        <p className="mx-auto mt-14 max-w-[30ch] text-center font-display text-xl leading-snug italic">{inv.heroQuote}</p>
      </Wrap>
    </section>
  );
}

function StorySection({ inv }: { inv: InvitationView }) {
  return (
    <section className="inv-paper relative pt-20 lg:pt-28">
      <Wrap className="mb-10 lg:mb-14">
        <Label>CERITA KAMI</Label>
        <Title className="max-w-[16ch]">Ruang yang kami bangun, pelan-pelan.</Title>
        <p className="mt-4 max-w-[40ch] text-[15px] text-inv-gold">Scroll pelan-pelan. Tiap lembar menumpuk di atas yang sebelumnya.</p>
      </Wrap>
      <Timeline items={inv.story} variant="stack" />
    </section>
  );
}

function Details({ inv }: { inv: InvitationView }) {
  return (
    <section className="inv-wash relative pt-20 lg:pt-28">
      <Wrap>
        <Label>DETAIL ACARA</Label>
        <p className="mt-6 font-display text-[clamp(44px,12vw,96px)] leading-none tracking-[-0.01em]">{inv.dateShort}</p>
        <p className="mt-3 text-[12px] font-medium tracking-[0.24em]">{inv.dayLabel.toUpperCase()}</p>
        <dl className="mt-10 grid gap-6 border-t border-inv-ink pt-6 sm:grid-cols-3">
          {inv.events.map((e) => (
            <div key={e.name}>
              <dt className="text-[11px] font-medium tracking-[0.24em] text-inv-gold">{e.name.toUpperCase()}</dt>
              <dd className="mt-1 font-display text-[28px]">
                {e.time}
                {"until" in e && <span className="text-inv-gold"> sampai {e.until}</span>} WIB
              </dd>
            </div>
          ))}
          <div>
            <dt className="text-[11px] font-medium tracking-[0.24em] text-inv-gold">TEMPAT</dt>
            <dd className="mt-1 font-display text-[28px] leading-tight">{inv.venue.name}</dd>
            <dd className="mt-1 text-[14px] text-inv-gold">{inv.venue.address}</dd>
          </div>
        </dl>
        <a
          href={inv.venue.mapUrl}
          target="_blank"
          rel="noopener"
          className="mt-8 inline-flex items-center gap-3 rounded-sm border border-inv-ink px-5 py-3 text-[11px] font-medium tracking-[0.24em] text-inv-ink no-underline transition-colors duration-150 hover:bg-inv-ink hover:text-inv-paper"
        >
          LIHAT PETA
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true">
            <path d="M4 12h16M14 6l6 6-6 6" />
          </svg>
        </a>
        <p className="mt-10 max-w-[48ch] font-display text-lg leading-snug italic">{inv.honor}</p>
      </Wrap>
      <div className="clip-arch relative mt-14 aspect-[4/5] w-full md:aspect-[21/9]">
        <Image src={inv.images.venue} alt={`Suasana ${inv.venue.name}`} fill sizes="100vw" className="object-cover object-[50%_45%]" />
      </div>
    </section>
  );
}

function CountdownSection({ inv }: { inv: InvitationView }) {
  const btn =
    "rounded-sm border border-inv-line px-5 py-3 text-[11px] font-medium tracking-[0.24em] text-inv-ink no-underline transition-colors duration-150 hover:border-inv-ink";
  return (
    <section className="bg-inv-night py-24 text-inv-ink lg:py-32" style={dark}>
      <Wrap>
        <Label>MENUJU HARI H</Label>
        <div className="mt-10">
          <BigCountdown target={inv.date} stacked doneText="HARI INI." />
        </div>
        <div className="mt-14 flex flex-wrap gap-3">
          <a href={`/${inv.slug}/kalender`} className={btn} download={`${inv.slug}.ics`}>
            SIMPAN KE KALENDER
          </a>
          <a href={googleCalendarUrl(calendarEventOf(inv))} target="_blank" rel="noopener" className={btn}>
            GOOGLE CALENDAR
          </a>
        </div>
      </Wrap>
    </section>
  );
}

function GallerySection({ inv }: { inv: InvitationView }) {
  return (
    <section className="inv-paper relative py-20 lg:py-28">
      <Wrap className="mb-10">
        <Label>GALERI</Label>
        <Title>Yang kami simpan.</Title>
      </Wrap>
      <div className="px-3 sm:px-8 lg:px-12">
        <Gallery photos={inv.gallery} variant="bleed" />
      </div>
    </section>
  );
}

function RsvpSection({ inv }: { inv: InvitationView }) {
  return (
    <section className="bg-inv-night text-inv-ink" style={dark}>
      <div className="lg:grid lg:grid-cols-2">
        <div className="relative aspect-[3/2] lg:aspect-auto lg:min-h-[640px]">
          <Image src={inv.images.rsvp} alt="" fill sizes="(min-width: 980px) 50vw, 100vw" className="object-cover opacity-80" />
          <div className="absolute inset-0 bg-gradient-to-t from-inv-night via-inv-night/30 to-transparent" />
          <p className="absolute inset-x-5 bottom-6 max-w-[18ch] font-display text-[clamp(28px,7vw,44px)] leading-tight text-[#E8E5E0] italic sm:inset-x-8 lg:inset-x-12 lg:bottom-12">
            {inv.rsvpQuote}
          </p>
        </div>
        <div className="px-5 py-16 sm:px-8 lg:flex lg:items-center lg:px-16">
          <div className="w-full max-w-[520px]">
            <Label className="mb-8">KONFIRMASI KEHADIRAN</Label>
            <Rsvp slug={inv.slug} deadline={inv.rsvpDeadline} />
          </div>
        </div>
      </div>
    </section>
  );
}

function Gifts({ inv }: { inv: InvitationView }) {
  return (
    <section className="inv-paper py-20 lg:py-28">
      <Wrap className="lg:grid lg:grid-cols-12 lg:gap-x-8">
        <div className="lg:col-span-4">
          <Label>TANDA KASIH</Label>
          <Title className="max-w-[16ch]">Doa restu kalian sudah lebih dari cukup.</Title>
          <p className="mt-5 max-w-[36ch] text-[15px] leading-relaxed text-inv-gold">
            Bagi yang ingin memberi tanda kasih, dapat melalui rekening atau QRIS berikut.
          </p>
        </div>
        <div className="mt-10 lg:col-span-7 lg:col-start-6 lg:mt-0">
          <div className="border-t border-inv-line">
            {inv.gifts.map((g) => (
              <div key={g.number} className="flex flex-wrap items-end justify-between gap-4 border-b border-inv-line py-6">
                <div>
                  <p className="text-[11px] font-medium tracking-[0.24em] text-inv-gold">{g.bank.toUpperCase()}</p>
                  <p className="mt-2 font-display text-[30px] leading-none tabular-nums">{g.number}</p>
                  <p className="mt-2 text-[14px] text-inv-gold">a.n. {g.holder}</p>
                </div>
                <CopyButton value={g.number} label={`nomor rekening ${g.holder}`} />
              </div>
            ))}
            {inv.images.qris && (
            <div className="flex items-center gap-6 border-b border-inv-line py-6">
              <Image src={inv.images.qris} alt="Kode QRIS" width={112} height={112} className="size-28" />
              <div>
                <p className="text-[11px] font-medium tracking-[0.24em] text-inv-gold">QRIS</p>
                <p className="mt-2 text-[14px]">Pindai dari aplikasi bank atau e-wallet.</p>
              </div>
            </div>
            )}
          </div>
          {inv.giftNote && <p className="mt-4 text-[12px] text-inv-gold">{inv.giftNote}</p>}
        </div>
      </Wrap>
    </section>
  );
}

async function WishesSection({ inv }: { inv: InvitationView }) {
  const wishes = await getWishes(inv.slug);
  return (
    <section className="inv-wash py-20 lg:py-28">
      <Wrap>
        <Label>DOA &amp; UCAPAN</Label>
        <Title className="mb-12">Titipkan doa untuk kami.</Title>
        <Wishes slug={inv.slug} initial={wishes} variant="lined" />
      </Wrap>
    </section>
  );
}

function Closing({ inv }: { inv: InvitationView }) {
  return (
    <section className="bg-inv-night py-24 text-inv-ink lg:py-32" style={dark}>
      <Wrap>
        <p className="max-w-[14ch] font-display text-[clamp(40px,11vw,88px)] leading-[1.02] tracking-[-0.01em]">
          Terima kasih atas doa dan kehadirannya.
        </p>
        <div className="mt-16 flex items-end justify-between border-t border-inv-line pt-6">
          <p className="font-display text-2xl">
            {inv.groom.name} <span className="italic">&amp;</span> {inv.bride.name}
          </p>
          <p className="text-[11px] font-medium tracking-[0.24em] text-inv-gold">{inv.dateShort.replace(/ /g, "")}</p>
        </div>
      </Wrap>
    </section>
  );
}

function Footer({ inv }: { inv: InvitationView }) {
  return (
    <footer className="inv-paper py-10">
      <Wrap className="flex flex-col items-start gap-3 sm:flex-row sm:items-center sm:justify-between">
        <p className="font-display text-xl">{inv.monogram}</p>
        <p className="text-[12px] text-inv-gold">
          Dibuat dengan{" "}
          <Link href="/" className="text-inv-ink underline underline-offset-4">
            Sowanan
          </Link>
          {inv.credit && (
            <>
              <span className="mx-2">/</span>
              {inv.credit}
            </>
          )}
        </p>
      </Wrap>
    </footer>
  );
}

export function BagasSekar({ inv }: { inv: InvitationView }) {
  return (
    <InvitationShell
      door={{ kind: "walls", groom: inv.groom.name, bride: inv.bride.name, date: inv.dateShort }}
      music={inv.music}
      className={`${themeFonts} inv-paper min-h-dvh overflow-x-clip font-body text-inv-ink`}
      style={vars}
    >
      <main>
        <Hero inv={inv} />
        {inv.on.couple && <Couple inv={inv} />}
        {inv.on.story && <StorySection inv={inv} />}
        {inv.on.event && <Details inv={inv} />}
        {inv.on.countdown && <CountdownSection inv={inv} />}
        {inv.on.gallery && <GallerySection inv={inv} />}
        {inv.on.rsvp && <RsvpSection inv={inv} />}
        {inv.on.gifts && <Gifts inv={inv} />}
        {inv.on.wishes && <WishesSection inv={inv} />}
        {inv.on.closing && <Closing inv={inv} />}
      </main>
      <Footer inv={inv} />
    </InvitationShell>
  );
}

