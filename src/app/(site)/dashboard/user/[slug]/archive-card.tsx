import { Countdown } from "@/components/countdown";
import { formatDateId } from "@/lib/invitation/archive";

type Props = { archiveAt: Date | null; due: boolean; archived: boolean; notified: boolean };

// Sisa waktu sampai undangan menjadi arsip, tampil sejak undangan dibuat. Rekap tetap dikirim CS lewat WhatsApp pada
// tujuh hari terakhir, jadi kartu ini hanya memberi tahu statusnya.
export function ArchiveCard({ archiveAt, due, archived, notified }: Props) {
  if (!archiveAt) {
    return <p className="mt-6 rounded-sm border border-line bg-white p-4 text-[14px] text-ink-soft">Tanggal undangan menjadi arsip muncul di sini setelah tanggal acara diisi.</p>;
  }
  const date = formatDateId(archiveAt);
  if (archived) {
    return (
      <section className="mt-6 rounded-sm border border-line bg-white p-4">
        <h2 className="text-[15px] font-medium">Undangan ini menjadi arsip sejak {date}</h2>
        <p className="mt-1 max-w-[60ch] text-[14px] text-ink-soft">Undangan tetap bisa dibuka selamanya di alamat yang sama, lengkap dengan ucapan yang sudah masuk.</p>
      </section>
    );
  }
  return (
    <section className={`mt-6 flex flex-col gap-4 rounded-sm border p-4 sm:flex-row sm:items-center sm:justify-between ${due ? "border-wine/40 bg-blush/60" : "border-line bg-white"}`}>
      <div>
        <h2 className="text-[15px] font-medium">Menjadi arsip pada {date}</h2>
        <p className="mt-1 max-w-[60ch] text-[14px] text-ink-soft">Undangan tetap bisa dibuka selamanya, tetapi perubahan data, RSVP, ucapan baru, dan amplop digital berhenti.</p>
        {due && <p className="mt-1 max-w-[60ch] text-[14px] text-wine">{notified ? "Rekap RSVP dan ucapan sudah dikirim tim kami lewat WhatsApp." : "Rekap RSVP dan ucapan akan dikirim tim kami lewat WhatsApp."}</p>}
      </div>
      <Countdown target={archiveAt.toISOString()} className="flex shrink-0 gap-2" cellClassName="min-w-16 rounded-sm bg-ivory px-2 py-2 text-center font-serif text-2xl leading-none lining-nums" />
    </section>
  );
}
