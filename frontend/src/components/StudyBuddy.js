import React, { useState, useEffect } from 'react';
import api from '../api/axios';
import ConnectButton from './ConnectButton';

const StudyBuddy = ({ user, setUser }) => {
  const [matches, setMatches] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchMatches();
  }, []);

  const fetchMatches = async () => {
    try {
      const response = await api.get('/api/match?limit=10');
      setMatches(response.data);
    } catch (error) {
      console.error('Error fetching matches:', error);
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
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-white mb-2">
          👥 Find Your Study Buddy
        </h1>
        <p className="text-white/80 text-lg">
          Connect with students who share your interests • {matches.length} matches found
        </p>
      </div>

      {matches.length === 0 ? (
        <div className="bg-white rounded-2xl shadow-xl p-8 text-center">
          <p className="text-gray-500 text-lg">No matches found at the moment.</p>
          <p className="text-gray-400 text-sm mt-2">
            Try updating your skills and interests in your profile!
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {matches.map((match) => (
            <div
              key={match.id}
              className="bg-white rounded-2xl shadow-xl p-6 hover:shadow-2xl transition-all"
            >
              {/* Match Score Badge */}
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="text-2xl font-bold text-gray-800">{match.name}</h3>
                </div>
                <span className="bg-gradient-to-r from-purple-600 to-blue-600 text-white px-3 py-1 rounded-full text-sm font-semibold">
                  {match.score || match.matchScore}% match
                </span>
              </div>

              {/* Branch and Year Info */}
              {(match.branch || match.year) && (
                <div className="mb-4">
                  <div className="flex gap-2 text-sm text-gray-600">
                    {match.branch && (
                      <span className="bg-green-100 text-green-700 px-2 py-1 rounded">Branch: {match.branch}</span>
                    )}
                    {match.year && (
                      <span className="bg-orange-100 text-orange-700 px-2 py-1 rounded">Year: {match.year}</span>
                    )}
                  </div>
                </div>
              )}

              {/* Availability */}
              {match.availability && match.availability.length > 0 && (
                <div className="mb-4">
                  <h4 className="font-semibold text-gray-700 mb-2">Available:</h4>
                  <div className="flex flex-wrap gap-2">
                    {match.availability.slice(0, 3).map((avail, idx) => (
                      <span
                        key={idx}
                        className="bg-yellow-100 text-yellow-700 px-2 py-1 rounded-full text-xs"
                      >
                        {avail}
                      </span>
                    ))}
                    {match.availability.length > 3 && (
                      <span className="text-gray-400 text-xs">+{match.availability.length - 3} more</span>
                    )}
                  </div>
                </div>
              )}

              {/* Shared Skills */}
              {match.sharedSkills.length > 0 && (
                <div className="mb-4">
                  <h4 className="font-semibold text-gray-700 mb-2">Shared Skills:</h4>
                  <div className="flex flex-wrap gap-2">
                    {match.sharedSkills.map((skill, idx) => (
                      <span
                        key={idx}
                        className="bg-purple-100 text-purple-700 px-3 py-1 rounded-full text-sm"
                      >
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Common Interests */}
              {match.sharedInterests.length > 0 && (
                <div className="mb-4">
                  <h4 className="font-semibold text-gray-700 mb-2">Common Interests:</h4>
                  <div className="flex flex-wrap gap-2">
                    {match.sharedInterests.map((interest, idx) => (
                      <span
                        key={idx}
                        className="bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-sm"
                      >
                        {interest}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* All Skills */}
              <div className="mb-4">
                <h4 className="font-semibold text-gray-700 mb-2">Their Skills:</h4>
                <div className="flex flex-wrap gap-2">
                  {match.skills.slice(0, 3).map((skill, idx) => (
                    <span
                      key={idx}
                      className="bg-gray-100 text-gray-700 px-3 py-1 rounded-full text-sm"
                    >
                      {skill}
                    </span>
                  ))}
                  {match.skills.length > 3 && (
                    <span className="text-gray-400 text-sm">+{match.skills.length - 3} more</span>
                  )}
                </div>
              </div>

              <ConnectButton targetUserId={match.id} targetName={match.name} />
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default StudyBuddy;

