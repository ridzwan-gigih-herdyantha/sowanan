// Tampil tanpa kode atau dengan kode salah. Tidak memuat apa pun dari undangan, termasuk nama mempelai.
export function PrivateNotice({ limited }: { limited: boolean }) {
  return (
    <main className="mx-auto flex min-h-dvh max-w-xl flex-col items-center justify-center px-5 text-center font-[system-ui,sans-serif]">
      <h1 className="font-[Georgia,serif] text-4xl leading-tight sm:text-5xl">Undangan ini khusus tamu terundang</h1>
      <p className="mt-4 text-ink-soft">
        {limited ? "Terlalu banyak percobaan dengan kode yang salah. Tunggu beberapa menit, lalu buka lagi link yang dikirimkan kepadamu." : "Silakan buka lewat link pribadi yang dikirimkan kepadamu."}
      </p>
    </main>
  );
}
