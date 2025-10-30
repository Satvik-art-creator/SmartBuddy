import React, { useState, useEffect } from 'react';
import api from '../api/axios';
import TipsSection from './TipsSection';

const Wellness = ({ user, setUser }) => {
  const [mood, setMood] = useState('');
  const [tip, setTip] = useState('');
  const [loading, setLoading] = useState(false);
  const [checkedIn, setCheckedIn] = useState(false);
  const [moodHistory, setMoodHistory] = useState([]);
  const [alreadyCheckedIn, setAlreadyCheckedIn] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    // Ensure moodHistory exists as an array
    const userMoodHistory = user?.moodHistory || [];
    
    if (userMoodHistory.length > 0) {
      setMoodHistory(userMoodHistory.slice(-5).reverse());
      
      // Check if user has already checked in today
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      const hasCheckedInToday = userMoodHistory.some(entry => {
        const entryDate = new Date(entry.date);
        entryDate.setHours(0, 0, 0, 0);
        return entryDate.getTime() === today.getTime();
      });
      
      setAlreadyCheckedIn(hasCheckedInToday);
    } else {
      setMoodHistory([]);
      setAlreadyCheckedIn(false);
    }
  }, [user]);

  const handleMoodSelect = async (selectedMood) => {
    setMood(selectedMood);
    setLoading(true);
    setErrorMessage('');

    try {
      // Get wellness tip
      const tipRes = await api.get(`/api/wellness?mood=${selectedMood}`);
      setTip(tipRes.data.tip);

      // Check-in and earn XP
      const checkinRes = await api.post('/api/wellness/checkin', {
        mood: selectedMood,
        tip: tipRes.data.tip
      });

      // Check if already checked in today
      if (checkinRes.data.alreadyCheckedIn) {
        setErrorMessage(checkinRes.data.message || 'You have already checked in today!');
        setAlreadyCheckedIn(true);
        setLoading(false);
        return;
      }

      setCheckedIn(true);
      
      // Update user XP
      if (setUser) {
        setUser(prevUser => ({
          ...prevUser,
          xp: checkinRes.data.xp,
          moodHistory: [...(prevUser.moodHistory || []), {
            mood: selectedMood,
            date: new Date(),
            tip: tipRes.data.tip
          }]
        }));
      }

      // Update localStorage
      const updatedUser = { 
        ...user, 
        xp: checkinRes.data.xp,
        moodHistory: [...(user.moodHistory || []), {
          mood: selectedMood,
          date: new Date(),
          tip: tipRes.data.tip
        }]
      };
      localStorage.setItem('user', JSON.stringify(updatedUser));
    } catch (error) {
      console.error('Error checking in:', error);
      if (error.response?.data?.alreadyCheckedIn) {
        setErrorMessage(error.response.data.message);
        setAlreadyCheckedIn(true);
      } else {
        setErrorMessage('Failed to check in. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

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

  const moodOptions = [
    { emoji: '😊', label: 'Happy', value: 'Happy' },
    { emoji: '😐', label: 'Neutral', value: 'Neutral' },
    { emoji: '😰', label: 'Stressed', value: 'Stressed' }
  ];

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-white mb-2">
          💚 Wellness & Motivation
        </h1>
        <p className="text-white/80 text-lg">
          Take care of yourself, one day at a time
        </p>
      </div>

      {/* AI-Powered Personalized Tips */}
      <div className="mb-6">
        <TipsSection user={user} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Check-in Section */}
        <div className="bg-white rounded-2xl shadow-xl p-6">
          <h2 className="text-2xl font-bold text-gray-800 mb-6">
            How are you feeling today?
          </h2>

          {!checkedIn ? (
            <>
              {alreadyCheckedIn ? (
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6 text-center">
                  <div className="text-6xl mb-4">✅</div>
                  <h3 className="text-xl font-semibold text-yellow-800 mb-2">
                    Already Checked In Today!
                  </h3>
                  <p className="text-gray-700">
                    You've already completed your wellness check-in today. Come back tomorrow for more XP! 🎉
                  </p>
                  <button
                    onClick={() => {
                      setAlreadyCheckedIn(false);
                      setCheckedIn(false);
                      setMood('');
                      setTip('');
                      setErrorMessage('');
                    }}
                    className="mt-4 px-6 py-2 text-purple-600 border border-purple-600 rounded-lg hover:bg-purple-50 transition-colors"
                  >
                    Change Mood
                  </button>
                </div>
              ) : (
                <>
                  <div className="space-y-4">
                    {moodOptions.map((option) => (
                      <button
                        key={option.value}
                        onClick={() => handleMoodSelect(option.value)}
                        disabled={loading || alreadyCheckedIn}
                        className={`w-full p-6 rounded-xl text-2xl border-4 transition-all ${
                          mood === option.value
                            ? 'border-purple-500 bg-purple-50'
                            : 'border-gray-300 hover:border-purple-300 hover:bg-purple-50'
                        } ${loading || alreadyCheckedIn ? 'opacity-50 cursor-not-allowed' : ''}`}
                      >
                        <div className="text-6xl mb-2">{option.emoji}</div>
                        <div className="text-xl font-semibold text-gray-800">
                          {option.label}
                        </div>
                      </button>
                    ))}
                  </div>
                  {errorMessage && (
                    <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-center">
                      {errorMessage}
                    </div>
                  )}
                  {loading && (
                    <div className="mt-4 text-center text-gray-600">
                      Generating your personalized tip...
                    </div>
                  )}
                </>
              )}
            </>
          ) : (
            <div className="text-center">
              <div className="text-6xl mb-4">{moodOptions.find(o => o.value === mood)?.emoji}</div>
              <h3 className="text-xl font-semibold text-gray-800 mb-2">
                Checked in as {mood}!
              </h3>
              <div className="bg-green-50 border border-green-200 rounded-lg p-4 mt-4">
                <p className="text-lg font-semibold text-green-800 mb-2">
                  +10 XP Earned! 🎉
                </p>
                <p className="text-gray-700 leading-relaxed">{tip}</p>
              </div>
              <button
                onClick={() => {
                  setCheckedIn(false);
                  setMood('');
                  setTip('');
                }}
                className="mt-4 px-6 py-2 text-purple-600 border border-purple-600 rounded-lg hover:bg-purple-50 transition-colors"
              >
                Check-in Again
              </button>
            </div>
          )}
        </div>

        {/* History Section */}
        <div className="bg-white rounded-2xl shadow-xl p-6">
          <h2 className="text-2xl font-bold text-gray-800 mb-6">
            Your Wellness Journey
          </h2>

          {moodHistory.length === 0 ? (
            <p className="text-gray-500 text-center py-8">
              Start checking in to see your wellness history!
            </p>
          ) : (
            <div className="space-y-4">
              {moodHistory.map((entry, idx) => (
                <div
                  key={idx}
                  className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-2xl">
                      {moodOptions.find(o => o.value === entry.mood)?.emoji}
                    </span>
                    <span className="text-sm text-gray-600">
                      {new Date(entry.date).toLocaleDateString()}
                    </span>
                  </div>
                  <p className="text-gray-700 text-sm italic">"{entry.tip}"</p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Stats Section */}
      <div className="mt-8 bg-white rounded-2xl shadow-xl p-6">
        <h2 className="text-2xl font-bold text-gray-800 mb-4">
          Your Stats
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-purple-50 rounded-lg p-4 text-center">
            <div className="text-3xl font-bold text-purple-600">{user?.xp || 0}</div>
            <div className="text-gray-700">Total XP</div>
          </div>
          <div className="bg-blue-50 rounded-lg p-4 text-center">
            <div className="text-3xl font-bold text-blue-600">
              {moodHistory.length}
            </div>
            <div className="text-gray-700">Check-ins</div>
          </div>
          <div className="bg-green-50 rounded-lg p-4 text-center">
            <div className="text-3xl font-bold text-green-600">Great!</div>
            <div className="text-gray-700">Status</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Wellness;

