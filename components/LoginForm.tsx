"use client";

import { signIn } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import { FormEvent, useState } from "react";

import { buttonClass } from "@/lib/button-styles";

export function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get("callbackUrl") || "/dashboard";

  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string>("");

  const onSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setPending(true);
    setError("");

    const formData = new FormData(event.currentTarget);
    const identifier = formData.get("identifier")?.toString() ?? "";
    const password = formData.get("password")?.toString() ?? "";

    const result = await signIn("credentials", {
      identifier,
      password,
      redirect: false,
      callbackUrl,
    });

    if (!result || result.error) {
      setError("Invalid credentials");
      setPending(false);
      return;
    }

    router.push(result.url || callbackUrl);
    router.refresh();
  };

  return (
    <form
      onSubmit={onSubmit}
      className="space-y-4 rounded-xl border border-gray-200 bg-white p-6 shadow-sm transition-all duration-200 dark:border-[#2a2a2a] dark:bg-[#1a1a1a]"
    >
      <div>
        <label htmlFor="identifier" className="block text-sm font-medium text-gray-700 dark:text-gray-400">
          Email or Username
        </label>
        <input
          id="identifier"
          name="identifier"
          required
          className="mt-1 w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 transition-colors duration-200 focus:border-rose-500 focus:outline-none dark:border-[#303030] dark:bg-[#141414] dark:text-gray-100 dark:focus:border-rose-400"
        />
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
          className="mt-1 w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 transition-colors duration-200 focus:border-rose-500 focus:outline-none dark:border-[#303030] dark:bg-[#141414] dark:text-gray-100 dark:focus:border-rose-400"
        />
      </div>

      {error ? <p className="text-sm text-rose-700 dark:text-rose-400">{error}</p> : null}

      <button
        type="submit"
        disabled={pending}
        className={buttonClass("primary", "w-full px-4 py-2 text-sm font-semibold")}
      >
        {pending ? "Logging in..." : "Login"}
      </button>
    </form>
  );
}


