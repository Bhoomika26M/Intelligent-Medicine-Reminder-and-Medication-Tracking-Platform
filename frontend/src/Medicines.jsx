import { useState, useEffect } from 'react';
import axios from 'axios';
import { Edit, Trash2, Search, Plus } from 'lucide-react';
import { Link } from 'react-router-dom';

function Medicines() {
  const [medicines, setMedicines] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchMedicines();
  }, []);

  const fetchMedicines = async () => {
    const token = localStorage.getItem('token');
    try {
      const response = await axios.get(
        'http://127.0.0.1:5000/medicines',
        { headers: { 'Authorization': `Bearer ${token}` } }
      );
      console.log('✅ Medicines fetched:', response.data);
      setMedicines(response.data.medicines || []);
      setLoading(false);
    } catch (error) {
      console.error('❌ Error fetching medicines:', error);
      setLoading(false);
    }
  };

  const deleteMedicine = async (id, name) => {
    if (!window.confirm(`Delete "${name}"?`)) return;
    const token = localStorage.getItem('token');
    try {
      await axios.delete(
        `http://127.0.0.1:5000/medicine/${id}`,
        { headers: { 'Authorization': `Bearer ${token}` } }
      );
      setMessage(`✅ "${name}" deleted!`);
      fetchMedicines();
    } catch (error) {
      setMessage('❌ Error deleting medicine');
    }
  };

  const filteredMedicines = medicines.filter(med =>
    med.name?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) return <div className="text-center py-10">⏳ Loading...</div>;

  return (
    <div className="max-w-6xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">💊 All Medicines</h1>
        <Link
          to="/add-medicine"
          className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 flex items-center gap-2"
        >
          <Plus size={20} /> Add Medicine
        </Link>
      </div>

      {message && (
        <div className="bg-green-100 border border-green-400 text-green-700 p-3 rounded mb-4">
          {message}
        </div>
      )}

      <div className="relative mb-4">
        <Search className="absolute left-3 top-2.5 text-gray-400" size={20} />
        <input
          type="text"
          placeholder="Search medicines..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      {filteredMedicines.length === 0 ? (
        <div className="text-center py-10 text-gray-500 bg-white rounded-xl shadow">
          <p className="text-xl">📭 No medicines found</p>
          <p className="text-sm mt-1">Add your first medicine!</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredMedicines.map((med) => (
            <div key={med.id} className="bg-white rounded-xl shadow p-4 border border-gray-100 hover:shadow-lg transition">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="text-lg font-semibold">{med.name}</h3>
                  <p className="text-sm text-gray-600">{med.dosage} · {med.frequency}</p>
                  <p className="text-sm text-gray-500">🕐 {med.time_of_day}</p>
                  {med.notes && <p className="text-sm text-gray-400">📝 {med.notes}</p>}
                </div>
                <div className="flex gap-2">
                  <button className="text-blue-500 hover:text-blue-700 p-1" title="Edit">
                    <Edit size={18} />
                  </button>
                  <button
                    onClick={() => {
                      if (window.confirm(`Delete "${med.name}"?`)) {
                        deleteMedicine(med.id, med.name);
                      }
                    }}
                    className="bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600"
                  >
                    🗑️ Delete
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default Medicines;