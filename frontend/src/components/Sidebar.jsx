import { Link, useLocation, useNavigate } from "react-router-dom";

import {
  LayoutDashboard,
  Pill,
  ClipboardPlus,
  ScanLine,
  PackageSearch,
  Clock3,
  CalendarDays,
  BarChart3,
  Bell,
  Settings,
  LogOut,
  Cross,
  User,
} from "lucide-react";

function Sidebar() {
  const location = useLocation();
  const navigate = useNavigate();

  const menuGroups = [
    {
      title: "OVERVIEW",
      items: [
        {
          name: "Dashboard",
          path: "/dashboard",
          icon: LayoutDashboard,
        },
      ],
    },

    {
      title: "MEDICATION",
      items: [
        {
          name: "My Medicines",
          path: "/medicines",
          icon: Pill,
        },
        {
          name: "Add Medicine",
          path: "/add-medicine",
          icon: ClipboardPlus,
        },
        {
          name: "Prescription OCR",
          path: "/upload-prescription",
          icon: ScanLine,
        },
        {
          name: "Refill Prediction",
          path: "/refill-prediction",
          icon: PackageSearch,
        },
      ],
    },

    {
      title: "CARE",
      items: [
        {
          name: "Reminder Center",
          path: "/reminders",
          icon: Clock3,
        },
        {
          name: "Calendar",
          path: "/calendar",
          icon: CalendarDays,
        },
        {
          name: "Analytics",
          path: "/analytics",
          icon: BarChart3,
        },
      ],
    },

    {
      title: "ACCOUNT",
      items: [
        {
          name: "Notifications",
          path: "/notifications",
          icon: Bell,
        },
        {
          name: "Settings",
          path: "/settings",
          icon: Settings,
        },
        {
          name: "Profile",
          path: "/profile",
          icon:  User,
        },
        
      ],
    },
  ];

  const handleLogout = () => {
    localStorage.removeItem("access_token");
    localStorage.removeItem("refresh_token");
    navigate("/");
  };

  return (
    <aside className="fixed top-0 left-0 w-72 h-screen bg-[#151922] border-r border-gray-800 text-white flex flex-col z-50">

      {/* Brand */}
      <div className="px-6 py-7 border-b border-gray-800">

        <div className="flex items-center gap-3">

          {/* Simple medical mark */}
          <div className="w-10 h-10 rounded-xl border border-[#00C2A8]/40 flex items-center justify-center">
            <Cross
              size={21}
              strokeWidth={1.8}
              className="text-[#00C2A8]"
            />
          </div>

          <div>
            <h1 className="text-2xl font-bold tracking-wide text-white">
              Pill<span className="text-[#00C2A8]">Sync</span>
            </h1>

            <p className="text-gray-400 text-xs mt-1">
              Smart Medication Care
            </p>
          </div>

        </div>

      </div>

      {/* Navigation */}
      <nav className="flex-1 px-4 py-6 overflow-y-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">

        {menuGroups.map((group) => (
          <div key={group.title} className="mb-7">

            <p className="px-4 mb-3 text-xs font-semibold tracking-widest text-gray-500">
              {group.title}
            </p>

            <div className="space-y-2">

              {group.items.map((item) => {
                const active = location.pathname === item.path;
                const Icon = item.icon;

                return (
                  <Link
                    key={item.name}
                    to={item.path}
                    className={`flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition-all duration-300 ${
                      active
                        ? "bg-[#00C2A8] text-black"
                        : "text-gray-300 hover:bg-[#1D2330] hover:text-white"
                    }`}
                  >
                    <Icon
                      size={19}
                      strokeWidth={1.8}
                    />

                    <span>{item.name}</span>
                  </Link>
                );
              })}

            </div>

          </div>
        ))}

      </nav>

      {/* Sign Out */}
      <div className="border-t border-gray-800 p-5">

        <button
          onClick={handleLogout}
          className="w-full flex items-center justify-center gap-3 py-3.5 rounded-xl bg-red-500 hover:bg-red-600 transition-all duration-300 font-semibold"
        >
          <LogOut
            size={19}
            strokeWidth={1.8}
          />

          <span>Sign Out</span>
        </button>

      </div>

    </aside>
  );
}

export default Sidebar;