import Link from "next/link";
import { redirect } from "next/navigation";

import { AuthHeader } from "@/components/AuthHeader";
import { LoginForm } from "@/components/LoginForm";
import { getAuthSession } from "@/lib/auth";

export default async function LoginPage() {
  const session = await getAuthSession();

  if (session?.user?.id) {
    redirect("/dashboard");
  }

  return (
    <div className="space-y-1 animate-in fade-in duration-500">
      <AuthHeader />
      <LoginForm />
    </div>
  );
}

