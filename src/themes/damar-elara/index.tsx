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
  return <section className="relative isolate min-h-svh overflow-hidden bg-inv-night text-inv-ink">
    <div className="grid min-h-svh lg:grid-cols-[.82fr_1.18fr]">
      <div className="relative order-2 flex min-h-[72svh] flex-col justify-center px-7 py-16 sm:px-12 lg:order-1 lg:min-h-svh lg:px-[clamp(44px,8vw,120px)] lg:py-24">
        <span aria-hidden="true" className="pointer-events-none absolute top-10 left-7 font-display text-[clamp(110px,22vw,260px)] leading-none text-inv-gold/[.06]">N</span>
        <div className="relative max-w-[660px] border-l border-inv-gold/60 pl-5 sm:pl-8">
          <Label>NOCTURNE · {inv.dateLong}</Label>
          <p className="mt-9 font-display text-[clamp(50px,8vw,100px)] leading-[.9] tracking-[-.04em]">{inv.groom.name}<span className="block py-2 text-[.46em] text-inv-gold">&amp;</span>{inv.bride.name}</p>
          <p className="mt-7 max-w-[36ch] font-display text-[clamp(20px,2.6vw,27px)] leading-snug text-inv-ink/75 italic">{inv.tagline || "Sebuah malam, dua hati, satu janji."}</p>
          <div className="mt-8 flex flex-wrap items-center gap-x-4 gap-y-2 text-[10px] tracking-[.18em] text-inv-gold uppercase"><span>{inv.venue.name}</span><span className="text-inv-accent">✦</span><span>{inv.cityShort}</span></div>
          <Greeting className="mt-7 text-[13px] text-inv-ink/70" />
          <a href="#kisah" className={`${button} mt-8 no-underline`}>Masuk ke cerita <span aria-hidden="true">↓</span></a>
        </div>
        <p className="mt-12 text-[9px] tracking-[.3em] text-inv-ink/45 uppercase">A love letter after dark</p>
      </div>
      <div className="relative order-1 min-h-[46svh] overflow-hidden border-b border-inv-gold/35 lg:order-2 lg:min-h-svh lg:border-b-0 lg:border-l">
        <Image {...inv.frame.hero} src={inv.images.hero} alt={`${inv.groom.name} dan ${inv.bride.name}`} fill priority sizes="(min-width: 1024px) 58vw, 100vw" className="object-cover object-[50%_34%] grayscale" />
        <div aria-hidden="true" className="absolute inset-0 bg-[linear-gradient(180deg,rgba(9,7,8,.03),rgba(9,7,8,.12)_55%,rgba(9,7,8,.75))]" />
        <div aria-hidden="true" className="absolute inset-4 border border-inv-gold/45 sm:inset-7" />
        <div className="absolute right-9 bottom-9 left-9 flex items-end justify-between gap-5 sm:right-14 sm:bottom-14 sm:left-14"><div><Label>STILL NO. 01</Label><p className="mt-2 font-display text-2xl sm:text-3xl">Satu malam untuk dikenang</p></div><span className="font-display text-4xl text-inv-gold/80">{inv.monogram}</span></div>
      </div>
    </div>
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
  return <section id="kisah" className="scroll-mt-8 bg-inv-paper py-20 sm:py-28"><Frame className="max-w-[1320px]"><div className="grid gap-10 lg:grid-cols-[.65fr_1.35fr] lg:gap-16">
    <div className="lg:sticky lg:top-20 lg:self-start"><Label>CATATAN DI ANTARA WAKTU</Label><h2 className="mt-5 max-w-[8ch] font-display text-[clamp(46px,7vw,78px)] leading-[.98]">Sebelum malam ini</h2><p className="mt-6 max-w-[32ch] text-[14px] leading-relaxed text-inv-ink/65">Beberapa bab kecil membawa kami menuju satu janji yang ingin dirayakan bersama.</p><div className="mt-8 flex items-center gap-3 text-[9px] tracking-[.22em] text-inv-gold uppercase"><span className="h-px w-10 bg-inv-gold/70"/>Our story · {String(inv.story.length).padStart(2,"0")} chapters</div></div>
    <ol className="grid gap-5 sm:grid-cols-2">{inv.story.map((s, i) => <li key={`${s.title}-${i}`} className={`group relative isolate flex min-h-[380px] flex-col justify-between overflow-hidden border border-inv-gold/35 bg-inv-night p-6 sm:p-7 ${i === 0 ? "sm:row-span-2 sm:min-h-[560px]" : ""}`}>
      {s.image && <Image src={s.image} alt={s.title} fill sizes="(min-width: 640px) 35vw, 100vw" className="-z-20 object-cover transition-transform duration-700 group-hover:scale-[1.03]" />}
      <div aria-hidden="true" className="absolute inset-0 -z-10 bg-[linear-gradient(180deg,rgba(9,7,8,.2)_0%,rgba(9,7,8,.22)_38%,rgba(9,7,8,.94)_100%)]" />
      <div className="flex items-start justify-between"><Label>CHAPTER 0{i+1}</Label><span className="grid size-10 place-items-center rounded-full border border-inv-gold/60 font-display text-sm text-inv-gold">✦</span></div>
      <div><p className="mb-3 text-[9px] tracking-[.2em] text-inv-gold uppercase">{s.date}</p><h3 className="font-display text-[clamp(30px,4vw,46px)] leading-tight">{s.title}</h3><p className="mt-3 max-w-[44ch] text-[13px] leading-relaxed text-inv-ink/75">{s.long || s.short}</p></div>
    </li>)}</ol>
  </div></Frame></section>;
}

function Event({ inv }: { inv: InvitationView }) {
  const calendar = calendarEventOf(inv);
  return <section id="acara" className="scroll-mt-8 bg-inv-wash py-20 text-inv-ink sm:py-28"><Frame className="max-w-[1320px]">
    <div className="mb-12 flex flex-col justify-between gap-5 border-b border-inv-line pb-7 sm:flex-row sm:items-end"><div><Label>SEBUAH MALAM YANG DINANTI</Label><h2 className="mt-4 font-display text-[clamp(42px,7vw,72px)] leading-none">Saat kita bertemu</h2></div><p className="max-w-[34ch] text-[13px] leading-relaxed text-inv-ink/65">Simpan tanggal ini. Kami menantikan malam yang penuh cerita bersama Anda.</p></div>
    <div className="grid gap-8 lg:grid-cols-[.72fr_1.28fr] lg:items-stretch">
      <div className="relative flex min-h-[360px] flex-col justify-between overflow-hidden border border-inv-gold/45 bg-inv-night p-7 sm:min-h-[460px] sm:p-10"><span aria-hidden="true" className="absolute -right-4 -bottom-20 font-display text-[260px] leading-none text-inv-gold/[.07]">✦</span><div className="relative"><Label>THE WEDDING NIGHT</Label><p className="mt-12 font-display text-[clamp(42px,7vw,76px)] leading-[.95]">{inv.dateLong}</p><p className="mt-5 text-[10px] tracking-[.2em] text-inv-gold uppercase">{inv.cityShort} · {inv.tz}</p></div><div className="relative flex items-end justify-between gap-4 border-t border-inv-line pt-5"><p className="font-display text-2xl">{inv.monogram}</p>{inv.on.countdown && <Countdown target={inv.date} className="grid grid-cols-3 gap-2" cellClassName="min-w-14 border border-inv-line bg-inv-card/60 px-2 py-2 font-display text-xl text-inv-ink [&>span:last-child]:block [&>span:last-child]:font-body [&>span:last-child]:text-[8px] [&>span:last-child]:tracking-[.12em] [&>span:last-child]:text-inv-gold" />}</div></div>
      <div className="flex flex-col border border-inv-line bg-inv-paper">
        <div className="grid divide-y divide-inv-line sm:grid-cols-2 sm:divide-x sm:divide-y-0">{inv.events.map((e, i) => <article key={e.name} className="flex items-center gap-5 p-6 sm:p-7"><span className="font-display text-4xl text-inv-gold/80">0{i+1}</span><div><Label>{e.name}</Label><p className="mt-2 font-display text-2xl">{e.time}{e.until && ` — ${e.until}`}</p><p className="mt-1 text-[10px] text-inv-ink/55">{inv.tz}</p></div></article>)}</div>
        <div className="grid flex-1 border-t border-inv-line md:grid-cols-[.85fr_1.15fr]">
          <div className="relative min-h-[250px] md:min-h-[320px]"><Image {...inv.frame.venue} src={inv.images.venue} alt={`Suasana ${inv.venue.name}`} fill sizes="(min-width: 768px) 35vw, 100vw" className="object-cover grayscale-[.2]" /><span className="absolute top-4 left-4 border border-white/60 bg-inv-night/75 px-3 py-2 text-[9px] tracking-[.2em] text-inv-ink uppercase">THE VENUE</span></div>
          <div className="flex flex-col justify-center p-7 sm:p-9"><Label>TEMPAT PERAYAAN</Label><h3 className="mt-4 font-display text-3xl sm:text-4xl">{inv.venue.name}</h3><p className="mt-3 max-w-[45ch] text-[13px] leading-relaxed text-inv-ink/65">{inv.venue.address}</p><div className="mt-7 flex flex-wrap gap-3">{inv.venue.mapUrl && <a className={button} href={inv.venue.mapUrl} target="_blank" rel="noreferrer">Buka peta</a>}<CalendarButton slug={inv.slug} google={googleCalendarUrl(calendar)} className={button}>Simpan tanggal</CalendarButton></div></div>
        </div>
      </div>
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
  return <InvitationShell door={{ kind: "nocturne", groom: inv.groom.name, bride: inv.bride.name, monogram: inv.monogram, date: inv.dateLong, place: `${inv.venue.name} · ${inv.cityShort}`, photo: inv.images.hero }} music={inv.music} className={`${themeFonts} min-h-dvh overflow-x-clip bg-inv-paper font-body text-inv-ink`} style={style}>
    <main><Hero inv={inv} /><Extras inv={inv} at="hero" />{inv.on.couple && <Couple inv={inv} />}<Extras inv={inv} at="couple" />{inv.on.story && <Story inv={inv} />}<Extras inv={inv} at="story" />{inv.on.event && <Event inv={inv} />}<Extras inv={inv} at="event" />{inv.on.gallery && <GallerySection inv={inv} />}<Extras inv={inv} at="gallery" />{inv.on.rsvp && <section className="bg-inv-wash py-20 sm:py-28"><Frame className="max-w-[650px]"><Heading eyebrow="MOHON BALASAN">Konfirmasi kehadiran</Heading><div className="mt-8 border border-inv-line bg-inv-card p-6 sm:p-10"><Rsvp slug={inv.slug} deadline={inv.rsvpDeadline} /></div></Frame></section>}<Extras inv={inv} at="rsvp" />{inv.on.gifts && <Gifts inv={inv} />}<Extras inv={inv} at="gifts" />{inv.on.wishes && <Guestbook inv={inv} />}<Extras inv={inv} at="wishes" />{inv.on.closing && <Closing inv={inv} />}<Extras inv={inv} at="closing" /></main>
    <footer className="bg-inv-night py-7 text-center text-[10px] tracking-[.18em] text-inv-ink/50 uppercase">Nocturne · <Link href="/" className="text-inv-gold underline underline-offset-4">Sowanan</Link>{inv.credit && <span> · {inv.credit}</span>}</footer>
  </InvitationShell>;
}
