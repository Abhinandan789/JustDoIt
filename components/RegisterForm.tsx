"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useActionState, useEffect } from "react";
import { useFormStatus } from "react-dom";

import { registerAction } from "@/actions/auth-actions";
import { initialActionState } from "@/types/actions";

function RegisterSubmitButton() {
  const { pending } = useFormStatus();

  return (
    <button
      type="submit"
      disabled={pending}
      className="w-full rounded-lg bg-rose-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition-all duration-200 hover:bg-rose-700 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-60"
    >
      {pending ? "Registering..." : "Create account"}
    </button>
  );
}

export function RegisterForm() {
  const router = useRouter();
  const [state, formAction] = useActionState(registerAction, initialActionState);

  useEffect(() => {
    if (state.ok) {
      router.push("/login");
      router.refresh();
    }
  }, [router, state.ok]);

  return (
    <form
      action={formAction}
      className="space-y-4 rounded-xl border border-gray-200 bg-white p-6 shadow-sm transition-all duration-200 dark:border-[#2a2a2a] dark:bg-[#1a1a1a]"
    >
      <div>
        <label htmlFor="username" className="block text-sm font-medium text-gray-700 dark:text-gray-400">
          Username
        </label>
        <input
          id="username"
          name="username"
          required
          className="mt-1 w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-gray-900 transition-colors duration-200 focus:border-rose-500 focus:outline-none dark:border-[#303030] dark:bg-[#141414] dark:text-gray-100 dark:focus:border-rose-400"
        />
        {state.errors?.username ? <p className="mt-1 text-xs text-rose-700 dark:text-rose-400">{state.errors.username}</p> : null}
      </div>

      <div>
        <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-400">
          Email
        </label>
        <input
          id="email"
          name="email"
          type="email"
          required
          className="mt-1 w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-gray-900 transition-colors duration-200 focus:border-rose-500 focus:outline-none dark:border-[#303030] dark:bg-[#141414] dark:text-gray-100 dark:focus:border-rose-400"
        />
        {state.errors?.email ? <p className="mt-1 text-xs text-rose-700 dark:text-rose-400">{state.errors.email}</p> : null}
      </div>

      <div>
        <label htmlFor="password" className="block text-sm font-medium text-gray-700 dark:text-gray-400">
          Password
        </label>
        <input
          id="password"
          name="password"
          type="password"
          required
          className="mt-1 w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-gray-900 transition-colors duration-200 focus:border-rose-500 focus:outline-none dark:border-[#303030] dark:bg-[#141414] dark:text-gray-100 dark:focus:border-rose-400"
        />
        {state.errors?.password ? <p className="mt-1 text-xs text-rose-700 dark:text-rose-400">{state.errors.password}</p> : null}
      </div>

      <div>
        <label htmlFor="timezone" className="block text-sm font-medium text-gray-700 dark:text-gray-400">
          Timezone
        </label>
        <input
          id="timezone"
          name="timezone"
          defaultValue={Intl.DateTimeFormat().resolvedOptions().timeZone}
          className="mt-1 w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-gray-900 transition-colors duration-200 focus:border-rose-500 focus:outline-none dark:border-[#303030] dark:bg-[#141414] dark:text-gray-100 dark:focus:border-rose-400"
        />
      </div>

      {state.message ? (
        <p className={state.ok ? "text-sm text-emerald-700 dark:text-emerald-400" : "text-sm text-rose-700 dark:text-rose-400"}>
          {state.message}
        </p>
      ) : null}

      <RegisterSubmitButton />

      <p className="text-sm text-gray-600 dark:text-gray-400">
        Already have an account?{" "}
        <Link href="/login" className="font-medium text-rose-700 underline transition-colors hover:text-rose-800 dark:text-rose-300 dark:hover:text-rose-200">
          Login
        </Link>
      </p>
    </form>
  );
}


