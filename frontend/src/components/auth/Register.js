import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import api from "../../api/axios";

const Register = ({ onLogin }) => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    branch: "",
    year: "",
    availability: [],
    skills: [],
    interests: [],
  });
  const [skillInput, setSkillInput] = useState("");
  const [interestInput, setInterestInput] = useState("");
  const [error, setError] = useState("");
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [passwordStrength, setPasswordStrength] = useState({
    score: 0,
    feedback: [],
  });
  const navigate = useNavigate();

  // Password strength validator
  const checkPasswordStrength = (password) => {
    const minLength = 8;
    const hasUpperCase = /[A-Z]/.test(password);
    const hasLowerCase = /[a-z]/.test(password);
    const hasNumbers = /\d/.test(password);
    const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password);

    const feedback = [];
    let score = 0;

    if (password.length >= minLength) {
      score++;
    } else {
      feedback.push(`At least ${minLength} characters`);
    }

    if (hasUpperCase) score++;
    else feedback.push("Uppercase letter");

    if (hasLowerCase) score++;
    else feedback.push("Lowercase letter");

    if (hasNumbers) score++;
    else feedback.push("Number");

    if (hasSpecialChar) score++;
    else feedback.push("Special character (!@#$%^&*)");

    return { score, feedback };
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });

    // Validate password strength in real-time
    if (name === "password") {
      setPasswordStrength(checkPasswordStrength(value));
    }

    // Clear specific field error when user starts typing
    if (errors[name]) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  };

  const handleAddSkill = () => {
    if (skillInput.trim()) {
      setFormData({
        ...formData,
        skills: [...formData.skills, skillInput.trim()],
      });
      setSkillInput("");
    }
  };

  const handleRemoveSkill = (index) => {
    setFormData({
      ...formData,
      skills: formData.skills.filter((_, i) => i !== index),
    });
  };

  const handleAddInterest = () => {
    if (interestInput.trim()) {
      setFormData({
        ...formData,
        interests: [...formData.interests, interestInput.trim()],
      });
      setInterestInput("");
    }
  };

  const handleRemoveInterest = (index) => {
    setFormData({
      ...formData,
      interests: formData.interests.filter((_, i) => i !== index),
    });
  };

  const handleAvailabilityChange = (e) => {
    const selectedOptions = Array.from(
      e.target.selectedOptions,
      (option) => option.value
    );
    setFormData({
      ...formData,
      availability: selectedOptions,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const userData = {
        name: formData.name,
        email: formData.email,
        password: formData.password,
        branch: formData.branch || "",
        year: formData.year ? parseInt(formData.year) : null,
        availability: formData.availability,
        skills: formData.skills,
        interests: formData.interests,
      };

      const response = await api.post("/api/auth/register", userData);
      onLogin(response.data.token, response.data.user);
      try { localStorage.setItem('aboutPrompt','1'); } catch {}
      alert('Welcome! Please add your About Me in your profile to help others know you.');
      navigate("/profile");
    } catch (err) {
      const errorData = err.response?.data;

      // Handle validation errors
      if (errorData?.errors && Array.isArray(errorData.errors)) {
        const fieldErrors = {};
        errorData.errors.forEach((err) => {
          fieldErrors[err.field] = err.message;
        });
        setErrors(fieldErrors);
        setError("Please fix the validation errors above");
      } else {
        setError(errorData?.message || "Registration failed");
        setErrors({});
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Main Content */}
      <div className="container mx-auto px-4 py-8">
        <div className="bg-white rounded-3xl shadow-2xl overflow-hidden max-w-6xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-0">
            {/* Left Column - Registration Form */}
            <div className="p-8 md:p-12">
              {/* Logo and Branding */}
              <div className="text-center mb-8 animate-fade-in">
                <div className="flex justify-center mb-4">
                  <img
                    src="/images/logo.png"
                    alt="Smart Buddy Logo"
                    className="h-16 w-auto"
                  />
                </div>
                <h1 className="text-3xl font-bold bg-gradient-to-r from-green-600 to-purple-600 bg-clip-text text-transparent mb-2">
                  Join SmartBuddy
                </h1>
                <p className="text-gray-600">
                  Connect, collaborate, and grow with fellow students.
                </p>
              </div>

              {/* Error Message */}
              {error && (
                <div className="mb-6 px-4 py-3 bg-red-100 border border-red-400 text-red-700 rounded-lg">
                  <p className="font-semibold text-sm">{error}</p>
                </div>
              )}

              {/* Registration Form */}
              <form onSubmit={handleSubmit} className="space-y-5">
                {/* Full Name */}
                <div>
                  <label className="block text-gray-700 text-sm font-semibold mb-2 flex items-center gap-2">
                    <svg
                      className="w-4 h-4 text-gray-500"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                      />
                    </svg>
                    Full Name
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    className={`w-full px-4 py-3 bg-gray-50 rounded-lg border-2 focus:outline-none focus:ring-2 transition-all ${
                      errors.name
                        ? "border-red-500 focus:ring-red-500"
                        : "border-gray-200 focus:border-purple-500 focus:ring-purple-200"
                    }`}
                    placeholder="Enter your full name"
                    required
                  />
                  {errors.name && (
                    <p className="text-red-500 text-xs mt-1">{errors.name}</p>
                  )}
                </div>

                {/* Email Address */}
                <div>
                  <label className="block text-gray-700 text-sm font-semibold mb-2 flex items-center gap-2">
                    <svg
                      className="w-4 h-4 text-gray-500"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                      />
                    </svg>
                    Email Address
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
                  />
                  {errors.email && (
                    <p className="text-red-500 text-xs mt-1">{errors.email}</p>
                  )}
                </div>

                {/* Password */}
                <div>
                  <label className="block text-gray-700 text-sm font-semibold mb-2 flex items-center gap-2">
                    <svg
                      className="w-4 h-4 text-gray-500"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                      />
                    </svg>
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
                    placeholder="Create a strong password"
                    required
                    minLength={8}
                  />
                  {errors.password && (
                    <p className="text-red-500 text-xs mt-1">
                      {errors.password}
                    </p>
                  )}
                  {formData.password && (
                    <div className="mt-2">
                      <div className="flex items-center gap-2 mb-1">
                        <div className="flex-1 bg-gray-200 rounded-full h-2">
                          <div
                            className={`h-2 rounded-full transition-all duration-300 ${
                              passwordStrength.score <= 2
                                ? "bg-red-500"
                                : passwordStrength.score === 3
                                ? "bg-yellow-500"
                                : "bg-green-500"
                            }`}
                            style={{
                              width: `${(passwordStrength.score / 5) * 100}%`,
                            }}
                          ></div>
                        </div>
                        <span className="text-xs text-gray-600">
                          {passwordStrength.score <= 2
                            ? "Weak"
                            : passwordStrength.score === 3
                            ? "Medium"
                            : "Strong"}
                        </span>
                      </div>
                      {passwordStrength.feedback.length > 0 && (
                        <p className="text-xs text-gray-500">
                          Requires: {passwordStrength.feedback.join(", ")}
                        </p>
                      )}
                    </div>
                  )}
                </div>

                {/* Branch and Year - Side by Side */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-gray-700 text-sm font-semibold mb-2 flex items-center gap-2">
                      <svg
                        className="w-4 h-4 text-gray-500"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
                        />
                      </svg>
                      Branch
                    </label>
                    <select
                      name="branch"
                      value={formData.branch}
                      onChange={handleChange}
                      className="w-full px-4 py-3 bg-gray-50 rounded-lg border-2 border-gray-200 focus:outline-none focus:ring-2 focus:border-purple-500 focus:ring-purple-200 transition-all appearance-none"
                    >
                      <option value="">Select branch</option>
                      <option value="CSE">CSE</option>
                      <option value="CSH">CSH</option>
                      <option value="CSD">CSD</option>
                      <option value="CSA">CSA</option>
                      <option value="ECE">ECE</option>
                      <option value="ECI">ECI</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-gray-700 text-sm font-semibold mb-2 flex items-center gap-2">
                      <svg
                        className="w-4 h-4 text-gray-500"
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
                      Year
                    </label>
                    <select
                      name="year"
                      value={formData.year}
                      onChange={handleChange}
                      className="w-full px-4 py-3 bg-gray-50 rounded-lg border-2 border-gray-200 focus:outline-none focus:ring-2 focus:border-purple-500 focus:ring-purple-200 transition-all appearance-none"
                    >
                      <option value="">Select year</option>
                      <option value="1">1st Year</option>
                      <option value="2">2nd Year</option>
                      <option value="3">3rd Year</option>
                      <option value="4">4th Year</option>
                    </select>
                  </div>
                </div>

                {/* Skills */}
                <div>
                  <label className="block text-gray-700 text-sm font-semibold mb-2 flex items-center gap-2">
                    <svg
                      className="w-4 h-4 text-gray-500"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                      />
                    </svg>
                    Skills
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={skillInput}
                      onChange={(e) => setSkillInput(e.target.value)}
                      onKeyPress={(e) => {
                        if (e.key === "Enter") {
                          e.preventDefault();
                          handleAddSkill();
                        }
                      }}
                      className="flex-1 px-4 py-3 bg-gray-50 rounded-lg border-2 border-gray-200 focus:outline-none focus:ring-2 focus:border-purple-500 focus:ring-purple-200 transition-all"
                      placeholder="Add a skill (e.g., JavaScript, Design)"
                    />
                    <button
                      type="button"
                      onClick={handleAddSkill}
                      className="w-12 h-12 bg-green-500 text-white rounded-full flex items-center justify-center hover:bg-green-600 transition-all transform hover:scale-110 shadow-lg"
                    >
                      <svg
                        className="w-6 h-6"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M12 4v16m8-8H4"
                        />
                      </svg>
                    </button>
                  </div>
                  {formData.skills.length > 0 && (
                    <div className="flex flex-wrap gap-2 mt-3">
                      {formData.skills.map((skill, index) => (
                        <span
                          key={index}
                          className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm flex items-center gap-2 animate-fade-in"
                        >
                          {skill}
                          <button
                            type="button"
                            onClick={() => handleRemoveSkill(index)}
                            className="text-green-700 hover:text-green-900 transition-colors"
                          >
                            ×
                          </button>
                        </span>
                      ))}
                    </div>
                  )}
                </div>

                {/* Interests */}
                <div>
                  <label className="block text-gray-700 text-sm font-semibold mb-2 flex items-center gap-2">
                    <svg
                      className="w-4 h-4 text-gray-500"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"
                      />
                    </svg>
                    Interests
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={interestInput}
                      onChange={(e) => setInterestInput(e.target.value)}
                      onKeyPress={(e) => {
                        if (e.key === "Enter") {
                          e.preventDefault();
                          handleAddInterest();
                        }
                      }}
                      className="flex-1 px-4 py-3 bg-gray-50 rounded-lg border-2 border-gray-200 focus:outline-none focus:ring-2 focus:border-purple-500 focus:ring-purple-200 transition-all"
                      placeholder="Add an interest (e.g., Web Development, AI)"
                    />
                    <button
                      type="button"
                      onClick={handleAddInterest}
                      className="w-12 h-12 bg-purple-500 text-white rounded-full flex items-center justify-center hover:bg-purple-600 transition-all transform hover:scale-110 shadow-lg"
                    >
                      <svg
                        className="w-6 h-6"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M12 4v16m8-8H4"
                        />
                      </svg>
                    </button>
                  </div>
                  {formData.interests.length > 0 && (
                    <div className="flex flex-wrap gap-2 mt-3">
                      {formData.interests.map((interest, index) => (
                        <span
                          key={index}
                          className="px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-sm flex items-center gap-2 animate-fade-in"
                        >
                          {interest}
                          <button
                            type="button"
                            onClick={() => handleRemoveInterest(index)}
                            className="text-purple-700 hover:text-purple-900 transition-colors"
                          >
                            ×
                          </button>
                        </span>
                      ))}
                    </div>
                  )}
                </div>

                {/* Availability */}
                <div>
                  <label className="block text-gray-700 text-sm font-semibold mb-2 flex items-center gap-2">
                    <svg
                      className="w-4 h-4 text-gray-500"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                      />
                    </svg>
                    Availability
                  </label>
                  <select
                    name="availability"
                    multiple
                    value={formData.availability}
                    onChange={handleAvailabilityChange}
                    className="w-full px-4 py-3 bg-gray-50 rounded-lg border-2 border-gray-200 focus:outline-none focus:ring-2 focus:border-purple-500 focus:ring-purple-200 transition-all min-h-[100px]"
                    size="5"
                  >
                    <option value="Morning">Morning</option>
                    <option value="Evening">Evening</option>
                    <option value="Night">Night</option>
                    <option value="Weekends">Weekends</option>
                    <option value="Flexible">Flexible</option>
                  </select>
                  <p className="text-xs text-gray-500 mt-1">
                    Hold Ctrl/Cmd to select multiple
                    {formData.availability.length > 0 && (
                      <span className="ml-2 text-purple-600 font-semibold">
                        ({formData.availability.length} selected)
                      </span>
                    )}
                  </p>
                </div>

                {/* Create Account Button */}
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-gradient-to-r from-green-500 to-purple-600 text-white py-4 rounded-lg font-bold text-lg hover:from-green-600 hover:to-purple-700 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
                >
                  {loading ? "Creating Account..." : "Create Account"}
                </button>

                {/* Sign In Link */}
                <p className="text-center text-gray-600 text-sm mt-4">
                  Already have an account?{" "}
                  <Link
                    to="/login"
                    className="text-green-600 font-semibold hover:text-green-700 underline transition-colors"
                  >
                    Sign in
                  </Link>
                </p>
              </form>
            </div>

            {/* Right Column - Promotional Section */}
            <div className="hidden lg:flex bg-gradient-to-b from-green-500 to-purple-600 p-8 md:p-12 relative">
              <div className="flex flex-col justify-center items-center w-full gap-6">
                {/* Image */}
                <div className="animate-fade-in">
                  <img
                    src="/images/students-network.png"
                    alt="Students networking and collaborating"
                    className="w-full h-auto rounded-2xl shadow-2xl object-cover max-h-80"
                  />
                </div>

                {/* Text Content */}
                <div className="text-white animate-fade-in delay-200 text-center">
                  <h2 className="text-3xl font-bold mb-4">
                    Build Your Network
                  </h2>
                  <p className="text-lg leading-relaxed opacity-90">
                    Join thousands of students collaborating on projects,
                    sharing knowledge, and building the future together.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Register;
