import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Pengaturan",
  robots: { index: false, follow: false },
};

// Placeholder: login + form pengaturan (PRD 2.8) dibangun di langkah berikutnya.
export default function AdminPage() {
  return (
    <main className="mx-auto max-w-xl px-5 py-24">
      <h1 className="font-serif text-4xl">Pengaturan</h1>
    </main>
  );
}
