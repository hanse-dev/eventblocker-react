import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTranslation } from 'react-i18next';
import GuestRegistrationForm from '../components/GuestRegistrationForm';

const API_URL = 'http://localhost:3000';

export default function EventDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { isAuthenticated, user } = useAuth();
  const { t } = useTranslation();
  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [registrationSuccess, setRegistrationSuccess] = useState(false);
  const [showGuestForm, setShowGuestForm] = useState(false);
  const [isRegistered, setIsRegistered] = useState(false);

  useEffect(() => {
    fetchEventDetails();
    if (isAuthenticated) {
      checkRegistrationStatus();
    }
  }, [id]);

  const fetchEventDetails = async () => {
    try {
      const response = await fetch(`${API_URL}/api/events/${id}`);
      const data = await response.json();
      if (!response.ok) throw new Error(data.message);
      setEvent(data);
    } catch (error) {
      setError(t('Failed to load event details'));
    } finally {
      setLoading(false);
    }
  };

  const checkRegistrationStatus = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_URL}/api/events/${id}/registration-status`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      const data = await response.json();
      setIsRegistered(data.isRegistered);
    } catch (err) {
      console.error('Error checking registration status:', err);
    }
  };

  const handleRegister = async () => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_URL}/api/events/${id}/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.message);

      setRegistrationSuccess(true);
      setIsRegistered(true);
      fetchEventDetails(); // Refresh event details
    } catch (error) {
      setError(t('Registration failed. Please try again.'));
    }
  };

  const handleGuestRegistrationSuccess = () => {
    setShowGuestForm(false);
    setRegistrationSuccess(true);
    fetchEventDetails(); // Refresh event details
  };

  const handleCancelRegistration = async () => {
    if (!window.confirm(t('Are you sure you want to cancel your registration for this event?'))) {
      return;
    }

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_URL}/api/events/${id}/register`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.message);

      setIsRegistered(false);
      setRegistrationSuccess(false);
      fetchEventDetails(); // Refresh event details
    } catch (err) {
      setError(t('Failed to cancel registration. Please try again.'));
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('de-DE', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) return <div className="text-center py-8">{t('Loading...')}</div>;
  if (error) return <div className="text-center py-8 text-red-600">{error}</div>;
  if (!event) return <div className="text-center py-8">{t('Event not found')}</div>;

  const isEventFull = event.registrations >= event.capacity;

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-3xl mx-auto bg-white rounded-lg shadow-md overflow-hidden">
        <div className="p-6">
          <h1 className="text-3xl font-bold mb-4">{event.title}</h1>
          <div className="space-y-4">
            <p className="text-gray-700">{event.description}</p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <h2 className="text-xl font-semibold mb-2">{t('Event Details')}</h2>
                <div className="space-y-2">
                  <p><span className="font-medium">{t('Date')}:</span> {formatDate(event.date)}</p>
                  <p><span className="font-medium">{t('Location')}:</span> {event.location}</p>
                  <p><span className="font-medium">{t('Price')}:</span> {event.price}€</p>
                  <p>
                    <span className="font-medium">{t('Available Places')}:</span>{' '}
                    {event.capacity - event.registrations} / {event.capacity}
                  </p>
                </div>
              </div>
              <div>
                <h2 className="text-xl font-semibold mb-2">{t('Registration')}</h2>
                {registrationSuccess ? (
                  <div className="bg-green-100 text-green-700 p-3 rounded">
                    {t('Successfully registered for this event!')}
                  </div>
                ) : isRegistered ? (
                  <div className="bg-blue-100 text-blue-700 p-3 rounded">
                    {t('You are already registered for this event')}
                  </div>
                ) : isEventFull ? (
                  <div className="bg-red-100 text-red-700 p-3 rounded">
                    {t('This event is full')}
                  </div>
                ) : (
                  <div className="space-y-2">
                    {isAuthenticated ? (
                      <button
                        onClick={handleRegister}
                        className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
                        disabled={isEventFull || isRegistered}
                      >
                        {t('Register for Event')}
                      </button>
                    ) : (
                      <div>
                        <button
                          onClick={() => navigate('/login')}
                          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
                        >
                          {t('Login to Register')}
                        </button>
                        <div className="relative">
                          <div className="absolute inset-0 flex items-center">
                            <div className="w-full border-t border-gray-300"></div>
                          </div>
                          <div className="relative flex justify-center text-sm">
                            <span className="px-2 bg-white text-gray-500">{t('Or')}</span>
                          </div>
                        </div>
                        <button
                          onClick={() => setShowGuestForm(true)}
                          className="bg-gray-300 text-gray-700 px-4 py-2 rounded hover:bg-gray-400"
                        >
                          {t('Register as Guest')}
                        </button>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
          {showGuestForm && (
            <div className="mt-6">
              <GuestRegistrationForm
                eventId={id}
                onSuccess={handleGuestRegistrationSuccess}
                onCancel={() => setShowGuestForm(false)}
              />
            </div>
          )}
          {isRegistered && (
            <div className="mt-6">
              <button
                onClick={handleCancelRegistration}
                className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700"
              >
                {t('Cancel Registration')}
              </button>
            </div>
          )}
        </div>
      </div>
      <div className="mt-4 sm:mt-6">
        <button
          onClick={() => navigate('/events')}
          className="text-sm sm:text-base text-indigo-600 hover:text-indigo-500"
        >
          ← {t('Back to Events')}
        </button>
      </div>
    </div>
  );
}
