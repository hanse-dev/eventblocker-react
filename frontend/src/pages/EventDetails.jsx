import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';

export default function EventDetails() {
  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [bookingStatus, setBookingStatus] = useState('');
  const { id } = useParams();
  const navigate = useNavigate();

  useEffect(() => {
    fetchEvent();
  }, [id]);

  const fetchEvent = async () => {
    try {
      const response = await fetch(`/api/events/${id}`);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Error loading event');
      }

      setEvent(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleBooking = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        navigate('/login');
        return;
      }

      const response = await fetch('/api/bookings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ eventId: id }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to book event');
      }

      setBookingStatus('Booking successful!');
      // Refresh event details to update capacity
      fetchEvent();
    } catch (err) {
      setBookingStatus(err.message);
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

  if (!event) {
    return (
      <div className="min-h-screen bg-gray-100 px-4 py-8">
        <div className="text-center">
          <p className="text-gray-500 text-lg">Event not found</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 px-4 py-8">
      <div className="max-w-3xl mx-auto bg-white rounded-lg shadow-md overflow-hidden">
        <div className="p-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">{event.title}</h1>
          
          {bookingStatus && (
            <div className={`mb-4 p-4 rounded ${
              bookingStatus.includes('successful') 
                ? 'bg-green-50 text-green-700 border border-green-400'
                : 'bg-red-50 text-red-700 border border-red-400'
            }`}>
              {bookingStatus}
            </div>
          )}

          <div className="prose max-w-none mb-6">
            <p>{event.description}</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            <div>
              <h2 className="text-lg font-semibold text-gray-900 mb-2">Event Details</h2>
              <div className="space-y-2">
                <p className="text-gray-600">
                  <span className="font-medium">Date:</span>{' '}
                  {new Date(event.date).toLocaleDateString()}
                </p>
                <p className="text-gray-600">
                  <span className="font-medium">Time:</span>{' '}
                  {new Date(event.date).toLocaleTimeString()}
                </p>
                <p className="text-gray-600">
                  <span className="font-medium">Location:</span> {event.location}
                </p>
                <p className="text-gray-600">
                  <span className="font-medium">Price:</span> ${event.price}
                </p>
              </div>
            </div>

            <div>
              <h2 className="text-lg font-semibold text-gray-900 mb-2">Capacity</h2>
              <div className="space-y-2">
                <p className="text-gray-600">
                  <span className="font-medium">Total Capacity:</span> {event.capacity}
                </p>
                <p className="text-gray-600">
                  <span className="font-medium">Bookings:</span> {event.bookings.length}
                </p>
                <p className="text-gray-600">
                  <span className="font-medium">Available:</span>{' '}
                  {event.capacity - event.bookings.length}
                </p>
              </div>
            </div>
          </div>

          <div className="flex justify-between items-center">
            <button
              onClick={() => navigate('/events')}
              className="text-gray-600 hover:text-gray-900 font-medium"
            >
              ← Back to Events
            </button>
            
            <button
              onClick={handleBooking}
              disabled={event.bookings.length >= event.capacity}
              className={`px-6 py-2 rounded-md font-medium ${
                event.bookings.length >= event.capacity
                  ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  : 'bg-indigo-600 text-white hover:bg-indigo-700'
              }`}
            >
              {event.bookings.length >= event.capacity ? 'Sold Out' : 'Book Now'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
