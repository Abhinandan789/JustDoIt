"use client";

import { TaskPriority } from "@prisma/client";
import { useActionState, useEffect } from "react";
import { useFormStatus } from "react-dom";

import { initialActionState, type ActionState } from "@/types/actions";

type TaskFormProps = {
  action: (prevState: ActionState, formData: FormData) => Promise<ActionState>;
  submitLabel: string;
  onSuccess?: () => void;
  defaultValues?: {
    id?: string;
    title?: string;
    description?: string | null;
    priority?: TaskPriority;
    eodDeadline?: string;
  };
};

function SubmitButton({ label }: { label: string }) {
  const { pending } = useFormStatus();

  return (
    <button
      type="submit"
      disabled={pending}
      className="rounded-lg bg-rose-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition-all duration-200 hover:bg-rose-700 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-60"
    >
      {pending ? "Saving..." : label}
    </button>
  );
}

export function TaskForm({ action, submitLabel, onSuccess, defaultValues }: TaskFormProps) {
  const [state, formAction] = useActionState(action, initialActionState);

  useEffect(() => {
    if (!state.ok || !onSuccess) {
      return;
    }

    onSuccess();
  }, [onSuccess, state.ok]);

  return (
    <form
      action={formAction}
      className="space-y-4 rounded-xl border border-gray-200 bg-white p-6 shadow-sm transition-all duration-200 dark:border-[#2a2a2a] dark:bg-[#1a1a1a]"
    >
      {defaultValues?.id ? <input type="hidden" name="id" value={defaultValues.id} /> : null}

      <div>
        <label htmlFor="title" className="block text-sm font-medium text-gray-700 dark:text-gray-400">
          Title
        </label>
        <input
          id="title"
          name="title"
          defaultValue={defaultValues?.title}
          className="mt-1 w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 transition-colors duration-200 focus:border-rose-500 focus:outline-none dark:border-[#303030] dark:bg-[#141414] dark:text-gray-100 dark:focus:border-rose-400"
        />
        {state.errors?.title ? <p className="mt-1 text-xs text-rose-600 dark:text-rose-400">{state.errors.title}</p> : null}
      </div>

      <div>
        <label htmlFor="description" className="block text-sm font-medium text-gray-700 dark:text-gray-400">
          Description
        </label>
        <textarea
          id="description"
          name="description"
          defaultValue={defaultValues?.description ?? ""}
          rows={4}
          className="mt-1 w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 transition-colors duration-200 focus:border-rose-500 focus:outline-none dark:border-[#303030] dark:bg-[#141414] dark:text-gray-100 dark:focus:border-rose-400"
        />
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label htmlFor="priority" className="block text-sm font-medium text-gray-700 dark:text-gray-400">
            Priority
          </label>
          <select
            id="priority"
            name="priority"
            defaultValue={defaultValues?.priority ?? TaskPriority.MEDIUM}
            className="mt-1 w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 transition-colors duration-200 focus:border-rose-500 focus:outline-none dark:border-[#303030] dark:bg-[#141414] dark:text-gray-100 dark:focus:border-rose-400"
          >
            {Object.values(TaskPriority).map((priority) => (
              <option key={priority} value={priority}>
                {priority}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label htmlFor="eodDeadline" className="block text-sm font-medium text-gray-700 dark:text-gray-400">
            End-of-Day Deadline
          </label>
          <input
            id="eodDeadline"
            name="eodDeadline"
            type="datetime-local"
            defaultValue={defaultValues?.eodDeadline}
            className="mt-1 w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 transition-colors duration-200 focus:border-rose-500 focus:outline-none dark:border-[#303030] dark:bg-[#141414] dark:text-gray-100 dark:focus:border-rose-400"
          />
          {state.errors?.eodDeadline ? (
            <p className="mt-1 text-xs text-rose-600 dark:text-rose-400">{state.errors.eodDeadline}</p>
          ) : null}
        </div>
      </div>

      {state.message ? (
        <p className={state.ok ? "text-sm text-emerald-700 dark:text-emerald-400" : "text-sm text-rose-700 dark:text-rose-400"}>
          {state.message}
        </p>
      ) : null}

      <SubmitButton label={submitLabel} />
    </form>
  );
}


