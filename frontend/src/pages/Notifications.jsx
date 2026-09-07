import { useEffect, useState } from "react";
import {
  Bell,
  CheckCircle2,
  Clock3,
  AlertTriangle,
  Pill,
  RefreshCw,
} from "lucide-react";

import { getSchedules } from "../services/medicineService";

function Notifications() {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);

  const loadNotifications = async () => {
    try {
      setLoading(true);

      const data = await getSchedules();

      if (Array.isArray(data)) {
        setNotifications(data);
      } else {
        setNotifications([]);
      }
    } catch (error) {
      console.error("Error loading notifications:", error);
      setNotifications([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadNotifications();
  }, []);

  const getNotificationDetails = (status) => {
    if (status === "TAKEN") {
      return {
        title: "Medicine Taken",
        message: "This medicine was marked as taken.",
        icon: CheckCircle2,
        iconColor: "text-green-400",
        iconBg: "bg-green-500/10",
        border: "border-green-500/20",
        statusBg: "bg-green-500/10",
        statusText: "text-green-400",
        label: "TAKEN",
      };
    }

    if (status === "MISSED") {
      return {
        title: "Medicine Missed",
        message: "This medicine reminder was missed.",
        icon: AlertTriangle,
        iconColor: "text-red-400",
        iconBg: "bg-red-500/10",
        border: "border-red-500/20",
        statusBg: "bg-red-500/10",
        statusText: "text-red-400",
        label: "MISSED",
      };
    }

    return {
      title: "Medicine Reminder",
      message: "It is time to take your medicine.",
      icon: Clock3,
      iconColor: "text-yellow-400",
      iconBg: "bg-yellow-500/10",
      border: "border-yellow-500/20",
      statusBg: "bg-yellow-500/10",
      statusText: "text-yellow-400",
      label: "PENDING",
    };
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0F1117] flex items-center justify-center">
        <div className="flex items-center gap-3 text-cyan-400">
          <RefreshCw
            size={24}
            className="animate-spin"
          />

          <span className="text-xl font-semibold">
            Loading Notifications...
          </span>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0F1117] p-8 text-white">

      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-5 mb-8">

        <div>
          <div className="flex items-center gap-3">

            <div className="w-12 h-12 rounded-2xl bg-[#00C2A8]/10 border border-[#00C2A8]/20 flex items-center justify-center">
              <Bell
                size={24}
                className="text-[#00C2A8]"
              />
            </div>

            <div>
              <h1 className="text-4xl font-bold">
                Notifications
              </h1>

              <p className="text-gray-400 mt-1">
                Medication reminders and medicine activity
              </p>
            </div>

          </div>
        </div>

        <button
          onClick={loadNotifications}
          className="flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-[#1D2330] border border-gray-700 text-gray-300 hover:border-[#00C2A8] hover:text-[#00C2A8] transition"
        >
          <RefreshCw size={18} />
          Refresh
        </button>

      </div>


      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-8">

        {/* Pending */}
        <div className="bg-[#151922] border border-gray-800 rounded-2xl p-5">

          <div className="flex items-center justify-between">

            <div>
              <p className="text-gray-400 text-sm">
                Pending
              </p>

              <h2 className="text-3xl font-bold text-yellow-400 mt-2">
                {
                  notifications.filter(
                    (item) => item.status === "PENDING"
                  ).length
                }
              </h2>
            </div>

            <div className="w-11 h-11 rounded-xl bg-yellow-500/10 flex items-center justify-center">
              <Clock3
                size={22}
                className="text-yellow-400"
              />
            </div>

          </div>

        </div>


        {/* Taken */}
        <div className="bg-[#151922] border border-gray-800 rounded-2xl p-5">

          <div className="flex items-center justify-between">

            <div>
              <p className="text-gray-400 text-sm">
                Taken
              </p>

              <h2 className="text-3xl font-bold text-green-400 mt-2">
                {
                  notifications.filter(
                    (item) => item.status === "TAKEN"
                  ).length
                }
              </h2>
            </div>

            <div className="w-11 h-11 rounded-xl bg-green-500/10 flex items-center justify-center">
              <CheckCircle2
                size={22}
                className="text-green-400"
              />
            </div>

          </div>

        </div>


        {/* Missed */}
        <div className="bg-[#151922] border border-gray-800 rounded-2xl p-5">

          <div className="flex items-center justify-between">

            <div>
              <p className="text-gray-400 text-sm">
                Missed
              </p>

              <h2 className="text-3xl font-bold text-red-400 mt-2">
                {
                  notifications.filter(
                    (item) => item.status === "MISSED"
                  ).length
                }
              </h2>
            </div>

            <div className="w-11 h-11 rounded-xl bg-red-500/10 flex items-center justify-center">
              <AlertTriangle
                size={22}
                className="text-red-400"
              />
            </div>

          </div>

        </div>

      </div>


      {/* Notification List */}
      <div>

        <h2 className="text-xl font-semibold mb-4">
          Recent Medication Activity
        </h2>

        {notifications.length === 0 ? (

          <div className="bg-[#151922] border border-gray-800 rounded-3xl p-12 text-center">

            <Bell
              size={42}
              className="mx-auto text-gray-600 mb-4"
            />

            <h2 className="text-2xl font-semibold text-gray-300">
              No Notifications
            </h2>

            <p className="text-gray-500 mt-2">
              You don't have any medication notifications right now.
            </p>

          </div>

        ) : (

          <div className="space-y-4">

            {notifications.map((item) => {

              const details = getNotificationDetails(
                item.status
              );

              const StatusIcon = details.icon;

              return (
                <div
                  key={item.id}
                  className={`bg-[#151922] border ${details.border} rounded-2xl p-5 hover:bg-[#1A1F29] transition-all duration-300`}
                >

                  <div className="flex items-start gap-4">

                    {/* Icon */}
                    <div
                      className={`w-12 h-12 rounded-xl ${details.iconBg} flex items-center justify-center flex-shrink-0`}
                    >
                      <StatusIcon
                        size={24}
                        className={details.iconColor}
                      />
                    </div>


                    {/* Content */}
                    <div className="flex-1">

                      <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-3">

                        <div>

                          <div className="flex items-center gap-2">

                            <Pill
                              size={18}
                              className="text-[#00C2A8]"
                            />

                            <h3 className="text-lg font-semibold">
                              {details.title}
                            </h3>

                          </div>

                          <p className="text-gray-400 mt-1">
                            {details.message}
                          </p>

                        </div>


                        {/* Status */}
                        <span
                          className={`px-3 py-1 rounded-full text-xs font-semibold ${details.statusBg} ${details.statusText}`}
                        >
                          {details.label}
                        </span>

                      </div>


                      {/* Medicine Details */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-5">

                        <div className="bg-[#0F1117] rounded-xl p-4">

                          <p className="text-gray-500 text-xs uppercase tracking-wide">
                            Medicine
                          </p>

                          <p className="text-white font-semibold mt-1">
                            {item.medicine_name}
                          </p>

                        </div>


                        <div className="bg-[#0F1117] rounded-xl p-4">

                          <p className="text-gray-500 text-xs uppercase tracking-wide">
                            Reminder Time
                          </p>

                          <p className="text-white font-semibold mt-1">
                            {item.reminder_time}
                          </p>

                        </div>

                      </div>

                    </div>

                  </div>

                </div>
              );
            })}

          </div>

        )}

      </div>

    </div>
  );
}

export default Notifications;