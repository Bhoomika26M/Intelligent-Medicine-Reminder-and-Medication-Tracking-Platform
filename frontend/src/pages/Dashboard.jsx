import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import { toast } from 'react-hot-toast';
import { 
  FiActivity, 
  FiAlertTriangle, 
  FiCheckCircle, 
  FiClock, 
  FiPlus, 
  FiTrendingUp,
  FiCamera,
  FiRefreshCw
} from 'react-icons/fi';
import { GiPill } from 'react-icons/gi';
import { motion } from 'framer-motion';
import CaregiverDashboard from './CaregiverDashboard';
import AdminDashboard from './AdminDashboard';

const PatientDashboard = () => {
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

      setReport(reportRes.data || {});
      setReminders(reminderRes.data || []);
      setMedicines(medicineRes.data || []);
      setRecentLogs(historyRes.data || []);
    } catch (err) {
      console.error("Dashboard data fetching failed:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    window.addEventListener('reminderStatusUpdated', fetchData);
    return () => window.removeEventListener('reminderStatusUpdated', fetchData);
  }, []);

  const handleReminderAction = async (id, status) => {
    try {
      await api.put(`/reminder/${id}`, { status });
      if (status === 'Taken') {
        toast.success('Dose marked as Taken! Great job! 💊');
      } else if (status === 'Skipped') {
        toast('Dose marked as Skipped.', { icon: '⏭️' });
      }
      fetchData();
    } catch (err) {
      console.error("Error updating reminder status:", err);
      toast.error('Failed to update dose status. Please try again.');
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
  
  // Calculate reminder status counts
  const completedReminders = reminders.filter(r => r.status === 'Taken').length;
  const missedReminders = reminders.filter(r => r.status === 'Missed').length;
  const upcomingReminders = reminders.filter(r => r.status === 'Pending').length;
  const totalReminders = reminders.length;
  const progressPct = totalReminders > 0 ? Math.round((completedReminders / totalReminders) * 100) : 0;

  const containerVariants = {
    hidden: { opacity: 0, y: 10 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: { duration: 0.4, ease: 'easeOut', staggerChildren: 0.08 }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 10 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.3 } }
  };

  return (
    <motion.div 
      initial="hidden"
      animate="visible"
      variants={containerVariants}
      className="space-y-8"
    >
      {/* Page Header */}
      <div className="md:flex md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white dark:text-white">Health Dashboard</h1>
          <p className="text-sm text-slate-500 dark:text-slate-300 mt-1">Here is your medication tracking summary for today.</p>
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
            className="inline-flex items-center gap-2 rounded-xl bg-teal-50 dark:bg-teal-900/30 px-4 py-2.5 text-sm font-semibold text-teal-600 dark:text-teal-400 border border-teal-100 dark:border-teal-800 hover:bg-teal-100/50 transition-all"
          >
            <FiClock /> Log Schedule
          </Link>
        </div>
      </div>

      {/* KPI Statistic Grid */}
      <motion.div variants={itemVariants} className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {/* Adherence Card */}
        <div className="rounded-2xl border border-slate-100 dark:border-slate-700 bg-white dark:bg-[#1E293B] p-6 shadow-sm flex items-center justify-between hover:shadow-md transition-all duration-300 transform hover:-translate-y-0.5">
          <div className="space-y-1">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Adherence Rate</span>
            <p className="text-3xl font-extrabold text-slate-900 dark:text-white dark:text-white">{report?.adherence_rate || 0}%</p>
            <span className="text-[10px] text-teal-500 font-medium flex items-center gap-0.5 mt-1">
              <FiTrendingUp /> Target &gt; 90%
            </span>
          </div>
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400">
            <FiActivity className="text-2xl" />
          </div>
        </div>

        {/* Today's Completions with progress bar */}
        <div className="rounded-2xl border border-slate-100 dark:border-slate-700 bg-white dark:bg-[#1E293B] p-6 shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <div className="space-y-0.5">
              <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Doses Logged</span>
              <p className="text-3xl font-extrabold text-slate-900 dark:text-white dark:text-white">{completedReminders}<span className="text-lg text-slate-400 font-semibold">/{totalReminders}</span></p>
            </div>
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-teal-50 dark:bg-teal-900/30 text-teal-600 dark:text-teal-400">
              <FiCheckCircle className="text-2xl" />
            </div>
          </div>
          {/* Progress Bar */}
          <div className="w-full h-2 bg-slate-100 dark:bg-slate-700 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-teal-400 to-emerald-500 rounded-full progress-bar-fill"
              style={{ width: `${progressPct}%` }}
            />
          </div>
          <span className="text-[10px] text-slate-400 font-medium mt-1.5 block">
            {progressPct}% of today's doses completed
          </span>
        </div>

        {/* Upcoming / Pending Count */}
        <div className="rounded-2xl border border-slate-100 dark:border-slate-700 bg-white dark:bg-[#1E293B] p-6 shadow-sm flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Upcoming</span>
            <p className="text-3xl font-extrabold text-slate-900 dark:text-white dark:text-white">{upcomingReminders}</p>
            <span className="text-[10px] text-blue-500 font-medium mt-1 flex items-center gap-0.5">
              <FiClock className="text-[10px]" /> Pending reminders today
            </span>
          </div>
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-violet-50 dark:bg-violet-900/30 text-violet-600 dark:text-violet-400">
            <GiPill className="text-2xl" />
          </div>
        </div>

        {/* Low Stock Warning */}
        <Link to="/refills" className={`rounded-2xl border p-6 shadow-sm flex items-center justify-between hover:shadow-md transition-all ${
          lowStockMeds.length > 0 
            ? 'bg-rose-50 dark:bg-rose-900/20 border-rose-100 dark:border-rose-800 text-rose-800 dark:text-rose-200' 
            : 'bg-white dark:bg-[#1E293B] border-slate-100 dark:border-slate-700 text-slate-900 dark:text-white dark:text-white'
        }`}>
          <div className="space-y-1">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Stock Alerts</span>
            <p className="text-3xl font-extrabold">{lowStockMeds.length}</p>
            <span className="text-[10px] font-medium mt-1 block">
              {lowStockMeds.length > 0 ? "Refills needed soon!" : "All stocks normal"}
            </span>
          </div>
          <div className={`flex h-12 w-12 items-center justify-center rounded-xl ${
            lowStockMeds.length > 0 ? 'bg-rose-100 dark:bg-rose-900/40 text-rose-600 dark:text-rose-400' : 'bg-amber-50 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400'
          }`}>
            <FiAlertTriangle className="text-2xl" />
          </div>
        </Link>
      </motion.div>

      {/* Main Content Layout */}
      <div className="grid gap-8 lg:grid-cols-3">
        {/* Column 1: Today's Med Reminder Action Center (2/3 width on wide screens) */}
        <div className="lg:col-span-2 space-y-6">
          <div className="rounded-2xl border border-slate-100 dark:border-slate-700 bg-white dark:bg-[#1E293B] p-6 shadow-sm">
            <h3 className="text-lg font-bold text-slate-900 dark:text-white dark:text-white mb-4">Today's Schedule</h3>
            {reminders.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-slate-400 text-center">
                <FiClock className="text-4xl text-slate-300 mb-2" />
                <p className="text-sm font-medium">No reminders generated yet for today.</p>
                <p className="text-xs text-slate-400 mt-1">Go to <Link to="/reminders" className="text-blue-500 hover:underline font-bold">Reminders</Link> and click "Simulate Today's Reminders".</p>
              </div>
            ) : (
              <div className="divide-y divide-slate-100 dark:divide-slate-700">
                {reminders.map((rem) => (
                  <div key={rem.id} className="flex items-center justify-between py-4 first:pt-0 last:pb-0">
                    <div className="flex items-center gap-3">
                      <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl font-bold ${
                        rem.status === 'Taken' 
                          ? 'bg-emerald-50 dark:bg-emerald-900/30 text-emerald-600'
                          : rem.status === 'Skipped' 
                          ? 'bg-amber-50 dark:bg-amber-900/30 text-amber-600' 
                          : rem.status === 'Missed'
                          ? 'bg-rose-50 dark:bg-rose-900/30 text-rose-600'
                          : 'bg-blue-50 dark:bg-blue-900/30 text-blue-600'
                      }`}>
                        {rem.status === 'Taken' ? <FiCheckCircle /> : <GiPill className="text-lg" />}
                      </div>
                      <div>
                        <h4 className="font-semibold text-slate-700 dark:text-slate-300 text-sm">{rem.medicine?.name}</h4>
                        <p className="text-xs text-slate-400">
                          Time: <span className="font-semibold text-slate-500 dark:text-slate-300">{rem.reminder_time.substring(0, 5)}</span> • Dosage: {rem.medicine?.dosage}
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
                            className="rounded-lg bg-slate-100 dark:bg-slate-700 px-3 py-1.5 text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-600 transition-colors cursor-pointer"
                          >
                            Skip
                          </button>
                        </>
                      ) : (
                        <span className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium ${
                          rem.status === 'Taken'
                            ? 'bg-emerald-100 dark:bg-emerald-900/40 text-emerald-800 dark:text-emerald-300'
                            : rem.status === 'Skipped'
                            ? 'bg-amber-100 dark:bg-amber-900/40 text-amber-800 dark:text-amber-300'
                            : 'bg-rose-100 dark:bg-rose-900/40 text-rose-800 dark:text-rose-300'
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

          {/* Active Medicines Summary */}
          {medicines.length > 0 && (
            <div className="rounded-2xl border border-slate-100 dark:border-slate-700 bg-white dark:bg-[#1E293B] p-6 shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-bold text-slate-900 dark:text-white dark:text-white">Active Medicines ({medicines.length})</h3>
                <Link to="/medicines" className="text-xs font-bold text-blue-600 hover:underline">View All →</Link>
              </div>
              <div className="grid gap-3 sm:grid-cols-2">
                {medicines.slice(0, 4).map((med) => (
                  <div key={med.id} className="flex items-center gap-3 rounded-xl bg-slate-50 dark:bg-[#1E293B]/50 p-3 border border-slate-100 dark:border-slate-700">
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-gradient-to-tr from-blue-500 to-indigo-600 text-white text-lg shadow-sm">
                      <GiPill />
                    </div>
                    <div className="min-w-0">
                      <p className="font-bold text-slate-700 dark:text-slate-300 text-xs truncate">{med.name}</p>
                      <p className="text-[10px] text-slate-400">{med.dosage} • {med.remaining_stock} left</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Column 2: History & Warnings (1/3 width) */}
        <div className="space-y-6">
          {/* Quick Actions */}
          <div className="rounded-2xl border border-slate-100 dark:border-slate-700 bg-white dark:bg-[#1E293B] p-6 shadow-sm">
            <h3 className="text-base font-bold text-slate-900 dark:text-white dark:text-white mb-4">Quick Actions</h3>
            <div className="space-y-2">
              <Link to="/ocr" className="flex items-center gap-3 rounded-xl p-3 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors group">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-100 dark:bg-blue-900/40 text-blue-600 dark:text-blue-400">
                  <FiCamera />
                </div>
                <span className="text-xs font-semibold text-slate-600 dark:text-slate-300 group-hover:text-blue-600 dark:group-hover:text-blue-400">AI Prescription Scanner</span>
              </Link>
              <Link to="/refills" className="flex items-center gap-3 rounded-xl p-3 hover:bg-teal-50 dark:hover:bg-teal-900/20 transition-colors group">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-teal-100 dark:bg-teal-900/40 text-teal-600 dark:text-teal-400">
                  <FiActivity />
                </div>
                <span className="text-xs font-semibold text-slate-600 dark:text-slate-300 group-hover:text-teal-600 dark:group-hover:text-teal-400">AI Refill Prediction</span>
              </Link>
              <Link to="/medicines/new" className="flex items-center gap-3 rounded-xl p-3 hover:bg-slate-50 dark:hover:bg-slate-805/50 transition-colors group">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-slate-100 dark:bg-[#1E293B] text-slate-500">
                  <FiPlus />
                </div>
                <span className="text-xs font-semibold text-slate-600 dark:text-slate-300 group-hover:text-slate-850 dark:group-hover:text-slate-100">Add New Medicine</span>
              </Link>
              <Link to="/reminders" className="flex items-center gap-3 rounded-xl p-3 hover:bg-slate-50 dark:hover:bg-slate-805/50 transition-colors group">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-slate-100 dark:bg-[#1E293B] text-slate-500">
                  <FiClock />
                </div>
                <span className="text-xs font-semibold text-slate-600 dark:text-slate-300 group-hover:text-slate-850 dark:group-hover:text-slate-100">View Reminder Schedule</span>
              </Link>
            </div>
          </div>

          {/* Stock Warning Box */}
          {lowStockMeds.length > 0 && (
            <div className="rounded-2xl border border-rose-100 dark:border-rose-800 bg-rose-50/50 dark:bg-rose-900/20 p-6 shadow-sm space-y-3">
              <div className="flex items-center gap-2 text-rose-700 dark:text-rose-400 font-bold text-sm">
                <FiAlertTriangle />
                <span>Stock Warning Alerts</span>
              </div>
              <ul className="space-y-2 text-xs text-slate-600 dark:text-slate-300">
                {lowStockMeds.map((med) => (
                  <li key={med.id} className="flex justify-between items-center rounded-xl bg-white dark:bg-[#1E293B] border border-rose-100 dark:border-rose-800 p-2.5">
                    <span className="font-semibold text-slate-700 dark:text-slate-300">{med.name}</span>
                    <span className="font-bold text-rose-600 dark:text-rose-400">{med.remaining_stock} remaining</span>
                  </li>
                ))}
              </ul>
              <Link to="/refills" className="text-xs font-bold text-blue-600 hover:underline block text-right">
                View AI Refills &gt;
              </Link>
            </div>
          )}

          {/* Recent Logs List */}
          <div className="rounded-2xl border border-slate-100 dark:border-slate-700 bg-white dark:bg-[#1E293B] p-6 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-base font-bold text-slate-900 dark:text-white dark:text-white">Recent History</h3>
              <Link to="/history" className="text-xs font-bold text-blue-600 hover:underline">View All →</Link>
            </div>
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
                      <p className="text-slate-700 dark:text-slate-300 font-medium">
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
    </motion.div>
  );
};

const Dashboard = () => {
  const { user } = useAuth();

  if (user?.role === 'Caregiver') {
    return <CaregiverDashboard />;
  }
  if (user?.role === 'Admin') {
    return <AdminDashboard />;
  }

  return <PatientDashboard />;
};

export default Dashboard;
