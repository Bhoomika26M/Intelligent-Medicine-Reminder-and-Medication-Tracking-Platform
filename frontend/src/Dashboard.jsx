import { useState, useEffect } from 'react';
import axios from 'axios';

function Dashboard() {
  const [medicines, setMedicines] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');

  useEffect(() => {
    fetchTodayMedicines();
  }, []);

  const fetchTodayMedicines = async () => {
    const token = localStorage.getItem('token');
    
    try {
      const response = await axios.get(
        'http://127.0.0.1:5000/medicine/today',
        {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        }
      );
      setMedicines(response.data.medicines);
      setLoading(false);
    } catch (error) {
      console.error(error);
      setLoading(false);
    }
  };

  const markAsTaken = async (medicineId, medicineName) => {
    const token = localStorage.getItem('token');
    
    try {
      await axios.post(
        `http://127.0.0.1:5000/medicine/take/${medicineId}`,
        {},
        {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        }
      );
      setMessage(`✅ ${medicineName} marked as taken!`);
      fetchTodayMedicines();
    } catch (error) {
      setMessage('❌ Error marking as taken');
    }
  };

  const sendReminder = async (medicineId, medicineName) => {
    const token = localStorage.getItem('token');
    
    try {
      await axios.post(
        `http://127.0.0.1:5000/send-reminder/${medicineId}`,
        {},
        {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        }
      );
      setMessage(`📧 Reminder sent for ${medicineName}!`);
    } catch (error) {
      setMessage('❌ Failed to send reminder');
    }
  };

  if (loading) {
    return <div className="text-center mt-10 text-xl">Loading...</div>;
  }

  return (
    <div className="max-w-2xl mx-auto mt-10 p-6 bg-white rounded-lg shadow-lg">
      <h2 className="text-2xl font-bold mb-6 text-center">📋 Today's Medicines</h2>
      
      {message && (
        <div className="mb-4 p-3 bg-gray-100 rounded text-center">
          {message}
        </div>
      )}
      
      {medicines.length === 0 ? (
        <div className="text-center text-gray-500 py-8">
          No medicines to take today! 🎉
        </div>
      ) : (
        <div className="space-y-4">
          {medicines.map((med) => (
            <div key={med.id} className="border rounded-lg p-4 shadow-sm">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="text-xl font-semibold">{med.name}</h3>
                  <p className="text-gray-600">💊 {med.dosage}</p>
                  <p className="text-gray-600">⏰ {med.frequency}</p>
                  <p className="text-gray-600">🕐 {med.time_of_day}</p>
                  {med.notes && (
                    <p className="text-gray-500 text-sm mt-1">📝 {med.notes}</p>
                  )}
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => markAsTaken(med.id, med.name)}
                    className="bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600 transition"
                  >
                    ✅ Take
                  </button>
                  <button
                    onClick={() => sendReminder(med.id, med.name)}
                    className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition"
                  >
                    📧 Remind
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

export default Dashboard;