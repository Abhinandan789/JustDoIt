import { redirect } from "next/navigation";

import { getAuthSession } from "@/lib/auth";
import { LandingNavbar } from "@/components/LandingNavbar";
import { LandingHero } from "@/components/LandingHero";
import { FeaturesSection } from "@/components/FeaturesSection";
import { TestimonialsSection } from "@/components/TestimonialsSection";
import { CTASection } from "@/components/CTASection";

export default async function HomePage() {
  const session = await getAuthSession();

  if (session?.user?.id) {
    redirect("/dashboard");
  }

  return (
    <div className="min-h-screen bg-white dark:bg-slate-900">
      <LandingNavbar />
      <LandingHero />
      <FeaturesSection />
      <TestimonialsSection />
      <CTASection />
    </div>
  );
}
