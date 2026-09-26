import { DEFAULT_SETTINGS } from "@/lib/settings";
import { SettingsForm } from "../admin/settings-form";

export default function Preview() {
  return (
    <main className="mx-auto max-w-2xl px-5 py-12">
      <SettingsForm initial={{ ...DEFAULT_SETTINGS, revisionsDesain: null }} />
    </main>
  );
}
