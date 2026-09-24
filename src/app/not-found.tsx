import Link from "next/link";

export default function NotFound() {
  return (
    <main className="mx-auto flex min-h-[70vh] max-w-xl flex-col items-center justify-center px-5 text-center font-[system-ui,sans-serif]">
      <h1 className="font-[Georgia,serif] text-5xl">Halaman tidak ditemukan</h1>
      <p className="mt-4 text-ink-soft">Mungkin link-nya salah ketik, atau undangannya sudah tidak aktif.</p>
      <Link href="/" className="mt-8 inline-block bg-wine px-8 py-4 text-white no-underline hover:bg-wine-dark">
        Kembali ke beranda
      </Link>
    </main>
  );
}
