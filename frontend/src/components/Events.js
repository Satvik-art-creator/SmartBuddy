import React, { useState, useEffect } from 'react';
import api from '../api/axios';

const Events = ({ user, setUser }) => {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchEvents();
  }, []);

  const fetchEvents = async () => {
    try {
      const response = await api.get('/api/events');
      setEvents(response.data);
    } catch (error) {
      console.error('Error fetching events:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleJoinEvent = async (eventId) => {
    try {
      const response = await api.post('/api/events/join', { eventId });
      alert(`Event joined! You earned +20 XP! 🎉\nYour total XP: ${response.data.xp}`);
      
      // Update user XP if setUser is available
      if (setUser) {
        setUser(prevUser => ({
          ...prevUser,
          xp: response.data.xp
        }));
        
        // Update localStorage
        const updatedUser = { ...user, xp: response.data.xp };
        localStorage.setItem('user', JSON.stringify(updatedUser));
      }
    } catch (error) {
      console.error('Error joining event:', error);
      alert(error.response?.data?.message || 'Error joining event');
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
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-white mb-2">
          📅 Campus Events
        </h1>
        <p className="text-white/80 text-lg">
          Discover events tailored to your interests
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {events.length === 0 ? (
          <div className="col-span-full bg-white rounded-2xl shadow-xl p-8 text-center">
            <p className="text-gray-500 text-lg">No upcoming events at the moment.</p>
          </div>
        ) : (
          events.map((event) => (
            <div
              key={event._id}
              className="bg-white rounded-2xl shadow-xl overflow-hidden hover:shadow-2xl transition-shadow"
            >
              <div className="p-6">
                <div className="mb-4">
                  <span className="inline-block bg-gradient-to-r from-purple-600 to-blue-600 text-white px-3 py-1 rounded-full text-sm font-semibold">
                    {event.tags[0]}
                  </span>
                </div>
                <h3 className="text-2xl font-bold text-gray-800 mb-2">
                  {event.title}
                </h3>
                <p className="text-gray-600 mb-4">{event.description}</p>
                <div className="space-y-2 mb-6">
                  <div className="flex items-center text-gray-700">
                    <span className="font-semibold mr-2">📅 Date:</span>
                    <span>{event.date}</span>
                  </div>
                  <div className="flex items-center text-gray-700">
                    <span className="font-semibold mr-2">🕒 Time:</span>
                    <span>{event.time}</span>
                  </div>
                  <div className="flex items-center text-gray-700">
                    <span className="font-semibold mr-2">📍 Location:</span>
                    <span>{event.location}</span>
                  </div>
                </div>
                <button
                  onClick={() => handleJoinEvent(event._id)}
                  className="w-full bg-gradient-to-r from-purple-600 to-blue-600 text-white py-3 rounded-lg font-semibold hover:from-purple-700 hover:to-blue-700 transition-all"
                >
                  Join Event
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default Events;

