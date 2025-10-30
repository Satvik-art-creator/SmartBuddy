import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export default function ProfilePreviewModal({ isOpen, profile, onAccept, onReject, onClose, loadingAction }) {
  if (!profile) return null;
  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
          <motion.div className="w-full max-w-2xl mx-4 rounded-2xl overflow-hidden shadow-2xl" initial={{ scale: 0.95, y: 10, opacity: 0 }} animate={{ scale: 1, y: 0, opacity: 1 }} exit={{ scale: 0.95, y: 10, opacity: 0 }}>
            <div className="bg-gradient-to-r from-emerald-500 to-purple-600 p-5 text-white">
              <div className="text-lg font-semibold">Connection Request from {profile.name}</div>
              <div className="text-xs opacity-90">Review their limited profile before accepting.</div>
            </div>
            <div className="bg-white p-5">
              <div className="flex items-center gap-4 mb-4">
                <div className="w-12 h-12 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold">
                  {(profile.name || 'U').slice(0,1).toUpperCase()}
                </div>
                <div className="text-sm text-gray-600">{profile.branch || 'N/A'} • {profile.year ? `Year ${profile.year}` : 'Year N/A'}</div>
                <div className="ml-auto text-sm font-medium">XP: {profile.xp || 0}</div>
              </div>
              <div className="mb-4">
                <div className="h-2 w-full bg-gray-100 rounded-full overflow-hidden">
                  <div className="h-full bg-gradient-to-r from-emerald-500 to-purple-500" style={{ width: `${Math.min(100, (profile.xp || 0) % 100)}%` }} />
                </div>
              </div>
              <div className="mb-4">
                <div className="text-sm font-semibold text-gray-800 mb-1">Bio</div>
                <div className="text-sm text-gray-700 whitespace-pre-wrap">{profile.about || 'No bio provided.'}</div>
              </div>
              <div className="mb-3">
                <div className="text-sm font-semibold text-gray-800 mb-1">Skills</div>
                <div className="flex flex-wrap gap-2">
                  {(profile.skills || []).map((s, i) => (
                    <span key={i} className="px-2 py-1 rounded-full bg-emerald-50 text-emerald-700 text-xs">{s}</span>
                  ))}
                  {(!profile.skills || profile.skills.length === 0) && <span className="text-xs text-gray-400">No skills listed</span>}
                </div>
              </div>
              <div className="mb-5">
                <div className="text-sm font-semibold text-gray-800 mb-1">Interests</div>
                <div className="flex flex-wrap gap-2">
                  {(profile.interests || []).map((s, i) => (
                    <span key={i} className="px-2 py-1 rounded-full bg-purple-50 text-purple-700 text-xs">{s}</span>
                  ))}
                  {(!profile.interests || profile.interests.length === 0) && <span className="text-xs text-gray-400">No interests listed</span>}
                </div>
              </div>
              <div className="flex justify-end gap-2">
                <button onClick={onClose} className="px-4 py-2 rounded-full border text-gray-700 hover:bg-gray-50">Close</button>
                <button disabled={loadingAction} onClick={onReject} className="px-4 py-2 rounded-full bg-gray-200 text-gray-800 hover:bg-gray-300 disabled:opacity-50">Reject ❌</button>
                <button disabled={loadingAction} onClick={onAccept} className="px-4 py-2 rounded-full text-white bg-gradient-to-r from-emerald-500 to-purple-600 disabled:opacity-50">Accept ✅</button>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}


