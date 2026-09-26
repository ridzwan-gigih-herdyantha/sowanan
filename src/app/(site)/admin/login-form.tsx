"use client";

import { useActionState } from "react";
import { login, type FormState } from "./actions";

const input =
  "mt-2 block w-full rounded-sm border border-line bg-white px-4 py-3 text-base outline-none focus:border-wine";

export function LoginForm() {
  const [state, action, pending] = useActionState<FormState, FormData>(login, { ok: false, message: "" });

  return (
    <form action={action} className="max-w-sm space-y-5">
      <label className="block text-[14px] font-medium">
        Email
        <input name="email" type="email" required autoComplete="username" className={input} />
      </label>
      <label className="block text-[14px] font-medium">
        Password
        <input name="password" type="password" required autoComplete="current-password" className={input} />
      </label>
      {state.message && (
        <p role="alert" className="rounded-sm bg-[#f8e3e5] px-4 py-3 text-[14px] text-wine-dark">
          {state.message}
        </p>
      )}
      <button
        type="submit"
        disabled={pending}
        className="w-full rounded-sm bg-wine px-6 py-3.5 text-[15px] text-white transition-colors duration-150 hover:bg-wine-dark disabled:opacity-60"
      >
        {pending ? "Memeriksa..." : "Masuk"}
      </button>
    </form>
  );
}
