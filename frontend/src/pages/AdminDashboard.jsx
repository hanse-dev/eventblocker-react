import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

const API_URL = 'http://localhost:3000';

export default function AdminDashboard() {
  const [events, setEvents] = useState([]);
  const [users, setUsers] = useState([]);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [registrations, setRegistrations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();
  const { t } = useTranslation();

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem('user'));
    if (!user || user.role !== 'ADMIN') {
      navigate('/login');
      return;
    }

    const fetchData = async () => {
      try {
        const token = localStorage.getItem('token');
        const headers = {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        };

        // Fetch events
        const eventsResponse = await fetch(`${API_URL}/api/events`, {
          headers
        });
        const eventsData = await eventsResponse.json();

        // Fetch users
        const usersResponse = await fetch(`${API_URL}/api/users`, {
          headers
        });
        const usersData = await usersResponse.json();

        setEvents(eventsData);
        setUsers(usersData);
        setLoading(false);
      } catch (err) {
        setError('Failed to fetch data');
        setLoading(false);
      }
    };

    fetchData();
  }, [navigate]);

  const fetchRegistrations = async (eventId) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_URL}/api/events/${eventId}/registrations`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to fetch registrations');
      }

      setSelectedEvent(data.event);
      setRegistrations(data.registrations);
    } catch (err) {
      setError(err.message);
    }
  };

  const handleViewRegistrations = (eventId) => {
    if (selectedEvent?.id === eventId) {
      setSelectedEvent(null);
      setRegistrations([]);
    } else {
      fetchRegistrations(eventId);
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

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 py-8">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center">{t('Loading...')}</div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-100 py-8">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center text-red-600">{error}</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 py-8">
      <div className="max-w-7xl mx-auto px-4">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">{t('Admin Dashboard')}</h1>

        {/* Events Section */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
          <h2 className="text-2xl font-semibold text-gray-900 mb-4">{t('Events')}</h2>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{t('Title')}</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{t('Date')}</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{t('Location')}</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{t('Capacity')}</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{t('Actions')}</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {events.map((event) => (
                  <React.Fragment key={event.id}>
                    <tr>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{event.title}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {formatDate(event.date)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{event.location}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {event.totalRegistrations} / {event.capacity}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-4">
                        <button
                          onClick={() => navigate(`/events/${event.id}`)}
                          className="text-indigo-600 hover:text-indigo-900"
                        >
                          {t('View')}
                        </button>
                        <button
                          onClick={() => navigate(`/events/${event.id}/edit`)}
                          className="text-indigo-600 hover:text-indigo-900"
                        >
                          {t('Edit')}
                        </button>
                        <button
                          onClick={() => handleViewRegistrations(event.id)}
                          className="text-indigo-600 hover:text-indigo-900"
                        >
                          {selectedEvent?.id === event.id ? t('Hide Registrations') : t('View Registrations')}
                        </button>
                      </td>
                    </tr>
                    {selectedEvent?.id === event.id && (
                      <tr>
                        <td colSpan="5" className="px-6 py-4">
                          <div className="bg-gray-50 rounded-lg p-4">
                            <h3 className="text-lg font-medium text-gray-900 mb-4">
                              {t('Registrations for')} {selectedEvent.title}
                            </h3>
                            {registrations.length === 0 ? (
                              <p className="text-gray-500">{t('No registrations yet')}</p>
                            ) : (
                              <div className="overflow-x-auto">
                                <table className="min-w-full divide-y divide-gray-200">
                                  <thead className="bg-white">
                                    <tr>
                                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{t('Name')}</th>
                                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{t('Email')}</th>
                                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{t('Type')}</th>
                                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{t('Registered At')}</th>
                                    </tr>
                                  </thead>
                                  <tbody className="bg-white divide-y divide-gray-200">
                                    {registrations.map((registration) => (
                                      <tr key={`${registration.id}-${registration.email}`}>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{registration.name}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{registration.email}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                          <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                                            registration.type === 'User' ? 'bg-green-100 text-green-800' : 'bg-blue-100 text-blue-800'
                                          }`}>
                                            {t(registration.type)}
                                          </span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                          {formatDate(registration.registeredAt)}
                                        </td>
                                      </tr>
                                    ))}
                                  </tbody>
                                </table>
                              </div>
                            )}
                          </div>
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Users Section */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <h2 className="text-2xl font-semibold text-gray-900 mb-4">{t('Users')}</h2>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{t('Name')}</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{t('Email')}</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{t('Role')}</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{t('Actions')}</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {users.map((user) => (
                  <tr key={user.id}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{user.name}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{user.email}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{user.role}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <button
                        onClick={() => navigate(`/users/${user.id}`)}
                        className="text-indigo-600 hover:text-indigo-900"
                      >
                        {t('View Details')}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
