import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getMedicines } from "../services/medicineService";
import { getDashboard } from "../services/dashboardService";

function Dashboard() {
  const navigate = useNavigate();

  const [medicines, setMedicines] = useState([]);

  const [dashboard, setDashboard] = useState({
    total_medicines: 0,
    today_reminders: 0,
    taken_today: 0,
    missed_today: 0,
    low_stock: 0,
  });

  useEffect(() => {
    loadMedicines();
    loadDashboard();
  }, []);

  const loadMedicines = async () => {
    try {
      const data = await getMedicines();
      setMedicines(data);
    } catch (err) {
      console.log(err);
    }
  };

  const loadDashboard = async () => {
    try {
      const data = await getDashboard();
      setDashboard(data);
    } catch (err) {
      console.log(err);
    }
  };

  const lowStock = medicines.filter(
    (medicine) => medicine.remaining_quantity <= 5
  );

  const totalToday =
    dashboard.taken_today + dashboard.missed_today;

  const adherence =
    totalToday > 0
      ? Math.round(
          (dashboard.taken_today / totalToday) * 100
        )
      : 0;

  return (
    <div className="min-h-screen bg-[#0F1117] text-white">

      {/* Header */}

      <div className="px-8 pt-8">

        <h1 className="text-5xl font-extrabold">
          Welcome to
          <span className="text-[#00C2A8]">
            {" "}PillSync
          </span>
        </h1>

        <p className="text-gray-400 mt-2 text-lg">
          Smart Medication Reminder Platform
        </p>

      </div>

      {/* Statistics */}

      <div className="px-8 mt-8">

        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-5 gap-6">

          <div className="bg-[#1A1D26] rounded-3xl border border-gray-800 p-6 transition hover:border-[#00C2A8]">

            <p className="text-gray-400 text-xs uppercase tracking-widest">
              Total Medicines
            </p>

            <h2 className="text-5xl font-bold mt-5 text-[#00C2A8]">
              {dashboard.total_medicines}
            </h2>

          </div>

          <div className="bg-[#1A1D26] rounded-3xl border border-gray-800 p-6 transition hover:border-[#00C2A8]">

            <p className="text-gray-400 text-xs uppercase tracking-widest">
              Today's Reminders
            </p>

            <h2 className="text-5xl font-bold mt-5 text-cyan-400">
              {dashboard.today_reminders}
            </h2>

          </div>

          <div className="bg-[#1A1D26] rounded-3xl border border-gray-800 p-6 transition hover:border-green-500">

            <p className="text-gray-400 text-xs uppercase tracking-widest">
              Taken Today
            </p>

            <h2 className="text-5xl font-bold mt-5 text-green-400">
              {dashboard.taken_today}
            </h2>

          </div>

          <div className="bg-[#1A1D26] rounded-3xl border border-gray-800 p-6 transition hover:border-red-500">

            <p className="text-gray-400 text-xs uppercase tracking-widest">
              Missed Today
            </p>

            <h2 className="text-5xl font-bold mt-5 text-red-400">
              {dashboard.missed_today}
            </h2>

          </div>

          <div className="bg-[#1A1D26] rounded-3xl border border-gray-800 p-6">

            <p className="text-gray-400 text-xs uppercase tracking-widest">
              Medication Adherence
            </p>

            <h2 className="text-5xl font-bold mt-5 text-yellow-400">
              {adherence}%
            </h2>

            <div className="w-full bg-gray-700 h-3 rounded-full mt-5">

              <div
                className="bg-[#00C2A8] h-3 rounded-full transition-all duration-500"
                style={{ width: `${adherence}%` }}
              />

            </div>

          </div>

        </div>

      </div>

      {/* Quick Actions */}

      <div className="px-8 mt-10">

        <div className="bg-[#1A1D26] border border-gray-800 rounded-3xl p-8">

          <div className="flex justify-between items-center mb-6">

            <h2 className="text-2xl font-bold">
              Quick Actions
            </h2>

            <p className="text-gray-500 text-sm">
              Manage your medication quickly
            </p>

          </div>

          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">

            <button
              onClick={() => navigate("/add-medicine")}
              className="bg-[#232B3B] border border-gray-700 rounded-xl py-3 font-semibold hover:border-[#00C2A8] hover:text-[#00C2A8] transition-all duration-300"
            >
              Add Medicine
            </button>

            <button
              onClick={() => navigate("/medicines")}
              className="bg-[#232B3B] border border-gray-700 rounded-xl py-3 font-semibold hover:border-[#00C2A8] hover:text-[#00C2A8] transition-all duration-300"
            >
              Medicines
            </button>

            <button
              onClick={() => navigate("/reminders")}
              className="bg-[#232B3B] border border-gray-700 rounded-xl py-3 font-semibold hover:border-[#00C2A8] hover:text-[#00C2A8] transition-all duration-300"
            >
              Reminders
            </button>

            <button
              onClick={() => navigate("/history")}
              className="bg-[#232B3B] border border-gray-700 rounded-xl py-3 font-semibold hover:border-[#00C2A8] hover:text-[#00C2A8] transition-all duration-300"
            >
              History
            </button>

            <button
              onClick={() => navigate("/calendar")}
              className="bg-[#232B3B] border border-gray-700 rounded-xl py-3 font-semibold hover:border-[#00C2A8] hover:text-[#00C2A8] transition-all duration-300"
            >
              Calendar
            </button>

          </div>

        </div>

      </div>

      {/* Recent Medicines */}

      <div className="px-8 mt-10">

        <div className="bg-[#1A1D26] border border-gray-800 rounded-3xl p-8">

          <div className="flex justify-between items-center mb-6">

            <h2 className="text-2xl font-bold">
              Recent Medicines
            </h2>

            <button
              onClick={() => navigate("/medicines")}
              className="text-[#00C2A8] hover:underline"
            >
              View All
            </button>

          </div>

          {medicines.length === 0 ? (

            <div className="text-center py-12">

              <p className="text-gray-400 text-lg">
                No medicines available.
              </p>

            </div>

          ) : (

            <div className="space-y-4">

              {medicines.slice(0, 5).map((medicine) => (

                <div
                  key={medicine.id}
                  className="flex justify-between items-center bg-[#232B3B] border border-gray-700 rounded-2xl p-5 hover:border-[#00C2A8] transition-all duration-300"
                >

                  <div>

                    <h3 className="text-xl font-semibold">
                      {medicine.medicine_name}
                    </h3>

                    <p className="text-gray-400 mt-1">
                      {medicine.disease}
                    </p>

                    <p className="text-gray-500 text-sm">
                      {medicine.dosage}
                    </p>

                  </div>

                  <span
                    className={`px-5 py-2 rounded-full font-semibold ${
                      medicine.remaining_quantity <= 5
                        ? "bg-red-500"
                        : "bg-green-600"
                    }`}
                  >
                    {medicine.remaining_quantity} Left
                  </span>

                </div>

              ))}

            </div>

          )}

        </div>

      </div>

      {/* Low Stock & Refill Prediction */}

      <div className="px-8 mt-10 mb-10">

        {lowStock.length > 0 ? (

          <div className="bg-[#1A1D26] border border-red-500 rounded-3xl p-8">

            <div className="flex justify-between items-center mb-6">

              <h2 className="text-2xl font-bold text-red-400">
                Low Stock & Refill Prediction
              </h2>

              <span className="text-sm text-gray-500">
                Refill Required
              </span>

            </div>

            <div className="space-y-4">

              {lowStock.map((medicine) => (

                <div
                  key={medicine.id}
                  className="flex justify-between items-center bg-[#232B3B] border border-red-500 rounded-2xl p-5 hover:shadow-lg transition-all duration-300"
                >

                  <div>

                    <h3 className="text-lg font-semibold">
                      {medicine.medicine_name}
                    </h3>

                    <p className="text-gray-400 mt-1">
                      {medicine.disease}
                    </p>

                    <p className="text-sm text-gray-500">
                      {medicine.dosage}
                    </p>

                    {/* NEW: Refill Prediction */}

                    <p className="text-sm text-purple-400 mt-2">
                      Estimated Days Left:{" "}
                      {medicine.estimated_days_left ?? 0} days
                    </p>

                  </div>

                  <div className="text-right">

                    <span className="inline-block bg-red-500 text-white px-4 py-2 rounded-full font-semibold">
                      {medicine.remaining_quantity} Left
                    </span>

                    {medicine.estimated_days_left <= 5 ? (

                      <p className="text-xs text-orange-400 mt-2 font-semibold">
                        Refill Soon
                      </p>

                    ) : (

                      <p className="text-xs text-gray-500 mt-2">
                        Stock Available
                      </p>

                    )}

                  </div>

                </div>

              ))}

            </div>

          </div>

        ) : (

          <div className="bg-[#1A1D26] border border-gray-800 rounded-3xl p-8 text-center">

            <h2 className="text-2xl font-bold text-green-400">
              Inventory Status
            </h2>

            <p className="text-gray-400 mt-3">
              Great! No medicines are currently running low.
            </p>

          </div>

        )}

      </div>

    </div>
  );
}

export default Dashboard;