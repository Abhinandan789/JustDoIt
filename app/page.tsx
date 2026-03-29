import { redirect } from "next/navigation";
import Link from "next/link";

import { getAuthSession } from "@/lib/auth";

export default async function HomePage() {
  const session = await getAuthSession();

  if (session?.user?.id) {
    redirect("/dashboard");
  }

  return (
    <div className="min-h-screen bg-white dark:bg-black flex flex-col">
      {/* Navigation */}\n      <nav className=\"bg-white dark:bg-black border-b border-gray-200 dark:border-gray-800 sticky top-0 z-50\">\n        <div className=\"max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center\">\n          <div className=\"flex items-center space-x-2\">\n            <div className=\"w-8 h-8 bg-black dark:bg-white rounded-lg flex items-center justify-center text-white dark:text-black font-bold\">✓</div>\n            <span className=\"text-xl font-bold text-black dark:text-white\">JustDoIt</span>\n          </div>\n          <div className=\"space-x-4\">\n            <Link href=\"/login\" className=\"text-gray-700 dark:text-gray-300 hover:text-black dark:hover:text-white transition-colors\">\n              Sign In\n            </Link>\n            <Link href=\"/register\" className=\"bg-black dark:bg-white text-white dark:text-black px-4 py-2 rounded-lg hover:bg-gray-900 dark:hover:bg-gray-100 transition-colors\">\n              Get Started\n            </Link>\n          </div>\n        </div>\n      </nav>\n\n      {/* Hero Section */}\n      <section className=\"flex-1 flex items-center justify-center px-4 py-20\">\n        <div className=\"max-w-2xl text-center space-y-6\">\n          <h1 className=\"text-5xl sm:text-6xl font-bold text-black dark:text-white tracking-tight\">Master Your Discipline</h1>\n          <p className=\"text-xl text-gray-600 dark:text-gray-400\">Build lasting habits, track your progress, and achieve your goals with JustDoIt—the minimal productivity app that gets out of your way.</p>\n          <div className=\"flex gap-4 justify-center pt-4\">\n            <Link href=\"/register\" className=\"bg-black text-white px-8 py-4 rounded-lg font-semibold hover:bg-gray-900 transition-colors\">\n              Start Free\n            </Link>\n            <Link href=\"/login\" className=\"border-2 border-black dark:border-white text-black dark:text-white px-8 py-4 rounded-lg font-semibold hover:bg-gray-100 dark:hover:bg-gray-900 transition-colors\">\n              Sign In\n            </Link>\n          </div>\n        </div>\n      </section>\n\n      {/* Footer */}\n      <footer className=\"bg-gray-50 dark:bg-gray-950 border-t border-gray-200 dark:border-gray-800 py-8\">\n        <div className=\"max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center text-gray-600 dark:text-gray-400 text-sm\">\n          <p>&copy; 2026 JustDoIt. All rights reserved. Simple, minimal, powerful.</p>\n        </div>\n      </footer>\n    </div>\n  );\n}
