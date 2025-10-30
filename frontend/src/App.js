import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Landing from './components/Landing';
import Login from './components/auth/Login';
import Register from './components/auth/Register';
import Dashboard from './components/Dashboard';
import Events from './components/Events';
import StudyBuddy from './components/StudyBuddy';
import Wellness from './components/Wellness';
import Profile from './components/Profile';
import Navbar from './components/Navbar';
import Chat from './pages/Chat';
import ToastContainer from './components/ToastContainer';
import Chats from './pages/Chats';

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('token');
    const userData = localStorage.getItem('user');
    
    if (token && userData) {
      setIsAuthenticated(true);
      setUser(JSON.parse(userData));
    }
    setLoading(false);
  }, []);

  const handleLogin = (token, userData) => {
    localStorage.setItem('token', token);
    localStorage.setItem('user', JSON.stringify(userData));
    setIsAuthenticated(true);
    setUser(userData);
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setIsAuthenticated(false);
    setUser(null);
  };

  const ProtectedRoute = ({ children }) => {
    return isAuthenticated ? children : <Navigate to="/" />;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-white text-2xl">Loading...</div>
      </div>
    );
  }

  return (
    <Router>
      <ToastContainer />
      <Routes>
        {/* Landing Page - Public */}
        <Route path="/" element={
          isAuthenticated ? <Navigate to="/dashboard" /> : <Landing />
        } />
        
        {/* Auth Routes - Public */}
        <Route path="/login" element={
          isAuthenticated ? <Navigate to="/dashboard" /> : <Login onLogin={handleLogin} />
        } />
        <Route path="/register" element={
          isAuthenticated ? <Navigate to="/dashboard" /> : <Register onLogin={handleLogin} />
        } />
        
        {/* Protected Routes - Require Authentication */}
        <Route path="/dashboard" element={
          <ProtectedRoute>
            <div className="min-h-screen bg-gradient-to-br from-purple-500 via-purple-600 to-blue-600">
              <Navbar user={user} onLogout={handleLogout} />
              <Dashboard user={user} setUser={setUser} />
            </div>
          </ProtectedRoute>
        } />
        <Route path="/events" element={
          <ProtectedRoute>
            <div className="min-h-screen bg-gradient-to-br from-purple-500 via-purple-600 to-blue-600">
              <Navbar user={user} onLogout={handleLogout} />
              <Events user={user} setUser={setUser} />
            </div>
          </ProtectedRoute>
        } />
        <Route path="/buddy" element={
          <ProtectedRoute>
            <div className="min-h-screen bg-gradient-to-br from-purple-500 via-purple-600 to-blue-600">
              <Navbar user={user} onLogout={handleLogout} />
              <StudyBuddy user={user} setUser={setUser} />
            </div>
          </ProtectedRoute>
        } />
        <Route path="/wellness" element={
          <ProtectedRoute>
            <div className="min-h-screen bg-gradient-to-br from-purple-500 via-purple-600 to-blue-600">
              <Navbar user={user} onLogout={handleLogout} />
              <Wellness user={user} setUser={setUser} />
            </div>
          </ProtectedRoute>
        } />
        <Route path="/chats" element={
          <ProtectedRoute>
            <div className="min-h-screen bg-gradient-to-br from-purple-500 via-purple-600 to-blue-600">
              <Navbar user={user} onLogout={handleLogout} />
              <Chats />
            </div>
          </ProtectedRoute>
        } />
        <Route path="/profile" element={
          <ProtectedRoute>
            <div className="min-h-screen bg-gradient-to-br from-purple-500 via-purple-600 to-blue-600">
              <Navbar user={user} onLogout={handleLogout} />
              <Profile user={user} setUser={setUser} />
            </div>
          </ProtectedRoute>
        } />
        <Route path="/chat/:conversationId" element={
          <ProtectedRoute>
            <div className="min-h-screen bg-gradient-to-br from-purple-500 via-purple-600 to-blue-600">
              <Navbar user={user} onLogout={handleLogout} />
              <Chat />
            </div>
          </ProtectedRoute>
        } />
      </Routes>
    </Router>
  );
}

export default App;

