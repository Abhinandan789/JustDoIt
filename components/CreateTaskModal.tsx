import Link from "next/link";

import { buttonClass } from "@/lib/button-styles";

export function CreateTaskModal() {
  return (
    <div className="rounded-xl border border-dashed border-gray-300 bg-gray-50 p-4 text-center shadow-sm transition-all duration-200 hover:shadow-md dark:border-[#303030] dark:bg-[#1a1a1a]">
      <p className="text-sm text-gray-600 dark:text-gray-400">Need to add a task quickly?</p>
      <Link
        href="/tasks/new"
        className={buttonClass("primary", "mt-2 px-3 py-2 text-sm font-semibold")}
      >
        Create Task
      </Link>
    </div>
  );
}


