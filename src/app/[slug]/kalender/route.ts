import { icsFile } from "@/lib/calendar";
import { THEMES } from "@/themes";

export function generateStaticParams() {
  return Object.keys(THEMES).map((slug) => ({ slug }));
}

export async function GET(_req: Request, ctx: RouteContext<"/[slug]/kalender">) {
  const { slug } = await ctx.params;
  const theme = THEMES[slug];
  if (!theme) return new Response("Tidak ditemukan", { status: 404 });

  return new Response(icsFile(theme.calendar, slug), {
    headers: {
      "Content-Type": "text/calendar; charset=utf-8",
      "Content-Disposition": `attachment; filename="${slug}.ics"`,
    },
  });
}
