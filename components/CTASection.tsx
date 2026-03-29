import Link from "next/link";
import { ArrowRight } from "lucide-react";

export function CTASection() {
  return (
    <section className="py-20 px-4 sm:px-6 lg:px-8 bg-white dark:bg-slate-900">
      <div className="max-w-4xl mx-auto">
        <div className="relative rounded-3xl overflow-hidden bg-gradient-to-r from-blue-600 via-teal-600 to-blue-700 p-12 md:p-20 shadow-2xl">
          {/* Decorative elements */}
          <div className="absolute top-0 right-0 w-96 h-96 bg-white/10 rounded-full blur-3xl -mr-48 -mt-48" />
          <div className="absolute bottom-0 left-0 w-96 h-96 bg-white/10 rounded-full blur-3xl -ml-48 -mb-48" />

          <div className="relative text-center space-y-8">
            <h2 className="text-4xl md:text-5xl font-bold text-white">
              Ready to Build Your Discipline?
            </h2>
            <p className="text-xl text-white/90 max-w-2xl mx-auto">
              Join thousands of users who have transformed their productivity habits with JustDoIt. Start your free account today.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href="/register"
                className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-white text-blue-600 rounded-lg hover:bg-gray-50 transition-all duration-200 shadow-lg hover:shadow-xl font-semibold group"
              >
                Get Started Free
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </Link>
              <Link
                href="/login"
                className="inline-flex items-center justify-center px-8 py-4 border-2 border-white text-white rounded-lg hover:bg-white/10 transition-all duration-200 font-semibold"
              >
                Sign In
              </Link>
            </div>

            <p className="text-white/80 text-sm">
              No credit card required. Free forever plan available.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
