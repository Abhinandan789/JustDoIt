"use client";

import { useSyncExternalStore } from "react";

type Theme = "light" | "dark";

const THEME_EVENT = "theme-change";

function getServerTheme(): Theme {
  return "light";
}

function getClientTheme(): Theme {
  if (typeof document === "undefined") {
    return "light";
  }

  const root = document.documentElement;
  const fromDataAttr = root.getAttribute("data-theme");

  if (fromDataAttr === "light" || fromDataAttr === "dark") {
    return fromDataAttr;
  }

  return root.classList.contains("dark") ? "dark" : "light";
}

function subscribe(onStoreChange: () => void) {
  if (typeof window === "undefined") {
    return () => {};
  }

  const callback = () => onStoreChange();
  window.addEventListener(THEME_EVENT, callback);
  window.addEventListener("storage", callback);

  return () => {
    window.removeEventListener(THEME_EVENT, callback);
    window.removeEventListener("storage", callback);
  };
}

function applyTheme(theme: Theme) {
  const root = document.documentElement;
  root.classList.toggle("dark", theme === "dark");
  root.setAttribute("data-theme", theme);
  window.localStorage.setItem("theme", theme);
  window.dispatchEvent(new Event(THEME_EVENT));
}

export function ThemeToggle() {
  const theme = useSyncExternalStore(subscribe, getClientTheme, getServerTheme);
  const nextTheme = theme === "dark" ? "light" : "dark";
  const label = theme === "dark" ? "Light" : "Dark";
  const icon = theme === "dark" ? "\u{1F31E}" : "\u{1F319}";

  return (
    <button
      type="button"
      onClick={() => applyTheme(nextTheme)}
      aria-label="Toggle theme"
      className="inline-flex items-center gap-2 rounded-full border border-gray-300 bg-white px-3 py-1.5 text-xs font-medium text-gray-700 shadow-sm transition-all duration-200 hover:bg-gray-100 active:scale-[0.98] dark:border-[#303030] dark:bg-[#1a1a1a] dark:text-gray-100 dark:hover:bg-[#202020]"
    >
      <span className="inline-flex h-5 w-5 items-center justify-center rounded-full bg-gray-100 text-[11px] dark:bg-[#202020]" aria-hidden>
        {icon}
      </span>
      <span>{label}</span>
    </button>
  );
}

