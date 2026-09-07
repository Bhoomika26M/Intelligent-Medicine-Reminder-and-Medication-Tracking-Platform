import { useEffect, useState } from "react";
import { getMedicineHistory } from "../services/medicineService";

function History() {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);

  const loadHistory = async () => {
    try {
      const data = await getMedicineHistory();

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
      <div className="min-h-screen bg-[#0F1117] flex justify-center items-center">
        <h1 className="text-3xl font-bold text-cyan-400 animate-pulse">
          Loading History...
        </h1>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0F1117] p-8">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-4xl font-bold text-white">
            Medicine History
          </h1>

          <p className="text-gray-400 mt-2">
            Complete medication activity
          </p>
        </div>

        <div className="bg-[#1D2330] px-5 py-3 rounded-2xl border border-cyan-500">
          <span className="text-cyan-400 font-semibold">
            Total: {history.length}
          </span>
        </div>
      </div>

      {history.length === 0 ? (
        <div className="bg-[#1D2330] rounded-3xl border border-gray-700 p-12 text-center">
          <h2 className="text-2xl text-gray-400">
            No medicine history available
          </h2>
        </div>
      ) : (
        <div className="grid gap-6">
          {history.map((item) => (
            <div
              key={item.id}
              className="bg-[#1D2330] border border-gray-700 rounded-3xl p-6 shadow-lg hover:border-cyan-500 hover:shadow-cyan-500/20 transition-all duration-300"
            >
              <div className="flex justify-between items-start">
                <div className="space-y-2">
                  <h2 className="text-2xl font-bold text-white">
                    💊 {item.medicine_name}
                  </h2>

                  <p className="text-gray-300">
                    <span className="text-cyan-400 font-semibold">
                      Disease:
                    </span>{" "}
                    {item.disease}
                  </p>

                  <p className="text-gray-300">
                    <span className="text-cyan-400 font-semibold">
                      Dosage:
                    </span>{" "}
                    {item.dosage}
                  </p>

                  <p className="text-gray-300">
                    <span className="text-cyan-400 font-semibold">
                      Quantity:
                    </span>{" "}
                    {item.quantity}
                  </p>

                  <p className="text-gray-300">
                    <span className="text-cyan-400 font-semibold">
                      Remaining:
                    </span>{" "}
                    {item.remaining_quantity}
                  </p>

                  <p className="text-gray-300">
                    <span className="text-cyan-400 font-semibold">
                      Frequency:
                    </span>{" "}
                    {item.frequency}
                  </p>

                  <p className="text-gray-300">
                    <span className="text-cyan-400 font-semibold">
                      Reminder Time:
                    </span>{" "}
                    {item.reminder_time}
                  </p>

                  <p className="text-gray-400 text-sm">
                    {new Date(item.created_at).toLocaleString()}
                  </p>
                </div>

                <span
                  className={`px-4 py-2 rounded-xl font-bold ${
                    item.action === "ADDED"
                      ? "bg-green-900/30 text-green-400"
                      : item.action === "UPDATED"
                      ? "bg-yellow-900/30 text-yellow-400"
                      : "bg-red-900/30 text-red-400"
                  }`}
                >
                  {item.action}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default History;