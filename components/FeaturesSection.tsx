import {
  CheckCircle2,
  BarChart3,
  Bell,
  Zap,
  Target,
  TrendingUp,
} from "lucide-react";

export function FeaturesSection() {
  const features = [
    {
      icon: CheckCircle2,
      title: "Task Management",
      description: "Create, organize, and track daily tasks with ease. Set deadlines and priorities.",
      color: "bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400",
    },
    {
      icon: TrendingUp,
      title: "Discipline Streaks",
      description: "Build unstoppable momentum with visual streak tracking. Never break the chain.",
      color: "bg-teal-100 dark:bg-teal-900/30 text-teal-600 dark:text-teal-400",
    },
    {
      icon: BarChart3,
      title: "Analytics Dashboard",
      description: "See your progress with detailed analytics. Track productivity trends over time.",
      color: "bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400",
    },
    {
      icon: Bell,
      title: "Smart Reminders",
      description: "Never miss a deadline with intelligent reminder notifications.",
      color: "bg-orange-100 dark:bg-orange-900/30 text-orange-600 dark:text-orange-400",
    },
    {
      icon: Target,
      title: "Goal Tracking",
      description: "Set ambitious goals and track progress towards achieving them.",
      color: "bg-pink-100 dark:bg-pink-900/30 text-pink-600 dark:text-pink-400",
    },
    {
      icon: Zap,
      title: "Performance Insights",
      description: "Get actionable insights to improve your productivity and consistency.",
      color: "bg-yellow-100 dark:bg-yellow-900/30 text-yellow-600 dark:text-yellow-400",
    },
  ];

  return (
    <section className="py-20 px-4 sm:px-6 lg:px-8 bg-white dark:bg-slate-900">
      <div className="max-w-7xl mx-auto">
        {/* Section Header */}
        <div className="text-center space-y-4 mb-16">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-blue-100 dark:bg-blue-900/30 rounded-full mb-4">
            <span className="text-sm font-semibold text-blue-600 dark:text-blue-400">Powerful Features</span>
          </div>
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white">
            Everything You Need to Succeed
          </h2>
          <p className="text-xl text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
            Comprehensive tools designed to help you build discipline and achieve your goals
          </p>
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => {
            const Icon = feature.icon;
            return (
              <div
                key={index}
                className="group p-8 rounded-2xl border border-gray-200 dark:border-gray-700 hover:border-blue-300 dark:hover:border-blue-700 transition-all duration-300 hover:shadow-lg dark:hover:shadow-blue-900/20 bg-gradient-to-br from-white to-gray-50 dark:from-slate-800 dark:to-slate-900"
              >
                <div className={`w-14 h-14 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform ${feature.color}`}>
                  <Icon className="w-7 h-7" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                  {feature.title}
                </h3>
                <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
                  {feature.description}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
