import { icsFile } from "@/lib/calendar";
import { getInvitation, listPublishedSlugs } from "@/lib/invitation/load";
import { calendarEventOf, toView } from "@/lib/invitation/view";

export async function generateStaticParams() {
  const slugs = await listPublishedSlugs();
  return slugs.map((slug) => ({ slug }));
}

export async function GET(_req: Request, ctx: RouteContext<"/[slug]/kalender">) {
  const { slug } = await ctx.params;
  const inv = await getInvitation(slug);
  if (!inv || !inv.published) return new Response("Tidak ditemukan", { status: 404 });

  return new Response(icsFile(calendarEventOf(toView(slug, inv.data)), slug), {
    headers: {
      "Content-Type": "text/calendar; charset=utf-8",
      "Content-Disposition": `attachment; filename="${slug}.ics"`,
    },
  });
}
