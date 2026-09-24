import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Ketentuan Layanan",
  description: "Syarat layanan, kebijakan revisi, masa aktif, dan kebijakan data tamu Sowanan.",
  alternates: { canonical: "/ketentuan" },
};

export default function KetentuanPage() {
  return (
    <main className="mx-auto max-w-[70ch] px-5 py-24">
      <h1 className="font-serif text-5xl">Ketentuan Layanan</h1>
    </main>
  );
}
