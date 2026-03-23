import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { stationsAPI } from '../api';
import { Zap, MapPin, Clock, Users, ChevronRight, Star, Shield, Leaf } from 'lucide-react';

const Home = () => {
  const [stations, setStations] = useState([]);
  const [loadingStations, setLoadingStations] = useState(true);

  useEffect(() => {
    stationsAPI
      .getAll({ available: 'true' })
      .then(({ data }) => setStations(data.stations.slice(0, 3)))
      .catch(() => {})
      .finally(() => setLoadingStations(false));
  }, []);

  const features = [
    {
      icon: <Zap className="w-6 h-6" />,
      title: 'Fast Charging',
      desc: 'DC fast chargers up to 150kW for quick top-ups on the go.',
      color: 'bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400',
    },
    {
      icon: <MapPin className="w-6 h-6" />,
      title: 'Wide Network',
      desc: '500+ stations across major cities. Find one near you instantly.',
      color: 'bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400',
    },
    {
      icon: <Clock className="w-6 h-6" />,
      title: '24/7 Available',
      desc: 'Round-the-clock charging access. Never run out of charge.',
      color: 'bg-purple-100 text-purple-600 dark:bg-purple-900/30 dark:text-purple-400',
    },
    {
      icon: <Shield className="w-6 h-6" />,
      title: 'Safe & Secure',
      desc: 'ISO certified stations with advanced safety mechanisms.',
      color: 'bg-orange-100 text-orange-600 dark:bg-orange-900/30 dark:text-orange-400',
    },
    {
      icon: <Leaf className="w-6 h-6" />,
      title: 'Green Energy',
      desc: '30% of our charging powered by renewable solar energy.',
      color: 'bg-teal-100 text-teal-600 dark:bg-teal-900/30 dark:text-teal-400',
    },
    {
      icon: <Users className="w-6 h-6" />,
      title: '10,000+ Users',
      desc: 'Join a growing community of EV drivers across India.',
      color: 'bg-pink-100 text-pink-600 dark:bg-pink-900/30 dark:text-pink-400',
    },
  ];

  const stats = [
    { label: 'Charging Stations', value: '500+' },
    { label: 'Cities Covered', value: '25+' },
    { label: 'Happy Users', value: '10K+' },
    { label: 'kWh Dispensed', value: '2M+' },
  ];

  return (
    <div className="dark:bg-gray-900">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-green-500 via-teal-500 to-blue-600 text-white overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-10 left-10 w-72 h-72 bg-white rounded-full blur-3xl" />
          <div className="absolute bottom-10 right-10 w-96 h-96 bg-white rounded-full blur-3xl" />
        </div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 text-center">
          <div className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-sm px-4 py-2 rounded-full text-sm font-medium mb-6">
            <Zap className="w-4 h-4" />
            India&apos;s #1 EV Charging Network
          </div>
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold leading-tight mb-6">
            Power Your
            <br />
            <span className="text-yellow-300">Electric Journey</span>
          </h1>
          <p className="text-xl text-white/90 max-w-2xl mx-auto mb-8">
            Find, book and manage EV charging slots with real-time availability, smart billing, and
            energy tracking — all in one place.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              to="/signup"
              className="bg-white text-green-600 px-8 py-3.5 rounded-xl font-bold hover:bg-gray-50 transition-all shadow-lg text-lg"
            >
              Get Started Free
            </Link>
            <Link
              to="/stations"
              className="bg-white/20 backdrop-blur-sm border border-white/40 text-white px-8 py-3.5 rounded-xl font-bold hover:bg-white/30 transition-all text-lg"
            >
              View Stations →
            </Link>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="bg-white dark:bg-gray-800 border-b border-gray-100 dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat) => (
              <div key={stat.label} className="text-center">
                <div className="text-3xl font-extrabold text-green-500">{stat.value}</div>
                <div className="text-sm text-gray-500 dark:text-gray-400 mt-1">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white">
            Why Choose <span className="text-green-500">EVCharge</span>?
          </h2>
          <p className="text-gray-500 dark:text-gray-400 mt-3 max-w-xl mx-auto">
            Everything you need for a seamless EV charging experience
          </p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((f) => (
            <div
              key={f.title}
              className="card hover:shadow-md transition-shadow duration-200"
            >
              <div className={`inline-flex p-3 rounded-xl mb-4 ${f.color}`}>{f.icon}</div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">{f.title}</h3>
              <p className="text-gray-500 dark:text-gray-400 text-sm">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Available Stations Preview */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Available Stations</h2>
            <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">
              Real-time availability across our network
            </p>
          </div>
          <Link
            to="/stations"
            className="flex items-center gap-1 text-green-500 hover:text-green-600 text-sm font-medium"
          >
            View all <ChevronRight className="w-4 h-4" />
          </Link>
        </div>

        {loadingStations ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => (
              <div key={i} className="card animate-pulse">
                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4 mb-3" />
                <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-1/2 mb-4" />
                <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded" />
              </div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {stations.map((station) => (
              <div key={station._id} className="card hover:shadow-md transition-shadow">
                <div className="flex items-start justify-between mb-3">
                  <h3 className="font-semibold text-gray-900 dark:text-white text-sm">
                    {station.name}
                  </h3>
                  <div className="flex items-center gap-1 text-yellow-500 text-xs">
                    <Star className="w-3.5 h-3.5 fill-current" />
                    <span>{station.rating.toFixed(1)}</span>
                  </div>
                </div>
                <div className="flex items-center gap-1 text-gray-500 dark:text-gray-400 text-xs mb-3">
                  <MapPin className="w-3.5 h-3.5" />
                  {station.address.city}, {station.address.state}
                </div>
                <div className="flex items-center justify-between mb-4">
                  <span className="text-xs text-gray-500 dark:text-gray-400">
                    {station.availableSlots}/{station.totalSlots} slots free
                  </span>
                  <span
                    className={
                      station.availableSlots > 0 ? 'badge-available' : 'badge-occupied'
                    }
                  >
                    {station.availableSlots > 0 ? 'Available' : 'Full'}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-green-600 dark:text-green-400 font-semibold text-sm">
                    ₹{station.pricePerUnit}/kWh
                  </span>
                  <Link
                    to={`/stations/${station._id}`}
                    className="text-xs text-blue-500 hover:text-blue-600 font-medium"
                  >
                    Book Now →
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* CTA */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto bg-gradient-to-r from-green-500 to-blue-600 rounded-2xl p-10 text-center text-white">
          <h2 className="text-3xl font-bold mb-4">Ready to go electric?</h2>
          <p className="text-white/80 mb-8">
            Join thousands of EV drivers who trust EVCharge for their daily charging needs.
          </p>
          <Link
            to="/signup"
            className="bg-white text-green-600 px-8 py-3 rounded-xl font-bold hover:bg-gray-50 transition-all shadow-lg inline-block"
          >
            Start Charging Today →
          </Link>
        </div>
      </section>
    </div>
  );
};

export default Home;
