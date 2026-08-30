import { useState, useEffect } from 'react';
import axios from 'axios';
import { Pill, Calendar, Activity, Bell, Search } from 'lucide-react';

function Dashboard() {
  const [medicines, setMedicines] = useState([]);
  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');

  useEffect(() => {
    fetchTodayMedicines();
    fetchAlerts();
  }, []);

  const fetchTodayMedicines = async () => {
    const token = localStorage.getItem('token');
    try {
      const response = await axios.get(
        'http://127.0.0.1:5000/medicine/today',
        { headers: { 'Authorization': `Bearer ${token}` } }
      );
      setMedicines(response.data.medicines || []);
      setLoading(false);
    } catch (error) {
      console.error(error);
      setLoading(false);
    }
  };

  const fetchAlerts = async () => {
  const token = localStorage.getItem('token');
  try {
    const res = await axios.get('http://127.0.0.1:5000/refill-alerts', {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    setAlerts(res.data.alerts);
  } catch (err) {
    console.error(err);
  }
};

  const markAsTaken = async (id, name) => {
    const token = localStorage.getItem('token');
    try {
      await axios.post(
        `http://127.0.0.1:5000/medicine/take/${id}`,
        {},
        { headers: { 'Authorization': `Bearer ${token}` } }
      );
      setMessage(`✅ ${name} taken!`);
      fetchTodayMedicines();
    } catch (error) {
      setMessage('❌ Error');
    }
  };

  if (loading) return <div className="text-center py-10">Loading...</div>;

  return (
    <div className="max-w-6xl mx-auto p-4">
      {/* Stats Row */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-gradient-to-r from-blue-400 to-blue-600 p-4 rounded-xl shadow flex items-center gap-3">
          <Pill className="text-blue-500" size={28} />
          <div>
            <p className="text-sm text-gray-500">Active Medicines</p>
            <p className="text-2xl font-bold">{medicines.length}</p>
          </div>
        </div>
        <div className="bg-gradient-to-r from-green-400 to-green-600 p-4 rounded-xl shadow flex items-center gap-3">
          <Calendar className="text-green-500" size={28} />
          <div>
            <p className="text-sm text-gray-500">Today's Doses</p>
            <p className="text-2xl font-bold">{medicines.length}</p>
          </div>
        </div>
        <div className="bg-gradient-to-r from-purple-400 to-purple-600 p-4 rounded-xl shadow flex items-center gap-3">
          <Activity className="text-purple-500" size={28} />
          <div>
            <p className="text-sm text-gray-500">Adherence</p>
            <p className="text-2xl font-bold">--%</p>
          </div>
        </div>
        <div className="bg-gradient-to-r from-yellow-400 to-yellow-600 p-4 rounded-xl shadow flex items-center gap-3">
          <Bell className="text-yellow-500" size={28} />
          <div>
            <p className="text-sm text-gray-500">Reminders</p>
            <p className="text-2xl font-bold">{medicines.length}</p>
          </div>
        </div>
      </div>
      
      {alerts.length > 0 && (
        <div className="bg-red-100 border border-red-400 text-red-700 p-3 rounded mb-4">
          <p className="font-bold">⚠️ Refill Alerts</p>
          {alerts.map((alert) => (
            <p key={alert.id}>• {alert.message}</p>
          ))}
         </div>
      )}

      {message && (
        <div className="bg-green-100 text-green-700 p-3 rounded mb-4">{message}</div>
      )}

      {/* Medicine List */}
      <div className="bg-white rounded-xl shadow p-4">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold">Today's Medicines</h2>
          <div className="relative">
            <Search className="absolute left-3 top-2.5 text-gray-400" size={18} />
            <input
              placeholder="Search..."
              className="pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        {medicines.length === 0 ? (
  <div className="text-center py-8 text-gray-500">No medicines today 🎉</div>
) : (
  <div className="space-y-3">
    {medicines.map((med) => (
      <div key={med.id} className="flex justify-between items-center border-b pb-3 hover:bg-gray-50 px-3 py-2 rounded-lg transition">
        <div>
          <h3 className="font-semibold">{med.name}</h3>
          <p className="text-sm text-gray-500">💊 {med.dosage} · {med.frequency}</p>
          <p className="text-sm text-gray-500">🕐 {med.time_of_day}</p>
          {med.notes && <p className="text-sm text-gray-400">📝 {med.notes}</p>}

          {/* ✅ Stock & Refill Info */}
          {med.stock_count && (
            <div className="mt-2">
              <p className="text-sm text-gray-600">📦 Stock: {med.stock_count} tablets</p>
              <p className="text-sm text-gray-600">
                ⏳ Days left: ~{Math.floor(med.stock_count / 2)}
              </p>
              {med.stock_count < 5 && (
                <p className="text-red-500 text-sm font-bold">⚠️ Low Stock! Refill Soon!</p>
              )}
            </div>
          )}
        </div>

        <button
          onClick={() => markAsTaken(med.id, med.name)}
          className="bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600"
        >
          ✅ Take
        </button>
      </div>
    ))}
  </div>
)}
      </div>
    </div>
  );
}

export default Dashboard;