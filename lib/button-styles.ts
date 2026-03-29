import { cn } from "@/utils/format";

export type ButtonVariant = "primary" | "secondary" | "danger" | "outline";

const baseButtonClass =
  "inline-flex items-center justify-center rounded-lg transition-all duration-200 shadow-md active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-60 font-semibold";

const variantClass: Record<ButtonVariant, string> = {
  primary: "bg-gradient-to-r from-blue-600 to-blue-700 text-white hover:from-blue-700 hover:to-blue-800 hover:shadow-lg dark:from-blue-500 dark:to-blue-600 dark:hover:from-blue-600 dark:hover:to-blue-700",
  secondary:
    "bg-white border-2 border-gray-200 text-gray-700 hover:bg-gray-50 hover:border-gray-300 dark:bg-gray-800 dark:text-gray-100 dark:border-gray-600 dark:hover:bg-gray-700 dark:hover:border-gray-500",
  danger: "bg-red-600 text-white hover:bg-red-700 dark:bg-red-500 dark:hover:bg-red-600",
  outline: "border-2 border-blue-600 text-blue-600 hover:bg-blue-50 dark:border-blue-400 dark:text-blue-400 dark:hover:bg-blue-950/30",
};

export function buttonClass(variant: ButtonVariant, className?: string) {
  return cn(baseButtonClass, variantClass[variant], className);
}
