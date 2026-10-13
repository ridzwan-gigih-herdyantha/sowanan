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

// Rembulan: undangan sebagai almanak langit malam. Bulan yang tampil adalah bulan sungguhan pada malam pernikahan,
// dan setiap section memakai fase bulan yang makin penuh menuju malam itu. Warna dari palette.ts, di sini hanya font.
const vars = {
  "--inv-display": "var(--font-rb-display), 'Times New Roman', serif",
  "--inv-body": "var(--font-rb-body), Georgia, serif",
  "--rb-label": "var(--font-rb-label), Georgia, serif",
  // Langit pembuka dan hero sama persis, supaya pembuka bisa larut tanpa terlihat berganti latar.
  "--rb-sky": "radial-gradient(110% 80% at 72% 12%, color-mix(in srgb, var(--inv-wash) 90%, var(--inv-accent)) 0%, var(--inv-paper) 52%, var(--inv-night) 100%)",
} as CSSProperties;

type Moon = ReturnType<typeof moonOf>;
const enter = (delay: number) => ({ className: "inv-enter", style: { "--enter-delay": `${delay}s` } as CSSProperties });
const button =
  "rb-label inline-flex items-center justify-center gap-2 rounded-full border border-inv-gold/60 px-6 py-3 text-[12px] tracking-[0.24em] text-inv-ink no-underline transition-[background-color,border-color] duration-300 hover:border-inv-accent hover:bg-inv-accent/10";

function Wrap({ children, className = "" }: { children: ReactNode; className?: string }) {
  return <div className={`relative mx-auto w-full max-w-[1160px] px-5 sm:px-8 ${className}`}>{children}</div>;
}

function Label({ children, className = "" }: { children: ReactNode; className?: string }) {
  return <p className={`rb-label text-[11px] tracking-[0.3em] text-inv-gold ${className}`}>{children}</p>;
}

// Satu halaman almanak: kolom kiri berisi fase bulan dan nama bagian, kolom kanan isinya. Fase setiap bagian
// makin penuh dari atas ke bawah, jadi halaman ini sendiri seperti satu bulan menuju malam pernikahan.
function Folio({ phase, label, title, children, wash = false, seed }: { phase: number; label: string; title: ReactNode; children: ReactNode; wash?: boolean; seed: number }) {
  return (
    <section className={`relative overflow-hidden py-24 lg:py-32 ${wash ? "inv-wash" : "inv-paper"}`}>
      <Starfield density={0.4} seed={seed} />
      <Wrap className="grid gap-10 lg:grid-cols-[200px_minmax(0,1fr)] lg:gap-16">
        <aside className="flex items-center gap-4 lg:flex-col lg:items-start lg:gap-5">
          <MoonDisc id={`rb-folio-${seed}`} age={phase} glow={false} small className="size-9" />
          <div className="h-px flex-1 bg-inv-line lg:h-16 lg:w-px lg:flex-none" />
          <Label>{label}</Label>
        </aside>
        <div className="min-w-0">
          <h2 className="font-display text-[clamp(38px,7.4vw,76px)] leading-[1.02] text-balance text-inv-ink">{title}</h2>
          {children}
        </div>
      </Wrap>
    </section>
  );
}

// Hero: foto pasangan bercahaya bulan, dengan bulan malam pernikahan besar di belakangnya yang boleh terpotong
// tepi layar. Pembuka menerbangkan bulannya ke data-rb-target, jadi bulan ini tidak ikut animasi masuk.
function Hero({ inv, moon }: { inv: InvitationView; moon: Moon }) {
  return (
    <section className="relative overflow-hidden lg:min-h-svh" style={{ background: "var(--rb-sky)" }}>
      <Starfield meteors seed={11} />
      <Wrap className="grid items-center gap-10 pt-[max(40px,7vh)] pb-16 lg:min-h-svh lg:grid-cols-[minmax(0,6fr)_minmax(0,5fr)] lg:gap-14 lg:py-16">
        <div className="relative mx-auto w-[min(86vw,440px)] lg:order-2 lg:w-full lg:max-w-[460px]">
          <div data-rb-target="moon" className="absolute -top-[22%] -right-[42%] aspect-square w-[92%] lg:-top-[26%] lg:-right-[58%] lg:w-[118%]">
            <MoonDisc id="rb-hero" age={moon.age} className="size-full" />
          </div>
          <div {...enter(0.35)} className="inv-enter relative aspect-[4/5] overflow-hidden rounded-sm ring-1 ring-inv-gold-light/50 shadow-[0_0_0_8px_color-mix(in_srgb,var(--inv-accent)_6%,transparent),0_0_90px_10px_color-mix(in_srgb,var(--inv-accent)_22%,transparent)]">
            <Image src={inv.images.hero} alt={`${inv.groom.name} dan ${inv.bride.name}`} fill sizes="(min-width: 1024px) 460px, 86vw" priority className="object-cover object-[50%_35%]" />
            <div aria-hidden="true" className="absolute inset-0 bg-linear-to-t from-inv-night/70 via-transparent to-inv-night/20" />
          </div>
        </div>

        <div className="lg:order-1">
          <Label className="inv-enter">Undangan Pernikahan</Label>
          <h1 {...enter(0.5)} className="inv-enter mt-4 font-display text-[clamp(60px,15vw,150px)] leading-[0.88] text-inv-ink">
            {inv.groom.name}
            <span className="block pl-[0.6em]">
              <span className="mr-3 font-body text-[0.32em] text-inv-gold italic">&amp;</span>
              {inv.bride.name}
            </span>
          </h1>
          <div {...enter(0.8)} className="inv-enter mt-8 border-t border-inv-line pt-5">
            <p className="rb-label text-[13px] tracking-[0.22em] text-inv-ink/90">{inv.dateLong}</p>
            <p className="mt-1.5 text-[16px] text-inv-ink/70 italic">
              {inv.venue.name}, {inv.cityShort}
            </p>
            <p className="mt-4 text-[15px] text-inv-gold italic">
              {moon.name} di malam pernikahan, {moon.percent}% terang
            </p>
          </div>
          <Greeting className="inv-enter mt-4 text-[15px] text-inv-gold" />
        </div>
      </Wrap>
    </section>
  );
}

function Intro({ inv }: { inv: InvitationView }) {
  if (!inv.tagline) return null;
  return (
    <section className="inv-paper relative overflow-hidden py-24 lg:py-32">
      <Starfield density={0.4} seed={2} />
      <Wrap>
        <p className="max-w-[22ch] font-display text-[clamp(32px,6.4vw,64px)] leading-[1.1] text-balance text-inv-ink lg:ml-[216px]">{inv.tagline}</p>
      </Wrap>
    </section>
  );
}

// Dua foto bulat yang saling menutupi seperti gerhana, nama masing-masing di sisinya.
function Couple({ inv, phase }: { inv: InvitationView; phase: number }) {
  const people = [
    { p: inv.groom, side: "text-left" },
    { p: inv.bride, side: "text-right" },
  ];
  return (
    <Folio phase={phase} label="Kedua mempelai" title="Dua cahaya, satu malam" wash seed={8}>
      {inv.honor && <p className="mt-6 max-w-[52ch] text-[17px] leading-relaxed text-inv-ink/75 italic">{inv.honor}</p>}
      <div className="mt-14 flex justify-center">
        {people.map(({ p }, i) => (
          <div key={p.name} className={`relative size-[min(44vw,300px)] overflow-hidden rounded-full ring-1 ring-inv-gold-light/60 ${i ? "-ml-[9%] mix-blend-normal" : ""}`}>
            <Image src={p.photo} alt={`Foto ${p.name}`} fill sizes="300px" className="object-cover object-[50%_28%]" />
          </div>
        ))}
      </div>
      <div className="mt-10 grid grid-cols-2 gap-6">
        {people.map(({ p, side }) => (
          <div key={p.name} className={side}>
            <p className="font-display text-[clamp(38px,7vw,64px)] leading-none text-inv-ink">{p.name}</p>
            <p className="rb-label mt-3 text-[12px] tracking-[0.14em] text-inv-gold">{p.full}</p>
            <p className="mt-3 text-[15px] leading-relaxed text-inv-ink/75">
              <span className="text-inv-ink/55 italic">{p.role}</span> {p.parents}
            </p>
          </div>
        ))}
      </div>
    </Folio>
  );
}

// Cerita sebagai deretan malam: di layar lebar berjajar mendatar pada satu garis, di HP digeser ke samping.
function StorySection({ inv, phase }: { inv: InvitationView; phase: number }) {
  return (
    <Folio phase={phase} label="Cerita kami" title="Di bawah bulan yang berganti" seed={13}>
      <ol className="relative mt-14 -mr-5 flex snap-x snap-mandatory gap-6 overflow-x-auto pr-5 pb-2 [scrollbar-width:none] sm:-mr-8 sm:pr-8 lg:mr-0 lg:grid lg:grid-cols-4 lg:overflow-visible lg:pr-0 [&::-webkit-scrollbar]:hidden">
        <span aria-hidden="true" className="absolute top-4 right-0 left-0 h-px bg-inv-line" />
        {inv.story.map((s, i) => {
          const day = parseDay(s.date);
          const moon = day ? moonOf(day) : null;
          return (
            <li key={`${s.title}-${i}`} className="relative w-[74%] shrink-0 snap-start sm:w-[46%] lg:w-auto">
              {moon ? (
                <MoonDisc id={`rb-timeline-${i}`} age={moon.age} glow={false} small className="relative size-8 rounded-full bg-inv-paper" />
              ) : (
                <span className="relative mt-3 block size-2.5 rounded-full bg-inv-gold" />
              )}
              <Label className="mt-5">{s.date}</Label>
              {moon && <p className="mt-1 text-[13px] text-inv-gold-light italic">{moon.name} malam itu</p>}
              <h3 className="mt-3 font-display text-[clamp(26px,3.2vw,32px)] leading-tight text-inv-ink">{s.title}</h3>
              <p className="mt-2 text-[15px] leading-relaxed text-inv-ink/75">{s.short}</p>
              <div className="relative mt-5 aspect-[4/5] overflow-hidden rounded-sm">
                <Image src={s.image} alt={s.title} fill sizes="(min-width: 1024px) 230px, 74vw" className="object-cover" />
              </div>
            </li>
          );
        })}
      </ol>
    </Folio>
  );
}

function Details({ inv, moon, phase }: { inv: InvitationView; moon: Moon; phase: number }) {
  return (
    <Folio phase={phase} label="Waktu dan tempat" title="Malam yang kami nantikan" wash seed={21}>
      <div className="mt-12 grid items-center gap-12 md:grid-cols-[minmax(0,5fr)_minmax(0,6fr)]">
        <div className="relative mx-auto w-[min(62vw,280px)]">
          <div aria-hidden="true" className="absolute -inset-[14%] rounded-full border border-inv-line" />
          <div aria-hidden="true" className="absolute -inset-[28%] rounded-full border border-inv-line/60" />
          <Parallax speed={0.15} max={40}>
            <MoonDisc id="rb-event-moon" age={moon.age} className="w-full" />
          </Parallax>
        </div>
        <div>
          <p className="rb-label text-[13px] tracking-[0.22em] text-inv-ink/90">{inv.dateLong}</p>
          <p className="mt-1.5 text-[15px] text-inv-gold italic">
            {moon.name}, {moon.percent}% bulan tampak terang malam itu
          </p>
          {/* Jadwal seperti tabel almanak: nama acara, titik penuntun, lalu jam. */}
          <ul className="mt-8">
            {inv.events.map((e) => (
              <li key={e.name} className="flex items-baseline gap-3 border-b border-inv-line py-4 first:border-t">
                <span className="font-display text-[clamp(24px,3.4vw,32px)] text-inv-ink">{e.name}</span>
                <span aria-hidden="true" className="mb-1.5 flex-1 border-b border-dotted border-inv-gold-light" />
                <span className="rb-label text-[15px] tracking-[0.12em] text-inv-ink tabular-nums">
                  {e.time}
                  {e.until && <> &ndash; {e.until}</>} <span className="text-inv-gold">{inv.tz}</span>
                </span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      <div className="mt-16 grid items-center gap-8 sm:grid-cols-[auto_minmax(0,1fr)] sm:gap-10">
        <div className="relative size-[min(56vw,220px)] overflow-hidden rounded-full ring-1 ring-inv-gold-light/60">
          <Image src={inv.images.venue} alt={`Suasana ${inv.venue.name}`} fill sizes="220px" className="object-cover" />
        </div>
        <div>
          <Label>Tempat</Label>
          <p className="mt-3 font-display text-[clamp(30px,4.6vw,44px)] leading-tight text-inv-ink">{inv.venue.name}</p>
          <p className="mt-2 text-[16px] leading-relaxed text-inv-ink/75">{inv.venue.address}</p>
          <div className="mt-6 flex flex-wrap gap-3">
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
    </Folio>
  );
}

function CountdownSection({ inv, phase }: { inv: InvitationView; phase: number }) {
  return (
    <Folio phase={phase} label="Menuju malam itu" title="Menghitung malam" seed={34}>
      <div className="mt-12">
        <RembulanCountdown target={inv.date} />
      </div>
    </Folio>
  );
}

function GallerySection({ inv, phase }: { inv: InvitationView; phase: number }) {
  return (
    <Folio phase={phase} label="Galeri" title="Potongan malam-malam kami" wash seed={55}>
      <div className="mt-12">
        <Gallery photos={inv.gallery} variant="strip" />
      </div>
    </Folio>
  );
}

function RsvpSection({ inv, phase }: { inv: InvitationView; phase: number }) {
  return (
    <Folio phase={phase} label="Mohon balasan" title="Konfirmasi kehadiran" seed={89}>
      <div className="mt-10 max-w-[560px]">
        <Rsvp slug={inv.slug} deadline={inv.rsvpDeadline} />
      </div>
    </Folio>
  );
}

function Gifts({ inv, phase }: { inv: InvitationView; phase: number }) {
  return (
    <Folio phase={phase} label="Tanda kasih" title="Doa restu Anda sudah lebih dari cukup" wash seed={144}>
      <p className="mt-6 max-w-[46ch] text-[17px] leading-relaxed text-inv-ink/75 italic">Bagi yang ingin memberi tanda kasih, dapat melalui rekening atau QRIS berikut.</p>
      <ul className="mt-8">
        {inv.gifts.map((g) => (
          <li key={g.number} className="grid gap-3 border-b border-inv-line py-6 first:border-t sm:grid-cols-[minmax(0,2fr)_minmax(0,3fr)_auto] sm:items-center">
            <Label>{g.bank}</Label>
            <div>
              <p className="font-display text-[30px] leading-none text-inv-ink tabular-nums">{g.number}</p>
              <p className="mt-2 text-[15px] text-inv-ink/65 italic">a.n. {g.holder}</p>
            </div>
            <CopyButton value={g.number} label={`nomor rekening ${g.holder}`} />
          </li>
        ))}
      </ul>
      {inv.images.qris && (
        <div className="mt-10 flex flex-wrap items-center gap-8">
          <div className="rounded-sm bg-white p-3">
            <Image src={inv.images.qris} alt="Kode QRIS" width={150} height={150} className="size-36" />
          </div>
          <div>
            <Label>QRIS</Label>
            <p className="mt-3 text-[15px] text-inv-ink/80">Pindai dari aplikasi bank atau e-wallet.</p>
            <QrisDownload src={inv.images.qris} slug={inv.slug} />
          </div>
        </div>
      )}
      {inv.giftNote && <p className="mt-6 text-[13px] text-inv-gold">{inv.giftNote}</p>}
    </Folio>
  );
}

async function WishesSection({ inv, phase }: { inv: InvitationView; phase: number }) {
  const wishes = await getWishes(inv.slug);
  return (
    <Folio phase={phase} label="Doa dan ucapan" title="Titipkan satu bintang untuk kami" seed={233}>
      <p className="mt-6 max-w-[46ch] text-[16px] leading-relaxed text-inv-ink/70 italic">Setiap ucapan menjadi satu bintang di langit ini. Ketuk bintang untuk membacanya.</p>
      <div className="mt-10">
        <Wishes slug={inv.slug} initial={wishes} variant="langit" />
      </div>
    </Folio>
  );
}

function Closing({ inv, moon }: { inv: InvitationView; moon: Moon }) {
  return (
    <section className="relative overflow-hidden py-28 lg:py-40">
      <Image src={inv.images.closing} alt="" fill sizes="100vw" className="object-cover" />
      <div aria-hidden="true" className="absolute inset-0 bg-linear-to-b from-inv-paper via-inv-paper/75 to-inv-paper" />
      <Starfield density={0.4} meteors seed={377} />
      <Wrap className="grid items-end gap-10 md:grid-cols-[minmax(0,1fr)_auto]">
        <div>
          <p className="max-w-[18ch] font-display text-[clamp(34px,6.6vw,68px)] leading-[1.05] text-balance text-inv-ink">Sampai jumpa di bawah bulan yang sama.</p>
          <p className="mt-6 max-w-[40ch] text-[16px] leading-relaxed text-inv-ink/75 italic">
            Atas kehadiran dan doa restu yang Anda berikan, kami ucapkan terima kasih yang setulus-tulusnya.
          </p>
          <Label className="mt-10">Kami yang berbahagia</Label>
          <p className="mt-3 font-display text-[clamp(40px,8vw,72px)] leading-none text-inv-ink">
            {inv.groom.name} <span className="font-body text-[0.46em] text-inv-gold italic">&amp;</span> {inv.bride.name}
          </p>
        </div>
        <Parallax speed={0.25} max={50} className="justify-self-center md:justify-self-end">
          <MoonDisc id="rb-close" age={moon.age} className="w-[min(40vw,180px)]" />
        </Parallax>
      </Wrap>
    </section>
  );
}

function Footer({ inv }: { inv: InvitationView }) {
  return (
    <footer className="inv-paper border-t border-inv-line py-10">
      <Wrap className="flex flex-wrap items-center justify-between gap-3">
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
  // Fase tiap bagian, dari sabit muda sampai mendekati purnama di bagian terakhir.
  const phases = [0.12, 0.2, 0.27, 0.33, 0.38, 0.42, 0.45, 0.48];
  return (
    <InvitationShell
      door={{
        kind: "bulan",
        groom: inv.groom.name,
        bride: inv.bride.name,
        date: inv.dateLong,
        place: `${inv.venue.name}, ${inv.cityShort}`,
        moon: `${moon.name} di malam pernikahan`,
        age: moon.age,
      }}
      music={inv.music}
      className={`${themeFonts} inv-paper min-h-dvh overflow-x-clip font-body text-inv-ink`}
      style={{ ...vars, ...inv.palette, ...inv.fonts }}
    >
      <main>
        <Hero inv={inv} moon={moon} />
        <Intro inv={inv} />
        <Extras inv={inv} at="hero" />
        {inv.on.couple && <Couple inv={inv} phase={phases[0]} />}
        <Extras inv={inv} at="couple" />
        {inv.on.story && <StorySection inv={inv} phase={phases[1]} />}
        <Extras inv={inv} at="story" />
        {inv.on.event && <Details inv={inv} moon={moon} phase={phases[2]} />}
        <Extras inv={inv} at="event" />
        {inv.on.countdown && <CountdownSection inv={inv} phase={phases[3]} />}
        <Extras inv={inv} at="countdown" />
        {inv.on.gallery && <GallerySection inv={inv} phase={phases[4]} />}
        <Extras inv={inv} at="gallery" />
        {inv.on.rsvp && <RsvpSection inv={inv} phase={phases[5]} />}
        <Extras inv={inv} at="rsvp" />
        {inv.on.gifts && <Gifts inv={inv} phase={phases[6]} />}
        <Extras inv={inv} at="gifts" />
        {inv.on.wishes && <WishesSection inv={inv} phase={phases[7]} />}
        <Extras inv={inv} at="wishes" />
        {inv.on.closing && <Closing inv={inv} moon={moon} />}
        <Extras inv={inv} at="closing" />
      </main>
      <Footer inv={inv} />
    </InvitationShell>
  );
}
