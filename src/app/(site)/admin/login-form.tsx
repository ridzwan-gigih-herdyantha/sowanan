"use client";

import { useActionState } from "react";
import { LogoMark } from "@/components/logo";
import { login, type FormState } from "./actions";

const input =
  "mt-2 block w-full rounded-sm border border-line bg-white px-4 py-3 text-[15px] outline-none transition-colors placeholder:text-ink-mute focus:border-wine focus:ring-2 focus:ring-wine/10";

export function LoginForm() {
  const [state, action, pending] = useActionState<FormState, FormData>(login, { ok: false, message: "" });

  return (
    <div className="fixed inset-0 z-[100] grid min-h-dvh place-items-center overflow-y-auto bg-ivory px-5 py-10 sm:px-8">
      <section className="w-full max-w-[440px] overflow-hidden rounded-sm border border-line bg-white shadow-[0_18px_60px_-42px_rgba(42,35,32,.35)]">
        <div className="h-1 bg-wine" />
        <div className="px-6 py-8 sm:px-10 sm:py-10">
          <div className="mb-9 flex items-center gap-3 text-wine">
            <LogoMark className="h-8 w-auto" />
            <span className="text-[12px] tracking-[3px]">SOWANAN</span>
          </div>
          <p className="text-[11px] font-medium tracking-[2px] text-ink-mute">RUANG PENGELOLA</p>
          <h1 className="mt-1 font-serif text-[38px] leading-tight font-medium text-ink sm:text-[42px]">Masuk admin</h1>
          <p className="mt-2 mb-8 text-[14px] leading-relaxed text-ink-soft">Gunakan akun admin Sowanan untuk melanjutkan.</p>
          <form action={action} className="space-y-5">
            <label className="block text-[13px] font-medium text-ink-soft">
              Email
              <input name="email" type="email" required autoComplete="username" className={input} />
            </label>
            <label className="block text-[13px] font-medium text-ink-soft">
              Password
              <input name="password" type="password" required autoComplete="current-password" className={input} />
            </label>
            {state.message && (
              <p role="alert" className="rounded-sm border border-[#efd4d8] bg-[#fbf0f1] px-4 py-3 text-[14px] text-wine-dark">
                {state.message}
              </p>
            )}
            <button
              type="submit"
              disabled={pending}
              className="mt-1 w-full rounded-sm bg-wine px-6 py-3.5 text-[14px] font-medium text-white transition-colors duration-150 hover:bg-wine-dark disabled:cursor-wait disabled:opacity-60"
            >
              {pending ? "Memeriksa..." : "Masuk"}
            </button>
          </form>
        </div>
      </section>
    </div>
  );
}
