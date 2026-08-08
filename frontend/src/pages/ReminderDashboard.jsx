import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { toast } from 'react-hot-toast';
import { motion } from 'framer-motion';
import { 
  FiClock, 
  FiCalendar, 
  FiCheckCircle, 
  FiXCircle, 
  FiMinusCircle, 
  FiAlertCircle, 
  FiPlay, 
  FiChevronLeft, 
  FiChevronRight,
  FiRefreshCw
} from 'react-icons/fi';
import { GiPill } from 'react-icons/gi';

const ReminderDashboard = () => {
  const [reminders, setReminders] = useState([]);
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [statusFilter, setStatusFilter] = useState('');
  const [loading, setLoading] = useState(true);
  const [submittingId, setSubmittingId] = useState(null);
  const [generating, setGenerating] = useState(false);

  const fetchReminders = async () => {
    setLoading(true);
    try {
      const params = { date_filter: selectedDate };
      if (statusFilter) params.status_filter = statusFilter;

      const res = await api.get('/reminders', { params });
      setReminders(res.data);
    } catch (err) {
      console.error("Error loading reminders:", err);
      toast.error("Failed to retrieve reminder logs.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReminders();
    window.addEventListener('reminderStatusUpdated', fetchReminders);
    return () => window.removeEventListener('reminderStatusUpdated', fetchReminders);
  }, [selectedDate, statusFilter]);

  // Adjust Date using buttons
  const adjustDate = (days) => {
    const d = new Date(selectedDate);
    d.setDate(d.getDate() + days);
    setSelectedDate(d.toISOString().split('T')[0]);
  };

  const handleStatusChange = async (id, status, medicineName) => {
    setSubmittingId(id);
    try {
      await api.put(`/reminders/${id}`, { status });
      setReminders(prev => prev.map(r => r.id === id ? { ...r, status } : r));
      if (status === 'Taken') {
        toast.success(`✅ "${medicineName}" marked as Taken!`);
      } else if (status === 'Skipped') {
        toast(`"${medicineName}" marked as Skipped.`, { icon: '⏭️' });
      }
      // Notify dashboard to refresh
      window.dispatchEvent(new CustomEvent('reminderStatusUpdated'));
    } catch (err) {
      console.error("Error updating reminder status:", err);
      toast.error(err.response?.data?.detail || "Could not log dose action. Please try again.");
    } finally {
      setSubmittingId(null);
    }
  };

  const triggerSimulation = async () => {
    setGenerating(true);
    try {
      const res = await api.post('/reminders/generate-today');
      const msg = res.data.detail || "Reminders simulation trigger complete.";
      toast.success(msg);
      await fetchReminders();
    } catch (err) {
      console.error("Simulation failed:", err);
      toast.error(err.response?.data?.detail || "Could not run reminder scheduler simulation.");
    } finally {
      setGenerating(false);
    }
  };

  // Summary stats
  const taken = reminders.filter(r => r.status === 'Taken').length;
  const missed = reminders.filter(r => r.status === 'Missed').length;
  const skipped = reminders.filter(r => r.status === 'Skipped').length;
  const pending = reminders.filter(r => r.status === 'Pending').length;

  const isToday = selectedDate === new Date().toISOString().split('T')[0];

  return (
    <div className="space-y-8">
      {/* Header Block */}
      <div className="md:flex md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white dark:text-white">Reminder Schedules</h1>
          <p className="text-sm text-slate-500 dark:text-slate-300 mt-1">Mark daily doses as Taken or Skipped, and verify scheduling status.</p>
        </div>
        <div className="mt-4 md:mt-0 flex gap-3">
          <button
            onClick={triggerSimulation}
            disabled={generating}
            className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-blue-600 to-teal-500 px-4 py-2.5 text-sm font-semibold text-white shadow-md hover:opacity-90 transition-all cursor-pointer disabled:opacity-70"
          >
            {generating ? <FiRefreshCw className="animate-spin" /> : <FiPlay />}
            {generating ? 'Generating...' : "Generate Today's Reminders"}
          </button>
        </div>
      </div>

      {/* Summary Stats */}
      {reminders.length > 0 && (
        <motion.div 
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="grid grid-cols-4 gap-3"
        >
          {[
            { label: 'Taken', count: taken, color: 'bg-emerald-50 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 border-emerald-100 dark:border-emerald-800' },
            { label: 'Pending', count: pending, color: 'bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 border-blue-100 dark:border-blue-800' },
            { label: 'Skipped', count: skipped, color: 'bg-amber-50 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400 border-amber-100 dark:border-amber-800' },
            { label: 'Missed', count: missed, color: 'bg-rose-50 dark:bg-rose-900/30 text-rose-700 dark:text-rose-400 border-rose-100 dark:border-rose-800' },
          ].map((stat) => (
            <div key={stat.label} className={`rounded-2xl border p-4 text-center ${stat.color}`}>
              <p className="text-2xl font-extrabold">{stat.count}</p>
              <p className="text-xs font-semibold uppercase tracking-wider mt-1">{stat.label}</p>
            </div>
          ))}
        </motion.div>
      )}

      {/* Controls Bar */}
      <div className="rounded-2xl border border-slate-100 dark:border-slate-700 bg-white dark:bg-[#1E293B] p-4 shadow-sm flex flex-col md:flex-row gap-4 items-center justify-between">
        {/* Date Selector Navigation */}
        <div className="flex items-center gap-2">
          <button 
            onClick={() => adjustDate(-1)} 
            className="p-2 border border-slate-200 dark:border-slate-700 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors text-slate-600 dark:text-slate-300 cursor-pointer"
          >
            <FiChevronLeft className="text-lg" />
          </button>
          
          <div className="relative">
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="rounded-xl border border-slate-200 dark:border-slate-700 py-2 px-3 pl-8 text-sm outline-none focus:border-blue-500 bg-white dark:bg-slate-700 text-slate-700 dark:text-slate-300 font-bold"
            />
            <div className="absolute inset-y-0 left-2.5 flex items-center pointer-events-none text-slate-400">
              <FiCalendar className="text-xs" />
            </div>
          </div>
          
          <button 
            onClick={() => adjustDate(1)} 
            className="p-2 border border-slate-200 dark:border-slate-700 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors text-slate-600 dark:text-slate-300 cursor-pointer"
          >
            <FiChevronRight className="text-lg" />
          </button>
          
          {!isToday && (
            <button 
              onClick={() => setSelectedDate(new Date().toISOString().split('T')[0])}
              className="text-xs font-bold text-blue-600 hover:underline pl-2 dark:text-blue-400"
            >
              Today
            </button>
          )}
          {isToday && (
            <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 pl-2 flex items-center gap-1">
              <FiCheckCircle /> Today
            </span>
          )}
        </div>

        {/* Status Filters */}
        <div className="flex gap-1.5 overflow-x-auto pb-1 md:pb-0">
          {[
            { label: 'All Statuses', value: '' },
            { label: 'Pending', value: 'Pending' },
            { label: 'Taken', value: 'Taken' },
            { label: 'Skipped', value: 'Skipped' },
            { label: 'Missed', value: 'Missed' }
          ].map((item) => (
            <button
              key={item.value}
              onClick={() => setStatusFilter(item.value)}
              className={`rounded-xl px-4 py-2 text-xs font-semibold border transition-all cursor-pointer whitespace-nowrap ${
                statusFilter === item.value
                  ? 'bg-blue-50 dark:bg-blue-900/40 text-blue-600 dark:text-blue-400 border-blue-200 dark:border-blue-700 font-bold'
                  : 'bg-white dark:bg-slate-700 text-slate-500 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-600'
              }`}
            >
              {item.label}
            </button>
          ))}
        </div>
      </div>

      {/* Reminders List */}
      {loading ? (
        <div className="space-y-4 max-w-3xl mx-auto">
          {[1, 2, 3].map(i => (
            <div key={i} className="rounded-2xl border border-slate-100 dark:border-slate-700 bg-white dark:bg-[#1E293B] p-5 shadow-sm animate-pulse flex gap-4">
              <div className="h-12 w-12 rounded-2xl bg-slate-200 dark:bg-slate-700 shrink-0" />
              <div className="flex-1 space-y-2">
                <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-1/3" />
                <div className="h-3 bg-slate-100 dark:bg-slate-700 rounded w-1/2" />
              </div>
            </div>
          ))}
        </div>
      ) : reminders.length === 0 ? (
        <div className="rounded-2xl border border-slate-100 dark:border-slate-700 bg-white dark:bg-[#1E293B] p-12 text-center shadow-sm max-w-lg mx-auto">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-slate-50 dark:bg-slate-700 text-slate-400 mb-4 text-3xl">
            <FiClock />
          </div>
          <h3 className="text-lg font-bold text-slate-900 dark:text-white dark:text-white">No scheduled reminders</h3>
          <p className="text-sm text-slate-500 dark:text-slate-300 mt-1">
            {isToday 
              ? 'Click "Generate Today\'s Reminders" to schedule reminders for your active medicines.' 
              : 'No reminders found for this date. Check active date ranges on your medicines.'}
          </p>
          {isToday && (
            <button
              onClick={triggerSimulation}
              disabled={generating}
              className="inline-flex items-center gap-2 mt-4 rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-blue-700 transition-all cursor-pointer"
            >
              <FiPlay /> Generate Now
            </button>
          )}
        </div>
      ) : (
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="grid gap-4 max-w-3xl mx-auto"
        >
          {reminders.map((rem, idx) => {
            const isPending = rem.status === 'Pending';
            return (
              <motion.div 
                key={rem.id}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: idx * 0.05 }}
                className={`rounded-2xl border bg-white dark:bg-[#1E293B] p-5 shadow-sm hover:shadow-md transition-all flex items-center justify-between gap-4 ${
                  rem.status === 'Taken' 
                    ? 'border-emerald-100 dark:border-emerald-800 bg-emerald-50/10 dark:bg-emerald-900/10'
                    : rem.status === 'Skipped'
                    ? 'border-amber-100 dark:border-amber-800 bg-amber-50/10 dark:bg-amber-900/10'
                    : rem.status === 'Missed'
                    ? 'border-rose-100 dark:border-rose-800 bg-rose-50/10 dark:bg-rose-900/10'
                    : 'border-slate-100 dark:border-slate-700'
                }`}
              >
                {/* Left Side: Drug Icon, Name, Scheduled Time */}
                <div className="flex items-center gap-4">
                  <div className={`flex h-12 w-12 items-center justify-center rounded-2xl text-2xl font-bold shadow-sm ${
                    rem.status === 'Taken' 
                      ? 'bg-emerald-500 text-white' 
                      : rem.status === 'Skipped' 
                      ? 'bg-amber-400 text-white'
                      : rem.status === 'Missed' 
                      ? 'bg-rose-500 text-white'
                      : 'bg-gradient-to-tr from-blue-500 to-teal-400 text-white'
                  }`}>
                    <GiPill />
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-900 dark:text-white dark:text-white text-sm">{rem.medicine?.name}</h3>
                    <p className="text-xs text-slate-400 dark:text-slate-500 mt-0.5 flex items-center gap-3">
                      <span className="flex items-center gap-1">
                        <FiClock /> Time: <span className="font-semibold text-slate-600 dark:text-slate-300">{rem.reminder_time.substring(0, 5)}</span>
                      </span>
                      <span>• Dosage: {rem.medicine?.dosage}</span>
                    </p>
                    {rem.medicine?.disease_category && (
                      <span className="inline-flex mt-1 rounded-full bg-slate-100 dark:bg-slate-700 px-2 py-0.5 text-[10px] font-semibold text-slate-500 dark:text-slate-300">
                        {rem.medicine.disease_category}
                      </span>
                    )}
                  </div>
                </div>

                {/* Right Side: Actions or Status Indicator */}
                <div className="flex items-center gap-2 shrink-0">
                  {isPending ? (
                    <>
                      <button
                        onClick={() => handleStatusChange(rem.id, 'Taken', rem.medicine?.name)}
                        disabled={submittingId !== null}
                        className="rounded-xl bg-teal-500 hover:bg-teal-600 text-white px-4 py-2 text-xs font-bold shadow-sm transition-colors cursor-pointer flex items-center gap-1.5 disabled:opacity-70"
                      >
                        <FiCheckCircle /> Take
                      </button>
                      <button
                        onClick={() => handleStatusChange(rem.id, 'Skipped', rem.medicine?.name)}
                        disabled={submittingId !== null}
                        className="rounded-xl bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 text-slate-600 dark:text-slate-300 px-4 py-2 text-xs font-bold transition-colors cursor-pointer flex items-center gap-1.5 disabled:opacity-70"
                      >
                        <FiXCircle /> Skip
                      </button>
                    </>
                  ) : (
                    <div className="flex items-center gap-1.5">
                      <span className={`inline-flex items-center gap-1 rounded-full px-3 py-1 text-xs font-bold capitalize ${
                        rem.status === 'Taken' 
                          ? 'bg-emerald-100 dark:bg-emerald-900/40 text-emerald-800 dark:text-emerald-300' 
                          : rem.status === 'Skipped'
                          ? 'bg-amber-100 dark:bg-amber-900/40 text-amber-800 dark:text-amber-300'
                          : 'bg-rose-100 dark:bg-rose-900/40 text-rose-800 dark:text-rose-300'
                      }`}>
                        {rem.status === 'Taken' && <FiCheckCircle />}
                        {rem.status === 'Skipped' && <FiMinusCircle />}
                        {rem.status === 'Missed' && <FiXCircle />}
                        {rem.status}
                      </span>
                    </div>
                  )}
                </div>
              </motion.div>
            );
          })}
        </motion.div>
      )}
    </div>
  );
};

export default ReminderDashboard;
