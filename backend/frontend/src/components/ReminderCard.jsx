import { useState } from "react";

function ReminderCard({ medicine, time }) {

  const [status, setStatus] = useState("PENDING");


  const markTaken = () => {
    setStatus("TAKEN");
  };


  const markMissed = () => {
    setStatus("MISSED");
  };


  return (

    <div className="bg-white rounded-3xl p-6 shadow-lg border border-purple-100">


      <div className="flex justify-between items-center">

        <div>
          <h3 className="text-xl font-bold text-[#1E1B4B]">
            💊 {medicine}
          </h3>

          <p className="text-gray-500 mt-2">
            ⏰ {time}
          </p>
        </div>


        <div>

          {status === "TAKEN" && (
            <span className="bg-green-100 text-green-700 px-4 py-2 rounded-full">
              Taken
            </span>
          )}

          {status === "MISSED" && (
            <span className="bg-red-100 text-red-700 px-4 py-2 rounded-full">
              Missed
            </span>
          )}

        </div>

      </div>



      {status === "PENDING" && (

        <div className="flex gap-4 mt-6">

          <button
            onClick={markTaken}
            className="flex-1 bg-green-500 text-white py-3 rounded-2xl font-bold hover:scale-105 transition"
          >
            ✅ Taken
          </button>


          <button
            onClick={markMissed}
            className="flex-1 bg-red-500 text-white py-3 rounded-2xl font-bold hover:scale-105 transition"
          >
            ❌ Missed
          </button>

        </div>

      )}


    </div>

  );

}

export default ReminderCard;