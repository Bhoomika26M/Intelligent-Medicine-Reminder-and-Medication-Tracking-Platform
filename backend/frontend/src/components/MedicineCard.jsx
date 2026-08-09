function MedicineCard({name, time}) {

  return (

    <div className="bg-white rounded-3xl p-6 shadow-lg border border-purple-100 hover:scale-[1.02] transition">


      <div className="flex justify-between items-center">

        <div>

          <h3 className="text-xl font-bold text-[#1E1B4B]">
            💊 {name}
          </h3>

          <p className="text-gray-500 mt-2">
            ⏰ {time}
          </p>

        </div>


        <div className="text-4xl">
          💜
        </div>

      </div>



      <div className="flex gap-4 mt-6">


        <button className="flex-1 bg-green-500 text-white py-3 rounded-2xl font-semibold hover:bg-green-600 transition">

          ✅ Taken

        </button>



        <button className="flex-1 bg-red-500 text-white py-3 rounded-2xl font-semibold hover:bg-red-600 transition">

          ❌ Missed

        </button>


      </div>


    </div>

  );

}

export default MedicineCard;