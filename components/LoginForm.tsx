"use client";

import Link from "next/link";
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
  const [showPassword, setShowPassword] = useState(false);

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
      className="space-y-5 rounded-2xl border border-gray-200 bg-white p-8 shadow-xl transition-all duration-200 dark:border-[#2a2a2a] dark:bg-[#1a1a1a]"
    >
      <div className="space-y-2">
        <label htmlFor="identifier" className="block text-sm font-semibold text-gray-700 dark:text-gray-300">
          Email or Username
        </label>
        <input
          id="identifier"
          name="identifier"
          required
          placeholder="you@example.com"
          className="w-full rounded-lg border border-gray-300 bg-white/50 px-4 py-3 text-sm text-gray-900 placeholder:text-gray-400 transition-all duration-200 focus:border-rose-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-rose-500/10 dark:border-[#303030] dark:bg-[#0f0f0f]/50 dark:text-gray-100 dark:placeholder:text-gray-600 dark:focus:border-rose-400 dark:focus:bg-[#141414]"
        />
      </div>

      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <label htmlFor="password" className="block text-sm font-semibold text-gray-700 dark:text-gray-300">
            Password
          </label>
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="text-xs text-rose-600 hover:text-rose-700 font-medium transition-colors dark:text-rose-400 dark:hover:text-rose-300"
          >
            {showPassword ? "Hide" : "Show"}
          </button>
        </div>
        <div className="relative">
          <input
            id="password"
            name="password"
            type={showPassword ? "text" : "password"}
            required
            placeholder="••••••••"
            className="w-full rounded-lg border border-gray-300 bg-white/50 px-4 py-3 text-sm text-gray-900 placeholder:text-gray-400 transition-all duration-200 focus:border-rose-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-rose-500/10 dark:border-[#303030] dark:bg-[#0f0f0f]/50 dark:text-gray-100 dark:placeholder:text-gray-600 dark:focus:border-rose-400 dark:focus:bg-[#141414]"
          />
        </div>
      </div>

      {error && (
        <div className="rounded-lg bg-rose-50 p-3 border border-rose-200 dark:bg-rose-950/30 dark:border-rose-900/50">
          <p className="text-sm text-rose-800 dark:text-rose-300 font-medium">{error}</p>
        </div>
      )}

      <button
        type="submit"
        disabled={pending}
        className={`${buttonClass("primary", "w-full px-4 py-3 text-sm font-semibold")} relative overflow-hidden group ${
          pending ? "opacity-75" : ""
        }`}
      >
        <span className="relative flex items-center justify-center">
          {pending && (
            <span className="absolute inset-0 flex items-center justify-center">
              <span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
            </span>
          )}
          <span className={pending ? "invisible" : ""}>
            {pending ? "Logging in..." : "Sign In"}
          </span>
        </span>
      </button>

      <p className="text-center text-sm text-gray-600 dark:text-gray-400">
        Don{"'"}t have an account?{" "}
        <Link
          href="/register"
          className="font-semibold text-rose-600 hover:text-rose-700 transition-colors dark:text-rose-400 dark:hover:text-rose-300"
        >
          Create one
        </Link>
      </p>
    </form>
  );
}


