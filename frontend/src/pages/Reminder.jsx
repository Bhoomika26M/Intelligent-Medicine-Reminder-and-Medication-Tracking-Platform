import { useEffect, useState } from "react";
import {
  getSchedules,
  updateScheduleStatus,
} from "../services/medicineService";

function Reminder() {
  const [schedules, setSchedules] = useState([]);
  const [loading, setLoading] = useState(true);

  const loadSchedules = async () => {
    try {
      const data = await getSchedules();

      if (Array.isArray(data)) {
        setSchedules(data);
      } else {
        setSchedules([]);
      }
    } catch (error) {
      console.error("Error loading schedules:", error);
      setSchedules([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadSchedules();
  }, []);

  const changeStatus = async (id, status) => {
    try {
      await updateScheduleStatus(id, status);
      await loadSchedules();
    } catch (error) {
      console.error("Error updating status:", error);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0F1117] flex justify-center items-center">
        <h1 className="text-3xl font-bold text-cyan-400 animate-pulse">
          Loading Reminders...
        </h1>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0F1117] p-8">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-4xl font-bold text-white">
            Medicine Reminders
          </h1>

          <p className="text-gray-400 mt-2">
            Track today's medication schedule
          </p>
        </div>

        <div className="bg-[#1D2330] px-5 py-3 rounded-2xl border border-cyan-500">
          <span className="text-cyan-400 font-semibold">
            Total: {schedules.length}
          </span>
        </div>
      </div>

      {schedules.length === 0 ? (
        <div className="bg-[#1D2330] rounded-3xl border border-gray-700 p-12 text-center">
          <h2 className="text-2xl text-gray-400">
            No reminders available
          </h2>
        </div>
      ) : (
        <div className="grid lg:grid-cols-2 gap-6">
          {schedules.map((item) => (
            <div
              key={item.id}
              className="bg-[#1D2330] border border-gray-700 rounded-3xl p-6 shadow-lg hover:border-cyan-500 hover:shadow-cyan-500/20 transition-all duration-300"
            >
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-2xl font-bold text-white">
                  💊 {item.medicine_name}
                </h2>

                <span className="text-2xl">⏰</span>
              </div>

              <div className="space-y-3">
                <p className="text-gray-300">
                  <span className="font-semibold text-cyan-400">
                    Reminder Time:
                  </span>{" "}
                  {item.reminder_time}
                </p>

                <p className="text-gray-300">
                  <span className="font-semibold text-cyan-400">
                    Status:
                  </span>{" "}
                  <span
                    className={`font-bold ${
                      item.status === "PENDING"
                        ? "text-yellow-400"
                        : item.status === "TAKEN"
                        ? "text-green-400"
                        : "text-red-400"
                    }`}
                  >
                    {item.status}
                  </span>
                </p>
              </div>

              {item.status === "PENDING" ? (
                <div className="flex gap-4 mt-6">
                  <button
                    onClick={() => changeStatus(item.id, "TAKEN")}
                    className="flex-1 bg-green-600 hover:bg-green-700 text-white py-3 rounded-xl font-semibold transition"
                  >
                    ✅ Taken
                  </button>

                  <button
                    onClick={() => changeStatus(item.id, "MISSED")}
                    className="flex-1 bg-red-600 hover:bg-red-700 text-white py-3 rounded-xl font-semibold transition"
                  >
                    ❌ Missed
                  </button>
                </div>
              ) : (
                <div
                  className={`mt-6 text-center py-3 rounded-xl font-semibold ${
                    item.status === "TAKEN"
                      ? "bg-green-900/30 text-green-400"
                      : "bg-red-900/30 text-red-400"
                  }`}
                >
                  ✔ Status already updated
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default Reminder;