import Image from "next/image";
import Link from "next/link";
import type { CSSProperties, ReactNode } from "react";
import { CalendarButton } from "@/components/invitation/calendar-button";
import { CopyButton } from "@/components/invitation/copy-button";
import { Extras } from "@/components/invitation/extras";
import { Gallery } from "@/components/invitation/gallery";
import { Greeting } from "@/components/invitation/greeting";
import { Boras, FloraTepi, HeroScene, Hias, KisahTumpuk, NadaDefs, UlosCountdown, UlosPita } from "@/components/invitation/horas/scene";
import { QrisDownload } from "@/components/invitation/qris-download";
import { Rsvp } from "@/components/invitation/rsvp";
import { InvitationShell } from "@/components/invitation/shell";
import { Wishes } from "@/components/invitation/wishes";
import { RevealOnScroll } from "@/components/reveal-on-scroll";
import { reveal } from "@/components/ui";
import { googleCalendarUrl } from "@/lib/calendar";
import { getWishes } from "@/lib/guestbook";
import { calendarEventOf, type InvitationView } from "@/lib/invitation/view";
import { themeFonts } from "./fonts";

// Warna datang dari palet (palette.ts), di sini hanya font.
const vars = {
  "--inv-grain": "none",
  "--inv-display": "var(--font-hr-display), Georgia, serif",
  "--inv-script": "var(--font-hr-script), cursive",
  "--inv-body": "var(--font-hr-body), 'Helvetica Neue', Arial, sans-serif",
} as CSSProperties;

const ASET = "/img/bonar-anggi";

const TONES = {
  gading: { bg: "var(--inv-paper)", dark: false },
  kartu: { bg: "var(--inv-wash)", dark: false },
  merah: { bg: "var(--hr-merah)", dark: true },
  malam: { bg: "var(--inv-night)", dark: true },
} as const;

type Tone = keyof typeof TONES;

type Letak = "atas" | "bawah" | "sisi";

function Section({ tone, hias = [], className = "", children }: { tone: Tone; hias?: Letak[]; className?: string; children: ReactNode }) {
  const t = TONES[tone];
  return (
    <section className={`hr-bagian relative py-16 lg:py-24 ${t.dark ? "hr-gelap text-inv-wash" : "text-inv-ink"} ${className}`} style={{ backgroundColor: t.bg }}>
      {hias.map((l) => (
        <Hias key={l} letak={l} nada={t.dark ? "gelap" : "lembut"} className={t.dark ? "opacity-60" : ""} />
      ))}
      {children}
    </section>
  );
}

function Wrap({ children, className = "" }: { children: ReactNode; className?: string }) {
  // Isi selalu di atas hiasan flora bagian, supaya teks dan isian formulir tidak tertutup daun.
  return <div className={`relative z-10 mx-auto w-full max-w-[1080px] px-5 sm:px-8 ${className}`}>{children}</div>;
}

function Heading({ kicker, children, light = false, center = false }: { kicker: string; children: ReactNode; light?: boolean; center?: boolean }) {
  return (
    <div {...reveal()} className={`mb-10 ${center ? "flex flex-col items-center text-center" : ""}`}>
      <p className={`text-[12px] tracking-[0.34em] ${light ? "text-inv-gold-light" : "text-inv-accent"}`}>{kicker}</p>
      <h2 className={`mt-3 font-display text-[clamp(30px,7.6vw,50px)] leading-[1.08] font-semibold ${light ? "text-inv-wash" : "text-inv-ink"}`}>{children}</h2>
      <div aria-hidden="true" className="hr-ipon mt-4 h-2 w-28" />
    </div>
  );
}

function Hero({ inv }: { inv: InvitationView }) {
  return (
    <HeroScene
      foto={inv.images.hero}
      frame={inv.frame.hero}
      alt={`${inv.groom.name} dan ${inv.bride.name}`}
      text={
        <>
          <h1 className="sr-only">
            {inv.groom.name} dan {inv.bride.name}
          </h1>
          <p className="hr-masuk hr-teks-1 text-[13px] tracking-[0.5em] text-inv-gold-light">PERNIKAHAN</p>
          <p aria-hidden="true" className="hr-masuk hr-teks-2 mt-2 font-script text-[clamp(50px,13.5vw,100px)] leading-[0.95] [text-shadow:0_4px_24px_rgba(0,0,0,.45)]">
            {inv.groom.name}
            <span className="my-1 block font-display text-[0.32em] text-inv-gold-light lg:mx-4 lg:my-0 lg:inline">&amp;</span>
            {inv.bride.name}
          </p>
        </>
      }
      bawah={
        <>
          <p className="hr-masuk hr-teks-3 font-display text-[clamp(16px,4.4vw,21px)] tracking-[0.12em]">{inv.dateLong}</p>
          <p className="hr-masuk hr-teks-3 mt-1 text-[15px] text-inv-wash/85">{inv.city}</p>
        </>
      }
    />
  );
}

// Sambutan: foto pasangan berbingkai ulos, salam, dan ayat.
function Sambutan({ inv }: { inv: InvitationView }) {
  return (
    <Section tone="gading" hias={["atas", "bawah"]}>
      <Wrap className="grid items-center gap-12 lg:grid-cols-[minmax(0,420px)_1fr] lg:gap-20">
        <div {...reveal()} className="relative mx-auto w-[min(82vw,420px)]">
          <div aria-hidden="true" className="hr-ulos absolute -inset-3 rounded-t-[999px] sm:-inset-4" />
          <div className="relative aspect-[4/5] overflow-hidden rounded-t-[999px] shadow-[0_0_0_4px_var(--inv-gold-light)]">
            <div className="hr-napas absolute inset-0">
              <Image {...inv.frame.hero} src={inv.images.hero} alt={`${inv.groom.name} dan ${inv.bride.name}`} fill sizes="(min-width: 1024px) 420px, 82vw" className="object-cover object-[50%_30%]" />
            </div>
          </div>
        </div>
        <div className="text-center lg:text-left">
          <p {...reveal(1)} className="text-[13px] tracking-[0.34em] text-inv-accent">
            PASU-PASU
          </p>
          <p {...reveal(2)} className="mt-4 font-display text-[clamp(26px,6.6vw,38px)] leading-tight font-semibold">
            Dengan kasih dan berkat Tuhan
          </p>
          <p {...reveal(3)} className="mx-auto mt-5 max-w-[44ch] text-[18px] leading-relaxed text-inv-ink/85 lg:mx-0">
            {inv.honor}
          </p>
          <Greeting className="mt-4 text-[16px] text-inv-accent" />
          {inv.quote && (
            <figure {...reveal(4)} className="mx-auto mt-9 max-w-[46ch] border-t border-inv-line pt-6 lg:mx-0">
              <blockquote className="text-[clamp(18px,4.6vw,21px)] leading-relaxed text-inv-ink italic">&ldquo;{inv.quote}&rdquo;</blockquote>
              <figcaption className="mt-2 text-[14px] tracking-[0.14em] text-inv-accent">MATIUS 19 : 6</figcaption>
            </figure>
          )}
        </div>
      </Wrap>
    </Section>
  );
}

function Couple({ inv }: { inv: InvitationView }) {
  const kartu = (p: typeof inv.groom, sisi: "kiri" | "kanan", i: number) => (
    <div {...reveal(i)} className={`hr-kartu hr-kartu-${sisi} relative`}>
      <div className="relative aspect-[3/4] overflow-hidden rounded-sm shadow-[0_24px_48px_rgba(0,0,0,.4)]">
        <Image {...p.frame} src={p.photo} alt={p.full || p.name} fill sizes="(min-width: 640px) 360px, 80vw" className="object-cover object-top" />
        <div aria-hidden="true" className={`hr-selempang hr-ulos absolute ${sisi === "kiri" ? "-right-10" : "-left-10"} bottom-10 h-9 w-[70%]`} />
      </div>
      <p className="mt-6 font-script text-[clamp(44px,12vw,64px)] leading-none text-inv-gold-light">{p.name}</p>
      <p className="mt-2 font-display text-[clamp(17px,4.4vw,22px)] font-semibold">{p.full || p.name}</p>
      <p className="mx-auto mt-2 max-w-[32ch] text-[16px] leading-snug text-inv-wash/80">
        {p.role} <span className="text-inv-wash">{p.parents}</span>
      </p>
    </div>
  );
  return (
    <Section tone="merah" hias={["sisi"]}>
      <Boras count={10} className="opacity-60" />
      <Wrap>
        <Heading kicker="DUA KELUARGA" light center>
          Mempelai
        </Heading>
        <div className="mx-auto grid max-w-[820px] gap-14 text-center sm:grid-cols-2 sm:gap-12">
          {kartu(inv.groom, "kiri", 1)}
          {kartu(inv.bride, "kanan", 2)}
        </div>
      </Wrap>
    </Section>
  );
}

function StorySection({ inv }: { inv: InvitationView }) {
  return (
    <Section tone="kartu" hias={["atas", "sisi", "bawah"]}>
      <Wrap className="max-w-[980px]">
        <Heading kicker="PERJALANAN" center>
          Kisah kami
        </Heading>
        <p {...reveal(1)} className="mx-auto -mt-4 mb-10 max-w-[40ch] text-center text-[16px] text-inv-ink/75">
          Gulir pelan, tiap lembar cerita akan menumpuk seperti ulos yang dilipat.
        </p>
        <KisahTumpuk items={inv.story.map((s) => ({ title: s.title, date: s.date, image: s.image, short: s.short, long: s.long }))} />
      </Wrap>
    </Section>
  );
}

function EventDetails({ inv }: { inv: InvitationView }) {
  const btn = "inline-flex items-center gap-2 rounded-sm bg-inv-gold-light px-5 py-3 text-[15px] text-inv-night no-underline transition-transform duration-150 hover:-translate-y-0.5";
  return (
    <Section tone="malam" hias={["atas"]}>
      <div aria-hidden="true" className="pointer-events-none absolute inset-x-0 bottom-0 flex justify-center opacity-[0.16]">
        <Image src={`${ASET}/rumah-depan.webp`} alt="" width={1400} height={1468} sizes="100vw" className="hr-napas h-auto w-[min(120vw,900px)] max-w-none" style={{ filter: "url(#hr-nada-tengah)" }} />
      </div>
      <Wrap className="lg:grid lg:grid-cols-[1fr_400px] lg:gap-16">
        <div>
          <Heading kicker="ACARA" light>
            Rangkaian acara
          </Heading>
          <p {...reveal(1)} className="font-display text-[clamp(22px,6vw,30px)] text-inv-gold-light">
            {inv.dateLong}
          </p>
          <div className="mt-8 grid gap-4">
            {inv.events.map((e, i) => (
              <div key={e.name} {...reveal(i + 2)} className="hr-acara relative overflow-hidden rounded-sm bg-inv-wash/[0.06] py-5 pr-5 pl-12 ring-1 ring-inv-gold/40">
                <div aria-hidden="true" className="hr-ulos-tegak absolute inset-y-0 left-0 w-7" />
                <p className="font-display text-[clamp(21px,5.4vw,26px)] leading-tight font-semibold text-inv-wash">{e.name}</p>
                <p className="mt-1 text-[16px] text-inv-gold-light">
                  {e.time}
                  {e.until ? ` sampai ${e.until}` : ""} {inv.tz}
                </p>
              </div>
            ))}
          </div>
        </div>
        <div {...reveal(2)} className="mt-12 lg:mt-24">
          <div className="relative aspect-[4/5] overflow-hidden rounded-sm shadow-[0_0_0_4px_var(--inv-night),0_0_0_5px_var(--inv-gold)]">
            <Image {...inv.frame.venue} src={inv.images.venue} alt={`Suasana ${inv.venue.name}`} fill sizes="(min-width: 1024px) 400px, 90vw" className="object-cover" />
          </div>
          <p className="mt-5 font-display text-[24px] font-semibold">{inv.venue.name}</p>
          <p className="mt-1 text-[16px] text-inv-wash/80">{inv.venue.address}</p>
          <div className="mt-5 flex flex-wrap gap-3">
            <a href={inv.venue.mapUrl} target="_blank" rel="noopener" className={btn}>
              Buka peta
            </a>
            <CalendarButton slug={inv.slug} google={googleCalendarUrl(calendarEventOf(inv))} className={btn}>
              Simpan ke kalender
            </CalendarButton>
          </div>
        </div>
      </Wrap>
    </Section>
  );
}

function CountdownSection({ inv }: { inv: InvitationView }) {
  return (
    <Section tone="merah" hias={["sisi"]}>
      <Wrap className="max-w-[760px]">
        <Heading kicker="MENUJU HARI H" light center>
          Menuju hari bahagia
        </Heading>
        <div {...reveal(1)}>
          <UlosCountdown target={inv.date} />
        </div>
      </Wrap>
    </Section>
  );
}

function GallerySection({ inv }: { inv: InvitationView }) {
  return (
    <Section tone="gading" hias={["atas", "bawah"]}>
      <Wrap>
        <Heading kicker="KENANGAN" center>
          Galeri
        </Heading>
        <div {...reveal(1)}>
          <Gallery photos={inv.gallery.map((p) => ({ src: p.src, w: p.w, h: p.h, alt: p.alt }))} />
        </div>
      </Wrap>
    </Section>
  );
}

function RsvpSection({ inv }: { inv: InvitationView }) {
  return (
    <Section tone="malam" hias={["sisi"]}>
      <Wrap className="max-w-[640px]">
        <Heading kicker="KEHADIRAN" light center>
          Konfirmasi kehadiran
        </Heading>
        <div {...reveal(1)} className="relative overflow-hidden rounded-sm bg-inv-paper px-6 pt-12 pb-10 text-inv-ink sm:px-10">
          <div aria-hidden="true" className="hr-ulos absolute inset-x-0 top-0 h-4" />
          <Rsvp slug={inv.slug} deadline={inv.rsvpDeadline} />
        </div>
      </Wrap>
    </Section>
  );
}

function Gifts({ inv }: { inv: InvitationView }) {
  return (
    <Section tone="gading" hias={["bawah"]}>
      <Wrap className="max-w-[820px]">
        <Heading kicker="AMPLOP DIGITAL" center>
          Tanda kasih
        </Heading>
        <p {...reveal(1)} className="mx-auto -mt-4 max-w-[44ch] text-center text-[17px] leading-relaxed text-inv-ink/85">
          Doa restu Bapak/Ibu/Saudara/i sudah lebih dari cukup. Bagi yang ingin memberi tanda kasih, rekeningnya ada di bawah ini.
        </p>
        <div className="mt-10 grid gap-5 sm:grid-cols-2">
          {inv.gifts.map((g, i) => (
            <div key={g.number} {...reveal(i + 2)} className="relative overflow-hidden rounded-sm bg-inv-night px-6 pt-9 pb-6 text-inv-wash shadow-[0_18px_36px_rgba(42,26,21,.22)]">
              <div aria-hidden="true" className="hr-ulos absolute inset-x-0 top-0 h-3" />
              <p className="text-[13px] tracking-[0.24em] text-inv-gold-light">{g.bank}</p>
              <p className="mt-3 font-display text-[clamp(22px,6vw,28px)] tracking-[0.06em] tabular-nums">{g.number}</p>
              <p className="mt-1 text-[15px] text-inv-wash/80">a.n. {g.holder}</p>
              <div className="mt-5">
                <CopyButton value={g.number.replace(/\D/g, "")} label="Salin nomor" />
              </div>
            </div>
          ))}
        </div>
        {inv.images.qris && (
          <div className="mx-auto mt-8 flex max-w-[380px] items-center gap-5 rounded-sm bg-inv-wash p-5 ring-1 ring-inv-line">
            <Image src={inv.images.qris} alt="Kode QRIS" width={112} height={112} className="size-28" />
            <div>
              <p className="text-[15px] leading-relaxed">Pindai QRIS dari aplikasi bank atau e-wallet.</p>
              <QrisDownload src={inv.images.qris} slug={inv.slug} />
            </div>
          </div>
        )}
        {inv.giftNote && <p className="mt-6 text-center text-[14px] text-inv-ink/70">{inv.giftNote}</p>}
      </Wrap>
    </Section>
  );
}

async function WishesSection({ inv }: { inv: InvitationView }) {
  const wishes = await getWishes(inv.slug);
  return (
    <Section tone="kartu" hias={["atas", "sisi"]}>
      <Wrap className="max-w-[860px]">
        <Heading kicker="DOA RESTU" center>
          Doa dan ucapan
        </Heading>
        <div {...reveal(1)}>
          <Wishes slug={inv.slug} initial={wishes} variant="lined" />
        </div>
      </Wrap>
    </Section>
  );
}

function Closing({ inv }: { inv: InvitationView }) {
  return (
    <section className="hr-penutup relative isolate flex min-h-[max(620px,100svh)] items-end overflow-hidden text-inv-wash">
      <div className="hr-napas absolute inset-0 -z-20">
        <Image {...inv.frame.closing} src={inv.images.closing} alt={`${inv.groom.name} dan ${inv.bride.name}`} fill sizes="100vw" className="object-cover object-[50%_35%]" />
      </div>
      <div aria-hidden="true" className="absolute inset-0 -z-10 bg-[linear-gradient(180deg,rgba(18,12,11,.15)_0%,rgba(18,12,11,.35)_45%,var(--inv-night)_92%)]" />
      <FloraTepi />
      <Boras count={26} />
      <Wrap className="relative pb-20 text-center lg:pb-24">
        <p {...reveal()} className="text-[13px] tracking-[0.42em] text-inv-gold-light">
          DENGAN SUKACITA
        </p>
        <p {...reveal(1)} className="mt-4 font-display text-[clamp(38px,10vw,64px)] leading-tight font-semibold">
          Terima kasih
        </p>
        <p {...reveal(2)} className="mx-auto mt-4 max-w-[42ch] text-[17px] leading-relaxed text-inv-wash/85">
          Merupakan kebahagiaan bagi kami apabila Bapak/Ibu/Saudara/i berkenan hadir dan memberikan doa restu.
        </p>
        {inv.umpasa && (
          <figure {...reveal(3)} className="mx-auto mt-8 max-w-[40ch] border-y border-inv-gold/50 py-5">
            <blockquote className="text-[clamp(19px,4.8vw,23px)] leading-relaxed whitespace-pre-line text-inv-gold-light italic">
              {inv.umpasa}
            </blockquote>
            {inv.umpasaArti && <figcaption className="mt-2 text-[15px] text-inv-wash/75">{inv.umpasaArti}</figcaption>}
          </figure>
        )}
        <p {...reveal(4)} className="mt-8 font-script text-[clamp(40px,10vw,56px)] text-inv-gold-light">
          {inv.groom.name} &amp; {inv.bride.name}
        </p>
      </Wrap>
    </section>
  );
}

function Footer({ inv }: { inv: InvitationView }) {
  return (
    <footer className="bg-inv-night py-8 text-inv-wash/75">
      <Wrap className="flex flex-col items-start gap-3 sm:flex-row sm:items-center sm:justify-between">
        <p className="font-display text-xl text-inv-gold-light">{inv.monogram}</p>
        <p className="text-[13px]">
          Dibuat dengan{" "}
          <Link href="/" className="text-inv-gold-light underline underline-offset-4">
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

export function BonarAnggi({ inv }: { inv: InvitationView }) {
  return (
    <InvitationShell
      door={{ kind: "ulos", groom: inv.groom.name, bride: inv.bride.name, date: inv.dateLong }}
      music={inv.music}
      className={`${themeFonts} hr-root min-h-dvh overflow-x-clip bg-inv-paper font-body text-[17px] text-inv-ink`}
      style={{ ...vars, ...inv.palette, ...inv.fonts }}
    >
      {/* Latar dan scrollbar halaman ikut palet. html berada di luar tema, jadi tidak bisa membaca CSS variable-nya. */}
      <style>{`html:has(.hr-root){background:${inv.palette["--inv-night"]};scrollbar-color:${inv.palette["--inv-accent"]} ${inv.palette["--inv-paper"]}}`}</style>
      <noscript>
        <style>{`.hr-masuk,.hr-ulos-turun{opacity:1!important;transform:none!important}`}</style>
      </noscript>
      <NadaDefs />
      <main>
        <Hero inv={inv} />
        <UlosPita />
        <Sambutan inv={inv} />
        <Extras inv={inv} at="hero" />
        {inv.on.couple && (
          <>
            <UlosPita />
            <Couple inv={inv} />
          </>
        )}
        <Extras inv={inv} at="couple" />
        {inv.on.story && <StorySection inv={inv} />}
        <Extras inv={inv} at="story" />
        {inv.on.event && (
          <>
            <UlosPita />
            <EventDetails inv={inv} />
          </>
        )}
        <Extras inv={inv} at="event" />
        {inv.on.countdown && (
          <>
            <UlosPita />
            <CountdownSection inv={inv} />
          </>
        )}
        <Extras inv={inv} at="countdown" />
        {inv.on.gallery && <GallerySection inv={inv} />}
        <Extras inv={inv} at="gallery" />
        {inv.on.rsvp && (
          <>
            <UlosPita />
            <RsvpSection inv={inv} />
          </>
        )}
        <Extras inv={inv} at="rsvp" />
        {inv.on.gifts && <Gifts inv={inv} />}
        <Extras inv={inv} at="gifts" />
        {inv.on.wishes && <WishesSection inv={inv} />}
        <Extras inv={inv} at="wishes" />
        {inv.on.closing && (
          <>
            <UlosPita />
            <Closing inv={inv} />
          </>
        )}
        <Extras inv={inv} at="closing" />
      </main>
      <Footer inv={inv} />
      <RevealOnScroll />
    </InvitationShell>
  );
}
