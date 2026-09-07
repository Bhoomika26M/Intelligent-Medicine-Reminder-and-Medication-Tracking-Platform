import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { addMedicine } from "../services/medicineService";
import diseases from "../data/diseases";

function AddMedicine() {
  const navigate = useNavigate();

  const [loading, setLoading] = useState(false);
  const reminderDefaults = {
     1: [
       { period: "Morning", time: "08:00" },
     ],

     2: [
       { period: "Morning", time: "08:00" },
       { period: "Night", time: "21:00" },
     ],

     3: [
       { period: "Morning", time: "08:00" },
       { period: "Afternoon", time: "13:00" },
       { period: "Night", time: "21:00" },
     ],

     4: [
       { period: "Morning", time: "08:00" },
       { period: "Afternoon", time: "13:00" },
       { period: "Evening", time: "18:00" },
       { period: "Night", time: "21:00" },
     ],
  };
  const [formData, setFormData] = useState({
    disease: "",
    medicine_name: "",
    dosage: "",
    quantity: "",
    quantity_per_dose: 1,
    daily_frequency: 1,
    frequency: "Once Daily",
    reminder_time: "08:00",
    reminder_times: ["08:00"],
  });
  const filteredDiseases =
    formData.disease.trim() === ""
      ? []
      : diseases
          .filter((disease) =>
            disease
              .toLowerCase()
              .includes(formData.disease.toLowerCase())
          )
          .slice(0, 8);

  const handleChange = (e) => {
    const { name, value } = e.target;

    if (name === "daily_frequency") {
      let frequency = "Once Daily";

      switch (Number(value)) {
        case 2:
          frequency = "Twice Daily";
          break;
        case 3:
          frequency = "Three Times Daily";
          break;
        case 4:
          frequency = "Four Times Daily";
          break;
        default:
          frequency = "Once Daily";
      }

      setFormData((prev) => {
  const count = Number(value);

  let reminderTimes = [];

  switch (count) {
  case 1:
    reminderTimes = ["08:00"]; // 🌅 Morning (AM)
    break;

  case 2:
    reminderTimes = ["08:00", "21:00"]; // 🌅 Morning, 🌙 Night
    break;

  case 3:
    reminderTimes = ["08:00", "13:00", "21:00"]; // 🌅 Morning, ☀ Afternoon, 🌙 Night
    break;

  case 4:
    reminderTimes = ["08:00", "13:00", "18:00", "21:00"]; // 🌅 Morning, ☀ Afternoon, 🌇 Evening, 🌙 Night
    break;

  default:
    reminderTimes = ["08:00"];
}
   return {
     ...prev,
     daily_frequency: count,
     frequency,
     reminder_times: reminderTimes,
     reminder_time: reminderTimes[0],
    };
  });

  return;
  }

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleDiseaseSelect = (disease) => {
    setFormData((prev) => ({
      ...prev,
      disease,
    }));
  };

  const handleReminderTimeChange = (index, value) => {
    const updated = [...formData.reminder_times];

    updated[index] = value;

    setFormData((prev) => ({
      ...prev,
      reminder_times: updated,
      reminder_time: updated[0],
    }));
  };
const handleSubmit = async (e) => {
  e.preventDefault();

  try {
    setLoading(true);

    const payload = {
      ...formData,
      reminder_time: formData.reminder_times[0],
    };

    await addMedicine(payload);

    alert("Medicine added successfully!");
    navigate("/medicines");
  } catch (error) {
    console.error(error);
    alert("Failed to add medicine");
  } finally {
    setLoading(false);
  }
};

  return (
    <div className="min-h-screen bg-[#0F1117] text-white">

      <div className="max-w-5xl mx-auto px-8 py-10">

        <div className="mb-8">

          <h1 className="text-5xl font-bold">
            Add
            <span className="text-[#00C2A8]"> Medicine</span>
          </h1>

          <p className="text-gray-400 mt-2">
            Add a medicine and schedule reminders.
          </p>

        </div>

        <form
          onSubmit={handleSubmit}
          className="bg-[#1D2330] rounded-3xl border border-gray-700 p-8 space-y-8"
        >

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

            {/* Disease */}

            <div className="relative">

              <label className="block mb-2 font-semibold">
                Disease
              </label>

              <input
                type="text"
                name="disease"
                value={formData.disease}
                onChange={handleChange}
                autoComplete="off"
                placeholder="Search disease..."
                className="w-full bg-[#151922] border border-gray-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-[#00C2A8]"
                required
              />

              {filteredDiseases.length > 0 && (

                <div className="absolute z-50 left-0 right-0 mt-2 bg-[#151922] border border-gray-700 rounded-xl max-h-56 overflow-y-auto">

                  {filteredDiseases.map((disease, index) => (

                    <div
                      key={index}
                      onClick={() => handleDiseaseSelect(disease)}
                      className="px-4 py-3 cursor-pointer hover:bg-[#00C2A8] hover:text-black transition"
                    >
                      {disease}
                    </div>

                  ))}

                </div>

              )}

            </div>

            {/* Medicine Name */}

            <div>

              <label className="block mb-2 font-semibold">
                Medicine Name
              </label>

              <input
                type="text"
                name="medicine_name"
                value={formData.medicine_name}
                onChange={handleChange}
                placeholder="Enter medicine name"
                className="w-full bg-[#151922] border border-gray-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-[#00C2A8]"
                required
              />

            </div>

            {/* Dosage */}

            <div>

              <label className="block mb-2 font-semibold">
                Dosage
              </label>

              <input
                type="text"
                name="dosage"
                value={formData.dosage}
                onChange={handleChange}
                placeholder="Example: 500 mg"
                className="w-full bg-[#151922] border border-gray-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-[#00C2A8]"
                required
              />

            </div>
            {/* Total Quantity */}

            <div>

              <label className="block mb-2 font-semibold">
                Total Quantity
              </label>

              <input
                type="number"
                name="quantity"
                value={formData.quantity}
                onChange={handleChange}
                min="1"
                placeholder="30"
                className="w-full bg-[#151922] border border-gray-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-[#00C2A8]"
                required
              />

            </div>

            {/* Quantity Per Dose */}

            <div>

              <label className="block mb-2 font-semibold">
                Quantity Per Dose
              </label>

              <input
                type="number"
                name="quantity_per_dose"
                value={formData.quantity_per_dose}
                onChange={handleChange}
                min="1"
                className="w-full bg-[#151922] border border-gray-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-[#00C2A8]"
                required
              />

            </div>

            {/* Daily Frequency */}

            <div>

              <label className="block mb-2 font-semibold">
                Daily Frequency
              </label>

              <select
                name="daily_frequency"
                value={formData.daily_frequency}
                onChange={handleChange}
                className="w-full bg-[#151922] border border-gray-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-[#00C2A8]"
              >
                <option value={1}>Once Daily</option>
                <option value={2}>Twice Daily</option>
                <option value={3}>Three Times Daily</option>
                <option value={4}>Four Times Daily</option>
              </select>

            </div>

            {/* Frequency */}

            <div>

              <label className="block mb-2 font-semibold">
                Frequency
              </label>

              <input
                type="text"
                value={formData.frequency}
                readOnly
                className="w-full bg-[#0F1117] border border-gray-700 rounded-xl px-4 py-3 text-gray-300"
              />

            </div>

          </div>

          {/* Reminder Times */}

          <div>

            <label className="block mb-4 text-lg font-semibold">
              Reminder Times
            </label>

            <div className="grid md:grid-cols-2 gap-4">

              {formData.reminder_times.map((time, index) => (

                <div key={index}>

                  <label className="block text-sm text-[#00C2A8] font-semibold mb-2">
                    {index === 0 && " Morning (AM)"}
                    {index === 1 && formData.daily_frequency === 2 && " Night (PM)"}
                    {index === 1 && formData.daily_frequency >= 3 && " Afternoon (PM)"}
                    {index === 2 && formData.daily_frequency === 3 && " Night (PM)"}
                    {index === 2 && formData.daily_frequency === 4 && " Evening (PM)"}
                    {index === 3 && "🌙 Night (PM)"}
                  </label>

                  <input
                     type="time"
                     step="60"
                     value={time}
                     onChange={(e) =>
                     handleReminderTimeChange(index, e.target.value)
                     }
                     className="w-full bg-[#151922] border border-gray-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-[#00C2A8]"
                     required
                  />
                </div>

              ))}

            </div>

          </div>
          {/* Buttons */}

          <div className="flex flex-col md:flex-row gap-4 pt-4">

            <button
              type="button"
              onClick={() => navigate("/medicines")}
              className="flex-1 py-3 rounded-xl border border-gray-600 text-gray-300 hover:bg-gray-700 transition font-semibold"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={loading}
              className="flex-1 py-3 rounded-xl bg-[#00C2A8] text-black font-bold hover:opacity-90 transition disabled:opacity-50"
            >
              {loading ? "Adding Medicine..." : "💊 Add Medicine"}
            </button>

          </div>

        </form>

      </div>

    </div>
  );

}
export default AddMedicine;