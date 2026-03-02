import type { Metadata } from "next";
import { ThemeScript } from "@/components/ThemeScript";
import "./globals.css";

export const metadata: Metadata = {
  title: "JustDoIt - Discipline Task Tracker",
  description: "Track tasks, missed deadlines, streaks, focus sessions, and productivity analytics.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <ThemeScript />
      </head>
      <body className="bg-gray-50 text-gray-900 antialiased transition-colors dark:bg-[#0f0f0f] dark:text-gray-100">
        {children}
      </body>
    </html>
  );
}

