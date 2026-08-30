import { useState, useEffect } from 'react';
import axios from 'axios';
import { PieChart, Pie, Cell, Tooltip, Legend, BarChart, Bar, XAxis, YAxis, CartesianGrid, LineChart, Line, ResponsiveContainer } from 'recharts';

function Reports() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAdherence = async () => {
      const token = localStorage.getItem('token');
      try {
        const response = await axios.get('http://127.0.0.1:5000/adherence', {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        setData(response.data);
        setLoading(false);
      } catch (error) {
        console.error(error);
        setLoading(false);
      }
    };
    fetchAdherence();
  }, []);

  if (loading) return <div className="text-center py-10">⏳ Loading...</div>;
  if (!data) return <div className="text-center py-10">No data available</div>;

  const pieData = [
    { name: 'Taken', value: data.taken },
    { name: 'Missed', value: data.missed }
  ];

  const COLORS = ['#22c55e', '#ef4444'];

  // Sample weekly data (you can replace this with real API data later)
  const weeklyData = [
    { day: 'Mon', taken: 3, missed: 1 },
    { day: 'Tue', taken: 4, missed: 0 },
    { day: 'Wed', taken: 2, missed: 2 },
    { day: 'Thu', taken: 5, missed: 0 },
    { day: 'Fri', taken: 3, missed: 1 },
    { day: 'Sat', taken: 4, missed: 0 },
    { day: 'Sun', taken: 2, missed: 1 }
  ];

  const adherenceTrend = weeklyData.map(day => ({
    day: day.day,
    adherence: Math.round((day.taken / (day.taken + day.missed)) * 100)
  }));

  return (
    <div className="max-w-6xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">📊 Adherence & Analytics Report</h1>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-gradient-to-r from-blue-50 to-blue-100 rounded-xl shadow p-4 text-center">
          <p className="text-sm text-gray-500">Total Doses</p>
          <p className="text-2xl font-bold">{data.total_doses}</p>
        </div>
        <div className="bg-gradient-to-r from-green-50 to-green-100 rounded-xl shadow p-4 text-center">
          <p className="text-sm text-gray-500">✅ Taken</p>
          <p className="text-2xl font-bold text-green-600">{data.taken}</p>
        </div>
        <div className="bg-gradient-to-r from-red-50 to-red-100 rounded-xl shadow p-4 text-center">
          <p className="text-sm text-gray-500">❌ Missed</p>
          <p className="text-2xl font-bold text-red-600">{data.missed}</p>
        </div>
        <div className="bg-gradient-to-r from-purple-50 to-purple-100 rounded-xl shadow p-4 text-center">
          <p className="text-sm text-gray-500">📈 Adherence</p>
          <p className="text-2xl font-bold text-purple-600">{data.adherence_percentage}%</p>
        </div>
      </div>

      {/* Pie Chart + Adherence % */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        <div className="bg-white rounded-xl shadow p-4 flex justify-center">
          <PieChart width={280} height={280}>
            <Pie
              data={pieData}
              dataKey="value"
              nameKey="name"
              cx="50%"
              cy="50%"
              outerRadius={80}
              label
            >
              {pieData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip />
            <Legend />
          </PieChart>
        </div>

        <div className="bg-white rounded-xl shadow p-4 flex flex-col items-center justify-center">
          <p className="text-sm text-gray-500">Overall Adherence</p>
          <p className="text-6xl font-bold text-blue-600">{data.adherence_percentage}%</p>
          <p className="text-sm text-gray-400 mt-2">Based on {data.total_doses} total doses</p>
        </div>
      </div>

      {/* Weekly Adherence Bar Chart */}
      <div className="bg-white rounded-xl shadow p-4 mb-6">
        <h2 className="text-lg font-semibold mb-4">📅 Weekly Adherence</h2>
        <ResponsiveContainer width="100%" height={250}>
          <BarChart data={weeklyData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="day" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Bar dataKey="taken" fill="#22c55e" name="Taken" />
            <Bar dataKey="missed" fill="#ef4444" name="Missed" />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Adherence Trend Line Chart */}
      <div className="bg-white rounded-xl shadow p-4">
        <h2 className="text-lg font-semibold mb-4">📈 Adherence Trend (Weekly)</h2>
        <ResponsiveContainer width="100%" height={250}>
          <LineChart data={adherenceTrend}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="day" />
            <YAxis domain={[0, 100]} />
            <Tooltip />
            <Legend />
            <Line type="monotone" dataKey="adherence" stroke="#8b5cf6" name="Adherence %" strokeWidth={2} />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

export default Reports;