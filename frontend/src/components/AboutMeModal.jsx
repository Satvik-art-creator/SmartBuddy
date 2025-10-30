import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export default function AboutMeModal({ isOpen, initialAbout = '', onSave, onClose }) {
  const [about, setAbout] = useState(initialAbout || '');

  React.useEffect(() => {
    setAbout(initialAbout || '');
  }, [initialAbout]);

  const minChars = 10;
  const remaining = Math.max(0, minChars - (about?.trim().length || 0));
  const canSave = (about?.trim().length || 0) >= minChars;

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <motion.div
            className="w-full max-w-xl mx-4 rounded-2xl overflow-hidden shadow-2xl"
            initial={{ scale: 0.95, y: 10, opacity: 0 }}
            animate={{ scale: 1, y: 0, opacity: 1 }}
            exit={{ scale: 0.95, y: 10, opacity: 0 }}
            transition={{ duration: 0.2 }}
          >
            <div className="bg-gradient-to-r from-emerald-500 to-purple-600 p-5 text-white">
              <div className="text-lg font-semibold">Welcome to SmartBuddy 🎉</div>
              <div className="text-sm opacity-90">Tell others a bit about yourself to get better matches.</div>
            </div>
            <div className="bg-white p-5">
              <label className="block text-sm font-medium text-gray-700 mb-2">About Me <span className="text-red-500">*</span></label>
              <textarea
                value={about}
                onChange={(e) => setAbout(e.target.value)}
                className="w-full border border-gray-300 rounded-xl p-3 min-h-[140px] focus:outline-none focus:ring-2 focus:ring-emerald-400"
                placeholder="Your background, interests, goals..."
              />
              <div className="mt-2 flex items-center justify-between text-xs text-gray-500">
                <div>
                  <span className={`${canSave ? 'text-emerald-600' : 'text-gray-500'}`}>{about.trim().length}</span> characters
                  {!canSave && <span> • {remaining} more to enable save</span>}
                </div>
                <div className="hidden md:block">Tips: include skills, interests, what you’d like to learn/collaborate on.</div>
              </div>
              <div className="mt-4 flex gap-2 justify-end">
                <button
                  onClick={onClose}
                  className="px-4 py-2 rounded-full border border-gray-300 text-gray-700 hover:bg-gray-50"
                >
                  Later
                </button>
                <button
                  onClick={() => canSave && onSave(about)}
                  disabled={!canSave}
                  className={`px-4 py-2 rounded-full text-white bg-gradient-to-r from-emerald-500 to-purple-600 disabled:opacity-50`}
                >
                  Save & Continue
                </button>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}


