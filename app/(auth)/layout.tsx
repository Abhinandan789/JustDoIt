"use client";

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <main className="relative min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 via-blue-50 to-white dark:from-slate-950 dark:via-slate-900 dark:to-slate-900 px-4 py-12">
      {/* Decorative blur elements */}
      <div className="absolute top-20 right-0 w-96 h-96 bg-blue-200 rounded-full mix-blend-multiply filter blur-3xl opacity-20 dark:opacity-10 animate-blob pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-teal-200 rounded-full mix-blend-multiply filter blur-3xl opacity-20 dark:opacity-10 animate-blob animation-delay-2000 pointer-events-none" />

      {/* Content */}
      <div className="relative z-10 w-full max-w-md">
        {children}
      </div>
    </main>
  );
}
