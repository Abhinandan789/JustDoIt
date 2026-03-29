"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useActionState, useEffect, useState } from "react";
import { useFormStatus } from "react-dom";

import { buttonClass } from "@/lib/button-styles";
import { registerAction } from "@/actions/auth-actions";
import { initialActionState } from "@/types/actions";

const TIMEZONES = [
  "UTC",
  "America/New_York",
  "America/Chicago",
  "America/Denver",
  "America/Los_Angeles",
  "Europe/London",
  "Europe/Paris",
  "Europe/Berlin",
  "Asia/Dubai",
  "Asia/Kolkata",
  "Asia/Bangkok",
  "Asia/Singapore",
  "Asia/Tokyo",
  "Australia/Sydney",
  "Pacific/Auckland",
];

function PasswordStrength({ password }: { password: string }) {
  if (!password) return null;

  let strength = 0;
  if (password.length >= 8) strength++;
  if (password.length >= 12) strength++;
  if (/[a-z]/.test(password) && /[A-Z]/.test(password)) strength++;
  if (/\d/.test(password)) strength++;
  if (/[!@#$%^&*]/.test(password)) strength++;

  const strengthLevel = strength <= 2 ? "Weak" : strength === 3 ? "Fair" : strength === 4 ? "Good" : "Strong";
  const strengthColor = strength <= 2 ? "bg-red-500" : strength === 3 ? "bg-yellow-500" : strength === 4 ? "bg-blue-500" : "bg-emerald-500";

  return (
    <div className="flex items-center gap-2 mt-2">
      <div className="flex gap-1 flex-1">
        {[...Array(5)].map((_, i) => (
          <div key={i} className={`h-1 flex-1 rounded-full transition-colors ${i < strength ? strengthColor : "bg-gray-200 dark:bg-gray-700"}`} />
        ))}
      </div>
      <span className={`text-xs font-medium ${
        strength <= 2
          ? "text-red-600 dark:text-red-400"
          : strength === 3
          ? "text-yellow-600 dark:text-yellow-400"
          : strength === 4
          ? "text-blue-600 dark:text-blue-400"
          : "text-emerald-600 dark:text-emerald-400"
      }`}>
        {strengthLevel}
      </span>
    </div>
  );
}

function RegisterSubmitButton() {
  const { pending } = useFormStatus();

  return (
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
        {pending ? "Creating account..." : "Create Account"}
      </span>
    </button>
  );
}

export function RegisterForm() {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
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
      className="space-y-6 rounded-2xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-slate-800 p-8 shadow-lg transition-all duration-200"
    >
      <div className="space-y-2">
        <label htmlFor="username" className="block text-sm font-semibold text-gray-900 dark:text-white">
          Username
        </label>
        <input
          id="username"
          name="username"
          required
          placeholder="johndoe"
          className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-slate-700 px-4 py-3 text-sm text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-gray-500 transition-all duration-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 dark:focus:border-blue-400 dark:focus:ring-blue-400/20"
        />
        {state.errors?.username && (
          <p className="text-xs text-red-600 dark:text-red-400 font-medium">
            {state.errors.username}
          </p>
        )}
      </div>

      <div className="space-y-2">
        <label htmlFor="email" className="block text-sm font-semibold text-gray-900 dark:text-white">
          Email
        </label>
        <input
          id="email"
          name="email"
          type="email"
          required
          placeholder="you@example.com"
          className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-slate-700 px-4 py-3 text-sm text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-gray-500 transition-all duration-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 dark:focus:border-blue-400 dark:focus:ring-blue-400/20"
        />
        {state.errors?.email && (
          <p className="text-xs text-red-600 dark:text-red-400 font-medium">
            {state.errors.email}
          </p>
        )}
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
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-slate-700 px-4 py-3 text-sm text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-gray-500 transition-all duration-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 dark:focus:border-blue-400 dark:focus:ring-blue-400/20"
        />
        <PasswordStrength password={password} />
        {state.errors?.password && (
          <p className="text-xs text-red-600 dark:text-red-400 font-medium">
            {state.errors.password}
          </p>
        )}
      </div>

      <div className="space-y-2">
        <label htmlFor="timezone" className="block text-sm font-semibold text-gray-900 dark:text-white">
          Timezone
        </label>
        <select
          id="timezone"
          name="timezone"
          defaultValue={Intl.DateTimeFormat().resolvedOptions().timeZone}
          className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-slate-700 px-4 py-3 text-sm text-gray-900 dark:text-white transition-all duration-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 dark:focus:border-blue-400 dark:focus:ring-blue-400/20"
        >
          {TIMEZONES.map((tz) => (
            <option key={tz} value={tz}>
              {tz}
            </option>
          ))}
        </select>
      </div>

      {state.message && (
        <div
          className={`rounded-lg p-4 border ${
            state.ok
              ? "bg-emerald-50 border-emerald-200 dark:bg-emerald-950/30 dark:border-emerald-900/50"
              : "bg-red-50 border-red-200 dark:bg-red-950/30 dark:border-red-900/50"
          }`}
        >
          <p
            className={`text-sm font-medium ${
              state.ok
                ? "text-emerald-800 dark:text-emerald-300"
                : "text-red-800 dark:text-red-300"
            }`}
          >
            {state.message}
          </p>
        </div>
      )}

      <RegisterSubmitButton />

      <p className="text-center text-sm text-gray-600 dark:text-gray-400">
        Already have an account?{" "}
        <Link
          href="/login"
          className="font-semibold text-blue-600 hover:text-blue-700 transition-colors dark:text-blue-400 dark:hover:text-blue-300"
        >
          Sign in
        </Link>
      </p>
    </form>
  );
}


