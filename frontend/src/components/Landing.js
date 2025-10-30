import React from "react";
import { Link, useNavigate } from "react-router-dom";

const Landing = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-b from-green-50 via-green-50 to-purple-50">
      {/* Header */}
      <header className="bg-white shadow-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          {/* SmartBuddy Logo */}
          <div className="flex items-center gap-3">
            <img
              src="/images/logo.png"
              alt="Smart Buddy Logo"
              className="h-16 w-auto"
            />
          </div>

          {/* Header Actions */}
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate("/login")}
              className="px-4 py-2 border-2 border-purple-500 text-purple-600 rounded-lg font-semibold hover:bg-purple-50 transition-colors"
            >
              Login
            </button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          {/* Left Content */}
          <div className="space-y-6">
            <h1 className="text-5xl lg:text-6xl font-bold leading-tight">
              <span className="text-green-600">Your AI Campus</span>
              <br />
              <span className="text-purple-600">Companion</span>
            </h1>
            <p className="text-xl text-gray-700 font-medium">
              Connect, Collaborate, and Grow.
            </p>
            <p className="text-gray-600 leading-relaxed">
              SmartBuddy helps students thrive with AI-powered tools for finding
              study partners, discovering campus events, and maintaining
              wellness throughout your academic journey.
            </p>
            <div className="flex flex-wrap gap-4 pt-4">
              <button
                onClick={() => navigate("/register")}
                className="px-8 py-3 bg-green-500 text-white rounded-lg font-semibold hover:bg-green-600 transition-colors shadow-lg hover:shadow-xl"
              >
                Get Started
              </button>
              <button
                onClick={() => navigate("/login")}
                className="px-8 py-3 border-2 border-purple-500 text-purple-600 bg-white rounded-lg font-semibold hover:bg-purple-50 transition-colors"
              >
                Login
              </button>
            </div>
          </div>

          {/* Right Image - Students Collaborating */}
          <div className="relative">
            <div className="rounded-3xl overflow-hidden shadow-2xl">
              {/* Students Collaborating Image */}
              <img
                src="/images/students-collab.png"
                alt="Students collaborating and studying together around a table with laptops"
                className="w-full h-96 object-cover"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="container mx-auto px-4 py-16">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold text-gray-800 mb-3">
            Everything You Need to Succeed
          </h2>
          <p className="text-xl text-gray-600">
            Powerful features designed for modern students
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Feature 1: Find Study Buddies */}
          <div className="bg-white rounded-2xl p-8 shadow-lg hover:shadow-xl transition-shadow">
            <div className="w-16 h-16 bg-gradient-to-br from-yellow-300 to-green-400 rounded-xl flex items-center justify-center mb-6">
              <svg
                className="w-8 h-8 text-white"
                fill="currentColor"
                viewBox="0 0 24 24"
              >
                <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
              </svg>
            </div>
            <h3 className="text-2xl font-bold text-gray-800 mb-4">
              Find Study Buddies
            </h3>
            <p className="text-gray-600 leading-relaxed">
              Connect with classmates who share your courses and study goals.
              Build meaningful study groups powered by AI matching.
            </p>
          </div>

          {/* Feature 2: Join Campus Events */}
          <div className="bg-white rounded-2xl p-8 shadow-lg hover:shadow-xl transition-shadow">
            <div className="w-16 h-16 bg-gradient-to-br from-purple-400 to-purple-600 rounded-xl flex items-center justify-center mb-6">
              <svg
                className="w-8 h-8 text-white"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                />
              </svg>
            </div>
            <h3 className="text-2xl font-bold text-gray-800 mb-4">
              Join Campus Events
            </h3>
            <p className="text-gray-600 leading-relaxed">
              Discover clubs, workshops, and social events tailored to your
              interests. Never miss out on campus life again.
            </p>
          </div>

          {/* Feature 3: Boost Your Wellness */}
          <div className="bg-white rounded-2xl p-8 shadow-lg hover:shadow-xl transition-shadow">
            <div className="w-16 h-16 bg-gradient-to-br from-green-400 to-purple-500 rounded-xl flex items-center justify-center mb-6">
              <svg
                className="w-8 h-8 text-white"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
                />
              </svg>
            </div>
            <h3 className="text-2xl font-bold text-gray-800 mb-4">
              Boost Your Wellness
            </h3>
            <p className="text-gray-600 leading-relaxed">
              Track your mental health, set wellness goals, and access
              resources. Balance academics with self-care effortlessly.
            </p>
          </div>
        </div>
      </section>

      {/* Secondary CTA Section */}
      <section className="container mx-auto px-4 py-12">
        <div className="bg-gradient-to-r from-green-500 to-purple-600 rounded-3xl p-12 text-center shadow-2xl">
          <h2 className="text-4xl font-bold text-white mb-4">
            Ready to Transform Your Campus Experience?
          </h2>
          <p className="text-xl text-white/90 mb-8">
            Join thousands of students already using SmartBuddy
          </p>
          <button
            onClick={() => navigate("/register")}
            className="px-8 py-4 bg-white text-purple-600 rounded-lg font-bold text-lg hover:bg-gray-100 transition-colors shadow-lg"
          >
            Get Started Free
          </button>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-white border-t border-gray-200 mt-16">
        <div className="container mx-auto px-4 py-8">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="flex items-center gap-3 mb-4 md:mb-0">
              {/* Footer Logo */}
              <img
                src="/images/logo.png"
                alt="Smart Buddy Logo"
                className="h-12 w-auto"
              />
              <span className="text-gray-600">
                © 2025 SmartBuddy. All rights reserved.
              </span>
            </div>
            <div className="flex gap-6">
              <Link
                to="#"
                className="text-gray-600 hover:text-purple-600 transition-colors"
              >
                Privacy
              </Link>
              <Link
                to="#"
                className="text-gray-600 hover:text-purple-600 transition-colors"
              >
                Terms
              </Link>
              <Link
                to="#"
                className="text-gray-600 hover:text-purple-600 transition-colors"
              >
                Contact
              </Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Landing;
