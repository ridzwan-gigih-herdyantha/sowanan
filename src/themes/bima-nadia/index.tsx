import Image from "next/image";
import Link from "next/link";
import type { CSSProperties, ReactNode } from "react";
import { CalendarButton } from "@/components/invitation/calendar-button";
import { CopyButton } from "@/components/invitation/copy-button";
import { Extras } from "@/components/invitation/extras";
import { Gallery } from "@/components/invitation/gallery";
import { Greeting } from "@/components/invitation/greeting";
import { QrisDownload } from "@/components/invitation/qris-download";
import { RembulanCountdown } from "@/components/invitation/rembulan/countdown";
import { moonOf, parseDay } from "@/components/invitation/rembulan/moon";
import { MoonDisc } from "@/components/invitation/rembulan/moon-disc";
import { Parallax } from "@/components/invitation/rembulan/parallax";
import { Starfield } from "@/components/invitation/rembulan/sky";
import { Rsvp } from "@/components/invitation/rsvp";
import { InvitationShell } from "@/components/invitation/shell";
import { Wishes } from "@/components/invitation/wishes";
import { googleCalendarUrl } from "@/lib/calendar";
import { getWishes } from "@/lib/guestbook";
import { calendarEventOf, type InvitationView } from "@/lib/invitation/view";
import { themeFonts } from "./fonts";

// Rembulan: undangan di bawah langit malam. Bulan yang tampil di undangan adalah bulan sungguhan pada malam
// pernikahan, dihitung dari tanggal acara. Warna dari palette.ts, di sini hanya font.
const vars = {
  "--inv-display": "var(--font-rb-display), 'Times New Roman', serif",
  "--inv-body": "var(--font-rb-body), Georgia, serif",
  "--rb-label": "var(--font-rb-label), Georgia, serif",
} as CSSProperties;

const enter = (delay: number) => ({ className: "inv-enter", style: { "--enter-delay": `${delay}s` } as CSSProperties });
const button =
  "rb-label inline-flex items-center justify-center gap-2 rounded-full border border-inv-gold/60 px-6 py-3 text-[12px] tracking-[0.24em] text-inv-ink no-underline transition-[background-color,border-color] duration-300 hover:border-inv-accent hover:bg-inv-accent/10";
const glass = "rounded-sm border border-inv-line bg-inv-card/70 backdrop-blur-sm";

function Wrap({ children, className = "", width = "max-w-[1080px]" }: { children: ReactNode; className?: string; width?: string }) {
  return <div className={`relative mx-auto w-full px-5 sm:px-8 ${width} ${className}`}>{children}</div>;
}

function Label({ children, className = "" }: { children: ReactNode; className?: string }) {
  return <p className={`rb-label text-[11px] tracking-[0.32em] text-inv-gold ${className}`}>{children}</p>;
}

// Pembatas berupa fase bulan dari sabit ke purnama lalu kembali, dipakai di bawah judul section.
const PHASES = [0.12, 0.27, 0.5, 0.73, 0.88];
function Phases({ id, className = "" }: { id: string; className?: string }) {
  return (
    <div aria-hidden="true" className={`flex items-center justify-center gap-3 ${className}`}>
      <span className="h-px w-10 bg-linear-to-r from-transparent to-inv-gold-light" />
      {PHASES.map((a, i) => (
        <MoonDisc key={a} id={`${id}-${i}`} age={a} glow={false} small className={a === 0.5 ? "size-4" : "size-3"} />
      ))}
      <span className="h-px w-10 bg-linear-to-l from-transparent to-inv-gold-light" />
    </div>
  );
}

function Heading({ id, label, children }: { id: string; label: string; children: ReactNode }) {
  return (
    <div className="text-center">
      <Label>{label}</Label>
      <h2 className="mt-4 font-display text-[clamp(36px,8.4vw,58px)] leading-[1.05] text-balance text-inv-ink">{children}</h2>
      <Phases id={id} className="mt-6" />
    </div>
  );
}

function Sky({ children, className = "", wash = false, meteors = false, seed = 3 }: { children: ReactNode; className?: string; wash?: boolean; meteors?: boolean; seed?: number }) {
  return (
    <section className={`relative overflow-hidden ${wash ? "inv-wash" : "inv-paper"} ${className}`}>
      <Starfield density={0.55} meteors={meteors} seed={seed} />
      {children}
    </section>
  );
}

function HeroPhoto({ inv }: { inv: InvitationView }) {
  return (
    <Image
      src={inv.images.hero}
      alt={`${inv.groom.name} dan ${inv.bride.name}`}
      fill
      sizes="(min-width: 1024px) 460px, 80vw"
      fetchPriority="high"
      loading="eager"
      className="object-cover object-[50%_35%]"
    />
  );
}

function Hero({ inv, moon }: { inv: InvitationView; moon: ReturnType<typeof moonOf> }) {
  return (
    <Sky className="pt-14 pb-24 lg:pt-24 lg:pb-32" meteors seed={5}>
      <div aria-hidden="true" className="pointer-events-none absolute inset-x-0 top-0 h-[70%] bg-[radial-gradient(70%_60%_at_50%_0%,color-mix(in_srgb,var(--inv-accent)_9%,transparent),transparent)]" />
      {/* Di HP nama, foto, lalu keterangan. Di desktop nama dan keterangan di kiri, foto di kanan. */}
      <Wrap className="grid items-center gap-12 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)] lg:gap-x-16 lg:gap-y-0">
        <div className="text-center lg:self-end lg:text-left">
          <Label>Undangan Pernikahan</Label>
          <h1 {...enter(0.45)} className="inv-enter mt-5 font-script text-[clamp(54px,15vw,112px)] leading-[0.92] text-inv-ink">
            {inv.groom.name}
            <span className="my-1 block font-body text-[0.38em] text-inv-gold italic lg:my-2">&amp;</span>
            {inv.bride.name}
          </h1>
        </div>
        <div className="text-center lg:col-start-1 lg:row-start-2 lg:self-start lg:text-left">
          <p className="rb-label mt-2 text-[13px] tracking-[0.24em] text-inv-ink/90 lg:mt-8">{inv.dateLong}</p>
          <p className="mt-2 text-[17px] text-inv-ink/70 italic">
            {inv.venue.name}, {inv.cityShort}
          </p>
          <p className="mt-5 inline-flex items-center gap-2.5 rounded-full border border-inv-line px-4 py-2 text-[14px] text-inv-gold italic">
            <MoonDisc id="rb-hero-chip" age={moon.age} glow={false} small className="size-4" />
            {moon.name} di malam pernikahan, {moon.percent}% terang
          </p>
          <Greeting className="mt-6 text-[15px] text-inv-gold" />
        </div>

        {/* Foto di bingkai bulat yang bercahaya seperti bulan, dengan lintasan orbit tipis di sekelilingnya. */}
        <div {...enter(0.6)} className="inv-enter relative row-start-2 mx-auto w-[min(76vw,440px)] lg:col-start-2 lg:row-span-2 lg:row-start-1">
          <div aria-hidden="true" className="rb-glow absolute -inset-[22%] rounded-full" />
          <div aria-hidden="true" className="absolute inset-[-9%] rounded-full border border-inv-line" />
          <div className="relative aspect-square overflow-hidden rounded-full ring-1 ring-inv-accent/50 shadow-[0_0_0_6px_color-mix(in_srgb,var(--inv-accent)_8%,transparent),0_0_60px_6px_color-mix(in_srgb,var(--inv-accent)_38%,transparent),0_0_140px_30px_color-mix(in_srgb,var(--inv-accent)_16%,transparent)]">
            <HeroPhoto inv={inv} />
            <div aria-hidden="true" className="absolute inset-0 bg-[radial-gradient(circle_at_50%_40%,transparent_58%,color-mix(in_srgb,var(--inv-paper)_45%,transparent))]" />
          </div>
        </div>
      </Wrap>
      {inv.tagline && (
        <Wrap className="mt-24 text-center">
          <p className="mx-auto max-w-[26ch] font-display text-[clamp(26px,6vw,40px)] leading-snug text-balance text-inv-ink/90">{inv.tagline}</p>
        </Wrap>
      )}
    </Sky>
  );
}

function Person({ p, alt, id }: { p: InvitationView["groom"]; alt: string; id: string }) {
  return (
    <div className="flex flex-col items-center text-center">
      <div className="relative">
        <div aria-hidden="true" className="absolute -inset-3 rounded-full border border-inv-line" />
        <div className="relative size-[min(58vw,240px)] overflow-hidden rounded-full">
          <Image src={p.photo} alt={alt} fill sizes="240px" className="object-cover object-[50%_28%]" />
        </div>
        <MoonDisc id={id} age={0.5} glow={false} small className="absolute -bottom-1 left-1/2 size-6 -translate-x-1/2" />
      </div>
      <p className="mt-9 font-script text-[clamp(44px,11vw,60px)] leading-none text-inv-ink">{p.name}</p>
      <p className="rb-label mt-4 text-[13px] tracking-[0.14em] text-inv-gold">{p.full}</p>
      <p className="mt-4 text-[15px] text-inv-ink/60 italic">{p.role}</p>
      <p className="mt-1 max-w-[30ch] text-[16px] leading-relaxed text-inv-ink/85">{p.parents}</p>
    </div>
  );
}

function Couple({ inv }: { inv: InvitationView }) {
  return (
    <Sky wash className="py-24 lg:py-32" seed={8}>
      <Wrap>
        <Heading id="rb-couple" label="Kedua mempelai">
          Dua cahaya, satu malam
        </Heading>
        {inv.honor && <p className="mx-auto mt-8 max-w-[52ch] text-center text-[17px] leading-relaxed text-inv-ink/80 italic">{inv.honor}</p>}
        <div className="mt-16 grid items-start gap-14 sm:grid-cols-2 sm:gap-8">
          <Person p={inv.groom} alt={`Foto ${inv.groom.name}`} id="rb-groom" />
          <Person p={inv.bride} alt={`Foto ${inv.bride.name}`} id="rb-bride" />
        </div>
      </Wrap>
    </Sky>
  );
}

function StorySection({ inv }: { inv: InvitationView }) {
  return (
    <Sky className="py-24 lg:py-32" seed={13}>
      <Wrap width="max-w-[960px]">
        <Heading id="rb-story" label="Cerita kami">
          Di bawah bulan yang berganti
        </Heading>
        {/* Garis waktu dengan bulan sungguhan pada tanggal tiap cerita. Tanggal yang tidak terbaca memakai titik biasa. */}
        <ol className="relative mt-16 grid gap-14 before:absolute before:inset-y-2 before:left-4 before:w-px before:bg-inv-line md:before:left-1/2">
          {inv.story.map((s, i) => {
            const day = parseDay(s.date);
            const moon = day ? moonOf(day) : null;
            const right = i % 2 === 1;
            return (
              <li key={`${s.title}-${i}`} className="relative grid gap-6 pl-12 md:grid-cols-2 md:gap-16 md:pl-0">
                <div className="absolute top-1 left-4 -translate-x-1/2 md:left-1/2">
                  {moon ? (
                    <MoonDisc id={`rb-timeline-${i}`} age={moon.age} glow={false} small className="size-8 rounded-full bg-inv-paper" />
                  ) : (
                    <span className="block size-2.5 rounded-full bg-inv-gold" />
                  )}
                </div>
                <div className={`${right ? "md:order-2" : "md:text-right"}`}>
                  <Label>{s.date}</Label>
                  {moon && <p className="mt-1.5 text-[13px] text-inv-gold-light italic">{moon.name} malam itu</p>}
                  <h3 className="mt-3 font-display text-[clamp(28px,6vw,38px)] leading-tight text-inv-ink">{s.title}</h3>
                  <p className="mt-3 text-[16px] leading-relaxed text-inv-ink/80">{s.short}</p>
                </div>
                <div className={right ? "md:order-1" : ""}>
                  <div className="relative aspect-[4/3] overflow-hidden rounded-sm">
                    <Image src={s.image} alt={s.title} fill sizes="(min-width: 768px) 440px, 90vw" className="object-cover" />
                    <div aria-hidden="true" className="absolute inset-0 shadow-[inset_0_0_60px_rgba(0,0,0,.45)]" />
                  </div>
                </div>
              </li>
            );
          })}
        </ol>
      </Wrap>
    </Sky>
  );
}

function Details({ inv, moon }: { inv: InvitationView; moon: ReturnType<typeof moonOf> }) {
  return (
    <Sky wash className="py-24 lg:py-32" meteors seed={21}>
      <Wrap>
        <Heading id="rb-event" label="Waktu dan tempat">
          Malam yang kami nantikan
        </Heading>
        <div className="mx-auto mt-14 flex max-w-[560px] flex-col items-center text-center">
          <Parallax speed={0.2} max={60}>
            <MoonDisc id="rb-event-moon" age={moon.age} className="w-[min(46vw,200px)]" />
          </Parallax>
          <p className="rb-label mt-8 text-[13px] tracking-[0.24em] text-inv-ink/90">{inv.dateLong}</p>
          <p className="mt-2 text-[15px] text-inv-gold italic">
            {moon.name}, {moon.percent}% bulan tampak terang di langit malam itu
          </p>
        </div>

        <div className="mx-auto mt-14 grid max-w-[820px] gap-5 sm:grid-cols-2">
          {inv.events.map((e) => (
            <div key={e.name} className={`${glass} px-6 py-10 text-center`}>
              <Label>{e.name}</Label>
              <p className="mt-5 font-display text-[clamp(34px,7vw,44px)] leading-none text-inv-ink tabular-nums">
                {e.time}
                {e.until && <span className="text-inv-gold-light"> &ndash; </span>}
                {e.until}
              </p>
              <p className="rb-label mt-3 text-[11px] tracking-[0.3em] text-inv-gold-light">{inv.tz}</p>
            </div>
          ))}
        </div>

        <div className={`mx-auto mt-5 grid max-w-[820px] overflow-hidden md:grid-cols-2 ${glass}`}>
          <div className="relative aspect-[3/2] md:aspect-auto">
            <Image src={inv.images.venue} alt={`Suasana ${inv.venue.name}`} fill sizes="(min-width: 768px) 410px, 100vw" className="object-cover" />
            <div aria-hidden="true" className="absolute inset-0 bg-linear-to-t from-inv-card/60 to-transparent md:bg-linear-to-l" />
          </div>
          <div className="px-6 py-10 text-center md:px-10 md:text-left">
            <Label>Tempat</Label>
            <p className="mt-4 font-display text-[clamp(30px,6vw,38px)] leading-tight text-inv-ink">{inv.venue.name}</p>
            <p className="mt-3 text-[16px] leading-relaxed text-inv-ink/75">{inv.venue.address}</p>
            <div className="mt-7 flex flex-wrap justify-center gap-3 md:justify-start">
              {inv.venue.mapUrl && (
                <a href={inv.venue.mapUrl} target="_blank" rel="noopener" className={button}>
                  Lihat peta
                </a>
              )}
              <CalendarButton slug={inv.slug} google={googleCalendarUrl(calendarEventOf(inv))} className={button}>
                Simpan ke kalender
              </CalendarButton>
            </div>
          </div>
        </div>
      </Wrap>
    </Sky>
  );
}

function CountdownSection({ inv }: { inv: InvitationView }) {
  return (
    <Sky className="py-24 lg:py-32" seed={34}>
      <Wrap width="max-w-[760px]">
        <Heading id="rb-count" label="Menuju malam itu">
          Menghitung malam
        </Heading>
        <div className="mt-14">
          <RembulanCountdown target={inv.date} />
        </div>
      </Wrap>
    </Sky>
  );
}

function GallerySection({ inv }: { inv: InvitationView }) {
  return (
    <Sky wash className="py-24 lg:py-32" seed={55}>
      <Wrap>
        <Heading id="rb-gallery" label="Galeri">
          Potongan malam-malam kami
        </Heading>
        <div className="mt-14">
          <Gallery photos={inv.gallery} variant="grid" />
        </div>
      </Wrap>
    </Sky>
  );
}

function RsvpSection({ inv }: { inv: InvitationView }) {
  return (
    <Sky className="py-24 lg:py-32" seed={89}>
      <Wrap width="max-w-[640px]">
        <div className={`${glass} px-6 pt-12 pb-12 sm:px-12`}>
          <div className="text-center">
            <MoonDisc id="rb-rsvp" age={0.5} className="mx-auto w-14" />
            <Label className="mt-6">Mohon balasan</Label>
            <h2 className="mt-3 font-display text-[clamp(32px,7.4vw,44px)] leading-tight text-inv-ink">Konfirmasi kehadiran</h2>
          </div>
          <div className="mt-8">
            <Rsvp slug={inv.slug} deadline={inv.rsvpDeadline} />
          </div>
        </div>
      </Wrap>
    </Sky>
  );
}

function Gifts({ inv }: { inv: InvitationView }) {
  return (
    <Sky wash className="py-24 lg:py-32" seed={144}>
      <Wrap width="max-w-[860px]">
        <Heading id="rb-gift" label="Tanda kasih">
          Doa restu Anda sudah lebih dari cukup
        </Heading>
        <p className="mx-auto mt-8 max-w-[46ch] text-center text-[17px] leading-relaxed text-inv-ink/80 italic">Bagi yang ingin memberi tanda kasih, dapat melalui rekening atau QRIS berikut.</p>
        <div className="mt-12 grid gap-5 sm:grid-cols-2">
          {inv.gifts.map((g) => (
            <div key={g.number} className={`${glass} px-6 py-10 text-center`}>
              <Label>{g.bank}</Label>
              <p className="mt-4 font-display text-[30px] leading-none text-inv-ink tabular-nums">{g.number}</p>
              <p className="mt-3 text-[15px] text-inv-ink/70 italic">a.n. {g.holder}</p>
              <div className="mt-5">
                <CopyButton value={g.number} label={`nomor rekening ${g.holder}`} />
              </div>
            </div>
          ))}
          {inv.images.qris && (
            <div className={`${glass} flex flex-col items-center px-6 py-10 text-center sm:col-span-2 sm:mx-auto sm:w-[min(100%,420px)]`}>
              <Label>QRIS</Label>
              <div className="mt-4 rounded-sm bg-white p-3">
                <Image src={inv.images.qris} alt="Kode QRIS" width={150} height={150} className="size-36" />
              </div>
              <p className="mt-3 text-[15px] text-inv-ink/80">Pindai dari aplikasi bank atau e-wallet.</p>
              <QrisDownload src={inv.images.qris} slug={inv.slug} />
            </div>
          )}
        </div>
        {inv.giftNote && <p className="mt-6 text-center text-[13px] text-inv-gold">{inv.giftNote}</p>}
      </Wrap>
    </Sky>
  );
}

async function WishesSection({ inv }: { inv: InvitationView }) {
  const wishes = await getWishes(inv.slug);
  return (
    <Sky className="py-24 lg:py-32" seed={233}>
      <Wrap width="max-w-[960px]">
        <Heading id="rb-wish" label="Doa dan ucapan">
          Titipkan satu bintang untuk kami
        </Heading>
        <p className="mx-auto mt-6 max-w-[46ch] text-center text-[16px] leading-relaxed text-inv-ink/70 italic">Setiap ucapan menjadi satu bintang di langit ini. Ketuk bintang untuk membacanya.</p>
        <div className="mt-12">
          <Wishes slug={inv.slug} initial={wishes} variant="langit" />
        </div>
      </Wrap>
    </Sky>
  );
}

function Closing({ inv, moon }: { inv: InvitationView; moon: ReturnType<typeof moonOf> }) {
  return (
    <section className="relative overflow-hidden py-28 lg:py-40">
      <Image src={inv.images.closing} alt="" fill sizes="100vw" className="object-cover" />
      <div aria-hidden="true" className="absolute inset-0 bg-linear-to-b from-inv-paper via-inv-paper/75 to-inv-paper" />
      <Starfield density={0.4} meteors seed={377} />
      <Wrap width="max-w-[640px]" className="text-center">
        <Parallax speed={0.25} max={50}>
          <MoonDisc id="rb-close" age={moon.age} className="mx-auto w-28" />
        </Parallax>
        <p className="mx-auto mt-16 max-w-[32ch] font-display text-[clamp(26px,6.4vw,38px)] leading-snug text-balance text-inv-ink">Sampai jumpa di bawah bulan yang sama.</p>
        <p className="mx-auto mt-6 max-w-[40ch] text-[16px] leading-relaxed text-inv-ink/75 italic">
          Atas kehadiran dan doa restu yang Anda berikan, kami ucapkan terima kasih yang setulus-tulusnya.
        </p>
        <Label className="mt-12">Kami yang berbahagia</Label>
        <p className="mt-4 font-script text-[clamp(46px,12vw,72px)] leading-[1.05] text-inv-ink">
          {inv.groom.name} <span className="font-body text-[0.46em] text-inv-gold italic">&amp;</span> {inv.bride.name}
        </p>
        <p className="rb-label mt-6 text-[12px] tracking-[0.3em] text-inv-ink/80">{inv.dateLong}</p>
      </Wrap>
    </section>
  );
}

function Footer({ inv }: { inv: InvitationView }) {
  return (
    <footer className="inv-paper border-t border-inv-line py-10">
      <Wrap className="flex flex-col items-center gap-2 text-center">
        <p className="rb-label text-[13px] tracking-[0.42em] text-inv-gold">{inv.monogram}</p>
        <p className="text-[13px] text-inv-gold-light">
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

export function BimaNadia({ inv }: { inv: InvitationView }) {
  const moon = moonOf(new Date(inv.date));
  return (
    <InvitationShell
      door={{
        kind: "bulan",
        groom: inv.groom.name,
        bride: inv.bride.name,
        date: inv.dateLong,
        place: `${inv.venue.name}, ${inv.cityShort}`,
        moon: `${moon.name} di malam pernikahan`,
      }}
      music={inv.music}
      className={`${themeFonts} inv-paper min-h-dvh overflow-x-clip font-body text-inv-ink`}
      style={{ ...vars, ...inv.palette, ...inv.fonts }}
    >
      <main>
        <Hero inv={inv} moon={moon} />
        <Extras inv={inv} at="hero" />
        {inv.on.couple && <Couple inv={inv} />}
        <Extras inv={inv} at="couple" />
        {inv.on.story && <StorySection inv={inv} />}
        <Extras inv={inv} at="story" />
        {inv.on.event && <Details inv={inv} moon={moon} />}
        <Extras inv={inv} at="event" />
        {inv.on.countdown && <CountdownSection inv={inv} />}
        <Extras inv={inv} at="countdown" />
        {inv.on.gallery && <GallerySection inv={inv} />}
        <Extras inv={inv} at="gallery" />
        {inv.on.rsvp && <RsvpSection inv={inv} />}
        <Extras inv={inv} at="rsvp" />
        {inv.on.gifts && <Gifts inv={inv} />}
        <Extras inv={inv} at="gifts" />
        {inv.on.wishes && <WishesSection inv={inv} />}
        <Extras inv={inv} at="wishes" />
        {inv.on.closing && <Closing inv={inv} moon={moon} />}
        <Extras inv={inv} at="closing" />
      </main>
      <Footer inv={inv} />
    </InvitationShell>
  );
}
