import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  uploadPrescription,
  saveOCRMedicines,
} from "../services/medicineService";

const UploadPrescription = () => {
  const navigate = useNavigate();

  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);

  const [loading, setLoading] = useState(false);

  const [medicines, setMedicines] = useState([]);

  const [extractedText, setExtractedText] = useState("");

  const [disease, setDisease] = useState("OTHER");

  const handleUpload = async () => {
    if (!file) {
      alert("Please select a prescription image.");
      return;
    }

    try {
      setLoading(true);

      const response = await uploadPrescription(file);

      console.log(response);
      console.log("Medicines:", response.medicines);
      console.log(JSON.stringify(response.medicines[0], null, 2));
      setExtractedText(
        response.extracted_text || ""
      );

      setDisease(
        response.disease || "OTHER"
      );

setMedicines(
  (response.medicines || []).map(
    (medicine) => {

let frequency = 1;

switch (medicine.frequency) {
  case "Twice Daily":
    frequency = 2;
    break;

  case "Three Times Daily":
    frequency = 3;
    break;

  case "Four Times Daily":
    frequency = 4;
    break;

  default:
    frequency = 1;
}

     
let reminderTimes = [];

if (frequency === 1) {

  reminderTimes = [
     medicine.reminder_time || 
     "08:00",
   ];

} else if (frequency === 2) {

  reminderTimes = [
     "08:00",
      "18:00",
   ];

} else if (frequency === 3) {

   reminderTimes = [
     "08:00",
     "13:00",
     "21:00",
   ];

} else {

    reminderTimes = [
    "08:00",
    "13:00",
    "18:00",
    "21:00",
    ];
}
return {

        disease:
          response.disease || "OTHER",

        medicine_name:
          medicine.medicine_name || "",

        dosage:
          medicine.dosage || "",

        frequency:
          medicine.frequency || "",

        quantity:
          medicine.quantity || 30,

        quantity_per_dose:
          medicine.quantity_per_dose || 1,

        daily_frequency:
          frequency,

        remaining_quantity:
          medicine.remaining_quantity ||
          medicine.quantity ||
          30,
        reminder_times:
        reminderTimes,

      };

    }
  )
);

      if (
        (response.medicines || []).length === 0
      ) {
        alert(
          "No medicines detected."
        );
      } else {
        alert(
          "Prescription scanned successfully."
        );
      }

    } catch (error) {

      console.error(error);

      alert(
        "Unable to scan prescription."
      );

    } finally {

      setLoading(false);

    }
  };

  const handleChange = (
    index,
    field,
    value
  ) => {
    const updated = [...medicines];

    updated[index][field] = value;

    setMedicines(updated);
  };
  const handleSave = async () => {
    try {

      setLoading(true);

      await saveOCRMedicines({
        disease,
        medicines,
      });

      alert("Prescription saved successfully!");

      navigate("/medicines");

    } catch (error) {

      console.error(error);

      alert("Failed to save prescription.");

    } finally {

      setLoading(false);

    }
  };

  return (

    <div className="min-h-screen bg-[#0F1117] text-white py-10 px-6">

      <div className="max-w-7xl mx-auto">

        <div className="bg-[#1D2330] rounded-3xl border border-cyan-500/20 shadow-2xl p-8">

          <div className="mb-8">

            <h1 className="text-4xl font-bold text-cyan-400">
              📄 Upload Prescription
            </h1>

            <p className="text-gray-400 mt-3 text-lg">

              Upload your doctor's prescription.

              PillSync will automatically identify medicines
              and prepare your medication schedule.

            </p>

          </div>

          <div className="grid lg:grid-cols-2 gap-8">

            <div>

              <input
                type="file"
                id="prescription"
                accept="image/*"
                className="hidden"
                onChange={(e) => {

                  const selectedFile =
                    e.target.files[0];

                  if (selectedFile) {

                    setFile(selectedFile);

                    setPreview(
                      URL.createObjectURL(
                        selectedFile
                      )
                    );

                  }

                }}
              />

              <label
                htmlFor="prescription"
                className="cursor-pointer flex flex-col items-center justify-center border-2 border-dashed border-cyan-500 rounded-3xl h-72 hover:bg-[#111827] transition"
              >

                <div className="text-7xl">
                  📄
                </div>

                <h2 className="text-2xl font-bold mt-5 text-cyan-400">

                  Click to Upload

                </h2>

                <p className="text-gray-400 mt-3">

                  JPG • PNG • JPEG

                </p>

              </label>

            </div>

            <div>

              <h2 className="text-2xl font-bold text-cyan-400 mb-4">

                Prescription Preview

              </h2>

              <div className="bg-[#111827] border border-gray-700 rounded-3xl h-72 flex justify-center items-center overflow-hidden">

                {preview ? (

                  <img
                    src={preview}
                    alt="Prescription"
                    className="object-contain h-full w-full"
                  />

                ) : (

                  <div className="text-center">

                    <div className="text-6xl">
                      📋
                    </div>

                    <p className="text-gray-500 mt-4">

                      No Prescription Selected

                    </p>

                  </div>

                )}

              </div>

            </div>

          </div>

          <div className="flex justify-center mt-10">

            <button
              onClick={handleUpload}
              disabled={loading}
              className="bg-cyan-500 hover:bg-cyan-600 px-10 py-4 rounded-2xl text-lg font-bold text-black transition disabled:opacity-50"
            >

              {loading
                ? "Scanning Prescription..."
                : "📄 Scan Prescription"}

            </button>

          </div>
          {extractedText && (

            <div className="mt-12">

              <div className="grid lg:grid-cols-2 gap-8">

                <div className="bg-[#111827] rounded-3xl border border-cyan-500/20 p-6">

                  <h2 className="text-2xl font-bold text-cyan-400 mb-5">
                    🩺 Detected Disease
                  </h2>

                  <div className="bg-[#1E293B] rounded-2xl p-5 text-center">

                    <h3 className="text-3xl font-bold text-white">
                      {disease}
                    </h3>

                  </div>

                </div>

                <div className="bg-[#111827] rounded-3xl border border-cyan-500/20 p-6">

                  <h2 className="text-2xl font-bold text-cyan-400 mb-5">
                    📋 Prescription Summary
                  </h2>

                  <div className="bg-[#1E293B] rounded-2xl p-4 max-h-72 overflow-y-auto whitespace-pre-wrap text-gray-300 leading-7">

                    {extractedText}

                  </div>

                </div>

              </div>

            </div>

          )}

          {medicines.length > 0 && (

            <div className="mt-12">

              <h2 className="text-3xl font-bold text-cyan-400 mb-6">
                💊 Review Medicines
              </h2>

              <div className="overflow-x-auto rounded-3xl border border-cyan-500/20">

                <table className="w-full">

                  <thead className="bg-cyan-500 text-black">

                    <tr>

                      <th className="p-4 text-left">
                        Medicine
                      </th>

                      <th className="p-4 text-left">
                        Dosage
                      </th>

                      <th className="p-4 text-left">
                        Frequency
                      </th>

                      <th className="p-4 text-left">
                        Reminder
                      </th>

                    </tr>

                  </thead>

                  <tbody>

                    {medicines.map((medicine, index) => (

                      <tr
                        key={index}
                        className="border-b border-gray-700 bg-[#111827]"
                      >

                        <td className="p-3">

                          <input
                            className="w-full bg-[#1E293B] border border-gray-700 rounded-xl p-3"
                            value={medicine.medicine_name}
                            onChange={(e) =>
                              handleChange(
                                index,
                                "medicine_name",
                                e.target.value
                              )
                            }
                          />

                        </td>

                        <td className="p-3">

                          <input
                            className="w-full bg-[#1E293B] border border-gray-700 rounded-xl p-3"
                            value={medicine.dosage}
                            onChange={(e) =>
                              handleChange(
                                index,
                                "dosage",
                                e.target.value
                              )
                            }
                          />

                        </td>

                        <td className="p-3">

                          <input
                            className="w-full bg-[#1E293B] border border-gray-700 rounded-xl p-3"
                            value={medicine.frequency}
                            onChange={(e) =>
                              handleChange(
                                index,
                                "frequency",
                                e.target.value
                              )
                            }
                          />

                        </td>

                       <td className="p-3">
  <div className="space-y-2">
    {(medicine.reminder_times || []).map((time, i) => (
      <input
        key={i}
        type="time"
        value={time}
        className="w-full bg-[#1E293B] border border-gray-700 rounded-xl p-2"
        onChange={(e) => {
          const updated = [...medicines];
          updated[index].reminder_times[i] = e.target.value;
          setMedicines(updated);
        }}
      />
    ))}
  </div>
</td>
                      </tr>

                    ))}

                  </tbody>

                </table>

              </div>
              <div className="flex justify-between items-center mt-8">

                <div>

                  <h3 className="text-xl font-bold text-cyan-400">
                    Total Medicines Detected
                  </h3>

                  <p className="text-gray-400 mt-2">
                    {medicines.length} medicine(s) ready to be saved.
                  </p>

                </div>

                <button
                  onClick={handleSave}
                  disabled={loading}
                  className="bg-green-500 hover:bg-green-600 text-black font-bold px-8 py-4 rounded-2xl transition disabled:opacity-50"
                >
                  {loading
                    ? "Saving..."
                    : "💾 Save Prescription"}
                </button>

              </div>

            </div>

          )}

        </div>

      </div>

    </div>

  );

};

export default UploadPrescription;