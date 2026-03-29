"use client";

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <main className="relative min-h-screen flex items-center justify-center">
      {/* Animated gradient background */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-rose-300 to-rose-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 dark:opacity-10 animate-blob" />
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-br from-rose-400 to-rose-600 rounded-full mix-blend-multiply filter blur-3xl opacity-20 dark:opacity-10" style={{ animation: "blob 7s infinite 2s" }} />
        <div className="absolute top-1/2 left-1/2 w-80 h-80 bg-gradient-to-br from-rose-300 to-rose-400 rounded-full mix-blend-multiply filter blur-3xl opacity-20 dark:opacity-10" style={{ animation: "blob 7s infinite 4s" }} />
      </div>

      {/* Content */}
      <div className="relative px-4 py-12 w-full">
        <div className="mx-auto w-full max-w-md">
          {children}
        </div>
      </div>
    </main>
  );
}
