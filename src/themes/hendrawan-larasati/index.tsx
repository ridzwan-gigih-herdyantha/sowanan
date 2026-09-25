import Image, { getImageProps } from "next/image";
import Link from "next/link";
import type { CSSProperties, ReactNode } from "react";
import { FlipCard } from "@/components/invitation/flip-card";
import { TagCountdown } from "@/components/invitation/tag-countdown";
import { CopyButton } from "@/components/invitation/copy-button";
import { Gallery } from "@/components/invitation/gallery";
import { Greeting } from "@/components/invitation/greeting";
import { Rsvp } from "@/components/invitation/rsvp";
import { InvitationShell } from "@/components/invitation/shell";
import { Story } from "@/components/invitation/story";
import { Wishes } from "@/components/invitation/wishes";
import { googleCalendarUrl } from "@/lib/calendar";
import { getWishes } from "@/lib/guestbook";
import { invitation as inv } from "./data";
import { themeFonts } from "./fonts";

const vars = {
  "--inv-paper": "#F4EFE6",
  "--inv-wash": "#FAF7F1",
  "--inv-night": "#2A1422",
  "--inv-accent": "#5E1F3D",
  "--inv-gold": "#2F4A36",
  "--inv-gold-light": "#D4B06A",
  "--inv-ink": "#1F1B1D",
  "--inv-line": "#BDB1A4",
  "--inv-tape": "#B08A3E",
  "--inv-display": "var(--font-hl-display), Georgia, serif",
  "--inv-body": "var(--font-hl-body), 'Helvetica Neue', Arial, sans-serif",
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

function Label({ children, className = "text-inv-gold" }: { children: ReactNode; className?: string }) {
  return <p className={`text-[11px] font-medium tracking-[0.2em] ${className}`}>{children}</p>;
}

function Wrap({ children, className = "" }: { children: ReactNode; className?: string }) {
  return <div className={`mx-auto w-full max-w-[1120px] px-5 sm:px-8 ${className}`}>{children}</div>;
}

function Title({ children, className = "" }: { children: ReactNode; className?: string }) {
  return <h2 className={`mt-3 font-display text-[clamp(32px,8vw,52px)] leading-[1.08] text-inv-accent ${className}`}>{children}</h2>;
}

function Tape({ className }: { className: string }) {
  return <span className={`inv-tape z-10 ${className}`} aria-hidden="true" />;
}

function SpecLabel({ rows, className = "" }: { rows: [string, ReactNode][]; className?: string }) {
  return (
    <dl className={`border border-inv-line bg-inv-wash text-[13px] ${className}`}>
      {rows.map(([k, v]) => (
        <div key={k} className="grid grid-cols-[92px_1fr] border-b border-inv-line px-4 py-2.5 last:border-b-0">
          <dt className="text-[10px] font-medium tracking-[0.2em] text-inv-gold">{k}</dt>
          <dd>{v}</dd>
        </div>
      ))}
    </dl>
  );
}

function HeroPhoto() {
  const common = { alt: `${inv.groom.name} dan ${inv.bride.name} dalam busana pengantin adat Bali`, fetchPriority: "high" as const };
  const { props: { srcSet: wide } } = getImageProps({ ...common, src: inv.images.heroWide, width: 1800, height: 1200, sizes: "min(1120px, 100vw)" });
  const { props: { srcSet: tall, ...rest } } = getImageProps({ ...common, src: inv.images.hero, width: 1200, height: 1602, sizes: "96vw" });
  return (
    <picture className="absolute inset-0">
      <source media="(min-width: 760px)" srcSet={wide} sizes="min(1120px, 100vw)" />
      <img {...rest} srcSet={tall} sizes="96vw" alt={common.alt} className="size-full object-cover object-[50%_25%]" />
    </picture>
  );
}

function Hero() {
  const spec = inv.specimens[0];
  return (
    <section className="inv-paper relative overflow-hidden pb-16 lg:pb-24">
      <Wrap className="flex items-center justify-between py-5">
        <span className="font-display text-xl text-inv-accent">{inv.monogram}</span>
        <span className="text-[11px] font-medium tracking-[0.2em] text-inv-gold">{inv.collection.toUpperCase()}</span>
      </Wrap>

      <div className="px-5 pt-14 pb-14 text-center sm:px-8 lg:pt-20 lg:pb-20">
        <p {...enter(0.5)} className="inv-enter text-[11px] font-medium tracking-[0.3em] text-inv-gold">
          UNDANGAN PERNIKAHAN
        </p>
        <h1 className="mx-auto mt-6 font-display text-[clamp(60px,17vw,96px)] leading-[0.92] text-inv-accent md:text-[clamp(72px,9vw,136px)]">
          <span {...enter(0.56)} className="inv-enter inline-block">
            {inv.groom.name}
          </span>{" "}
          <span {...enter(0.64)} className="inv-enter inline-block">
            <span className="italic">&amp;</span> {inv.bride.name}
          </span>
        </h1>
        <div {...enter(0.72)} className="inv-enter">
          <p className="mt-5 font-display text-xl text-inv-gold italic">{inv.latinPair}</p>
          <div className="mx-auto mt-8 flex max-w-md items-center justify-center gap-4 text-[12px] font-medium tracking-[0.22em]">
            <span className="h-px flex-1 bg-inv-line" aria-hidden="true" />
            <span>{inv.dateShort}</span>
            <span className="text-inv-gold">{inv.place.toUpperCase()}</span>
            <span className="h-px flex-1 bg-inv-line" aria-hidden="true" />
          </div>
          <Greeting className="mt-5 text-[14px] text-inv-accent" />
        </div>
      </div>

      <div {...enter(0.8)} className="inv-enter relative mx-auto max-w-[1120px] px-3 sm:px-8">
        <div className="absolute -top-8 right-6 z-20 w-24 rotate-6 border border-inv-line bg-inv-wash p-1.5 shadow-[0_4px_12px_rgba(0,0,0,.1)] sm:right-14 sm:w-32">
          <Tape className="-top-2.5 left-4 rotate-6" />
          <Image src={spec.src} alt="" width={spec.w} height={spec.h} sizes="128px" className="h-auto w-full" />
        </div>
        <div className="relative border border-inv-line bg-inv-wash p-2 shadow-[0_14px_40px_rgba(0,0,0,.1)] sm:p-3">
          <Tape className="-top-2.5 left-10 -rotate-6" />
          <Tape className="right-10 -bottom-2.5 rotate-3" />
          <div className="relative aspect-[4/5] overflow-hidden md:aspect-[16/9]">
            <HeroPhoto />
          </div>
        </div>
      </div>
    </section>
  );
}

function Couple() {
  const card = (p: typeof inv.groom | typeof inv.bride, tilt: string, no: string) => (
    <FlipCard
      label={p.name}
      className={tilt}
      front={
        <span className="relative block border border-inv-line bg-inv-paper p-3 shadow-[0_10px_24px_rgba(0,0,0,.08)]">
          <Tape className="-top-2.5 left-1/2 -translate-x-1/2 rotate-2" />
          <span className="relative block aspect-[4/5] overflow-hidden">
            <Image src={p.photo} alt={p.full} fill sizes="(min-width: 980px) 440px, 92vw" className="object-cover object-top" />
          </span>
          <span className="flex items-end justify-between gap-3 px-1 pt-4 pb-1">
            <span className="font-display text-[44px] leading-none text-inv-accent">{p.name}</span>
            <span className="pb-1 text-[10px] font-medium tracking-[0.2em] text-inv-gold">BALIK KARTU ↻</span>
          </span>
        </span>
      }
      back={
        <span className="flex h-full flex-col border border-inv-line bg-inv-wash p-6 shadow-[0_10px_24px_rgba(0,0,0,.08)]">
          <span className="flex justify-between border-b border-inv-line pb-3 text-[10px] font-medium tracking-[0.2em] text-inv-gold">
            <span>LABEL SPESIMEN</span>
            <span>No. {no}</span>
          </span>
          <span className="mt-6 font-display text-[40px] leading-none text-inv-accent">{p.full}</span>
          <span className="mt-6 text-[10px] font-medium tracking-[0.2em] text-inv-gold">{p.role.toUpperCase()}</span>
          <span className="mt-1 text-[15px]">{p.parents}</span>
          <span className="mt-6 text-[10px] font-medium tracking-[0.2em] text-inv-gold">SPESIMEN FAVORIT</span>
          <span className="mt-1 text-[15px] capitalize">{p.flower}</span>
          <span className="font-display text-lg text-inv-gold italic">{p.latin}</span>
          <span className="mt-auto pt-6 text-[10px] font-medium tracking-[0.2em] text-inv-gold">KETUK UNTUK KEMBALI ↻</span>
        </span>
      }
    />
  );
  return (
    <section className="inv-wash py-20 lg:py-28">
      <Wrap>
        <Label>KEDUA MEMPELAI</Label>
        <Title className="max-w-[20ch]">Dua spesimen yang akhirnya satu lembar.</Title>
        <p className="mt-3 mb-12 text-[14px] text-inv-ink/70">Ketuk kartu untuk membaca label di baliknya.</p>
        <div className="grid gap-12 md:grid-cols-2 md:gap-8 lg:gap-14">
          {card(inv.groom, "-rotate-1", "0412")}
          {card(inv.bride, "rotate-1 md:mt-12", "0508")}
        </div>
        <p className="mx-auto mt-16 max-w-[32ch] text-center font-display text-[clamp(22px,5.5vw,30px)] leading-snug text-inv-accent italic">
          {inv.quote}
        </p>
      </Wrap>
    </section>
  );
}

function StorySection() {
  return (
    <section className="inv-paper py-20 lg:py-28">
      <Wrap>
        <Label>CERITA</Label>
        <Title className="mb-12">Arsip perjalanan kami.</Title>
        <Story items={inv.story} variant="sheets" />
      </Wrap>
    </section>
  );
}

function EventDetails() {
  return (
    <section className="inv-wash py-20 lg:py-28">
      <Wrap className="lg:grid lg:grid-cols-12 lg:gap-x-12">
        <div className="lg:col-span-6">
          <Label>HARI H</Label>
          <Title>{inv.dateLong}</Title>
          <SpecLabel
            className="mt-10"
            rows={[
              ...inv.events.map(
                (e) =>
                  [
                    `${e.time} ${inv.tz}`,
                    <span key={e.name}>
                      {e.name}
                      {"until" in e && <span className="text-inv-ink/60">, sampai {e.until} {inv.tz}</span>}
                    </span>,
                  ] as [string, ReactNode],
              ),
              ["TEMPAT", <span key="v">{inv.venue.name}</span>],
              ["ALAMAT", <span key="a">{inv.venue.address}</span>],
            ]}
          />
          <a
            href={inv.venue.mapUrl}
            target="_blank"
            rel="noopener"
            className="mt-6 inline-flex items-center gap-3 rounded-sm border border-inv-accent px-5 py-3 text-[11px] font-medium tracking-[0.2em] text-inv-accent no-underline transition-colors duration-150 hover:bg-inv-accent hover:text-inv-wash"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" aria-hidden="true">
              <path d="M12 21s7-5.5 7-11a7 7 0 10-14 0c0 5.5 7 11 7 11z" />
              <circle cx="12" cy="10" r="2.5" />
            </svg>
            BUKA PETA
          </a>
          <p className="mt-10 max-w-[40ch] font-display text-lg leading-snug italic">{inv.honor}</p>
        </div>
        <div className="relative mt-12 lg:col-span-5 lg:col-start-8 lg:mt-0">
          <div className="relative rotate-1 border border-inv-line bg-inv-paper p-2.5 shadow-[0_10px_24px_rgba(0,0,0,.07)]">
            <Tape className="-top-2.5 left-8 -rotate-3" />
            <div className="relative aspect-[4/5] overflow-hidden">
              <Image src={inv.images.venue} alt={`Suasana ${inv.venue.name}`} fill sizes="(min-width: 980px) 440px, 90vw" className="object-cover" />
            </div>
            <p className="px-1 pt-2.5 font-display text-[14px] italic">{inv.venue.name}</p>
          </div>
        </div>
      </Wrap>
    </section>
  );
}

function CountdownSection() {
  const btn =
    "rounded-sm border border-inv-gold-light px-5 py-3 text-[11px] font-medium tracking-[0.2em] text-inv-gold-light no-underline transition-colors duration-150 hover:bg-inv-gold-light hover:text-inv-night";
  return (
    <section className="relative overflow-hidden bg-inv-night py-24 text-inv-paper lg:py-32">
      <Wrap>
        <div className="text-center">
          <Label className="text-inv-gold-light">MENUJU HARI H</Label>
          <p className="mx-auto mt-3 max-w-[18ch] font-display text-[clamp(32px,8vw,52px)] leading-[1.05]">Tiga label ini menghitung mundur untuk kami.</p>
          <p className="mt-3 text-[13px] text-inv-paper/60">Sentuh labelnya.</p>
        </div>
        <div className="mx-auto mt-14 max-w-[760px]">
          <TagCountdown target={inv.date} doneText="HARINYA TIBA." />
        </div>
        <div className="mt-14 flex flex-wrap justify-center gap-3">
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
        <Label>GALERI</Label>
        <Title className="mb-12">Lembar-lembar yang kami simpan.</Title>
        <Gallery photos={inv.gallery} variant="specimen" />
      </Wrap>
    </section>
  );
}

function RsvpSection() {
  return (
    <section className="inv-wash py-20 lg:py-28">
      <Wrap className="max-w-[680px]">
        <div className="relative border border-inv-line bg-inv-paper px-6 py-10 shadow-[0_10px_30px_rgba(0,0,0,.06)] sm:px-10">
          <Tape className="-top-2.5 left-1/2 -translate-x-1/2 -rotate-2" />
          <Label className="mb-6 text-inv-gold">KARTU BALASAN</Label>
          <Rsvp slug={inv.slug} deadline={inv.rsvpDeadline} />
        </div>
      </Wrap>
    </section>
  );
}

function Gifts() {
  return (
    <section className="inv-paper py-20 lg:py-28">
      <Wrap>
        <Label>TANDA KASIH</Label>
        <Title className="max-w-[20ch]">Doa restu kalian sudah lebih dari cukup.</Title>
        <p className="mt-4 max-w-[40ch] text-[15px] leading-relaxed text-inv-ink/75">
          Bagi yang ingin memberi tanda kasih, dapat melalui rekening atau QRIS berikut.
        </p>
        <div className="mt-10 grid gap-6 md:grid-cols-3">
          {inv.gifts.map((g) => (
            <div key={g.number} className="border border-inv-line bg-inv-wash">
              <SpecLabel
                className="border-0"
                rows={[
                  ["BANK", g.bank],
                  ["NOMOR", <span key="n" className="font-display text-[20px] tabular-nums">{g.number}</span>],
                  ["ATAS NAMA", g.holder],
                ]}
              />
              <div className="border-t border-inv-line px-4 py-3">
                <CopyButton value={g.number} label={`nomor rekening ${g.holder}`} />
              </div>
            </div>
          ))}
          <div className="flex items-center gap-5 border border-inv-line bg-inv-wash p-4">
            <Image src={inv.images.qris} alt="Kode QRIS contoh" width={112} height={112} className="size-28" />
            <div>
              <p className="text-[10px] font-medium tracking-[0.2em] text-inv-gold">QRIS</p>
              <p className="mt-2 text-[13px] leading-relaxed">Pindai dari aplikasi bank atau e-wallet.</p>
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
    <section className="inv-wash py-20 lg:py-28">
      <Wrap>
        <Label>BUKU TAMU</Label>
        <Title className="max-w-[18ch]">Gantungkan ucapanmu di sini.</Title>
        <p className="mt-3 mb-12 text-[14px] text-inv-ink/70">Setiap ucapan jadi satu label dalam koleksi kami.</p>
        <Wishes slug={inv.slug} initial={[...wishes, ...inv.sampleWishes]} variant="tags" />
      </Wrap>
    </section>
  );
}

function Closing() {
  return (
    <section className="bg-inv-night py-24 text-center text-inv-paper lg:py-32">
      <Wrap className="flex flex-col items-center">
        <Label className="text-inv-gold-light">{inv.collection.toUpperCase()}</Label>
        <p className="mt-6 max-w-[18ch] font-display text-[clamp(34px,9vw,60px)] leading-[1.08]">
          Terima kasih telah menjadi bagian dari koleksi ini.
        </p>
        <p className="mt-12 font-display text-2xl">
          {inv.groom.name} <span className="italic">&amp;</span> {inv.bride.name}
        </p>
        <p className="mt-2 text-[12px] tracking-[0.2em] text-inv-paper/70">{inv.dateShort}</p>
      </Wrap>
    </section>
  );
}

function Footer() {
  return (
    <footer className="inv-paper py-10">
      <Wrap className="flex flex-col items-start gap-3 sm:flex-row sm:items-center sm:justify-between">
        <p className="font-display text-xl text-inv-accent">{inv.monogram}</p>
        <p className="text-[12px] text-inv-ink/60">
          Dibuat dengan{" "}
          <Link href="/" className="text-inv-accent underline underline-offset-4">
            Sowanan
          </Link>
          <span className="mx-2">/</span>Foto oleh Ricky S di Pexels
        </p>
      </Wrap>
    </footer>
  );
}

export function HendrawanLarasati() {
  return (
    <InvitationShell
      door={{
        kind: "vellum",
        groom: inv.groom.name,
        bride: inv.bride.name,
        number: inv.collection.replace("No. ", "NO. "),
        date: inv.dateShort.replace(/ /g, ""),
        place: inv.place,
        specimen: inv.specimens[1].src,
      }}
      music={inv.music}
      className={`${themeFonts} inv-paper min-h-dvh overflow-x-clip font-body text-inv-ink`}
      style={vars}
    >
      <main>
        <Hero />
        <Couple />
        <StorySection />
        <EventDetails />
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

export { inv as hendrawanLarasatiData };
