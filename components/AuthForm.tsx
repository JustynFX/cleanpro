"use client";

import { useActionState, useState } from "react";
import { login, signup, type AuthState } from "@/app/login/actions";

const initial: AuthState = {};
const input = "h-12 w-full rounded-lg border border-gray-300 px-3 text-base text-gray-900 focus:border-brand-700";
const button = "h-12 w-full rounded-lg bg-brand-700 font-semibold text-white hover:opacity-90 disabled:opacity-60";

function Feedback({ state }: { state: AuthState }) {
  if (state.error) return <p role="alert" className="rounded-lg bg-red-50 p-3 text-sm text-red-800">{state.error}</p>;
  if (state.message) return <p role="status" className="rounded-lg bg-brand-50 p-3 text-sm text-brand-700">{state.message}</p>;
  return null;
}

export default function AuthForm({ next }: { next: string }) {
  const [mode, setMode] = useState<"login" | "signup">("login");
  const [loginState, loginAction, loginPending] = useActionState(login, initial);
  const [signupState, signupAction, signupPending] = useActionState(signup, initial);

  return (
    <div>
      <div role="tablist" className="mb-6 grid grid-cols-2 rounded-lg bg-gray-100 p-1 text-sm font-semibold">
        {(["login", "signup"] as const).map((m) => (
          <button
            key={m}
            type="button"
            role="tab"
            aria-selected={mode === m}
            onClick={() => setMode(m)}
            className={`h-11 rounded-md ${mode === m ? "bg-white shadow-sm text-brand-700" : "text-gray-600"}`}
          >
            {m === "login" ? "Log in" : "Create account"}
          </button>
        ))}
      </div>

      {mode === "login" ? (
        <form action={loginAction} className="space-y-4">
          <input type="hidden" name="next" value={next} />
          <div>
            <label htmlFor="email" className="mb-1 block text-sm font-medium">Email address</label>
            <input id="email" name="email" type="email" autoComplete="email" required className={input} />
          </div>
          <div>
            <label htmlFor="password" className="mb-1 block text-sm font-medium">Password</label>
            <input id="password" name="password" type="password" autoComplete="current-password" required className={input} />
          </div>
          <Feedback state={loginState} />
          <button type="submit" disabled={loginPending} className={button}>{loginPending ? "Logging in..." : "Log in"}</button>
        </form>
      ) : (
        <form action={signupAction} className="space-y-4">
          <input type="hidden" name="next" value={next} />
          <div>
            <label htmlFor="full_name" className="mb-1 block text-sm font-medium">Full name</label>
            <input id="full_name" name="full_name" type="text" autoComplete="name" required className={input} />
          </div>
          <div>
            <label htmlFor="su_email" className="mb-1 block text-sm font-medium">Email address</label>
            <input id="su_email" name="email" type="email" autoComplete="email" required className={input} />
          </div>
          <div>
            <label htmlFor="su_password" className="mb-1 block text-sm font-medium">Password (at least 8 characters)</label>
            <input id="su_password" name="password" type="password" autoComplete="new-password" minLength={8} required className={input} />
          </div>
          <Feedback state={signupState} />
          <button type="submit" disabled={signupPending} className={button}>{signupPending ? "Creating account..." : "Create customer account"}</button>
        </form>
      )}
    </div>
  );
}
