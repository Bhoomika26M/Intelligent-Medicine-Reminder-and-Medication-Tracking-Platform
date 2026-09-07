import { useEffect, useState } from "react";
import axios from "axios";

function Navbar() {
  const [profile, setProfile] = useState({
    first_name: "",
    username: "",
    role: "",
  });

  const [notificationCount, setNotificationCount] = useState(0);
  const [darkMode, setDarkMode] = useState(true);

  useEffect(() => {
    loadProfile();
    loadNotifications();
  }, []);

  const loadProfile = async () => {
    try {
      const token = localStorage.getItem("access_token");

      const response = await axios.get(
        "http://127.0.0.1:8000/api/users/profile/",
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setProfile(response.data);
    } catch (error) {
      console.log(error);
    }
  };

  const loadNotifications = async () => {
    try {
      const token = localStorage.getItem("access_token");

      const response = await axios.get(
        "http://127.0.0.1:8000/api/schedules/",
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const pending = response.data.filter(
        (schedule) => schedule.status === "PENDING"
      );

      setNotificationCount(pending.length);
    } catch (error) {
      console.log(error);
    }
  };

  return (
    <header className="sticky top-0 z-40 h-20 bg-[#151922] border-b border-gray-800 flex items-center justify-end px-8">

      <div className="flex items-center gap-4">

      
        {/* Notification */}

        <button
          onClick={() =>
            alert(`You have ${notificationCount} pending reminder(s)`)
          }
          className="relative w-12 h-12 rounded-xl bg-[#1D2330] border border-gray-700 hover:border-[#00C2A8] hover:bg-[#232B3B] transition-all duration-300 flex items-center justify-center text-xl"
        >
          🔔

          {notificationCount > 0 && (
            <span className="absolute -top-2 -right-2 w-5 h-5 rounded-full bg-red-500 text-white text-[10px] flex items-center justify-center font-bold">
              {notificationCount}
            </span>
          )}
        </button>

        {/* Profile */}
        <div className="flex items-center gap-3 bg-[#1D2330] border border-gray-700 rounded-2xl px-4 py-2 hover:border-[#00C2A8] transition-all duration-300">

          <div className="w-12 h-12 rounded-full bg-[#00C2A8] flex items-center justify-center text-black font-bold text-lg">

            {profile.first_name
              ? profile.first_name.charAt(0).toUpperCase()
              : profile.username
              ? profile.username.charAt(0).toUpperCase()
              : "P"}

          </div>

          <div>

            <p className="text-white font-semibold text-base">
              {profile.first_name || profile.username || "User"}
            </p>

            <p className="text-gray-400 text-sm">
              {profile.role || "Patient"}
            </p>

          </div>

        </div>

      </div>

    </header>
  );
}

export default Navbar;