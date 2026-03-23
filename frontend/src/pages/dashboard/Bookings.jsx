import { useState, useEffect } from 'react';
import { bookingsAPI } from '../../api';
import { Calendar, MapPin, XCircle, ChevronLeft, ChevronRight } from 'lucide-react';
import { format } from 'date-fns';
import toast from 'react-hot-toast';

const Bookings = () => {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [cancelling, setCancelling] = useState(null);

  const fetchBookings = async () => {
    try {
      const { data } = await bookingsAPI.getMyBookings();
      setBookings(data.bookings);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBookings();
  }, []);

  const handleCancel = async (id) => {
    if (!window.confirm('Are you sure you want to cancel this booking?')) return;
    setCancelling(id);
    try {
      await bookingsAPI.cancel(id);
      toast.success('Booking cancelled');
      fetchBookings();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to cancel booking');
    } finally {
      setCancelling(null);
    }
  };

  const getStatusBadge = (status) => {
    const map = {
      pending: 'badge-pending',
      active: 'bg-yellow-100 text-yellow-700 px-2.5 py-0.5 rounded-full text-xs font-semibold',
      completed: 'badge-completed',
      cancelled: 'badge-cancelled',
    };
    return map[status] || 'badge-pending';
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-green-500" />
      </div>
    );
  }

  return (
    <div className="dark:bg-gray-900 min-h-screen py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">My Bookings</h1>

        {bookings.length === 0 ? (
          <div className="card text-center py-12">
            <Calendar className="w-12 h-12 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
              No bookings yet
            </h3>
            <p className="text-gray-500 dark:text-gray-400 text-sm mb-4">
              Book a charging slot to get started
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {bookings.map((booking) => (
              <div key={booking._id} className="card">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <h3 className="font-semibold text-gray-900 dark:text-white">
                        {booking.station?.name || 'Station'}
                      </h3>
                      <span className={getStatusBadge(booking.status)}>{booking.status}</span>
                    </div>
                    <div className="flex items-center gap-1 text-sm text-gray-500 dark:text-gray-400 mb-1">
                      <MapPin className="w-3.5 h-3.5" />
                      {booking.station?.address?.city}
                    </div>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-3 text-xs text-gray-500 dark:text-gray-400">
                      <div>
                        <p className="text-gray-400">Slot</p>
                        <p className="font-medium text-gray-700 dark:text-gray-200">{booking.slotNumber}</p>
                      </div>
                      <div>
                        <p className="text-gray-400">Vehicle</p>
                        <p className="font-medium text-gray-700 dark:text-gray-200">{booking.vehicleType}</p>
                      </div>
                      <div>
                        <p className="text-gray-400">Start</p>
                        <p className="font-medium text-gray-700 dark:text-gray-200">
                          {format(new Date(booking.scheduledStart), 'MMM dd, HH:mm')}
                        </p>
                      </div>
                      <div>
                        <p className="text-gray-400">End</p>
                        <p className="font-medium text-gray-700 dark:text-gray-200">
                          {format(new Date(booking.scheduledEnd), 'MMM dd, HH:mm')}
                        </p>
                      </div>
                    </div>
                  </div>

                  {(booking.status === 'pending' || booking.status === 'active') && (
                    <button
                      onClick={() => handleCancel(booking._id)}
                      disabled={cancelling === booking._id}
                      className="btn-danger text-sm py-2 px-4 flex items-center gap-1.5 whitespace-nowrap"
                    >
                      <XCircle className="w-4 h-4" />
                      {cancelling === booking._id ? 'Cancelling...' : 'Cancel'}
                    </button>
                  )}
                </div>

                {booking.energyConsumed > 0 && (
                  <div className="mt-4 pt-4 border-t border-gray-100 dark:border-gray-700 flex items-center gap-4 text-sm">
                    <span className="text-gray-500 dark:text-gray-400">
                      Energy: <strong className="text-green-600">{booking.energyConsumed} kWh</strong>
                    </span>
                    <span className="text-gray-500 dark:text-gray-400">
                      Est. Cost: <strong className="text-blue-600">₹{booking.estimatedCost}</strong>
                    </span>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Bookings;
