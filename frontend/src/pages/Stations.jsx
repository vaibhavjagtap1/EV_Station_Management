import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { stationsAPI } from '../api';
import { MapPin, Zap, Star, Filter, Search, ChevronRight } from 'lucide-react';

const StationCard = ({ station }) => (
  <div className="card hover:shadow-md transition-shadow">
    <div className="flex items-start justify-between mb-3">
      <h3 className="font-semibold text-gray-900 dark:text-white">{station.name}</h3>
      <div className="flex items-center gap-1 text-yellow-500 text-sm">
        <Star className="w-4 h-4 fill-current" />
        <span>{station.rating.toFixed(1)}</span>
        <span className="text-gray-400 text-xs">({station.totalRatings})</span>
      </div>
    </div>

    <div className="flex items-center gap-1 text-gray-500 dark:text-gray-400 text-sm mb-3">
      <MapPin className="w-4 h-4" />
      {station.address.street}, {station.address.city}
    </div>

    <div className="flex flex-wrap gap-1.5 mb-4">
      {station.supportedVehicles.map((v) => (
        <span key={v} className="bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 text-xs px-2 py-0.5 rounded-full">
          {v}
        </span>
      ))}
    </div>

    <div className="flex flex-wrap gap-1 mb-4">
      {station.amenities?.slice(0, 3).map((a) => (
        <span key={a} className="text-xs text-gray-500 bg-gray-100 dark:bg-gray-700 dark:text-gray-400 px-2 py-0.5 rounded-full">
          {a}
        </span>
      ))}
    </div>

    <div className="flex items-center justify-between">
      <div className="text-left">
        <div className="text-xs text-gray-500 dark:text-gray-400">Slots Available</div>
        <div className="font-semibold text-gray-900 dark:text-white text-sm">
          {station.availableSlots} / {station.totalSlots}
        </div>
      </div>
      <div className="text-center">
        <div className="text-xs text-gray-500 dark:text-gray-400">Price</div>
        <div className="font-semibold text-green-600 dark:text-green-400 text-sm">
          ₹{station.pricePerUnit}/kWh
        </div>
      </div>
      <div>
        <span className={station.availableSlots > 0 ? 'badge-available' : 'badge-occupied'}>
          {station.availableSlots > 0 ? 'Available' : 'Full'}
        </span>
      </div>
    </div>

    <Link
      to={`/stations/${station._id}`}
      className="btn-primary w-full mt-4 text-sm py-2 flex items-center justify-center gap-1"
    >
      View & Book <ChevronRight className="w-4 h-4" />
    </Link>
  </div>
);

const Stations = () => {
  const [stations, setStations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [vehicleFilter, setVehicleFilter] = useState('');
  const [availableOnly, setAvailableOnly] = useState(false);

  const fetchStations = async () => {
    setLoading(true);
    try {
      const params = {};
      if (search) params.city = search;
      if (vehicleFilter) params.vehicleType = vehicleFilter;
      if (availableOnly) params.available = 'true';
      const { data } = await stationsAPI.getAll(params);
      setStations(data.stations);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStations();
    // Poll every 30 seconds for real-time availability
    const interval = setInterval(fetchStations, 30000);
    return () => clearInterval(interval);
  }, [search, vehicleFilter, availableOnly]);

  return (
    <div className="dark:bg-gray-900 min-h-screen py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Charging Stations</h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">
            Find and book EV charging slots near you
          </p>
        </div>

        {/* Filters */}
        <div className="card mb-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search by city..."
                className="input-field pl-10"
              />
            </div>

            <div className="flex items-center gap-2">
              <Filter className="w-4 h-4 text-gray-400" />
              <select
                value={vehicleFilter}
                onChange={(e) => setVehicleFilter(e.target.value)}
                className="input-field"
              >
                <option value="">All Vehicles</option>
                <option value="2W">2-Wheeler</option>
                <option value="3W">3-Wheeler</option>
                <option value="4W">4-Wheeler</option>
                <option value="HV">Heavy Vehicle</option>
              </select>
            </div>

            <label className="flex items-center gap-2 cursor-pointer whitespace-nowrap">
              <input
                type="checkbox"
                checked={availableOnly}
                onChange={(e) => setAvailableOnly(e.target.checked)}
                className="w-4 h-4 accent-green-500"
              />
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Available Only
              </span>
            </label>
          </div>
        </div>

        {/* Results */}
        <div className="flex items-center justify-between mb-4">
          <p className="text-sm text-gray-500 dark:text-gray-400">
            {loading ? 'Loading...' : `${stations.length} stations found`}
          </p>
          <div className="flex items-center gap-1 text-xs text-gray-400">
            <Zap className="w-3 h-3" />
            Live availability
          </div>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="card animate-pulse">
                <div className="h-5 bg-gray-200 dark:bg-gray-700 rounded w-3/4 mb-3" />
                <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-1/2 mb-4" />
                <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-full mb-2" />
                <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded mt-4" />
              </div>
            ))}
          </div>
        ) : stations.length === 0 ? (
          <div className="card text-center py-12">
            <MapPin className="w-12 h-12 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
              No stations found
            </h3>
            <p className="text-gray-500 dark:text-gray-400">Try adjusting your filters</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {stations.map((station) => (
              <StationCard key={station._id} station={station} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Stations;
