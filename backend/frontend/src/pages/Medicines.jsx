import { useEffect, useState } from "react";
import { getMedicines, deleteMedicine } from "../services/medicineService";
import { useNavigate } from "react-router-dom";

function Medicines() {
  const navigate = useNavigate();

  const [medicines, setMedicines] = useState([]);

  const loadMedicines = async () => {
    try {
      const medicines = await getMedicines();

      setMedicines(Array.isArray(medicines) ? medicines : []);
    } catch (error) {
      console.error(error);
      setMedicines([]);
    }
  };

  useEffect(() => {
    loadMedicines();
  }, []);

  const handleDelete = async (id) => {
    const confirmDelete = window.confirm("Delete this medicine?");

    if (confirmDelete) {
      try {
        await deleteMedicine(id);
        loadMedicines();
      } catch (error) {
        console.error(error);
      }
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-100 via-pink-50 to-white p-8">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-4xl font-bold text-purple-900">
            My Medicines 💊
          </h1>

          <p className="text-gray-600">
            Manage your medication safely
          </p>
        </div>

        <button
          onClick={() => navigate("/add-medicine")}
          className="bg-gradient-to-r from-purple-600 to-pink-500 text-white px-6 py-3 rounded-2xl font-bold shadow-lg hover:scale-105 transition"
        >
          + Add Medicine
        </button>
      </div>

      {medicines.length === 0 ? (
        <div className="bg-white rounded-3xl p-10 text-center shadow-xl">
          <h2 className="text-xl font-bold text-gray-600">
            No medicines added yet
          </h2>

          <p className="mt-2 text-gray-500">
            Click Add Medicine to start tracking
          </p>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 gap-6">
          {medicines.map((medicine) => (
            <div
              key={medicine.id}
              className="bg-white rounded-3xl shadow-xl p-6 border"
            >
              <h2 className="text-2xl font-bold text-purple-900">
                {medicine.medicine_name}
              </h2>

              <p className="mt-3">
                💊 Dosage: {medicine.dosage}
              </p>

              <p>
                📦 Quantity: {medicine.quantity}
              </p>
              <p>
               📦 Remaining Quantity: {medicine.remaining_quantity}
              </p>
              <p>
                ⏰ Frequency: {medicine.frequency}
              </p>

              <p>
                🕒 Reminder: {medicine.reminder_time}
              </p>

              <button
                onClick={() => handleDelete(medicine.id)}
                className="mt-5 bg-red-500 text-white px-5 py-2 rounded-xl hover:bg-red-600"
              >
                Delete
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default Medicines;