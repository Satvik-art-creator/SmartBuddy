import React, { useState } from 'react';
import api from '../api/axios';
import AboutMeModal from './AboutMeModal';
import { toastError, toastSuccess, toastInfo } from '../utils/toast';

const Profile = ({ user, setUser }) => {
  const [editing, setEditing] = useState(false);
  const [showAboutModal, setShowAboutModal] = useState(false);
  const [formData, setFormData] = useState({
    skills: user?.skills || [],
    interests: user?.interests || [],
    about: user?.about || ''
  });

  // Keep local form state in sync when the user prop updates (e.g., after save or fresh load)
  React.useEffect(() => {
    setFormData({
      skills: user?.skills || [],
      interests: user?.interests || [],
      about: user?.about || ''
    });
  }, [user]);

  // Show onboarding modal once after registration
  React.useEffect(() => {
    try {
      const shouldPrompt = localStorage.getItem('aboutPrompt') === '1' && (!user?.about || user.about.trim().length === 0);
      if (shouldPrompt) {
        setShowAboutModal(true);
        localStorage.removeItem('aboutPrompt');
      }
    } catch {}
  }, []);

  const handleSkillAdd = (e) => {
    if (e.key === 'Enter' && e.target.value.trim()) {
      setFormData({
        ...formData,
        skills: [...formData.skills, e.target.value.trim()]
      });
      e.target.value = '';
    }
  };

  const handleInterestAdd = (e) => {
    if (e.key === 'Enter' && e.target.value.trim()) {
      setFormData({
        ...formData,
        interests: [...formData.interests, e.target.value.trim()]
      });
      e.target.value = '';
    }
  };

  const handleRemoveSkill = (index) => {
    setFormData({
      ...formData,
      skills: formData.skills.filter((_, i) => i !== index)
    });
  };

  const handleRemoveInterest = (index) => {
    setFormData({
      ...formData,
      interests: formData.interests.filter((_, i) => i !== index)
    });
  };

  const handleSave = async () => {
    if (!formData.about || formData.about.trim().length < 10) {
      toastError('Please add an About Me (at least 10 characters).');
      return;
    }
    try {
      const token = localStorage.getItem('token');
      const { data } = await api.put('/api/auth/profile', formData, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const updated = {
        ...user,
        ...(data?.user || {}),
        // Ensure about never gets lost if backend omits it for any reason
        about: (data?.user && data.user.about !== undefined) ? data.user.about : formData.about
      };
      setUser(updated);
      setFormData({
        skills: updated.skills || [],
        interests: updated.interests || [],
        about: updated.about || ''
      });
      localStorage.setItem('user', JSON.stringify(updated));
      setEditing(false);
      toastSuccess('Profile updated successfully!');
    } catch (err) {
      console.error('Failed to update profile', err);
      toastError(err?.response?.data?.message || 'Failed to update profile');
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <AboutMeModal
        isOpen={showAboutModal}
        initialAbout={formData.about}
        onClose={() => setShowAboutModal(false)}
        onSave={async (aboutValue) => {
          // Save via same endpoint, then close modal
          try {
            const token = localStorage.getItem('token');
            const { data } = await api.put('/api/auth/profile', { ...formData, about: aboutValue }, {
              headers: { Authorization: `Bearer ${token}` }
            });
            const updated = {
              ...user,
              ...(data?.user || {}),
              about: (data?.user && data.user.about !== undefined) ? data.user.about : aboutValue
            };
            setUser(updated);
            setFormData({ skills: updated.skills || [], interests: updated.interests || [], about: updated.about || '' });
            localStorage.setItem('user', JSON.stringify(updated));
            setShowAboutModal(false);
          } catch (e) {
            console.error('Failed to save About Me from modal', e);
          }
        }}
      />
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-white mb-2">
          👤 Your Profile
        </h1>
        <p className="text-white/80 text-lg">
          Manage your information and preferences
        </p>
      </div>

      <div className="bg-white rounded-2xl shadow-xl p-8">
        {/* User Info */}
        <div className="border-b border-gray-200 pb-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-3xl font-bold text-gray-800">{user?.name}</h2>
            <button
              onClick={() => setEditing(!editing)}
              className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
            >
              {editing ? 'Cancel' : 'Edit Profile'}
            </button>
          </div>
          <p className="text-gray-600">{user?.email}</p>
        </div>

        {/* SmartBuddy XP Display */}
        <div className="bg-gradient-to-r from-purple-600 to-blue-600 rounded-lg p-6 text-white mb-6">
          <div className="text-sm opacity-90 mb-2">Your SmartBuddy XP</div>
          <div className="text-4xl font-bold mb-2">{user?.xp || 0} XP</div>
          <div className="text-sm opacity-90">🌟 Keep collaborating to level up!</div>
        </div>

        {/* Skills */}
        <div className="mb-6">
          <h3 className="text-xl font-semibold text-gray-800 mb-4">Skills</h3>
          {editing ? (
            <div>
              <input
                type="text"
                placeholder="Add a skill and press Enter"
                onKeyDown={handleSkillAdd}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg mb-3"
              />
              <div className="flex flex-wrap gap-2">
                {formData.skills.map((skill, idx) => (
                  <span
                    key={idx}
                    className="bg-purple-100 text-purple-700 px-4 py-2 rounded-full flex items-center gap-2"
                  >
                    {skill}
                    <button
                      onClick={() => handleRemoveSkill(idx)}
                      className="text-purple-700 hover:text-purple-900"
                    >
                      ×
                    </button>
                  </span>
                ))}
              </div>
            </div>
          ) : (
            <div className="flex flex-wrap gap-2">
              {user?.skills?.map((skill, idx) => (
                <span
                  key={idx}
                  className="bg-purple-100 text-purple-700 px-4 py-2 rounded-full"
                >
                  {skill}
                </span>
              ))}
              {(!user?.skills || user.skills.length === 0) && (
                <p className="text-gray-500">No skills added yet</p>
              )}
            </div>
          )}
        </div>

        {/* Interests */}
        <div className="mb-6">
          <h3 className="text-xl font-semibold text-gray-800 mb-4">Interests</h3>
          {editing ? (
            <div>
              <input
                type="text"
                placeholder="Add an interest and press Enter"
                onKeyDown={handleInterestAdd}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg mb-3"
              />
              <div className="flex flex-wrap gap-2">
                {formData.interests.map((interest, idx) => (
                  <span
                    key={idx}
                    className="bg-blue-100 text-blue-700 px-4 py-2 rounded-full flex items-center gap-2"
                  >
                    {interest}
                    <button
                      onClick={() => handleRemoveInterest(idx)}
                      className="text-blue-700 hover:text-blue-900"
                    >
                      ×
                    </button>
                  </span>
                ))}
              </div>
            </div>
          ) : (
            <div className="flex flex-wrap gap-2">
              {user?.interests?.map((interest, idx) => (
                <span
                  key={idx}
                  className="bg-blue-100 text-blue-700 px-4 py-2 rounded-full"
                >
                  {interest}
                </span>
              ))}
              {(!user?.interests || user.interests.length === 0) && (
                <p className="text-gray-500">No interests added yet</p>
              )}
            </div>
          )}
        </div>

        {/* About Me */}
        <div className="mb-6">
          <h3 className="text-xl font-semibold text-gray-800 mb-4">About Me</h3>
          {editing ? (
            <div>
              <textarea
                value={formData.about}
                onChange={(e) => setFormData({ ...formData, about: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg min-h-[120px]"
                placeholder="Tell others about yourself (required)"
                required
              />
              <div className="text-xs text-gray-500 mt-1">Minimum 10 characters.</div>
            </div>
          ) : (
            <div className="text-gray-700 whitespace-pre-wrap">
              {formData.about && formData.about.trim().length > 0 ? formData.about : <span className="text-gray-400">No About Me yet</span>}
            </div>
          )}
        </div>

        {editing && (
          <button
            onClick={handleSave}
            className="w-full bg-gradient-to-r from-purple-600 to-blue-600 text-white py-3 rounded-lg font-semibold hover:from-purple-700 hover:to-blue-700 transition-all"
          >
            Save Changes
          </button>
        )}
      </div>
    </div>
  );
};

export default Profile;

