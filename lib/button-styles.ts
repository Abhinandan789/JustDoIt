import { cn } from "@/utils/format";

export type ButtonVariant = "primary" | "secondary" | "danger" | "outline";

const baseButtonClass =
  "inline-flex items-center justify-center rounded-lg transition-all duration-200 shadow-md active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-60 font-semibold";

const variantClass: Record<ButtonVariant, string> = {
  primary: "bg-black text-white hover:bg-gray-900 active:bg-black shadow-lg hover:shadow-xl dark:bg-white dark:text-black dark:hover:bg-gray-100 dark:active:bg-white",
  secondary:
    "bg-white border-2 border-gray-300 text-gray-900 hover:bg-gray-50 hover:border-gray-400 dark:bg-gray-800 dark:text-white dark:border-gray-600 dark:hover:bg-gray-700 dark:hover:border-gray-500",
  danger: "bg-red-600 text-white hover:bg-red-700 dark:bg-red-500 dark:hover:bg-red-600",
  outline: "border-2 border-black text-black hover:bg-gray-100 dark:border-white dark:text-white dark:hover:bg-gray-800/50",
};

export function buttonClass(variant: ButtonVariant, className?: string) {
  return cn(baseButtonClass, variantClass[variant], className);
}
