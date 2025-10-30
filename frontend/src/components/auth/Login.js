import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import api from "../../api/axios";

const Login = ({ onLogin }) => {
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  const [error, setError] = useState("");
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [accountLocked, setAccountLocked] = useState(false);
  const [lockTimeRemaining, setLockTimeRemaining] = useState(null);
  const [remainingAttempts, setRemainingAttempts] = useState(null);
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });

    // Clear errors when user starts typing
    if (errors[e.target.name]) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[e.target.name];
        return newErrors;
      });
    }
    if (error) setError("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const response = await api.post("/api/auth/login", formData);
      onLogin(response.data.token, response.data.user);
      navigate("/dashboard");
    } catch (err) {
      const errorData = err.response?.data;

      // Handle account locked
      if (errorData?.error === "ACCOUNT_LOCKED") {
        setAccountLocked(true);
        setLockTimeRemaining(errorData.lockTimeRemaining);
        setError(errorData.message || "Account is temporarily locked");
        return;
      }

      // Handle validation errors
      if (errorData?.errors && Array.isArray(errorData.errors)) {
        const fieldErrors = {};
        errorData.errors.forEach((err) => {
          fieldErrors[err.field] = err.message;
        });
        setErrors(fieldErrors);
        setError("Please fix the validation errors above");
      } else {
        setError(errorData?.message || "Login failed");
        setRemainingAttempts(errorData?.remainingAttempts);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="min-h-screen relative overflow-hidden"
      style={{
        background:
          "linear-gradient(to right, #a7f3d0 0%, #d1fae5 30%, #e9d5ff 50%, #ddd6fe 70%, #c4b5fd 100%)",
      }}
    >
      {/* Background Decorative Icons */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {/* Book Icon - Top Left */}
        <div className="absolute top-20 left-10 animate-float">
          <svg
            className="w-16 h-16 text-gray-400 opacity-30"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1.5}
              d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
            />
          </svg>
        </div>
        {/* Lightbulb Icon - Mid Left */}
        <div className="absolute top-1/2 left-20 animate-float-slow delay-75">
          <svg
            className="w-20 h-20 text-gray-400 opacity-30"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1.5}
              d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"
            />
          </svg>
        </div>
        {/* Star Icon - Bottom Left */}
        <div className="absolute bottom-20 left-16 animate-float-fast delay-150">
          <svg
            className="w-14 h-14 text-gray-400 opacity-30"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1.5}
              d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z"
            />
          </svg>
        </div>
        {/* Brain Icon - Top Right */}
        <div className="absolute top-24 right-20 animate-float delay-100">
          <svg
            className="w-18 h-18 text-gray-400 opacity-30"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1.5}
              d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"
            />
          </svg>
        </div>
        {/* Graduation Cap Icon - Bottom Right */}
        <div className="absolute bottom-16 right-16 animate-float-slow delay-200">
          <svg
            className="w-16 h-16 text-gray-400 opacity-30"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1.5}
              d="M12 14l9-5-9-5-9 5 9 5z"
            />
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1.5}
              d="M12 14l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14z"
            />
          </svg>
        </div>
      </div>

      {/* Login Card - Centered */}
      <div className="min-h-[calc(100vh-64px)] flex items-center justify-center p-4">
        <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md p-8 md:p-12 transform transition-all duration-500 hover:scale-[1.02]">
          {/* Logo Section */}
          <div className="text-center mb-8 animate-fade-in">
            <div className="flex justify-center mb-4">
              <div className="relative">
                <img
                  src="/images/logo.png"
                  alt="Smart Buddy Logo"
                  className="h-20 w-auto mx-auto"
                />
              </div>
            </div>
            <h2 className="text-3xl font-bold bg-gradient-to-r from-green-600 to-purple-600 bg-clip-text text-transparent mb-2">
              Smart Buddy
            </h2>
            <p className="text-gray-600 text-lg">
              Welcome back! Ready to make today productive?
            </p>
          </div>

          {/* Error Message */}
          {error && (
            <div
              className={`mb-6 px-4 py-3 rounded-lg transition-all duration-300 ${
                accountLocked
                  ? "bg-yellow-100 border border-yellow-400 text-yellow-800"
                  : "bg-red-100 border border-red-400 text-red-700"
              }`}
            >
              <p className="font-semibold text-sm">{error}</p>
              {lockTimeRemaining && (
                <p className="text-xs mt-1">
                  Account will be unlocked in {lockTimeRemaining} minutes
                </p>
              )}
              {remainingAttempts !== null && remainingAttempts > 0 && (
                <p className="text-xs mt-1">
                  {remainingAttempts} attempt
                  {remainingAttempts !== 1 ? "s" : ""} remaining
                </p>
              )}
            </div>
          )}

          {/* Login Form */}
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Email Field */}
            <div>
              <label className="block text-gray-700 text-sm font-semibold mb-2">
                Email
              </label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                className={`w-full px-4 py-3 bg-gray-50 rounded-lg border-2 focus:outline-none focus:ring-2 transition-all ${
                  errors.email
                    ? "border-red-500 focus:ring-red-500"
                    : "border-gray-200 focus:border-purple-500 focus:ring-purple-200"
                }`}
                placeholder="btxxxxx20xx@iiitn.ac.in"
                required
                disabled={accountLocked}
              />
              {errors.email && (
                <p className="text-red-500 text-xs mt-1">{errors.email}</p>
              )}
            </div>

            {/* Password Field */}
            <div>
              <label className="block text-gray-700 text-sm font-semibold mb-2">
                Password
              </label>
              <input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                className={`w-full px-4 py-3 bg-gray-50 rounded-lg border-2 focus:outline-none focus:ring-2 transition-all ${
                  errors.password
                    ? "border-red-500 focus:ring-red-500"
                    : "border-gray-200 focus:border-purple-500 focus:ring-purple-200"
                }`}
                placeholder="Enter your password"
                required
                disabled={accountLocked}
              />
              {errors.password && (
                <p className="text-red-500 text-xs mt-1">{errors.password}</p>
              )}
            </div>

            {/* Login Button */}
            <button
              type="submit"
              disabled={loading || accountLocked}
              className="w-full bg-gradient-to-r from-green-500 to-purple-600 text-white py-4 rounded-lg font-bold text-lg hover:from-green-600 hover:to-purple-700 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
            >
              {loading
                ? "Logging in..."
                : accountLocked
                ? "Account Locked"
                : "Login"}
            </button>
          </form>

          {/* Register Link */}
          <div className="mt-6 text-center">
            <p className="text-gray-600 text-sm">
              New here?{" "}
              <Link
                to="/register"
                className="text-purple-600 font-semibold underline hover:text-purple-700 transition-colors"
              >
                Register
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
