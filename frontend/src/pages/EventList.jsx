import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

export default function EventList() {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchEvents();
  }, []);

  const fetchEvents = async () => {
    try {
      const response = await fetch('/api/events');
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Error loading events');
      }

      setEvents(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div 
          className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-500"
          role="status"
          aria-label="Loading"
        >
          <span className="sr-only">Loading...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-100 px-4 py-8">
        <div className="bg-red-50 border border-red-400 text-red-700 px-4 py-3 rounded">
          {error}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 px-4 py-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold text-gray-900">Events</h1>
          <Link
            to="/events/create"
            className="bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700"
          >
            Create Event
          </Link>
        </div>

        {events.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-500 text-lg">No events available</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {events.map((event) => (
              <div
                key={event.id}
                className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow"
              >
                <div className="p-6">
                  <h2 className="text-xl font-semibold text-gray-900 mb-2">{event.title}</h2>
                  <p className="text-gray-600 mb-4 line-clamp-2">{event.description}</p>
                  <div className="space-y-2">
                    <p className="text-sm text-gray-500">
                      <span className="font-medium">Date:</span>{' '}
                      {new Date(event.date).toLocaleDateString()}
                    </p>
                    <p className="text-sm text-gray-500">
                      <span className="font-medium">Location:</span> {event.location}
                    </p>
                    <p className="text-sm text-gray-500">
                      <span className="font-medium">Price:</span> ${event.price}
                    </p>
                    <p className="text-sm text-gray-500">
                      <span className="font-medium">Capacity:</span> {event.capacity}
                    </p>
                  </div>
                  <div className="mt-4">
                    <Link
                      to={`/events/${event.id}`}
                      className="text-indigo-600 hover:text-indigo-800 font-medium"
                    >
                      View Details →
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
