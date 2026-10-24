import Image from "next/image";
import Link from "next/link";
import type { CSSProperties, ReactNode } from "react";
import { CalendarButton } from "@/components/invitation/calendar-button";
import { CopyButton } from "@/components/invitation/copy-button";
import { Extras } from "@/components/invitation/extras";
import { Gallery } from "@/components/invitation/gallery";
import { Greeting } from "@/components/invitation/greeting";
import { MekarCountdown } from "@/components/invitation/mekar/countdown";
import { Petals } from "@/components/invitation/mekar/door";
import { Flora, Wash } from "@/components/invitation/mekar/flora";
import { Hummingbird } from "@/components/invitation/mekar/hummingbird";
import { QrisDownload } from "@/components/invitation/qris-download";
import { Rsvp } from "@/components/invitation/rsvp";
import { InvitationShell } from "@/components/invitation/shell";
import { Wishes } from "@/components/invitation/wishes";
import { googleCalendarUrl } from "@/lib/calendar";
import { getWishes } from "@/lib/guestbook";
import { calendarEventOf, type InvitationView } from "@/lib/invitation/view";
import { themeFonts } from "./fonts";
import { FLORA_SETS, type FloraSet } from "./palette";

// Mekar Mawar: mawar cat air di atas kertas hangat. Kelopak mengikuti set bunga palet (palette.ts), foto berbentuk
// kotak atau bulat dengan bingkai garis emas, dan setiap bagian punya sapuan cat air sendiri di latarnya.
const vars = {
  "--inv-display": "var(--font-mm-display), Georgia, serif",
  "--inv-body": "var(--font-mm-body), 'Helvetica Neue', Arial, sans-serif",
} as CSSProperties;

const button =
  "inline-flex items-center justify-center gap-2 rounded-full bg-inv-accent px-7 py-3.5 font-body text-[11px] font-semibold tracking-[0.22em] text-inv-card uppercase no-underline shadow-[0_10px_24px_-14px_var(--inv-accent)] transition-transform duration-200 hover:-translate-y-0.5";
const ghost =
  "inline-flex items-center justify-center gap-2 rounded-full border border-inv-accent px-7 py-3.5 font-body text-[11px] font-semibold tracking-[0.22em] text-inv-accent uppercase no-underline transition-colors duration-200 hover:bg-inv-accent hover:text-inv-card";

const setOf = (inv: InvitationView): FloraSet => {
  const s = inv.palette["--mm-set"];
  return FLORA_SETS.includes(s as FloraSet) ? (s as FloraSet) : "merah";
};

function Wrap({ children, className = "", width = "max-w-[600px]" }: { children: ReactNode; className?: string; width?: string }) {
  return <div className={`relative mx-auto w-full px-6 sm:px-8 ${width} ${className}`}>{children}</div>;
}

function Label({ children, className = "" }: { children: ReactNode; className?: string }) {
  return <p className={`font-body text-[11px] font-semibold tracking-[0.3em] text-inv-ink/60 uppercase ${className}`}>{children}</p>;
}

function Divider({ className = "" }: { className?: string }) {
  return (
    <div aria-hidden="true" className={`flex items-center justify-center gap-2 text-inv-gold ${className}`}>
      <span className="h-px w-12 bg-linear-to-r from-transparent to-current" />
      <span className="size-1.5 rotate-45 bg-(--mm-rose)" />
      <span className="h-px w-12 bg-linear-to-l from-transparent to-current" />
    </div>
  );
}

function Heading({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="text-center">
      <Label>{label}</Label>
      <h2 className="mt-3 font-display text-[clamp(32px,8vw,46px)] leading-[1.1] font-light text-balance text-inv-accent italic">{children}</h2>
      <Divider className="mt-5" />
    </div>
  );
}

// Nama mempelai memakai font-script supaya add-on ganti font nama tetap berlaku. Tanpa add-on, font-script jatuh
// ke font judul yang dimiringkan.
const nameFont = "font-script font-light italic";

// Kluster mawar dari potongan bunga: mawar besar di tepi, buket kecil di tengah, tangkai daun ke arah isi.
// Ukuran potongan relatif terhadap lebar kluster, sisi kanan adalah cermin sisi kiri.
function Cluster({ set, right = false, className = "" }: { set: string; right?: boolean; className?: string }) {
  return (
    <div aria-hidden="true" className={`pointer-events-none absolute aspect-[1/2.2] ${right ? "-scale-x-100" : ""} ${className}`}>
      <Flora set={set} piece="daun-1" sizes="120px" className="top-[4%] left-[44%] w-[34%] rotate-[38deg]" />
      <Flora set={set} piece="daun-3" sizes="110px" className="top-[56%] left-[40%] w-[30%] rotate-[58deg]" />
      <Flora set={set} piece="mawar-2" sway sizes="200px" className="top-0 -left-[22%] w-[70%]" />
      <Flora set={set} piece="buket-kecil" sway sizes="200px" className="top-[24%] -left-[16%] w-[66%] -rotate-[8deg]" />
      <Flora set={set} piece="mawar-1" sway sizes="180px" className="top-[50%] -left-[20%] w-[58%]" />
      <Flora set={set} piece="daun-2" sizes="120px" className="top-[70%] left-[24%] w-[34%] rotate-[18deg]" />
      <Flora set={set} piece="mawar-3" sway sizes="170px" className="top-[74%] -left-[12%] w-[52%]" />
    </div>
  );
}

// Kluster mawar mengapit tiap bagian, letaknya berselang mengikuti flip supaya bagian berurutan tidak sama.
// Di HP kluster lebih kecil dan sebagian keluar layar, jadi mawar hanya mengintip dari tepi tanpa menutupi isi.
function Section({ children, set, tone = "paper", flip = "", className = "" }: { children: ReactNode; set: string; tone?: "paper" | "wash"; flip?: "" | "x" | "y" | "xy"; className?: string }) {
  const low = flip === "y" || flip === "xy";
  return (
    <section className={`${tone === "wash" ? "inv-wash" : "inv-paper"} relative overflow-hidden py-20 lg:py-28 ${className}`}>
      <Wash set={set} flip={flip} className="opacity-80" />
      <Cluster set={set} className={`-left-[10vw] w-[30vw] sm:left-0 sm:w-[min(19vw,280px)] ${low ? "bottom-0" : "top-0"}`} />
      <Cluster set={set} right className={`-right-[10vw] w-[30vw] sm:right-0 sm:w-[min(19vw,280px)] ${low ? "top-0" : "bottom-0"}`} />
      {children}
    </section>
  );
}

function Hero({ inv, set }: { inv: InvitationView; set: string }) {
  return (
    <Section set={set} className="pt-14 pb-20 lg:pt-20">
      <Wrap className="flex flex-col items-center text-center">
        <div className="relative w-[min(72vw,360px)]">
          <div className="mm-frame relative aspect-[4/5] overflow-hidden rounded-[4px]">
            <Image {...inv.frame.hero} src={inv.images.hero} alt={`${inv.groom.name} dan ${inv.bride.name}`} fill priority sizes="(min-width: 640px) 360px, 72vw" className="object-cover object-[50%_30%]" />
          </div>
          <Flora set={set} piece="buket" sway priority sizes="220px" className="-top-[9%] -left-[24%] w-[56%] -rotate-[10deg]" />
          <Flora set={set} piece="rangkaian" sway sizes="260px" className="-right-[30%] -bottom-[14%] w-[72%] -rotate-[22deg]" />
        </div>
        <Label className="mt-16">Pernikahan</Label>
        <h1 className={`mt-3 ${nameFont} text-[clamp(52px,14vw,76px)] leading-[0.95] text-inv-accent`}>
          {inv.groom.name}
          <span className="mm-amp my-1 block text-[0.6em] text-(--mm-rose) not-italic">&amp;</span>
          {inv.bride.name}
        </h1>
        <Label className="mt-6">{inv.dateLong}</Label>
        <p className="mt-2 font-display text-[16px] text-inv-ink/75 italic">
          {inv.venue.name}, {inv.cityShort}
        </p>
        <Greeting className="mt-5 text-[14px] text-inv-accent" />
      </Wrap>
      {inv.tagline && (
        <Wrap className="mt-16 text-center">
          <Divider />
          <p className="mx-auto mt-6 max-w-[30ch] font-display text-[clamp(22px,5.6vw,30px)] leading-snug font-light text-balance italic">{inv.tagline}</p>
        </Wrap>
      )}
    </Section>
  );
}

function Person({ p, alt, set, mirror }: { p: InvitationView["groom"]; alt: string; set: string; mirror?: boolean }) {
  return (
    <div className="flex flex-col items-center text-center">
      <div className="relative">
        <div className="mm-frame relative size-[min(52vw,220px)] overflow-hidden rounded-full">
          <Image {...p.frame} src={p.photo} alt={alt} fill sizes="220px" className="object-cover object-[50%_25%]" />
        </div>
        <Flora
          set={set}
          piece="rangkaian"
          sway
          sizes="200px"
          className={`-bottom-[16%] w-[80%] ${mirror ? "-left-[34%] -scale-x-100 rotate-[16deg]" : "-right-[34%] -rotate-[16deg]"}`}
        />
      </div>
      <p className={`mt-10 ${nameFont} text-[clamp(44px,11vw,58px)] leading-none text-inv-accent`}>{p.name}</p>
      <p className="mt-3 font-display text-[18px]">{p.full}</p>
      <p className="mt-3 text-[13px] tracking-[0.06em] text-inv-ink/60">{p.role}</p>
      <p className="mt-1 max-w-[30ch] text-[15px] leading-relaxed">{p.parents}</p>
    </div>
  );
}

function Couple({ inv, set }: { inv: InvitationView; set: string }) {
  return (
    <Section set={set} tone="wash" flip="x">
      <Flora set={set} piece="mawar-2" sizes="160px" className="-top-6 -right-8 w-[min(34vw,170px)]" />
      <Flora set={set} piece="mawar-3" sizes="160px" className="-bottom-6 -left-8 w-[min(32vw,160px)]" />
      <Wrap width="max-w-[900px]">
        <Heading label="Kedua mempelai">Dengan memohon rahmat Tuhan</Heading>
        {inv.honor && <p className="mx-auto mt-8 max-w-[52ch] text-center text-[15px] leading-relaxed text-inv-ink/80">{inv.honor}</p>}
        <div className="mt-14 grid items-center gap-12 md:grid-cols-[1fr_auto_1fr] md:gap-6">
          <Person p={inv.groom} alt={`Foto ${inv.groom.name}`} set={set} />
          <p aria-hidden="true" className="mm-amp text-center text-[64px] leading-none text-(--mm-rose)">
            &amp;
          </p>
          <Person p={inv.bride} alt={`Foto ${inv.bride.name}`} set={set} mirror />
        </div>
      </Wrap>
    </Section>
  );
}

const CORNERS = ["mawar-1", "mawar-2", "mawar-3"] as const;

function StorySection({ inv, set }: { inv: InvitationView; set: string }) {
  return (
    <Section set={set} flip="y">
      <Wrap width="max-w-[960px]">
        <Heading label="Cerita kami">Perjalanan sampai hari ini</Heading>
        <ol className="mt-16 grid gap-20">
          {inv.story.map((s, i) => (
            <li key={`${s.title}-${i}`} className="grid items-center gap-10 md:grid-cols-2 md:gap-14">
              <div className={`relative mx-auto w-[min(80vw,420px)] ${i % 2 ? "md:order-2" : ""}`}>
                <div className="mm-frame relative aspect-[4/3] overflow-hidden rounded-[4px]">
                  <Image src={s.image} alt={s.title} fill sizes="(min-width: 768px) 420px, 80vw" className="object-cover" />
                </div>
                <Flora set={set} piece={CORNERS[i % 3]} sizes="120px" className={`-top-[14%] w-[26%] ${i % 2 ? "-right-[9%]" : "-left-[9%]"}`} />
                <Flora set={set} piece="buket-kecil" sway sizes="160px" className={`-bottom-[18%] w-[34%] ${i % 2 ? "-left-[12%]" : "-right-[12%]"}`} />
              </div>
              <div className={`text-center md:text-left ${i % 2 ? "md:order-1 md:text-right" : ""}`}>
                <p className="mm-amp text-[44px] leading-none text-(--mm-rose)">{s.date}</p>
                <h3 className="mt-3 font-display text-[clamp(26px,6vw,34px)] leading-tight font-light text-inv-accent italic">{s.title}</h3>
                <p className="mt-4 text-[15px] leading-relaxed text-inv-ink/80">{s.short}</p>
              </div>
            </li>
          ))}
        </ol>
      </Wrap>
    </Section>
  );
}

function Details({ inv, set }: { inv: InvitationView; set: string }) {
  // "Sabtu, 15 Mei 2027" dipecah supaya tanggal bisa ditonjolkan di tengah.
  const [weekday, rest = ""] = inv.dateLong.split(", ");
  const [day, ...monthYear] = rest.split(" ");
  return (
    <Section set={set} tone="wash">
      <Wrap width="max-w-[680px]" className="pt-16">
        <div className="mm-card relative rounded-[14px] px-6 pt-28 pb-12 text-center sm:px-12">
          <Flora set={set} piece="buket" sway sizes="260px" className="-top-20 left-1/2 w-[min(58vw,260px)] -translate-x-1/2" />
          <Label>Simpan tanggalnya</Label>
          <div className="mt-5 flex items-center justify-center gap-4">
            <div className="flex-1">
              <Label className="text-right">{weekday}</Label>
              <span className="mt-2 ml-auto block h-px w-16 bg-inv-gold" />
            </div>
            <p className="font-display text-[clamp(76px,20vw,112px)] leading-[0.9] font-light text-inv-accent tabular-nums italic">{day}</p>
            <div className="flex-1">
              <Label className="text-left">{monthYear.join(" ")}</Label>
              <span className="mt-2 block h-px w-16 bg-inv-gold" />
            </div>
          </div>

          <div className={`mt-10 grid gap-6 ${inv.events.length > 1 ? "sm:grid-cols-2" : ""}`}>
            {inv.events.map((e, i) => (
              <div key={e.name} className={i > 0 ? "border-t border-inv-line pt-6 sm:border-t-0 sm:border-l sm:pt-0 sm:pl-6" : ""}>
                <p className="font-display text-[26px] font-light text-inv-accent italic">{e.name}</p>
                <p className="mt-2 font-display text-[19px] tabular-nums">
                  {e.time}
                  {e.until && <span className="text-inv-gold"> &ndash; </span>}
                  {e.until} <span className="text-[13px] tracking-[0.2em] text-inv-ink/60">{inv.tz}</span>
                </p>
              </div>
            ))}
          </div>

          <Divider className="mt-10" />
          <div className="mm-frame relative mx-auto mt-10 aspect-[3/2] w-[min(100%,440px)] overflow-hidden rounded-[4px]">
            <Image {...inv.frame.venue} src={inv.images.venue} alt={`Suasana ${inv.venue.name}`} fill sizes="440px" className="object-cover" />
          </div>
          <p className="mt-9 font-display text-[clamp(22px,5.6vw,28px)] leading-tight">{inv.venue.name}</p>
          <p className="mx-auto mt-2 max-w-[40ch] text-[14px] leading-relaxed text-inv-ink/75">{inv.venue.address}</p>
          <div className="mt-7 flex flex-wrap justify-center gap-3">
            {inv.venue.mapUrl && (
              <a href={inv.venue.mapUrl} target="_blank" rel="noopener" className={button}>
                Petunjuk arah
              </a>
            )}
            <CalendarButton slug={inv.slug} google={googleCalendarUrl(calendarEventOf(inv))} className={ghost}>
              Simpan ke kalender
            </CalendarButton>
          </div>
        </div>
      </Wrap>
      <Flora set={set} piece="rangkaian" sizes="240px" className="-right-16 -bottom-10 w-[min(48vw,240px)] -rotate-[12deg]" />
    </Section>
  );
}

function CountdownSection({ inv, set }: { inv: InvitationView; set: string }) {
  return (
    <Section set={set} flip="xy">
      <Flora set={set} piece="mawar-1" sizes="150px" className="top-6 -left-8 w-[min(30vw,150px)]" />
      <Flora set={set} piece="mawar-3" sizes="130px" className="-right-10 -bottom-8 w-[min(26vw,130px)]" />
      <Wrap>
        <Heading label="Menuju hari bahagia">Menghitung hari</Heading>
        <div className="mt-12">
          <MekarCountdown target={inv.date} />
        </div>
      </Wrap>
    </Section>
  );
}

function GallerySection({ inv, set }: { inv: InvitationView; set: string }) {
  return (
    <Section set={set} tone="wash" flip="x" className="pt-36 lg:pt-44">
      <Flora set={set} piece="untaian" sizes="(min-width: 640px) 760px, 140vw" className="top-0 left-1/2 w-[min(130vw,680px)] -translate-x-1/2 -translate-y-[46%] rotate-180" />
      <Wrap width="max-w-[1000px]">
        <Heading label="Momen kami">Galeri</Heading>
        <div className="mt-12">
          <Gallery photos={inv.gallery} variant="grid" />
        </div>
      </Wrap>
    </Section>
  );
}

function RsvpSection({ inv, set }: { inv: InvitationView; set: string }) {
  return (
    <Section set={set} flip="y">
      <Wrap width="max-w-[620px]">
        <div className="mm-card relative rounded-[14px] px-6 pt-14 pb-14 sm:px-12">
          <Flora set={set} piece="rangkaian" sway sizes="220px" className="-top-12 -right-14 w-[min(48vw,220px)] rotate-[200deg]" />
          <Flora set={set} piece="mawar-2" sizes="110px" className="-bottom-8 -left-8 w-[min(24vw,110px)]" />
          <Heading label="Mohon balasan">Konfirmasi kehadiran</Heading>
          <div className="mt-8">
            <Rsvp slug={inv.slug} deadline={inv.rsvpDeadline} />
          </div>
        </div>
      </Wrap>
    </Section>
  );
}

function Gifts({ inv, set }: { inv: InvitationView; set: string }) {
  return (
    <Section set={set} tone="wash" flip="xy">
      <Flora set={set} piece="buket-kecil" sizes="160px" className="-top-4 -left-8 w-[min(32vw,160px)]" />
      <Wrap width="max-w-[860px]">
        <Heading label="Tanda kasih">Doa restu Anda sudah lebih dari cukup</Heading>
        <p className="mx-auto mt-8 max-w-[46ch] text-center text-[15px] leading-relaxed text-inv-ink/80">Bagi yang ingin memberi tanda kasih, dapat melalui rekening atau QRIS berikut.</p>
        <div className="mt-12 grid gap-6 sm:grid-cols-2">
          {inv.gifts.map((g) => (
            <div key={g.number} className="mm-card rounded-[14px] px-6 py-10 text-center">
              <Label>{g.bank}</Label>
              <p className="mt-4 font-display text-[26px] leading-none tabular-nums">{g.number}</p>
              <p className="mt-3 font-display text-[16px] text-inv-ink/75 italic">a.n. {g.holder}</p>
              <div className="mt-5">
                <CopyButton value={g.number} label={`nomor rekening ${g.holder}`} />
              </div>
            </div>
          ))}
          {inv.images.qris && (
            <div className="mm-card flex flex-col items-center rounded-[14px] px-6 py-10 text-center sm:col-span-2 sm:mx-auto sm:w-[min(100%,420px)]">
              <Label>QRIS</Label>
              <Image src={inv.images.qris} alt="Kode QRIS" width={150} height={150} className="mt-4 size-36" />
              <p className="mt-3 text-[15px]">Pindai dari aplikasi bank atau e-wallet.</p>
              <QrisDownload src={inv.images.qris} slug={inv.slug} />
            </div>
          )}
        </div>
        {inv.giftNote && <p className="mt-6 text-center text-[13px] text-inv-ink/60">{inv.giftNote}</p>}
      </Wrap>
    </Section>
  );
}

async function WishesSection({ inv, set }: { inv: InvitationView; set: string }) {
  const wishes = await getWishes(inv.slug);
  return (
    <Section set={set}>
      <Flora set={set} piece="mawar-3" sizes="150px" className="-top-6 -right-8 w-[min(30vw,150px)]" />
      <Wrap width="max-w-[760px]">
        <Heading label="Doa dan ucapan">Titipkan doa untuk kami</Heading>
        <div className="mm-card mt-12 rounded-[14px] px-5 py-10 sm:px-12">
          <Wishes slug={inv.slug} initial={wishes} variant="lined" />
        </div>
      </Wrap>
    </Section>
  );
}

function Closing({ inv, set }: { inv: InvitationView; set: string }) {
  return (
    <Section set={set} tone="wash" className="pt-32 pb-24 lg:pt-40">
      <Petals />
      <Flora set={set} piece="untaian" sizes="(min-width: 640px) 760px, 140vw" className="top-0 left-1/2 w-[min(140vw,760px)] -translate-x-1/2 -translate-y-[38%] rotate-180" />
      <Wrap className="flex flex-col items-center text-center">
        <div className="relative">
          <div className="mm-frame relative size-[min(60vw,260px)] overflow-hidden rounded-full">
            <Image {...inv.frame.closing} src={inv.images.closing} alt="" fill sizes="260px" className="object-cover" />
          </div>
          <Flora set={set} piece="buket" sway sizes="200px" className="-bottom-[42%] left-1/2 w-[70%] -translate-x-1/2" />
        </div>
        <p className="mm-amp mt-32 text-[clamp(52px,14vw,72px)] leading-none text-inv-accent">Terima kasih</p>
        <p className="mx-auto mt-6 max-w-[34ch] text-[16px] leading-relaxed text-inv-ink/80">
          Atas kehadiran dan doa restu yang Anda berikan, kami ucapkan terima kasih yang setulus-tulusnya.
        </p>
        <Label className="mt-10">Kami yang berbahagia</Label>
        <p className={`mt-3 ${nameFont} text-[clamp(38px,10vw,52px)] leading-[1.05] text-inv-accent`}>
          {inv.groom.name} <span className="mm-amp text-[0.7em] text-(--mm-rose) not-italic">&amp;</span> {inv.bride.name}
        </p>
        <Divider className="mt-6" />
        <Label className="mt-5">{inv.dateLong}</Label>
      </Wrap>
    </Section>
  );
}

function Footer({ inv }: { inv: InvitationView }) {
  return (
    <footer className="inv-paper py-10">
      <Wrap className="flex flex-col items-center gap-2 text-center">
        <p className="font-display text-[13px] tracking-[0.42em] text-inv-accent">{inv.monogram}</p>
        <p className="text-[12px] text-inv-ink/60">
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

export function IvanMawar({ inv }: { inv: InvitationView }) {
  const set = setOf(inv);
  return (
    <InvitationShell
      door={{ kind: "mekar", groom: inv.groom.name, bride: inv.bride.name, date: inv.dateLong, place: `${inv.venue.name}, ${inv.cityShort}`, photo: inv.images.hero, frame: inv.frame.hero, set }}
      music={inv.music}
      className={`${themeFonts} inv-paper min-h-dvh overflow-x-clip font-body text-inv-ink`}
      style={{ ...vars, ...inv.palette, ...inv.fonts }}
    >
      <Hummingbird set={set} />
      <main>
        <Hero inv={inv} set={set} />
        <Extras inv={inv} at="hero" />
        {inv.on.couple && <Couple inv={inv} set={set} />}
        <Extras inv={inv} at="couple" />
        {inv.on.story && <StorySection inv={inv} set={set} />}
        <Extras inv={inv} at="story" />
        {inv.on.event && <Details inv={inv} set={set} />}
        <Extras inv={inv} at="event" />
        {inv.on.countdown && <CountdownSection inv={inv} set={set} />}
        <Extras inv={inv} at="countdown" />
        {inv.on.gallery && <GallerySection inv={inv} set={set} />}
        <Extras inv={inv} at="gallery" />
        {inv.on.rsvp && <RsvpSection inv={inv} set={set} />}
        <Extras inv={inv} at="rsvp" />
        {inv.on.gifts && <Gifts inv={inv} set={set} />}
        <Extras inv={inv} at="gifts" />
        {inv.on.wishes && <WishesSection inv={inv} set={set} />}
        <Extras inv={inv} at="wishes" />
        {inv.on.closing && <Closing inv={inv} set={set} />}
        <Extras inv={inv} at="closing" />
      </main>
      <Footer inv={inv} />
    </InvitationShell>
  );
}
