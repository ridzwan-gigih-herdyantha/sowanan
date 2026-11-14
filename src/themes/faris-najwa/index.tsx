import Image from "@/components/invitation/photo";
import Link from "next/link";
import type { CSSProperties, ReactNode } from "react";
import { CalendarButton } from "@/components/invitation/calendar-button";
import { CopyButton } from "@/components/invitation/copy-button";
import { Extras } from "@/components/invitation/extras";
import { Gallery } from "@/components/invitation/gallery";
import { Greeting } from "@/components/invitation/greeting";
import { QrisDownload } from "@/components/invitation/qris-download";
import { Rsvp } from "@/components/invitation/rsvp";
import { InvitationShell } from "@/components/invitation/shell";
import { Wishes } from "@/components/invitation/wishes";
import { Countdown } from "@/components/countdown";
import { getWishes } from "@/lib/guestbook";
import { hijri } from "@/lib/hijri";
import { calendarEventOf, type InvitationView } from "@/lib/invitation/view";
import { googleCalendarUrl } from "@/lib/calendar";
import { themeFonts } from "./fonts";
import { Arch, Hias, Pattern, Pita, star8 } from "@/components/invitation/sakinah/ornaments";

const vars = {
  "--inv-display": "var(--font-fw-display), Georgia, serif",
  "--inv-body": "var(--font-fw-body), Arial, sans-serif",
  "--inv-arab": "var(--font-fw-arab), 'Amiri', serif",
} as CSSProperties;

const button = "inline-flex items-center justify-center gap-2 border border-inv-accent/60 px-5 py-3 text-[11px] tracking-[.18em] text-inv-accent uppercase transition-colors hover:bg-inv-accent hover:text-inv-paper";

function Frame({ children, className = "" }: { children: ReactNode; className?: string }) {
  return <div className={`relative mx-auto w-full max-w-[1120px] px-5 sm:px-8 ${className}`}>{children}</div>;
}

function Label({ children, light = false }: { children: ReactNode; light?: boolean }) {
  return <p className={`text-[10px] tracking-[.27em] uppercase ${light ? "text-inv-gold-light" : "text-inv-accent"}`}>{children}</p>;
}

function Heading({ kicker, arabic, children, light = false }: { kicker: string; arabic: string; children: ReactNode; light?: boolean }) {
  return <div className="mx-auto mb-10 max-w-[700px] text-center"><p lang="ar" dir="rtl" className={`mb-3 font-arab text-2xl ${light ? "text-inv-gold-light" : "text-inv-accent"}`}>{arabic}</p><div className="flex items-center justify-center gap-4"><span aria-hidden="true" className={`h-px w-9 ${light ? "bg-inv-gold-light/70" : "bg-inv-gold/70"}`} /><Label light={light}>{kicker}</Label><span aria-hidden="true" className={`h-px w-9 ${light ? "bg-inv-gold-light/70" : "bg-inv-gold/70"}`} /></div><h2 className={`mt-3 font-display text-[clamp(36px,6.5vw,62px)] leading-[1.02] ${light ? "text-inv-wash" : "text-inv-ink"}`}>{children}</h2><MawaddahDivider light={light} className="mt-5" /></div>;
}

function MawaddahDivider({ light = false, className = "" }: { light?: boolean; className?: string }) {
  return <div aria-hidden="true" className={`relative mx-auto flex w-56 items-center justify-center ${light ? "text-inv-gold-light" : "text-inv-gold"} ${className}`}><Pita className="h-[14px] w-full opacity-90" /><svg viewBox="0 0 32 32" className="absolute size-7 shrink-0" fill="none"><path d="M16 1 19.8 12.2 31 16l-11.2 3.8L16 31l-3.8-11.2L1 16l11.2-3.8L16 1Z" stroke="currentColor" /><path d="m16 7 2.2 6.8L25 16l-6.8 2.2L16 25l-2.2-6.8L7 16l6.8-2.2L16 7Z" fill="currentColor" /></svg></div>;
}

function IslamicMedallion({ light = false, className = "" }: { light?: boolean; className?: string }) {
  return <svg aria-hidden="true" viewBox="0 0 180 180" fill="none" className={`pointer-events-none absolute ${light ? "text-inv-gold-light" : "text-inv-gold"} ${className}`}>
    <circle cx="90" cy="90" r="78" stroke="currentColor" strokeOpacity=".55" />
    <circle cx="90" cy="90" r="66" stroke="currentColor" strokeOpacity=".42" strokeDasharray="2 4" />
    <path d={star8(90, 90, 72)} stroke="currentColor" strokeOpacity=".7" />
    <path d={star8(90, 90, 52, Math.PI / 8)} stroke="currentColor" strokeOpacity=".62" />
    <circle cx="90" cy="90" r="5" fill="currentColor" fillOpacity=".75" />
    <path d="M90 3v14m0 146v14M3 90h14m146 0h14M28 28l10 10m104 104 10 10m0-124-10 10M38 142l-10 10" stroke="currentColor" strokeOpacity=".7" />
  </svg>;
}

function MihrabMotif({ light = false, className = "" }: { light?: boolean; className?: string }) {
  return <svg aria-hidden="true" viewBox="0 0 240 320" fill="none" className={`pointer-events-none absolute ${light ? "text-inv-gold-light" : "text-inv-gold"} ${className}`}>
    <path d="M16 304V132C16 69 63 18 120 18s104 51 104 114v172H16Z" stroke="currentColor" strokeOpacity=".56" />
    <path d="M32 304V134c0-53 39-96 88-96s88 43 88 96v170H32Z" stroke="currentColor" strokeOpacity=".34" />
    <path d="m120 3 7 14 16 2-12 11 3 16-14-8-14 8 3-16-12-11 16-2 7-14Z" stroke="currentColor" strokeOpacity=".66" />
    <path d="M42 270c23-7 37-22 43-46m113 46c-23-7-37-22-43-46M49 287c17-6 28-17 33-34m109 34c-17-6-28-17-33-34" stroke="currentColor" strokeOpacity=".48" />
  </svg>;
}

function IslamicCorners({ light = false }: { light?: boolean }) {
  const corners = ["left-3 top-3", "right-3 top-3 -scale-x-100", "bottom-3 left-3 -scale-y-100", "bottom-3 right-3 -scale-100"];
  return <div aria-hidden="true" className={`pointer-events-none absolute inset-0 ${light ? "text-inv-gold-light/70" : "text-inv-gold/75"}`}>
    <Pattern name="zellige" color="var(--inv-gold-light)" opacity={light ? 0.17 : 0.13} scale={1.15} />
    {(["tl", "tr", "bl", "br"] as const).map((corner) => <Hias key={corner} name="sudut" corner={corner} className="m-2 w-24 opacity-90 sm:m-3 sm:w-32 md:w-40 lg:w-48" />)}
    {corners.map((position) => <svg key={position} viewBox="0 0 72 72" className={`absolute size-14 sm:size-[72px] ${position}`} fill="none" stroke="currentColor" strokeWidth="1">
      <path d="M4 68V27C4 14 14 4 27 4h41M12 68V29c0-9 8-17 17-17h39" />
      <path d="m27 4 5 5-5 5-5-5 5-5Zm0 8 5 5-5 5-5-5 5-5Z" />
      <path d="M4 46c8 0 12-4 12-12M12 54c8 0 12-4 12-12" />
      <path d="m27 27 3.2 6 6.7-2.1-3.5 6.1 4.8 5.2-7 .1-2.3 6.6-2.3-6.6-7-.1 4.8-5.2-3.5-6.1 6.7 2.1L27 27Z" />
      <circle cx="27" cy="38" r="2.2" />
    </svg>)}
  </div>;
}

function Hero({ inv }: { inv: InvitationView }) {
  return <section className="relative isolate overflow-hidden bg-inv-paper text-inv-ink">
    <div aria-hidden="true" className="mw-geometry pointer-events-none absolute inset-0 opacity-[.24]" /><IslamicCorners />
    <MihrabMotif className="-right-20 top-8 h-[84%] w-auto opacity-30 sm:right-[3%]" />
    <IslamicMedallion className="-bottom-16 left-[4%] size-48 opacity-30 sm:size-60" />
    <Frame className="relative grid min-h-[88svh] items-center gap-10 py-16 sm:py-20 lg:min-h-[86svh] lg:grid-cols-[.9fr_1.1fr] lg:gap-16 lg:py-24">
      <div className="relative z-10 order-2 lg:order-1">
        <p lang="ar" dir="rtl" className="font-arab text-[clamp(26px,5vw,36px)] leading-loose text-inv-accent">{inv.texts.hero.bismillah}</p>
        <Label>{inv.texts.hero.kicker} · {hijri(inv.date, inv.tz)}</Label>
        <h1 className="mt-6 font-display text-[clamp(56px,9vw,100px)] leading-[.9] tracking-[-.04em] text-inv-accent">
          {inv.groom.name}<span className="mx-2 text-[.55em] text-inv-gold">&amp;</span><br className="hidden sm:block" />{inv.bride.name}
        </h1>
        <p className="mt-6 max-w-[37ch] font-display text-[clamp(21px,3vw,28px)] italic leading-snug text-inv-ink/75">{inv.tagline || inv.texts.hero.tagline}</p>
        <div className="mt-6 flex flex-wrap items-center gap-x-3 gap-y-1 text-[11px] tracking-[.14em] text-inv-accent uppercase"><span>{inv.dateLong}</span><span aria-hidden="true" className="h-px w-8 bg-inv-gold/70" /><span>{inv.cityShort}</span></div>
        <Greeting className="mt-4 text-[14px] text-inv-ink/70" />
        <a href="#ayat" className={`${button} mt-8 no-underline`}>{inv.texts.hero.button} <span aria-hidden="true">↓</span></a>
        <p className="mt-9 text-[9px] tracking-[.28em] text-inv-ink/45 uppercase">{inv.texts.hero.footer}</p>
      </div>
      <div className="relative order-1 mx-auto w-full max-w-[500px] lg:order-2 lg:max-w-none">
        <div style={{ borderRadius: "50% 50% 0 0 / 18% 18% 0 0" }} className="relative aspect-[4/5] overflow-hidden border border-inv-gold/70 bg-inv-wash p-2.5 shadow-[0_24px_55px_rgba(32,44,39,.13)] sm:p-3.5">
          <div style={{ borderRadius: "50% 50% 0 0 / 18% 18% 0 0" }} className="relative size-full overflow-hidden border border-inv-line bg-inv-paper">
            <Image {...inv.frame.hero} src={inv.images.hero} alt={`${inv.groom.name} dan ${inv.bride.name}`} fill priority sizes="(min-width: 1024px) 44vw, 92vw" className="object-cover object-[50%_45%]" />
          </div>
          <div className="absolute -bottom-4 -left-3 max-w-[78%] border border-inv-gold/50 bg-inv-paper px-4 py-3 shadow-[0_12px_30px_rgba(32,44,39,.12)] sm:-left-6 sm:px-6 sm:py-4">
            <p className="text-[9px] tracking-[.22em] text-inv-gold uppercase">{inv.texts.hero.imageLabel} · {hijri(inv.date, inv.tz)}</p>
            <p className="mt-1 font-display text-[clamp(20px,3vw,30px)] leading-tight text-inv-accent">{inv.groom.name} &amp; {inv.bride.name}</p>
          </div>
        </div>
      </div>
    </Frame>
  </section>;
}

function Ayat({ inv }: { inv: InvitationView }) {
  return <section id="ayat" className="relative isolate scroll-mt-8 overflow-hidden bg-inv-night py-20 text-inv-wash sm:py-28">
    <div aria-hidden="true" className="mw-geometry pointer-events-none absolute inset-0 opacity-35" />
    <IslamicCorners light />
    <IslamicMedallion light className="-left-20 top-1/2 size-64 -translate-y-1/2 opacity-25 sm:left-[3%] sm:size-80" />
    <IslamicMedallion light className="-right-20 top-1/2 size-64 -translate-y-1/2 opacity-25 sm:right-[3%] sm:size-80" />
    <Frame className="max-w-[920px]">
      <div className="relative border-y border-inv-gold/45 py-10 sm:py-14">
        <div className="relative grid gap-7 sm:grid-cols-[150px_1fr] sm:gap-12">
          <div className="text-center sm:pt-2"><p lang="ar" dir="rtl" className="font-arab text-2xl text-inv-gold-light">{inv.texts.hero.bismillah}</p><p className="mt-4 font-display text-6xl leading-none text-inv-gold-light/80">{inv.texts.ayat.number}</p><p className="mt-1 text-[10px] tracking-[.2em] text-inv-gold-light uppercase">{inv.texts.ayat.label}</p></div>
          <div className="text-center sm:text-right">
            <p lang="ar" dir="rtl" className="font-arab text-[clamp(25px,5vw,38px)] leading-[2] text-inv-gold-light">{inv.texts.ayat.arabic}</p>
            <p className="mx-auto mt-6 max-w-[66ch] text-[14px] leading-[1.9] text-inv-wash/80 sm:ml-auto">“{inv.texts.ayat.meaning}”</p>
            <p className="mt-4 text-[10px] tracking-[.2em] text-inv-gold-light uppercase">{inv.texts.ayat.reference}</p>
          </div>
        </div>
      </div>
    </Frame>
  </section>;
}

function Couple({ inv }: { inv: InvitationView }) {
  return <section className="relative isolate overflow-hidden bg-sk-pasir py-20 sm:py-28">
    <div aria-hidden="true" className="mw-geometry pointer-events-none absolute inset-0 opacity-[.2]" /><IslamicCorners />
    <MihrabMotif className="-left-24 top-1/2 h-[88%] w-auto -translate-y-1/2 opacity-25 sm:left-[1%]" />
    <IslamicMedallion className="-right-16 bottom-2 size-56 opacity-25 sm:right-[4%] sm:size-72" />
    <Frame className="relative">
      <div className="mx-auto mb-10 max-w-[720px] text-center">
        <p lang="ar" dir="rtl" className="font-arab text-[clamp(22px,5vw,30px)] leading-loose text-inv-accent">{inv.texts.couple.arabicGreeting}</p>
        <p className="mt-2 text-[9px] tracking-[.16em] text-inv-gold uppercase">{inv.texts.couple.greeting}</p>
        <p className="mx-auto mt-4 max-w-[62ch] text-[14px] leading-[1.9] text-inv-ink/75">{inv.honor || inv.texts.couple.honor}</p>
      </div>
      <Heading arabic={inv.texts.couple.arabic} kicker={inv.texts.couple.label}>{inv.texts.couple.title}</Heading>
      <div className="mx-auto grid max-w-[1000px] gap-10 sm:grid-cols-2 sm:items-start sm:gap-12">
        {[inv.groom, inv.bride].map((person, i) => <article key={person.name} className="text-center">
          <div style={{ borderRadius: "50% 50% 0 0 / 18% 18% 0 0" }} className="relative mx-auto aspect-[4/5] w-full max-w-[360px] overflow-hidden border border-inv-gold/60 bg-inv-paper p-1.5 shadow-[0_14px_30px_rgba(32,44,39,.12)]"><div style={{ borderRadius: "50% 50% 0 0 / 18% 18% 0 0" }} className="relative size-full overflow-hidden"><Image {...person.frame} src={person.photo} alt={person.full || person.name} fill sizes="(min-width: 640px) 360px, 90vw" className="object-cover object-[50%_35%]" /></div></div>
          <div className="mt-5 flex items-center justify-center gap-3 text-[9px] tracking-[.24em] text-inv-gold uppercase"><span>0{i + 1}</span><span aria-hidden="true" className="h-px w-10 bg-inv-gold/60" /><span>{person.role}</span></div>
          <p className="mt-2 font-display text-[clamp(34px,5vw,54px)] leading-none text-inv-accent">{person.name}</p>
          <p className="mt-2 text-[10px] tracking-[.16em] text-inv-ink/60 uppercase">{person.full}</p>
          <p className="mx-auto mt-3 max-w-[34ch] text-[13px] leading-relaxed text-inv-ink/70">{person.parents}</p>
        </article>)}
      </div>
    </Frame>
  </section>;
}

function Story({ inv }: { inv: InvitationView }) {
  if (!inv.story.length) return null;
  return <section className="relative isolate overflow-hidden bg-inv-paper py-20 sm:py-28">
    <div aria-hidden="true" className="mw-geometry pointer-events-none absolute inset-0 opacity-[.13]" /><IslamicCorners />
    <IslamicMedallion className="-left-24 top-1/2 size-72 -translate-y-1/2 opacity-25 sm:left-[2%] sm:size-96" />
    <IslamicMedallion className="-right-24 top-1/2 size-72 -translate-y-1/2 opacity-25 sm:right-[2%] sm:size-96" />
    <Frame className="relative max-w-[1160px]"><Heading arabic={inv.texts.story.arabic} kicker={inv.texts.story.label}>{inv.texts.story.title}</Heading>
      <div className="-mx-5 flex snap-x snap-mandatory gap-4 overflow-x-auto px-5 pb-4 [scrollbar-width:none] sm:mx-0 sm:grid sm:grid-cols-2 sm:gap-5 sm:overflow-visible sm:px-0 sm:pb-0 lg:grid-cols-4 [&::-webkit-scrollbar]:hidden">
        {inv.story.map((item, i) => <article key={`${item.title}-${i}`} className="w-[76vw] max-w-[310px] shrink-0 snap-center border border-inv-gold/45 bg-inv-wash p-2 shadow-[0_10px_28px_rgba(22,62,67,.08)] sm:w-auto sm:max-w-none sm:p-2.5">
          <Arch className="aspect-[4/3.5] w-full" line="var(--sk-emas)" gap="var(--inv-wash)">
            {item.image ? <Image src={item.image} alt={item.title} fill sizes="(min-width: 1024px) 250px, 76vw" className="object-cover" /> : <div className="mw-geometry absolute inset-0 bg-inv-accent" />}
          </Arch>
          <div className="px-2 pb-3 pt-3 text-center sm:px-2.5 sm:pb-4">
            <div className="flex items-center justify-between gap-2"><span className="text-[9px] tracking-[.17em] text-inv-gold uppercase">{inv.texts.story.chapter} {String(i + 1).padStart(2, "0")}</span><span className="border-b border-inv-gold/50 pb-1 text-[9px] tracking-[.12em] text-inv-accent">{item.date}</span></div>
            <MawaddahDivider className="mt-3 w-24 gap-2" />
            <h3 className="mt-3 font-display text-[clamp(22px,2vw,27px)] leading-tight text-inv-accent">{item.title}</h3>
            <p className="mx-auto mt-2 max-w-[30ch] text-[12px] leading-[1.7] text-inv-ink/70">{item.short || item.long}</p>
          </div>
        </article>)}
      </div>
    </Frame>
  </section>;
}

// Acara beda hari atau beda tempat, satu per satu.
function Agenda({ inv }: { inv: InvitationView }) {
  return <div className="mt-8 grid gap-3">{inv.events.map((e, i) => <article key={`${e.name}-${i}`} className="border-l-2 border-inv-gold bg-inv-wash px-4 py-5 text-left sm:px-6">
    <Label>{e.name}</Label>
    <p className="mt-3 font-display text-[clamp(22px,4vw,30px)] leading-tight text-inv-accent">{e.dateLabel}</p>
    {e.clock && <p className="mt-1 text-[12px] text-inv-ink/60">{e.clock}</p>}
    {e.place.name && <><Label>{inv.texts.event.place}</Label><h3 className="mt-1 font-display text-xl text-inv-accent">{e.place.name}</h3></>}
    {e.place.address && <><Label>{inv.texts.event.address}</Label><p className="mt-1 text-[13px] leading-relaxed text-inv-ink/70">{e.place.address}</p></>}
    {e.place.mapUrl && <a className={`${button} mt-4`} href={e.place.mapUrl} target="_blank" rel="noreferrer">{inv.texts.event.map}</a>}
  </article>)}</div>;
}

function Event({ inv }: { inv: InvitationView }) {
  const calendar = calendarEventOf(inv);
  return <section className="relative isolate overflow-hidden bg-inv-paper py-20 text-inv-ink sm:py-28">
    <div aria-hidden="true" className="mw-geometry pointer-events-none absolute inset-0 opacity-[.14]" /><IslamicCorners />
    <MihrabMotif className="-left-20 top-1/2 h-[82%] w-auto -translate-y-1/2 opacity-25 sm:left-[1%]" />
    <IslamicMedallion className="-right-20 top-1/2 size-72 -translate-y-1/2 opacity-25 sm:right-[3%] sm:size-80" />
    <Frame className="relative"><Heading arabic={inv.texts.event.arabic} kicker={inv.texts.event.label}>{inv.texts.event.title}</Heading>
      {inv.on.countdown && <Countdown target={inv.date} labels={{ days: inv.texts.countdown.days, hours: inv.texts.countdown.hours, minutes: inv.texts.countdown.minutes }} doneText={inv.texts.countdown.done} className="mx-auto mb-12 grid w-full max-w-[680px] grid-cols-3 gap-3 sm:gap-5" cellClassName="border border-inv-line bg-inv-wash px-3 py-5 font-display text-4xl text-inv-accent shadow-[0_10px_28px_rgba(22,62,67,.06)] sm:px-6 sm:py-7 sm:text-5xl [&>span:last-child]:font-body [&>span:last-child]:text-[10px] [&>span:last-child]:tracking-[.16em] [&>span:last-child]:text-inv-gold sm:[&>span:last-child]:text-xs" />}
      <div className="mx-auto grid max-w-[1000px] gap-10 lg:grid-cols-[1fr_.9fr] lg:items-center">
        <div className="border-y border-inv-line py-6">
          <p className="text-center font-display text-[clamp(30px,6vw,46px)] text-inv-accent lg:text-left">{inv.dateLong}</p>
          <p className="mt-2 text-center text-[13px] tracking-[.14em] text-inv-ink/60 lg:text-left">{hijri(inv.date, inv.tz)} · {inv.tz}</p>
          {inv.agenda ? <Agenda inv={inv} /> : <div className="mt-8 grid grid-cols-2 gap-3">{inv.events.map((event, i) => <article key={`${event.name}-${i}`} className="border-l-2 border-inv-gold bg-inv-wash px-4 py-5 text-left sm:px-6">
            <Label>{event.name}</Label><p className="mt-3 font-display text-[clamp(24px,4vw,34px)] text-inv-accent">{event.time}</p>{event.until && <p className="mt-1 text-[12px] text-inv-ink/60">{inv.texts.event.until} {event.until}</p>}
          </article>)}</div>}
        </div>
        <div className="grid gap-5 sm:grid-cols-[.85fr_1fr] lg:grid-cols-1 xl:grid-cols-[.85fr_1fr]">
          <div className="relative min-h-[260px] overflow-hidden border border-inv-gold/50 bg-inv-wash p-1.5"><div className="relative min-h-[248px] h-full"><Image {...inv.frame.venue} src={inv.images.venue} alt={`Suasana ${inv.venue.name}`} fill sizes="(min-width: 1024px) 360px, 90vw" className="object-cover object-[50%_25%]" /></div></div>
          <div className="flex flex-col justify-center">{!inv.agenda && <Label>{inv.texts.event.place}</Label>}{!inv.agenda && <h3 className="mt-3 font-display text-3xl text-inv-accent">{inv.venue.name}</h3>}{!inv.agenda && inv.venue.address && <Label>{inv.texts.event.address}</Label>}{!inv.agenda && <p className="mt-2 text-[13px] leading-relaxed text-inv-ink/70">{inv.venue.address}</p>}<div className="mt-5 flex flex-wrap gap-3">{!inv.agenda && inv.venue.mapUrl && <a className={button} href={inv.venue.mapUrl} target="_blank" rel="noreferrer">{inv.texts.event.map}</a>}<CalendarButton slug={inv.slug} google={googleCalendarUrl(calendar)} className={button}>{inv.texts.event.calendar}</CalendarButton></div></div>
        </div>
      </div>
    </Frame>
  </section>;
}

function GallerySection({ inv }: { inv: InvitationView }) {
  if (!inv.gallery.length) return null;
  return <section className="relative isolate overflow-hidden bg-inv-wash py-20 sm:py-28"><div aria-hidden="true" className="mw-geometry pointer-events-none absolute inset-0 opacity-[.16]" /><IslamicCorners /><MihrabMotif className="-left-20 top-1/2 h-[88%] w-auto -translate-y-1/2 opacity-20 sm:left-[1%]" /><MihrabMotif className="-right-20 top-1/2 h-[88%] w-auto -translate-y-1/2 -scale-x-100 opacity-20 sm:right-[1%]" /><Frame className="relative max-w-[1120px]"><Heading arabic={inv.texts.gallery.arabic} kicker={inv.texts.gallery.label}>{inv.texts.gallery.title}</Heading><div className="relative"><Gallery photos={inv.gallery} variant="mawaddah" /></div></Frame></section>;
}

function RsvpSection({ inv }: { inv: InvitationView }) {
  return <section className="relative isolate overflow-hidden bg-inv-paper py-20 sm:py-28"><div aria-hidden="true" className="mw-geometry pointer-events-none absolute inset-0 opacity-[.12]" /><IslamicCorners /><IslamicMedallion className="-left-20 top-1/2 size-72 -translate-y-1/2 opacity-20 sm:left-[2%] sm:size-96" /><IslamicMedallion className="-right-20 top-1/2 size-72 -translate-y-1/2 opacity-20 sm:right-[2%] sm:size-96" /><Frame className="relative max-w-[860px]"><div className="relative grid overflow-hidden border border-inv-line bg-inv-wash md:grid-cols-[.85fr_1.15fr]">
    <div className="relative isolate flex min-h-[250px] flex-col justify-end overflow-hidden bg-inv-accent px-7 py-8 text-inv-wash sm:px-10"><Image {...inv.frame.heroWide} src={inv.images.heroWide} alt="" fill sizes="(min-width: 768px) 340px, 90vw" className="absolute inset-0 object-cover opacity-40" /><div aria-hidden="true" className="absolute inset-0 bg-inv-night/45" /><div aria-hidden="true" className="mw-geometry absolute inset-0 opacity-35" /><div className="relative"><Label light>{inv.texts.rsvp.label}</Label><h2 className="mt-3 font-display text-[clamp(34px,6vw,48px)] leading-tight">{inv.texts.rsvp.title}</h2><MawaddahDivider light /><p className="mt-3 max-w-[30ch] text-[13px] leading-relaxed text-inv-wash/75">{inv.texts.rsvp.subtitle}</p></div></div>
    <div className="p-6 sm:p-10"><Rsvp slug={inv.slug} deadline={inv.rsvpDeadline} /></div>
  </div></Frame></section>;
}

function Gifts({ inv }: { inv: InvitationView }) {
  if (!inv.gifts.length && !inv.images.qris) return null;
  return <section className="relative isolate overflow-hidden bg-inv-paper py-20 sm:py-28"><div aria-hidden="true" className="mw-geometry pointer-events-none absolute inset-0 opacity-[.14]" /><IslamicCorners /><MihrabMotif className="-left-20 top-1/2 h-[88%] w-auto -translate-y-1/2 opacity-20 sm:left-[1%]" /><IslamicMedallion className="-right-20 top-1/2 size-72 -translate-y-1/2 opacity-20 sm:right-[2%] sm:size-80" /><Frame className="relative"><Heading arabic={inv.texts.gifts.arabic} kicker={inv.texts.gifts.label}>{inv.texts.gifts.title}</Heading>
    <p className="mx-auto -mt-4 mb-9 max-w-[48ch] text-center text-[13px] leading-relaxed text-inv-ink/70">{inv.texts.gifts.subtitle}</p>
    <div className="mx-auto grid max-w-[900px] grid-cols-1 gap-5 sm:grid-cols-2">{inv.gifts.map((gift) => <article key={gift.number} className={`relative isolate overflow-hidden border border-inv-gold/55 bg-inv-night px-6 py-8 text-center text-inv-wash shadow-[0_14px_36px_rgba(22,62,67,.12)] sm:px-8 ${inv.gifts.length === 1 ? "sm:col-span-2 sm:w-[calc(50%-0.625rem)] sm:justify-self-center" : ""}`}><div aria-hidden="true" className="mw-geometry pointer-events-none absolute inset-0 opacity-45" /><IslamicCorners light /><div className="relative"><p lang="ar" dir="rtl" className="font-arab text-xl text-inv-gold-light">{inv.texts.gifts.arabicGift}</p><p className="mt-2 text-[9px] tracking-[.24em] text-inv-gold-light uppercase">{inv.texts.gifts.bank}: {gift.bank}</p><MawaddahDivider light className="mt-5" /><p className="mt-5 text-[9px] tracking-[.2em] text-inv-gold-light">{inv.texts.gifts.number}</p><p className="mt-1 break-all font-display text-[clamp(20px,4vw,28px)] tracking-[.08em] text-inv-wash">{gift.number}</p><p className="mt-2 text-[12px] text-inv-wash/70">{inv.texts.gifts.holder} {gift.holder}</p><div className="mt-5 [&_button]:!border-inv-gold-light [&_button]:!text-inv-gold-light [&_button:hover]:!bg-inv-gold-light [&_button:hover]:!text-inv-night"><CopyButton value={gift.number} label={inv.texts.gifts.copy} /></div></div></article>)}
      {inv.images.qris && <div className="relative isolate overflow-hidden border border-inv-gold/55 bg-inv-night p-6 text-center text-inv-wash"><div aria-hidden="true" className="mw-geometry pointer-events-none absolute inset-0 opacity-35" /><IslamicCorners light /><div className="relative"><p lang="ar" dir="rtl" className="font-arab text-xl text-inv-gold-light">{inv.texts.gifts.arabicGift}</p><Label light>{inv.texts.gifts.qrisLabel}</Label><div className="mx-auto mt-4 inline-block border border-inv-gold/45 bg-white p-2"><Image src={inv.images.qris} alt="Kode QRIS" width={160} height={160} className="size-40" /></div><div className="mt-3 [&_button]:!border-inv-gold-light [&_button]:!text-inv-gold-light [&_button:hover]:!bg-inv-gold-light [&_button:hover]:!text-inv-night"><p className="mt-3 text-[13px] text-inv-wash/75">{inv.texts.gifts.qris}</p><QrisDownload src={inv.images.qris} slug={inv.slug} /></div></div></div>}
    </div>{inv.giftNote && <p className="mt-6 text-center text-xs text-inv-ink/65">{inv.giftNote}</p>}
  </Frame></section>;
}

async function Guestbook({ inv }: { inv: InvitationView }) {
  const wishes = await getWishes(inv.slug);
  return <section className="relative isolate overflow-hidden bg-inv-wash py-20 sm:py-28"><div aria-hidden="true" className="mw-geometry pointer-events-none absolute inset-0 opacity-[.18]" /><IslamicCorners /><MihrabMotif className="-left-14 top-1/2 h-[75%] w-auto -translate-y-1/2 opacity-[.16] sm:left-[2%]" /><MihrabMotif className="-right-14 top-1/2 h-[75%] w-auto -translate-y-1/2 -scale-x-100 opacity-[.16] sm:right-[2%]" /><Frame className="relative max-w-[850px]"><Heading arabic={inv.texts.wishes.arabic} kicker={inv.texts.wishes.label}>{inv.texts.wishes.title}</Heading><div className="relative border border-inv-gold/65 bg-inv-paper p-2 shadow-[0_16px_44px_rgba(22,62,67,.08)] sm:p-3"><IslamicCorners /><div className="relative border border-inv-line bg-inv-paper p-5 sm:p-9"><div aria-hidden="true" className="mw-geometry pointer-events-none absolute inset-0 opacity-[.12]" /><div className="relative"><p lang="ar" dir="rtl" className="mb-5 text-center font-arab text-xl text-inv-accent">{inv.texts.wishes.arabicGreeting}</p><Wishes slug={inv.slug} initial={wishes} variant="lined" desktop="stack-when-empty" /></div></div></div></Frame></section>;
}

function Closing({ inv }: { inv: InvitationView }) {
  return <section className="relative isolate overflow-hidden bg-inv-night py-24 text-center text-inv-wash sm:py-32">
    <div aria-hidden="true" className="mw-geometry pointer-events-none absolute inset-0 opacity-60" />
    <IslamicCorners light />
    <IslamicMedallion light className="-left-20 top-1/2 size-72 -translate-y-1/2 opacity-25 sm:left-[2%] sm:size-96" />
    <IslamicMedallion light className="-right-20 top-1/2 size-72 -translate-y-1/2 opacity-25 sm:right-[2%] sm:size-96" />
    <Frame className="relative max-w-[760px]"><p lang="ar" dir="rtl" className="font-arab text-[clamp(30px,8vw,46px)] leading-loose text-inv-gold-light">{inv.texts.closing.arabic}</p><Label light>{inv.texts.closing.label}</Label>
      <p className="mx-auto mt-6 max-w-[48ch] font-display text-[clamp(25px,4vw,36px)] italic leading-snug text-inv-wash/85">{inv.texts.closing.thanks}</p>
      <MawaddahDivider light className="mt-8" /><p className="mt-7 font-display text-[clamp(42px,9vw,72px)] leading-none">{inv.groom.name} <span className="text-inv-gold-light">&amp;</span> {inv.bride.name}</p><p className="mt-5 text-[10px] tracking-[.2em] text-inv-gold-light uppercase">{inv.dateLong}</p>
    </Frame>
  </section>;
}

async function Main({ inv }: { inv: InvitationView }) {
  return <main><Hero inv={inv} /><Extras inv={inv} at="hero" />{inv.on.couple && <Couple inv={inv} />}<Extras inv={inv} at="couple" /><Ayat inv={inv} /><Extras inv={inv} at="story" />{inv.on.story && <Story inv={inv} />}<Extras inv={inv} at="event" />{inv.on.event && <Event inv={inv} />}{inv.on.gallery && <GallerySection inv={inv} />}<Extras inv={inv} at="gallery" />{inv.on.rsvp && <RsvpSection inv={inv} />}<Extras inv={inv} at="rsvp" />{inv.on.gifts && <Gifts inv={inv} />}<Extras inv={inv} at="gifts" />{inv.on.wishes && <Guestbook inv={inv} />}<Extras inv={inv} at="wishes" />{inv.on.closing && <Closing inv={inv} />}<Extras inv={inv} at="closing" /></main>;
}

export function FarisNajwa({ inv }: { inv: InvitationView }) {
  const style = { ...vars, ...inv.palette, ...inv.fonts } as CSSProperties;
  return <InvitationShell
    door={{ kind: "mawaddah", groom: inv.groom.name, bride: inv.bride.name, monogram: inv.monogram, date: inv.dateLong.replace(/^Minggu/, "Ahad"), hijri: hijri(inv.date, inv.tz), city: inv.city, copy: { kicker: inv.texts.hero.kicker, bismillah: inv.texts.hero.bismillah, intro: inv.texts.hero.doorIntro, invitedLabel: inv.texts.hero.invitedLabel, button: inv.texts.hero.doorButton, brand: inv.texts.hero.doorBrand, statement: inv.texts.hero.doorStatement } }}
    music={inv.music}
    className={`${themeFonts} fw-root min-h-dvh overflow-x-clip bg-inv-paper font-body text-[16px] text-inv-ink`}
    style={style}
  >
    <style>{`html:has(.fw-root){background:${inv.palette["--inv-paper"]};scrollbar-color:${inv.palette["--sk-emas"]} ${inv.palette["--inv-paper"]}}html:has(.sk-door){background:${inv.palette["--sk-night2"]}}`}</style>
    <Main inv={inv} />
    <footer className="bg-inv-night py-7 text-center text-[10px] tracking-[.17em] text-inv-wash/55 uppercase">{inv.texts.footer.brand} · <Link href="/" className="text-inv-gold-light underline underline-offset-4">Sowanan</Link>{inv.credit && <span> · {inv.credit}</span>}</footer>
  </InvitationShell>;
}
