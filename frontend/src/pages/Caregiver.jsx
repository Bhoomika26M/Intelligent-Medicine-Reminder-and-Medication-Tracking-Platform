import { useState } from "react";
import axios from "axios";

function Caregiver() {
  const [caregiverId, setCaregiverId] = useState("");
  const [patientId, setPatientId] = useState("");

  const assignCaregiver = async () => {
    try {
      const token = localStorage.getItem("access");

      await axios.post(
        "http://127.0.0.1:8000/api/caregiver-assignments/",
        {
          caregiver: Number(caregiverId),
          patient: Number(patientId),
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      alert("✅ Caregiver assigned successfully!");

      setCaregiverId("");
      setPatientId("");
    } catch (error) {
      console.error(error);

      if (error.response) {
        alert(
          "❌ " +
            JSON.stringify(error.response.data, null, 2)
        );
      } else {
        alert("❌ Failed to connect to server.");
      }
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-8">
      <div className="max-w-xl mx-auto bg-white rounded-2xl shadow-xl p-8">
        <h1 className="text-3xl font-bold text-center text-indigo-700 mb-8">
          👨‍⚕️ Caregiver Assignment
        </h1>

        <div className="mb-5">
          <label className="block font-semibold mb-2">
            Caregiver ID
          </label>

          <input
            type="number"
            value={caregiverId}
            onChange={(e) => setCaregiverId(e.target.value)}
            placeholder="Enter Caregiver ID"
            className="w-full border rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>

        <div className="mb-6">
          <label className="block font-semibold mb-2">
            Patient ID
          </label>

          <input
            type="number"
            value={patientId}
            onChange={(e) => setPatientId(e.target.value)}
            placeholder="Enter Patient ID"
            className="w-full border rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>

        <button
          onClick={assignCaregiver}
          className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-3 rounded-lg transition"
        >
          Assign Caregiver
        </button>
      </div>
    </div>
  );
}

export default Caregiver;