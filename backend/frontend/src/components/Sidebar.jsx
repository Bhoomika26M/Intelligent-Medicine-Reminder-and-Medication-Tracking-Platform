import { Link, useLocation, useNavigate } from "react-router-dom";

function Sidebar() {
  const location = useLocation();
  const navigate = useNavigate();

  const menuItems = [
    { name: "Dashboard",  path: "/dashboard" },
    { name: "Medicines", path: "/medicines" },
    { name: "Reminders", path: "/reminders" },
    { name: "History", path: "/history" },
    { name: "Profile", path: "/profile" },
  ];

  const handleLogout = () => {
    localStorage.removeItem("access_token");
    localStorage.removeItem("refresh_token");
    navigate("/");
  };

  return (
    <aside className="relative w-72 min-h-screen bg-gradient-to-b from-[#2E1065] to-[#4C1D95] text-white p-6 shadow-2xl">

      {/* Logo */}
      <div className="mb-12">
        <div className="flex items-center gap-3">
          <div className="w-14 h-14 rounded-2xl bg-white/20 flex items-center justify-center text-3xl">
            💊
          </div>

          <div>
            <h1 className="text-3xl font-bold">PillSync</h1>
            <p className="text-purple-200 text-sm">
              Smart Medication Care
            </p>
          </div>
        </div>
      </div>

      {/* Menu */}
      <nav className="space-y-3">
        {menuItems.map((item) => (
          <Link
            key={item.name}
            to={item.path}
            className={`flex items-center gap-4 px-5 py-4 rounded-2xl text-lg transition-all duration-300 ${
              location.pathname === item.path
                ? "bg-white text-purple-800 font-bold"
                : "hover:bg-white/20"
            }`}
          >
            <span className="text-2xl">{item.icon}</span>
            <span>{item.name}</span>
          </Link>
        ))}
      </nav>

      {/* Logout */}
      <button
        onClick={handleLogout}
        className="absolute bottom-8 left-6 right-6 flex items-center justify-center gap-3 px-5 py-4 rounded-2xl bg-red-500 hover:bg-red-600 transition text-lg font-bold"
      >
        🚪 Logout
      </button>

    </aside>
  );
}

export default Sidebar;