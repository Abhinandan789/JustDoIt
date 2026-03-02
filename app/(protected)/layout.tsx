import { redirect } from "next/navigation";

import { Sidebar } from "@/components/Sidebar";
import { getRequiredUser } from "@/lib/auth";

export default async function ProtectedLayout({ children }: { children: React.ReactNode }) {
  const user = await getRequiredUser();

  if (!user) {
    redirect("/login");
  }

  return (
    <div className="min-h-screen bg-gray-50 transition-colors dark:bg-[#0f0f0f] md:flex">
      <Sidebar username={user.username} profileImage={user.profileImage} />
      <main className="flex-1 p-4 md:p-8">{children}</main>
    </div>
  );
}
