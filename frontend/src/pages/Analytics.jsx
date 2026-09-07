import { useEffect, useMemo, useState } from "react";
import { getSchedules } from "../services/medicineService";
import {
  BarChart3,
  CalendarDays,
  CheckCircle2,
  XCircle,
  TrendingUp,
} from "lucide-react";

function Analytics() {
  const [period, setPeriod] = useState("daily");
  const [schedules, setSchedules] = useState([]);
  const [loading, setLoading] = useState(true);

  // --------------------------------------------------
  // LOAD SCHEDULES
  // --------------------------------------------------

  useEffect(() => {
    const loadAnalytics = async () => {
      try {
        const data = await getSchedules();

        if (Array.isArray(data)) {
          setSchedules(data);
        } else {
          setSchedules([]);
        }
      } catch (error) {
        console.error("Analytics error:", error);
        setSchedules([]);
      } finally {
        setLoading(false);
      }
    };

    loadAnalytics();
  }, []);

  // --------------------------------------------------
  // DATE HELPERS
  // --------------------------------------------------

  const getDate = (item) => {
    if (!item.created_at) return null;

    const date = new Date(item.created_at);

    return isNaN(date.getTime()) ? null : date;
  };

  const isSameDay = (date1, date2) => {
    return (
      date1.getFullYear() === date2.getFullYear() &&
      date1.getMonth() === date2.getMonth() &&
      date1.getDate() === date2.getDate()
    );
  };

  const getMonday = (date) => {
    const result = new Date(date);
    const day = result.getDay();

    const difference = day === 0 ? -6 : 1 - day;

    result.setDate(result.getDate() + difference);
    result.setHours(0, 0, 0, 0);

    return result;
  };

  // --------------------------------------------------
  // DAILY DATA
  // --------------------------------------------------

  const dailyData = useMemo(() => {
    const today = new Date();

    const todaySchedules = schedules.filter((item) => {
      const date = getDate(item);

      return date && isSameDay(date, today);
    });

    const taken = todaySchedules.filter(
      (item) => item.status === "TAKEN"
    ).length;

    const missed = todaySchedules.filter(
      (item) => item.status === "MISSED"
    ).length;

    const total = taken + missed;

    const percentage =
      total === 0 ? 0 : Math.round((taken / total) * 100);

    return {
      labels: ["Today"],
      values: [percentage],
      taken,
      missed,
      total,
      percentage,
    };
  }, [schedules]);

  // --------------------------------------------------
  // WEEKLY DATA
  // --------------------------------------------------

  const weeklyData = useMemo(() => {
    const today = new Date();
    const monday = getMonday(today);

    const days = [
      "Mon",
      "Tue",
      "Wed",
      "Thu",
      "Fri",
      "Sat",
      "Sun",
    ];

    const values = [];
    let totalTaken = 0;
    let totalMissed = 0;

    for (let i = 0; i < 7; i++) {
      const currentDay = new Date(monday);

      currentDay.setDate(monday.getDate() + i);

      const daySchedules = schedules.filter((item) => {
        const date = getDate(item);

        return date && isSameDay(date, currentDay);
      });

      const taken = daySchedules.filter(
        (item) => item.status === "TAKEN"
      ).length;

      const missed = daySchedules.filter(
        (item) => item.status === "MISSED"
      ).length;

      const total = taken + missed;

      const percentage =
        total === 0 ? 0 : Math.round((taken / total) * 100);

      values.push(percentage);

      totalTaken += taken;
      totalMissed += missed;
    }

    const total = totalTaken + totalMissed;

    const percentage =
      total === 0
        ? 0
        : Math.round((totalTaken / total) * 100);

    return {
      labels: days,
      values,
      taken: totalTaken,
      missed: totalMissed,
      total,
      percentage,
    };
  }, [schedules]);

  // --------------------------------------------------
  // MONTHLY DATA
  // --------------------------------------------------

  const monthlyData = useMemo(() => {
    const today = new Date();

    const year = today.getFullYear();
    const month = today.getMonth();

    const daysInMonth = new Date(
      year,
      month + 1,
      0
    ).getDate();

    const weekCount = Math.ceil(daysInMonth / 7);

    const labels = [];
    const values = [];

    let totalTaken = 0;
    let totalMissed = 0;

    for (let week = 0; week < weekCount; week++) {
      const startDay = week * 7 + 1;
      const endDay = Math.min(
        startDay + 6,
        daysInMonth
      );

      let weekTaken = 0;
      let weekMissed = 0;

      schedules.forEach((item) => {
        const date = getDate(item);

        if (!date) return;

        if (
          date.getFullYear() === year &&
          date.getMonth() === month &&
          date.getDate() >= startDay &&
          date.getDate() <= endDay
        ) {
          if (item.status === "TAKEN") {
            weekTaken++;
          }

          if (item.status === "MISSED") {
            weekMissed++;
          }
        }
      });

      const total = weekTaken + weekMissed;

      const percentage =
        total === 0
          ? 0
          : Math.round((weekTaken / total) * 100);

      labels.push(`Week ${week + 1}`);
      values.push(percentage);

      totalTaken += weekTaken;
      totalMissed += weekMissed;
    }

    const total = totalTaken + totalMissed;

    const percentage =
      total === 0
        ? 0
        : Math.round((totalTaken / total) * 100);

    return {
      labels,
      values,
      taken: totalTaken,
      missed: totalMissed,
      total,
      percentage,
    };
  }, [schedules]);

  // --------------------------------------------------
  // CURRENT DATA
  // --------------------------------------------------

  const currentData =
    period === "daily"
      ? dailyData
      : period === "weekly"
      ? weeklyData
      : monthlyData;

  // --------------------------------------------------
  // TITLE
  // --------------------------------------------------

  const periodTitle =
    period === "daily"
      ? "Today's Medication Adherence"
      : period === "weekly"
      ? "Weekly Medication Adherence"
      : "Monthly Medication Adherence";

  // --------------------------------------------------
  // LOADING
  // --------------------------------------------------

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0F1117] flex items-center justify-center">
        <div className="text-center">
          <BarChart3
            size={42}
            className="text-[#00C2A8] mx-auto mb-4 animate-pulse"
          />

          <p className="text-gray-400">
            Loading analytics...
          </p>
        </div>
      </div>
    );
  }

  // --------------------------------------------------
  // UI
  // --------------------------------------------------

  return (
    <div className="min-h-screen bg-[#0F1117] text-white px-6 md:px-8 py-8">

      {/* HEADER */}
      <div className="mb-8">

        <div className="flex items-center gap-3 mb-2">
          <div className="w-11 h-11 rounded-xl bg-[#00C2A8]/10 border border-[#00C2A8]/30 flex items-center justify-center">
            <BarChart3
              size={23}
              className="text-[#00C2A8]"
            />
          </div>

          <h1 className="text-3xl md:text-4xl font-bold">
            Medication Analytics
          </h1>
        </div>

        <p className="text-gray-400">
          Track your medication adherence over time.
        </p>

      </div>

      {/* PERIOD TABS */}
      <div className="bg-[#1D2330] border border-gray-700 rounded-2xl p-2 max-w-xl mb-8">

        <div className="grid grid-cols-3 gap-2">

          {[
            {
              key: "daily",
              label: "Daily",
              icon: CalendarDays,
            },
            {
              key: "weekly",
              label: "Weekly",
              icon: BarChart3,
            },
            {
              key: "monthly",
              label: "Monthly",
              icon: TrendingUp,
            },
          ].map((item) => {
            const Icon = item.icon;
            const active = period === item.key;

            return (
              <button
                key={item.key}
                onClick={() => setPeriod(item.key)}
                className={`flex items-center justify-center gap-2 py-3 px-4 rounded-xl font-semibold transition-all duration-300 ${
                  active
                    ? "bg-[#00C2A8] text-black shadow-lg shadow-[#00C2A8]/20"
                    : "text-gray-400 hover:text-white hover:bg-[#252C3A]"
                }`}
              >
                <Icon size={17} />
                {item.label}
              </button>
            );
          })}

        </div>

      </div>

      {/* SUMMARY CARDS */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-8">

        {/* ADHERENCE */}
        <div className="bg-[#1D2330] border border-gray-700 rounded-2xl p-6">

          <p className="text-gray-400 text-sm mb-2">
            {period === "daily"
              ? "Today's Adherence"
              : period === "weekly"
              ? "This Week's Adherence"
              : "This Month's Adherence"}
          </p>

          <div className="flex items-end gap-2">

            <h2 className="text-4xl font-bold text-[#00C2A8]">
              {currentData.percentage}%
            </h2>

          </div>

          <p className="text-gray-500 text-sm mt-2">
            Based on completed medication doses
          </p>

        </div>

        {/* TAKEN */}
        <div className="bg-[#1D2330] border border-gray-700 rounded-2xl p-6">

          <div className="flex items-center gap-3 mb-2">

            <CheckCircle2
              size={21}
              className="text-green-400"
            />

            <p className="text-gray-400 text-sm">
              Medicines Taken
            </p>

          </div>

          <h2 className="text-3xl font-bold text-green-400">
            {currentData.taken}
          </h2>

        </div>

        {/* MISSED */}
        <div className="bg-[#1D2330] border border-gray-700 rounded-2xl p-6">

          <div className="flex items-center gap-3 mb-2">

            <XCircle
              size={21}
              className="text-red-400"
            />

            <p className="text-gray-400 text-sm">
              Medicines Missed
            </p>

          </div>

          <h2 className="text-3xl font-bold text-red-400">
            {currentData.missed}
          </h2>

        </div>

      </div>

      {/* GRAPH */}
      <div className="bg-[#1D2330] border border-gray-700 rounded-3xl p-6 md:p-8">

        <div className="mb-8">

          <h2 className="text-2xl font-bold">
            {periodTitle}
          </h2>

          <p className="text-gray-400 text-sm mt-1">
            Percentage of scheduled doses marked as Taken.
          </p>

        </div>

        {/* BAR GRAPH */}
        <div className="w-full">

          <div className="flex items-end gap-3 md:gap-6 h-72 border-b border-gray-700 px-2">

            {currentData.values.map((value, index) => {

              const height =
                value === 0
                  ? 4
                  : Math.max(value * 2.2, 8);

              return (
                <div
                  key={index}
                  className="flex-1 h-full flex flex-col justify-end items-center"
                >

                  {/* VALUE */}
                  <span className="text-sm font-semibold text-gray-300 mb-2">
                    {value}%
                  </span>

                  {/* BAR */}
                  <div
                    className="w-full max-w-16 bg-[#00C2A8] rounded-t-xl transition-all duration-500 hover:bg-[#00ad97]"
                    style={{
                      height: `${height}%`,
                    }}
                  />

                </div>
              );
            })}

          </div>

          {/* LABELS */}
          <div className="flex gap-3 md:gap-6 px-2 mt-3">

            {currentData.labels.map((label, index) => (
              <div
                key={index}
                className="flex-1 text-center text-sm text-gray-400"
              >
                {label}
              </div>
            ))}

          </div>

        </div>

        {/* EMPTY STATE */}
        {currentData.total === 0 && (
          <div className="mt-8 text-center bg-[#151922] border border-gray-700 rounded-2xl py-5">

            <p className="text-gray-400">
              No completed medication records available for this period.
            </p>

            <p className="text-gray-500 text-sm mt-1">
              Mark reminders as Taken or Missed to build your analytics.
            </p>

          </div>
        )}

      </div>

      {/* EXPLANATION */}
      <div className="mt-6 bg-[#151922] border border-gray-800 rounded-2xl p-5">

        <p className="text-gray-400 text-sm">
          <span className="text-white font-semibold">
            Adherence =
          </span>{" "}
          Taken doses ÷ (Taken doses + Missed doses) × 100
        </p>

      </div>

    </div>
  );
}

export default Analytics;