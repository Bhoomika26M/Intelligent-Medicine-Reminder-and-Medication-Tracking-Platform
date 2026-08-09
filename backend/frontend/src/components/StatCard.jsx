function StatCard({ icon, title, value, subtitle, color }) {
  return (
    <div className="bg-white rounded-3xl p-6 shadow-lg hover:shadow-xl transition duration-300 border border-purple-100">

      <div className={`w-14 h-14 rounded-2xl flex items-center justify-center text-3xl ${color}`}>
        {icon}
      </div>

      <h3 className="text-gray-500 mt-5">
        {title}
      </h3>

      <p className="text-4xl font-bold text-[#1E1B4B] mt-2">
        {value}
      </p>

      <p className="text-sm text-gray-500 mt-2">
        {subtitle}
      </p>

    </div>
  );
}

export default StatCard;