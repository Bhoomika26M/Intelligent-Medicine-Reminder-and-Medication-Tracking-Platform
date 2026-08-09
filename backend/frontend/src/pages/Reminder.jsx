import { useEffect, useState } from "react";
import { getSchedules, updateScheduleStatus } from "../services/medicineService";

function Reminder() {
  const [schedules, setSchedules] = useState([]);
  const [loading, setLoading] = useState(true);

  const loadSchedules = async () => {
    try {
      const data = await getSchedules();

      console.log("SCHEDULE DATA:", data);

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
      <div className="min-h-screen flex justify-center items-center text-2xl font-bold">
        Loading reminders...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-100 via-pink-50 to-white p-8">
      <h1 className="text-4xl font-bold text-purple-900 mb-8">
        Medicine Reminders ⏰💊
      </h1>

      {schedules.length === 0 ? (
        <div className="bg-white rounded-3xl shadow-xl p-10 text-center">
          <h2 className="text-xl text-gray-500">
            No reminders available
          </h2>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 gap-6">
          {schedules.map((item) => (
            <div
              key={item.id}
              className="bg-white rounded-3xl shadow-xl p-6"
            >
              <h2 className="text-2xl font-bold text-purple-900">
                Medicine ID: {item.medicine}
              </h2>

              <p className="mt-3">
                ⏰ Reminder Time: {item.reminder_time}
              </p>

              <p className="mt-2">
                Status: <strong>{item.status}</strong>
              </p>

              <div className="flex gap-3 mt-5">
                <button
                  onClick={() => changeStatus(item.id, "TAKEN")}
                  className="bg-green-500 hover:bg-green-600 text-white px-5 py-2 rounded-xl"
                >
                  ✅ Taken
                </button>

                <button
                  onClick={() => changeStatus(item.id, "MISSED")}
                  className="bg-red-500 hover:bg-red-600 text-white px-5 py-2 rounded-xl"
                >
                  ❌ Missed
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default Reminder;