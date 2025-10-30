import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/axios';
import TipsSection from './TipsSection';

const Dashboard = ({ user, setUser }) => {
  const navigate = useNavigate();
  const [matches, setMatches] = useState([]);
  const [events, setEvents] = useState([]);
  const [wellnessTip, setWellnessTip] = useState('');
  const [greeting, setGreeting] = useState('');
  const [loading, setLoading] = useState(true);

  const handleXPUpdate = async () => {
    try {
      const response = await api.get('/api/xp');
      const updatedUser = { ...user, xp: response.data.xp };
      if (setUser) setUser(updatedUser);
      localStorage.setItem('user', JSON.stringify(updatedUser));
    } catch (error) {
      console.error('Error updating XP:', error);
    }
  };

  useEffect(() => {
    const hour = new Date().getHours();
    if (hour < 12) {
      setGreeting('Good Morning');
    } else if (hour < 17) {
      setGreeting('Good Afternoon');
    } else {
      setGreeting('Good Evening');
    }

    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const [matchesRes, eventsRes, wellnessRes] = await Promise.all([
        api.get('/api/match?limit=3'),
        api.get('/api/events'),
        api.get('/api/wellness?mood=Happy')
      ]);

      setMatches(matchesRes.data);
      setEvents(eventsRes.data.slice(0, 3));
      setWellnessTip(wellnessRes.data.tip);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-white text-2xl">Loading...</div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Greeting Section */}
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-white mb-2">
          {greeting}, {user?.name} 👋
        </h1>
        <p className="text-white/80 text-lg">
          You've earned {user?.xp || 0} XP 🌟 Keep collaborating to level up!
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Study Buddy Suggestions */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-2xl shadow-xl p-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-gray-800">
                🔍 Top 3 Study Buddy Matches
              </h2>
              <button
                onClick={() => navigate('/buddy')}
                className="text-purple-600 hover:text-purple-700 font-semibold text-sm"
              >
                View All →
              </button>
            </div>
            {matches.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-gray-500 text-lg">No matches found at the moment.</p>
                <p className="text-gray-400 text-sm mt-2">
                  Update your skills and interests to find study buddies!
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {matches.map((match) => (
                  <div
                    key={match.id}
                    className="border border-purple-200 rounded-xl p-5 hover:shadow-lg transition-all bg-gradient-to-br from-white to-purple-50"
                  >
                    {/* Header with name and match score */}
                    <div className="mb-4">
                      <div className="flex justify-between items-start mb-2">
                        <h3 className="font-bold text-lg text-gray-800">
                          {match.name}
                        </h3>
                        <span className="bg-gradient-to-r from-purple-600 to-blue-600 text-white px-3 py-1 rounded-full text-xs font-semibold whitespace-nowrap">
                          {match.score || match.matchScore}%
                        </span>
                      </div>
                      {(match.branch || match.year) && (
                        <div className="flex gap-2 mt-2">
                          {match.branch && (
                            <span className="bg-green-100 text-green-700 px-2 py-0.5 rounded text-xs">
                              {match.branch}
                            </span>
                          )}
                          {match.year && (
                            <span className="bg-orange-100 text-orange-700 px-2 py-0.5 rounded text-xs">
                              Year {match.year}
                            </span>
                          )}
                        </div>
                      )}
                    </div>

                    {/* Shared Skills */}
                    {match.sharedSkills.length > 0 && (
                      <div className="mb-3">
                        <h4 className="text-xs font-semibold text-gray-700 mb-1.5">Shared Skills:</h4>
                        <div className="flex flex-wrap gap-1.5">
                          {match.sharedSkills.slice(0, 3).map((skill, idx) => (
                            <span
                              key={idx}
                              className="bg-purple-100 text-purple-700 px-2 py-0.5 rounded-full text-xs"
                            >
                              {skill}
                            </span>
                          ))}
                          {match.sharedSkills.length > 3 && (
                            <span className="text-gray-400 text-xs">+{match.sharedSkills.length - 3}</span>
                          )}
                        </div>
                      </div>
                    )}

                    {/* Shared Interests */}
                    {match.sharedInterests.length > 0 && (
                      <div className="mb-4">
                        <h4 className="text-xs font-semibold text-gray-700 mb-1.5">Common Interests:</h4>
                        <div className="flex flex-wrap gap-1.5">
                          {match.sharedInterests.slice(0, 2).map((interest, idx) => (
                            <span
                              key={idx}
                              className="bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full text-xs"
                            >
                              {interest}
                            </span>
                          ))}
                          {match.sharedInterests.length > 2 && (
                            <span className="text-gray-400 text-xs">+{match.sharedInterests.length - 2}</span>
                          )}
                        </div>
                      </div>
                    )}

                    {/* Connect Button */}
                    <button
                      onClick={() => navigate('/buddy')}
                      className="w-full bg-gradient-to-r from-purple-600 to-blue-600 text-white py-2 rounded-lg font-semibold hover:from-purple-700 hover:to-blue-700 transition-all text-sm mt-auto"
                    >
                      Connect
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Wellness & Events Sidebar */}
        <div className="space-y-6">
          {/* AI-Powered Personalized Tips */}
          <TipsSection user={user} />

          {/* SmartBuddy XP Card */}
          <div className="bg-gradient-to-r from-purple-600 to-blue-600 rounded-2xl shadow-xl p-6 text-white">
            <h2 className="text-2xl font-bold mb-2">Your SmartBuddy XP</h2>
            <p className="text-lg opacity-90">
              You've earned {user?.xp || 0} XP 🌟 Keep collaborating to level up!
            </p>
          </div>

          {/* Wellness Tip */}
          <div className="bg-white rounded-2xl shadow-xl p-6">
            <h2 className="text-2xl font-bold text-gray-800 mb-4">
              💚 Daily Wellness Tip
            </h2>
            <p className="text-gray-700 leading-relaxed">{wellnessTip}</p>
            <button
              onClick={() => navigate('/wellness')}
              className="mt-4 w-full bg-green-500 text-white py-2 rounded-lg font-semibold hover:bg-green-600 transition-colors"
            >
              Check-in Today
            </button>
          </div>

          {/* Event Recommendations */}
          <div className="bg-white rounded-2xl shadow-xl p-6">
            <h2 className="text-2xl font-bold text-gray-800 mb-4">
              📅 Upcoming Events
            </h2>
            <div className="space-y-3">
              {events.length === 0 ? (
                <p className="text-gray-500">No upcoming events.</p>
              ) : (
                events.map((event) => (
                  <div
                    key={event._id}
                    className="border border-blue-200 rounded-lg p-3 hover:shadow-md transition-shadow"
                  >
                    <h4 className="font-semibold text-gray-800">{event.title}</h4>
                    <p className="text-sm text-gray-600">{event.date} at {event.time}</p>
                    <p className="text-xs text-blue-600">📍 {event.location}</p>
                  </div>
                ))
              )}
            </div>
            <button
              onClick={() => navigate('/events')}
              className="mt-4 w-full border-2 border-purple-500 text-purple-600 py-2 rounded-lg font-semibold hover:bg-purple-50 transition-colors"
            >
              View All Events
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;

