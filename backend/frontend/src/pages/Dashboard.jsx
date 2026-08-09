import { useEffect, useState } from "react";
import { getMedicines } from "../services/medicineService";
import { getDashboard } from "../services/dashboardService";
import { useNavigate } from "react-router-dom";

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

  const loadMedicines = async () => {
    try {
      const response = await getMedicines();
      setMedicines(response);
    } catch (error) {
      console.log(error);
    }
  };

  const loadDashboard = async () => {
    try {
      const response = await getDashboard();
      setDashboard(response);
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    loadMedicines();
    loadDashboard();
  }, []);

  const lowStock = medicines.filter(
    (medicine) => medicine.remaining_quantity <= 5
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-100 via-pink-50 to-white p-8">

      <h1 className="text-4xl font-bold text-purple-900">
        Welcome to PillSync 💊
      </h1>

      <p className="text-gray-600 mb-8">
        Smart Medication Reminder & Tracking Platform
      </p>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">

        <div className="bg-white p-6 rounded-3xl shadow-xl">
          <h3 className="text-gray-500">Total Medicines</h3>
          <p className="text-5xl font-bold text-purple-700">
            {dashboard.total_medicines}
          </p>
        </div>

        <div className="bg-white p-6 rounded-3xl shadow-xl">
          <h3 className="text-gray-500">Today's Reminders</h3>
          <p className="text-5xl font-bold text-pink-600">
            {dashboard.today_reminders}
          </p>
        </div>

        <div className="bg-white p-6 rounded-3xl shadow-xl">
          <h3 className="text-gray-500">Taken Today</h3>
          <p className="text-5xl font-bold text-green-600">
            {dashboard.taken_today}
          </p>
        </div>

        <div className="bg-white p-6 rounded-3xl shadow-xl">
          <h3 className="text-gray-500">Missed Today</h3>
          <p className="text-5xl font-bold text-red-500">
            {dashboard.missed_today}
          </p>
        </div>

      </div>

      <div className="mt-10 bg-white rounded-3xl shadow-xl p-8">

        <h2 className="text-2xl font-bold text-purple-800 mb-6">
          Quick Actions
        </h2>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-5">

          <button
            onClick={() => navigate("/add-medicine")}
            className="bg-purple-600 text-white rounded-2xl p-4 font-bold hover:bg-purple-700"
          >
            ➕ Add Medicine
          </button>

          <button
            onClick={() => navigate("/medicines")}
            className="bg-pink-500 text-white rounded-2xl p-4 font-bold hover:bg-pink-600"
          >
            💊 Medicines
          </button>

          <button
            onClick={() => navigate("/reminders")}
            className="bg-blue-500 text-white rounded-2xl p-4 font-bold hover:bg-blue-600"
          >
            ⏰ Reminders
          </button>

          <button
            onClick={() => navigate("/history")}
            className="bg-green-600 text-white rounded-2xl p-4 font-bold hover:bg-green-700"
          >
            📜 History
          </button>

        </div>

      </div>

      {lowStock.length > 0 && (

        <div className="mt-10 bg-red-50 border border-red-200 rounded-3xl p-6">

          <h2 className="text-xl font-bold text-red-600 mb-4">
            ⚠ Low Stock Alert
          </h2>

          {lowStock.map((medicine) => (
            <div
              key={medicine.id}
              className="bg-white rounded-xl p-4 mb-3 shadow"
            >
              <p className="font-semibold">
                {medicine.medicine_name}
              </p>

              <p className="text-red-600">
                Only {medicine.remaining_quantity} tablets left
              </p>

            </div>
          ))}

        </div>

      )}

    </div>
  );
}

export default Dashboard;