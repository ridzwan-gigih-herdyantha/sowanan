import Image, { getImageProps } from "next/image";
import Link from "next/link";
import type { CSSProperties, ReactNode } from "react";
import { Extras } from "@/components/invitation/extras";
import { Greeting } from "@/components/invitation/greeting";
import { Rsvp } from "@/components/invitation/rsvp";
import { Fasad, GiftCard, HangingLantern, Riwaq, SakinahHero, StarCountdown } from "@/components/invitation/sakinah/interactive";
import { Arch, Bunga, Hias, Pattern, Pita, Star, type Tile } from "@/components/invitation/sakinah/ornaments";
import { AR_RUM_21, BISMILLAH } from "@/components/invitation/sakinah/text";
import { InvitationShell } from "@/components/invitation/shell";
import { Wishes } from "@/components/invitation/wishes";
import { RevealOnScroll } from "@/components/reveal-on-scroll";
import { reveal } from "@/components/ui";
import { googleCalendarUrl } from "@/lib/calendar";
import { CalendarButton } from "@/components/invitation/calendar-button";
import { QrisDownload } from "@/components/invitation/qris-download";
import { getWishes } from "@/lib/guestbook";
import { hijri } from "@/lib/hijri";
import { calendarEventOf, type InvitationView } from "@/lib/invitation/view";
import { themeFonts } from "./fonts";

// Warna datang dari palet (palette.ts), di sini hanya font.
const vars = {
  "--inv-grain": "none",
  "--inv-display": "var(--font-sk-display), Georgia, serif",
  "--inv-body": "var(--font-sk-body), 'Helvetica Neue', Arial, sans-serif",
  "--inv-arab": "var(--font-sk-arab), 'Amiri', 'Traditional Arabic', serif",
} as CSSProperties;

const SALAM = "السَّلَامُ عَلَيْكُمْ وَرَحْمَةُ اللّٰهِ وَبَرَكَاتُهُ";

const TONES = {
  gading: { bg: "var(--inv-paper)", tex: "var(--sk-tex)", dark: false },
  pasir: { bg: "var(--sk-pasir)", tex: "var(--sk-tex)", dark: false },
  malam: { bg: "var(--inv-night)", tex: "var(--sk-emas)", dark: true },
  malam2: { bg: "var(--sk-night2)", tex: "var(--sk-emas)", dark: true },
} as const;

type Tone = keyof typeof TONES;

type Corners = "atas" | "bawah" | "silang" | "semua";

function Section({ tone, tex, corners, bunga, className = "", children }: { tone: Tone; tex?: [Tile, number]; corners?: Corners; bunga?: "kiri" | "kanan" | "dua"; className?: string; children: ReactNode }) {
  const t = TONES[tone];
  const c = `m-2 w-24 sm:w-32 lg:m-4 lg:w-44 ${t.dark ? "text-sk-emas/50" : "text-sk-emas/70"}`;
  const at = (k: "tl" | "tr" | "bl" | "br") =>
    corners === "semua" || (corners === "atas" && k[0] === "t") || (corners === "bawah" && k[0] === "b") || (corners === "silang" && (k === "tl" || k === "br"));
  return (
    <section className={`relative overflow-hidden py-14 lg:py-20 ${t.dark ? "text-inv-wash" : "text-inv-ink"} ${className}`} style={{ backgroundColor: t.bg }}>
      {tex && <Pattern name={tex[0]} color={t.tex} opacity={tex[1]} />}
      {(["tl", "tr", "bl", "br"] as const).map((k) => at(k) && <Hias key={k} name="sudut" corner={k} className={c} />)}
      {(bunga === "kiri" || bunga === "dua") && <Bunga className="absolute -bottom-6 -left-10 w-40 opacity-90 sm:w-56 lg:-left-6 lg:w-72" />}
      {(bunga === "kanan" || bunga === "dua") && <Bunga side="r" className="absolute -right-10 -bottom-6 w-40 opacity-90 sm:w-56 lg:-right-6 lg:w-72" />}
      {children}
    </section>
  );
}

function Wrap({ children, className = "" }: { children: ReactNode; className?: string }) {
  return <div className={`relative mx-auto w-full max-w-[1080px] px-5 sm:px-8 ${className}`}>{children}</div>;
}

function Heading({ arab, children, light = false, center = true }: { arab: string; children: ReactNode; light?: boolean; center?: boolean }) {
  return (
    <div {...reveal()} className={`mb-9 ${center ? "flex flex-col items-center text-center" : ""}`}>
      <div className={`flex items-center gap-3 ${light ? "text-inv-gold-light" : "text-inv-accent"}`}>
        <Star className="size-4" />
        <p lang="ar" dir="rtl" className="font-arab text-[22px] leading-none">
          {arab}
        </p>
        <Star className="size-4" />
      </div>
      <h2 className={`mt-3 font-display text-[clamp(34px,8.6vw,54px)] leading-[1.05] ${light ? "text-inv-wash" : "text-inv-ink"}`}>{children}</h2>
      <Pita className={`mt-4 h-4 w-48 sm:w-60 ${light ? "text-sk-emas/80" : "text-sk-emas"}`} />
    </div>
  );
}

// Di undangan islami hari Minggu lazim ditulis Ahad.
function tanggal(inv: InvitationView) {
  return inv.dateLong.replace(/^Minggu/, "Ahad");
}

function HeroPhoto({ inv }: { inv: InvitationView }) {
  const common = { alt: `${inv.groom.name} dan ${inv.bride.name}`, fetchPriority: "high" as const };
  const { props: { srcSet, ...rest } } = getImageProps({ ...common, src: inv.images.hero, width: 1000, height: 1400, sizes: "(min-width: 1024px) 46vw, 96vw" });
  // eslint-disable-next-line @next/next/no-img-element
  return <img {...rest} srcSet={srcSet} alt={common.alt} className="size-full object-cover object-[50%_30%]" />;
}

function Hero({ inv }: { inv: InvitationView }) {
  return (
    <section className="relative overflow-hidden" style={{ backgroundColor: TONES.gading.bg }}>
      <Pattern name="khatam" color="var(--sk-tex)" opacity={0.07} />
      <div aria-hidden="true" className="pointer-events-none absolute inset-x-0 top-0 h-[60%] bg-[radial-gradient(50%_60%_at_50%_0%,color-mix(in_srgb,var(--sk-glow)_30%,transparent),transparent_70%)]" />
      <h1 className="sr-only">
        {inv.groom.name} dan {inv.bride.name}
      </h1>
      <SakinahHero
        photo={<HeroPhoto inv={inv} />}
        groom={{ name: inv.groom.name, full: inv.groom.full }}
        bride={{ name: inv.bride.name, full: inv.bride.full }}
        top={
          <>
            <p lang="ar" dir="rtl" className="font-arab text-[clamp(24px,6.6vw,38px)] leading-loose text-inv-accent">
              {BISMILLAH}
            </p>
            <p className="mt-1 text-[11px] tracking-[0.34em] text-inv-ink/70">WALIMATUL &lsquo;URSY</p>
          </>
        }
        info={
          <>
            <Pita className="mx-auto h-4 w-56 text-sk-emas" />
            <div className="mt-4 flex flex-col items-center gap-1 sm:flex-row sm:justify-center sm:gap-4">
              <p className="font-display text-[clamp(20px,5.4vw,28px)] leading-tight text-inv-ink">{tanggal(inv)}</p>
              <Star className="hidden size-4 text-sk-emas sm:block" />
              <p className="text-[16px] text-inv-accent sm:font-display sm:text-[22px]">{hijri(inv.date, inv.tz)}</p>
            </div>
            <p className="mt-1 text-[15px] text-inv-ink/75">{inv.city}</p>
            <Greeting className="mt-3 text-[15px] text-inv-accent" />
          </>
        }
      />
    </section>
  );
}

function Ayat({ inv }: { inv: InvitationView }) {
  const ayat = inv.ayat || AR_RUM_21.ayat;
  const arti = inv.ayat ? inv.ayatArti : inv.ayatArti || AR_RUM_21.arti;
  const sumber = inv.ayat ? inv.ayatSumber : inv.ayatSumber || AR_RUM_21.sumber;
  return (
    <Section tone="malam" tex={["zellige", 0.06]} corners="silang">
      <Wrap className="max-w-[820px] text-center">
        <Hias name="mahkota" className="mx-auto mb-8 w-44 text-sk-emas/80 sm:w-56" />
        <p {...reveal()} lang="ar" dir="rtl" className="font-arab text-[clamp(24px,6.4vw,38px)] leading-[2.1] text-inv-gold-light">
          {ayat}
        </p>
        {arti && (
          <p {...reveal(1)} className="mx-auto mt-7 max-w-[58ch] text-[16px] leading-relaxed text-inv-wash/85">
            &ldquo;{arti}&rdquo;
          </p>
        )}
        {sumber && (
          <p {...reveal(2)} className="mt-4 text-[13px] tracking-[0.2em] text-inv-gold-light">
            {sumber.toUpperCase()}
          </p>
        )}
      </Wrap>
    </Section>
  );
}

function Couple({ inv }: { inv: InvitationView }) {
  const card = (p: typeof inv.groom, i: number) => (
    <div {...reveal(i + 2)} className="text-center">
      <Arch className="mx-auto aspect-[3/4] w-full max-w-[340px]" gap="var(--sk-pasir)">
        <Image src={p.photo} alt={p.full || p.name} fill sizes="(min-width: 640px) 340px, 44vw" className="object-cover object-top" />
      </Arch>
      <p className="mt-4 font-display text-[clamp(20px,5.4vw,30px)] leading-tight text-inv-ink">{p.full || p.name}</p>
      <p className="mt-1 text-[13px] text-inv-ink/70">{p.role}</p>
      <p className="text-[14px] leading-snug text-inv-ink/90">{p.parents}</p>
    </div>
  );
  return (
    <Section tone="pasir" tex={["lingkar", 0.08]} corners="atas" bunga="dua" className="pb-24 lg:pb-28">
      <Wrap>
        <div {...reveal()} className="mx-auto mb-10 max-w-[46ch] text-center">
          <p lang="ar" dir="rtl" className="font-arab text-[clamp(22px,6vw,30px)] leading-loose text-inv-accent">
            {SALAM}
          </p>
          <p className="mt-2 text-[13px] tracking-[0.12em] text-inv-ink/70">ASSALAMU&rsquo;ALAIKUM WARAHMATULLAHI WABARAKATUH</p>
          <p className="mt-4 text-[17px] leading-relaxed text-inv-ink/85">
            Dengan memohon rahmat dan ridha Allah Subhanahu wa Ta&rsquo;ala, kami bermaksud menyelenggarakan pernikahan putra dan putri kami.
          </p>
        </div>
        <div className="mx-auto grid max-w-[760px] grid-cols-2 items-start gap-4 sm:gap-10">
          {card(inv.groom, 0)}
          {card(inv.bride, 1)}
        </div>
      </Wrap>
    </Section>
  );
}

function StorySection({ inv }: { inv: InvitationView }) {
  return (
    <Section tone="gading" tex={["khatam", 0.05]} corners="bawah">
      <Wrap>
        <Heading arab="قِصَّتُنَا">Kisah kami</Heading>
        <div {...reveal(1)}>
          <Riwaq items={inv.story.map((s) => ({ title: s.title, date: s.date, image: s.image, short: s.short, long: s.long }))} />
        </div>
      </Wrap>
    </Section>
  );
}

function EventDetails({ inv }: { inv: InvitationView }) {
  const btn = "inline-flex items-center gap-2 rounded-sm bg-inv-wash px-5 py-3 text-[14px] font-medium text-inv-ink no-underline transition-colors duration-150 hover:bg-inv-gold-light";
  return (
    <Section tone="malam2" tex={["khatam", 0.15]} corners="atas">
      <Wrap>
        <Heading arab="اَلْمَوْعِدُ" light>
          Akad &amp; walimah
        </Heading>
        <div className="grid gap-10 lg:grid-cols-[1fr_400px] lg:gap-16">
          <div>
            <div {...reveal(1)} className="text-center lg:text-left">
              <p className="font-display text-[clamp(26px,7vw,40px)] leading-tight">{tanggal(inv)}</p>
              <p className="mt-1 text-[15px] text-inv-gold-light">{hijri(inv.date, inv.tz)}</p>
              {inv.honor && <p className="mx-auto mt-5 max-w-[46ch] text-[16px] leading-relaxed text-inv-wash/85 lg:mx-0">{inv.honor}</p>}
            </div>
            <div className="mt-8 grid grid-cols-2 gap-3 sm:gap-5">
              {inv.events.map((e, i) => (
                <div key={e.name} {...reveal(i + 2)}>
                  <Arch className="aspect-[3/3.7]" gap="var(--sk-night2)" line="var(--sk-emas)" inner="bg-inv-paper">
                    <div className="flex h-full flex-col items-center justify-center px-3 pt-[24%] pb-4 text-center text-inv-ink">
                      <Star className="mb-2 size-6 text-sk-emas" />
                      <p className="font-display text-[clamp(19px,5.4vw,28px)] leading-tight">{e.name}</p>
                      <p className="mt-2 text-[clamp(13px,3.6vw,15px)] leading-snug text-inv-accent">
                        {e.time}
                        {e.until ? ` sampai ${e.until}` : ""} {inv.tz}
                      </p>
                    </div>
                  </Arch>
                </div>
              ))}
            </div>
          </div>
          <div {...reveal(2)}>
            <Arch className="aspect-[4/4.4]" gap="var(--sk-night2)">
              <Image src={inv.images.venue} alt={`Suasana ${inv.venue.name}`} fill sizes="(min-width: 1024px) 400px, 92vw" className="object-cover" />
            </Arch>
            <p className="mt-5 font-display text-[26px] leading-tight">{inv.venue.name}</p>
            <p className="mt-1 text-[15px] text-inv-wash/80">{inv.venue.address}</p>
            <div className="mt-5 flex flex-wrap gap-3">
              <a href={inv.venue.mapUrl} target="_blank" rel="noopener" className={btn}>
                Buka peta
              </a>
              <CalendarButton slug={inv.slug} google={googleCalendarUrl(calendarEventOf(inv))} className={btn}>
                Simpan ke kalender
              </CalendarButton>
            </div>
          </div>
        </div>
      </Wrap>
    </Section>
  );
}

function CountdownSection({ inv }: { inv: InvitationView }) {
  return (
    <Section tone="pasir" tex={["lingkar", 0.08]} corners="semua">
      <Wrap className="max-w-[760px]">
        <Heading arab="إِنْ شَاءَ اللّٰهُ">Menuju hari bahagia</Heading>
        <div {...reveal(1)}>
          <StarCountdown target={inv.date} />
        </div>
        <p className="mt-7 text-center text-[14px] text-inv-ink/75">Ketuk bintang untuk berganti ke angka Arab.</p>
      </Wrap>
    </Section>
  );
}

function GallerySection({ inv }: { inv: InvitationView }) {
  return (
    <Section tone="gading" tex={["khatam", 0.05]}>
      <Wrap>
        <Heading arab="لَحَظَاتُنَا">Lembar kenangan</Heading>
        <Fasad
          photos={inv.gallery.map((p) => ({ src: p.src, w: p.w, h: p.h, alt: p.alt }))}
          note={
            <>
              <Hias name="mahkota" className="w-24 text-sk-emas lg:w-32" />
              <p lang="ar" dir="rtl" className="mt-3 font-arab text-[clamp(22px,6vw,32px)] leading-snug text-inv-gold-light">
                اَلْحَمْدُ لِلّٰهِ
              </p>
              <p className="mt-1 max-w-[18ch] text-[clamp(12px,3.2vw,15px)] leading-snug text-inv-wash/80">Setiap lembar adalah syukur kami.</p>
            </>
          }
        />
        <p className="mt-4 text-center text-[13px] text-inv-ink/65">Ketuk foto untuk melihatnya penuh.</p>
      </Wrap>
    </Section>
  );
}

// Konfirmasi kehadiran sebagai kartu balasan: foto venue dengan judul di satu panel, formulir di kertas berbingkai di panel lain.
function RsvpSection({ inv }: { inv: InvitationView }) {
  return (
    <Section tone="pasir" tex={["lingkar", 0.09]}>
      <Wrap className="max-w-[980px]">
        <div {...reveal()} className="overflow-hidden rounded-sm bg-inv-paper shadow-[0_24px_50px_color-mix(in_srgb,var(--inv-ink)_16%,transparent)] ring-1 ring-sk-emas/50 md:grid md:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)]">
          <div className="relative min-h-[260px] overflow-hidden text-inv-wash md:min-h-[400px]">
            <Image src={inv.images.heroWide} alt="" fill sizes="(min-width: 768px) 440px, 100vw" className="object-cover" />
            <div aria-hidden="true" className="absolute inset-0 bg-gradient-to-t from-inv-night via-inv-night/70 to-inv-night/20" />
            <Pattern name="zellige" color="var(--sk-emas)" opacity={0.08} />
            <div className="relative flex h-full min-h-[inherit] flex-col justify-end p-6 sm:p-8">
              <p lang="ar" dir="rtl" className="self-start font-arab text-[22px] leading-none text-inv-gold-light">
                تَأْكِيْدُ الْحُضُوْرِ
              </p>
              <h2 className="mt-3 font-display text-[clamp(32px,8vw,46px)] leading-[1.05]">Konfirmasi kehadiran</h2>
              <Pita className="mt-4 h-3.5 w-44 text-sk-emas" />
              <p className="mt-4 max-w-[36ch] text-[15px] leading-relaxed text-inv-wash/85">
                Kehadiran dan doa restu Bapak/Ibu/Saudara/i adalah hadiah terbaik bagi kami.
              </p>
            </div>
          </div>
          <div className="relative p-2.5 sm:p-4">
            <div className="relative flex h-full items-center border border-sk-emas/60 px-5 pt-10 pb-12 outline outline-1 outline-offset-[-7px] outline-sk-emas/30 sm:px-10">
              <Hias name="sudut" corner="tl" className="m-1 w-12 text-sk-emas/80" />
              <Hias name="sudut" corner="tr" className="m-1 w-12 text-sk-emas/80" />
              <Hias name="sudut" corner="bl" className="m-1 w-12 text-sk-emas/80" />
              <Hias name="sudut" corner="br" className="m-1 w-12 text-sk-emas/80" />
              <div className="relative w-full">
                <Rsvp slug={inv.slug} deadline={inv.rsvpDeadline} />
              </div>
            </div>
          </div>
        </div>
      </Wrap>
    </Section>
  );
}

function Gifts({ inv }: { inv: InvitationView }) {
  return (
    <Section tone="gading" tex={["khatam", 0.05]} corners="atas" bunga="kanan" className="pb-24 lg:pb-28">
      <Wrap>
        <Heading arab="هَدِيَّةٌ">Tanda kasih</Heading>
        <p {...reveal(1)} className="mx-auto -mt-3 max-w-[44ch] text-center text-[17px] leading-relaxed text-inv-ink/85">
          Doa restu Bapak/Ibu/Saudara/i sudah lebih dari cukup. Bagi yang ingin memberi tanda kasih, rekeningnya ada di balik kartu berikut.
        </p>
        <div className="mx-auto mt-8 grid max-w-[860px] gap-5 md:grid-cols-2">
          {inv.gifts.map((g, i) => (
            <div key={g.number} {...reveal(i + 2)}>
              <GiftCard account={g} />
            </div>
          ))}
        </div>
        {inv.images.qris && (
          <div className="mx-auto mt-8 flex max-w-[360px] items-center gap-5 rounded-sm border border-inv-line bg-inv-wash p-5">
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
    <Section tone="pasir" tex={["lingkar", 0.07]} corners="atas" bunga="kiri" className="pb-24 lg:pb-28">
      <Wrap>
        <Heading arab="اَلدُّعَاءُ">Doa dan ucapan</Heading>
        <p {...reveal(1)} className="mx-auto -mt-4 mb-10 max-w-[46ch] text-center text-[16px] text-inv-ink/80">
          Kirimkan doa terbaikmu untuk kami. Setiap doa akan kami aminkan bersama.
        </p>
        <div {...reveal(2)}>
          <Wishes slug={inv.slug} initial={wishes} variant="doa" />
        </div>
      </Wrap>
    </Section>
  );
}

function Closing({ inv }: { inv: InvitationView }) {
  return (
    <Section tone="malam" tex={["khatam", 0.08]} corners="bawah" className="pt-24 pb-16 lg:pt-28">
      <HangingLantern chain={36} dim className="left-[6%] w-10 sm:w-12 lg:left-[18%]" />
      <HangingLantern chain={70} dim className="left-1/2 w-12 -translate-x-1/2 sm:w-14" delay={0.1} />
      <HangingLantern chain={46} dim className="right-[6%] w-10 sm:w-12 lg:right-[18%]" delay={0.2} />
      <Wrap className="max-w-[720px] pt-24 text-center sm:pt-28">
        <p {...reveal()} lang="ar" dir="rtl" className="font-arab text-[clamp(32px,9vw,52px)] leading-loose text-inv-gold-light">
          جَزَاكُمُ اللّٰهُ خَيْرًا
        </p>
        <p {...reveal(1)} className="text-[13px] tracking-[0.24em] text-inv-wash/75">JAZAKUMULLAHU KHAIRAN</p>
        <p {...reveal(2)} className="mx-auto mt-6 max-w-[44ch] text-[17px] leading-relaxed text-inv-wash/85">
          Merupakan suatu kehormatan dan kebahagiaan bagi kami apabila Bapak/Ibu/Saudara/i berkenan hadir dan memberikan doa restu.
        </p>
        <p {...reveal(3)} className="mt-6 text-[14px] text-inv-gold-light">
          Wassalamu&rsquo;alaikum warahmatullahi wabarakatuh
        </p>
        <Pita className="mx-auto mt-8 h-4 w-56 text-sk-emas/70" />
        <p {...reveal(4)} className="mt-6 font-script text-[clamp(30px,8vw,44px)] leading-tight">
          {inv.groom.name} &amp; {inv.bride.name}
        </p>
        <p className="mt-6 text-[13px] text-inv-wash/60">Ketuk lentera untuk menyalakan atau memadamkannya.</p>
      </Wrap>
    </Section>
  );
}

function Footer({ inv }: { inv: InvitationView }) {
  return (
    <footer className="bg-inv-ink py-8 text-inv-wash/75">
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

function Divider({ tone }: { tone: Tone }) {
  return (
    <div aria-hidden="true" className="relative py-3" style={{ backgroundColor: TONES[tone].bg }}>
      <Pita className="mx-auto h-5 w-full max-w-[1080px] px-5 text-sk-emas/55" />
    </div>
  );
}

export function FadhilNayla({ inv }: { inv: InvitationView }) {
  return (
    <InvitationShell
      door={{ kind: "pintu", groom: inv.groom.name, bride: inv.bride.name, date: tanggal(inv), hijri: hijri(inv.date, inv.tz) }}
      music={inv.music}
      className={`${themeFonts} sk-root min-h-dvh overflow-x-clip bg-inv-paper font-body text-[17px] text-inv-ink`}
      style={{ ...vars, ...inv.palette, ...inv.fonts }}
    >
      {/* Latar halaman ikut palet. html berada di luar tema, jadi tidak bisa membaca CSS variable-nya. */}
      <style>{`html:has(.sk-root){background:${inv.palette["--inv-paper"]};scrollbar-color:${inv.palette["--sk-emas"]} ${inv.palette["--inv-paper"]}}html:has(.sk-door){background:${inv.palette["--sk-night2"]}}`}</style>
      <main>
        <Hero inv={inv} />
        <Ayat inv={inv} />
        <Extras inv={inv} at="hero" />
        {inv.on.couple && <Couple inv={inv} />}
        <Extras inv={inv} at="couple" />
        {inv.on.story && (
          <>
            <Divider tone="gading" />
            <StorySection inv={inv} />
          </>
        )}
        <Extras inv={inv} at="story" />
        {inv.on.event && <EventDetails inv={inv} />}
        <Extras inv={inv} at="event" />
        {inv.on.countdown && <CountdownSection inv={inv} />}
        <Extras inv={inv} at="countdown" />
        {inv.on.gallery && (
          <>
            <Divider tone="gading" />
            <GallerySection inv={inv} />
          </>
        )}
        <Extras inv={inv} at="gallery" />
        {inv.on.rsvp && <RsvpSection inv={inv} />}
        <Extras inv={inv} at="rsvp" />
        {inv.on.gifts && <Gifts inv={inv} />}
        <Extras inv={inv} at="gifts" />
        {inv.on.wishes && <WishesSection inv={inv} />}
        <Extras inv={inv} at="wishes" />
        {inv.on.closing && <Closing inv={inv} />}
        <Extras inv={inv} at="closing" />
      </main>
      <Footer inv={inv} />
      <RevealOnScroll />
    </InvitationShell>
  );
}
