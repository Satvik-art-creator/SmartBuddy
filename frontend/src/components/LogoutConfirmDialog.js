import React, { useEffect } from 'react';

const LogoutConfirmDialog = ({ isOpen, onClose, onConfirm, userName }) => {
  // Close on Escape key
  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [isOpen, onClose]);

  // Prevent body scroll when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      onClick={onClose}
    >
      {/* Backdrop with fade-in animation */}
      <div 
        className="absolute inset-0 bg-gray-600 bg-opacity-75 transition-opacity duration-300"
        style={{ backgroundColor: '#4A4A4A' }}
      />
      
      {/* Dialog box with scale and fade animation */}
      <div
        className="relative bg-white rounded-3xl shadow-2xl p-8 max-w-md w-full mx-4 transform transition-all duration-300 animate-modal-in"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-500 hover:text-gray-700 transition-colors focus:outline-none"
          aria-label="Close"
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
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        </button>

        {/* Robot Avatar */}
        <div className="flex justify-center mb-6">
          <div className="w-32 h-32 rounded-full bg-gray-100 flex items-center justify-center overflow-hidden">
            {/* Robot SVG Icon - Vintage Style */}
            <svg
              className="w-24 h-24"
              viewBox="0 0 100 100"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              {/* Robot Head */}
              <rect
                x="20"
                y="20"
                width="60"
                height="60"
                rx="8"
                fill="#BFDBFE"
                stroke="#3B82F6"
                strokeWidth="2"
              />
              {/* Eyes */}
              <circle cx="35" cy="40" r="4" fill="#DC2626" />
              <circle cx="65" cy="40" r="4" fill="#DC2626" />
              {/* Mouth */}
              <rect
                x="40"
                y="55"
                width="20"
                height="4"
                rx="2"
                fill="#DC2626"
              />
              {/* Gears/Chest Details */}
              <circle cx="50" cy="50" r="8" fill="#93C5FD" stroke="#3B82F6" strokeWidth="1.5" />
              <circle cx="50" cy="50" r="4" fill="#3B82F6" />
              {/* Buttons */}
              <circle cx="30" cy="70" r="2" fill="#3B82F6" />
              <circle cx="50" cy="75" r="2" fill="#3B82F6" />
              <circle cx="70" cy="70" r="2" fill="#3B82F6" />
            </svg>
          </div>
        </div>

        {/* Main Question */}
        <h2 className="text-2xl font-bold text-gray-800 text-center mb-2">
          Leaving already, {userName || 'User'}?
        </h2>

        {/* Sub-message */}
        <p className="text-gray-500 text-center mb-8">
          We'll miss you! Come back soon.
        </p>

        {/* Buttons */}
        <div className="flex gap-4">
          {/* Cancel Button */}
          <button
            onClick={onClose}
            className="flex-1 px-6 py-3 bg-gray-100 text-gray-700 rounded-lg font-semibold hover:bg-gray-200 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-gray-300"
          >
            Cancel
          </button>

          {/* Logout Button */}
          <button
            onClick={onConfirm}
            className="flex-1 px-6 py-3 bg-purple-600 text-white rounded-lg font-semibold hover:bg-purple-700 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-purple-300 transform hover:scale-105 active:scale-95"
          >
            Logout
          </button>
        </div>
      </div>
    </div>
  );
};

export default LogoutConfirmDialog;

