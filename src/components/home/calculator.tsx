import { CalculatorForm, type CalcAddon, type CalcPackage, type CalcTheme } from "./calculator-form";
import { Container, SectionSub, SectionTitle, cx, reveal, sectionPad } from "@/components/ui";
import { addonFits, fill, PACKAGE_NAMES, slaText, themeAvailable, visiblePackages, type Settings } from "@/lib/settings";
import { mediaUrl } from "@/lib/storage/media";

// Add-on yang dihitung per satuan, misalnya per 10 foto atau per 100 nama, boleh dipesan lebih dari satu.
const perUnit = (a: Settings["addons"][number]) => a.amount > 0 || /\bper\b/i.test(a.name);

// Semua aturan paket dihitung di server, jadi komponen klien hanya menerima data siap pakai.
export function Calculator({ settings: s, vars }: { settings: Settings; vars: Record<string, string> }) {
  const pkgs = visiblePackages(s);
  const packages: CalcPackage[] = pkgs.map((id) => ({ id, name: PACKAGE_NAMES[id], price: s.packages[id].price, sla: slaText(s.packages[id]), badge: s.packages[id].badge }));
  const themes: CalcTheme[] = s.themes
    .filter((t) => t.on)
    .map((t) => ({ id: t.id, name: t.name, style: t.style, image: t.image ? mediaUrl(t.image) : "", packages: pkgs.filter((p) => themeAvailable(s, t.tier, p)) }))
    .filter((t) => t.packages.length > 0);
  const addons: CalcAddon[] = s.addons
    .filter((a) => a.on)
    .map((a) => ({ id: a.id, name: a.name, price: a.price, perUnit: perUnit(a), packages: pkgs.filter((p) => addonFits(s, a, p)) }))
    .filter((a) => a.packages.length > 0);
  if (!packages.length) return null;

  const { kalkulator } = s.sections;
  return (
    <section id="hitung" className="relative scroll-mt-20 bg-blush">
      <Container className={cx(sectionPad)}>
        <SectionTitle className="text-ink" {...reveal()}>
          {kalkulator.title}
        </SectionTitle>
        {kalkulator.sub && (
          <SectionSub className="max-w-[60ch]" {...reveal()}>
            {fill(kalkulator.sub, vars)}
          </SectionSub>
        )}
        <div {...reveal()}>
          <CalculatorForm packages={packages} themes={themes} addons={addons} dp={s.payment.dp} wa={s.contact.wa} />
        </div>
      </Container>
    </section>
  );
}
