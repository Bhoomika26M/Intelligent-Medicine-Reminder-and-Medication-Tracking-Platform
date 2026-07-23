import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import { 
  FiActivity, 
  FiAlertTriangle, 
  FiCheckCircle, 
  FiClock, 
  FiPlus, 
  FiTrendingUp 
} from 'react-icons/fi';
import { GiPill } from 'react-icons/gi';

const Dashboard = () => {
  const { user } = useAuth();
  const [report, setReport] = useState(null);
  const [reminders, setReminders] = useState([]);
  const [medicines, setMedicines] = useState([]);
  const [recentLogs, setRecentLogs] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    try {
      const todayStr = new Date().toISOString().split('T')[0];
      
      const [reportRes, reminderRes, medicineRes, historyRes] = await Promise.all([
        api.get('/history/report'),
        api.get(`/reminder?date_filter=${todayStr}`),
        api.get('/medicine'),
        api.get('/history?limit=5')
      ]);

      setReport(reportRes.data);
      setReminders(reminderRes.data);
      setMedicines(medicineRes.data);
      setRecentLogs(historyRes.data);
    } catch (err) {
      console.error("Dashboard data fetching failed:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleReminderAction = async (id, status) => {
    try {
      await api.put(`/reminder/${id}`, { status });
      // Refresh statistics & lists
      fetchData();
    } catch (err) {
      console.error("Error updating reminder status:", err);
    }
  };

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-blue-600 border-t-transparent"></div>
      </div>
    );
  }

  // Identify medicines with low remaining stock (<= 5)
  const lowStockMeds = medicines.filter(m => m.remaining_stock <= 5);
  
  // Calculate completed reminders count
  const completedReminders = reminders.filter(r => r.status === 'Taken').length;
  const totalReminders = reminders.length;

  return (
    <div className="space-y-8">
      {/* Page Header */}
      <div className="md:flex md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-800">Health Dashboard</h1>
          <p className="text-sm text-slate-500 mt-1">Here is your medication tracking summary for today.</p>
        </div>
        <div className="mt-4 md:mt-0 flex gap-3">
          <Link
            to="/medicines/new"
            className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white shadow-md shadow-blue-500/10 hover:bg-blue-700 transition-all cursor-pointer"
          >
            <FiPlus /> Add Medicine
          </Link>
          <Link
            to="/reminders"
            className="inline-flex items-center gap-2 rounded-xl bg-teal-50 px-4 py-2.5 text-sm font-semibold text-teal-600 border border-teal-100 hover:bg-teal-100/50 transition-all"
          >
            <FiClock /> Log Schedule
          </Link>
        </div>
      </div>

      {/* KPI Statistic Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {/* Adherence Card */}
        <div className="rounded-2xl border border-slate-100 bg-white p-6 shadow-sm flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Adherence Rate</span>
            <p className="text-3xl font-extrabold text-slate-800">{report?.adherence_rate || 0}%</p>
            <span className="text-[10px] text-teal-500 font-medium flex items-center gap-0.5 mt-1">
              <FiTrendingUp /> Target &gt; 90%
            </span>
          </div>
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
            <FiActivity className="text-2xl" />
          </div>
        </div>

        {/* Today's Completions */}
        <div className="rounded-2xl border border-slate-100 bg-white p-6 shadow-sm flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Doses Logged</span>
            <p className="text-3xl font-extrabold text-slate-800">{completedReminders}/{totalReminders}</p>
            <span className="text-[10px] text-slate-400 font-medium mt-1 block">
              Reminders completed today
            </span>
          </div>
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-teal-50 text-teal-600">
            <FiCheckCircle className="text-2xl" />
          </div>
        </div>

        {/* Total Registered Medicines */}
        <div className="rounded-2xl border border-slate-100 bg-white p-6 shadow-sm flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Total Medicines</span>
            <p className="text-3xl font-extrabold text-slate-800">{medicines.length}</p>
            <span className="text-[10px] text-slate-400 font-medium mt-1 block">
              Active schedules registered
            </span>
          </div>
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-violet-50 text-violet-600">
            <GiPill className="text-2xl" />
          </div>
        </div>

        {/* Low Stock Warning */}
        <div className={`rounded-2xl border p-6 shadow-sm flex items-center justify-between ${
          lowStockMeds.length > 0 
            ? 'bg-rose-50 border-rose-100 text-rose-800' 
            : 'bg-white border-slate-100 text-slate-800'
        }`}>
          <div className="space-y-1">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Stock Alerts</span>
            <p className="text-3xl font-extrabold">{lowStockMeds.length}</p>
            <span className="text-[10px] font-medium mt-1 block">
              {lowStockMeds.length > 0 ? "Refills needed soon!" : "All stocks normal"}
            </span>
          </div>
          <div className={`flex h-12 w-12 items-center justify-center rounded-xl ${
            lowStockMeds.length > 0 ? 'bg-rose-100 text-rose-600' : 'bg-amber-50 text-amber-600'
          }`}>
            <FiAlertTriangle className="text-2xl" />
          </div>
        </div>
      </div>

      {/* Main Content Layout */}
      <div className="grid gap-8 lg:grid-cols-3">
        {/* Column 1: Today's Med Reminder Action Center (2/3 width on wide screens) */}
        <div className="lg:col-span-2 space-y-6">
          <div className="rounded-2xl border border-slate-100 bg-white p-6 shadow-sm">
            <h3 className="text-lg font-bold text-slate-800 mb-4">Today's Schedule</h3>
            {reminders.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-slate-400 text-center">
                <FiClock className="text-4xl text-slate-300 mb-2" />
                <p className="text-sm font-medium">No reminders generated yet for today.</p>
                <p className="text-xs text-slate-400 mt-1">Schedules are generated automatically at their scheduled reminder times.</p>
              </div>
            ) : (
              <div className="divide-y divide-slate-100">
                {reminders.map((rem) => (
                  <div key={rem.id} className="flex items-center justify-between py-4 first:pt-0 last:pb-0">
                    <div className="flex items-center gap-3">
                      <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl font-bold ${
                        rem.status === 'Taken' 
                          ? 'bg-emerald-50 text-emerald-600'
                          : rem.status === 'Skipped' 
                          ? 'bg-amber-50 text-amber-600' 
                          : rem.status === 'Missed'
                          ? 'bg-rose-50 text-rose-600'
                          : 'bg-blue-50 text-blue-600'
                      }`}>
                        {rem.status === 'Taken' ? <FiCheckCircle /> : <GiPill className="text-lg" />}
                      </div>
                      <div>
                        <h4 className="font-semibold text-slate-700 text-sm">{rem.medicine?.name}</h4>
                        <p className="text-xs text-slate-400">
                          Time: <span className="font-semibold text-slate-500">{rem.reminder_time.substring(0, 5)}</span> • Dosage: {rem.medicine?.dosage}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      {rem.status === 'Pending' ? (
                        <>
                          <button
                            onClick={() => handleReminderAction(rem.id, 'Taken')}
                            className="rounded-lg bg-teal-500 px-3 py-1.5 text-xs font-semibold text-white shadow-sm hover:bg-teal-600 transition-colors cursor-pointer"
                          >
                            Take
                          </button>
                          <button
                            onClick={() => handleReminderAction(rem.id, 'Skipped')}
                            className="rounded-lg bg-slate-100 px-3 py-1.5 text-xs font-semibold text-slate-600 hover:bg-slate-200 transition-colors cursor-pointer"
                          >
                            Skip
                          </button>
                        </>
                      ) : (
                        <span className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium ${
                          rem.status === 'Taken'
                            ? 'bg-emerald-100 text-emerald-800'
                            : rem.status === 'Skipped'
                            ? 'bg-amber-100 text-amber-800'
                            : 'bg-rose-100 text-rose-800'
                        }`}>
                          {rem.status}
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Column 2: History & Warnings (1/3 width) */}
        <div className="space-y-6">
          {/* Stock Warning Box */}
          {lowStockMeds.length > 0 && (
            <div className="rounded-2xl border border-rose-100 bg-rose-50/50 p-6 shadow-sm space-y-3">
              <div className="flex items-center gap-2 text-rose-700 font-bold text-sm">
                <FiAlertTriangle />
                <span>Stock Warning Alerts</span>
              </div>
              <ul className="space-y-2 text-xs text-slate-600">
                {lowStockMeds.map((med) => (
                  <li key={med.id} className="flex justify-between items-center rounded-xl bg-white border border-rose-100 p-2.5">
                    <span className="font-semibold text-slate-700">{med.name}</span>
                    <span className="font-bold text-rose-600">{med.remaining_stock} remaining</span>
                  </li>
                ))}
              </ul>
              <Link to="/medicines" className="text-xs font-bold text-blue-600 hover:underline block text-right">
                View Medicines &gt;
              </Link>
            </div>
          )}

          {/* Recent Logs List */}
          <div className="rounded-2xl border border-slate-100 bg-white p-6 shadow-sm">
            <h3 className="text-lg font-bold text-slate-800 mb-4">Recent History Logs</h3>
            {recentLogs.length === 0 ? (
              <p className="text-xs text-slate-400 text-center py-6">No medication history recorded yet.</p>
            ) : (
              <div className="space-y-3.5">
                {recentLogs.map((log) => (
                  <div key={log.id} className="flex items-start gap-2.5 text-xs">
                    <span className={`inline-flex shrink-0 h-2 w-2 rounded-full mt-1.5 ${
                      log.status === 'Taken' 
                        ? 'bg-emerald-500' 
                        : log.status === 'Skipped' 
                        ? 'bg-amber-400' 
                        : 'bg-rose-500'
                    }`} />
                    <div className="flex-1">
                      <p className="text-slate-700 font-medium">
                        {log.medicine?.name} was marked <span className="font-bold">{log.status}</span>
                      </p>
                      <p className="text-[10px] text-slate-400">{log.date} at {log.time.substring(0, 5)}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
