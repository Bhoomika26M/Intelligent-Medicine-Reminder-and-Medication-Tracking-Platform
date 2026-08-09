import { useEffect, useState } from "react";
import { getHistory } from "../services/medicineService";

function History() {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);

  const loadHistory = async () => {
    try {
      const data = await getHistory();

      console.log("HISTORY DATA:", data);

      if (Array.isArray(data)) {
        setHistory(data);
      } else {
        setHistory([]);
      }
    } catch (error) {
      console.error("Error loading history:", error);
      setHistory([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadHistory();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex justify-center items-center text-2xl font-bold">
        Loading History...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-100 via-pink-50 to-white p-8">
      <h1 className="text-4xl font-bold text-purple-900 mb-8">
        Medication History 📋
      </h1>

      {history.length === 0 ? (
        <div className="bg-white rounded-3xl shadow-xl p-10 text-center">
          <h2 className="text-xl text-gray-500">
            No completed medication history yet
          </h2>
        </div>
      ) : (
        <div className="grid gap-6">
          {history.map((item, index) => (
            <div
              key={index}
              className="bg-white rounded-3xl shadow-xl p-6 flex justify-between items-center"
            >
              <div>
                <h2 className="text-2xl font-bold text-purple-900">
                  {item.medicine_name}
                </h2>

                <p className="mt-2">
                  💊 Dosage: {item.dosage}
                </p>

                <p>
                  ⏰ Time: {item.reminder_time}
                </p>

                <p>
                  📅 Date: {item.date}
                </p>
              </div>

              <div>
                {item.status === "TAKEN" ? (
                  <span className="bg-green-100 text-green-700 px-4 py-2 rounded-xl font-bold">
                    ✅ TAKEN
                  </span>
                ) : (
                  <span className="bg-red-100 text-red-700 px-4 py-2 rounded-xl font-bold">
                    ❌ MISSED
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default History;