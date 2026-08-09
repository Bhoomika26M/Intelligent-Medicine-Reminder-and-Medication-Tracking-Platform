import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { addMedicine } from "../services/medicineService";

function AddMedicine() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    disease: "",
    medicine_name: "",
    dosage: "",
    quantity: "",
    quantity_per_dose: 1,
    daily_frequency: 1,
    frequency: "Once Daily",
    reminder_time: "",
  });

  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;

    if (name === "daily_frequency") {
      let frequency = "Once Daily";

      if (value === "2") frequency = "Twice Daily";
      if (value === "3") frequency = "Three Times Daily";
      if (value === "4") frequency = "Four Times Daily";

      setFormData({
        ...formData,
        daily_frequency: value,
        frequency,
      });
    } else {
      setFormData({
        ...formData,
        [name]: value,
      });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      setLoading(true);

      await addMedicine(formData);

      alert("Medicine added successfully!");

      navigate("/medicines");
    } catch (error) {
      console.log(error);
      alert("Failed to add medicine");
    } finally {
      setLoading(false);
    }
  };
  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-100 via-pink-50 to-white p-8">

      <div className="max-w-3xl mx-auto bg-white rounded-3xl shadow-xl p-8">

        <h1 className="text-3xl font-bold text-purple-800 mb-2">
          💊 Add Medicine
        </h1>

        <p className="text-gray-500 mb-8">
          Enter medicine details to create reminders.
        </p>

        <form
          onSubmit={handleSubmit}
          className="space-y-6"
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

            <div>
              <label className="block text-gray-700 font-semibold mb-2">
                Disease
              </label>

              <select
                name="disease"
                value={formData.disease}
                onChange={handleChange}
                required
                className="w-full border border-gray-300 rounded-xl p-3 focus:ring-2 focus:ring-purple-500 outline-none"
              >
                <option value="">Select Disease</option>
                <option value="BP">Blood Pressure</option>
                <option value="DIABETES">Diabetes</option>
                <option value="THYROID">Thyroid</option>
                <option value="HEART">Heart Disease</option>
                <option value="ASTHMA">Asthma</option>
                <option value="FEVER">Fever</option>
                <option value="VITAMINS">Vitamin Deficiency</option>
                <option value="OTHER">Other</option>
              </select>
            </div>

            <div>
              <label className="block text-gray-700 font-semibold mb-2">
                Medicine Name
              </label>

              <input
                type="text"
                name="medicine_name"
                value={formData.medicine_name}
                onChange={handleChange}
                required
                className="w-full border border-gray-300 rounded-xl p-3 focus:ring-2 focus:ring-purple-500 outline-none"
              />
            </div>

            <div>
              <label className="block text-gray-700 font-semibold mb-2">
                Dosage
              </label>

              <input
                type="text"
                name="dosage"
                value={formData.dosage}
                onChange={handleChange}
                required
                placeholder="Example: 500 mg"
                className="w-full border border-gray-300 rounded-xl p-3 focus:ring-2 focus:ring-purple-500 outline-none"
              />
            </div>

            <div>
              <label className="block text-gray-700 font-semibold mb-2">
                Total Quantity
              </label>

              <input
                type="number"
                name="quantity"
                value={formData.quantity}
                onChange={handleChange}
                required
                min="1"
                className="w-full border border-gray-300 rounded-xl p-3 focus:ring-2 focus:ring-purple-500 outline-none"
              />
            </div>

            <div>
              <label className="block text-gray-700 font-semibold mb-2">
                Quantity Per Dose
              </label>

              <input
                type="number"
                name="quantity_per_dose"
                value={formData.quantity_per_dose}
                onChange={handleChange}
                required
                min="1"
                className="w-full border border-gray-300 rounded-xl p-3 focus:ring-2 focus:ring-purple-500 outline-none"
              />
            </div>

            <div>
              <label className="block text-gray-700 font-semibold mb-2">
                Daily Frequency
              </label>

              <select
                name="daily_frequency"
                value={formData.daily_frequency}
                onChange={handleChange}
                className="w-full border border-gray-300 rounded-xl p-3 focus:ring-2 focus:ring-purple-500 outline-none"
              >
                <option value="1">Once Daily</option>
                <option value="2">Twice Daily</option>
                <option value="3">Three Times Daily</option>
                <option value="4">Four Times Daily</option>
              </select>
            </div>

            <div className="md:col-span-2">
              <label className="block text-gray-700 font-semibold mb-2">
                Reminder Time
              </label>

              <input
                type="time"
                name="reminder_time"
                value={formData.reminder_time}
                onChange={handleChange}
                required
                className="w-full border border-gray-300 rounded-xl p-3 focus:ring-2 focus:ring-purple-500 outline-none"
              />
            </div>

          </div>

          <div className="flex gap-4 pt-6">

            <button
              type="button"
              onClick={() => navigate("/medicines")}
              className="flex-1 bg-gray-300 text-gray-700 py-3 rounded-2xl font-semibold hover:bg-gray-400 transition"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={loading}
              className="flex-1 bg-purple-600 text-white py-3 rounded-2xl font-semibold hover:bg-purple-700 transition disabled:opacity-50"
            >
              {loading ? "Adding..." : "➕ Add Medicine"}
            </button>

          </div>

        </form>

      </div>

    </div>
  );
}

export default AddMedicine;