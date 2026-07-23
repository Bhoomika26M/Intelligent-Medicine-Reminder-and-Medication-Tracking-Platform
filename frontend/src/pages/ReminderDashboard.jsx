import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { 
  FiClock, 
  FiCalendar, 
  FiCheckCircle, 
  FiXCircle, 
  FiMinusCircle, 
  FiAlertCircle, 
  FiPlay, 
  FiChevronLeft, 
  FiChevronRight 
} from 'react-icons/fi';
import { GiPill } from 'react-icons/gi';

const ReminderDashboard = () => {
  const [reminders, setReminders] = useState([]);
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [statusFilter, setStatusFilter] = useState('');
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState('');
  const [simulationMsg, setSimulationMsg] = useState('');
  const [submittingId, setSubmittingId] = useState(null);

  const fetchReminders = async () => {
    setLoading(true);
    try {
      const params = { date_filter: selectedDate };
      if (statusFilter) params.status_filter = statusFilter;

      const res = await api.get('/reminders', { params });
      setReminders(res.data);
    } catch (err) {
      console.error("Error loading reminders:", err);
      setErrorMsg("Failed to retrieve reminder logs.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReminders();
  }, [selectedDate, statusFilter]);

  // Adjust Date using buttons
  const adjustDate = (days) => {
    const d = new Date(selectedDate);
    d.setDate(d.getDate() + days);
    setSelectedDate(d.toISOString().split('T')[0]);
  };

  const handleStatusChange = async (id, status) => {
    setSubmittingId(id);
    setErrorMsg('');
    try {
      await api.put(`/reminders/${id}`, { status });
      setReminders(prev => prev.map(r => r.id === id ? { ...r, status } : r));
    } catch (err) {
      console.error("Error updating reminder status:", err);
      setErrorMsg(err.response?.data?.detail || "Could not log dose action. Please try again.");
    } finally {
      setSubmittingId(null);
    }
  };

  const triggerSimulation = async () => {
    setSimulationMsg('');
    setErrorMsg('');
    try {
      const res = await api.post('/reminders/generate-today');
      setSimulationMsg(res.data.detail || "Reminders simulation trigger complete.");
      fetchReminders();
      setTimeout(() => setSimulationMsg(''), 4000);
    } catch (err) {
      console.error("Simulation failed:", err);
      setErrorMsg(err.response?.data?.detail || "Could not run reminder scheduler simulation.");
    }
  };

  return (
    <div className="space-y-8">
      {/* Header Block */}
      <div className="md:flex md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-800">Reminder Schedules</h1>
          <p className="text-sm text-slate-500 mt-1">Mark daily doses as Taken or Skipped, and verify scheduling status.</p>
        </div>
        <div className="mt-4 md:mt-0 flex gap-3">
          <button
            onClick={triggerSimulation}
            className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-blue-600 to-teal-500 px-4 py-2.5 text-sm font-semibold text-white shadow-md hover:opacity-90 transition-all cursor-pointer"
          >
            <FiPlay /> Simulate Today's Reminders
          </button>
        </div>
      </div>

      {/* Messages */}
      {simulationMsg && (
        <div className="rounded-xl bg-emerald-50 p-4 text-sm text-emerald-700 border border-emerald-100 flex items-center gap-2 animate-bounce">
          <FiCheckCircle className="text-lg shrink-0" />
          <span>{simulationMsg}</span>
        </div>
      )}
      {errorMsg && (
        <div className="rounded-xl bg-rose-50 p-4 text-sm text-rose-600 border border-rose-100 flex items-center gap-2">
          <FiAlertCircle className="text-lg shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* Controls Bar */}
      <div className="rounded-2xl border border-slate-100 bg-white p-4 shadow-sm flex flex-col md:flex-row gap-4 items-center justify-between">
        {/* Date Selector Navigation */}
        <div className="flex items-center gap-2">
          <button 
            onClick={() => adjustDate(-1)} 
            className="p-2 border border-slate-200 rounded-xl hover:bg-slate-50 transition-colors text-slate-600 cursor-pointer"
          >
            <FiChevronLeft className="text-lg" />
          </button>
          
          <div className="relative">
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="rounded-xl border border-slate-200 py-2 px-3 pl-8 text-sm outline-none focus:border-blue-500 bg-white text-slate-700 font-bold"
            />
            <div className="absolute inset-y-0 left-2.5 flex items-center pointer-events-none text-slate-400">
              <FiCalendar className="text-xs" />
            </div>
          </div>
          
          <button 
            onClick={() => adjustDate(1)} 
            className="p-2 border border-slate-200 rounded-xl hover:bg-slate-50 transition-colors text-slate-600 cursor-pointer"
          >
            <FiChevronRight className="text-lg" />
          </button>
          
          <button 
            onClick={() => setSelectedDate(new Date().toISOString().split('T')[0])}
            className="text-xs font-bold text-blue-600 hover:underline pl-2"
          >
            Today
          </button>
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
                  ? 'bg-blue-50 text-blue-600 border-blue-200 font-bold'
                  : 'bg-white text-slate-500 border-slate-200 hover:bg-slate-50'
              }`}
            >
              {item.label}
            </button>
          ))}
        </div>
      </div>

      {/* Reminders List */}
      {loading ? (
        <div className="flex h-48 items-center justify-center">
          <div className="h-10 w-10 animate-spin rounded-full border-4 border-blue-600 border-t-transparent"></div>
        </div>
      ) : reminders.length === 0 ? (
        <div className="rounded-2xl border border-slate-100 bg-white p-12 text-center shadow-sm max-w-lg mx-auto">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-slate-50 text-slate-400 mb-4 text-3xl">
            <FiClock />
          </div>
          <h3 className="text-lg font-bold text-slate-800">No scheduled reminders</h3>
          <p className="text-sm text-slate-500 mt-1">
            There are no reminders logged for this date. Check active date ranges on your medicines, or use the simulation trigger.
          </p>
        </div>
      ) : (
        <div className="grid gap-4 max-w-3xl mx-auto">
          {reminders.map((rem) => {
            const isPending = rem.status === 'Pending';
            return (
              <div 
                key={rem.id} 
                className={`rounded-2xl border bg-white p-5 shadow-sm hover:shadow-md transition-all flex items-center justify-between gap-4 ${
                  rem.status === 'Taken' 
                    ? 'border-emerald-100 bg-emerald-50/10'
                    : rem.status === 'Skipped'
                    ? 'border-amber-100 bg-amber-50/10'
                    : rem.status === 'Missed'
                    ? 'border-rose-100 bg-rose-50/10'
                    : 'border-slate-100'
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
                    <h3 className="font-bold text-slate-800 text-sm">{rem.medicine?.name}</h3>
                    <p className="text-xs text-slate-400 mt-0.5 flex items-center gap-3">
                      <span className="flex items-center gap-1">
                        <FiClock /> Time: <span className="font-semibold text-slate-600">{rem.reminder_time.substring(0, 5)}</span>
                      </span>
                      <span>• Dosage: {rem.medicine?.dosage}</span>
                    </p>
                  </div>
                </div>

                {/* Right Side: Actions or Status Indicator */}
                <div className="flex items-center gap-2">
                  {isPending ? (
                    <>
                      <button
                        onClick={() => handleStatusChange(rem.id, 'Taken')}
                        disabled={submittingId !== null}
                        className="rounded-xl bg-teal-500 hover:bg-teal-600 text-white px-4 py-2 text-xs font-bold shadow-sm transition-colors cursor-pointer flex items-center gap-1.5"
                      >
                        <FiCheckCircle /> Take
                      </button>
                      <button
                        onClick={() => handleStatusChange(rem.id, 'Skipped')}
                        disabled={submittingId !== null}
                        className="rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-600 px-4 py-2 text-xs font-bold transition-colors cursor-pointer flex items-center gap-1.5"
                      >
                        <FiXCircle /> Skip
                      </button>
                    </>
                  ) : (
                    <div className="flex items-center gap-1.5">
                      <span className={`inline-flex items-center gap-1 rounded-full px-3 py-1 text-xs font-bold capitalize ${
                        rem.status === 'Taken' 
                          ? 'bg-emerald-100 text-emerald-800' 
                          : rem.status === 'Skipped'
                          ? 'bg-amber-100 text-amber-800'
                          : 'bg-rose-100 text-rose-800'
                      }`}>
                        {rem.status === 'Taken' && <FiCheckCircle />}
                        {rem.status === 'Skipped' && <FiMinusCircle />}
                        {rem.status === 'Missed' && <FiXCircle />}
                        {rem.status}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default ReminderDashboard;
