import Link from "next/link";
import { ArrowRight, Zap, TrendingUp, Target } from "lucide-react";

export function LandingHero() {
  return (
    <div className="relative min-h-screen pt-20 pb-20 px-4 sm:px-6 lg:px-8 overflow-hidden bg-gradient-to-b from-slate-50 via-blue-50 to-white dark:from-slate-950 dark:via-slate-900 dark:to-slate-900">
      {/* Decorative blur elements */}
      <div className="absolute top-20 right-0 w-96 h-96 bg-blue-200 rounded-full mix-blend-multiply filter blur-3xl opacity-20 dark:opacity-10 animate-blob" />
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-blue-300 rounded-full mix-blend-multiply filter blur-3xl opacity-20 dark:opacity-10 animate-blob animation-delay-2000" />

      <div className="relative max-w-7xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          {/* Left Content */}
          <div className="space-y-8 animate-in fade-in slide-in-from-left duration-700">
            <div className="space-y-4">
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-blue-100 dark:bg-blue-900/30 rounded-full">
                <Zap className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                <span className="text-sm font-semibold text-blue-600 dark:text-blue-400">Build Unstoppable Discipline</span>
              </div>

              <h1 className="text-5xl md:text-6xl font-bold tracking-tight text-gray-900 dark:text-white">
                Master Your <span className="bg-gradient-to-r from-blue-600 to-teal-600 bg-clip-text text-transparent">Discipline</span>
              </h1>

              <p className="text-xl text-gray-600 dark:text-gray-300 leading-relaxed">
                Transform your productivity with JustDoIt. Track daily tasks, maintain discipline streaks, and achieve goals consistently. Build habits that last.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-4">
              <Link
                href="/register"
                className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg hover:from-blue-700 hover:to-blue-800 transition-all duration-200 shadow-lg hover:shadow-xl font-semibold group"
              >
                Get Started Free
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </Link>
              <Link
                href="/login"
                className="inline-flex items-center justify-center px-8 py-4 border-2 border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-slate-800/50 transition-all duration-200 font-semibold"
              >
                Sign In
              </Link>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-6 pt-8 border-t border-gray-200 dark:border-gray-700">
              <div>
                <div className="text-3xl font-bold text-blue-600">50K+</div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Active Users</p>
              </div>
              <div>
                <div className="text-3xl font-bold text-teal-600">1M+</div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Tasks Completed</p>
              </div>
              <div>
                <div className="text-3xl font-bold text-blue-500">98%</div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Satisfaction</p>
              </div>
            </div>
          </div>

          {/* Right Visual */}
          <div className="relative animate-in fade-in slide-in-from-right duration-700">
            <div className="relative h-96 sm:h-full min-h-96 rounded-2xl overflow-hidden bg-gradient-to-br from-blue-400 via-blue-500 to-teal-600 shadow-2xl">
              {/* Dashboard Preview */}
              <div className="absolute inset-0 p-6 space-y-4">
                <div className="flex items-center justify-between">
                  <h2 className="text-2xl font-bold text-white">Dashboard</h2>
                  <div className="w-8 h-8 bg-white/20 rounded-lg" />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="bg-white/10 backdrop-blur p-4 rounded-lg border border-white/20">
                    <p className="text-white/80 text-sm">Tasks Done</p>
                    <p className="text-2xl font-bold text-white">24</p>
                  </div>
                  <div className="bg-white/10 backdrop-blur p-4 rounded-lg border border-white/20">
                    <p className="text-white/80 text-sm">Current Streak</p>
                    <p className="text-2xl font-bold text-white">15d</p>
                  </div>
                </div>

                <div className="h-24 bg-white/10 backdrop-blur rounded-lg border border-white/20 flex items-center justify-center">
                  <div className="flex gap-1">
                    {[...Array(7)].map((_, i) => (
                      <div
                        key={i}
                        className={`w-3 h-16 rounded-full transition-all ${
                          i < 5 ? "bg-teal-300" : "bg-white/20"
                        }`}
                      />
                    ))}
                  </div>
                </div>

                <p className="text-white/70 text-xs">Consistency tracking - Week view</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
