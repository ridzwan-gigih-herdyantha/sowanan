import Image, { getImageProps } from "next/image";
import Link from "next/link";
import type { CSSProperties, ReactNode } from "react";
import { BigCountdown } from "@/components/invitation/big-countdown";
import { CopyButton } from "@/components/invitation/copy-button";
import { Gallery } from "@/components/invitation/gallery";
import { Greeting } from "@/components/invitation/greeting";
import { PhotoSlider } from "@/components/invitation/photo-slider";
import { Rsvp } from "@/components/invitation/rsvp";
import { InvitationShell } from "@/components/invitation/shell";
import { Timeline } from "@/components/invitation/timeline";
import { Wishes } from "@/components/invitation/wishes";
import { googleCalendarUrl } from "@/lib/calendar";
import { getWishes } from "@/lib/guestbook";
import { invitation as inv } from "./data";
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
  "--inv-grain": `url(${inv.images.grain})`,
} as CSSProperties;

const dark = {
  "--inv-paper": "#1A1A19",
  "--inv-accent": "#E8E5E0",
  "--inv-ink": "#E8E5E0",
  "--inv-gold": "#BDB8B0",
  "--inv-line": "#5E5A55",
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
  return <p className={`text-[11px] font-medium tracking-[0.24em] text-inv-gold ${className}`}>{children}</p>;
}

function Wrap({ children, className = "" }: { children: ReactNode; className?: string }) {
  return <div className={`mx-auto w-full max-w-[1180px] px-5 sm:px-8 lg:px-12 ${className}`}>{children}</div>;
}

function Title({ children, className = "" }: { children: ReactNode; className?: string }) {
  return <h2 className={`mt-4 font-display text-[clamp(34px,8vw,56px)] leading-[1.05] tracking-[-0.01em] ${className}`}>{children}</h2>;
}

function HeroPhoto() {
  const common = { alt: `${inv.groom.name} dan ${inv.bride.name} berdiri berdampingan membawa buket`, fetchPriority: "high" as const };
  const { props: { srcSet: wide } } = getImageProps({ ...common, src: inv.images.hero, width: 1200, height: 1601, sizes: "36vw" });
  const { props: { srcSet: tall, ...rest } } = getImageProps({ ...common, src: inv.images.hero, width: 1200, height: 1601, sizes: "90vw" });
  return (
    <picture>
      <source media="(min-width: 980px)" srcSet={wide} sizes="36vw" />
      <img {...rest} srcSet={tall} sizes="90vw" alt={common.alt} className="size-full object-cover" />
    </picture>
  );
}

function Hero() {
  return (
    <section className="inv-paper relative">
      <Wrap className="flex items-center justify-between border-b border-inv-line py-5">
        <span className="font-display text-xl">{inv.monogram}</span>
        <span className="text-[11px] font-medium tracking-[0.24em] text-inv-gold">{inv.dateShort.replace(/ /g, "")}</span>
      </Wrap>

      <Wrap className="grid pt-10 pb-16 lg:grid-cols-12 lg:gap-x-8 lg:pt-16 lg:pb-24">
        <div className="lg:col-span-5 lg:self-center">
          <Label>
            <span {...enter(0.45)} className="inv-enter inline-block">
              KAMI MENGUNDANGMU
              <br />
              KE PERNIKAHAN
            </span>
          </Label>
          <h1 className="mt-6 font-display text-[clamp(72px,22vw,160px)] leading-[0.9] tracking-[-0.02em] lg:text-[clamp(96px,9vw,150px)]">
            <span {...enter(0.5)} className="inv-enter block">
              {inv.groom.name}
            </span>
            <span {...enter(0.58)} className="inv-enter block">
              <span className="italic">&amp;</span> {inv.bride.name}
            </span>
          </h1>
          <Greeting className="mt-6 text-[14px] text-inv-gold" />
        </div>

        <div {...enter(0.66)} className="inv-enter relative mt-10 -mr-5 sm:-mr-8 lg:col-span-4 lg:mt-0 lg:-mt-16 lg:mr-0">
          <div className="relative aspect-[3/4] bg-inv-wash lg:aspect-[3/4.4]">
            <HeroPhoto />
          </div>
        </div>

        <div className="mt-10 lg:col-span-3 lg:mt-0 lg:flex lg:flex-col lg:justify-between lg:border-l lg:border-inv-line lg:pl-8">
          <div {...enter(0.74)} className="inv-enter border-l border-inv-line pl-5 lg:border-0 lg:pl-0">
            <p className="font-display text-[28px] tracking-[0.06em]">{inv.dateShort}</p>
            <p className="mt-1 text-[14px] text-inv-gold">{inv.city}</p>
          </div>
          <p className="mt-8 max-w-[26ch] font-display text-xl leading-snug italic lg:mt-10">{inv.tagline}</p>
          <div className="relative mt-10 hidden aspect-[2/3] w-full lg:block">
            <Image src={inv.images.detail} alt="" fill sizes="220px" className="object-cover" />
          </div>
          <p className="mt-6 hidden max-w-[28ch] text-[14px] leading-relaxed text-inv-gold lg:block">{inv.heroQuote}</p>
        </div>
      </Wrap>
    </section>
  );
}

function Couple() {
  const person = (p: { name: string; role: string; parents: string }) => (
    <div>
      <p className="font-display text-[clamp(52px,14vw,80px)] leading-none">{p.name}</p>
      <p className="mt-3 text-[13px] text-inv-gold italic">{p.role}</p>
      <p className="mt-1 text-[15px]">{p.parents}</p>
    </div>
  );
  return (
    <section className="bg-inv-night py-20 text-inv-ink lg:py-28" style={dark}>
      <Wrap className="lg:grid lg:grid-cols-12 lg:gap-x-8">
        <div className="lg:col-span-4 lg:self-center">
          <Label>KEDUA MEMPELAI</Label>
          <div className="mt-8 space-y-6">
            {person(inv.groom)}
            <div className="h-px w-10 bg-inv-line" />
            <p className="font-display text-4xl italic">&amp;</p>
            {person(inv.bride)}
          </div>
        </div>
        <div className="mt-12 lg:col-span-5 lg:mt-0">
          <PhotoSlider photos={inv.couplePhotos} sizes="(min-width: 980px) 460px, 100vw" />
        </div>
        <div className="mt-12 lg:col-span-3 lg:mt-0 lg:self-center lg:border-l lg:border-inv-line lg:pl-8">
          <p className="font-display text-[22px] leading-snug italic">{inv.heroQuote}</p>
        </div>
      </Wrap>
    </section>
  );
}

function StorySection() {
  return (
    <section className="inv-paper py-20 lg:py-28">
      <Wrap>
        <Label>CERITA KAMI</Label>
        <Title className="mb-12 max-w-[18ch] lg:mb-16">Ruang yang kami bangun, pelan-pelan.</Title>
        <Timeline items={inv.story} />
      </Wrap>
    </section>
  );
}

function Details() {
  return (
    <section className="inv-wash py-20 lg:py-28">
      <Wrap className="lg:grid lg:grid-cols-12 lg:gap-x-8">
        <div className="lg:col-span-6">
          <Label>DETAIL ACARA</Label>
          <p className="mt-8 text-[12px] font-medium tracking-[0.24em]">{inv.dayLabel.toUpperCase()}</p>
          <p className="mt-2 font-display text-[clamp(44px,12vw,72px)] leading-none tracking-[0.02em]">{inv.dateShort}</p>

          <dl className="mt-10 border-y border-inv-line">
            {inv.events.map((e) => (
              <div key={e.name} className="grid grid-cols-[88px_1fr] border-b border-inv-line py-4 last:border-b-0">
                <dt className="font-display text-2xl">{e.time}</dt>
                <dd className="self-center text-[15px]">
                  {e.name}
                  {"until" in e && <span className="text-inv-gold">, sampai {e.until} WIB</span>}
                </dd>
              </div>
            ))}
          </dl>

          <div className="mt-8">
            <p className="font-display text-[28px] leading-tight">{inv.venue.name}</p>
            <p className="mt-2 text-[14px] text-inv-gold">{inv.venue.address}</p>
            <a
              href={inv.venue.mapUrl}
              target="_blank"
              rel="noopener"
              className="mt-6 inline-flex items-center gap-3 rounded-sm border border-inv-ink px-5 py-3 text-[11px] font-medium tracking-[0.24em] text-inv-ink no-underline transition-colors duration-150 hover:bg-inv-ink hover:text-inv-paper"
            >
              LIHAT PETA
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true">
                <path d="M4 12h16M14 6l6 6-6 6" />
              </svg>
            </a>
          </div>
          <p className="mt-10 max-w-[40ch] font-display text-lg leading-snug italic">{inv.honor}</p>
        </div>
        <div className="relative mt-12 aspect-[4/5] -mx-5 sm:-mx-8 lg:col-span-5 lg:col-start-8 lg:mx-0 lg:mt-0">
          <Image src={inv.images.venue} alt={`Suasana ${inv.venue.name}`} fill sizes="(min-width: 980px) 460px, 100vw" className="object-cover" />
        </div>
      </Wrap>
    </section>
  );
}

function CountdownSection() {
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
    <section className="inv-paper py-20 lg:py-28">
      <Wrap>
        <div className="mb-12 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <Label>GALERI</Label>
            <Title>Yang kami simpan.</Title>
          </div>
          <p className="max-w-[34ch] text-[14px] text-inv-gold">Ketuk foto untuk melihat lebih dekat.</p>
        </div>
        <Gallery photos={inv.gallery} variant="grid" />
      </Wrap>
    </section>
  );
}

function RsvpSection() {
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
            <Label className="mb-6">KONFIRMASI KEHADIRAN</Label>
            <Rsvp slug={inv.slug} deadline={inv.rsvpDeadline} />
          </div>
        </div>
      </div>
    </section>
  );
}

function Gifts() {
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
            <div className="flex items-center gap-6 border-b border-inv-line py-6">
              <Image src={inv.images.qris} alt="Kode QRIS contoh" width={112} height={112} className="size-28" />
              <div>
                <p className="text-[11px] font-medium tracking-[0.24em] text-inv-gold">QRIS</p>
                <p className="mt-2 text-[14px]">Pindai dari aplikasi bank atau e-wallet.</p>
              </div>
            </div>
          </div>
          <p className="mt-4 text-[12px] text-inv-gold">Nomor rekening dan QRIS di atas hanya contoh, bukan untuk transfer.</p>
        </div>
      </Wrap>
    </section>
  );
}

async function WishesSection() {
  const wishes = await getWishes(inv.slug);
  return (
    <section className="inv-wash py-20 lg:py-28">
      <Wrap>
        <Label>DOA &amp; UCAPAN</Label>
        <Title className="mb-12">Titipkan doa untuk kami.</Title>
        <Wishes slug={inv.slug} initial={[...wishes, ...inv.sampleWishes]} variant="lined" />
      </Wrap>
    </section>
  );
}

function Closing() {
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

function Footer() {
  return (
    <footer className="inv-paper py-10">
      <Wrap className="flex flex-col items-start gap-3 sm:flex-row sm:items-center sm:justify-between">
        <p className="font-display text-xl">{inv.monogram}</p>
        <p className="text-[12px] text-inv-gold">
          Dibuat dengan{" "}
          <Link href="/" className="text-inv-ink underline underline-offset-4">
            Sowanan
          </Link>
          <span className="mx-2">/</span>Foto oleh Kalamata Creative di Pexels
        </p>
      </Wrap>
    </footer>
  );
}

export function BagasSekar() {
  return (
    <InvitationShell
      door={{ kind: "walls", groom: inv.groom.name, bride: inv.bride.name, date: inv.dateShort }}
      music={inv.music}
      className={`${themeFonts} inv-paper min-h-dvh overflow-x-clip font-body text-inv-ink`}
      style={vars}
    >
      <main>
        <Hero />
        <Couple />
        <StorySection />
        <Details />
        <CountdownSection />
        <GallerySection />
        <RsvpSection />
        <Gifts />
        <WishesSection />
        <Closing />
      </main>
      <Footer />
    </InvitationShell>
  );
}

export { inv as bagasSekarData };
