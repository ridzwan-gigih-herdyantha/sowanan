import Image from "next/image";
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
import { Pattern, Pita } from "@/components/invitation/sakinah/ornaments";
import { Countdown } from "@/components/countdown";
import { getWishes } from "@/lib/guestbook";
import { hijri } from "@/lib/hijri";
import { calendarEventOf, type InvitationView } from "@/lib/invitation/view";
import { googleCalendarUrl } from "@/lib/calendar";
import { themeFonts } from "./fonts";

const vars = {
  "--inv-display": "var(--font-fw-display), Georgia, serif",
  "--inv-body": "var(--font-fw-body), Arial, sans-serif",
  "--inv-arab": "var(--font-fw-arab), 'Amiri', serif",
} as CSSProperties;

const button = "inline-flex items-center justify-center gap-2 border border-inv-accent/60 px-5 py-3 text-[11px] tracking-[.18em] text-inv-accent uppercase transition-colors hover:bg-inv-accent hover:text-inv-paper";
const bismillah = "بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ";
const verse = "وَمِنْ آيَاتِهِ أَنْ خَلَقَ لَكُم مِّنْ أَنفُسِكُمْ أَزْوَاجًا لِّتَسْكُنُوا إِلَيْهَا وَجَعَلَ بَيْنَكُم مَّوَدَّةً وَرَحْمَةً";
const verseMeaning = "Dan di antara tanda-tanda kebesaran-Nya ialah Dia menciptakan pasangan-pasangan untukmu dari jenismu sendiri, agar kamu cenderung dan merasa tenteram kepadanya, dan Dia menjadikan di antaramu rasa kasih dan sayang.";

function Frame({ children, className = "" }: { children: ReactNode; className?: string }) {
  return <div className={`relative mx-auto w-full max-w-[1120px] px-5 sm:px-8 ${className}`}>{children}</div>;
}

function Label({ children, light = false }: { children: ReactNode; light?: boolean }) {
  return <p className={`text-[10px] tracking-[.27em] uppercase ${light ? "text-inv-gold-light" : "text-inv-accent"}`}>{children}</p>;
}

function Heading({ kicker, children, light = false }: { kicker: string; children: ReactNode; light?: boolean }) {
  return <div className="mx-auto mb-10 max-w-[700px] text-center"><div className="flex items-center justify-center gap-4"><span aria-hidden="true" className={`h-px w-9 ${light ? "bg-inv-gold-light/70" : "bg-inv-gold/70"}`} /><Label light={light}>{kicker}</Label><span aria-hidden="true" className={`h-px w-9 ${light ? "bg-inv-gold-light/70" : "bg-inv-gold/70"}`} /></div><h2 className={`mt-3 font-display text-[clamp(36px,6.5vw,62px)] leading-[1.02] ${light ? "text-inv-wash" : "text-inv-ink"}`}>{children}</h2><span aria-hidden="true" className={`mx-auto mt-5 block size-2 rotate-45 border ${light ? "border-inv-gold-light" : "border-inv-gold"}`} /></div>;
}

function Hero({ inv }: { inv: InvitationView }) {
  return <section className="relative overflow-hidden bg-inv-paper text-inv-ink">
    <Frame className="grid min-h-[88svh] items-center gap-10 py-12 sm:py-16 lg:min-h-[86svh] lg:grid-cols-[.9fr_1.1fr] lg:gap-16 lg:py-20">
      <div className="relative z-10 order-2 lg:order-1">
        <p lang="ar" dir="rtl" className="font-arab text-[clamp(26px,5vw,36px)] leading-loose text-inv-accent">{bismillah}</p>
        <Label>WALIMATUL &lsquo;URSY · {hijri(inv.date, inv.tz)}</Label>
        <h1 className="mt-6 font-display text-[clamp(56px,9vw,100px)] leading-[.9] tracking-[-.04em] text-inv-accent">
          {inv.groom.name}<span className="mx-2 text-[.55em] text-inv-gold">&amp;</span><br className="hidden sm:block" />{inv.bride.name}
        </h1>
        <p className="mt-6 max-w-[37ch] font-display text-[clamp(21px,3vw,28px)] italic leading-snug text-inv-ink/75">{inv.tagline || "Dengan ridha Allah, dua hati menapaki satu ibadah."}</p>
        <div className="mt-6 flex flex-wrap items-center gap-x-3 gap-y-1 text-[11px] tracking-[.14em] text-inv-accent uppercase"><span>{inv.dateLong}</span><span aria-hidden="true" className="h-px w-8 bg-inv-gold/70" /><span>{inv.cityShort}</span></div>
        <Greeting className="mt-4 text-[14px] text-inv-ink/70" />
        <a href="#ayat" className={`${button} mt-8 no-underline`}>Sambut kisah kami <span aria-hidden="true">↓</span></a>
        <p className="mt-9 text-[9px] tracking-[.28em] text-inv-ink/45 uppercase">Mawaddah · Dengan kasih dan rahmat</p>
      </div>
      <div className="relative order-1 mx-auto w-full max-w-[500px] lg:order-2 lg:max-w-none">
        <div className="relative aspect-[4/5] border border-inv-gold/60 bg-inv-wash p-2.5 shadow-[0_24px_55px_rgba(32,44,39,.13)] sm:p-3.5">
          <div className="relative size-full overflow-hidden border border-inv-line bg-inv-paper">
            <Image {...inv.frame.hero} src={inv.images.hero} alt={`${inv.groom.name} dan ${inv.bride.name}`} fill priority sizes="(min-width: 1024px) 44vw, 92vw" className="object-cover object-[50%_45%]" />
          </div>
          <div className="absolute -bottom-4 -left-3 max-w-[78%] border border-inv-gold/50 bg-inv-paper px-4 py-3 shadow-[0_12px_30px_rgba(32,44,39,.12)] sm:-left-6 sm:px-6 sm:py-4">
            <p className="text-[9px] tracking-[.22em] text-inv-gold uppercase">Mawaddah · {hijri(inv.date, inv.tz)}</p>
            <p className="mt-1 font-display text-[clamp(20px,3vw,30px)] leading-tight text-inv-accent">{inv.groom.name} &amp; {inv.bride.name}</p>
          </div>
        </div>
      </div>
    </Frame>
  </section>;
}

function Ayat() {
  return <section id="ayat" className="scroll-mt-8 bg-inv-wash py-20 sm:py-28">
    <Frame className="max-w-[920px]">
      <div className="grid gap-8 border-y border-inv-gold/40 py-10 sm:grid-cols-[150px_1fr] sm:gap-12 sm:py-14">
        <div className="text-center sm:pt-2"><p className="font-display text-6xl leading-none text-inv-gold/70">21</p><Label>AR-RUM</Label></div>
        <div className="text-center sm:text-right">
          <p lang="ar" dir="rtl" className="font-arab text-[clamp(25px,5vw,38px)] leading-[2] text-inv-accent">{verse}</p>
          <p className="mx-auto mt-6 max-w-[66ch] text-[14px] leading-[1.9] text-inv-ink/75 sm:ml-auto">{verseMeaning}</p>
        </div>
      </div>
    </Frame>
  </section>;
}

function Couple({ inv }: { inv: InvitationView }) {
  return <section className="bg-sk-pasir py-20 sm:py-28">
    <Frame>
      <Heading kicker="DUA PRIBADI · SATU JANJI">Dipersatukan dalam doa</Heading>
      {inv.honor && <p className="mx-auto -mt-3 mb-12 max-w-[60ch] text-center text-[14px] leading-relaxed text-inv-ink/70">{inv.honor}</p>}
      <div className="mx-auto grid max-w-[1000px] gap-10 sm:grid-cols-2 sm:items-start sm:gap-12">
        {[inv.groom, inv.bride].map((person, i) => <article key={person.name} className="text-center">
          <div className="relative mx-auto aspect-[5/4] w-full overflow-hidden border border-inv-paper p-1.5 shadow-[0_14px_30px_rgba(32,44,39,.12)]"><div className="relative size-full overflow-hidden"><Image {...person.frame} src={person.photo} alt={person.full || person.name} fill sizes="(min-width: 640px) 45vw, 90vw" className="object-cover object-[50%_40%]" /></div></div>
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
  return <section className="bg-inv-paper py-20 sm:py-28">
    <Frame className="max-w-[900px]"><Heading kicker="LANGKAH-LANGKAH KECIL">Menuju hari yang dijanjikan</Heading>
      <ol className="relative mx-auto max-w-[760px] border-l border-inv-gold/50 pl-7 sm:pl-12">{inv.story.map((item, i) => <li key={`${item.title}-${i}`} className="relative grid gap-2 border-b border-inv-line py-7 sm:grid-cols-[140px_1fr] sm:gap-8">
        <span aria-hidden="true" className="absolute -left-[35px] top-9 flex size-4 items-center justify-center rounded-full border border-inv-gold bg-inv-paper sm:-left-[57px]"><span className="size-1.5 rounded-full bg-inv-accent" /></span>
        <div><p className="text-[10px] tracking-[.18em] text-inv-gold uppercase">{item.date}</p><p className="mt-2 font-display text-3xl text-inv-accent">0{i + 1}</p></div>
        <div><h3 className="font-display text-3xl text-inv-ink">{item.title}</h3><p className="mt-3 text-[14px] leading-relaxed text-inv-ink/70">{item.long || item.short}</p></div>
      </li>)}</ol>
    </Frame>
  </section>;
}

function Event({ inv }: { inv: InvitationView }) {
  const calendar = calendarEventOf(inv);
  return <section className="bg-inv-paper py-20 text-inv-ink sm:py-28">
    <Frame><Heading kicker="CATAT TANGGALNYA">Hari untuk mengucap janji</Heading>
      {inv.on.countdown && <Countdown target={inv.date} className="mx-auto mb-12 grid max-w-[460px] grid-cols-3 gap-3" cellClassName="border border-inv-line bg-inv-wash px-3 py-4 font-display text-3xl text-inv-accent [&>span:last-child]:font-body [&>span:last-child]:text-[10px] [&>span:last-child]:tracking-[.14em] [&>span:last-child]:text-inv-gold" />}
      <div className="mx-auto grid max-w-[1000px] gap-10 lg:grid-cols-[1fr_.9fr] lg:items-center">
        <div className="border-y border-inv-line py-6">
          <p className="text-center font-display text-[clamp(30px,6vw,46px)] text-inv-accent lg:text-left">{inv.dateLong}</p>
          <p className="mt-2 text-center text-[13px] tracking-[.14em] text-inv-ink/60 lg:text-left">{hijri(inv.date, inv.tz)} · {inv.tz}</p>
          <div className="mt-8 grid grid-cols-2 gap-3">{inv.events.map((event, i) => <article key={`${event.name}-${i}`} className="border-l-2 border-inv-gold bg-inv-wash px-4 py-5 text-left sm:px-6">
            <Label>{event.name}</Label><p className="mt-3 font-display text-[clamp(24px,4vw,34px)] text-inv-accent">{event.time}</p>{event.until && <p className="mt-1 text-[12px] text-inv-ink/60">sampai {event.until}</p>}
          </article>)}</div>
        </div>
        <div className="grid gap-5 sm:grid-cols-[.85fr_1fr] lg:grid-cols-1 xl:grid-cols-[.85fr_1fr]">
          <div className="relative min-h-[260px] overflow-hidden border border-inv-gold/50 bg-inv-wash p-1.5"><div className="relative min-h-[248px] h-full"><Image {...inv.frame.venue} src={inv.images.venue} alt={`Suasana ${inv.venue.name}`} fill sizes="(min-width: 1024px) 360px, 90vw" className="object-cover object-[50%_25%]" /></div></div>
          <div className="flex flex-col justify-center"><Label>LOKASI</Label><h3 className="mt-3 font-display text-3xl text-inv-accent">{inv.venue.name}</h3><p className="mt-2 text-[13px] leading-relaxed text-inv-ink/70">{inv.venue.address}</p><div className="mt-5 flex flex-wrap gap-3">{inv.venue.mapUrl && <a className={button} href={inv.venue.mapUrl} target="_blank" rel="noreferrer">Buka peta</a>}<CalendarButton slug={inv.slug} google={googleCalendarUrl(calendar)} className={button}>Simpan tanggal</CalendarButton></div></div>
        </div>
      </div>
    </Frame>
  </section>;
}

function GallerySection({ inv }: { inv: InvitationView }) {
  if (!inv.gallery.length) return null;
  return <section className="bg-inv-wash py-20 sm:py-28"><Frame><Heading kicker="POTRET KASIH">Ruang kecil untuk kenangan</Heading><div className="mx-auto max-w-[1000px]"><Gallery photos={inv.gallery} stamp={inv.dateShort} variant="grid" /></div></Frame></section>;
}

function RsvpSection({ inv }: { inv: InvitationView }) {
  return <section className="bg-inv-paper py-20 sm:py-28"><Frame className="max-w-[860px]"><div className="grid overflow-hidden border border-inv-line bg-inv-wash md:grid-cols-[.85fr_1.15fr]">
    <div className="relative isolate flex min-h-[250px] flex-col justify-end overflow-hidden bg-inv-accent px-7 py-8 text-inv-wash sm:px-10"><Image {...inv.frame.heroWide} src={inv.images.heroWide} alt="" fill sizes="(min-width: 768px) 340px, 90vw" className="absolute inset-0 object-cover opacity-40" /><div aria-hidden="true" className="absolute inset-0 bg-inv-night/45" /><Pattern name="khatam" color="var(--sk-emas)" opacity={0.18} /><div className="relative"><Label light>KABAR KEHADIRAN</Label><h2 className="mt-3 font-display text-[clamp(34px,6vw,48px)] leading-tight">Bersama dalam doa</h2><p className="mt-3 max-w-[30ch] text-[13px] leading-relaxed text-inv-wash/75">Kami menantikan kabar baik dan doa dari Anda.</p></div></div>
    <div className="p-6 sm:p-10"><Rsvp slug={inv.slug} deadline={inv.rsvpDeadline} /></div>
  </div></Frame></section>;
}

function Gifts({ inv }: { inv: InvitationView }) {
  if (!inv.gifts.length && !inv.images.qris) return null;
  return <section className="bg-inv-paper py-20 sm:py-28"><Frame><Heading kicker="TANDA KASIH">Doa yang paling kami harapkan</Heading>
    <div className="mx-auto grid max-w-[820px] grid-cols-1 gap-4 sm:grid-cols-2">{inv.gifts.map((gift) => <article key={gift.number} className={`border border-inv-line bg-inv-wash p-6 text-center ${inv.gifts.length === 1 ? "sm:col-span-2 sm:w-[calc(50%-0.5rem)] sm:justify-self-center" : ""}`}><Label>{gift.bank}</Label><p className="mt-4 font-display text-2xl">{gift.number}</p><p className="mt-1 text-[12px] text-inv-ink/65">a.n. {gift.holder}</p><div className="mt-4"><CopyButton value={gift.number} label={`nomor rekening ${gift.holder}`} /></div></article>)}
      {inv.images.qris && <div className="border border-inv-line bg-inv-wash p-6 text-center"><Label>QRIS</Label><Image src={inv.images.qris} alt="Kode QRIS" width={160} height={160} className="mx-auto mt-4 size-40" /><QrisDownload src={inv.images.qris} slug={inv.slug} /></div>}
    </div>{inv.giftNote && <p className="mt-6 text-center text-xs text-inv-ink/65">{inv.giftNote}</p>}
  </Frame></section>;
}

async function Guestbook({ inv }: { inv: InvitationView }) {
  const wishes = await getWishes(inv.slug);
  return <section className="bg-inv-wash py-20 sm:py-28"><Frame className="max-w-[790px]"><Heading kicker="DOA DAN UCAPAN">Titipkan doa untuk kami</Heading><div className="border border-inv-line bg-inv-paper p-5 sm:p-10"><Wishes slug={inv.slug} initial={wishes} variant="lined" desktop="stack-when-empty" /></div></Frame></section>;
}

function Closing({ inv }: { inv: InvitationView }) {
  return <section className="relative isolate overflow-hidden bg-inv-night py-24 text-center text-inv-wash sm:py-32">
    <Pattern name="khatam" color="var(--sk-emas)" opacity={0.1} scale={1.2} />
    <Frame className="relative max-w-[760px]"><p lang="ar" dir="rtl" className="font-arab text-[clamp(30px,8vw,46px)] leading-loose text-inv-gold-light">جَزَاكُمُ اللَّهُ خَيْرًا</p><Label light>JAZAKUMULLAHU KHAIRAN</Label>
      <p className="mx-auto mt-6 max-w-[48ch] font-display text-[clamp(25px,4vw,36px)] italic leading-snug text-inv-wash/85">Semoga Allah membalas setiap doa dengan kebaikan yang berlipat.</p>
      <Pita className="mx-auto mt-8 h-4 w-52 text-inv-gold" /><p className="mt-7 font-display text-[clamp(42px,9vw,72px)] leading-none">{inv.groom.name} <span className="text-inv-gold-light">&amp;</span> {inv.bride.name}</p><p className="mt-5 text-[10px] tracking-[.2em] text-inv-gold-light uppercase">{inv.dateLong}</p>
    </Frame>
  </section>;
}

async function Main({ inv }: { inv: InvitationView }) {
  return <main><Hero inv={inv} /><Extras inv={inv} at="hero" />{inv.on.couple && <Couple inv={inv} />}<Extras inv={inv} at="couple" /><Ayat /><Extras inv={inv} at="story" />{inv.on.story && <Story inv={inv} />}<Extras inv={inv} at="event" />{inv.on.event && <Event inv={inv} />}<Extras inv={inv} at="gallery" />{inv.on.gallery && <GallerySection inv={inv} />}{inv.on.rsvp && <RsvpSection inv={inv} />}<Extras inv={inv} at="rsvp" />{inv.on.gifts && <Gifts inv={inv} />}<Extras inv={inv} at="gifts" />{inv.on.wishes && <Guestbook inv={inv} />}<Extras inv={inv} at="wishes" />{inv.on.closing && <Closing inv={inv} />}<Extras inv={inv} at="closing" /></main>;
}

export function FarisNajwa({ inv }: { inv: InvitationView }) {
  const style = { ...vars, ...inv.palette, ...inv.fonts } as CSSProperties;
  return <InvitationShell
    door={{ kind: "mawaddah", groom: inv.groom.name, bride: inv.bride.name, monogram: inv.monogram, date: inv.dateLong.replace(/^Minggu/, "Ahad"), hijri: hijri(inv.date, inv.tz), city: inv.city }}
    music={inv.music}
    className={`${themeFonts} fw-root min-h-dvh overflow-x-clip bg-inv-paper font-body text-[16px] text-inv-ink`}
    style={style}
  >
    <style>{`html:has(.fw-root){background:${inv.palette["--inv-paper"]};scrollbar-color:${inv.palette["--sk-emas"]} ${inv.palette["--inv-paper"]}}html:has(.sk-door){background:${inv.palette["--sk-night2"]}}`}</style>
    <Main inv={inv} />
    <footer className="bg-inv-night py-7 text-center text-[10px] tracking-[.17em] text-inv-wash/55 uppercase">Mawaddah · <Link href="/" className="text-inv-gold-light underline underline-offset-4">Sowanan</Link>{inv.credit && <span> · {inv.credit}</span>}</footer>
  </InvitationShell>;
}
