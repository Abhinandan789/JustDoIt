import { cn } from "@/utils/format";

export type ButtonVariant = "primary" | "secondary" | "danger";

const baseButtonClass =
  "inline-flex items-center justify-center rounded-lg transition-all duration-200 shadow-sm active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-60";

const variantClass: Record<ButtonVariant, string> = {
  primary: "bg-black text-white hover:bg-gray-800 dark:bg-white dark:text-black dark:hover:bg-gray-200",
  secondary:
    "bg-white border border-gray-300 text-gray-800 hover:bg-gray-100 dark:bg-gray-800 dark:text-gray-100 dark:border-gray-700 dark:hover:bg-gray-700",
  danger: "border border-red-500 text-red-500 hover:bg-red-50 dark:border-red-500 dark:text-red-400 dark:hover:bg-red-500/10",
};

export function buttonClass(variant: ButtonVariant, className?: string) {
  return cn(baseButtonClass, variantClass[variant], className);
}
