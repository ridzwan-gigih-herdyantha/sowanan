import { Countdown } from "@/components/countdown";
import { Container, btn } from "@/components/ui";
import { DEMO_INVITATIONS, formatEventDate } from "@/lib/invitations";

type Props = { price: string; sla: string; hours: string; waHref: string };

const demo = DEMO_INVITATIONS["andi-rina"];

export function Hero({ price, sla, hours, waHref }: Props) {
  return (
    <section>
      <Container className="flex flex-col items-stretch gap-11 pt-11 pb-10 sm:pt-16 sm:pb-14 md:flex-row md:items-center lg:gap-[72px] lg:pt-[84px] lg:pb-[76px]">
        <div className="flex-auto md:max-w-[560px]">
          <p className="mb-[22px] text-[13px] tracking-[3px] text-wine">KABARNYA SAMPAI DULU, SEBELUM TAMUNYA DATANG</p>
          <h1 className="mb-6 font-serif text-[clamp(38px,6vw,64px)] leading-[1.06] font-medium">
            Undangan nikah digital, mulai {price}.
          </h1>
          <p className="mb-[18px] max-w-[62ch] text-[clamp(16px,1.6vw,19px)] leading-[1.65] text-ink-soft">
            Kirim nama, tanggal, lokasi, dan foto lewat WhatsApp. Undangan kalian jadi dalam {sla}, tinggal disebar ke
            semua tamu.
          </p>
          <p className="mb-[18px] max-w-[62ch] text-[clamp(16px,1.6vw,19px)] leading-[1.65] text-ink-soft">
            Sudah termasuk peta lokasi, RSVP, buku ucapan, dan amplop digital. Tanpa biaya tambahan.
          </p>
          <div className="flex flex-col items-stretch gap-4 text-center sm:flex-row sm:flex-wrap sm:items-center sm:text-left">
            <a href={waHref} className={btn.primary}>
              Pesan lewat WhatsApp
            </a>
            <a href="#tema" className={btn.ghost}>
              Lihat pilihan tema
            </a>
          </div>
          <p className="mt-[26px] text-[15px] text-ink-mute">
            Dibalas dalam 1 jam, jam {hours} &middot; Bisa disebar ke berapa pun tamu
          </p>
        </div>

        <div
          aria-hidden="true"
          className="mx-auto w-full max-w-[340px] flex-none rounded-[36px] bg-ink p-3 md:mx-0 md:w-[280px] lg:w-[320px]"
        >
          <div className="flex flex-col items-center gap-[18px] rounded-[26px] bg-blush px-7 py-11 text-center">
            <p className="text-[11px] tracking-[3px] text-wine">THE WEDDING OF</p>
            <p className="font-serif text-[46px] leading-[1.1]">
              {demo.groom}
              <br />
              <span className="text-[26px] italic">&amp;</span>
              <br />
              {demo.bride}
            </p>
            <div className="h-px w-12 bg-wine-soft" />
            <p className="text-[13px] tracking-[1px] text-ink-soft">{formatEventDate(demo.date)}</p>
            <Countdown
              target={demo.date}
              className="flex gap-2"
              cellClassName="w-[52px] rounded-sm bg-ivory py-2.5 text-lg"
            />
            <div className="mt-1.5 rounded-sm bg-wine px-[26px] py-3 text-[13px] tracking-[1px] text-white">
              Buka Undangan
            </div>
          </div>
        </div>
      </Container>
    </section>
  );
}
