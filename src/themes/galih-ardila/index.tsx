import Image from "next/image";
import Link from "next/link";
import type { CSSProperties, ReactNode } from "react";
import { CalendarButton } from "@/components/invitation/calendar-button";
import { Extras } from "@/components/invitation/extras";
import { Greeting } from "@/components/invitation/greeting";
import { QrisDownload } from "@/components/invitation/qris-download";
import { Rsvp } from "@/components/invitation/rsvp";
import { InvitationShell } from "@/components/invitation/shell";
import { TabloidCountdown } from "@/components/invitation/tabloid/countdown";
import { Atom, Chip, Groovy, Marquee, Panel, Rainbow, Rays, Sticker, Title } from "@/components/invitation/tabloid/pop";

import { GiftTicket } from "@/components/invitation/tabloid/gift-ticket";
import { StickerPlay } from "@/components/invitation/tabloid/sticker-play";
import { CameraGallery } from "@/components/invitation/tabloid/camera";
import { Wishes } from "@/components/invitation/wishes";
import { googleCalendarUrl } from "@/lib/calendar";
import { getWishes } from "@/lib/guestbook";
import { calendarEventOf, type InvitationView } from "@/lib/invitation/view";
import { themeFonts } from "./fonts";

// Kabar Retro No. 27: undangan sebagai tabloid dan poster pop 60 sampai 70-an. Kertas kraft bertekstur, foto
// berwarna asli, panel komik bergaris tebal, sinar matahari, papan catur, pita gelombang, dan pelangi. Teks
// panjang selalu di kotak krem polos supaya tetap mudah dibaca di atas latar yang ramai.
const vars = {
  "--inv-display": "var(--font-tp-display), Georgia, serif",
  "--inv-body": "var(--font-tp-body), 'Helvetica Neue', Arial, sans-serif",
  "--tp-kraft": "url(/img/galih-ardila/kraft.webp)",
  "--tp-krem": "url(/img/galih-ardila/krem.webp)",
} as CSSProperties;

// Nama mempelai memakai font-script supaya add-on ganti font nama tetap berlaku, bawaannya jatuh ke font judul.
const nameFont = "font-script";

function Wrap({ children, className = "" }: { children: ReactNode; className?: string }) {
  return <div className={`relative mx-auto w-full max-w-[560px] px-5 ${className}`}>{children}</div>;
}

type Bg = "kraft" | "krem" | "sun" | "checker" | "pop" | "wash";
function Section({ bg, children, className = "" }: { bg: Bg; children: ReactNode; className?: string }) {
  return <section className={`tp-bg-${bg} relative overflow-hidden py-20 ${className}`}>{children}</section>;
}

// Kotak isi krem bertepi sobek dengan bayangan sablon.
function Note({ children, className = "" }: { children: ReactNode; className?: string }) {
  return <div className={`tp-torn relative bg-inv-card px-5 pt-6 pb-5 text-inv-ink ${className}`}>{children}</div>;
}

function Heading({ children, chip, light }: { children: ReactNode; chip?: string; light?: boolean }) {
  return (
    <div className="text-center">
      {chip && <Chip tone="sun">{chip}</Chip>}
      <Title className={`mt-3 text-[clamp(36px,10vw,48px)] ${light ? "text-inv-card" : "text-inv-accent"}`}>{children}</Title>
    </div>
  );
}

// Cap tanggal ala kamera film lama, misalnya 21 . 08 . 2027 jadi '27 8 21.
function filmStamp(dateShort: string) {
  const [dd, mm, yyyy] = dateShort.split(" . ");
  return `'${yyyy.slice(2)} ${Number(mm)} ${dd}`;
}

function Hero({ inv }: { inv: InvitationView }) {
  return (
    <Section bg="krem" className="pt-12 pb-40">
      <div aria-hidden="true" className="tp-dotfield absolute inset-x-0 top-0 h-96" />
      <Groovy className="inset-x-0 bottom-0 h-36 w-full" />
      <Sticker shape="daisy" fill="card" className="inv-enter [--enter-delay:2.1s] top-20 -left-12 size-36 -rotate-12 md:size-52" />
      <Sticker shape="star" fill="sun" className="inv-enter [--enter-delay:2.3s] top-10 right-16 size-6 md:right-24" />
      <Sticker shape="star" fill="sun" className="inv-enter [--enter-delay:2.4s] top-18 right-7 size-10 md:right-12" />
      <Sticker shape="clover" fill="mint" className="inv-enter [--enter-delay:2.9s] right-3 bottom-44 size-16" />
      <Sticker shape="star" fill="pop" className="inv-enter [--enter-delay:3.0s] bottom-52 left-10 size-5" />
      <Wrap className="flex flex-col items-center text-center">
        <Chip className="inv-enter text-[14px] [--enter-delay:1.05s]">Kabar Retro · No. 27</Chip>
        <p className="tp-label inv-enter mt-3 text-[18px] text-inv-accent [--enter-delay:1.15s]">Undangan pernikahan</p>
        <div className="inv-enter relative isolate mt-12 w-[min(76vw,340px)] [--enter-delay:1.3s] md:w-[420px]">
          <Rays tone="pop2" className="h-[calc(100%+56px)] w-[calc(100%+56px)] rounded-t-full rounded-b-[28px] border-[3px] border-inv-ink" />
          <Panel src={inv.images.hero} frame={inv.frame.hero} alt={`${inv.groom.name} dan ${inv.bride.name}`} sizes="(min-width: 768px) 420px, 76vw" priority round className="aspect-[4/5]" />
          <Sticker shape="scallop" fill="sun" className="inv-enter [--enter-delay:1.6s] -top-4 -right-9 size-24 rotate-12 md:size-28" text="Sah!" textClass="font-display text-[24px] text-inv-accent md:text-[28px]" />
          <Sticker shape="bubble" fill="card" className="inv-enter [--enter-delay:1.75s] top-10 -left-12 size-24 -rotate-6" text="Kami menikah!" textClass="tp-label -mt-3 w-14 text-[14px] text-inv-ink" />
          <Sticker shape="heart" fill="pink" className="inv-enter [--enter-delay:1.9s] -bottom-5 -left-7 size-16 -rotate-12" />
          <Sticker shape="daisy" fill="card" className="inv-enter [--enter-delay:2.0s] -right-6 bottom-1/4 size-14 rotate-12" />
          <Sticker shape="star" fill="sun" className="inv-enter [--enter-delay:2.2s] -bottom-8 right-10 size-9" />
          <Sticker shape="star" fill="card" className="inv-enter [--enter-delay:2.5s] top-1/2 -left-4 size-6" />
          <Atom className="inv-enter [--enter-delay:2.6s] -top-8 left-1/4 size-12" />
        </div>
        <Title as="h1" className={`mt-14 ${nameFont} text-[clamp(52px,16vw,78px)] text-inv-card`}>
          <span className="inv-enter block -rotate-3 text-inv-accent [--enter-delay:1.5s]">{inv.groom.name}</span>
          <span aria-hidden="true" className="inv-enter my-2 flex items-center justify-center gap-3 [--enter-delay:1.65s]">
            <Sticker shape="star" fill="sun" className="relative! size-7" />
            <span className="grid size-14 place-items-center rounded-full border-[3px] border-inv-ink bg-(--tp-sun) pb-1 font-display text-[28px] text-inv-ink shadow-[3px_3px_0_var(--inv-ink)] [-webkit-text-stroke:0] [text-shadow:none]">&amp;</span>
            <Sticker shape="star" fill="sun" className="relative! size-7" />
          </span>
          <span className="sr-only">dan</span>
          <span className="inv-enter block rotate-2 text-inv-gold [--enter-delay:1.8s]">{inv.bride.name}</span>
        </Title>
        <p className="inv-enter mt-6 [--enter-delay:1.95s]">
          <Chip className="text-[16px]">
            {inv.dateLong} · {inv.cityShort}
          </Chip>
        </p>
        <Greeting className="inv-enter mt-5 text-[15px] text-inv-accent [--enter-delay:2.05s]" />
      </Wrap>
    </Section>
  );
}

function Quote({ inv }: { inv: InvitationView }) {
  if (!inv.tagline && !inv.honor) return null;
  return (
    <Section bg="pop" className="py-16">
      <Sticker shape="pinwheel" fill="sun" className="top-6 left-4 size-12" />
      <Sticker shape="daisy" fill="card" className="right-5 bottom-6 size-14" />
      <Wrap>
        <div className="tp-bubble mx-auto max-w-[440px] px-6 py-6 text-center">
          {inv.tagline && <p className="font-display text-[22px] leading-snug text-inv-ink">&ldquo;{inv.tagline}&rdquo;</p>}
          {inv.honor && <p className="mt-3 text-[14px] leading-relaxed text-inv-ink/80">{inv.honor}</p>}
        </div>
      </Wrap>
    </Section>
  );
}

function PlayerCard({ p, alt, tone, tilt }: { p: InvitationView["groom"]; alt: string; tone: "pop" | "pop2"; tilt: string }) {
  return (
    <div className={`tp-card relative bg-inv-card p-2.5 ${tilt}`}>
      <Panel src={p.photo} frame={p.frame} alt={alt} sizes="(min-width: 768px) 340px, 45vw" className="aspect-[4/5]" />
      <div className={`mt-2.5 border-2 border-inv-ink px-3 py-1.5 ${tone === "pop" ? "bg-inv-accent" : "bg-inv-gold"}`}>
        <p className={`${nameFont} font-display text-[26px] leading-tight text-inv-card`}>{p.name}</p>
      </div>
      <p className="tp-label mt-2.5 text-[15px] text-inv-ink">{p.full}</p>
      <p className="mt-1 text-[13px] leading-snug text-inv-ink/80">
        {p.role} {p.parents}
      </p>
    </div>
  );
}

function Couple({ inv }: { inv: InvitationView }) {
  return (
    <Section bg="checker">
      <Sticker shape="daisy" fill="card" className="top-8 left-4 size-14" />
      <Sticker shape="heart" fill="pink" className="top-16 -right-6 size-20 rotate-12" />
      <Sticker shape="star" fill="card" className="bottom-24 left-8 size-5" />
      <Wrap className="md:max-w-[720px]">
        <Heading chip="Para pemeran">Kedua Mempelai</Heading>
        <div className="relative mt-10 mb-16 grid grid-cols-2 gap-4 md:gap-8">
          <PlayerCard p={inv.groom} alt={`Foto ${inv.groom.name}`} tone="pop" tilt="-rotate-2" />
          <PlayerCard p={inv.bride} alt={`Foto ${inv.bride.name}`} tone="pop2" tilt="mt-8 rotate-2" />
          <Sticker shape="heart" fill="pop" className="top-[34%] left-1/2 size-16 -translate-x-1/2 md:size-20" text="&" textClass="-mt-1 font-display text-[22px] text-inv-card md:text-[28px]" />
          <Sticker shape="star" fill="sun" className="right-4 -bottom-20 size-14 rotate-12 md:size-16" />
        </div>
      </Wrap>
    </Section>
  );
}

function StorySection({ inv }: { inv: InvitationView }) {
  return (
    <Section bg="pop">
      <div aria-hidden="true" className="tp-dotfield tp-dotfield-light absolute inset-0" />
      <Sticker shape="star" fill="sun" className="top-10 left-5 size-10" />
      <Sticker shape="pinwheel" fill="sun" className="top-1/3 -right-12 size-32 md:size-40" />
      <Sticker shape="clover" fill="pink" className="bottom-1/4 -left-12 size-32 md:size-40" />
      <Sticker shape="star" fill="card" className="top-24 right-10 size-5" />
      <Wrap>
        <Heading chip="Bab demi bab" light>
          Kisah Kami
        </Heading>
        <ol className="mt-10 grid gap-12">
          {inv.story.map((s, i) => (
            <li key={`${s.title}-${i}`} className="relative">
              <Panel src={s.image} alt={s.title} sizes="520px" className={`aspect-[4/3] ${i % 2 ? "rotate-1" : "-rotate-1"}`}>
                <span className="tp-dots absolute inset-0" aria-hidden="true" />
              </Panel>
              <span className="tp-narrate tp-label absolute top-3 left-3 px-2.5 py-1 text-[16px] text-inv-ink">{s.date}</span>
              <span className="absolute top-3 right-3">
                <Chip tone="sun" className="text-[14px]">
                  Bab {i + 1}/{inv.story.length}
                </Chip>
              </span>
              <Note className="-mt-6 mr-3 ml-3">
                <p className="tp-label text-[22px] leading-none">{s.title}</p>
                <p className="mt-2 text-[15px] leading-relaxed text-inv-ink/85">{s.short}</p>
              </Note>
            </li>
          ))}
        </ol>
      </Wrap>
    </Section>
  );
}

function Details({ inv }: { inv: InvitationView }) {
  return (
    <Section bg="sun">
      <Sticker shape="pinwheel" fill="sun" className="top-6 right-4 size-12" />
      <Sticker shape="daisy" fill="card" className="bottom-10 -left-8 size-24" />
      <Sticker shape="heart" fill="pink" className="top-1/2 right-2 size-9" />
      <Wrap>
        <Marquee className="h-24">
          <Title className="relative text-[clamp(28px,8vw,36px)] text-inv-card">Jadwal Tayang</Title>
        </Marquee>
        <div className="mt-8 grid gap-5">
          {inv.events.map((e, i) => (
            <div key={e.name} className={`tp-letterboard px-5 pt-4 pb-5 text-inv-card ${i % 2 ? "rotate-1" : "-rotate-1"}`}>
              <p className="tp-label text-[15px] text-(--tp-sun)">{inv.dateLong}</p>
              <p className="tp-label mt-1.5 text-[34px] leading-none">{e.name}</p>
              <p className="tp-label mt-2 text-[24px] leading-none text-(--tp-sun)">
                {e.time}
                {e.until && ` – ${e.until}`} {inv.tz}
              </p>
            </div>
          ))}
        </div>
        <Note className="mt-8">
          <div className="tp-card relative mb-4 overflow-hidden">
            <Panel src={inv.images.venue} frame={inv.frame.venue} alt={`Suasana ${inv.venue.name}`} sizes="520px" className="aspect-[16/9]" />
          </div>
          <p className="tp-label text-[22px] leading-none">{inv.venue.name}</p>
          <p className="mt-2 text-[15px] leading-relaxed text-inv-ink/85">{inv.venue.address}</p>
          <div className="mt-5 flex flex-wrap gap-3">
            {inv.venue.mapUrl && (
              <a href={inv.venue.mapUrl} target="_blank" rel="noopener" className="tp-pill tp-label text-[16px] no-underline">
                Petunjuk arah
              </a>
            )}
            <CalendarButton slug={inv.slug} google={googleCalendarUrl(calendarEventOf(inv))} className="tp-pill tp-pill-ghost tp-label text-[16px]">
              Simpan ke kalender
            </CalendarButton>
          </div>
        </Note>
      </Wrap>
    </Section>
  );
}

function CountdownSection({ inv }: { inv: InvitationView }) {
  return (
    <Section bg="kraft" className="pt-14 pb-56">
      <Rainbow className="inset-x-0 -bottom-2 mx-auto h-auto w-[min(110vw,620px)]" />
      <Wrap className="text-center">
        <Sticker shape="clover" fill="mint" className="-top-4 left-0 size-12 -rotate-12" />
        <Heading chip="Menuju hari H">Hitung Mundur</Heading>
        <div className="mt-8">
          <TabloidCountdown target={inv.date} />
        </div>
      </Wrap>
    </Section>
  );
}

function GallerySection({ inv }: { inv: InvitationView }) {
  return (
    <Section bg="wash">
      <Sticker shape="clover" fill="pink" className="top-10 right-5 size-14 rotate-12" />
      <Sticker shape="star" fill="sun" className="top-5 left-1 size-20 -rotate-6 md:top-8 md:left-3 md:size-36" />
      <Sticker shape="star" fill="sun" className="top-28 left-12 size-6 md:top-48 md:left-10 md:size-8" />
      <Sticker shape="star" fill="card" className="top-36 left-5 size-4 md:top-60 md:size-5" />
      <Sticker shape="scallop" fill="sun" className="-bottom-10 -right-10 size-32" />
      <Sticker shape="star" fill="card" className="bottom-20 left-6 size-6" />
      <Wrap>
        <Heading chip="Strip foto" light>Galeri</Heading>
        <CameraGallery photos={inv.gallery} stamp={filmStamp(inv.dateShort)} />
      </Wrap>
    </Section>
  );
}

function RsvpSection({ inv }: { inv: InvitationView }) {
  return (
    <Section bg="checker">
      <Wrap>
        <Note className="pt-8">
          <Sticker shape="burst" fill="pop2" className="-top-12 -right-6 size-28 rotate-12" text="Ditunggu!" textClass="tp-label w-14 text-[16px] text-inv-card" />
          <Chip tone="sun">Kupon balasan</Chip>
          <div className="mt-4">
            <Rsvp slug={inv.slug} deadline={inv.rsvpDeadline} />
          </div>
        </Note>
      </Wrap>
    </Section>
  );
}

function Gifts({ inv }: { inv: InvitationView }) {
  return (
    <Section bg="kraft">
      <Sticker shape="daisy" fill="mint" className="top-28 -left-8 size-20" />
      <Sticker shape="star" fill="sun" className="right-8 bottom-20 size-8" />
      <Wrap>
        <Heading chip="Tanda kasih" light>Kirim Hadiah</Heading>
        <p className="mx-auto mt-5 max-w-[36ch] text-center text-[15px] leading-relaxed text-inv-ink/85">Doa restu Anda sudah lebih dari cukup. Bagi yang ingin memberi tanda kasih, dapat melalui berikut ini.</p>
        <div className="mt-8 grid gap-5">
          {inv.gifts.map((g, i) => (
            <GiftTicket key={g.number} bank={g.bank} number={g.number} holder={g.holder} className={i % 2 ? "rotate-1" : "-rotate-1"} />
          ))}
          {inv.images.qris && (
            <Note className="flex flex-col items-center text-center">
              <p className="tp-label text-[18px]">QRIS</p>
              <Image src={inv.images.qris} alt="Kode QRIS" width={150} height={150} className="mt-3 size-36" />
              <p className="mt-3 text-[14px]">Pindai dari aplikasi bank atau e-wallet.</p>
              <QrisDownload src={inv.images.qris} slug={inv.slug} />
            </Note>
          )}
        </div>
        {inv.giftNote && <p className="mx-auto mt-6 max-w-[34ch] text-center text-[13px] text-inv-ink/70">{inv.giftNote}</p>}
        <Sticker shape="burst" fill="pop" className="-top-14 -right-1 size-24 rotate-12" text="Terima kasih!" textClass="tp-label w-14 text-[15px] text-inv-card" />
      </Wrap>
    </Section>
  );
}

async function WishesSection({ inv }: { inv: InvitationView }) {
  const wishes = await getWishes(inv.slug);
  return (
    <Section bg="krem">
      <div aria-hidden="true" className="tp-dotfield absolute inset-x-0 top-0 h-80" />
      <Wrap>
        <Sticker shape="bubble" fill="pop" className="-top-6 right-0 size-16 rotate-6" text="Hai!" textClass="tp-label -mt-3 text-[14px] text-inv-card" />
        <Heading chip="Kata mereka">Ucapan &amp; Doa</Heading>
        <Note className="mt-10">
          <Wishes slug={inv.slug} initial={wishes} variant="lined" />
        </Note>
      </Wrap>
    </Section>
  );
}

function Closing({ inv }: { inv: InvitationView }) {
  return (
    <Section bg="kraft" className="isolate pb-48">
      <Groovy className="inset-x-0 bottom-0 z-10 h-32 w-full" />
      <Wrap className="flex flex-col items-center text-center">
        <div className="relative isolate w-[min(82vw,360px)] md:w-[440px]">
          <Rays tone="pop2" />
          <Panel src={inv.images.closing} frame={inv.frame.closing} alt="" sizes="(min-width: 768px) 440px, 82vw" round className="aspect-[4/5] rotate-2" />
          <Sticker shape="heart" fill="pink" className="-top-2 -right-3 size-16 rotate-12" />
          <Sticker shape="daisy" fill="card" className="bottom-2 -left-4 size-14" />
          <Sticker shape="star" fill="sun" className="top-6 -left-8 size-7" />
          <Sticker shape="pinwheel" fill="sun" className="-right-10 bottom-16 size-20" />
        </div>
        <Title className="relative z-10 mt-10 text-[clamp(44px,13vw,60px)] text-inv-card">Tamat?</Title>
        <p className="relative z-10 mt-2">
          <Chip className="text-[16px]">Baru dimulai</Chip>
        </p>
        <Note className="z-10 mt-8 w-full">
          <p className="text-[15px] leading-relaxed">Atas kehadiran dan doa restu yang Anda berikan, kami ucapkan terima kasih yang setulus-tulusnya.</p>
          <p className="tp-label mt-5 text-[15px] text-inv-accent">Kami yang berbahagia</p>
          <p className={`${nameFont} font-display mt-1 text-[32px] leading-tight`}>
            {inv.groom.name} &amp; {inv.bride.name}
          </p>
        </Note>
      </Wrap>
    </Section>
  );
}

function Footer({ inv }: { inv: InvitationView }) {
  return (
    <footer className="tp-bg-ink py-10 text-inv-card">
      <Wrap className="flex flex-col items-center gap-2 text-center">
        <p className="tp-label text-[16px] tracking-[0.3em]">{inv.monogram}</p>
        <p className="text-[12px] opacity-80">
          Dibuat dengan{" "}
          <Link href="/" className="text-inv-card underline underline-offset-4">
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

export function GalihArdila({ inv }: { inv: InvitationView }) {
  return (
    <InvitationShell
      door={{ kind: "tabloid", groom: inv.groom.name, bride: inv.bride.name, date: inv.dateShort, photo: inv.images.heroWide, frame: inv.frame.heroWide }}
      music={inv.music}
      className={`${themeFonts} tp-theme tp-bg-krem min-h-dvh overflow-x-clip font-body text-inv-ink`}
      style={{ ...vars, ...inv.palette, ...inv.fonts }}
    >
      <StickerPlay />
      <main>
        <Hero inv={inv} />
        <Quote inv={inv} />
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
