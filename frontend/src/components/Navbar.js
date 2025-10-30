import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import LogoutConfirmDialog from './LogoutConfirmDialog';
import NotificationsBell from './NotificationsBell';

const Navbar = ({ user, onLogout }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const [showLogoutDialog, setShowLogoutDialog] = useState(false);

  const handleLogoutClick = () => {
    setShowLogoutDialog(true);
  };

  const handleLogoutConfirm = () => {
    onLogout();
    setShowLogoutDialog(false);
    navigate('/');
  };

  const handleLogoutCancel = () => {
    setShowLogoutDialog(false);
  };

  const isActive = (path) => {
    return location.pathname === path;
  };

  return (
    <nav className="bg-white shadow-lg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center space-x-8">
            <Link to="/dashboard" className="flex-shrink-0">
              <h1 className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
                SmartBuddy
              </h1>
            </Link>

            <div className="hidden md:flex space-x-1">
              <NavLink to="/dashboard" active={isActive('/dashboard')}>
                🏠 Home
              </NavLink>
              <NavLink to="/events" active={isActive('/events')}>
                📅 Events
              </NavLink>
              <NavLink to="/buddy" active={isActive('/buddy')}>
                👥 Buddy
              </NavLink>
              <NavLink to="/wellness" active={isActive('/wellness')}>
                💚 Wellness
              </NavLink>
              <NavLink to="/chats" active={isActive('/chats')}>
                💬 Chats
              </NavLink>
              <NavLink to="/profile" active={isActive('/profile')}>
                👤 Profile
              </NavLink>
            </div>
          </div>

          <div className="flex items-center space-x-4">
            <NotificationsBell />
            <span className="text-sm text-gray-700 hidden sm:block">
              {user?.name}
            </span>
            <button
              onClick={handleLogoutClick}
              className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
            >
              Logout
            </button>
          </div>
        </div>

        {/* Logout Confirmation Dialog */}
        <LogoutConfirmDialog
          isOpen={showLogoutDialog}
          onClose={handleLogoutCancel}
          onConfirm={handleLogoutConfirm}
          userName={user?.name || 'User'}
        />

        {/* Mobile Bottom Navigation */}
        <div className="md:hidden flex justify-around border-t border-gray-200 py-2">
          <MobileNavLink to="/dashboard" active={isActive('/dashboard')}>
            🏠
          </MobileNavLink>
          <MobileNavLink to="/events" active={isActive('/events')}>
            📅
          </MobileNavLink>
          <MobileNavLink to="/buddy" active={isActive('/buddy')}>
            👥
          </MobileNavLink>
          <MobileNavLink to="/wellness" active={isActive('/wellness')}>
            💚
          </MobileNavLink>
          <MobileNavLink to="/profile" active={isActive('/profile')}>
            👤
          </MobileNavLink>
        </div>
      </div>
    </nav>
  );
};

const NavLink = ({ to, children, active }) => {
  return (
    <Link
      to={to}
      className={`px-3 py-2 rounded-md text-sm font-medium transition-all ${
        active
          ? 'bg-gradient-to-r from-purple-600 to-blue-600 text-white'
          : 'text-gray-700 hover:bg-purple-100'
      }`}
    >
      {children}
    </Link>
  );
};

// Unread badge removed per request

const MobileNavLink = ({ to, children, active }) => {
  return (
    <Link
      to={to}
      className={`flex-1 text-center py-2 rounded-lg transition-all ${
        active
          ? 'bg-gradient-to-r from-purple-600 to-blue-600 text-white'
          : 'text-gray-700'
      }`}
    >
      <span className="text-2xl">{children}</span>
    </Link>
  );
};

export default Navbar;

