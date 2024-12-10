import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

const API_URL = 'http://localhost:3000';

export default function EventList() {
  const [events, setEvents] = useState([]);
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem('user') || '{}');
  const { t } = useTranslation();

  useEffect(() => {
    fetchEvents();
  }, []);

  const fetchEvents = async () => {
    try {
      const response = await fetch(`${API_URL}/api/events`);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || t('Failed to fetch events'));
      }

      setEvents(data);
    } catch (err) {
      setError(err.message);
    }
  };

  const formatDate = (dateString) => {
    const options = { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    };
    return new Date(dateString).toLocaleDateString('de-DE', options);
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="max-w-7xl mx-auto px-2 sm:px-4 py-4 sm:py-8">
        <div className="flex justify-between items-center mb-4 sm:mb-8">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">{t('Events')}</h1>
          {user.isAdmin && (
            <button
              onClick={() => navigate('/events/create')}
              className="px-3 sm:px-4 py-2 bg-indigo-600 text-white text-sm sm:text-base rounded-md hover:bg-indigo-700"
            >
              {t('Create Event')}
            </button>
          )}
        </div>

        {error && (
          <div className="bg-red-50 border border-red-400 text-red-700 px-3 py-2 rounded mb-4">
            {error}
          </div>
        )}

        <div className="grid gap-4 sm:gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
          {events.map((event) => (
            <Link
              key={event.id}
              to={`/events/${event.id}`}
              className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow duration-200"
            >
              <div className="p-4 sm:p-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-2">{event.title}</h2>
                <p className="text-gray-600 text-sm mb-3 line-clamp-2">{event.description}</p>
                <div className="space-y-2">
                  <p className="text-sm text-gray-600">
                    <span className="font-medium">{t('Date')}:</span> {formatDate(event.date)}
                  </p>
                  <p className="text-sm text-gray-600">
                    <span className="font-medium">{t('Location')}:</span> {event.location}
                  </p>
                  <p className="text-sm text-gray-600">
                    <span className="font-medium">{t('Price')}:</span> ${event.price}
                  </p>
                  <div className="mt-3 flex items-center">
                    {event.availablePlaces > 0 ? (
                      <span className="text-sm px-2 py-1 bg-green-100 text-green-800 rounded-full">
                        {event.availablePlaces} {event.availablePlaces === 1 ? t('place') : t('places')} available
                      </span>
                    ) : (
                      <span className="text-sm px-2 py-1 bg-red-100 text-red-800 rounded-full">
                        {t('Event Full')}
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-gray-600">
                    <span className="font-medium">{t('Capacity')}:</span> {event.capacity} people
                  </p>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
