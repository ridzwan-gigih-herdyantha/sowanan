"use client";

import { useActionState } from "react";
import { coupleLogin, type LoginState } from "../actions";

const input = "mt-2 block w-full rounded-sm border border-line bg-white px-4 py-3 text-base outline-none focus:border-wine";

export function CoupleLoginForm() {
  const [state, action, pending] = useActionState<LoginState, FormData>(coupleLogin, { message: "" });

  return (
    <form action={action} className="space-y-5">
      <label className="block text-[14px] font-medium">
        Username
        <input
          name="username"
          required
          defaultValue={state.username}
          autoComplete="username"
          autoCapitalize="none"
          autoCorrect="off"
          spellCheck={false}
          placeholder="contoh: andi-rina"
          className={input}
        />
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
