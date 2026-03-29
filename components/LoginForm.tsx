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
      className="space-y-6 rounded-2xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-slate-800 p-8 shadow-lg transition-all duration-200"
    >
      <div className="space-y-2">
        <label htmlFor="identifier" className="block text-sm font-semibold text-gray-900 dark:text-white">
          Email or Username
        </label>
        <input
          id="identifier"
          name="identifier"
          required
          placeholder="you@example.com"
          className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-slate-700 px-4 py-3 text-sm text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-gray-500 transition-all duration-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 dark:focus:border-blue-400 dark:focus:ring-blue-400/20"
        />
      </div>

      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <label htmlFor="password" className="block text-sm font-semibold text-gray-900 dark:text-white">
            Password
          </label>
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="text-xs text-blue-600 hover:text-blue-700 font-medium transition-colors dark:text-blue-400 dark:hover:text-blue-300"
          >
            {showPassword ? "Hide" : "Show"}
          </button>
        </div>
        <input
          id="password"
          name="password"
          type={showPassword ? "text" : "password"}
          required
          placeholder="••••••••"
          className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-slate-700 px-4 py-3 text-sm text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-gray-500 transition-all duration-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 dark:focus:border-blue-400 dark:focus:ring-blue-400/20"
        />
      </div>

      {error && (
        <div className="rounded-lg bg-red-50 dark:bg-red-950/30 p-4 border border-red-200 dark:border-red-900/50">
          <p className="text-sm text-red-800 dark:text-red-300 font-medium">{error}</p>
        </div>
      )}

      <button
        type="submit"
        disabled={pending}
        className={`${buttonClass("primary", "w-full px-4 py-3 text-base")} ${
          pending ? "opacity-75" : ""
        }`}
      >
        <span className="flex items-center justify-center">
          {pending && (
            <span className="mr-2 w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
          )}
          {pending ? "Signing in..." : "Sign In"}
        </span>
      </button>

      <p className="text-center text-sm text-gray-600 dark:text-gray-400">
        Don{"'"}t have an account?{" "}
        <Link
          href="/register"
          className="font-semibold text-blue-600 hover:text-blue-700 transition-colors dark:text-blue-400 dark:hover:text-blue-300"
        >
          Create one
        </Link>
      </p>
    </form>
  );
}


