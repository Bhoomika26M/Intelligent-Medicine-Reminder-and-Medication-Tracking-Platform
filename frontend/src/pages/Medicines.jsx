import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  getMedicines,
  deleteMedicine,
} from "../services/medicineService";

function Medicines() {
  const navigate = useNavigate();

  const [medicines, setMedicines] = useState([]);
  const [filteredMedicines, setFilteredMedicines] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);

  const loadMedicines = async () => {
    try {
      const data = await getMedicines();
      setMedicines(data);
      setFilteredMedicines(data);
    } catch (error) {
      console.error("Error loading medicines:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadMedicines();
  }, []);

  useEffect(() => {
    const filtered = medicines.filter(
      (medicine) =>
        medicine.medicine_name
          .toLowerCase()
          .includes(search.toLowerCase()) ||
        medicine.disease
          .toLowerCase()
          .includes(search.toLowerCase())
    );

    setFilteredMedicines(filtered);
  }, [search, medicines]);

  const totalMedicines = medicines.length;

  const lowStock = medicines.filter(
    (medicine) => medicine.remaining_quantity <= 5
  ).length;

  const activeMedicines = medicines.filter(
    (medicine) => medicine.remaining_quantity > 0
  ).length;

  const refillNeeded = lowStock;

  const handleDelete = async (id) => {
    const confirmDelete = window.confirm(
      "Are you sure you want to delete this medicine?"
    );

    if (!confirmDelete) return;

    try {
      await deleteMedicine(id);
      loadMedicines();
    } catch (error) {
      console.error(error);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0F1117] flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-cyan-400 border-t-transparent rounded-full animate-spin mx-auto"></div>

          <p className="text-white mt-5 text-xl">
            Loading Medicines...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0F1117] text-white">

      <div className="px-8 pt-8 flex flex-col lg:flex-row justify-between items-center gap-5">

        <div>
          <h1 className="text-5xl font-bold">
            Medicine Management
          </h1>

          <p className="text-gray-400 mt-2">
            View and manage all your medicines from one place.
          </p>
        </div>

        <div className="flex flex-wrap gap-3">

          <input
            type="text"
            placeholder="Search medicine..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-72 px-4 py-3 rounded-xl bg-[#1D2330] border border-gray-700 text-white"
          />

          <button
            onClick={() => navigate("/add-medicine")}
            className="bg-cyan-400 text-black px-5 py-3 rounded-xl font-bold"
          >
            + Add Medicine
          </button>

          <button
            onClick={() => navigate("/upload-prescription")}
            className="bg-[#232B3B] px-5 py-3 rounded-xl border border-gray-700"
          >
            Upload Prescription
          </button>

        </div>

      </div>
      {/* Statistics */}

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 px-8 mt-8">

        <div className="bg-[#1D2330] rounded-2xl p-6 border border-gray-700">
          <p className="text-gray-400 text-sm">
            Total Medicines
          </p>

          <h2 className="text-4xl font-bold text-cyan-400 mt-2">
            {totalMedicines}
          </h2>
        </div>

        <div className="bg-[#1D2330] rounded-2xl p-6 border border-gray-700">
          <p className="text-gray-400 text-sm">
            Active Medicines
          </p>

          <h2 className="text-4xl font-bold text-green-400 mt-2">
            {activeMedicines}
          </h2>
        </div>

        <div className="bg-[#1D2330] rounded-2xl p-6 border border-gray-700">
          <p className="text-gray-400 text-sm">
            Low Stock
          </p>

          <h2 className="text-4xl font-bold text-red-400 mt-2">
            {lowStock}
          </h2>
        </div>

        <div className="bg-[#1D2330] rounded-2xl p-6 border border-gray-700">
          <p className="text-gray-400 text-sm">
            Refill Needed
          </p>

          <h2 className="text-4xl font-bold text-yellow-400 mt-2">
            {refillNeeded}
          </h2>
        </div>

      </div>

      {/* Medicines Table */}

      <div className="px-8 py-8">

        <div className="bg-[#1D2330] rounded-3xl border border-gray-700 overflow-x-auto shadow-xl">

          {filteredMedicines.length === 0 ? (

            <div className="text-center py-16">

              <h2 className="text-3xl font-bold">
                No Medicines Found
              </h2>

              <p className="text-gray-400 mt-3">
                Add medicines or search again.
              </p>

            </div>

          ) : (

            <table className="w-full">

              <thead className="bg-[#111827] border-b border-gray-700">

                <tr>

                  <th className="text-left p-5">
                    Medicine
                  </th>

                  <th className="text-left p-5">
                    Disease
                  </th>

                  <th className="text-left p-5">
                    Dosage
                  </th>

                  <th className="text-left p-5">
                    Frequency
                  </th>

                  <th className="text-left p-5">
                    Remaining
                  </th>

                  <th className="text-left p-5">
                    Reminder
                  </th>

                  <th className="text-left p-5">
                    Status
                  </th>

                  <th className="text-center p-5">
                    Actions
                  </th>

                </tr>

              </thead>

              <tbody>

              {filteredMedicines.map((medicine) => (

                <tr
                  key={medicine.id}
                  className="border-b border-gray-700 hover:bg-[#252D3D] transition duration-300"
                >

                  <td className="p-5 font-semibold text-cyan-400">
                    {medicine.medicine_name}
                  </td>

                  <td className="p-5">
                    {medicine.disease}
                  </td>

                  <td className="p-5">
                    {medicine.dosage}
                  </td>

                  <td className="p-5">
                    {medicine.frequency}
                  </td>

                  <td className="p-5 font-semibold">
                    {medicine.remaining_quantity}
                  </td>

                  <td className="p-5">
  <div className="space-y-1">

    {medicine.schedules &&
    medicine.schedules.length > 0 ? (

      medicine.schedules.map((schedule, index) => (
        <div
          key={index}
          className="bg-[#2A3446] px-2 py-1 rounded-lg text-center"
        >
          {schedule.reminder_time.slice(0, 5)}
        </div>
      ))

    ) : (

      <span>
        {medicine.reminder_time?.slice(0, 5)}
      </span>

    )}

  </div>
</td>
                  <td className="p-5">

                    <span
                      className={`px-4 py-2 rounded-full text-sm font-semibold ${
                        medicine.remaining_quantity <= 5
                          ? "bg-red-500 text-white"
                          : "bg-green-600 text-white"
                      }`}
                    >
                      {medicine.remaining_quantity <= 5
                        ? "Low Stock"
                        : "Available"}
                    </span>

                  </td>

                  <td className="p-5">

                    <div className="flex justify-center gap-3">

                      <button
                        onClick={() =>
                          navigate(`/edit-medicine/${medicine.id}`)
                        }
                        className="bg-cyan-400 hover:bg-cyan-500 text-black font-semibold px-5 py-2 rounded-xl transition"
                      >
                        Edit
                      </button>

                      <button
                        onClick={() =>
                          handleDelete(medicine.id)
                        }
                        className="bg-red-600 hover:bg-red-700 text-white font-semibold px-5 py-2 rounded-xl transition"
                      >
                        Delete
                      </button>

                    </div>

                  </td>

                </tr>

              ))}

              </tbody>

            </table>

          )}

        </div>

      </div>

    </div>

  );
}

export default Medicines;