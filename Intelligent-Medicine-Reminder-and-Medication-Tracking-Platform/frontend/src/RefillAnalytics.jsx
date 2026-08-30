import { useState, useEffect } from 'react';
import axios from 'axios';
import { BarChart, Bar, XAxis, YAxis, Tooltip, Legend, CartesianGrid, ResponsiveContainer } from 'recharts';

function RefillAnalytics() {
  const [medicines, setMedicines] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchMedicines();
  }, []);

  const fetchMedicines = async () => {
    const token = localStorage.getItem('token');
    try {
      const response = await axios.get('http://127.0.0.1:5000/medicines', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      setMedicines(response.data.medicines || []);
      setLoading(false);
    } catch (error) {
      console.error(error);
      setLoading(false);
    }
  };

  if (loading) return <div className="text-center py-10">⏳ Loading...</div>;

  const chartData = medicines.map(med => ({
    name: med.name,
    stock: med.stock_count || 0,
    daysLeft: Math.floor((med.stock_count || 0) / 2)
  }));

  return (
    <div className="max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">📦 Refill Analytics</h1>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="bg-white rounded-xl shadow p-4 text-center">
          <p className="text-sm text-gray-500">Total Medicines</p>
          <p className="text-2xl font-bold">{medicines.length}</p>
        </div>
        <div className="bg-white rounded-xl shadow p-4 text-center">
          <p className="text-sm text-gray-500">{'Low Stock (< 5)'}</p>
          <p className="text-2xl font-bold text-red-600">
            {medicines.filter(m => (m.stock_count || 0) < 5).length}
          </p>
        </div>
        <div className="bg-white rounded-xl shadow p-4 text-center">
          <p className="text-sm text-gray-500">{'Need Refill Soon (< 10)'}</p>
          <p className="text-2xl font-bold text-yellow-600">
            {medicines.filter(m => (m.stock_count || 0) < 10).length}
          </p>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow p-4">
        <h2 className="text-lg font-semibold mb-4">📊 Stock & Days Left</h2>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Bar dataKey="stock" fill="#3b82f6" name="Stock" />
            <Bar dataKey="daysLeft" fill="#f59e0b" name="Days Left" />
          </BarChart>
        </ResponsiveContainer>
      </div>

      <div className="mt-6 bg-white rounded-xl shadow p-4">
        <h2 className="text-lg font-semibold mb-4">⚠️ Refill Alerts</h2>
        {medicines.filter(m => (m.stock_count || 0) < 10).length === 0 ? (
          <p className="text-green-600">✅ All medicines have sufficient stock.</p>
        ) : (
          <ul className="space-y-2">
            {medicines
              .filter(m => (m.stock_count || 0) < 10)
              .map(med => (
                <li key={med.id} className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-700">
                  ⚠️ <strong>{med.name}</strong> — Stock: {med.stock_count} tablets
                  {med.stock_count < 5 && <span className="ml-2 text-sm font-bold">(URGENT!)</span>}
                </li>
              ))}
          </ul>
        )}
      </div>
    </div>
  );
}

export default RefillAnalytics;