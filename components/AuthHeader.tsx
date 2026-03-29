export function AuthHeader() {
  return (
    <div className="mb-8 text-center">
      <div className="mb-4 flex justify-center">
        <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-gradient-to-br from-blue-600 to-teal-600 shadow-lg hover:shadow-xl transition-shadow">
          <span className="text-xl font-bold text-white">✓</span>
        </div>
      </div>
      <h1 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-blue-600 to-teal-600 bg-clip-text text-transparent dark:from-blue-400 dark:to-teal-400">
        JustDoIt
      </h1>
      <p className="mt-2 text-sm text-gray-600 dark:text-gray-400 font-medium">Master your discipline and build lasting habits</p>
    </div>
  );
}
