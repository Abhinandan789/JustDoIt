"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut } from "next-auth/react";

import { ThemeToggle } from "@/components/ThemeToggle";
import { cn } from "@/utils/format";

const links = [
  { href: "/dashboard", label: "Dashboard" },
  { href: "/tasks", label: "Tasks" },
  { href: "/analytics", label: "Analytics" },
  { href: "/profile", label: "Profile" },
];

type SidebarProps = {
  username: string;
  profileImage?: string | null;
};

export function Sidebar({ username, profileImage }: SidebarProps) {
  const pathname = usePathname();
  const fallbackInitial = username.trim().charAt(0).toUpperCase() || "U";

  return (
    <aside className="w-full border-b border-gray-200 bg-white p-4 transition-all duration-200 dark:border-[#262626] dark:bg-[#141414] md:h-screen md:w-64 md:border-b-0 md:border-r">
      <div className="mb-6 flex items-start justify-between">
        <div className="space-y-2">
          <p className="text-xs uppercase tracking-widest text-gray-500 dark:text-gray-500">JustDoIt</p>
          <div className="flex items-center gap-2">
            {profileImage ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={profileImage}
                alt={`${username} profile`}
                className="h-8 w-8 rounded-full border border-gray-300 object-cover dark:border-[#303030]"
              />
            ) : (
              <div className="flex h-8 w-8 items-center justify-center rounded-full border border-gray-300 bg-gray-100 text-xs font-semibold text-gray-700 dark:border-[#303030] dark:bg-[#202020] dark:text-gray-100">
                {fallbackInitial}
              </div>
            )}
            <p className="text-lg font-semibold text-gray-900 dark:text-gray-100">{username}</p>
          </div>
        </div>
        <ThemeToggle />
      </div>

      <nav className="flex flex-row gap-2 overflow-x-auto md:flex-col md:gap-1">
        {links.map((link) => (
          <Link
            key={link.href}
            href={link.href}
              className={cn(
                "rounded-xl px-3 py-2 text-sm font-medium transition-all duration-200",
                pathname.startsWith(link.href)
                  ? "bg-rose-600 text-white shadow-sm hover:bg-rose-700"
                  : "text-gray-600 hover:bg-gray-100 hover:text-gray-900 dark:text-gray-400 dark:hover:bg-[#202020] dark:hover:text-gray-100",
              )}
            >
              {link.label}
            </Link>
        ))}
      </nav>

      <button
        type="button"
        onClick={() => signOut({ callbackUrl: "/login" })}
        className="mt-6 w-full rounded-xl border border-gray-300 px-3 py-2 text-sm font-medium text-gray-700 shadow-sm transition-all duration-200 hover:bg-gray-100 active:scale-[0.98] dark:border-[#303030] dark:text-gray-400 dark:hover:bg-[#202020] dark:hover:text-gray-100"
      >
        Logout
      </button>
    </aside>
  );
}

