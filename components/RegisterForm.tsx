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
      className={`${buttonClass("primary", "w-full px-4 py-3 text-sm font-semibold")} relative overflow-hidden ${
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
          {pending ? "Creating account..." : "Create Account"}
        </span>
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
      className="space-y-5 rounded-2xl border border-gray-200 bg-white p-8 shadow-xl transition-all duration-200 dark:border-[#2a2a2a] dark:bg-[#1a1a1a]"
    >
      <div className="space-y-2">
        <label htmlFor="username" className="block text-sm font-semibold text-gray-700 dark:text-gray-300">
          Username
        </label>
        <input
          id="username"
          name="username"
          required
          placeholder="johndoe"
          className="w-full rounded-lg border border-gray-300 bg-white/50 px-4 py-3 text-sm text-gray-900 placeholder:text-gray-400 transition-all duration-200 focus:border-rose-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-rose-500/10 dark:border-[#303030] dark:bg-[#0f0f0f]/50 dark:text-gray-100 dark:placeholder:text-gray-600 dark:focus:border-rose-400 dark:focus:bg-[#141414]"
        />
        {state.errors?.username && (
          <p className="text-xs text-rose-600 dark:text-rose-400 font-medium">
            {state.errors.username}
          </p>
        )}
      </div>

      <div className="space-y-2">
        <label htmlFor="email" className="block text-sm font-semibold text-gray-700 dark:text-gray-300">
          Email
        </label>
        <input
          id="email"
          name="email"
          type="email"
          required
          placeholder="you@example.com"
          className="w-full rounded-lg border border-gray-300 bg-white/50 px-4 py-3 text-sm text-gray-900 placeholder:text-gray-400 transition-all duration-200 focus:border-rose-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-rose-500/10 dark:border-[#303030] dark:bg-[#0f0f0f]/50 dark:text-gray-100 dark:placeholder:text-gray-600 dark:focus:border-rose-400 dark:focus:bg-[#141414]"
        />
        {state.errors?.email && (
          <p className="text-xs text-rose-600 dark:text-rose-400 font-medium">
            {state.errors.email}
          </p>
        )}
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
        <input
          id="password"
          name="password"
          type={showPassword ? "text" : "password"}
          required
          placeholder="••••••••"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full rounded-lg border border-gray-300 bg-white/50 px-4 py-3 text-sm text-gray-900 placeholder:text-gray-400 transition-all duration-200 focus:border-rose-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-rose-500/10 dark:border-[#303030] dark:bg-[#0f0f0f]/50 dark:text-gray-100 dark:placeholder:text-gray-600 dark:focus:border-rose-400 dark:focus:bg-[#141414]"
        />
        <PasswordStrength password={password} />
        {state.errors?.password && (
          <p className="text-xs text-rose-600 dark:text-rose-400 font-medium">
            {state.errors.password}
          </p>
        )}
      </div>

      <div className="space-y-2">
        <label htmlFor="timezone" className="block text-sm font-semibold text-gray-700 dark:text-gray-300">
          Timezone
        </label>
        <select
          id="timezone"
          name="timezone"
          defaultValue={Intl.DateTimeFormat().resolvedOptions().timeZone}
          className="w-full rounded-lg border border-gray-300 bg-white/50 px-4 py-3 text-sm text-gray-900 transition-all duration-200 focus:border-rose-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-rose-500/10 dark:border-[#303030] dark:bg-[#0f0f0f]/50 dark:text-gray-100 dark:focus:border-rose-400 dark:focus:bg-[#141414]"
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
          className={`rounded-lg p-3 border ${
            state.ok
              ? "bg-emerald-50 border-emerald-200 dark:bg-emerald-950/30 dark:border-emerald-900/50"
              : "bg-rose-50 border-rose-200 dark:bg-rose-950/30 dark:border-rose-900/50"
          }`}
        >
          <p
            className={`text-sm font-medium ${
              state.ok
                ? "text-emerald-800 dark:text-emerald-300"
                : "text-rose-800 dark:text-rose-300"
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
          className="font-semibold text-rose-600 hover:text-rose-700 transition-colors dark:text-rose-400 dark:hover:text-rose-300"
        >
          Sign in
        </Link>
      </p>
    </form>
  );
}


