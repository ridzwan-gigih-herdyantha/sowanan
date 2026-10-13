import Image, { getImageProps } from "next/image";
import Link from "next/link";
import type { CSSProperties, ReactNode } from "react";
import { CalendarButton } from "@/components/invitation/calendar-button";
import { CopyButton } from "@/components/invitation/copy-button";
import { Extras } from "@/components/invitation/extras";
import { Gallery } from "@/components/invitation/gallery";
import { Greeting } from "@/components/invitation/greeting";
import { QrisDownload } from "@/components/invitation/qris-download";
import { Rsvp } from "@/components/invitation/rsvp";
import { ScrollReveal } from "@/components/invitation/scroll-reveal";
import { InvitationShell } from "@/components/invitation/shell";
import { SutraCountdown } from "@/components/invitation/sutra/countdown";
import { Bow, Flourish, OrnateFrame, Pattern, PhotoCorners, Wreath } from "@/components/invitation/sutra/ornaments";
import { Parallax } from "@/components/invitation/rembulan/parallax";
import { Wishes } from "@/components/invitation/wishes";
import { googleCalendarUrl } from "@/lib/calendar";
import { getWishes } from "@/lib/guestbook";
import { calendarEventOf, type InvitationView } from "@/lib/invitation/view";
import { themeFonts } from "./fonts";

// Sutra: set alat tulis pernikahan kelas atas di layar. Kertas gading, bingkai berhias sampanye, pita satin,
// dan lambang monogram karangan daun. Warna datang dari palet (palette.ts), di sini hanya font.
const vars = {
  "--inv-display": "var(--font-su-display), Georgia, serif",
  "--inv-script": "var(--font-su-script), cursive",
  "--inv-body": "var(--font-su-body), Georgia, serif",
} as CSSProperties;

const enter = (delay: number) => ({ className: "inv-enter", style: { "--enter-delay": `${delay}s` } as CSSProperties });
const button =
  "inline-flex items-center justify-center gap-2 border border-inv-accent px-6 py-3 font-display text-[12px] tracking-[0.24em] text-inv-accent uppercase no-underline transition-colors duration-200 hover:bg-inv-accent hover:text-inv-card";
const card = "bg-inv-card shadow-[0_18px_40px_rgba(60,45,25,.10)]";
const ROMAN = ["I", "II", "III", "IV", "V", "VI", "VII", "VIII", "IX", "X"];

function Wrap({ children, className = "", width = "max-w-[1080px]" }: { children: ReactNode; className?: string; width?: string }) {
  return <div className={`relative mx-auto w-full px-5 sm:px-8 ${width} ${className}`}>{children}</div>;
}

function Label({ children, className = "" }: { children: ReactNode; className?: string }) {
  return <p className={`font-display text-[11px] tracking-[0.34em] text-inv-gold uppercase ${className}`}>{children}</p>;
}

function Heading({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div data-su="rise" className="text-center">
      <Label>{label}</Label>
      <h2 className="mt-4 font-display text-[clamp(32px,7.4vw,50px)] leading-[1.1] text-balance">{children}</h2>
      <Flourish className="mt-6" />
    </div>
  );
}

// Ukuran huruf mengikuti lebar karangan daun supaya monogram selalu muat di dalamnya.
function Monogram({ inv, className = "" }: { inv: InvitationView; className?: string }) {
  return (
    <Wreath className={`@container text-inv-gold ${className}`}>
      <span className="font-display text-[17cqw] tracking-[0.08em] text-inv-accent">{inv.monogram.replace(/\s/g, "")}</span>
    </Wreath>
  );
}

function HeroPhoto({ inv }: { inv: InvitationView }) {
  const common = { alt: `${inv.groom.name} dan ${inv.bride.name}`, fetchPriority: "high" as const };
  const { props: { srcSet: wide } } = getImageProps({ ...common, src: inv.images.heroWide, width: 2400, height: 1600, sizes: "(min-width: 1024px) 520px, 100vw" });
  const { props: { srcSet: tall, ...rest } } = getImageProps({ ...common, src: inv.images.hero, width: 1600, height: 2135, sizes: "(min-width: 1024px) 520px, 100vw" });
  return (
    <picture>
      <source media="(min-width: 760px) and (max-width: 1023px)" srcSet={wide} sizes="100vw" />
      <img {...rest} srcSet={tall} sizes="(min-width: 1024px) 520px, 100vw" alt={common.alt} className="size-full object-cover object-[50%_30%]" />
    </picture>
  );
}

function Hero({ inv }: { inv: InvitationView }) {
  return (
    <section className="inv-paper relative overflow-hidden pt-10 pb-20 lg:pt-20 lg:pb-28">
      <Pattern opacity={0.06} />
      {/* Di HP nama, foto, lalu keterangan, supaya foto sudah terlihat di layar pertama. Di desktop nama dan
          keterangan di kolom kiri, foto di kolom kanan. */}
      <Wrap className="grid items-center gap-8 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)] lg:gap-x-16 lg:gap-y-0">
        <div className="text-center lg:self-end">
          <div {...enter(0.35)} className="inv-enter hidden lg:block">
            <Monogram inv={inv} className="mx-auto mb-6 w-36" />
          </div>
          <Label>Undangan Pernikahan</Label>
          <h1 {...enter(0.5)} className="inv-enter mt-3 font-script text-[clamp(48px,13.5vw,68px)] leading-none text-inv-accent lg:mt-4 lg:text-[clamp(72px,8vw,108px)]">
            {inv.groom.name}
            <span className="my-1 block font-display text-[0.32em] text-inv-gold italic">&amp;</span>
            {inv.bride.name}
          </h1>
        </div>
        <div className="text-center lg:col-start-1 lg:row-start-2 lg:self-start">
          <Flourish className="lg:mt-7" />
          <p className="mt-6 font-display text-[13px] tracking-[0.26em] uppercase">{inv.dateLong}</p>
          <p className="mt-2 text-[16px] text-inv-ink/75 italic">
            {inv.venue.name}, {inv.cityShort}
          </p>
          <Greeting className="mt-6 text-[14px] text-inv-gold" />
        </div>
        <div {...enter(0.6)} className="inv-enter relative row-start-2 mx-auto w-full max-w-[460px] pt-8 lg:col-start-2 lg:row-span-2 lg:row-start-1 lg:max-w-none">
          <Bow className="absolute top-0 left-1/2 z-10 w-24 -translate-x-1/2 drop-shadow-[0_4px_6px_rgba(60,45,25,.25)] sm:w-28" />
          <OrnateFrame corners={false} className={card} inner="p-3 sm:p-4">
            {/* Foto sedikit lebih besar dari bingkainya dan bergeser pelan saat digulir, seperti dilihat dari balik bingkai. */}
            <div className="relative aspect-[4/5] overflow-hidden">
              <Parallax speed={0.08} max={22} className="absolute -inset-[6%]">
                <HeroPhoto inv={inv} />
              </Parallax>
            </div>
          </OrnateFrame>
        </div>
      </Wrap>
      {inv.tagline && (
        <Wrap className="mt-20 text-center lg:mt-24">
          <p className="mx-auto max-w-[28ch] font-display text-[clamp(24px,5.4vw,36px)] leading-snug text-balance italic">{inv.tagline}</p>
          <Flourish className="mt-7" />
        </Wrap>
      )}
    </section>
  );
}

function Cameo({ p, alt }: { p: InvitationView["groom"]; alt: string }) {
  return (
    <div className="flex flex-col items-center text-center">
      <div className="relative pt-6">
        <Bow className="absolute top-0 left-1/2 z-10 w-16 -translate-x-1/2" />
        <div className="rounded-[50%] border border-inv-gold p-2">
          <div className="rounded-[50%] border border-inv-gold-light p-1.5">
            <div className="relative aspect-[4/5] w-[min(56vw,230px)] overflow-hidden rounded-[50%]">
              <Image src={p.photo} alt={alt} fill sizes="230px" className="object-cover object-[50%_28%]" />
            </div>
          </div>
        </div>
      </div>
      <p className="mt-7 font-script text-[clamp(48px,12vw,64px)] leading-none text-inv-accent">{p.name}</p>
      <p className="mt-3 font-display text-[18px] tracking-[0.06em]">{p.full}</p>
      <p className="mt-4 text-[14px] text-inv-gold italic">{p.role}</p>
      <p className="mt-1 max-w-[30ch] text-[15px] leading-relaxed">{p.parents}</p>
    </div>
  );
}

function Couple({ inv }: { inv: InvitationView }) {
  return (
    <section className="inv-wash relative overflow-hidden py-20 lg:py-28">
      <Pattern opacity={0.07} />
      <Wrap>
        <Heading label="Kedua mempelai">Dengan memohon rahmat Tuhan</Heading>
        {inv.honor && <p className="mx-auto mt-8 max-w-[52ch] text-center text-[16px] leading-relaxed italic">{inv.honor}</p>}
        <div className="mt-14 grid items-center gap-10 sm:grid-cols-[1fr_auto_1fr] sm:gap-4">
          <Cameo p={inv.groom} alt={`Foto ${inv.groom.name}`} />
          <p aria-hidden="true" className="text-center font-display text-[56px] leading-none text-inv-gold italic sm:text-[72px]">
            &amp;
          </p>
          <Cameo p={inv.bride} alt={`Foto ${inv.bride.name}`} />
        </div>
      </Wrap>
    </section>
  );
}

function StorySection({ inv }: { inv: InvitationView }) {
  return (
    <section className="inv-paper relative overflow-hidden py-20 lg:py-28">
      <Wrap>
        <Heading label="Cerita kami">Perjalanan sampai hari ini</Heading>
        <ol className="mt-16 grid gap-16 lg:gap-24">
          {inv.story.map((s, i) => (
            <li key={`${s.title}-${i}`} className="grid items-center gap-8 md:grid-cols-2 md:gap-14">
              <div className={`relative mx-auto w-full max-w-[440px] ${i % 2 ? "md:order-2" : ""}`}>
                <div className={`relative bg-inv-card p-3 shadow-[0_14px_30px_rgba(60,45,25,.14)] sm:p-4 ${i % 2 ? "rotate-[1.5deg]" : "-rotate-[1.5deg]"}`}>
                  <PhotoCorners />
                  <div className="relative aspect-[4/3] overflow-hidden">
                    <Image src={s.image} alt={s.title} fill sizes="(min-width: 768px) 440px, 90vw" className="object-cover" />
                  </div>
                </div>
              </div>
              <div className={`text-center md:text-left ${i % 2 ? "md:order-1 md:text-right" : ""}`}>
                <p className="font-display text-[56px] leading-none text-inv-gold-light">{ROMAN[i] ?? i + 1}</p>
                <Label className="mt-3">{s.date}</Label>
                <h3 className="mt-3 font-display text-[clamp(26px,5.6vw,34px)] leading-tight">{s.title}</h3>
                <p className="mt-4 text-[16px] leading-relaxed italic">{s.short}</p>
              </div>
            </li>
          ))}
        </ol>
      </Wrap>
    </section>
  );
}

function Details({ inv }: { inv: InvitationView }) {
  // "Minggu, 14 Februari 2027" dipecah supaya tanggal bisa ditonjolkan di tengah.
  const [weekday, rest = ""] = inv.dateLong.split(", ");
  const [day, ...monthYear] = rest.split(" ");
  return (
    <section className="inv-wash relative overflow-hidden py-20 lg:py-28">
      <Pattern opacity={0.07} />
      <Wrap>
        <Heading label="Waktu dan tempat">Hari yang kami nantikan</Heading>
        <div className="mx-auto mt-12 flex max-w-[560px] items-center gap-4 text-center sm:gap-6">
          <p className="flex-1 border-y border-inv-gold py-2.5 font-display text-[12px] tracking-[0.3em] uppercase">{weekday}</p>
          <p className="font-display text-[clamp(80px,20vw,124px)] leading-none text-inv-accent tabular-nums">{day}</p>
          <p className="flex-1 border-y border-inv-gold py-2.5 font-display text-[12px] tracking-[0.3em] uppercase">{monthYear.join(" ")}</p>
        </div>

        <div className="mx-auto mt-14 grid max-w-[860px] gap-8 sm:grid-cols-2">
          {inv.events.map((e, i) => (
            <OrnateFrame key={e.name} className={`${card} su-lift ${i % 2 ? "sm:rotate-[1deg]" : "sm:-rotate-[1deg]"}`}>
              <div className="px-6 py-12 text-center">
                <Label>{e.name}</Label>
                <p className="mt-5 font-display text-[clamp(30px,6.4vw,40px)] leading-tight tabular-nums">
                  {e.time}
                  {e.until && <span className="text-inv-gold"> &ndash; </span>}
                  {e.until}
                </p>
                <p className="mt-1 font-display text-[12px] tracking-[0.3em] text-inv-gold">{inv.tz}</p>
              </div>
            </OrnateFrame>
          ))}
        </div>

        <OrnateFrame corners={false} className={`mx-auto mt-10 max-w-[860px] ${card}`}>
          <div className="grid md:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
            <div className="relative aspect-[3/2] md:aspect-auto">
              <Image src={inv.images.venue} alt={`Suasana ${inv.venue.name}`} fill sizes="(min-width: 768px) 430px, 100vw" className="object-cover" />
            </div>
            <div className="px-6 py-10 text-center md:px-10 md:text-left">
              <Label>Tempat</Label>
              <p className="mt-4 font-display text-[clamp(26px,5.6vw,34px)] leading-tight">{inv.venue.name}</p>
              <p className="mt-3 text-[15px] leading-relaxed text-inv-ink/80">{inv.venue.address}</p>
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
        </OrnateFrame>
      </Wrap>
    </section>
  );
}

function CountdownSection({ inv }: { inv: InvitationView }) {
  return (
    <section className="inv-paper relative overflow-hidden py-20 lg:py-28">
      <Wrap width="max-w-[760px]">
        <Heading label="Menuju hari bahagia">Menghitung hari</Heading>
        <OrnateFrame className={`mt-12 ${card}`}>
          <div className="px-6 py-12 text-center sm:px-12">
            <SutraCountdown target={inv.date} />
          </div>
        </OrnateFrame>
      </Wrap>
    </section>
  );
}

function GallerySection({ inv }: { inv: InvitationView }) {
  return (
    <section className="inv-wash relative overflow-hidden py-20 lg:py-28">
      <Pattern opacity={0.07} />
      <Wrap>
        <Heading label="Galeri">Lembar-lembar kenangan</Heading>
        <OrnateFrame corners={false} className={`mt-12 ${card}`} inner="p-3 sm:p-6">
          <Gallery photos={inv.gallery} variant="grid" />
        </OrnateFrame>
      </Wrap>
    </section>
  );
}

function RsvpSection({ inv }: { inv: InvitationView }) {
  return (
    <section className="inv-paper relative overflow-hidden py-20 lg:py-28">
      <Pattern opacity={0.06} />
      <Wrap width="max-w-[640px]">
        <OrnateFrame className={card}>
          <div className="px-6 pt-12 pb-16 sm:px-12">
            <div className="text-center">
              <Monogram inv={inv} className="mx-auto w-20" />
              <Label className="mt-5">Mohon balasan</Label>
              <h2 className="mt-3 font-display text-[clamp(30px,7vw,40px)] leading-tight">Konfirmasi kehadiran</h2>
              <Flourish className="mt-5" />
            </div>
            <div className="mt-8">
              <Rsvp slug={inv.slug} deadline={inv.rsvpDeadline} />
            </div>
          </div>
        </OrnateFrame>
      </Wrap>
    </section>
  );
}

// Amplop berlapis motif, dengan lambang monogram sebagai segel di ujung tutupnya.
function Envelope({ inv }: { inv: InvitationView }) {
  return (
    <div aria-hidden="true" className="relative mx-auto aspect-[3/2] w-[min(78vw,340px)] border border-inv-line bg-inv-card shadow-[0_18px_40px_rgba(60,45,25,.12)]">
      <div className="absolute inset-x-0 top-0 h-[58%] overflow-hidden [clip-path:polygon(0_0,100%_0,50%_100%)]">
        <div className="absolute inset-0 bg-inv-wash" />
        <Pattern opacity={0.22} />
      </div>
      <div className="absolute inset-x-0 bottom-0 h-1/2 [clip-path:polygon(0_100%,50%_0,100%_100%)] bg-inv-paper" />
      <Monogram inv={inv} className="absolute top-[58%] left-1/2 w-20 -translate-x-1/2 -translate-y-1/2 rounded-full bg-inv-card" />
    </div>
  );
}

function Gifts({ inv }: { inv: InvitationView }) {
  return (
    <section className="inv-wash relative overflow-hidden py-20 lg:py-28">
      <Pattern opacity={0.07} />
      <Wrap width="max-w-[860px]">
        <Heading label="Tanda kasih">Doa restu Anda sudah lebih dari cukup</Heading>
        <p className="mx-auto mt-8 max-w-[46ch] text-center text-[16px] leading-relaxed italic">Bagi yang ingin memberi tanda kasih, dapat melalui rekening atau QRIS berikut.</p>
        <div className="mt-12">
          <Envelope inv={inv} />
        </div>
        <div className="mt-12 grid gap-6 sm:grid-cols-2">
          {inv.gifts.map((g) => (
            <OrnateFrame key={g.number} className={`${card} su-lift`}>
              <div className="px-6 py-10 text-center">
                <Label>{g.bank}</Label>
                <p className="mt-4 font-display text-[26px] leading-none tabular-nums">{g.number}</p>
                <p className="mt-3 text-[15px] text-inv-ink/80 italic">a.n. {g.holder}</p>
                <div className="mt-5">
                  <CopyButton value={g.number} label={`nomor rekening ${g.holder}`} />
                </div>
              </div>
            </OrnateFrame>
          ))}
          {inv.images.qris && (
            <OrnateFrame className={`${card} sm:col-span-2 sm:mx-auto sm:w-[min(100%,420px)]`}>
              <div className="flex flex-col items-center px-6 py-10 text-center">
                <Label>QRIS</Label>
                <Image src={inv.images.qris} alt="Kode QRIS" width={150} height={150} className="mt-4 size-36" />
                <p className="mt-3 text-[15px]">Pindai dari aplikasi bank atau e-wallet.</p>
                <QrisDownload src={inv.images.qris} slug={inv.slug} />
              </div>
            </OrnateFrame>
          )}
        </div>
        {inv.giftNote && <p className="mt-6 text-center text-[13px] text-inv-gold">{inv.giftNote}</p>}
      </Wrap>
    </section>
  );
}

async function WishesSection({ inv }: { inv: InvitationView }) {
  const wishes = await getWishes(inv.slug);
  return (
    <section className="inv-paper relative overflow-hidden py-20 lg:py-28">
      <Wrap width="max-w-[800px]">
        <Heading label="Doa dan ucapan">Titipkan doa untuk kami</Heading>
        <OrnateFrame className={`mt-12 ${card}`}>
          <div className="px-5 py-10 sm:px-12">
            <Wishes slug={inv.slug} initial={wishes} variant="lined" />
          </div>
        </OrnateFrame>
      </Wrap>
    </section>
  );
}

function Closing({ inv }: { inv: InvitationView }) {
  return (
    <section className="relative overflow-hidden py-24 lg:py-32">
      <Image src={inv.images.closing} alt="" fill sizes="100vw" className="object-cover" />
      <div aria-hidden="true" className="absolute inset-0 bg-inv-paper/40" />
      <Pattern opacity={0.06} />
      <Wrap width="max-w-[640px]">
        <OrnateFrame className={card}>
          <div className="px-6 py-14 text-center sm:px-12">
            <Monogram inv={inv} className="mx-auto w-24" />
            <p className="mx-auto mt-8 max-w-[34ch] text-[17px] leading-relaxed italic">
              Atas kehadiran dan doa restu yang Anda berikan, kami ucapkan terima kasih yang setulus-tulusnya.
            </p>
            <Label className="mt-10">Kami yang berbahagia</Label>
            <p className="mt-4 font-script text-[clamp(48px,13vw,72px)] leading-[1.05] text-inv-accent">
              {inv.groom.name} <span className="font-display text-[0.45em] text-inv-gold italic">&amp;</span> {inv.bride.name}
            </p>
            <Flourish className="mt-7" />
            <p className="mt-5 font-display text-[12px] tracking-[0.3em] uppercase">{inv.dateLong}</p>
          </div>
        </OrnateFrame>
      </Wrap>
    </section>
  );
}

function Footer({ inv }: { inv: InvitationView }) {
  return (
    <footer className="inv-paper py-10">
      <Wrap className="flex flex-col items-center gap-2 text-center">
        <p className="font-display text-[13px] tracking-[0.42em] text-inv-gold">{inv.monogram}</p>
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

export function AryaKirana({ inv }: { inv: InvitationView }) {
  return (
    <InvitationShell
      door={{ kind: "medali", groom: inv.groom.name, bride: inv.bride.name, monogram: inv.monogram, date: inv.dateLong, place: `${inv.venue.name}, ${inv.cityShort}` }}
      music={inv.music}
      className={`${themeFonts} inv-paper min-h-dvh overflow-x-clip font-body text-inv-ink`}
      style={{ ...vars, ...inv.palette, ...inv.fonts }}
    >
      <ScrollReveal attr="su" flag="su-js" />
      <main>
        <Hero inv={inv} />
        <Extras inv={inv} at="hero" />
        {inv.on.couple && <Couple inv={inv} />}
        <Extras inv={inv} at="couple" />
        {inv.on.story && <StorySection inv={inv} />}
        <Extras inv={inv} at="story" />
        {inv.on.event && <Details inv={inv} />}
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
        {inv.on.closing && <Closing inv={inv} />}
        <Extras inv={inv} at="closing" />
      </main>
      <Footer inv={inv} />
    </InvitationShell>
  );
}
