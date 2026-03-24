import { useState, useEffect } from 'react';
import { adminAPI, stationsAPI } from '../../api';
import {
  Users,
  Zap,
  DollarSign,
  Activity,
  Settings,
  MapPin,
  TrendingUp,
  BarChart2,
} from 'lucide-react';
import { Bar, Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import { format } from 'date-fns';
import toast from 'react-hot-toast';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, BarElement, Title, Tooltip, Legend);

const AdminDashboard = () => {
  const [analytics, setAnalytics] = useState(null);
  const [users, setUsers] = useState([]);
  const [stations, setStations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');
  const [newStation, setNewStation] = useState(null);
  const [priceModal, setPriceModal] = useState(null);

  useEffect(() => {
    const loadData = async () => {
      try {
        const [analyticsRes, usersRes, stationsRes] = await Promise.all([
          adminAPI.getAnalytics(),
          adminAPI.getUsers({ limit: 20 }),
          stationsAPI.getAll(),
        ]);
        setAnalytics(analyticsRes.data.analytics);
        setUsers(usersRes.data.users);
        setStations(stationsRes.data.stations);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, []);

  const handleToggleUser = async (userId) => {
    try {
      const { data } = await adminAPI.toggleUserStatus(userId);
      setUsers((prev) => prev.map((u) => (u._id === userId ? data.user : u)));
      toast.success('User status updated');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update user');
    }
  };

  const handleDeleteStation = async (stationId) => {
    if (!window.confirm('Deactivate this station?')) return;
    try {
      await stationsAPI.delete(stationId);
      setStations((prev) => prev.filter((s) => s._id !== stationId));
      toast.success('Station deactivated');
    } catch (err) {
      toast.error('Failed to deactivate station');
    }
  };

  const handleUpdatePrice = async (stationId, price) => {
    try {
      await adminAPI.updatePricing({ stationId, pricePerUnit: parseFloat(price) });
      setStations((prev) =>
        prev.map((s) => (s._id === stationId ? { ...s, pricePerUnit: parseFloat(price) } : s))
      );
      setPriceModal(null);
      toast.success('Price updated');
    } catch (err) {
      toast.error('Failed to update price');
    }
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: { legend: { display: false } },
    scales: { x: { grid: { display: false } }, y: { beginAtZero: true } },
  };

  const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

  const revenueChart = analytics?.monthlyRevenue
    ? {
        labels: analytics.monthlyRevenue.map((d) => monthNames[d._id.month - 1]),
        datasets: [
          {
            data: analytics.monthlyRevenue.map((d) => d.revenue),
            backgroundColor: 'rgba(59, 130, 246, 0.7)',
            borderRadius: 6,
          },
        ],
      }
    : null;

  const energyChart = analytics?.monthlyRevenue
    ? {
        labels: analytics.monthlyRevenue.map((d) => monthNames[d._id.month - 1]),
        datasets: [
          {
            data: analytics.monthlyRevenue.map((d) => d.energy),
            borderColor: '#10b981',
            backgroundColor: 'rgba(16, 185, 129, 0.1)',
            fill: true,
            tension: 0.4,
          },
        ],
      }
    : null;

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center dark:bg-gray-900">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-500" />
      </div>
    );
  }

  const tabs = [
    { id: 'overview', label: 'Overview', icon: <BarChart2 className="w-4 h-4" /> },
    { id: 'stations', label: 'Stations', icon: <MapPin className="w-4 h-4" /> },
    { id: 'users', label: 'Users', icon: <Users className="w-4 h-4" /> },
  ];

  return (
    <div className="dark:bg-gray-900 min-h-screen py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
            <Settings className="w-6 h-6 text-green-500" />
            Admin Panel
          </h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">Manage your EV charging network</p>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-6 border-b border-gray-200 dark:border-gray-700">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-2.5 text-sm font-medium border-b-2 -mb-px transition-colors ${
                activeTab === tab.id
                  ? 'border-green-500 text-green-600 dark:text-green-400'
                  : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200'
              }`}
            >
              {tab.icon}
              {tab.label}
            </button>
          ))}
        </div>

        {/* Overview Tab */}
        {activeTab === 'overview' && (
          <div className="space-y-6">
            {/* Stat Cards */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              {[
                { label: 'Total Users', value: analytics?.totalUsers, icon: <Users className="w-6 h-6 text-blue-500" />, color: 'bg-blue-100 dark:bg-blue-900/30' },
                { label: 'Active Stations', value: analytics?.totalStations, icon: <MapPin className="w-6 h-6 text-green-500" />, color: 'bg-green-100 dark:bg-green-900/30' },
                { label: 'Total Revenue', value: `₹${(analytics?.totalRevenue || 0).toFixed(0)}`, icon: <DollarSign className="w-6 h-6 text-purple-500" />, color: 'bg-purple-100 dark:bg-purple-900/30' },
                { label: 'Energy Dispensed', value: `${(analytics?.totalEnergy || 0).toFixed(0)} kWh`, icon: <Zap className="w-6 h-6 text-orange-500" />, color: 'bg-orange-100 dark:bg-orange-900/30' },
              ].map((s) => (
                <div key={s.label} className="stat-card">
                  <div className={`p-3 rounded-xl ${s.color}`}>{s.icon}</div>
                  <div>
                    <p className="text-xs text-gray-500 dark:text-gray-400">{s.label}</p>
                    <p className="text-xl font-bold text-gray-900 dark:text-white">{s.value}</p>
                  </div>
                </div>
              ))}
            </div>

            {/* Charts */}
            <div className="grid lg:grid-cols-2 gap-6">
              <div className="card">
                <h3 className="text-base font-semibold text-gray-900 dark:text-white mb-4">
                  Monthly Revenue (₹)
                </h3>
                <div className="h-48">
                  {revenueChart ? (
                    <Bar data={revenueChart} options={chartOptions} />
                  ) : (
                    <div className="h-full flex items-center justify-center text-gray-400 text-sm">
                      No data
                    </div>
                  )}
                </div>
              </div>
              <div className="card">
                <h3 className="text-base font-semibold text-gray-900 dark:text-white mb-4">
                  Monthly Energy (kWh)
                </h3>
                <div className="h-48">
                  {energyChart ? (
                    <Line data={energyChart} options={chartOptions} />
                  ) : (
                    <div className="h-full flex items-center justify-center text-gray-400 text-sm">
                      No data
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Recent Bookings */}
            <div className="card">
              <h3 className="text-base font-semibold text-gray-900 dark:text-white mb-4">
                Recent Bookings
              </h3>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="text-left text-gray-500 dark:text-gray-400 border-b border-gray-100 dark:border-gray-700">
                    <tr>
                      <th className="pb-3 pr-4">User</th>
                      <th className="pb-3 pr-4">Station</th>
                      <th className="pb-3 pr-4">Date</th>
                      <th className="pb-3">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50 dark:divide-gray-700/50">
                    {analytics?.recentBookings?.map((b) => (
                      <tr key={b._id} className="hover:bg-gray-50 dark:hover:bg-gray-700/30">
                        <td className="py-3 pr-4 text-gray-700 dark:text-gray-200">
                          {b.user?.name || 'N/A'}
                        </td>
                        <td className="py-3 pr-4 text-gray-500 dark:text-gray-400">
                          {b.station?.name || 'N/A'}
                        </td>
                        <td className="py-3 pr-4 text-gray-500 dark:text-gray-400">
                          {format(new Date(b.createdAt), 'MMM dd, HH:mm')}
                        </td>
                        <td className="py-3">
                          <span
                            className={
                              b.status === 'completed'
                                ? 'badge-completed'
                                : b.status === 'cancelled'
                                ? 'badge-cancelled'
                                : 'badge-pending'
                            }
                          >
                            {b.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* Stations Tab */}
        {activeTab === 'stations' && (
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                Charging Stations ({stations.length})
              </h2>
            </div>

            <div className="card overflow-hidden p-0">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-gray-50 dark:bg-gray-700/50">
                    <tr className="text-left text-gray-500 dark:text-gray-400">
                      <th className="px-4 py-3">Name</th>
                      <th className="px-4 py-3">City</th>
                      <th className="px-4 py-3">Slots</th>
                      <th className="px-4 py-3">Price/kWh</th>
                      <th className="px-4 py-3">Status</th>
                      <th className="px-4 py-3">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                    {stations.map((station) => (
                      <tr key={station._id} className="hover:bg-gray-50 dark:hover:bg-gray-700/30">
                        <td className="px-4 py-3 font-medium text-gray-900 dark:text-white">
                          {station.name}
                        </td>
                        <td className="px-4 py-3 text-gray-500 dark:text-gray-400">
                          {station.address.city}
                        </td>
                        <td className="px-4 py-3 text-gray-500 dark:text-gray-400">
                          {station.availableSlots}/{station.totalSlots}
                        </td>
                        <td className="px-4 py-3 font-semibold text-green-600">
                          ₹{station.pricePerUnit}
                        </td>
                        <td className="px-4 py-3">
                          <span className={station.availableSlots > 0 ? 'badge-available' : 'badge-occupied'}>
                            {station.availableSlots > 0 ? 'Available' : 'Full'}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex gap-2">
                            <button
                              onClick={() => setPriceModal({ id: station._id, name: station.name, price: station.pricePerUnit })}
                              className="text-xs text-blue-500 hover:text-blue-600 font-medium"
                            >
                              Edit Price
                            </button>
                            <button
                              onClick={() => handleDeleteStation(station._id)}
                              className="text-xs text-red-500 hover:text-red-600 font-medium"
                            >
                              Deactivate
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* Users Tab */}
        {activeTab === 'users' && (
          <div className="card overflow-hidden p-0">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-gray-50 dark:bg-gray-700/50">
                  <tr className="text-left text-gray-500 dark:text-gray-400">
                    <th className="px-4 py-3">Name</th>
                    <th className="px-4 py-3">Email</th>
                    <th className="px-4 py-3">Role</th>
                    <th className="px-4 py-3">Vehicle</th>
                    <th className="px-4 py-3">Status</th>
                    <th className="px-4 py-3">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                  {users.map((user) => (
                    <tr key={user._id} className="hover:bg-gray-50 dark:hover:bg-gray-700/30">
                      <td className="px-4 py-3 font-medium text-gray-900 dark:text-white">{user.name}</td>
                      <td className="px-4 py-3 text-gray-500 dark:text-gray-400">{user.email}</td>
                      <td className="px-4 py-3">
                        <span
                          className={
                            user.role === 'admin'
                              ? 'bg-purple-100 text-purple-700 px-2.5 py-0.5 rounded-full text-xs font-semibold'
                              : 'badge-pending'
                          }
                        >
                          {user.role}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-gray-500 dark:text-gray-400">{user.vehicleType || '-'}</td>
                      <td className="px-4 py-3">
                        <span className={user.isActive ? 'badge-completed' : 'badge-cancelled'}>
                          {user.isActive ? 'Active' : 'Inactive'}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        {user.role !== 'admin' && (
                          <button
                            onClick={() => handleToggleUser(user._id)}
                            className={`text-xs font-medium ${user.isActive ? 'text-red-500 hover:text-red-600' : 'text-green-500 hover:text-green-600'}`}
                          >
                            {user.isActive ? 'Deactivate' : 'Activate'}
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      {/* Price Update Modal */}
      {priceModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 w-full max-w-sm">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Update Price</h3>
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">{priceModal.name}</p>
            <input
              type="number"
              defaultValue={priceModal.price}
              step="0.5"
              min="1"
              id="new-price"
              className="input-field mb-4"
              placeholder="Price per kWh (₹)"
            />
            <div className="flex gap-3">
              <button
                onClick={() =>
                  handleUpdatePrice(priceModal.id, document.getElementById('new-price').value)
                }
                className="btn-primary flex-1"
              >
                Update
              </button>
              <button onClick={() => setPriceModal(null)} className="btn-secondary flex-1">
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;
