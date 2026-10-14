import Image from "next/image";
import Link from "next/link";
import type { CSSProperties, ReactNode } from "react";
import { CalendarButton } from "@/components/invitation/calendar-button";
import { CopyButton } from "@/components/invitation/copy-button";
import { Extras } from "@/components/invitation/extras";
import { Gallery } from "@/components/invitation/gallery";
import { GuestName } from "@/components/invitation/guest-name";
import { PixelPhoto, ScoreCountdown, Typewriter } from "@/components/invitation/petualang/live";
import { CHEST, COIN, HEART, LETTER, Sprite, type SpriteData } from "@/components/invitation/petualang/pixel";
import { World, type Station } from "@/components/invitation/petualang/world";
import { QrisDownload } from "@/components/invitation/qris-download";
import { Rsvp } from "@/components/invitation/rsvp";
import { InvitationShell } from "@/components/invitation/shell";
import { Wishes } from "@/components/invitation/wishes";
import { googleCalendarUrl } from "@/lib/calendar";
import { getWishes } from "@/lib/guestbook";
import type { ExtraAnchor } from "@/lib/invitation/schema";
import { calendarEventOf, type InvitationView } from "@/lib/invitation/view";
import { themeFonts } from "./fonts";

// Co-op Adventure: undangan sebagai game piksel 16-bit. Judul dan label memakai huruf piksel, isi tetap huruf biasa
// supaya mudah dibaca semua tamu. Foto asli tidak dipikselkan, hanya bingkai dan hiasannya. Warna dari palette.ts.
const vars = {
  "--inv-display": "var(--font-pt-display), 'Courier New', monospace",
  "--inv-body": "var(--font-pt-body), 'Helvetica Neue', Arial, sans-serif",
} as CSSProperties;

const btn = "pt-btn pt-label inline-flex items-center gap-2 px-4 py-2.5 text-[11px] no-underline sm:px-5 sm:py-3 sm:text-[12px]";
// Papan di sepanjang level. Fotonya mengecil lebih dulu bila layar pendek, supaya teks selalu muat.
const board = "pt-box flex max-h-full min-h-0 flex-col p-3 text-left text-inv-ink sm:flex-row sm:gap-5 sm:p-4";
const boardPhoto = "relative h-[38svh] min-h-[72px] shrink overflow-hidden bg-inv-wash sm:h-[min(46svh,var(--room))] sm:w-[46%] sm:shrink-0";
const boardText = "min-h-0 shrink-0 pt-3 sm:flex sm:flex-1 sm:flex-col sm:justify-center sm:pt-0";

// Layar awal level: nama sebagai judul game dan misi yang harus diselesaikan.
function Start({ inv }: { inv: InvitationView }) {
  return (
    <>
      <p className="pt-label pt-on-sky text-[11px] sm:text-[13px]">Undangan pernikahan</p>
      <h1 className="pt-logo mt-3 font-script text-[clamp(38px,min(12vw,7vh),110px)] leading-[0.92] font-bold">
        <span className="block">{inv.groom.name}</span>
        <span className="my-2 flex justify-center">
          <Sprite data={HEART} scale={5} />
          <span className="sr-only">&amp;</span>
        </span>
        <span className="block">{inv.bride.name}</span>
      </h1>
      <div className="pt-dialog mt-[max(14px,2.4vh)] w-full max-w-[420px] px-5 py-3.5 text-left">
        <p className="pt-label text-[10px] text-[color-mix(in_srgb,var(--inv-accent)_40%,#FFE3A0)]">Misi utama</p>
        <p className="mt-1 font-display text-[clamp(17px,5vw,22px)] leading-tight font-semibold">
          Antar {inv.groom.name} menjemput {inv.bride.name}
        </p>
        <p className="mt-1.5 text-[13px] leading-relaxed opacity-90 sm:text-[14px]">
          {inv.dateLong}
          <br />
          {inv.venue.name}, {inv.cityShort}
        </p>
      </div>
      <p className="pt-label pt-on-sky pt-start-slow mt-[max(12px,2vh)] text-[11px] sm:text-[13px]">Tahan &#9654; untuk berangkat, atau buka Peta</p>
    </>
  );
}

function IntroBoard({ inv }: { inv: InvitationView }) {
  return (
    <article className={board}>
      <PixelPhoto focus={0.62} className={boardPhoto}>
        <Image src={inv.images.hero} alt={`${inv.groom.name} dan ${inv.bride.name}`} fill sizes="(min-width: 640px) 300px, 86vw" className="object-cover object-[50%_62%]" />
      </PixelPhoto>
      <div className={boardText}>
        <p className="pt-label text-[10px] text-inv-accent sm:text-[11px]">Prolog</p>
        {inv.tagline && <Typewriter text={inv.tagline} className="mt-1.5 font-display text-[clamp(17px,4.4vw,22px)] leading-snug font-medium" />}
        {inv.honor && <p className="mt-2 line-clamp-3 text-[13px] leading-relaxed text-inv-gold sm:line-clamp-none sm:text-[14px]">{inv.honor}</p>}
      </div>
    </article>
  );
}

function Player({ p, tag, label, alt }: { p: InvitationView["groom"]; tag: string; label: string; alt: string }) {
  return (
    <article className={board}>
      <PixelPhoto focus={0.25} className={boardPhoto}>
        <Image src={p.photo} alt={alt} fill sizes="(min-width: 640px) 300px, 86vw" className="object-cover object-[50%_25%]" />
      </PixelPhoto>
      <div className={boardText}>
        <div className="flex items-center gap-2.5">
          <span className="pt-tag">{tag}</span>
          <span className="pt-label text-[10px] text-inv-gold sm:text-[11px]">{label}</span>
        </div>
        <p className="mt-2 font-script text-[clamp(28px,7vw,40px)] leading-none font-bold">{p.name}</p>
        <p className="mt-1 text-[14px] leading-snug sm:text-[15px]">{p.full}</p>
        <p className="mt-1.5 text-[13px] leading-relaxed text-inv-gold sm:text-[14px]">
          {p.role} {p.parents}
        </p>
      </div>
    </article>
  );
}

// Papan cerita versi ringkas: foto kecil di kiri dan teks di kanan, dipasang rapat antar checkpoint.
function StoryBoard({ s, i }: { s: InvitationView["story"][number]; i: number }) {
  return (
    <article className="pt-box flex items-start gap-3 p-2.5 text-left text-inv-ink sm:gap-4 sm:p-3">
      <PixelPhoto className="relative aspect-square w-[30%] shrink-0 overflow-hidden bg-inv-wash">
        <Image src={s.image} alt={s.title} fill sizes="160px" className="object-cover" />
      </PixelPhoto>
      <div className="min-w-0">
        <p className="pt-label text-[10px] text-inv-accent">
          Checkpoint {i + 1} / {s.date}
        </p>
        <h3 className="mt-1 font-display text-[clamp(18px,4.6vw,22px)] leading-tight font-bold">{s.title}</h3>
        <p className="mt-1 line-clamp-3 text-[13px] leading-snug text-inv-ink/80 sm:text-[14px]">{s.short}</p>
      </div>
    </article>
  );
}

function EventBoard({ inv }: { inv: InvitationView }) {
  return (
    <article className={board}>
      <PixelPhoto className="relative h-[20svh] min-h-[56px] shrink overflow-hidden bg-inv-wash sm:h-[min(42svh,var(--room))] sm:w-[42%] sm:shrink-0">
        <Image src={inv.images.venue} alt={`Suasana ${inv.venue.name}`} fill sizes="(min-width: 640px) 300px, 86vw" className="object-cover" />
      </PixelPhoto>
      <div className={boardText}>
        <p className="pt-label text-[10px] text-inv-accent sm:text-[11px]">Misi utama / Hari H</p>
        <p className="mt-1 font-display text-[clamp(18px,4.6vw,24px)] leading-tight font-bold">{inv.dateLong}</p>
        <ul className="mt-2 space-y-0.5 text-[14px]">
          {inv.events.map((e) => (
            <li key={e.name} className="flex flex-wrap justify-between gap-x-3">
              <span className="font-medium">{e.name}</span>
              <span className="tabular-nums">
                {e.time}
                {e.until && <> &ndash; {e.until}</>} {inv.tz}
              </span>
            </li>
          ))}
        </ul>
        <p className="mt-2 text-[14px] leading-snug font-medium">{inv.venue.name}</p>
        <p className="text-[13px] leading-snug text-inv-gold">{inv.venue.address}</p>
        <div className="mt-3 flex flex-wrap gap-2.5">
          {inv.venue.mapUrl && (
            <a href={inv.venue.mapUrl} target="_blank" rel="noopener" className={btn}>
              &#9654; Peta
            </a>
          )}
          <CalendarButton slug={inv.slug} google={googleCalendarUrl(calendarEventOf(inv))} className={`${btn} pt-btn-light`}>
            Kalender
          </CalendarButton>
        </div>
      </div>
    </article>
  );
}

function CountdownBoard({ inv }: { inv: InvitationView }) {
  return (
    <article className="pt-box p-3 text-center text-inv-ink sm:p-5">
      <p className="pt-label text-[10px] text-inv-accent sm:text-[11px]">Menuju hari H</p>
      <p className="mt-1 font-display text-[clamp(20px,5vw,30px)] leading-tight font-bold">Memuat hari bahagia</p>
      <div className="mt-3">
        <ScoreCountdown target={inv.date} />
      </div>
    </article>
  );
}

// Papan berisi panjang: judul tetap di atas, isinya bisa digulir di dalam papan.
function Tall({ label, title, icon, children }: { label: string; title: ReactNode; icon?: SpriteData; children: ReactNode }) {
  return (
    <article className="pt-box flex max-h-full min-h-0 flex-col text-left text-inv-ink">
      <header className="shrink-0 border-b-4 border-inv-line/15 px-3 pt-3 pb-2.5 sm:px-5 sm:pt-4 sm:pb-3">
        <div className="flex items-center gap-2.5">
          {icon && <Sprite data={icon} scale={2} />}
          <p className="pt-label text-[10px] text-inv-accent sm:text-[11px]">{label}</p>
        </div>
        <h2 className="mt-1 font-display text-[clamp(22px,5.4vw,32px)] leading-tight font-bold">{title}</h2>
      </header>
      <div className="pt-scroll min-h-0 flex-1 overflow-y-auto overscroll-contain px-3 py-3 sm:px-5 sm:py-4">{children}</div>
    </article>
  );
}

function GalleryBoard({ inv }: { inv: InvitationView }) {
  return (
    <Tall label="Album kenangan" title="Tangkapan layar">
      <Gallery photos={inv.gallery} variant="grid" />
    </Tall>
  );
}

function RsvpBoard({ inv }: { inv: InvitationView }) {
  return (
    <Tall label="Konfirmasi kehadiran" title="Gabung ke party?" icon={LETTER}>
      <p className="mb-4 text-[14px] leading-relaxed text-inv-ink/80">Petualangan ini lebih seru kalau kamu ikut. Kabari kami ya.</p>
      <Rsvp slug={inv.slug} deadline={inv.rsvpDeadline} />
    </Tall>
  );
}

function GiftsBoard({ inv }: { inv: InvitationView }) {
  return (
    <Tall label="Tanda kasih" title="Peti hadiah" icon={CHEST}>
      <p className="text-[14px] leading-relaxed text-inv-ink/80">Doa restu sudah lebih dari cukup. Bagi yang ingin memberi tanda kasih, dapat melalui rekening atau QRIS berikut.</p>
      <ul className="mt-3 divide-y-2 divide-dashed divide-inv-line/20">
        {inv.gifts.map((g) => (
          <li key={g.number} className="flex flex-wrap items-center gap-3 py-3">
            <Sprite data={COIN} scale={3} />
            <div className="min-w-0 flex-1">
              <p className="pt-label text-[10px] text-inv-accent">{g.bank}</p>
              <p className="mt-0.5 font-display text-[clamp(20px,4.6vw,26px)] leading-tight font-bold tabular-nums">{g.number}</p>
              <p className="text-[13px] text-inv-gold">a.n. {g.holder}</p>
            </div>
            <CopyButton value={g.number} label={`nomor rekening ${g.holder}`} />
          </li>
        ))}
      </ul>
      {inv.images.qris && (
        <div className="mt-2 flex flex-wrap items-center gap-4 border-t-2 border-dashed border-inv-line/20 pt-3">
          <div className="bg-white p-1.5">
            <Image src={inv.images.qris} alt="Kode QRIS" width={150} height={150} className="size-28" />
          </div>
          <div>
            <p className="pt-label text-[10px] text-inv-accent">QRIS</p>
            <p className="mt-1 text-[14px]">Pindai dari aplikasi bank atau e-wallet.</p>
            <QrisDownload src={inv.images.qris} slug={inv.slug} />
          </div>
        </div>
      )}
      {inv.giftNote && <p className="mt-3 text-[12px] text-inv-gold">{inv.giftNote}</p>}
    </Tall>
  );
}

function WishesBoard({ inv, wishes }: { inv: InvitationView; wishes: Awaited<ReturnType<typeof getWishes>> }) {
  return (
    <Tall label="Buku tamu" title="Tinggalkan pesan" icon={LETTER}>
      <Wishes slug={inv.slug} initial={wishes} variant="dialog" />
    </Tall>
  );
}

// Bagian tambahan dari editor, masing-masing di papannya sendiri dengan gaya bagian tambahan tema ini.
function ExtraBoard({ inv, at, index }: { inv: InvitationView; at: ExtraAnchor; index: number }) {
  return (
    <article className="pt-box flex max-h-full min-h-0 flex-col overflow-hidden text-inv-ink">
      <div className="pt-scroll min-h-0 overflow-y-auto overscroll-contain">
        <Extras inv={inv} at={at} only={index} compact />
      </div>
    </article>
  );
}

// Papan di atas istana. Sebelum mempelai pria tiba, isinya mempelai wanita sebagai tujuan. Sesudah tiba, berganti
// menjadi pesan misi selesai.
function GoalBoard({ inv }: { inv: InvitationView }) {
  return (
    <div className="flex max-h-full min-h-0 flex-col">
      <div className="pt-before flex max-h-full min-h-0 flex-col">
        <Player p={inv.bride} tag="P2" label="Tujuan akhir" alt={`Foto ${inv.bride.name}`} />
      </div>
      <div className="pt-done pt-dialog flex-col px-4 py-3 text-center">
        <p className="pt-label text-[10px] text-[color-mix(in_srgb,var(--inv-accent)_40%,#FFE3A0)]">Misi selesai</p>
        <p className="mt-1 font-display text-[clamp(17px,4.6vw,22px)] leading-tight font-semibold">
          {inv.groom.name} sudah menjemput {inv.bride.name}
        </p>
      </div>
    </div>
  );
}

// Penutup yang terbuka di akhir adegan: foto penutup, daftar pemeran, dan kredit undangan.
function Finale({ inv }: { inv: InvitationView }) {
  const credits: [string, ReactNode][] = [
    ["Pemeran utama", <>{inv.groom.full || inv.groom.name}<br />{inv.bride.full || inv.bride.name}</>],
    ["Bersama keluarga", <>{inv.groom.parents}<br />{inv.bride.parents}</>],
    ["Lokasi", `${inv.venue.name}, ${inv.cityShort}`],
    ["Pemain tamu", <GuestName key="guest" fallback="Kamu" />],
  ];
  return (
    <div className="px-4 py-5 text-center sm:px-8 sm:py-7">
      {inv.on.closing && (
        <>
          <p className="font-display text-[clamp(44px,12vw,72px)] leading-none font-bold text-inv-accent">Tamat</p>
          <p className="pt-label mt-2 text-[10px] text-inv-gold sm:text-[11px]">Terima kasih sudah bermain bersama kami</p>
          <div className="pt-frame mx-auto mt-5 w-[min(72%,300px)]">
            <PixelPhoto focus={0.3} className="relative aspect-[4/5] overflow-hidden bg-inv-wash">
              <Image src={inv.images.closing} alt={`${inv.groom.name} dan ${inv.bride.name}`} fill sizes="300px" className="object-cover object-[50%_30%]" />
            </PixelPhoto>
          </div>
          <dl className="mt-6">
            {credits.map(([role, name]) => (
              <div key={role} className="not-first:mt-4">
                <dt className="pt-label text-[10px] text-inv-accent">{role}</dt>
                <dd className="mt-1 text-[15px] leading-relaxed">{name}</dd>
              </div>
            ))}
          </dl>
          <p className="pt-label mt-6 text-[11px] text-inv-accent">&#9654; Petualangan baru dimulai {inv.dateShort.replace(/ /g, "")}</p>
        </>
      )}
      <p className="mt-6 border-t-2 border-dashed border-inv-line/20 pt-3 text-[12px] text-inv-gold">
        <span className="pt-label text-inv-ink">{inv.monogram}</span>
        <span className="mx-2">/</span>
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
    </div>
  );
}

// Seluruh undangan sebagai satu level. Urutan papan mengikuti urutan section tema lain, dan bagian tambahan
// dari editor disisipkan sesuai posisinya.
async function Adventure({ inv }: { inv: InvitationView }) {
  const wishes = inv.on.wishes ? await getWishes(inv.slug) : [];
  const extra = (at: ExtraAnchor): Station[] =>
    (inv.extras[at] ?? []).map((e, i) => ({ id: `extra-${at}-${i}`, label: e.title || undefined, node: <ExtraBoard inv={inv} at={at} index={i} /> }));
  const stations: Station[] = [
    ...(inv.tagline || inv.honor ? [{ id: "intro", label: "Prolog", node: <IntroBoard inv={inv} /> }] : []),
    ...extra("hero"),
    ...(inv.on.couple ? [{ id: "groom", label: "Mempelai", node: <Player p={inv.groom} tag="P1" label="Mempelai pria" alt={`Foto ${inv.groom.name}`} /> }] : []),
    ...extra("couple"),
    ...(inv.on.story ? inv.story.map((s, i) => ({ id: `story-${i}`, label: i === 0 ? "Cerita" : undefined, flag: true, story: true, size: "compact" as const, node: <StoryBoard s={s} i={i} /> })) : []),
    ...extra("story"),
    ...(inv.on.event ? [{ id: "event", label: "Acara", node: <EventBoard inv={inv} /> }] : []),
    ...extra("event"),
    ...(inv.on.countdown ? [{ id: "countdown", label: "Hitung mundur", node: <CountdownBoard inv={inv} /> }] : []),
    ...extra("countdown"),
    ...(inv.on.gallery ? [{ id: "gallery", label: "Galeri", size: "wide" as const, node: <GalleryBoard inv={inv} /> }] : []),
    ...extra("gallery"),
    ...(inv.on.rsvp ? [{ id: "rsvp", label: "RSVP", node: <RsvpBoard inv={inv} /> }] : []),
    ...extra("rsvp"),
    ...(inv.on.gifts ? [{ id: "gifts", label: "Hadiah", node: <GiftsBoard inv={inv} /> }] : []),
    ...extra("gifts"),
    ...(inv.on.wishes ? [{ id: "wishes", label: "Ucapan", size: "wide" as const, node: <WishesBoard inv={inv} wishes={wishes} /> }] : []),
    ...extra("wishes"),
    ...extra("closing"),
  ];
  return (
    <World
      start={<Start inv={inv} />}
      stations={stations}
      goal={<GoalBoard inv={inv} />}
      finale={<Finale inv={inv} />}
      groom={inv.groom.name}
      bride={inv.bride.name}
      date={inv.dateShort.replace(/ /g, "")}
    />
  );
}

export function ArkasaMentari({ inv }: { inv: InvitationView }) {
  return (
    <InvitationShell
      door={{
        kind: "mulai",
        groom: inv.groom.name,
        bride: inv.bride.name,
        monogram: inv.monogram,
        date: inv.dateLong,
        place: inv.cityShort,
        year: inv.date.slice(0, 4),
      }}
      music={inv.music}
      synth="chiptune"
      musicAt="top"
      reveal={false}
      className={`${themeFonts} pt-skin inv-paper h-svh overflow-hidden font-body text-inv-ink`}
      style={{ ...vars, ...inv.palette, ...inv.fonts }}
    >
      <main>
        <Adventure inv={inv} />
      </main>
    </InvitationShell>
  );
}
