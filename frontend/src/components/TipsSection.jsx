import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import api from '../api/axios';

const TipsSection = ({ user }) => {
  const [tips, setTips] = useState([]);
  const [cached, setCached] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showXPPopup, setShowXPPopup] = useState(false);
  const [xpRewarded, setXPRewarded] = useState(false);

  useEffect(() => {
    if (user) {
      fetchTips();
    }
  }, [user]);

  const fetchTips = async () => {
    try {
      setLoading(true);
      setError(null);

      const token = localStorage.getItem('token');
      
      if (!token) {
        throw new Error('No authentication token found');
      }

      const response = await api.post('/api/tips', {
        name: user.name,
        xp: user.xp || 0,
        mood: user.mood || 'neutral',
        activity: user.activity || 'studying'
      });

      const data = response.data;
      setTips(data.tips || []);
      setCached(data.cached || false);

      // Award XP after tips load (once per day)
      if (!xpRewarded && data.tips && data.tips.length > 0) {
        setTimeout(() => {
          setShowXPPopup(true);
          awardXP();
        }, 1000 + (data.tips.length * 100)); // Wait for all tips to animate + 1s
      }
    } catch (err) {
      console.error('Error fetching tips:', err);
      setError('Failed to load tips. Please try again.');
      
      // Fallback tips
      setTips([
        `Hey ${user?.name}! Keep pushing forward and stay positive!`,
        `Remember, every step you take is progress toward your goals!`,
        `You're capable of achieving amazing things. Keep up the great work!`
      ]);
    } finally {
      setLoading(false);
    }
  };

  const awardXP = async () => {
    try {
      await api.post('/api/xp/add', {
        xpToAdd: 5,
        reason: 'Viewed personalized AI tips'
      });

      setXPRewarded(true);
      
      // Hide popup after 3 seconds
      setTimeout(() => {
        setShowXPPopup(false);
      }, 3000);
    } catch (err) {
      console.error('Error awarding XP:', err);
    }
  };

  const handleRefresh = () => {
    if (!cached) return;
    
    setXPRewarded(false); // Reset to allow XP again
    fetchTips();
  };

  const tipEmojis = ['💡', '⚡', '🌈', '🌿', '✨', '🎯'];

  if (loading) {
    return (
      <div className="p-4 bg-white/60 backdrop-blur-md rounded-2xl shadow-lg border border-gray-200">
        <div className="flex items-center justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
          <span className="ml-3 text-gray-600">Loading your personalized tips...</span>
        </div>
      </div>
    );
  }

  if (error && tips.length === 0) {
    return (
      <div className="p-4 bg-white/60 backdrop-blur-md rounded-2xl shadow-lg border border-gray-200">
        <h2 className="text-xl font-bold text-gray-800 mb-2">
          🌿 Today's SmartBuddy Tips
        </h2>
        <p className="text-red-500 text-sm">{error}</p>
      </div>
    );
  }

  return (
    <div className="relative">
      <div className="p-4 bg-white/60 backdrop-blur-md rounded-2xl shadow-lg border border-gray-200">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
            🌿 Today's SmartBuddy Tips
          </h2>
          {!loading && (
            <button
              onClick={handleRefresh}
              disabled={cached}
              className={`text-sm px-3 py-1 rounded-lg transition-all ${
                cached
                  ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                  : 'bg-purple-500 text-white hover:bg-purple-600 active:scale-95'
              }`}
            >
              🔁 Refresh Tips
            </button>
          )}
        </div>

        {/* Cached Badge */}
        {cached && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-3 inline-block"
          >
            <span className="text-xs text-purple-600 bg-purple-50 px-2 py-1 rounded-full border border-purple-200">
              🧠 AI saved from today
            </span>
          </motion.div>
        )}

        {/* Tips Container */}
        <div className="space-y-2">
          <AnimatePresence>
            {tips.map((tip, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                transition={{ 
                  delay: index * 0.1,
                  duration: 0.3,
                  ease: "easeOut"
                }}
                className="bg-gradient-to-r from-green-500 to-purple-500 text-white rounded-xl p-3 shadow-sm hover:scale-[1.02] transition-transform cursor-default"
              >
                <div className="flex items-start gap-2">
                  <span className="text-lg flex-shrink-0">
                    {tipEmojis[index % tipEmojis.length]}
                  </span>
                  <p className="text-sm leading-relaxed flex-1">
                    {tip}
                  </p>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>

        {/* Empty State */}
        {!loading && tips.length === 0 && (
          <p className="text-gray-500 text-sm text-center py-4">
            No tips available at the moment. Check back later!
          </p>
        )}
      </div>

      {/* XP Popup Toast */}
      <AnimatePresence>
        {showXPPopup && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            transition={{ duration: 0.3 }}
            className="fixed bottom-6 left-1/2 transform -translate-x-1/2 z-50"
          >
            <div className="bg-emerald-600 text-white rounded-lg px-4 py-3 shadow-md flex items-center gap-2">
              <span className="text-lg">🌿</span>
              <span className="font-semibold">+5 XP gained!</span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default TipsSection;

