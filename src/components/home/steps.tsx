import { Container, SectionTitle, reveal, sectionPad } from "@/components/ui";

export function Steps({ sla }: { sla: string }) {
  const steps = [
    { title: "Chat WhatsApp", text: "Sebutkan tanggal acara dan tema yang dipilih. Kami bantu kalau masih bingung." },
    {
      title: "Kirim data",
      text: "Nama, susunan acara, lokasi, dan foto. Ada formulir isian supaya tidak ada yang terlewat.",
    },
    { title: "Cek dan revisi", text: `Dalam ${sla} kalian terima link draf. Kabari bagian mana yang mau diubah.` },
    { title: "Sebar", text: "Link siap dibagikan ke semua tamu lewat WhatsApp, IG, atau di mana saja." },
  ];

  return (
    <section className="border-y border-line bg-blush">
      <Container className={sectionPad}>
        <SectionTitle className="mb-11" {...reveal()}>
          Cara pesan
        </SectionTitle>
        <ol className="grid grid-cols-1 gap-[26px] sm:grid-cols-2 sm:gap-8 lg:grid-cols-4 lg:gap-9">
          {steps.map((s, i) => (
            <li key={s.title} className="flex gap-4 sm:block" {...reveal(i)}>
              <p className="w-11 shrink-0 font-serif text-[38px] leading-none text-wine-soft sm:mb-3.5 sm:w-auto sm:text-[52px]">
                {String(i + 1).padStart(2, "0")}
              </p>
              <div>
                <h3 className="mb-[9px] text-[19px] font-medium">{s.title}</h3>
                <p className="text-[15px] leading-[1.65] text-ink-soft">{s.text}</p>
              </div>
            </li>
          ))}
        </ol>
      </Container>
    </section>
  );
}
