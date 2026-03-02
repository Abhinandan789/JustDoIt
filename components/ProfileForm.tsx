"use client";

import { useActionState } from "react";
import { useFormStatus } from "react-dom";

import { updateProfileAction } from "@/actions/profile-actions";
import { initialActionState } from "@/types/actions";

function SaveButton() {
  const { pending } = useFormStatus();

  return (
    <button
      type="submit"
      disabled={pending}
      className="rounded-lg bg-rose-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition-all duration-200 hover:bg-rose-700 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-60"
    >
      {pending ? "Saving..." : "Save profile"}
    </button>
  );
}

type ProfileFormProps = {
  timezone: string;
  profileImage: string | null;
};

export function ProfileForm({ timezone, profileImage }: ProfileFormProps) {
  const [state, formAction] = useActionState(updateProfileAction, initialActionState);

  return (
    <form
      action={formAction}
      className="space-y-4 rounded-xl border border-gray-200 bg-white p-6 shadow-sm transition-all duration-200 dark:border-[#2a2a2a] dark:bg-[#1a1a1a]"
    >
      <div>
        <label htmlFor="timezone" className="block text-sm font-medium text-gray-700 dark:text-gray-400">
          Timezone
        </label>
        <input
          id="timezone"
          name="timezone"
          defaultValue={timezone}
          className="mt-1 w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 transition-colors duration-200 focus:border-rose-500 focus:outline-none dark:border-[#303030] dark:bg-[#141414] dark:text-gray-100 dark:focus:border-rose-400"
        />
      </div>

      <div>
        <label htmlFor="profileImage" className="block text-sm font-medium text-gray-700 dark:text-gray-400">
          Profile image URL
        </label>
        <input
          id="profileImage"
          name="profileImage"
          defaultValue={profileImage ?? ""}
          placeholder="https://..."
          className="mt-1 w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 transition-colors duration-200 focus:border-rose-500 focus:outline-none dark:border-[#303030] dark:bg-[#141414] dark:text-gray-100 dark:focus:border-rose-400"
        />
      </div>

      {state.message ? (
        <p className={state.ok ? "text-sm text-emerald-700 dark:text-emerald-400" : "text-sm text-rose-700 dark:text-rose-400"}>
          {state.message}
        </p>
      ) : null}

      <SaveButton />
    </form>
  );
}


