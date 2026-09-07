import { useEffect, useState } from "react";
import { getMedicines } from "../services/medicineService";

function RefillPrediction() {
  const [medicines, setMedicines] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadMedicines();
  }, []);

  const loadMedicines = async () => {
    try {
      const data = await getMedicines();
      setMedicines(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Refill prediction error:", error);
      setMedicines([]);
    } finally {
      setLoading(false);
    }
  };

  const getDaysLeft = (medicine) => {
    if (medicine.estimated_days_left !== undefined) {
      return medicine.estimated_days_left;
    }

    if (
      medicine.daily_frequency > 0 &&
      medicine.quantity_per_dose > 0
    ) {
      return Math.floor(
        medicine.remaining_quantity /
          (medicine.quantity_per_dose *
            medicine.daily_frequency)
      );
    }

    return 0;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0F1117] text-white flex items-center justify-center">
        <p className="text-gray-400">
          Loading refill predictions...
        </p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0F1117] text-white px-6 md:px-8 py-8">

      <div className="mb-8">
        <h1 className="text-3xl md:text-4xl font-bold text-red-400">
          Low Stock & Refill Prediction
        </h1>

        <p className="text-gray-400 mt-2">
          Monitor remaining medicine stock and estimated refill requirements.
        </p>
      </div>

      {medicines.length === 0 ? (
        <div className="bg-[#1D2330] border border-gray-700 rounded-3xl p-10 text-center">
          <p className="text-gray-400">
            No medicines available for refill prediction.
          </p>
        </div>
      ) : (
        <div className="space-y-5">

          {medicines.map((medicine) => {
            const daysLeft = getDaysLeft(medicine);

            const isLowStock =
              medicine.remaining_quantity <= 5;

            return (
              <div
                key={medicine.id}
                className={`bg-[#1D2330] rounded-2xl p-6 border ${
                  isLowStock
                    ? "border-red-500"
                    : "border-gray-700"
                }`}
              >

                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-5">

                  <div>
                    <h2 className="text-xl font-bold">
                      {medicine.medicine_name}
                    </h2>

                    <p className="text-gray-400 mt-2">
                      {medicine.disease || "General Medication"}
                    </p>

                    <p className="text-gray-500 mt-1">
                      {medicine.dosage}
                    </p>

                    <p className="text-gray-300 mt-3">
                      Estimated Days Left:{" "}
                      <span className="font-bold">
                        {daysLeft} days
                      </span>
                    </p>
                  </div>

                  <div className="text-right">

                    <span
                      className={`inline-block px-5 py-2 rounded-full font-bold ${
                        isLowStock
                          ? "bg-red-500 text-white"
                          : "bg-green-600 text-white"
                      }`}
                    >
                      {medicine.remaining_quantity} Left
                    </span>

                    <p
                      className={`text-sm mt-2 ${
                        isLowStock
                          ? "text-red-400"
                          : "text-green-400"
                      }`}
                    >
                      {isLowStock
                        ? "Refill Soon"
                        : "Stock Available"}
                    </p>

                  </div>

                </div>

              </div>
            );
          })}

        </div>
      )}
    </div>
  );
}

export default RefillPrediction;