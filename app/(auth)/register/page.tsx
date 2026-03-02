import Link from "next/link";
import { redirect } from "next/navigation";

import { RegisterForm } from "@/components/RegisterForm";
import { getAuthSession } from "@/lib/auth";

export default async function RegisterPage() {
  const session = await getAuthSession();

  if (session?.user?.id) {
    redirect("/dashboard");
  }

  return (
    <div className="space-y-4">
      <div className="text-center">
        <h1 className="text-2xl font-semibold text-gray-900 dark:text-gray-100">Create Account</h1>
        <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">Start building consistency with daily deadlines.</p>
      </div>
      <RegisterForm />
      <p className="text-center text-sm text-gray-600 dark:text-gray-400">
        Already registered?{" "}
        <Link href="/login" className="font-medium text-rose-700 underline transition-colors hover:text-rose-800 dark:text-rose-300 dark:hover:text-rose-200">
          Login
        </Link>
      </p>
    </div>
  );
}

