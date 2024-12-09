import { Link, useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';

export default function Navbar() {
  const [user, setUser] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
    navigate('/login');
  };

  return (
    <nav className="bg-white shadow-lg">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex justify-between h-16">
          <div className="flex">
            <div className="flex-shrink-0 flex items-center">
              <Link to="/" className="text-xl font-bold text-indigo-600">
                Event Booking
              </Link>
            </div>
            <div className="hidden sm:ml-6 sm:flex sm:space-x-8">
              <Link
                to="/events"
                className="inline-flex items-center px-1 pt-1 text-sm font-medium text-gray-900"
              >
                Events
              </Link>
              {user && (
                <Link
                  to="/bookings"
                  className="inline-flex items-center px-1 pt-1 text-sm font-medium text-gray-900"
                >
                  My Bookings
                </Link>
              )}
              {user?.role === 'ADMIN' && (
                <Link
                  to="/admin"
                  className="inline-flex items-center px-1 pt-1 text-sm font-medium text-gray-900"
                >
                  Admin
                </Link>
              )}
            </div>
          </div>
          <div className="hidden sm:ml-6 sm:flex sm:items-center">
            {user ? (
              <div className="flex items-center space-x-4">
                <span className="text-sm text-gray-700">Welcome, {user.name}</span>
                <button
                  onClick={handleLogout}
                  className="text-sm font-medium text-indigo-600 hover:text-indigo-500"
                >
                  Logout
                </button>
              </div>
            ) : (
              <div className="space-x-4">
                <Link
                  to="/login"
                  className="text-sm font-medium text-indigo-600 hover:text-indigo-500"
                >
                  Login
                </Link>
                <Link
                  to="/register"
                  className="text-sm font-medium text-gray-700 hover:text-gray-500"
                >
                  Register
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
