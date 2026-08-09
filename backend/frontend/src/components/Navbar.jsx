import { useEffect, useState } from "react";
import axios from "axios";

function Navbar() {
  const [profile, setProfile] = useState({
    first_name: "",
    username: "",
    role: "",
  });

  const [notificationCount, setNotificationCount] = useState(0);

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
    <header className="h-24 bg-white/70 backdrop-blur-xl border-b border-purple-100 flex items-center justify-between px-10">

      <div>
        <h2 className="text-3xl font-bold text-[#1E1B4B]">
          Welcome 👋
        </h2>

        <p className="text-gray-500">
          Stay healthy, stay consistent with your medicines
        </p>
      </div>

      <div className="flex items-center gap-8">

        <button
          className="relative text-3xl"
          onClick={() => alert(`You have ${notificationCount} pending reminder(s)`)}
        >
          🔔

          <span className="absolute -top-2 -right-3 bg-[#8B5CF6] text-white text-xs w-6 h-6 rounded-full flex items-center justify-center">
            {notificationCount}
          </span>
        </button>

        <div className="flex items-center gap-4 bg-purple-50 px-5 py-3 rounded-2xl">

          <div className="w-14 h-14 rounded-full bg-gradient-to-br from-[#8B5CF6] to-[#C084FC] flex items-center justify-center text-white text-xl font-bold">
            {profile.first_name
              ? profile.first_name.charAt(0).toUpperCase()
              : profile.username
              ? profile.username.charAt(0).toUpperCase()
              : "P"}
          </div>

          <div>
            <p className="font-bold text-[#1E1B4B] text-lg">
              {profile.first_name || profile.username || "User"}
            </p>

            <p className="text-gray-500">
              {profile.role || "Patient"}
            </p>
          </div>

        </div>

      </div>

    </header>
  );
}

export default Navbar;