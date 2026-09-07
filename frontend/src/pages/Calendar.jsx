import { useEffect, useState } from "react";
import Calendar from "react-calendar";
import "react-calendar/dist/Calendar.css";
import { getMedicineHistory } from "../services/medicineService";

function CalendarPage() {
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [history, setHistory] = useState([]);

  useEffect(() => {
    loadHistory();
  }, []);

  const loadHistory = async () => {
    try {
      const data = await getMedicineHistory();

      if (Array.isArray(data)) {
        setHistory(data);
      } else {
        setHistory([]);
      }
    } catch (error) {
      console.log(error);
      setHistory([]);
    }
  };

  const selectedHistory = history.filter((item) => {
    const historyDate = new Date(item.created_at);

    return (
      historyDate.toDateString() ===
      selectedDate.toDateString()
    );
  });

  return (
    <div className="min-h-screen bg-[#0F1117] p-8">

      <h1 className="text-4xl font-bold text-white mb-8">
        📅 Medication Calendar
      </h1>

      <div className="bg-[#1D2330] border border-gray-700 rounded-3xl p-8 shadow-xl">

        <div className="flex justify-center">
          <Calendar
             onChange={setSelectedDate}
             value={selectedDate}
             showNeighboringMonth={false}
             showFixedNumberOfWeeks={false}
          />
        </div>

        <h2 className="text-2xl font-bold text-cyan-400 mt-10 mb-5">
          Activity on {selectedDate.toDateString()}
        </h2>
        {selectedHistory.length === 0 ? (
          <div className="bg-[#151922] border border-gray-700 rounded-2xl p-8 text-center">
            <p className="text-gray-400 text-lg">
              No medication activity on this day.
            </p>
          </div>
        ) : (
          <div className="grid gap-5">
            {selectedHistory.map((item) => (
              <div
                key={item.id}
                className="bg-[#151922] border border-gray-700 rounded-2xl p-5 hover:border-cyan-500 transition"
              >
                <div className="flex justify-between items-start">

                  <div className="space-y-2">
                    <h3 className="text-2xl font-bold text-white">
                      💊 {item.medicine_name}
                    </h3>

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
                        Reminder Time:
                      </span>{" "}
                      {item.reminder_time}
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
    </div>
  );
}

export default CalendarPage;