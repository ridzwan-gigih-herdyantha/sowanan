import Image from "next/image";
import Link from "next/link";
import type { CSSProperties, ReactNode } from "react";
import { CalendarButton } from "@/components/invitation/calendar-button";
import { CopyButton } from "@/components/invitation/copy-button";
import { Extras } from "@/components/invitation/extras";
import { Gallery } from "@/components/invitation/gallery";
import { Greeting } from "@/components/invitation/greeting";
import { GuestName } from "@/components/invitation/guest-name";
import { InteriorMap, type Panel } from "@/components/invitation/gedung/interior";
import { QrisDownload } from "@/components/invitation/qris-download";
import { Rsvp } from "@/components/invitation/rsvp";
import { InvitationShell } from "@/components/invitation/shell";
import { Wishes } from "@/components/invitation/wishes";
import { Countdown } from "@/components/countdown";
import { googleCalendarUrl } from "@/lib/calendar";
import { getWishes } from "@/lib/guestbook";
import { calendarEventOf, type ExtraView, type InvitationView } from "@/lib/invitation/view";
import { EXTRA_KINDS, type ExtraAnchor, type ExtraKind } from "@/lib/invitation/schema";
import type { BoothKind } from "@/components/invitation/gedung/booth";
import { themeFonts } from "./fonts";

const vars = {
  "--inv-display": "var(--font-gd-display), 'Trebuchet MS', sans-serif",
  "--inv-body": "var(--font-gd-body), Arial, sans-serif",
} as CSSProperties;

const card = "rounded-2xl border-[3px] border-inv-line bg-inv-card shadow-[0_5px_0_rgba(0,0,0,.2)]";
const action = "inline-flex items-center justify-center rounded-full border-[3px] border-inv-line bg-inv-accent px-4 py-2 font-display text-[13px] leading-none font-semibold text-inv-paper shadow-[0_4px_0_rgba(0,0,0,.25)] transition-transform active:translate-y-0.5";

function Person({ person, role }: { person: InvitationView["groom"]; role: string }) {
  return (
    <article className={`${card} p-3 text-center`}>
      <div className="relative mx-auto aspect-[4/5] w-full overflow-hidden rounded-xl border-[3px] border-inv-line bg-inv-wash">
        <Image {...person.frame} src={person.photo} alt={person.full || person.name} fill sizes="200px" className="object-cover object-[50%_30%]" />
      </div>
      <p className="mt-2 text-[10px] tracking-[.16em] text-inv-gold uppercase">{role}</p>
      <p className="font-display text-[22px] leading-tight font-semibold text-inv-accent">{person.name}</p>
      <p className="text-[11px] text-inv-ink/70">{person.full}</p>
      <p className="mt-1 text-[11px] leading-snug text-inv-ink/60">{person.parents}</p>
    </article>
  );
}

function Couple({ inv }: { inv: InvitationView }) {
  return (
    <div className="grid grid-cols-2 gap-3">
      <Person person={inv.groom} role={inv.groom.role} />
      <Person person={inv.bride} role={inv.bride.role} />
    </div>
  );
}

function Story({ inv }: { inv: InvitationView }) {
  return (
    <ol className="grid gap-3">
      {inv.story.map((item, i) => (
        <li key={`${item.title}-${i}`} className={`${card} overflow-hidden`}>
          {item.video ? (
            <video src={item.video.src} poster={item.video.poster} className="aspect-[16/9] w-full border-b-[3px] border-inv-line object-cover" controls playsInline preload="none" />
          ) : (
            item.image && (
              <div className="relative aspect-[16/9] border-b-[3px] border-inv-line">
                <Image src={item.image} alt={item.title} fill sizes="480px" className="object-cover" />
              </div>
            )
          )}
          <div className="px-4 py-3">
            <p className="text-[10px] tracking-[.16em] text-inv-gold uppercase">
              Bab {i + 1} · {item.date}
            </p>
            <h3 className="font-display text-[19px] leading-tight font-semibold text-inv-accent">{item.title}</h3>
            {item.place && <p className="text-[12px] text-inv-ink/60">{item.place}</p>}
            <p className="mt-1 text-[13px] leading-relaxed text-inv-ink/75">{item.long || item.short}</p>
          </div>
        </li>
      ))}
    </ol>
  );
}

function Event({ inv }: { inv: InvitationView }) {
  return (
    <div className="grid gap-3">
      {inv.honor && <p className="text-center text-[13px] leading-relaxed text-inv-ink/75">{inv.honor}</p>}
      <p className="text-center font-display text-[20px] leading-tight font-semibold text-inv-accent">{inv.dateLong}</p>
      {inv.on.countdown && (
        <Countdown
          target={inv.date}
          className="grid grid-cols-3 gap-2"
          cellClassName={`${card} px-2 py-3 text-center font-display text-3xl text-inv-accent [&>span:last-child]:font-body [&>span:last-child]:text-[10px] [&>span:last-child]:text-inv-gold`}
        />
      )}
      {inv.events.map((event, i) => (
        <article key={`${event.name}-${i}`} className={`${card} px-4 py-3`}>
          <p className="text-[10px] tracking-[.16em] text-inv-gold uppercase">{event.name}</p>
          <p className="font-display text-[24px] leading-tight font-semibold text-inv-accent">
            {event.time}
            {event.until && <span className="text-[14px] text-inv-ink/60"> – {event.until}</span>}
            <span className="text-[13px] text-inv-gold"> {inv.tz}</span>
          </p>
        </article>
      ))}
      <article className={`${card} overflow-hidden text-center`}>
        <div className="relative aspect-[16/9] border-b-[3px] border-inv-line bg-inv-wash">
          <Image {...inv.frame.venue} src={inv.images.venue} alt={`Suasana ${inv.venue.name}`} fill sizes="480px" className="object-cover" />
        </div>
        <div className="px-4 py-3">
        <p className="font-display text-[18px] font-semibold">{inv.venue.name}</p>
        <p className="mt-1 text-[12px] leading-relaxed text-inv-ink/70">{inv.venue.address}</p>
        <div className="mt-3 flex flex-wrap justify-center gap-2.5">
          {inv.venue.mapUrl && (
            <a className={action} href={inv.venue.mapUrl} target="_blank" rel="noreferrer">
              Buka peta
            </a>
          )}
          <CalendarButton slug={inv.slug} google={googleCalendarUrl(calendarEventOf(inv))} className={action}>
            Simpan ke kalender
          </CalendarButton>
        </div>
        </div>
      </article>
    </div>
  );
}

function Gifts({ inv }: { inv: InvitationView }) {
  return (
    <div className="grid gap-3">
      {inv.gifts.map((gift) => (
        <article key={gift.number} className={`${card} px-4 py-3 text-center`}>
          <p className="text-[10px] tracking-[.16em] text-inv-gold uppercase">{gift.bank}</p>
          <p className="font-display text-[22px] leading-tight font-semibold tracking-wide">{gift.number}</p>
          <p className="text-[12px] text-inv-ink/70">a.n. {gift.holder}</p>
          <div className="mt-2 flex justify-center">
            <CopyButton value={gift.number} label={`Salin nomor ${gift.bank}`} />
          </div>
        </article>
      ))}
      {inv.images.qris && (
        <article className={`${card} px-4 py-3 text-center`}>
          <div className="relative mx-auto aspect-square w-full max-w-[220px]">
            <Image src={inv.images.qris} alt="QRIS" fill sizes="220px" className="object-contain" />
          </div>
          <div className="mt-2 flex justify-center">
            <QrisDownload src={inv.images.qris} slug={inv.slug} />
          </div>
        </article>
      )}
      {inv.giftNote && <p className="text-center text-[12px] text-inv-ink/70">{inv.giftNote}</p>}
    </div>
  );
}

// Pelaminan: tamu pamit kepada mempelai. Ucapan terima kasih dan foto penutup, lalu buku ucapan.
function Pelaminan({ inv, wishes }: { inv: InvitationView; wishes: Awaited<ReturnType<typeof getWishes>> | null }) {
  return (
    <div className="grid gap-4">
      {inv.on.closing && (
        <article className={`${card} overflow-hidden text-center`}>
          <div className="relative aspect-[4/3] border-b-[3px] border-inv-line bg-inv-wash">
            <Image {...inv.frame.closing} src={inv.images.closing} alt={`${inv.groom.name} dan ${inv.bride.name}`} fill sizes="480px" className="object-cover object-[50%_30%]" />
          </div>
          <div className="px-4 py-4">
            <p className="text-[13px] leading-relaxed text-inv-ink/75">
              Terima kasih, <GuestName fallback="para tamu" />, sudah hadir dan mendoakan kami.
            </p>
            <p className="mt-2 font-display text-[26px] leading-tight font-semibold text-inv-accent">
              {inv.groom.name} &amp; {inv.bride.name}
            </p>
            <p className="text-[12px] text-inv-gold">{inv.dateLong}</p>
          </div>
        </article>
      )}
      {wishes && (
        <section className={`${card} gd-wishes px-4 pt-4 pb-5`}>
          <p className="mb-4 text-center font-display text-[18px] font-semibold text-inv-accent">Buku ucapan</p>
          <Wishes slug={inv.slug} initial={wishes} variant="dialog" desktop="stack" />
        </section>
      )}
      <p className="text-center text-[11px] text-inv-ink/55">
        Dibuat dengan{" "}
        <Link href="/" className="underline underline-offset-4">
          Sowanan
        </Link>
        {inv.credit && <> · {inv.credit}</>}
      </p>
    </div>
  );
}

// Pembuka, sama seperti bagian pembuka tema lain: foto hero, monogram, nama, tanggal, tagline, dan sapaan tamu.
function Opening({ inv }: { inv: InvitationView }) {
  return (
    <div className="text-center">
      <div className="relative mx-auto aspect-[4/5] w-[min(78%,300px)] overflow-hidden rounded-2xl border-[3px] border-inv-line bg-inv-wash shadow-[0_5px_0_rgba(0,0,0,.2)]">
        <Image {...inv.frame.hero} src={inv.images.hero} alt={`${inv.groom.name} dan ${inv.bride.name}`} fill priority sizes="300px" className="object-cover object-[50%_40%]" />
      </div>
      {inv.monogram && <p className="mt-4 font-display text-[13px] tracking-[.2em] text-inv-gold uppercase">{inv.monogram}</p>}
      <p className="mt-1 font-display text-[clamp(30px,9vw,40px)] leading-[1] font-semibold text-inv-accent">
        {inv.groom.name} <span className="text-[.6em] text-inv-ink">&amp;</span> {inv.bride.name}
      </p>
      <p className="mt-2 text-[13px] font-bold">{inv.dateLong}</p>
      <p className="text-[12px] text-inv-gold">
        {inv.venue.name}, {inv.cityShort}
      </p>
      {inv.tagline && <p className="mx-auto mt-3 max-w-[34ch] text-[13px] leading-relaxed text-inv-ink/75">{inv.tagline}</p>}
      <Greeting className="mt-3 text-[13px] text-inv-ink/75" />
    </div>
  );
}

// Sambutan di papan atas peta dalam: nama tamu dari tautan.
function Welcome() {
  return (
    <p className="font-display text-[clamp(14px,4vw,17px)] leading-snug font-semibold">
      Selamat datang, <GuestName fallback="tamu kami" />
    </p>
  );
}

// Penutup "Tamat" yang terbuka setelah semua pos di aula dikunjungi: foto penutup dan daftar kredit.
function Finale({ inv }: { inv: InvitationView }) {
  const credits: [string, ReactNode][] = [
    ["Pemeran utama", <>{inv.groom.full || inv.groom.name}<br />{inv.bride.full || inv.bride.name}</>],
    ["Bersama keluarga", <>{inv.groom.parents}<br />{inv.bride.parents}</>],
    ["Lokasi", `${inv.venue.name}, ${inv.cityShort}`],
    ["Tamu istimewa", <GuestName key="guest" fallback="Kamu" />],
  ];
  return (
    <div className="px-5 pt-7 pb-4 text-center sm:px-8">
      <p className="font-display text-[clamp(44px,12vw,64px)] leading-none font-semibold text-inv-accent">Tamat</p>
      <p className="mt-2 text-[11px] font-bold tracking-[.2em] text-inv-gold uppercase">Terima kasih sudah berkunjung</p>
      {inv.images.closing && (
        <div className={`${card} relative mx-auto mt-5 aspect-[4/5] w-[min(72%,280px)] overflow-hidden`}>
          <Image {...inv.frame.closing} src={inv.images.closing} alt={`${inv.groom.name} dan ${inv.bride.name}`} fill sizes="280px" className="object-cover object-[50%_30%]" />
        </div>
      )}
      <dl className="mt-6">
        {credits.map(([role, name]) => (
          <div key={role} className="not-first:mt-4">
            <dt className="text-[10px] font-bold tracking-[.2em] text-inv-accent uppercase">{role}</dt>
            <dd className="mt-1 text-[15px] leading-relaxed">{name}</dd>
          </div>
        ))}
      </dl>
      <p className="mt-6 font-display text-[15px] font-semibold text-inv-accent">Sampai jumpa {inv.dateLong}</p>
    </div>
  );
}

// Bagian tambahan paket Istimewa (paling banyak dua) masing-masing mendapat satu kios: yang pertama di kiri,
// sisanya di kanan. Nama dan ikon kios mengikuti judul dan jenis bagiannya, misalnya Dress Code.
function extraItems(inv: InvitationView) {
  return (Object.entries(inv.extras) as [ExtraAnchor, ExtraView[]][]).flatMap(([at, items]) => items.map((e, i) => ({ at, i, e })));
}

const EXTRA_ICON: Record<ExtraKind, BoothKind> = { dresscode: "dresscode", rundown: "rundown", denah: "denah", imbauan: "imbauan", siaran: "siaran", bebas: "slot" };

function extraPanel(inv: InvitationView, id: "slot1" | "slot2", items: ReturnType<typeof extraItems>): Panel | false {
  if (!items.length) return false;
  const first = items[0].e;
  const label = first.title.trim() || EXTRA_KINDS[first.kind];
  return { id, title: label, label, icon: EXTRA_ICON[first.kind], body: <ExtraSlot inv={inv} items={items} /> };
}

function ExtraSlot({ inv, items }: { inv: InvitationView; items: ReturnType<typeof extraItems> }) {
  return items.map((x) => <Extras key={`${x.at}-${x.i}`} inv={inv} at={x.at} only={x.i} compact />);
}

// Isi undangan berupa peta di dalam gedung. Alur pos mengikuti bagan: pelaminan di ujung aula, dua baris pos
// di kiri dan kanan, penerima tamu dan kotak angpao paling dekat pintu masuk.
export async function RafiKayla({ inv }: { inv: InvitationView }) {
  const wishes = inv.on.wishes ? await getWishes(inv.slug) : null;
  const extras = extraItems(inv);
  const panels: (Panel | false)[] = [
    { id: "pembuka", title: "Selamat datang", body: <Opening inv={inv} /> },
    (wishes !== null || inv.on.closing) && { id: "pelaminan", title: wishes ? "Pelaminan dan buku ucapan" : "Pelaminan", body: <Pelaminan inv={inv} wishes={wishes} /> },
    inv.on.couple && { id: "mempelai", title: "Mempelai", body: <Couple inv={inv} /> },
    inv.on.gallery && inv.gallery.length > 0 && { id: "galeri", title: "Galeri", body: <Gallery photos={inv.gallery} variant="game" /> },
    extraPanel(inv, "slot1", extras.slice(0, 1)),
    inv.on.rsvp && { id: "rsvp", title: "Konfirmasi kehadiran", body: <Rsvp slug={inv.slug} deadline={inv.rsvpDeadline} /> },
    inv.on.story && inv.story.length > 0 && { id: "cerita", title: "Cerita kami", body: <Story inv={inv} /> },
    inv.on.event && { id: "acara", title: "Acara", body: <Event inv={inv} /> },
    extraPanel(inv, "slot2", extras.slice(1)),
    inv.on.gifts && (inv.gifts.length > 0 || Boolean(inv.images.qris)) && { id: "angpao", title: "Kotak angpao", body: <Gifts inv={inv} /> },
  ];

  return (
    <InvitationShell
      door={{ kind: "gedung", groom: inv.groom.name, bride: inv.bride.name, date: inv.dateLong, place: inv.venue.name }}
      music={inv.music}
      musicOnDoor
      className={`${themeFonts} min-h-dvh bg-inv-paper font-body text-inv-ink`}
      style={{ ...vars, ...inv.palette, ...inv.fonts }}
    >
      <InteriorMap panels={panels.filter((p): p is Panel => Boolean(p))} welcome={<Welcome />} finale={<Finale inv={inv} />} />
    </InvitationShell>
  );
}
