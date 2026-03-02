export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <main className="flex min-h-screen items-center justify-center bg-gray-50 px-4 py-10 transition-colors dark:bg-[#0f0f0f]">
      <div className="w-full max-w-md">{children}</div>
    </main>
  );
}
