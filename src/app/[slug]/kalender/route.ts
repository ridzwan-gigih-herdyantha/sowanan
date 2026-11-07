import { icsFile } from "@/lib/calendar";
import { getInvitation, listPublishedSlugs } from "@/lib/invitation/load";
import { checkPass, guestView } from "@/lib/invitation/private";
import { calendarEventOf, toView } from "@/lib/invitation/view";

export async function generateStaticParams() {
  const slugs = await listPublishedSlugs();
  return slugs.map((slug) => ({ slug }));
}

export async function GET(req: Request, ctx: RouteContext<"/[slug]/kalender">) {
  const { slug } = await ctx.params;
  const inv = await getInvitation(slug);
  if (!inv || !inv.published) return new Response("Tidak ditemukan", { status: 404 });

  let view = toView(slug, inv.data);
  // Alamat permintaan hanya dibaca undangan private, jadi kalender undangan publik tetap statis.
  if (inv.private) {
    const id = inv.id ?? "";
    const pass = await checkPass(id, slug, new URL(req.url).searchParams.get("k") ?? "");
    if (!pass.ok) return new Response("Undangan ini khusus tamu terundang", { status: 403 });
    view = await guestView(view, id, pass);
  }

  return new Response(icsFile(calendarEventOf(view), slug), {
    headers: {
      "Content-Type": "text/calendar; charset=utf-8",
      // inline supaya iPhone langsung menawarkan Tambah ke Kalender, bukan menyimpan berkas ke Files.
      "Content-Disposition": `inline; filename="${slug}.ics"`,
    },
  });
}
