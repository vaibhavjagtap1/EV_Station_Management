import { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import { Link } from 'react-router-dom';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { stationsAPI } from '../api';
import { MapPin, Zap, Star, Navigation } from 'lucide-react';

// Fix default marker icon
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

// Custom green icon for available stations
const availableIcon = new L.Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-green.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});

const occupiedIcon = new L.Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});

// Component to fly to user location
const FlyToLocation = ({ position }) => {
  const map = useMap();
  useEffect(() => {
    if (position) map.flyTo(position, 14);
  }, [position, map]);
  return null;
};

const MapView = () => {
  const [stations, setStations] = useState([]);
  const [userLocation, setUserLocation] = useState(null);
  const [locating, setLocating] = useState(false);
  const [loading, setLoading] = useState(true);
  const defaultCenter = [12.9716, 77.5946]; // Bangalore

  useEffect(() => {
    stationsAPI
      .getAll()
      .then(({ data }) => setStations(data.stations))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const handleLocate = () => {
    setLocating(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const { latitude, longitude } = pos.coords;
        setUserLocation([latitude, longitude]);
        setLocating(false);
      },
      () => {
        setLocating(false);
        alert('Unable to get your location. Please enable location access.');
      }
    );
  };

  return (
    <div className="dark:bg-gray-900 min-h-screen">
      {/* Header */}
      <div className="px-4 sm:px-6 lg:px-8 py-6 max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Station Map</h1>
            <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">
              {stations.length} stations across India
            </p>
          </div>
          <button
            onClick={handleLocate}
            disabled={locating}
            className="btn-primary flex items-center gap-2 text-sm"
          >
            <Navigation className="w-4 h-4" />
            {locating ? 'Locating...' : 'My Location'}
          </button>
        </div>

        {/* Legend */}
        <div className="flex gap-4 mb-4 text-sm">
          <div className="flex items-center gap-1.5">
            <div className="w-3 h-3 bg-green-500 rounded-full" />
            <span className="text-gray-500 dark:text-gray-400">Available</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-3 h-3 bg-red-500 rounded-full" />
            <span className="text-gray-500 dark:text-gray-400">Full / Unavailable</span>
          </div>
        </div>
      </div>

      {/* Map */}
      <div className="px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="h-[500px] rounded-xl overflow-hidden shadow-md border border-gray-200 dark:border-gray-700">
          {loading ? (
            <div className="h-full flex items-center justify-center bg-gray-100 dark:bg-gray-800">
              <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-green-500" />
            </div>
          ) : (
            <MapContainer center={defaultCenter} zoom={12} style={{ height: '100%', width: '100%' }}>
              <TileLayer
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
              />

              {userLocation && (
                <>
                  <FlyToLocation position={userLocation} />
                  <Marker position={userLocation}>
                    <Popup>
                      <strong>📍 Your Location</strong>
                    </Popup>
                  </Marker>
                </>
              )}

              {stations.map((station) => {
                const [lng, lat] = station.location.coordinates;
                const isAvailable = station.availableSlots > 0;
                return (
                  <Marker
                    key={station._id}
                    position={[lat, lng]}
                    icon={isAvailable ? availableIcon : occupiedIcon}
                  >
                    <Popup>
                      <div className="min-w-[200px]">
                        <h3 className="font-bold text-gray-900 mb-1">{station.name}</h3>
                        <p className="text-xs text-gray-500 mb-2 flex items-center gap-1">
                          <MapPin className="w-3 h-3" />
                          {station.address.street}, {station.address.city}
                        </p>
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-xs">
                            <Zap className="w-3 h-3 inline text-green-500" />
                            {' '}₹{station.pricePerUnit}/kWh
                          </span>
                          <span className="text-xs">
                            <Star className="w-3 h-3 inline text-yellow-500 fill-current" />
                            {' '}{station.rating.toFixed(1)}
                          </span>
                        </div>
                        <div className={`text-xs font-semibold mb-3 ${isAvailable ? 'text-green-600' : 'text-red-500'}`}>
                          {station.availableSlots}/{station.totalSlots} slots available
                        </div>
                        <a
                          href={`/stations/${station._id}`}
                          className="block text-center bg-green-500 text-white py-1.5 rounded text-xs font-semibold hover:bg-green-600"
                        >
                          Book Now →
                        </a>
                      </div>
                    </Popup>
                  </Marker>
                );
              })}
            </MapContainer>
          )}
        </div>
      </div>

      {/* Station list below map */}
      <div className="px-4 sm:px-6 lg:px-8 py-8 max-w-7xl mx-auto">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">All Stations</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {stations.map((station) => (
            <div key={station._id} className="card hover:shadow-md transition-shadow">
              <div className="flex items-start justify-between mb-2">
                <h3 className="font-semibold text-gray-900 dark:text-white text-sm">{station.name}</h3>
                <span className={station.availableSlots > 0 ? 'badge-available' : 'badge-occupied'}>
                  {station.availableSlots > 0 ? 'Open' : 'Full'}
                </span>
              </div>
              <p className="text-xs text-gray-500 dark:text-gray-400 mb-3 flex items-center gap-1">
                <MapPin className="w-3 h-3" />
                {station.address.city}, {station.address.state}
              </p>
              <div className="flex items-center justify-between">
                <span className="text-sm font-semibold text-green-600">₹{station.pricePerUnit}/kWh</span>
                <Link to={`/stations/${station._id}`} className="text-xs text-blue-500 hover:text-blue-600 font-medium">
                  View →
                </Link>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default MapView;
