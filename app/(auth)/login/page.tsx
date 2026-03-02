import Link from "next/link";
import { redirect } from "next/navigation";

import { LoginForm } from "@/components/LoginForm";
import { getAuthSession } from "@/lib/auth";

export default async function LoginPage() {
  const session = await getAuthSession();

  if (session?.user?.id) {
    redirect("/dashboard");
  }

  return (
    <div className="space-y-4">
      <div className="text-center">
        <h1 className="text-2xl font-semibold text-gray-900 dark:text-gray-100">Login</h1>
        <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">Continue tracking your discipline streak.</p>
      </div>
      <LoginForm />
      <p className="text-center text-sm text-gray-600 dark:text-gray-400">
        Need an account?{" "}
        <Link href="/register" className="font-medium text-rose-700 underline transition-colors hover:text-rose-800 dark:text-rose-300 dark:hover:text-rose-200">
          Register
        </Link>
      </p>
    </div>
  );
}

