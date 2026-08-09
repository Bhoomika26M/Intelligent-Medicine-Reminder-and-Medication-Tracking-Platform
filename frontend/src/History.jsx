import { useState, useEffect } from 'react';
import axios from 'axios';

function History() {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchHistory();
  }, []);

  const fetchHistory = async () => {
    const token = localStorage.getItem('token');
    
    try {
      const response = await axios.get(
        'http://127.0.0.1:5000/medicine/history',
        {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        }
      );
      setHistory(response.data.history);
      setLoading(false);
    } catch (error) {
      console.error(error);
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="text-center mt-10 text-xl">Loading...</div>;
  }

  return (
    <div className="max-w-4xl mx-auto mt-10 p-6 bg-white rounded-lg shadow-lg">
      <h2 className="text-2xl font-bold mb-6 text-center">📊 Medication History</h2>
      
      {history.length === 0 ? (
        <div className="text-center text-gray-500 py-8">
          No history yet. Start taking your medicines! 💊
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-gray-200">
                <th className="p-3 text-left">Medicine</th>
                <th className="p-3 text-left">Scheduled Time</th>
                <th className="p-3 text-left">Taken At</th>
                <th className="p-3 text-left">Status</th>
              </tr>
            </thead>
            <tbody>
              {history.map((item) => (
                <tr key={item.id} className="border-b hover:bg-gray-50">
                  <td className="p-3">{item.medicine_name}</td>
                  <td className="p-3">{new Date(item.scheduled_time).toLocaleString()}</td>
                  <td className="p-3">
                    {item.actual_time_taken 
                      ? new Date(item.actual_time_taken).toLocaleString()
                      : '—'
                    }
                  </td>
                  <td className="p-3">
                    <span className={`px-2 py-1 rounded text-white text-sm ${
                      item.status === 'taken' ? 'bg-green-500' :
                      item.status === 'missed' ? 'bg-red-500' :
                      'bg-yellow-500'
                    }`}>
                      {item.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

export default History;