import Link from "next/link";

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-linear-to-b from-peach-50 via-white to-mint-50">
      {/* Navigation */}
      <nav className="sticky top-0 z-20 bg-white/80 backdrop-blur-md border-b border-peach-100">
        <div className="max-w-5xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-2xl">🍼</span>
            <span className="font-bold text-gray-800 text-lg">Baby Feast Diary</span>
          </div>
          <div className="flex items-center gap-3">
            <Link
              href="/login"
              className="px-4 py-2 text-sm font-medium text-gray-600 hover:text-peach-600 transition-colors"
            >
              Login
            </Link>
            <Link
              href="/register"
              className="px-5 py-2.5 text-sm font-semibold text-white bg-linear-to-r from-peach-400 to-peach-500 rounded-full shadow-md shadow-peach-200/50 hover:shadow-lg hover:shadow-peach-300/50 hover:-translate-y-0.5 transition-all duration-200"
            >
              Get Started
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="max-w-5xl mx-auto px-4 pt-16 pb-20 text-center">
        <div className="animate-section-enter">
          <span className="text-6xl mb-6 block">🍼</span>
          <h1 className="text-4xl sm:text-5xl font-extrabold text-gray-900 leading-tight mb-4">
            Baby Feast Diary
          </h1>
          <p className="text-lg sm:text-xl text-gray-500 max-w-xl mx-auto mb-8 leading-relaxed">
            Track your baby&apos;s food journey with the{" "}
            <span className="text-peach-600 font-semibold">&ldquo;One New Food Before One&rdquo;</span>{" "}
            approach.
          </p>
          <div className="flex items-center justify-center gap-4 flex-wrap">
            <Link
              href="/register"
              className="px-8 py-3.5 text-base font-semibold text-white bg-linear-to-r from-peach-400 to-peach-500 rounded-full shadow-lg shadow-peach-200/60 hover:shadow-xl hover:shadow-peach-300/50 hover:-translate-y-0.5 transition-all duration-200 active:scale-95"
            >
              Start Tracking
            </Link>
            <Link
              href="/login"
              className="px-8 py-3.5 text-base font-semibold text-gray-600 bg-white border-2 border-gray-200 rounded-full hover:border-peach-300 hover:text-peach-600 hover:shadow-sm transition-all duration-200 active:scale-95"
            >
              Login
            </Link>
          </div>
        </div>
      </section>

      {/* Research Section */}
      <section className="bg-white py-16 border-y border-gray-100">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <div className="animate-section-enter section-delay-1">
            <span className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full text-sm font-medium bg-mint-100 text-mint-700 mb-6">
              🧪 Research-Backed
            </span>
            <h2 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-4">
              Why introduce many foods before age one?
            </h2>
            <p className="text-gray-500 text-lg max-w-2xl mx-auto leading-relaxed mb-8">
              Introducing a wide variety of foods before age one can help babies develop
              healthy eating habits and reduce picky eating later in life.
            </p>
            <div className="grid sm:grid-cols-3 gap-4 max-w-3xl mx-auto">
              <div className="bg-peach-50 rounded-2xl p-5 border border-peach-100">
                <span className="text-3xl mb-2 block">🥦</span>
                <p className="text-sm font-medium text-gray-700">Better nutrition acceptance</p>
              </div>
              <div className="bg-mint-50 rounded-2xl p-5 border border-mint-100">
                <span className="text-3xl mb-2 block">🛡️</span>
                <p className="text-sm font-medium text-gray-700">Reduced allergy risk</p>
              </div>
              <div className="bg-cream-50 rounded-2xl p-5 border border-cream-200">
                <span className="text-3xl mb-2 block">😋</span>
                <p className="text-sm font-medium text-gray-700">Less picky eating</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-16">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <div className="animate-section-enter section-delay-2">
            <h2 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-10">
              How It Works
            </h2>
            <div className="grid sm:grid-cols-3 gap-8">
              <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-shadow duration-300">
                <div className="w-14 h-14 bg-peach-100 rounded-2xl flex items-center justify-center text-2xl mx-auto mb-4">
                  🥣
                </div>
                <h3 className="font-semibold text-gray-800 mb-2">Log Meals</h3>
                <p className="text-sm text-gray-500 leading-relaxed">
                  Track what foods your baby eats, how it&apos;s cooked, and which seasonings are used.
                </p>
              </div>
              <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-shadow duration-300">
                <div className="w-14 h-14 bg-mint-100 rounded-2xl flex items-center justify-center text-2xl mx-auto mb-4">
                  ❤️
                </div>
                <h3 className="font-semibold text-gray-800 mb-2">Track Reactions</h3>
                <p className="text-sm text-gray-500 leading-relaxed">
                  Record likes, dislikes, and allergies so you know what works best.
                </p>
              </div>
              <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-shadow duration-300">
                <div className="w-14 h-14 bg-cream-100 rounded-2xl flex items-center justify-center text-2xl mx-auto mb-4">
                  📊
                </div>
                <h3 className="font-semibold text-gray-800 mb-2">See Insights</h3>
                <p className="text-sm text-gray-500 leading-relaxed">
                  Understand your baby&apos;s food preferences and discover new things to try.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-linear-to-br from-peach-50 to-mint-50 border-t border-peach-100">
        <div className="max-w-4xl mx-auto px-4 text-center animate-section-enter section-delay-3">
          <span className="text-5xl mb-4 block">🌟</span>
          <h2 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-3">
            Start your baby&apos;s food journey today
          </h2>
          <p className="text-gray-500 mb-8 max-w-lg mx-auto">
            Join parents who are building healthy eating habits for their little ones.
          </p>
          <Link
            href="/register"
            className="inline-block px-10 py-4 text-base font-bold text-white bg-linear-to-r from-peach-400 to-peach-500 rounded-full shadow-lg shadow-peach-200/60 hover:shadow-xl hover:shadow-peach-300/50 hover:-translate-y-0.5 transition-all duration-200 active:scale-95"
          >
            Create Account
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 bg-white border-t border-gray-100">
        <div className="max-w-5xl mx-auto px-4 text-center">
          <p className="text-sm text-gray-400">
            🍼 Baby Feast Diary &mdash; Helping parents raise adventurous eaters.
          </p>
        </div>
      </footer>
    </div>
  );
}
