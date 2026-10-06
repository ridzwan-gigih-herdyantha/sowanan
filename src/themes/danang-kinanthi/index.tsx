import Image, { getImageProps } from "next/image";
import Link from "next/link";
import type { CSSProperties, ReactNode } from "react";
import { Extras } from "@/components/invitation/extras";
import { Greeting } from "@/components/invitation/greeting";
import { Lung, Lurik, Motif, Seret, texture, Wiru, type MotifName, type TextureName } from "@/components/invitation/pakeliran-ornaments";
import { Amplop, BabakList, HeroStage, PuppetFlip, SaronCountdown, Simpingan, TancepKayon } from "@/components/invitation/pakeliran/interactive";
import { BatikBand } from "@/components/invitation/pakeliran/puppet";
import { Rsvp } from "@/components/invitation/rsvp";
import { InvitationShell } from "@/components/invitation/shell";
import { Wishes } from "@/components/invitation/wishes";
import { RevealOnScroll } from "@/components/reveal-on-scroll";
import { reveal } from "@/components/ui";
import { googleCalendarUrl } from "@/lib/calendar";
import { getWishes } from "@/lib/guestbook";
import { calendarEventOf, type InvitationView } from "@/lib/invitation/view";
import { pasaran } from "@/lib/javanese";
import { themeFonts } from "./fonts";

// Warna datang dari palet (palette.ts), di sini hanya font.
const vars = {
  "--inv-grain": "none",
  "--inv-display": "var(--font-pk-display), Georgia, serif",
  "--inv-body": "var(--font-pk-body), 'Helvetica Neue', Arial, sans-serif",
  "--inv-jawa": "var(--font-pk-jawa), 'Noto Sans Javanese', sans-serif",
} as CSSProperties;

const TONES = {
  gading: { bg: "var(--inv-paper)", ink: "var(--pk-tex)", dark: false },
  pasir: { bg: "var(--pk-pasir)", ink: "var(--pk-tex)", dark: false },
  soga: { bg: "var(--inv-night)", ink: "var(--inv-gold-light)", dark: true },
  lumut: { bg: "var(--pk-lumut)", ink: "var(--inv-gold-light)", dark: true },
} as const;

type Tone = keyof typeof TONES;

type Corners = "atas" | "bawah" | "semua";

function Section({ tone, tex, corners, className = "", children }: { tone: Tone; tex?: [TextureName, number]; corners?: Corners; className?: string; children: ReactNode }) {
  const t = TONES[tone];
  const lung = `w-24 sm:w-32 lg:w-44 ${t.dark ? "text-inv-gold-light/45" : "text-pk-ukir/70"}`;
  return (
    <section className={`relative overflow-hidden py-14 lg:py-20 ${t.dark ? "text-inv-wash" : "text-inv-ink"} ${className}`} style={{ backgroundColor: t.bg }}>
      {tex && <div aria-hidden="true" className="pointer-events-none absolute inset-0" style={texture(tex[0], t.ink, tex[1])} />}
      {(corners === "atas" || corners === "semua") && (
        <>
          <Lung name="sudut" corner="tl" className={`m-2 lg:m-4 ${lung}`} />
          <Lung name="sudut" corner="tr" className={`m-2 lg:m-4 ${lung}`} />
        </>
      )}
      {(corners === "bawah" || corners === "semua") && (
        <>
          <Lung name="sudut" corner="bl" className={`m-2 lg:m-4 ${lung}`} />
          <Lung name="sudut" corner="br" className={`m-2 lg:m-4 ${lung}`} />
        </>
      )}
      {children}
    </section>
  );
}

function Wrap({ children, className = "" }: { children: ReactNode; className?: string }) {
  return <div className={`relative mx-auto w-full max-w-[1080px] px-5 sm:px-8 ${className}`}>{children}</div>;
}

function Heading({ motif, jawa, children, light = false, center = false }: { motif: MotifName; jawa: string; children: ReactNode; light?: boolean; center?: boolean }) {
  return (
    <div {...reveal()} className={`mb-9 ${center ? "flex flex-col items-center text-center" : ""}`}>
      <div className={`flex items-center gap-3 ${light ? "text-inv-gold-light" : "text-inv-accent"}`}>
        <Motif name={motif} />
        <p lang="jv" className="font-jawa text-[20px]">
          {jawa}
        </p>
      </div>
      <h2 className={`mt-2 font-display text-[clamp(34px,8.6vw,56px)] leading-[1.05] ${light ? "text-inv-wash" : "text-inv-ink"}`}>{children}</h2>
      <Lung name="tepi" className={`mt-3 w-52 lg:w-64 ${light ? "text-inv-gold-light/70" : "text-pk-ukir"}`} />
    </div>
  );
}

function tanggal(inv: InvitationView) {
  return `${inv.dayLabel} ${pasaran(inv.date, inv.tz)}, ${inv.dateLong.split(", ").slice(1).join(", ")}`;
}

function HeroPhoto({ inv }: { inv: InvitationView }) {
  const common = { alt: `${inv.groom.name} dan ${inv.bride.name}`, fetchPriority: "high" as const };
  const { props: { srcSet, ...rest } } = getImageProps({ ...common, src: inv.images.hero, width: 1000, height: 1500, sizes: "(min-width: 1024px) 420px, 80vw" });
  // eslint-disable-next-line @next/next/no-img-element
  return <img {...rest} srcSet={srcSet} alt={common.alt} className="size-full object-cover object-[50%_25%]" />;
}

function Hero({ inv }: { inv: InvitationView }) {
  return (
    <section className="relative overflow-hidden pt-6 pb-10 text-center text-inv-ink lg:pt-5 lg:pb-12" style={{ backgroundColor: TONES.gading.bg }}>
      <div aria-hidden="true" className="pointer-events-none absolute inset-0" style={texture("kawung", "var(--pk-tex)", 0.1)} />
      <Lung name="sudut" corner="tl" className="m-2 w-24 text-pk-ukir/70 sm:w-32 lg:m-4 lg:w-48" />
      <Lung name="sudut" corner="tr" className="m-2 w-24 text-pk-ukir/70 sm:w-32 lg:m-4 lg:w-48" />
      <h1 className="sr-only">
        {inv.groom.name} dan {inv.bride.name}
      </h1>
      <div className="relative mb-3 lg:mb-4">
        <p lang="jv" className="font-jawa text-[22px] leading-tight text-inv-accent">
          ꦱꦸꦒꦼꦁꦫꦮꦸꦃ
        </p>
        <p className="mt-0.5 text-[11px] tracking-[0.32em] text-inv-ink/75">SUGENG RAWUH</p>
      </div>
      <div className="relative">
        <HeroStage
          photo={<HeroPhoto inv={inv} />}
          groom={{ name: inv.groom.name, aksara: inv.groom.aksara }}
          bride={{ name: inv.bride.name, aksara: inv.bride.aksara }}
          names={
            <p aria-hidden="true" className="font-display text-[clamp(38px,11vw,64px)] leading-[0.95] text-inv-wash">
              {inv.groom.name}
              <span className="mx-1.5 text-[0.5em] text-inv-gold-light">&amp;</span>
              <br />
              {inv.bride.name}
            </p>
          }
          below={
            <div className="text-center">
              <p className="font-display text-[clamp(18px,4.6vw,28px)] leading-tight text-inv-ink">{tanggal(inv)}</p>
              <p className="mt-1 text-[15px] text-inv-ink/75">{inv.city}</p>
              <Greeting className="mt-2 text-[15px] text-inv-accent" />
            </div>
          }
        />
      </div>
    </section>
  );
}

function Couple({ inv }: { inv: InvitationView }) {
  const back = (p: typeof inv.groom) => (
    <div className="relative flex h-full flex-col">
      <div className="relative h-3/4 shrink-0">
        <Image src={p.photo} alt={p.full || p.name} fill sizes="(min-width: 640px) 340px, 46vw" className="object-cover object-top" />
      </div>
      <div className="flex flex-1 flex-col items-center justify-center px-2 text-center">
        <p className="font-display text-[clamp(15px,4.2vw,24px)] leading-tight text-inv-ink">{p.full || p.name}</p>
        <p className="mt-0.5 text-[clamp(10.5px,2.9vw,13px)] leading-snug text-inv-ink/80">
          {p.role} <span className="text-inv-ink">{p.parents}</span>
        </p>
      </div>
    </div>
  );
  return (
    <Section tone="pasir" tex={["truntum", 0.14]} corners="atas">
      <Wrap>
        <Heading motif="sekar" jawa="ꦱꦼꦥꦱꦁ" center>
          Sepasang
        </Heading>
        <p {...reveal(1)} className="mx-auto -mt-3 mb-10 max-w-[40ch] text-center text-[17px] leading-relaxed text-inv-ink/85">
          Seperti Kamajaya dan Kamaratih, lambang pasangan yang rukun dalam tradisi Jawa. Ketuk wayangnya untuk mengenal kami.
        </p>
        <div className="mx-auto grid max-w-[720px] grid-cols-2 gap-4 sm:gap-10">
          <div {...reveal(2)}>
            <PuppetFlip puppet="kamajaya" label={inv.groom.name} back={back(inv.groom)} />
          </div>
          <div {...reveal(3)}>
            <PuppetFlip puppet="kamaratih" label={inv.bride.name} back={back(inv.bride)} />
          </div>
        </div>
      </Wrap>
    </Section>
  );
}

function StorySection({ inv }: { inv: InvitationView }) {
  return (
    <Section tone="soga" tex={["nitik", 0.1]} corners="atas">
      <Wrap className="max-w-[960px]">
        <Heading motif="wajik" jawa="ꦭꦏꦺꦴꦤ꧀" light center>
          Lakon kami
        </Heading>
        <BabakList items={inv.story.map((s) => ({ title: s.title, date: s.date, image: s.image, short: s.short, long: s.long }))} />
      </Wrap>
    </Section>
  );
}

function EventDetails({ inv }: { inv: InvitationView }) {
  const btn = "inline-flex items-center gap-2 rounded-sm bg-inv-ink px-5 py-3 text-[14px] text-inv-wash no-underline transition-colors duration-150 hover:bg-inv-accent";
  return (
    <Section tone="gading" tex={["ceplok", 0.1]} corners="bawah">
      <Wrap className="lg:grid lg:grid-cols-[1fr_420px] lg:gap-16">
        <div>
          <Heading motif="tumpal" jawa="ꦥꦲꦂꦒꦾꦤ꧀">
            Pahargyan
          </Heading>
          <p {...reveal(1)} className="max-w-[42ch] text-[18px] leading-relaxed">
            {inv.honor}
          </p>
          <p {...reveal(2)} className="mt-6 font-display text-[clamp(24px,6.5vw,34px)] text-inv-ink">
            {tanggal(inv)}
          </p>
          <Seret className="mt-3 w-40" />
          <ol className="relative mt-7 border-l border-pk-emas pl-8">
            {inv.events.map((e, i) => (
              <li key={e.name} {...reveal(i + 3)} className="relative pb-6 last:pb-0">
                <span className="absolute top-1.5 -left-[44px] flex size-6 items-center justify-center bg-inv-paper text-inv-accent">
                  <Motif name="wajik" className="size-5" />
                </span>
                <p className="font-display text-[26px] leading-tight text-inv-ink">{e.name}</p>
                <p className="mt-1 text-[16px] text-inv-accent">
                  {e.time}
                  {e.until ? ` sampai ${e.until}` : ""} {inv.tz}
                </p>
              </li>
            ))}
          </ol>
        </div>
        <div {...reveal(2)} className="mt-12 lg:mt-4">
          <div className="relative aspect-[4/5] overflow-hidden rounded-t-[999px] shadow-[0_0_0_5px_var(--inv-paper),0_0_0_6px_var(--pk-emas),0_20px_36px_rgba(62,46,34,.18)]">
            <Image src={inv.images.venue} alt={`Suasana ${inv.venue.name}`} fill sizes="(min-width: 1024px) 420px, 90vw" className="object-cover" />
          </div>
          <p className="mt-5 font-display text-[26px] text-inv-ink">{inv.venue.name}</p>
          <p className="mt-1 text-[16px] text-inv-ink/80">{inv.venue.address}</p>
          <div className="mt-5 flex flex-wrap gap-3">
            <a href={inv.venue.mapUrl} target="_blank" rel="noopener" className={btn}>
              Buka peta
            </a>
            <a href={`/${inv.slug}/kalender`} download={`${inv.slug}.ics`} className={btn}>
              Simpan ke kalender
            </a>
            <a href={googleCalendarUrl(calendarEventOf(inv))} target="_blank" rel="noopener" className={btn}>
              Google Calendar
            </a>
          </div>
        </div>
      </Wrap>
    </Section>
  );
}

function CountdownSection({ inv }: { inv: InvitationView }) {
  return (
    <Section tone="lumut" tex={["kawung", 0.08]} corners="semua">
      <Wrap className="max-w-[760px]">
        <Heading motif="kawung" jawa="ꦮꦤ꧀ꦕꦶ" light center>
          Menghitung hari
        </Heading>
        <div {...reveal(1)}>
          <SaronCountdown target={inv.date} />
        </div>
        <p className="mt-6 text-center text-[14px] text-inv-wash/80">Ketuk bilah saron untuk menabuhnya.{!inv.music && " Gending latar undangan ini juga dimainkan oleh saron yang sama."}</p>
      </Wrap>
    </Section>
  );
}

function GallerySection({ inv }: { inv: InvitationView }) {
  return (
    <Section tone="pasir">
      <Wrap>
        <Heading motif="ceplok" jawa="ꦒꦩ꧀ꦧꦂ" center>
          Simpingan
        </Heading>
        <p {...reveal(1)} className="mx-auto -mt-4 mb-6 max-w-[40ch] text-center text-[16px] text-inv-ink/80">
          Seperti wayang yang dijajar di tepi kelir, kenangan kami berdiri berjajar.
        </p>
        <div {...reveal(2)}>
          <Simpingan photos={inv.gallery.map((p) => ({ src: p.src, w: p.w, h: p.h, alt: p.alt }))} />
        </div>
      </Wrap>
    </Section>
  );
}

function RsvpSection({ inv }: { inv: InvitationView }) {
  return (
    <Section tone="soga" tex={["truntum", 0.1]} corners="bawah">
      <Wrap className="max-w-[640px]">
        <Heading motif="truntum" jawa="ꦫꦮꦸꦃ" light center>
          Konfirmasi kehadiran
        </Heading>
        <div {...reveal(1)} className="relative mt-24 rounded-sm bg-inv-paper px-6 pt-10 pb-12 text-inv-ink sm:px-10">
          <Lung name="mahkota" className="absolute bottom-[calc(100%-8px)] left-1/2 w-56 -translate-x-1/2 text-inv-gold-light" />
          <Lurik variant="b" className="absolute inset-x-0 top-0" />
          <Rsvp slug={inv.slug} deadline={inv.rsvpDeadline} />
        </div>
      </Wrap>
    </Section>
  );
}

function Gifts({ inv }: { inv: InvitationView }) {
  return (
    <Section tone="gading" tex={["nitik", 0.12]} corners="atas">
      <Wrap>
        <Heading motif="wajik" jawa="ꦠꦤ꧀ꦝꦏꦱꦶꦃ" center>
          Tanda kasih
        </Heading>
        <p {...reveal(1)} className="mx-auto -mt-3 max-w-[42ch] text-center text-[17px] leading-relaxed text-inv-ink/85">
          Doa restu Bapak/Ibu/Saudara/i sudah lebih dari cukup. Bagi yang ingin memberi tanda kasih, amplopnya ada di bawah ini.
        </p>
        <div className="mt-8 grid items-end gap-x-10 gap-y-8 md:grid-cols-2">
          {inv.gifts.map((g, i) => (
            <div key={g.number} {...reveal(i + 2)}>
              <Amplop account={g} monogram={inv.monogram} />
            </div>
          ))}
        </div>
        {inv.images.qris && (
          <div className="mx-auto mt-8 flex max-w-[360px] items-center gap-5 rounded-sm bg-inv-wash p-5">
            <Image src={inv.images.qris} alt="Kode QRIS" width={112} height={112} className="size-28" />
            <p className="text-[15px] leading-relaxed">Pindai QRIS dari aplikasi bank atau e-wallet.</p>
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
    <Section tone="pasir" tex={["truntum", 0.12]} corners="bawah">
      <Wrap>
        <Heading motif="sekar" jawa="ꦥꦔꦺꦱ꧀ꦠꦸ">
          Pangestu
        </Heading>
        <p {...reveal(1)} className="-mt-4 mb-8 max-w-[44ch] text-[16px] text-inv-ink/80">
          Tuliskan doa dan pangestu untuk kami. Setiap ucapan kami simpan sebagai serat kenangan.
        </p>
        <div {...reveal(2)}>
          <Wishes slug={inv.slug} initial={wishes} variant="serat" />
        </div>
      </Wrap>
    </Section>
  );
}

function Closing({ inv }: { inv: InvitationView }) {
  return (
    <Section tone="soga" tex={["kawung", 0.07]} corners="semua">
      <Wrap className="grid items-center gap-8 lg:grid-cols-[minmax(0,400px)_1fr] lg:gap-16">
        <div {...reveal()}>
          <TancepKayon />
        </div>
        <div className="text-center lg:text-left">
          <p {...reveal(1)} lang="jv" className="font-jawa text-[24px] text-inv-gold-light">
            ꦩꦠꦸꦂꦤꦸꦮꦸꦤ꧀
          </p>
          <p {...reveal(2)} className="mt-1 font-display text-[clamp(40px,10vw,66px)] leading-tight">
            Matur nuwun
          </p>
          <p {...reveal(3)} className="mx-auto mt-4 max-w-[40ch] text-[17px] leading-relaxed text-inv-wash/85 lg:mx-0">
            Merupakan kebahagiaan bagi kami apabila Bapak/Ibu/Saudara/i berkenan hadir dan memberikan doa restu.
          </p>
          {inv.sesanti && (
            <figure {...reveal(4)} className="mt-8 lg:border-l-2 lg:border-pk-emas lg:pl-5">
              <blockquote className="font-display text-[clamp(22px,6vw,30px)] text-inv-gold-light">{inv.sesanti}</blockquote>
              {inv.sesantiArti && <figcaption className="mt-1 text-[15px] text-inv-wash/75">{inv.sesantiArti}</figcaption>}
            </figure>
          )}
          <p {...reveal(5)} className="mt-8 font-display text-[28px] text-inv-gold-light">
            {inv.groom.name} &amp; {inv.bride.name}
          </p>
        </div>
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

export function DanangKinanthi({ inv }: { inv: InvitationView }) {
  return (
    <InvitationShell
      door={{
        kind: "kelir",
        groom: inv.groom.name,
        bride: inv.bride.name,
        groomAksara: inv.groom.aksara,
        brideAksara: inv.bride.aksara,
        date: tanggal(inv),
      }}
      music={inv.music}
      synth="gending"
      className={`${themeFonts} pk-root min-h-dvh overflow-x-clip bg-inv-paper font-body text-[17px] text-inv-ink`}
      style={{ ...vars, ...inv.palette, ...inv.fonts }}
    >
      {/* Latar dan scrollbar halaman ikut palet. html berada di luar tema, jadi tidak bisa membaca CSS variable-nya. */}
      <style>{`html:has(.pk-root){background:${inv.palette["--inv-paper"]};scrollbar-color:${inv.palette["--pk-ukir"]} ${inv.palette["--inv-paper"]}}`}</style>
      <main>
        <Hero inv={inv} />
        <Wiru />
        <Extras inv={inv} at="hero" />
        {inv.on.couple && <Couple inv={inv} />}
        <Extras inv={inv} at="couple" />
        {inv.on.story && (
          <>
            <Lurik />
            <StorySection inv={inv} />
          </>
        )}
        <Extras inv={inv} at="story" />
        {inv.on.event && <EventDetails inv={inv} />}
        <Extras inv={inv} at="event" />
        {inv.on.countdown && (
          <>
            <Lurik variant="b" />
            <CountdownSection inv={inv} />
            <BatikBand />
          </>
        )}
        <Extras inv={inv} at="countdown" />
        {inv.on.gallery && <GallerySection inv={inv} />}
        <Extras inv={inv} at="gallery" />
        {inv.on.rsvp && (
          <>
            <Lurik />
            <RsvpSection inv={inv} />
          </>
        )}
        <Extras inv={inv} at="rsvp" />
        {inv.on.gifts && <Gifts inv={inv} />}
        <Extras inv={inv} at="gifts" />
        {inv.on.wishes && (
          <>
            <Wiru />
            <WishesSection inv={inv} />
          </>
        )}
        <Extras inv={inv} at="wishes" />
        {inv.on.closing && (
          <>
            <Lurik variant="b" />
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
