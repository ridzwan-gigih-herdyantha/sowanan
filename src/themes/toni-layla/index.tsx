import Image from "next/image";
import Link from "next/link";
import type { CSSProperties, ReactNode } from "react";
import { CalendarButton } from "@/components/invitation/calendar-button";
import { CopyButton } from "@/components/invitation/copy-button";
import { Extras } from "@/components/invitation/extras";
import { Gallery } from "@/components/invitation/gallery";
import { LensaCountdown } from "@/components/invitation/lensa/countdown";
import { FitText } from "@/components/invitation/lensa/fit";
import { LensaPhoto, SCRIM } from "@/components/invitation/lensa/photo";
import { QrisDownload } from "@/components/invitation/qris-download";
import { Rsvp } from "@/components/invitation/rsvp";
import { InvitationShell } from "@/components/invitation/shell";
import { Wishes } from "@/components/invitation/wishes";
import { googleCalendarUrl } from "@/lib/calendar";
import { getWishes } from "@/lib/guestbook";
import { calendarEventOf, type InvitationView } from "@/lib/invitation/view";
import { themeFonts } from "./fonts";

// Lensa: minimalis dengan satu judul besar dan foto layar penuh. Pembukanya foto buram yang menajam, dan setiap
// teks berpindah ke tempatnya di hero. Warna dari palette.ts, di sini hanya font.
const vars = {
  "--inv-display": "var(--font-ls-display), 'Arial Black', sans-serif",
  "--inv-body": "var(--font-ls-body), 'Helvetica Neue', Arial, sans-serif",
} as CSSProperties;

const big = "font-display font-extrabold uppercase leading-[0.86] tracking-[-0.01em] [font-stretch:112%]";
const button =
  "inline-flex items-center justify-center border border-inv-ink px-6 py-3.5 text-[12px] font-semibold tracking-[0.24em] text-inv-ink uppercase no-underline transition-colors duration-200 hover:bg-inv-ink hover:text-inv-paper";

function Wrap({ children, className = "" }: { children: ReactNode; className?: string }) {
  return <div className={`mx-auto w-full max-w-[1240px] px-5 sm:px-[6vw] ${className}`}>{children}</div>;
}

function Label({ children, className = "" }: { children: ReactNode; className?: string }) {
  return <p className={`text-[11px] font-semibold tracking-[0.26em] text-inv-gold uppercase ${className}`}>{children}</p>;
}

// Judul section: label kecil di atas, judul besar rata kiri, garis tipis selebar isi di bawahnya.
function Heading({ label, children, className = "" }: { label: string; children: ReactNode; className?: string }) {
  return (
    <div className={`border-b border-inv-line pb-6 ${className}`}>
      <Label>{label}</Label>
      <h2 className={`${big} mt-4 text-[clamp(44px,10vw,124px)] text-balance`}>{children}</h2>
    </div>
  );
}

// Hero adalah posisi akhir pembuka. Elemen data-ls-target dibaca pembuka sebagai tujuan perpindahan teks,
// jadi susunannya harus tetap satu baris dan berjarak baris rapat.
function Hero({ inv }: { inv: InvitationView }) {
  return (
    <section className="relative h-svh min-h-[560px] overflow-hidden bg-inv-night text-white">
      <LensaPhoto portrait={inv.images.hero} wide={inv.images.heroWide} alt={`${inv.groom.name} dan ${inv.bride.name}`} priority />
      <div aria-hidden="true" className="absolute inset-0" style={{ background: SCRIM }} />
      <div className="relative flex h-full flex-col justify-between px-6 pt-[max(28px,5vh)] pb-[max(96px,10vh)] sm:px-[6vw] sm:pb-[max(104px,12vh)]">
        <div className="flex items-start justify-between gap-6">
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-3">
              <p data-ls-target="city" className="font-display text-[clamp(18px,4.6vw,24px)] leading-[0.82] font-extrabold uppercase [font-stretch:112%]">
                {inv.headline}
              </p>
              <span aria-hidden="true" className="h-4 w-px bg-white/60 sm:hidden" />
              <p data-ls-target="mono" className="font-display text-[clamp(16px,4vw,20px)] leading-none font-extrabold tracking-[0.12em] uppercase [font-stretch:112%] sm:hidden">
                {inv.monogram}
              </p>
            </div>
            {/* Nama memakai serif miring sebesar ruang yang ada, dibatasi supaya tidak menelan foto. */}
            <h1 className="mt-3 w-full sm:mt-4">
              <FitText data-ls-target="names" max={152} className="leading-[0.95] font-medium tracking-[-0.01em] italic [font-family:var(--font-ls-script),Didot,Georgia,serif]">
                {`${inv.groom.name} & ${inv.bride.name}`}
              </FitText>
            </h1>
          </div>
          <p data-ls-target="mono" className="hidden font-display text-[20px] leading-none font-extrabold tracking-[0.12em] uppercase [font-stretch:112%] sm:block">
            {inv.monogram}
          </p>
        </div>
        <p data-ls-target="date" className="self-center text-[clamp(17px,4.4vw,20px)] leading-none sm:self-end">
          {inv.dateLong}
        </p>
      </div>
    </section>
  );
}

function Intro({ inv }: { inv: InvitationView }) {
  if (!inv.tagline && !inv.honor) return null;
  return (
    <section className="inv-paper py-24 lg:py-36">
      <Wrap>
        {inv.tagline && <p className="max-w-[18ch] text-[clamp(32px,6.4vw,72px)] leading-[1.05] text-balance">{inv.tagline}</p>}
        {inv.honor && <p className="mt-10 max-w-[52ch] text-[17px] leading-relaxed text-inv-gold sm:ml-auto sm:text-right">{inv.honor}</p>}
      </Wrap>
    </section>
  );
}

function Person({ p, alt, label }: { p: InvitationView["groom"]; alt: string; label: string }) {
  return (
    <figure>
      <div className="relative aspect-[4/5] overflow-hidden bg-inv-wash">
        <Image src={p.photo} alt={alt} fill sizes="(min-width: 768px) 45vw, 90vw" className="object-cover object-[50%_25%]" />
      </div>
      <figcaption className="mt-6">
        <Label>{label}</Label>
        <p className={`${big} mt-3 text-[clamp(48px,9vw,104px)]`}>{p.name}</p>
        <p className="mt-4 text-[18px]">{p.full}</p>
        <p className="mt-3 text-[15px] leading-relaxed text-inv-gold">
          {p.role} {p.parents}
        </p>
      </figcaption>
    </figure>
  );
}

function Couple({ inv }: { inv: InvitationView }) {
  return (
    <section className="inv-paper py-24 lg:py-36">
      <Wrap>
        <Heading label="Kedua mempelai">Kami berdua</Heading>
        <div className="mt-12 grid gap-16 md:grid-cols-2 md:gap-10">
          <Person p={inv.groom} alt={`Foto ${inv.groom.name}`} label="Mempelai pria" />
          <div className="md:mt-32">
            <Person p={inv.bride} alt={`Foto ${inv.bride.name}`} label="Mempelai wanita" />
          </div>
        </div>
      </Wrap>
    </section>
  );
}

// Tahun diambil dari akhir tanggal cerita, misalnya "14.02.2019" menjadi 2019.
const yearOf = (date: string) => /(\d{4})\s*$/.exec(date)?.[1] ?? date;

function StorySection({ inv }: { inv: InvitationView }) {
  return (
    <section className="inv-wash py-24 lg:py-36">
      <Wrap>
        <Heading label="Cerita kami">Sampai di sini</Heading>
        <ol>
          {inv.story.map((s, i) => (
            <li key={`${s.title}-${i}`} className="grid gap-6 border-b border-inv-line py-12 md:grid-cols-[minmax(0,3fr)_minmax(0,4fr)_minmax(0,5fr)] md:gap-12">
              <p className={`${big} text-[clamp(56px,6.2vw,84px)] text-inv-accent tabular-nums`}>{yearOf(s.date)}</p>
              <div>
                <Label>{s.date}</Label>
                <h3 className="mt-3 text-[clamp(26px,3.4vw,36px)] leading-tight">{s.title}</h3>
                <p className="mt-4 text-[16px] leading-relaxed text-inv-ink/75">{s.short}</p>
              </div>
              <div className="relative aspect-[3/2] overflow-hidden bg-inv-paper">
                <Image src={s.image} alt={s.title} fill sizes="(min-width: 768px) 40vw, 90vw" className="object-cover" />
              </div>
            </li>
          ))}
        </ol>
      </Wrap>
    </section>
  );
}

function Details({ inv }: { inv: InvitationView }) {
  const [day, month] = inv.dayMonth.split(".");
  const year = inv.date.slice(0, 4);
  return (
    <section className="inv-paper py-24 lg:py-36">
      <Wrap>
        <Label>Waktu dan tempat</Label>
        {/* Tanggal sebagai judul, sebesar judul kota di hero. */}
        <p className={`${big} mt-4 text-[clamp(60px,16vw,208px)] tabular-nums`}>
          {day}.{month}
          <span className="text-inv-gold-light">.{year.slice(2)}</span>
        </p>
        <p className="mt-5 border-b border-inv-line pb-6 text-[18px]">{inv.dateLong}</p>

        <ul>
          {inv.events.map((e) => (
            <li key={e.name} className="flex flex-wrap items-baseline justify-between gap-x-8 gap-y-2 border-b border-inv-line py-7">
              <p className="text-[clamp(26px,4vw,40px)] leading-tight">{e.name}</p>
              <p className={`${big} text-[clamp(26px,4.4vw,48px)] tabular-nums`}>
                {e.time}
                {e.until && <span className="text-inv-gold-light"> &ndash; {e.until}</span>}
                <span className="ml-3 align-middle font-body text-[13px] font-semibold tracking-[0.2em] text-inv-gold [font-stretch:100%]">{inv.tz}</span>
              </p>
            </li>
          ))}
        </ul>

        <div className="mt-14 grid gap-8 md:grid-cols-[minmax(0,7fr)_minmax(0,5fr)] md:items-end md:gap-10">
          <div className="relative aspect-[3/2] overflow-hidden bg-inv-wash">
            <Image src={inv.images.venue} alt={`Suasana ${inv.venue.name}`} fill sizes="(min-width: 768px) 55vw, 90vw" className="object-cover" />
          </div>
          <div>
            <Label>Tempat</Label>
            <p className="mt-4 text-[clamp(28px,3.6vw,40px)] leading-tight">{inv.venue.name}</p>
            <p className="mt-3 text-[16px] leading-relaxed text-inv-ink/75">{inv.venue.address}</p>
            <div className="mt-8 flex flex-wrap gap-3">
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
    </section>
  );
}

function CountdownSection({ inv }: { inv: InvitationView }) {
  return (
    <section className="bg-inv-night py-24 text-inv-paper lg:py-32">
      <Wrap>
        <Label className="text-inv-paper/60">Menuju hari itu</Label>
        <div className="mt-8">
          <LensaCountdown target={inv.date} />
        </div>
      </Wrap>
    </section>
  );
}

function GallerySection({ inv }: { inv: InvitationView }) {
  return (
    <section className="inv-paper py-24 lg:py-36">
      <Wrap>
        <Heading label="Galeri">Potongan kecil</Heading>
        <div className="mt-12">
          <Gallery photos={inv.gallery} variant="grid" />
        </div>
      </Wrap>
    </section>
  );
}

function RsvpSection({ inv }: { inv: InvitationView }) {
  return (
    <section className="inv-wash py-24 lg:py-36">
      <Wrap className="grid gap-12 md:grid-cols-[minmax(0,5fr)_minmax(0,6fr)] md:gap-16">
        <div>
          <Label>Konfirmasi kehadiran</Label>
          <h2 className={`${big} mt-4 text-[clamp(44px,8vw,104px)]`}>RSVP</h2>
        </div>
        <Rsvp slug={inv.slug} deadline={inv.rsvpDeadline} />
      </Wrap>
    </section>
  );
}

function Gifts({ inv }: { inv: InvitationView }) {
  return (
    <section className="inv-paper py-24 lg:py-36">
      <Wrap>
        <Heading label="Tanda kasih">Doa restu cukup</Heading>
        <p className="mt-8 max-w-[46ch] text-[17px] leading-relaxed text-inv-ink/75">Bagi yang ingin memberi tanda kasih, dapat melalui rekening atau QRIS berikut.</p>
        <ul className="mt-6">
          {inv.gifts.map((g) => (
            <li key={g.number} className="grid gap-4 border-b border-inv-line py-8 sm:grid-cols-[minmax(0,3fr)_minmax(0,5fr)_auto] sm:items-center">
              <Label>{g.bank}</Label>
              <div>
                <p className={`${big} text-[clamp(26px,4vw,40px)] tabular-nums`}>{g.number}</p>
                <p className="mt-2 text-[15px] text-inv-gold">a.n. {g.holder}</p>
              </div>
              <CopyButton value={g.number} label={`nomor rekening ${g.holder}`} />
            </li>
          ))}
        </ul>
        {inv.images.qris && (
          <div className="mt-10 flex flex-wrap items-center gap-8">
            <div className="bg-white p-3">
              <Image src={inv.images.qris} alt="Kode QRIS" width={150} height={150} className="size-36" />
            </div>
            <div>
              <Label>QRIS</Label>
              <p className="mt-3 text-[15px]">Pindai dari aplikasi bank atau e-wallet.</p>
              <QrisDownload src={inv.images.qris} slug={inv.slug} />
            </div>
          </div>
        )}
        {inv.giftNote && <p className="mt-8 text-[13px] text-inv-gold">{inv.giftNote}</p>}
      </Wrap>
    </section>
  );
}

async function WishesSection({ inv }: { inv: InvitationView }) {
  const wishes = await getWishes(inv.slug);
  return (
    <section className="inv-wash py-24 lg:py-36">
      <Wrap>
        <Heading label="Doa dan ucapan">Kirim pesan</Heading>
        <div className="mt-12">
          <Wishes slug={inv.slug} initial={wishes} variant="lined" />
        </div>
      </Wrap>
    </section>
  );
}

// Penutup memakai bahasa yang sama dengan hero: foto penuh dan judul kota besar.
function Closing({ inv }: { inv: InvitationView }) {
  return (
    <section className="relative flex min-h-svh items-end overflow-hidden bg-inv-night text-white">
      <Image src={inv.images.closing} alt="" fill sizes="100vw" className="object-cover" />
      <div aria-hidden="true" className="absolute inset-0 bg-linear-to-t from-black/70 via-black/25 to-black/10" />
      <Wrap className="relative pt-32 pb-[max(96px,12vh)]">
        <p className="max-w-[40ch] text-[16px] leading-relaxed text-white/85">
          Atas kehadiran dan doa restu yang Anda berikan, kami ucapkan terima kasih yang setulus-tulusnya.
        </p>
        <p className="mt-8">
          <FitText className={big}>{inv.headline}</FitText>
        </p>
        <div className="mt-6 flex flex-wrap items-baseline justify-between gap-4 border-t border-white/40 pt-5">
          <p className="text-[clamp(24px,3.4vw,36px)]">
            {inv.groom.name} &amp; {inv.bride.name}
          </p>
          <p className="text-[16px]">{inv.dateLong}</p>
        </div>
      </Wrap>
    </section>
  );
}

function Footer({ inv }: { inv: InvitationView }) {
  return (
    <footer className="inv-paper py-10">
      <Wrap className="flex flex-wrap items-center justify-between gap-3 text-[13px] text-inv-gold">
        <p className="font-display font-extrabold tracking-[0.12em] text-inv-ink uppercase [font-stretch:112%]">{inv.monogram}</p>
        <p>
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

export function ToniLayla({ inv }: { inv: InvitationView }) {
  return (
    <InvitationShell
      door={{
        kind: "lensa",
        headline: inv.headline,
        groom: inv.groom.name,
        bride: inv.bride.name,
        monogram: inv.monogram,
        date: inv.dateLong,
        portrait: inv.images.hero,
        wide: inv.images.heroWide,
      }}
      music={inv.music}
      className={`${themeFonts} inv-paper min-h-dvh overflow-x-clip font-body text-inv-ink`}
      style={{ ...vars, ...inv.palette, ...inv.fonts }}
    >
      <main>
        <Hero inv={inv} />
        <Intro inv={inv} />
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
