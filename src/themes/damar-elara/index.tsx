import Image from "next/image";
import Link from "next/link";
import type { CSSProperties, ReactNode } from "react";
import { CalendarButton } from "@/components/invitation/calendar-button";
import { CopyButton } from "@/components/invitation/copy-button";
import { Countdown } from "@/components/countdown";
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
  "--inv-display": "var(--font-nc-display), Georgia, serif",
  "--inv-body": "var(--font-nc-body), Arial, sans-serif",
} as CSSProperties;
const button = "inline-flex items-center justify-center gap-2 border border-inv-gold/60 px-5 py-3 text-[10px] tracking-[.2em] text-inv-ink uppercase transition-colors hover:bg-inv-accent hover:text-white";

function Frame({ children, className = "", style }: { children: ReactNode; className?: string; style?: CSSProperties }) {
  return <div className={`mx-auto w-full max-w-[1160px] px-5 sm:px-8 ${className}`} style={style}>{children}</div>;
}

function Label({ children }: { children: ReactNode }) {
  return <p className="text-[10px] tracking-[.34em] text-inv-gold uppercase">{children}</p>;
}

function Heading({ eyebrow, children }: { eyebrow: string; children: ReactNode }) {
  return <div className="text-center"><Label>{eyebrow}</Label><h2 className="mt-4 font-display text-[clamp(36px,7vw,68px)] leading-[1.02] text-inv-ink">{children}</h2><div className="mx-auto mt-6 h-px w-16 bg-inv-gold" /></div>;
}

function Hero({ inv }: { inv: InvitationView }) {
  return <section className="relative isolate min-h-[88svh] overflow-hidden bg-inv-night text-inv-ink lg:min-h-svh">
    <Image {...inv.frame.hero} src={inv.images.hero} alt={`${inv.groom.name} dan ${inv.bride.name}`} fill priority sizes="100vw" className="-z-20 object-cover object-[50%_36%]" />
    <div aria-hidden="true" className="absolute inset-0 -z-10 bg-[linear-gradient(90deg,rgba(9,7,8,.94)_0%,rgba(9,7,8,.68)_48%,rgba(9,7,8,.12)_100%)] lg:bg-[linear-gradient(90deg,rgba(9,7,8,.86)_0%,rgba(9,7,8,.55)_50%,rgba(9,7,8,.1)_100%)]" />
    <Frame className="flex min-h-[88svh] flex-col justify-end pb-14 pt-24 lg:min-h-svh lg:justify-center lg:pb-24">
      <div className="max-w-[760px] border-l border-inv-gold/70 pl-5 sm:pl-9">
        <Label>UNDANGAN PERNIKAHAN · {inv.dateLong}</Label>
        <h1 className="mt-7 font-display text-[clamp(54px,11vw,118px)] leading-[.98] tracking-[-.04em] text-inv-ink">{inv.groom.name}<span className="mx-3 text-[.55em] text-inv-gold">&amp;</span>{inv.bride.name}</h1>
        <p className="mt-6 max-w-[38ch] font-display text-[clamp(21px,3vw,29px)] leading-snug text-inv-ink/80 italic">{inv.tagline || "Sebuah malam, dua hati, satu janji."}</p>
        <p className="mt-6 text-[12px] tracking-[.18em] text-inv-ink/65 uppercase">{inv.venue.name} · {inv.cityShort}</p>
        <Greeting className="mt-6 text-[13px] text-inv-gold" />
        <a href="#kisah" className={`${button} mt-8 no-underline`}>Jelajahi undangan <span aria-hidden="true">↓</span></a>
      </div>
      <p className="mt-14 text-[9px] tracking-[.3em] text-inv-ink/55 uppercase">Nocturne · A love letter after dark</p>
    </Frame>
  </section>;
}

function Couple({ inv }: { inv: InvitationView }) {
  return <section className="bg-inv-paper py-20 sm:py-28"><Frame><Heading eyebrow="DUA JIWA">Dalam satu cerita</Heading>
    {inv.honor && <p className="mx-auto mt-7 max-w-[56ch] text-center text-[14px] leading-relaxed text-inv-ink/70">{inv.honor}</p>}
    <div className="mx-auto mt-14 grid max-w-[820px] gap-10 sm:grid-cols-[1fr_auto_1fr] sm:items-center sm:gap-7">
      {[inv.groom, inv.bride].map((p, i) => <article key={p.name} className={`text-center ${i ? "sm:col-start-3" : ""}`}>
        <div className="relative mx-auto aspect-[4/5] w-[min(62vw,280px)] overflow-hidden border border-inv-gold/60 p-2"><Image {...p.frame} src={p.photo} alt={p.full || p.name} fill sizes="280px" className="object-cover object-[50%_30%]" /><div aria-hidden="true" className="absolute inset-2 border border-white/30" /></div>
        <h3 className="mt-6 font-display text-[clamp(34px,5vw,52px)] text-inv-ink">{p.name}</h3><p className="mt-2 text-[10px] tracking-[.16em] text-inv-gold uppercase">{p.full}</p><p className="mt-3 text-[13px] leading-relaxed text-inv-ink/65">{p.role} {p.parents}</p>
      </article>)}
      <span aria-hidden="true" className="row-start-2 text-center font-display text-5xl text-inv-gold sm:col-start-2 sm:row-start-1">&amp;</span>
    </div>
  </Frame></section>;
}

function Story({ inv }: { inv: InvitationView }) {
  if (!inv.story.length) return null;
  return <section id="kisah" className="scroll-mt-8 bg-inv-wash py-20 sm:py-28"><Frame><Heading eyebrow="BAB-BAB KECIL">Sebelum malam ini</Heading>
    <ol className="mx-auto mt-14 max-w-[880px]">{inv.story.map((s, i) => <li key={`${s.title}-${i}`} className="grid gap-5 border-t border-inv-line py-8 sm:grid-cols-[150px_1fr] sm:gap-10">
      <div><Label>{s.date}</Label><span className="mt-3 block font-display text-4xl text-inv-gold">0{i + 1}</span></div>
      <div className="grid gap-6 sm:grid-cols-[1fr_220px] sm:items-center"><div><h3 className="font-display text-3xl text-inv-ink">{s.title}</h3><p className="mt-3 max-w-[55ch] text-[14px] leading-relaxed text-inv-ink/70">{s.long || s.short}</p></div>{s.image && <div className="relative aspect-[4/3] overflow-hidden border border-inv-gold/30"><Image src={s.image} alt={s.title} fill sizes="220px" className="object-cover" /></div>}</div>
    </li>)}</ol>
  </Frame></section>;
}

function Event({ inv }: { inv: InvitationView }) {
  const calendar = calendarEventOf(inv);
  return <section id="acara" className="scroll-mt-8 bg-inv-night py-20 text-inv-ink sm:py-28"><Frame><Heading eyebrow="CATAT TANGGALNYA">Malam yang dinanti</Heading>
    {inv.on.countdown && <Countdown target={inv.date} className="mx-auto mt-10 grid max-w-[460px] grid-cols-3 gap-3" cellClassName="border border-inv-line bg-inv-card/70 px-3 py-4 font-display text-3xl text-inv-ink [&>span:last-child]:font-body [&>span:last-child]:text-[10px] [&>span:last-child]:tracking-[.15em] [&>span:last-child]:text-inv-gold" />}
    <div className="mx-auto mt-12 grid max-w-[900px] gap-4 sm:grid-cols-2">{inv.events.map((e) => <article key={e.name} className="border border-inv-line bg-inv-card/50 p-6"><Label>{e.name}</Label><p className="mt-3 font-display text-3xl">{e.time}{e.until && ` — ${e.until}`}</p><p className="mt-2 text-[11px] text-inv-ink/55">{inv.tz}</p></article>)}</div>
    <div className="mx-auto mt-5 grid max-w-[900px] overflow-hidden border border-inv-line md:grid-cols-[.9fr_1.1fr]">
      <div className="relative min-h-[240px]"><Image {...inv.frame.venue} src={inv.images.venue} alt={`Suasana ${inv.venue.name}`} fill sizes="(min-width: 768px) 40vw, 100vw" className="object-cover" /></div>
      <div className="p-7 sm:p-9"><Label>TEMPAT</Label><h3 className="mt-3 font-display text-3xl">{inv.venue.name}</h3><p className="mt-3 text-[13px] leading-relaxed text-inv-ink/65">{inv.venue.address}</p><div className="mt-6 flex flex-wrap gap-3">{inv.venue.mapUrl && <a className={button} href={inv.venue.mapUrl} target="_blank" rel="noreferrer">Buka peta</a>}<CalendarButton slug={inv.slug} google={googleCalendarUrl(calendar)} className={button}>Simpan tanggal</CalendarButton></div></div>
    </div>
  </Frame></section>;
}

function GallerySection({ inv }: { inv: InvitationView }) {
  if (!inv.gallery.length && !inv.couplePhotos.length) return null;
  const photos = inv.gallery.length ? inv.gallery : inv.couplePhotos.map((p) => ({ ...p, w: 1600, h: 1200 }));
  return <section className="bg-inv-paper py-20 sm:py-28"><Frame><Heading eyebrow="FRAGMEN KENANGAN">Cahaya yang tersisa</Heading><div className="mt-12"><Gallery photos={photos} stamp={inv.dateShort} variant="bleed" /></div></Frame></section>;
}

function Gifts({ inv }: { inv: InvitationView }) {
  if (!inv.gifts.length && !inv.images.qris) return null;
  return <section className="bg-inv-wash py-20 sm:py-28"><Frame><Heading eyebrow="TANDA KASIH">Doa kalian berarti</Heading><div className="mx-auto mt-10 grid max-w-[800px] gap-4 sm:grid-cols-2">
    {inv.gifts.map((g) => <article key={g.number} className="border border-inv-line bg-inv-card p-6 text-center"><Label>{g.bank}</Label><p className="mt-4 font-display text-2xl">{g.number}</p><p className="mt-1 text-[12px] text-inv-ink/65">a.n. {g.holder}</p><div className="mt-4"><CopyButton value={g.number} label={`nomor rekening ${g.holder}`} /></div></article>)}
    {inv.images.qris && <div className="border border-inv-line bg-inv-card p-6 text-center"><Label>QRIS</Label><Image src={inv.images.qris} alt="Kode QRIS" width={160} height={160} className="mx-auto mt-4 size-40" /><QrisDownload src={inv.images.qris} slug={inv.slug} /></div>}
  </div>{inv.giftNote && <p className="mt-6 text-center text-xs text-inv-ink/65">{inv.giftNote}</p>}</Frame></section>;
}

async function Guestbook({ inv }: { inv: InvitationView }) {
  const wishes = await getWishes(inv.slug);
  return <section className="bg-inv-paper py-20 sm:py-28"><Frame className="max-w-[790px]" style={{ maxWidth: 790 }}><Heading eyebrow="UCAPAN DAN DOA">Tinggalkan sepatah kata</Heading><div className="mt-10 border border-inv-line bg-inv-card p-5 sm:p-10"><Wishes slug={inv.slug} initial={wishes} variant="lined" desktop="stack-when-empty" /></div></Frame></section>;
}

function Closing({ inv }: { inv: InvitationView }) {
  return <section className="relative isolate overflow-hidden bg-inv-night py-24 text-center text-inv-ink sm:py-32"><Image {...inv.frame.closing} src={inv.images.closing} alt="" fill sizes="100vw" className="-z-20 object-cover opacity-35" /><div aria-hidden="true" className="absolute inset-0 -z-10 bg-inv-night/75" /><Frame className="relative max-w-[700px]"><Label>TERIMA KASIH</Label><p className="mx-auto mt-7 max-w-[38ch] font-display text-[clamp(25px,5vw,38px)] leading-snug text-inv-ink/85 italic">Atas doa dan kehadiran yang menghangatkan malam kami.</p><p className="mt-10 font-display text-[clamp(38px,9vw,72px)] leading-none">{inv.groom.name} <span className="text-inv-gold">&amp;</span> {inv.bride.name}</p><p className="mt-5 text-[10px] tracking-[.24em] text-inv-gold uppercase">{inv.dateLong}</p></Frame></section>;
}

export function Nocturne({ inv }: { inv: InvitationView }) {
  const style = { ...vars, ...inv.palette, ...inv.fonts } as CSSProperties;
  return <InvitationShell door={{ kind: "seal", couple: `${inv.groom.name} & ${inv.bride.name}`, monogram: inv.monogram, seal: "/img/damar-elara-seal.svg" }} music={inv.music} className={`${themeFonts} min-h-dvh overflow-x-clip bg-inv-paper font-body text-inv-ink`} style={style}>
    <main><Hero inv={inv} /><Extras inv={inv} at="hero" />{inv.on.couple && <Couple inv={inv} />}<Extras inv={inv} at="couple" />{inv.on.story && <Story inv={inv} />}<Extras inv={inv} at="story" />{inv.on.event && <Event inv={inv} />}<Extras inv={inv} at="event" />{inv.on.gallery && <GallerySection inv={inv} />}<Extras inv={inv} at="gallery" />{inv.on.rsvp && <section className="bg-inv-wash py-20 sm:py-28"><Frame className="max-w-[650px]"><Heading eyebrow="MOHON BALASAN">Konfirmasi kehadiran</Heading><div className="mt-8 border border-inv-line bg-inv-card p-6 sm:p-10"><Rsvp slug={inv.slug} deadline={inv.rsvpDeadline} /></div></Frame></section>}<Extras inv={inv} at="rsvp" />{inv.on.gifts && <Gifts inv={inv} />}<Extras inv={inv} at="gifts" />{inv.on.wishes && <Guestbook inv={inv} />}<Extras inv={inv} at="wishes" />{inv.on.closing && <Closing inv={inv} />}<Extras inv={inv} at="closing" /></main>
    <footer className="bg-inv-night py-7 text-center text-[10px] tracking-[.18em] text-inv-ink/50 uppercase">Nocturne · <Link href="/" className="text-inv-gold underline underline-offset-4">Sowanan</Link>{inv.credit && <span> · {inv.credit}</span>}</footer>
  </InvitationShell>;
}
