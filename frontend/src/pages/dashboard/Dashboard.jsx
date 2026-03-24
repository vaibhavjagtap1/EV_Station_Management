import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { billingAPI, bookingsAPI } from '../../api';
import { Zap, Activity, DollarSign, Calendar, ChevronRight, TrendingUp } from 'lucide-react';
import { Line, Bar } from 'react-chartjs-2';
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
  Filler,
} from 'chart.js';
import { format } from 'date-fns';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

const StatCard = ({ icon, label, value, sub, color }) => (
  <div className="stat-card">
    <div className={`p-3 rounded-xl ${color}`}>{icon}</div>
    <div>
      <p className="text-sm text-gray-500 dark:text-gray-400">{label}</p>
      <p className="text-2xl font-bold text-gray-900 dark:text-white">{value}</p>
      {sub && <p className="text-xs text-gray-400 mt-0.5">{sub}</p>}
    </div>
  </div>
);

const Dashboard = () => {
  const { user } = useAuth();
  const [billingStats, setBillingStats] = useState(null);
  const [recentBookings, setRecentBookings] = useState([]);
  const [chartData, setChartData] = useState([]);
  const [period, setPeriod] = useState('weekly');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      try {
        const [billingRes, bookingsRes, analyticsRes] = await Promise.all([
          billingAPI.getMyBilling({ limit: 5 }),
          bookingsAPI.getMyBookings(),
          billingAPI.getEnergyAnalytics(period),
        ]);
        setBillingStats(billingRes.data.stats);
        setRecentBookings(bookingsRes.data.bookings.slice(0, 5));
        setChartData(analyticsRes.data.data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, [period]);

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      tooltip: {
        backgroundColor: 'rgba(0,0,0,0.8)',
        padding: 10,
        cornerRadius: 8,
      },
    },
    scales: {
      x: { grid: { display: false } },
      y: { grid: { color: 'rgba(0,0,0,0.05)' }, beginAtZero: true },
    },
  };

  const energyChart = {
    labels: chartData.map((d) => format(new Date(d.date), 'MMM dd')),
    datasets: [
      {
        data: chartData.map((d) => d.energy),
        borderColor: '#10b981',
        backgroundColor: 'rgba(16, 185, 129, 0.1)',
        fill: true,
        tension: 0.4,
        pointBackgroundColor: '#10b981',
        pointRadius: 4,
      },
    ],
  };

  const amountChart = {
    labels: chartData.map((d) => format(new Date(d.date), 'MMM dd')),
    datasets: [
      {
        data: chartData.map((d) => d.amount),
        backgroundColor: 'rgba(59, 130, 246, 0.7)',
        borderRadius: 6,
      },
    ],
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
      <div className="min-h-screen flex items-center justify-center dark:bg-gray-900">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-500" />
      </div>
    );
  }

  return (
    <div className="dark:bg-gray-900 min-h-screen py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              Welcome back, {user?.name?.split(' ')[0]}! 👋
            </h1>
            <p className="text-gray-500 dark:text-gray-400 mt-1">
              {new Date().toLocaleDateString('en-IN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
            </p>
          </div>
          <Link to="/stations" className="btn-primary flex items-center gap-2">
            <Zap className="w-4 h-4" />
            Book Now
          </Link>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <StatCard
            icon={<Zap className="w-6 h-6 text-green-500" />}
            label="Total Energy Used"
            value={`${(user?.totalEnergyConsumed || billingStats?.totalEnergy || 0).toFixed(1)} kWh`}
            color="bg-green-100 dark:bg-green-900/30"
          />
          <StatCard
            icon={<DollarSign className="w-6 h-6 text-blue-500" />}
            label="Total Spent"
            value={`₹${(user?.totalAmountSpent || billingStats?.totalAmount || 0).toFixed(0)}`}
            color="bg-blue-100 dark:bg-blue-900/30"
          />
          <StatCard
            icon={<Activity className="w-6 h-6 text-purple-500" />}
            label="Total Sessions"
            value={billingStats?.totalSessions || 0}
            color="bg-purple-100 dark:bg-purple-900/30"
          />
          <StatCard
            icon={<TrendingUp className="w-6 h-6 text-orange-500" />}
            label="CO₂ Saved"
            value={`${((user?.totalEnergyConsumed || 0) * 0.82).toFixed(1)} kg`}
            sub="vs. petrol vehicle"
            color="bg-orange-100 dark:bg-orange-900/30"
          />
        </div>

        {/* Charts */}
        <div className="grid lg:grid-cols-2 gap-6 mb-8">
          <div className="card">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                Energy Consumption
              </h2>
              <div className="flex gap-1">
                {['daily', 'weekly', 'monthly'].map((p) => (
                  <button
                    key={p}
                    onClick={() => setPeriod(p)}
                    className={`text-xs px-3 py-1 rounded-full capitalize transition-colors ${
                      period === p
                        ? 'bg-green-500 text-white'
                        : 'text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-700'
                    }`}
                  >
                    {p}
                  </button>
                ))}
              </div>
            </div>
            <div className="h-48">
              {chartData.length > 0 ? (
                <Line data={energyChart} options={chartOptions} />
              ) : (
                <div className="h-full flex items-center justify-center text-gray-400 text-sm">
                  No data for selected period
                </div>
              )}
            </div>
          </div>

          <div className="card">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Spending (₹)
            </h2>
            <div className="h-48">
              {chartData.length > 0 ? (
                <Bar data={amountChart} options={chartOptions} />
              ) : (
                <div className="h-full flex items-center justify-center text-gray-400 text-sm">
                  No data available
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Recent Bookings */}
        <div className="card">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
              Recent Bookings
            </h2>
            <Link
              to="/dashboard/bookings"
              className="flex items-center gap-1 text-sm text-green-500 hover:text-green-600"
            >
              View all <ChevronRight className="w-4 h-4" />
            </Link>
          </div>

          {recentBookings.length === 0 ? (
            <div className="text-center py-8">
              <Calendar className="w-10 h-10 text-gray-300 mx-auto mb-3" />
              <p className="text-gray-500 dark:text-gray-400">No bookings yet</p>
              <Link to="/stations" className="btn-primary mt-4 inline-block">
                Find a Station
              </Link>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-left text-gray-500 dark:text-gray-400 border-b border-gray-100 dark:border-gray-700">
                    <th className="pb-3 pr-4">Station</th>
                    <th className="pb-3 pr-4">Slot</th>
                    <th className="pb-3 pr-4">Vehicle</th>
                    <th className="pb-3 pr-4">Date</th>
                    <th className="pb-3">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50 dark:divide-gray-700">
                  {recentBookings.map((booking) => (
                    <tr key={booking._id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50">
                      <td className="py-3 pr-4 font-medium text-gray-900 dark:text-white">
                        {booking.station?.name || 'N/A'}
                      </td>
                      <td className="py-3 pr-4 text-gray-500 dark:text-gray-400">
                        {booking.slotNumber}
                      </td>
                      <td className="py-3 pr-4 text-gray-500 dark:text-gray-400">
                        {booking.vehicleType}
                      </td>
                      <td className="py-3 pr-4 text-gray-500 dark:text-gray-400">
                        {format(new Date(booking.scheduledStart), 'MMM dd, HH:mm')}
                      </td>
                      <td className="py-3">
                        <span className={getStatusBadge(booking.status)}>
                          {booking.status.charAt(0).toUpperCase() + booking.status.slice(1)}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
