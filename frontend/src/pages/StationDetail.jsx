import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { stationsAPI, bookingsAPI } from '../api';
import { useAuth } from '../context/AuthContext';
import { MapPin, Zap, Star, Clock, Car, ChevronLeft } from 'lucide-react';
import toast from 'react-hot-toast';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

// Fix default marker icon
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

const StationDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();

  const [station, setStation] = useState(null);
  const [loading, setLoading] = useState(true);
  const [booking, setBooking] = useState({
    slotId: '',
    vehicleType: '4W',
    vehicleNumber: '',
    scheduledStart: '',
    scheduledEnd: '',
  });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    stationsAPI
      .getById(id)
      .then(({ data }) => setStation(data.station))
      .catch(() => toast.error('Station not found'))
      .finally(() => setLoading(false));
  }, [id]);

  const getMinDateTime = () => {
    const now = new Date();
    now.setMinutes(now.getMinutes() + 5);
    return now.toISOString().slice(0, 16);
  };

  const handleBooking = async (e) => {
    e.preventDefault();
    if (!isAuthenticated) {
      toast.error('Please login to book a slot');
      navigate('/login');
      return;
    }

    const start = new Date(booking.scheduledStart);
    const end = new Date(booking.scheduledEnd);
    if (end <= start) {
      return toast.error('End time must be after start time');
    }

    setSubmitting(true);
    try {
      const { data } = await bookingsAPI.create({
        stationId: id,
        slotId: booking.slotId,
        vehicleType: booking.vehicleType,
        vehicleNumber: booking.vehicleNumber,
        scheduledStart: booking.scheduledStart,
        scheduledEnd: booking.scheduledEnd,
      });
      toast.success('Booking confirmed!');
      navigate(`/bookings/${data.booking._id}`);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Booking failed');
    } finally {
      setSubmitting(false);
    }
  };

  const getSlotBadge = (status) => {
    const map = {
      available: 'badge-available',
      occupied: 'badge-occupied',
      maintenance: 'badge-maintenance',
    };
    return map[status] || 'badge-pending';
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center dark:bg-gray-900">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-500" />
      </div>
    );
  }

  if (!station) {
    return (
      <div className="min-h-screen flex items-center justify-center dark:bg-gray-900">
        <div className="text-center">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2">Station not found</h2>
          <button onClick={() => navigate('/stations')} className="btn-primary">
            Back to Stations
          </button>
        </div>
      </div>
    );
  }

  const availableSlots = station.slots.filter((s) => s.status === 'available');
  const [lng, lat] = station.location.coordinates;

  return (
    <div className="dark:bg-gray-900 min-h-screen py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto">
        {/* Back button */}
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 text-sm mb-6"
        >
          <ChevronLeft className="w-4 h-4" />
          Back to Stations
        </button>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Station Info */}
          <div className="lg:col-span-2 space-y-6">
            {/* Header */}
            <div className="card">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{station.name}</h1>
                  <div className="flex items-center gap-2 mt-1">
                    <MapPin className="w-4 h-4 text-gray-400" />
                    <span className="text-gray-500 dark:text-gray-400 text-sm">
                      {station.address.street}, {station.address.city}, {station.address.state}
                    </span>
                  </div>
                </div>
                <div className="flex items-center gap-1 text-yellow-500">
                  <Star className="w-5 h-5 fill-current" />
                  <span className="font-semibold">{station.rating.toFixed(1)}</span>
                  <span className="text-gray-400 text-sm">({station.totalRatings})</span>
                </div>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                <div className="text-center p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
                  <div className="text-2xl font-bold text-green-600">{station.availableSlots}</div>
                  <div className="text-xs text-gray-500 mt-1">Available</div>
                </div>
                <div className="text-center p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                  <div className="text-2xl font-bold text-blue-600">{station.totalSlots}</div>
                  <div className="text-xs text-gray-500 mt-1">Total Slots</div>
                </div>
                <div className="text-center p-3 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
                  <div className="text-2xl font-bold text-purple-600">₹{station.pricePerUnit}</div>
                  <div className="text-xs text-gray-500 mt-1">Per kWh</div>
                </div>
                <div className="text-center p-3 bg-orange-50 dark:bg-orange-900/20 rounded-lg">
                  <div className="text-sm font-bold text-orange-600">
                    {station.operatingHours.is24Hours ? '24/7' : `${station.operatingHours.open} - ${station.operatingHours.close}`}
                  </div>
                  <div className="text-xs text-gray-500 mt-1">Hours</div>
                </div>
              </div>

              {/* Amenities */}
              {station.amenities?.length > 0 && (
                <div className="mt-4">
                  <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Amenities</p>
                  <div className="flex flex-wrap gap-2">
                    {station.amenities.map((a) => (
                      <span key={a} className="text-xs bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 px-2 py-1 rounded-full">
                        {a}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Slots */}
            <div className="card">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                Charging Slots
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {station.slots.map((slot) => (
                  <div
                    key={slot._id}
                    onClick={() => {
                      if (slot.status === 'available') {
                        setBooking((b) => ({ ...b, slotId: slot._id }));
                      }
                    }}
                    className={`p-3 rounded-lg border-2 transition-all cursor-pointer ${
                      booking.slotId === slot._id
                        ? 'border-green-500 bg-green-50 dark:bg-green-900/20'
                        : slot.status === 'available'
                        ? 'border-gray-200 dark:border-gray-700 hover:border-green-300'
                        : 'border-gray-100 dark:border-gray-800 opacity-60 cursor-not-allowed'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-semibold text-gray-900 dark:text-white text-sm">
                        Slot {slot.slotNumber}
                      </span>
                      <span className={getSlotBadge(slot.status)}>
                        {slot.status.charAt(0).toUpperCase() + slot.status.slice(1)}
                      </span>
                    </div>
                    <div className="flex items-center gap-4 text-xs text-gray-500 dark:text-gray-400">
                      <span className="flex items-center gap-1">
                        <Zap className="w-3 h-3" />
                        {slot.powerOutput} kW
                      </span>
                      <span>{slot.connectorType}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Map */}
            <div className="card">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Location</h2>
              <div className="h-56 rounded-xl overflow-hidden">
                <MapContainer center={[lat, lng]} zoom={15} style={{ height: '100%', width: '100%' }}>
                  <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
                  <Marker position={[lat, lng]}>
                    <Popup>{station.name}</Popup>
                  </Marker>
                </MapContainer>
              </div>
            </div>
          </div>

          {/* Booking Form */}
          <div className="lg:col-span-1">
            <div className="card sticky top-20">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                Book a Slot
              </h2>

              {availableSlots.length === 0 ? (
                <div className="text-center py-6">
                  <Clock className="w-10 h-10 text-gray-300 mx-auto mb-3" />
                  <p className="text-gray-500 dark:text-gray-400 text-sm">
                    No slots currently available. Check back soon!
                  </p>
                </div>
              ) : (
                <form onSubmit={handleBooking} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Select Slot *
                    </label>
                    <select
                      value={booking.slotId}
                      onChange={(e) => setBooking((b) => ({ ...b, slotId: e.target.value }))}
                      className="input-field"
                      required
                    >
                      <option value="">Select a slot</option>
                      {station.slots
                        .filter((s) => s.status === 'available')
                        .map((slot) => (
                          <option key={slot._id} value={slot._id}>
                            Slot {slot.slotNumber} ({slot.connectorType} - {slot.powerOutput}kW)
                          </option>
                        ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Vehicle Type *
                    </label>
                    <div className="relative">
                      <Car className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                      <select
                        value={booking.vehicleType}
                        onChange={(e) => setBooking((b) => ({ ...b, vehicleType: e.target.value }))}
                        className="input-field pl-10"
                        required
                      >
                        {station.supportedVehicles.map((v) => (
                          <option key={v} value={v}>
                            {v === '2W' ? '2-Wheeler' : v === '3W' ? '3-Wheeler' : v === '4W' ? '4-Wheeler' : 'Heavy Vehicle'}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Vehicle Number
                    </label>
                    <input
                      type="text"
                      value={booking.vehicleNumber}
                      onChange={(e) => setBooking((b) => ({ ...b, vehicleNumber: e.target.value }))}
                      className="input-field"
                      placeholder="KA 01 AB 1234"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Start Time *
                    </label>
                    <input
                      type="datetime-local"
                      value={booking.scheduledStart}
                      onChange={(e) => setBooking((b) => ({ ...b, scheduledStart: e.target.value }))}
                      className="input-field"
                      min={getMinDateTime()}
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      End Time *
                    </label>
                    <input
                      type="datetime-local"
                      value={booking.scheduledEnd}
                      onChange={(e) => setBooking((b) => ({ ...b, scheduledEnd: e.target.value }))}
                      className="input-field"
                      min={booking.scheduledStart || getMinDateTime()}
                      required
                    />
                  </div>

                  {/* Cost estimate */}
                  {booking.slotId && booking.scheduledStart && booking.scheduledEnd && (
                    <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-3">
                      <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Estimated Cost</p>
                      <p className="text-lg font-bold text-green-600">
                        ₹
                        {Math.round(
                          ((new Date(booking.scheduledEnd) - new Date(booking.scheduledStart)) /
                            (1000 * 60 * 60)) *
                            (station.slots.find((s) => s._id === booking.slotId)?.powerOutput || 7.2) *
                            station.pricePerUnit * 100
                        ) / 100}
                      </p>
                      <p className="text-xs text-gray-400 mt-0.5">
                        + 18% GST | Based on scheduled duration
                      </p>
                    </div>
                  )}

                  <button type="submit" className="btn-primary w-full" disabled={submitting}>
                    {submitting ? (
                      <span className="flex items-center justify-center gap-2">
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white" />
                        Booking...
                      </span>
                    ) : (
                      'Confirm Booking'
                    )}
                  </button>
                </form>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StationDetail;
