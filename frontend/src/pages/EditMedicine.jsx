import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";

function EditMedicine() {

  const { id } = useParams();
  const navigate = useNavigate();

  const [medicine, setMedicine] = useState({
    disease: "",
    medicine_name: "",
    dosage: "",
    quantity: "",
    quantity_per_dose: "",
    daily_frequency: 1,
    frequency: "Once Daily",
    reminder_time: "",
    reminder_times: [""],
  });

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchMedicine();
  }, []);

  const fetchMedicine = async () => {

    try {

      const token = localStorage.getItem("access_token");

      const res = await axios.get(
        `http://127.0.0.1:8000/api/medicines/${id}/`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      console.log("Medicine Data:", res.data);

      const frequencyMap = {
        1: "Once Daily",
        2: "Twice Daily",
        3: "Three Times Daily",
        4: "Four Times Daily",
      };

      setMedicine({

        ...res.data,

        frequency:
          frequencyMap[res.data.daily_frequency] ||
          "Once Daily",

        reminder_times:
          res.data.schedules &&
          res.data.schedules.length > 0
            ? res.data.schedules.map(
                (schedule) =>
                  schedule.reminder_time.slice(0, 5)
              )
            : [
                res.data.reminder_time
                  ? res.data.reminder_time.slice(0, 5)
                  : "",
              ],

      });

      setLoading(false);

    } catch (err) {

      console.error(err);
      alert("Failed to load medicine.");
      setLoading(false);

    }

  };
  const handleChange = (e) => {

    const { name, value } = e.target;

    if (name === "daily_frequency") {

      const count = parseInt(value);

      const defaults = [
        "08:00",
        "13:00",
        "18:00",
        "21:00",
      ];

      let reminderTimes = [...medicine.reminder_times];

      while (reminderTimes.length < count) {
        reminderTimes.push(
          defaults[reminderTimes.length]
        );
      }

      reminderTimes = reminderTimes.slice(0, count);

      const frequencyMap = {
        1: "Once Daily",
        2: "Twice Daily",
        3: "Three Times Daily",
        4: "Four Times Daily",
      };

      setMedicine({
        ...medicine,
        daily_frequency: count,
        frequency: frequencyMap[count],
        reminder_times: reminderTimes,
        reminder_time: reminderTimes[0],
      });

      return;

    }

    setMedicine({
      ...medicine,
      [name]: value,
    });

  };

  const handleReminderTimeChange = (
    index,
    value
  ) => {

    const updated = [...medicine.reminder_times];

    updated[index] = value;

    setMedicine({
      ...medicine,
      reminder_times: updated,
      reminder_time: updated[0],
    });

  };

  const handleSubmit = async (e) => {

    e.preventDefault();

    try {

      const token = localStorage.getItem(
        "access_token"
      );

      await axios.put(
        `http://127.0.0.1:8000/api/medicines/${id}/`,
        {
          ...medicine,
          reminder_time:
            medicine.reminder_times[0],
          reminder_times:
            medicine.reminder_times,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      alert("Medicine Updated Successfully!");

      navigate("/medicines");

    } catch (err) {

      console.error(err);

      alert("Failed to update medicine.");

    }

  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0F1117] flex items-center justify-center">
        <div className="text-center">

          <div className="w-16 h-16 border-4 border-cyan-400 border-t-transparent rounded-full animate-spin mx-auto"></div>

          <p className="text-white text-xl mt-4">
            Loading Medicine...
          </p>

        </div>
      </div>
    );
  }

  return (

    <div className="min-h-screen bg-[#0F1117] text-white py-10 px-6">

      <div className="max-w-5xl mx-auto">

        <div className="bg-[#1D2330] border border-cyan-500/20 rounded-3xl shadow-2xl p-8">

          <div className="mb-8">

            <h1 className="text-4xl font-bold text-cyan-400">
              ✏ Edit Medicine
            </h1>

            <p className="text-gray-400 mt-2">
              Modify medicine details, dosage and reminder schedule.
            </p>

          </div>

          <form
            onSubmit={handleSubmit}
            className="grid md:grid-cols-2 gap-6"
          >
          <div>

              <label className="block mb-2 text-gray-300">
                Disease
              </label>

              <input
                type="text"
                name="disease"
                value={medicine.disease}
                onChange={handleChange}
                className="w-full bg-[#111827] border border-gray-700 rounded-xl p-4 focus:border-cyan-400 outline-none"
              />

            </div>

            <div>

              <label className="block mb-2 text-gray-300">
                Medicine Name
              </label>

              <input
                type="text"
                name="medicine_name"
                value={medicine.medicine_name}
                onChange={handleChange}
                className="w-full bg-[#111827] border border-gray-700 rounded-xl p-4 focus:border-cyan-400 outline-none"
              />

            </div>

            <div>

              <label className="block mb-2 text-gray-300">
                Dosage
              </label>

              <input
                type="text"
                name="dosage"
                value={medicine.dosage}
                onChange={handleChange}
                className="w-full bg-[#111827] border border-gray-700 rounded-xl p-4 focus:border-cyan-400 outline-none"
              />

            </div>

            <div>

              <label className="block mb-2 text-gray-300">
                Quantity
              </label>

              <input
                type="number"
                name="quantity"
                value={medicine.quantity}
                onChange={handleChange}
                className="w-full bg-[#111827] border border-gray-700 rounded-xl p-4 focus:border-cyan-400 outline-none"
              />

            </div>

            <div>

              <label className="block mb-2 text-gray-300">
                Quantity Per Dose
              </label>

              <input
                type="number"
                name="quantity_per_dose"
                value={medicine.quantity_per_dose}
                onChange={handleChange}
                className="w-full bg-[#111827] border border-gray-700 rounded-xl p-4 focus:border-cyan-400 outline-none"
              />

            </div>

            <div>

              <label className="block mb-2 text-gray-300">
                Daily Frequency
              </label>

              <select
                name="daily_frequency"
                value={medicine.daily_frequency}
                onChange={handleChange}
                className="w-full bg-[#111827] border border-gray-700 rounded-xl p-4 focus:border-cyan-400 outline-none"
              >
                <option value={1}>Once Daily</option>
                <option value={2}>Twice Daily</option>
                <option value={3}>Three Times Daily</option>
                <option value={4}>Four Times Daily</option>
              </select>

            </div>
            <div className="md:col-span-2">

              <label className="block text-lg font-semibold text-cyan-400 mb-5">
                ⏰ Reminder Times
              </label>

              <div className="grid md:grid-cols-2 gap-5">

                {medicine.reminder_times.map((time, index) => (

                  <div key={index}>

                    <label className="block text-gray-400 mb-2">
                      Reminder {index + 1}
                    </label>

                    <input
                      type="time"
                      value={time}
                      onChange={(e) =>
                        handleReminderTimeChange(
                          index,
                          e.target.value
                        )
                      }
                      className="w-full bg-[#111827] border border-gray-700 rounded-xl p-4 focus:border-cyan-400 outline-none"
                      required
                    />

                  </div>

                ))}

              </div>

            </div>

            <div className="md:col-span-2">

              <div className="bg-[#111827] border border-cyan-500/20 rounded-2xl p-6">

                <h3 className="text-2xl font-bold text-cyan-400 mb-6">
                  📋 Medicine Summary
                </h3>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-5">

                  <div>

                    <p className="text-gray-500 text-sm">
                      Medicine
                    </p>

                    <p className="text-white font-bold mt-1">
                      {medicine.medicine_name || "--"}
                    </p>

                  </div>

                  <div>

                    <p className="text-gray-500 text-sm">
                      Disease
                    </p>

                    <p className="text-white font-bold mt-1">
                      {medicine.disease || "--"}
                    </p>

                  </div>
                  <div>

                    <p className="text-gray-500 text-sm">
                      Quantity
                    </p>

                    <p className="text-cyan-400 font-bold mt-1">
                      {medicine.quantity}
                    </p>

                  </div>

                  <div>

                    <p className="text-gray-500 text-sm">
                      Frequency
                    </p>

                    <p className="text-green-400 font-bold mt-1">
                      {medicine.daily_frequency === 1
                        ? "Once Daily"
                        : medicine.daily_frequency === 2
                        ? "Twice Daily"
                        : medicine.daily_frequency === 3
                        ? "Three Times Daily"
                        : medicine.daily_frequency === 4
                        ? "Four Times Daily"
                        : "Custom"}
                    </p>

                  </div>

                </div>

              </div>

            </div>

            <div className="md:col-span-2 flex flex-col md:flex-row justify-end gap-4 mt-6">

              <button
                type="button"
                onClick={() => navigate("/medicines")}
                className="px-8 py-4 rounded-xl bg-gray-700 hover:bg-gray-600 text-white font-semibold transition duration-300"
              >
                ← Cancel
              </button>

              <button
                type="submit"
                className="px-8 py-4 rounded-xl bg-cyan-500 hover:bg-cyan-600 text-black font-bold transition duration-300 hover:scale-105"
              >
                💾 Update Medicine
              </button>

            </div>

          </form>

        </div>

        <div className="mt-8 grid md:grid-cols-3 gap-5">
        <div className="bg-[#1D2330] border border-cyan-500/20 rounded-2xl p-5">

            <h3 className="text-cyan-400 font-bold mb-2">
              💊 Medicine
            </h3>

            <p className="text-gray-400 text-sm">
              Update the medicine name, dosage and quantity whenever your doctor changes your prescription.
            </p>

          </div>

          <div className="bg-[#1D2330] border border-cyan-500/20 rounded-2xl p-5">

            <h3 className="text-cyan-400 font-bold mb-2">
              ⏰ Reminder
            </h3>

            <p className="text-gray-400 text-sm">
              Choose multiple reminder times based on your daily frequency to avoid missing any dose.
            </p>

          </div>

          <div className="bg-[#1D2330] border border-cyan-500/20 rounded-2xl p-5">

            <h3 className="text-cyan-400 font-bold mb-2">
              🩺 PillSync AI
            </h3>

            <p className="text-gray-400 text-sm">
              Every update is synchronized with your medicine schedule and medication history automatically.
            </p>

          </div>

        </div>

      </div>

    </div>

  );

}

export default EditMedicine;