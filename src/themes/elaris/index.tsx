import Image from "next/image";
import Link from "next/link";
import type { CSSProperties, ReactNode } from "react";
import { Countdown } from "@/components/countdown";
import { CalendarButton } from "@/components/invitation/calendar-button";
import { CopyButton } from "@/components/invitation/copy-button";
import { Extras } from "@/components/invitation/extras";
import { Gallery } from "@/components/invitation/gallery";
import { Greeting } from "@/components/invitation/greeting";
import { QrisDownload } from "@/components/invitation/qris-download";
import { Rsvp } from "@/components/invitation/rsvp";
import { InvitationShell } from "@/components/invitation/shell";
import { Wishes } from "@/components/invitation/wishes";
import { getWishes } from "@/lib/guestbook";
import { calendarEventOf, type InvitationView } from "@/lib/invitation/view";
import { googleCalendarUrl } from "@/lib/calendar";
import { themeFonts } from "./fonts";

const vars = {
  "--inv-display": "var(--font-el-display), Georgia, serif",
  "--inv-body": "var(--font-el-body), Arial, sans-serif",
} as CSSProperties;
const btn = "inline-flex items-center justify-center border border-inv-accent px-5 py-3 text-[11px] tracking-[.2em] text-inv-accent uppercase transition-colors hover:bg-inv-accent hover:text-inv-paper";

function Frame({ children, className = "" }: { children: ReactNode; className?: string }) {
  return <div className={`mx-auto w-full max-w-[1080px] px-5 sm:px-8 ${className}`}>{children}</div>;
}

function Kicker({ children }: { children: ReactNode }) {
  return <p className="font-body text-[10px] tracking-[.28em] text-inv-accent uppercase">{children}</p>;
}

function Heading({ overline, children }: { overline: string; children: ReactNode }) {
  return <div className="text-center"><Kicker>{overline}</Kicker><h2 className="mt-3 font-display text-[clamp(34px,7vw,56px)] leading-[1.03]">{children}</h2><div className="mx-auto mt-6 h-px w-16 bg-inv-gold" /></div>;
}

function Hero({ inv }: { inv: InvitationView }) {
  return <section className="relative overflow-hidden bg-inv-paper pb-20 pt-12 sm:pb-28 sm:pt-20">
    <div aria-hidden="true" className="pointer-events-none absolute -right-32 -top-32 size-[420px] rounded-full border border-inv-line/70 sm:size-[600px]" />
    <div aria-hidden="true" className="pointer-events-none absolute -right-20 -top-20 size-[300px] rounded-full border border-inv-line/70 sm:size-[480px]" />
    <Frame className="relative grid items-center gap-10 lg:grid-cols-[.9fr_1.1fr] lg:gap-16">
      <div className="order-2 text-center lg:order-1 lg:text-left">
        <Kicker>UNDANGAN PERNIKAHAN · {inv.dateLong}</Kicker>
        <h1 className="mt-6 font-display text-[clamp(54px,12vw,90px)] leading-[.9] tracking-[-.04em] text-inv-accent">{inv.groom.name}<span className="my-2 block font-body text-[13px] tracking-[.3em] text-inv-gold">&amp;</span>{inv.bride.name}</h1>
        <p className="mx-auto mt-7 max-w-[34ch] font-display text-[22px] italic leading-snug text-inv-ink/75 lg:mx-0">{inv.tagline || "Dengan penuh syukur, kami mengundang Anda."}</p>
        <p className="mt-5 text-[13px] leading-relaxed text-inv-ink/65">{inv.venue.name}<br />{inv.city}</p>
        <Greeting className="mt-6 text-[13px] text-inv-accent" />
        <div className="mt-7 flex flex-wrap justify-center gap-3 lg:justify-start"><a className={btn} href="#acara">Lihat undangan <span aria-hidden="true" className="ml-2">â†“</span></a></div>
      </div>
      <div className="relative order-1 mx-auto w-full max-w-[520px] lg:order-2">
        <div aria-hidden="true" className="absolute -inset-3 border border-inv-gold/70 sm:-inset-5" />
        <div className="relative aspect-[4/5] overflow-hidden bg-inv-wash">
          <Image {...inv.frame.hero} src={inv.images.hero} alt={`${inv.groom.name} dan ${inv.bride.name}`} fill priority sizes="(min-width: 1024px) 48vw, 100vw" className="object-cover" />
          <div aria-hidden="true" className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent" />
          <p className="absolute bottom-5 left-5 text-[10px] tracking-[.25em] text-white uppercase">{inv.monogram}</p>
        </div>
      </div>
    </Frame>
    {inv.quote && <Frame className="relative mt-16 text-center sm:mt-24"><p className="mx-auto max-w-[38ch] font-display text-[clamp(24px,5vw,36px)] italic leading-tight">â€œ{inv.quote}â€</p></Frame>}
  </section>;
}

function Couple({ inv }: { inv: InvitationView }) {
  return <section className="bg-inv-wash py-20 sm:py-28"><Frame><Heading overline="DUA KELUARGA">Dengan memohon restu</Heading>{inv.honor && <p className="mx-auto mt-7 max-w-[56ch] text-center text-[14px] leading-relaxed text-inv-ink/70">{inv.honor}</p>}
    <div className="mt-14 grid items-center gap-10 sm:grid-cols-[1fr_auto_1fr] sm:gap-5">
      {[inv.groom, inv.bride].map((p, i) => <div key={p.name} className={`text-center ${i ? "sm:col-start-3" : ""}`}><div className="relative mx-auto aspect-[4/5] w-[min(64vw,250px)] overflow-hidden rounded-t-full border border-inv-gold p-2"><div className="relative size-full overflow-hidden rounded-t-full"><Image {...p.frame} src={p.photo} alt={p.full || p.name} fill sizes="250px" className="object-cover" /></div></div><h3 className="mt-6 font-display text-[38px] text-inv-accent">{p.name}</h3><p className="mt-2 text-[13px] leading-relaxed text-inv-ink/65">{p.full}<br />{p.parents}</p></div>)}
      <span aria-hidden="true" className="row-start-2 text-center font-display text-5xl italic text-inv-gold sm:col-start-2 sm:row-start-1">&amp;</span>
    </div>
  </Frame></section>;
}

function Story({ inv }: { inv: InvitationView }) {
  if (!inv.story.length) return null;
  return <section className="bg-inv-paper py-20 sm:py-28"><Frame><Heading overline="CATATAN PERJALANAN">Kisah yang membawa kami ke sini</Heading>
    <ol className="mx-auto mt-14 max-w-[780px] divide-y divide-inv-line">{inv.story.map((s, i) => <li key={`${s.title}-${i}`} className="grid gap-5 py-8 sm:grid-cols-[90px_1fr] sm:gap-10"><span className="font-display text-3xl text-inv-gold">{String(i + 1).padStart(2, "0")}</span><div><p className="text-[10px] tracking-[.22em] text-inv-accent uppercase">{s.date} {s.place && `Â· ${s.place}`}</p><h3 className="mt-2 font-display text-3xl">{s.title}</h3><p className="mt-3 max-w-[60ch] text-[14px] leading-relaxed text-inv-ink/70">{s.long || s.short}</p>{s.image && <div className="relative mt-5 aspect-[16/9] max-w-[480px]"><Image src={s.image} alt={s.title} fill sizes="480px" className="object-cover" /></div>}</div></li>)}</ol>
  </Frame></section>;
}

function Event({ inv }: { inv: InvitationView }) {
  const calendar = calendarEventOf(inv);
  return <section id="acara" className="scroll-mt-8 bg-inv-accent py-20 text-inv-paper sm:py-28"><Frame><div className="mx-auto max-w-[850px] text-center"><p className="text-[10px] tracking-[.3em] text-inv-gold-light uppercase">SIMPAN TANGGALNYA</p><p className="mt-5 font-display text-[clamp(38px,8vw,70px)] leading-none">{inv.dayLabel}</p><p className="mt-2 font-body text-[12px] tracking-[.25em] text-inv-gold-light uppercase">{inv.dateLong}</p>
    {inv.on.countdown && <Countdown target={inv.date} className="mx-auto mt-9 grid max-w-[460px] grid-cols-3 gap-3" cellClassName="border border-white/20 px-3 py-4 font-display text-3xl text-inv-paper [&>span:last-child]:font-body [&>span:last-child]:text-inv-gold-light" />}
    <div className="mx-auto mt-12 grid max-w-[760px] gap-4 text-left sm:grid-cols-2">{inv.events.map((e) => <article key={e.name} className="border border-white/20 p-6"><p className="text-[10px] tracking-[.24em] text-inv-gold-light uppercase">{e.name}</p><p className="mt-3 font-display text-3xl">{e.time}{e.until && ` â€” ${e.until}`}</p><p className="mt-1 text-[12px] text-white/70">{inv.tz}</p></article>)}</div>
    <div className="mx-auto mt-8 max-w-[760px] border border-white/20 p-6 text-left sm:p-8"><p className="text-[10px] tracking-[.24em] text-inv-gold-light uppercase">TEMPAT</p><h3 className="mt-3 font-display text-3xl">{inv.venue.name}</h3><p className="mt-2 max-w-[48ch] text-[13px] leading-relaxed text-white/75">{inv.venue.address}</p><div className="mt-6 flex flex-wrap gap-3">{inv.venue.mapUrl && <a className="border border-white/45 px-4 py-3 text-[10px] tracking-[.18em] uppercase" href={inv.venue.mapUrl} target="_blank" rel="noreferrer">Buka peta</a>}<CalendarButton slug={inv.slug} google={googleCalendarUrl(calendar)} className="border border-white/45 px-4 py-3 text-[10px] tracking-[.18em] uppercase">Simpan tanggal</CalendarButton></div></div>
  </div></Frame></section>;
}

function GallerySection({ inv }: { inv: InvitationView }) {
  if (!inv.gallery.length && !inv.couplePhotos.length) return null;
  const photos = inv.gallery.length ? inv.gallery : inv.couplePhotos.map((p) => ({ ...p, w: 1600, h: 1200 }));
  return <section className="bg-inv-wash py-20 sm:py-28"><Frame><Heading overline="KILASAN HARI KAMI">Dalam bingkai kenangan</Heading><div className="mt-12"><Gallery photos={photos} stamp={inv.dateShort} variant="bleed" /></div></Frame></section>;
}

function Gifts({ inv }: { inv: InvitationView }) {
  if (!inv.gifts.length && !inv.images.qris) return null;
  return <section className="bg-inv-wash py-20 sm:py-28"><Frame><Heading overline="TANDA KASIH">Doa Anda hadiah terbaik</Heading><p className="mx-auto mt-5 max-w-[45ch] text-center text-[13px] leading-relaxed text-inv-ink/70">Bila berkenan berbagi tanda kasih, kami menerimanya dengan penuh syukur.</p><div className="mx-auto mt-10 grid max-w-[800px] gap-4 sm:grid-cols-2">{inv.gifts.map((g) => <article key={g.number} className="border border-inv-line bg-inv-card p-6 text-center"><p className="text-[10px] tracking-[.22em] text-inv-accent uppercase">{g.bank}</p><p className="mt-4 font-display text-2xl">{g.number}</p><p className="mt-1 text-[12px] text-inv-ink/65">a.n. {g.holder}</p><div className="mt-4"><CopyButton value={g.number} label={`nomor rekening ${g.holder}`} /></div></article>)}{inv.images.qris && <div className="border border-inv-line bg-inv-card p-6 text-center"><p className="text-[10px] tracking-[.22em] text-inv-accent uppercase">QRIS</p><Image src={inv.images.qris} alt="Kode QRIS" width={160} height={160} className="mx-auto mt-4 size-40" /><QrisDownload src={inv.images.qris} slug={inv.slug} /></div>}</div>{inv.giftNote && <p className="mt-6 text-center text-xs text-inv-ink/65">{inv.giftNote}</p>}</Frame></section>;
}

async function Guestbook({ inv }: { inv: InvitationView }) {
  const wishes = await getWishes(inv.slug);
  return <section className="bg-inv-paper py-20 sm:py-28"><Frame className="max-w-[790px]"><Heading overline="DOA DAN UCAPAN">Sampaikan doa untuk kami</Heading><div className="mt-10 border border-inv-line bg-inv-card p-5 sm:p-10"><Wishes slug={inv.slug} initial={wishes} variant="lined" /></div></Frame></section>;
}

function Closing({ inv }: { inv: InvitationView }) {
  return <section className="relative isolate overflow-hidden bg-inv-accent py-24 text-center text-inv-paper sm:py-32"><Image {...inv.frame.closing} src={inv.images.closing} alt="" fill sizes="100vw" className="-z-20 object-cover opacity-25" /><div aria-hidden="true" className="absolute inset-0 -z-10 bg-inv-accent/80" /><div aria-hidden="true" className="absolute inset-5 border border-white/20 sm:inset-8" /><Frame className="relative max-w-[700px]"><Kicker>TERIMA KASIH</Kicker><p className="mx-auto mt-7 max-w-[38ch] font-display text-[clamp(25px,5vw,38px)] italic leading-snug">Atas kehadiran dan doa yang mengiringi hari bahagia kami.</p><p className="mt-10 font-display text-[clamp(42px,10vw,72px)] leading-none">{inv.groom.name} <span className="text-inv-gold-light">&amp;</span> {inv.bride.name}</p><p className="mt-5 text-[10px] tracking-[.24em] text-inv-gold-light uppercase">{inv.dateLong}</p></Frame></section>;
}

export function Elaris({ inv }: { inv: InvitationView }) {
  return <InvitationShell door={{ kind: "seal", couple: `${inv.groom.name} & ${inv.bride.name}`, monogram: inv.monogram, seal: "/img/elaris-seal.svg" }} music={inv.music} className={`${themeFonts} min-h-dvh overflow-x-clip bg-inv-paper font-body text-inv-ink`} style={{ ...vars, ...inv.palette, ...inv.fonts }}>
    <main><Hero inv={inv} /><Extras inv={inv} at="hero" />{inv.on.couple && <Couple inv={inv} />}<Extras inv={inv} at="couple" />{inv.on.story && <Story inv={inv} />}<Extras inv={inv} at="story" />{inv.on.event && <Event inv={inv} />}<Extras inv={inv} at="event" />{inv.on.gallery && <GallerySection inv={inv} />}<Extras inv={inv} at="gallery" />{inv.on.rsvp && <section className="bg-inv-paper py-20 sm:py-28"><Frame className="max-w-[650px]"><Heading overline="MOHON BALASAN">Konfirmasi kehadiran</Heading><div className="mt-8 border border-inv-line bg-inv-card p-6 sm:p-10"><Rsvp slug={inv.slug} deadline={inv.rsvpDeadline} /></div></Frame></section>}<Extras inv={inv} at="rsvp" />{inv.on.gifts && <Gifts inv={inv} />}<Extras inv={inv} at="gifts" />{inv.on.wishes && <Guestbook inv={inv} />}<Extras inv={inv} at="wishes" />{inv.on.closing && <Closing inv={inv} />}<Extras inv={inv} at="closing" /></main>
    <footer className="bg-inv-paper py-7 text-center text-[10px] tracking-[.18em] text-inv-ink/55 uppercase">Disusun dengan penuh perhatian Â· <Link href="/" className="text-inv-accent underline underline-offset-4">Sowanan</Link>{inv.credit && <span> Â· {inv.credit}</span>}</footer>
  </InvitationShell>;
}
