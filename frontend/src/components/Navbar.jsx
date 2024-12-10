import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTranslation } from 'react-i18next';

export default function Navbar() {
  const { isAuthenticated, user, logout } = useAuth();
  const navigate = useNavigate();
  const { t } = useTranslation();

  useEffect(() => {
    // Check authentication status whenever component mounts or localStorage changes
    const checkAuth = () => {
      const token = localStorage.getItem('token');
      const storedUser = localStorage.getItem('user');
      if (token && storedUser) {
        // setUser(JSON.parse(storedUser));
      } else {
        // setUser(null);
      }
    };

    checkAuth();

    // Add event listener for storage changes
    window.addEventListener('storage', checkAuth);
    
    return () => {
      window.removeEventListener('storage', checkAuth);
    };
  }, []);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <nav className="bg-gray-800 p-4">
      <div className="container mx-auto flex justify-between items-center">
        <div className="flex space-x-4">
          <Link to="/" className="text-white hover:text-gray-300">
            {t('Home')}
          </Link>
          <Link to="/events" className="text-white hover:text-gray-300">
            {t('Events')}
          </Link>
          {isAuthenticated && (
            <Link to="/my-events" className="text-white hover:text-gray-300">
              {t('My Events')}
            </Link>
          )}
        </div>
        <div className="flex space-x-4">
          {isAuthenticated ? (
            <>
              {user?.role === 'ADMIN' && (
                <Link to="/admin" className="text-white hover:text-gray-300">
                  {t('Admin Dashboard')}
                </Link>
              )}
              <span className="text-gray-300">{t('Welcome,')} {user.name}</span>
              <button
                onClick={handleLogout}
                className="text-white hover:text-gray-300"
              >
                {t('Logout')}
              </button>
            </>
          ) : (
            <>
              <Link to="/login" className="text-white hover:text-gray-300">
                {t('Login')}
              </Link>
              <Link to="/register" className="text-white hover:text-gray-300">
                {t('Register')}
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}
