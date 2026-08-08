import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';
import { toast } from 'react-hot-toast';
import { 
  FiAlertTriangle, 
  FiRefreshCw, 
  FiActivity, 
  FiPlus, 
  FiCalendar, 
  FiTrendingDown,
  FiTrendingUp,
  FiFileText,
  FiMail,
  FiBell
} from 'react-icons/fi';
import { GiPill } from 'react-icons/gi';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer,
  ReferenceLine
} from 'recharts';

const RefillPrediction = () => {
  const [predictions, setPredictions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refillQuantity, setRefillQuantity] = useState(30);
  const [selectedMedId, setSelectedMedId] = useState(null);
  const [showRefillModal, setShowRefillModal] = useState(false);
  const [submittingRefill, setSubmittingRefill] = useState(false);

  const fetchPredictions = async () => {
    try {
      setLoading(true);
      const res = await api.get('/refill/predictions');
      setPredictions(res.data);
    } catch (err) {
      console.error("Failed to load refill predictions:", err);
      toast.error("Failed to retrieve stock predictions from refill engine.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPredictions();
  }, []);

  const handleRefillSubmit = async (e) => {
    e.preventDefault();
    if (!selectedMedId) return;

    setSubmittingRefill(true);
    try {
      await api.post(`/refill/${selectedMedId}/refill`, { refill_quantity: parseInt(refillQuantity, 10) });
      toast.success("Medicine stock successfully replenished! 💊");
      setShowRefillModal(false);
      fetchPredictions();
    } catch (err) {
      console.error("Refill transaction failed:", err);
      toast.error(err.response?.data?.detail || "Refill transaction failed.");
    } finally {
      setSubmittingRefill(false);
    }
  };

  const getStockStatus = (remaining, daysLeft) => {
    if (remaining <= 0) return { label: "Out of Stock", color: "bg-rose-500 text-white", ringColor: "border-rose-200" };
    if (remaining <= 5 || daysLeft <= 5) return { label: "Refill Urgent", color: "bg-rose-50 text-rose-700 border-rose-100 dark:bg-rose-950/20 dark:border-rose-800 dark:text-rose-400 font-extrabold animate-pulse", ringColor: "border-rose-300" };
    if (remaining <= 15 || daysLeft <= 15) return { label: "Low Stock", color: "bg-amber-50 text-amber-700 border-amber-100 dark:bg-amber-950/20 dark:border-amber-800 dark:text-amber-400 font-semibold", ringColor: "border-amber-200" };
    return { label: "Normal Stock", color: "bg-teal-50 text-teal-700 border-teal-100 dark:bg-teal-950/20 dark:border-teal-800 dark:text-teal-400 font-semibold", ringColor: "border-teal-200" };
  };

  // Generate mock depletion data for Recharts based on current stock and daily consumption
  const generateDepletionData = (medName, remaining, dailyConsumption, daysLeft) => {
    const data = [];
    const today = new Date();
    
    // We plot 7 steps (from today until depletion date)
    const steps = 7;
    const intervalDays = Math.max(1, Math.ceil(daysLeft / steps));
    
    for (let i = 0; i <= steps; i++) {
      const projectionDay = i * intervalDays;
      if (projectionDay > daysLeft && i !== 0) break;
      
      const futureDate = new Date();
      futureDate.setDate(today.getDate() + projectionDay);
      
      const projectedStock = Math.max(0, Math.round(remaining - (projectionDay * dailyConsumption)));
      
      data.push({
        dateLabel: futureDate.toLocaleDateString(undefined, { month: 'short', day: 'numeric' }),
        stock: projectedStock,
        threshold: 5
      });
    }
    return data;
  };

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-blue-600 border-t-transparent"></div>
      </div>
    );
  }

  const criticalMedicines = predictions.filter(p => p.low_stock_alert);

  return (
    <div className="max-w-7xl mx-auto space-y-8">
      {/* Header */}
      <div className="md:flex md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white dark:text-white flex items-center gap-2">
            <FiActivity className="text-teal-500" /> AI Refill Prediction Engine
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-300 mt-1">
            Predicts when your medicine supplies will run dry based on dosage frequency and actual patient compliance logs.
          </p>
        </div>
        <div className="mt-4 md:mt-0 flex gap-2">
          <button
            onClick={fetchPredictions}
            className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-[#1E293B] px-4 py-2.5 text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700/50 cursor-pointer transition-colors"
          >
            <FiRefreshCw /> Force Recalculate
          </button>
        </div>
      </div>

      {/* Overview Analytics Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {/* Total Active Meds Card */}
        <div className="rounded-2xl border border-slate-100 dark:border-slate-700 bg-white dark:bg-[#1E293B] p-5 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">Monitored Items</span>
            <p className="text-2xl font-black text-slate-900 dark:text-white dark:text-white mt-1">{predictions.length}</p>
          </div>
          <div className="h-10 w-10 bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-lg flex items-center justify-center text-lg">
            <GiPill />
          </div>
        </div>

        {/* Low Stock Alerts Count Card */}
        <div className={`rounded-2xl border p-5 shadow-sm flex items-center justify-between ${
          criticalMedicines.length > 0 
            ? 'bg-rose-50 dark:bg-rose-950/20 border-rose-100 dark:border-rose-800 text-rose-800 dark:text-rose-200' 
            : 'bg-white dark:bg-[#1E293B] border-slate-100 dark:border-slate-850'
        }`}>
          <div>
            <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">Urgent Warnings</span>
            <p className="text-2xl font-black mt-1">{criticalMedicines.length}</p>
          </div>
          <div className={`h-10 w-10 rounded-lg flex items-center justify-center text-lg ${
            criticalMedicines.length > 0 ? 'bg-rose-100 dark:bg-rose-900/40 text-rose-600 dark:text-rose-400' : 'bg-slate-100 dark:bg-[#1E293B] text-slate-500'
          }`}>
            <FiAlertTriangle />
          </div>
        </div>

        {/* Average Adherence Rating */}
        <div className="rounded-2xl border border-slate-100 dark:border-slate-700 bg-white dark:bg-[#1E293B] p-5 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">Refills Expected (30d)</span>
            <p className="text-2xl font-black text-slate-900 dark:text-white dark:text-white mt-1">
              {predictions.filter(p => p.days_left <= 30).length}
            </p>
          </div>
          <div className="h-10 w-10 bg-teal-50 dark:bg-teal-900/30 text-teal-600 dark:text-teal-400 rounded-lg flex items-center justify-center text-lg">
            <FiCalendar />
          </div>
        </div>

        {/* Sync Status Info Card */}
        <div className="rounded-2xl border border-slate-100 dark:border-slate-700 bg-white dark:bg-[#1E293B] p-5 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">Caregiver Alarms</span>
            <span className="inline-flex rounded-full bg-emerald-50 dark:bg-emerald-950/30 px-2 py-0.5 text-[9px] font-medium text-emerald-600 dark:text-emerald-400 border border-emerald-100 dark:border-emerald-800 select-none block mt-1 w-max">
              Active Sync
            </span>
          </div>
          <div className="h-10 w-10 bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 rounded-lg flex items-center justify-center text-lg">
            <FiBell />
          </div>
        </div>
      </div>

      {predictions.length === 0 ? (
        <div className="rounded-2xl border border-slate-100 dark:border-slate-700 bg-white dark:bg-[#1E293B] p-12 text-center shadow-sm max-w-xl mx-auto space-y-4">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-slate-50 dark:bg-[#1E293B] text-slate-400 text-3xl">
            <GiPill />
          </div>
          <h3 className="text-lg font-bold text-slate-900 dark:text-white dark:text-white">No medications registered</h3>
          <p className="text-xs text-slate-400 leading-normal max-w-sm mx-auto">
            You must add medicines before the AI Refill Prediction Engine can calculate stock depletion cycles.
          </p>
          <Link
            to="/medicines/new"
            className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-5 py-2.5 text-xs font-semibold text-white hover:bg-blue-700 transition-colors"
          >
            <FiPlus /> Add First Medicine
          </Link>
        </div>
      ) : (
        <div className="grid gap-8 lg:grid-cols-3">
          
          {/* List of Medicine Predictions (2/3 width) */}
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white dark:bg-[#1E293B] border border-slate-100 dark:border-slate-700 rounded-2xl p-6 shadow-sm">
              <h3 className="text-base font-bold text-slate-900 dark:text-white dark:text-white mb-4">Stock Status & Predictions</h3>
              
              <div className="divide-y divide-slate-100 dark:divide-slate-800">
                {predictions.map((p) => {
                  const status = getStockStatus(p.remaining_quantity, p.days_left);
                  return (
                    <div key={p.id} className="py-5 first:pt-0 last:pb-0 space-y-4">
                      
                      {/* Top Details row */}
                      <div className="flex items-center justify-between gap-4">
                        <div className="flex items-center gap-3">
                          <div className="h-10 w-10 bg-slate-50 dark:bg-[#1E293B] rounded-xl flex items-center justify-center text-lg text-slate-500 font-bold shrink-0">
                            💊
                          </div>
                          <div>
                            <h4 className="font-bold text-slate-700 dark:text-slate-300 text-sm">{p.medicine?.name}</h4>
                            <p className="text-[10px] text-slate-400">
                              Dosage: {p.medicine?.dosage} • Daily Rate: ~{p.average_daily_consumption.toFixed(1)} units/day
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center gap-2">
                          <span className={`inline-flex rounded-full px-2.5 py-0.5 text-[9px] font-bold border uppercase tracking-wider ${status.color}`}>
                            {status.label}
                          </span>
                          
                          <button
                            onClick={() => {
                              setSelectedMedId(p.medicine_id);
                              setRefillQuantity(p.medicine?.quantity || 30);
                              setShowRefillModal(true);
                            }}
                            className="rounded-lg bg-blue-50 hover:bg-blue-100 dark:bg-blue-900/30 dark:hover:bg-blue-900/50 px-3 py-1.5 text-xs font-bold text-blue-600 dark:text-blue-400 transition-colors cursor-pointer"
                          >
                            Refill Stock
                          </button>
                        </div>
                      </div>

                      {/* Stock Progress & Depletion metrics */}
                      <div className="grid gap-4 sm:grid-cols-3 bg-slate-50/50 dark:bg-[#0B1220]/20 rounded-xl p-3 border border-slate-100 dark:border-slate-850">
                        <div className="text-center sm:text-left">
                          <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">Remaining Pills</span>
                          <p className="text-lg font-black text-slate-700 dark:text-slate-300 mt-0.5">
                            {p.remaining_quantity} <span className="text-xs text-slate-400 font-normal">/ {p.medicine?.quantity || 0}</span>
                          </p>
                        </div>
                        <div className="text-center sm:text-left">
                          <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">Estimated Days Left</span>
                          <p className={`text-lg font-black mt-0.5 ${p.days_left <= 5 ? 'text-rose-600 animate-pulse' : 'text-slate-700 dark:text-slate-300'}`}>
                            {p.days_left} Days
                          </p>
                        </div>
                        <div className="text-center sm:text-left">
                          <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider flex items-center justify-center sm:justify-start gap-1">
                            Refill Deadline
                          </span>
                          <p className="text-xs font-bold text-slate-600 dark:text-slate-300 mt-1 flex items-center justify-center sm:justify-start gap-1">
                            <FiCalendar className="text-blue-500" /> {p.estimated_refill_date || "—"}
                          </p>
                        </div>
                      </div>

                      {/* Depletion Curve Line Chart */}
                      {p.days_left > 0 && (
                        <div className="h-32 pt-2">
                          <ResponsiveContainer width="100%" height="100%">
                            <LineChart data={generateDepletionData(p.medicine?.name, p.remaining_quantity, p.average_daily_consumption, p.days_left)}>
                              <XAxis dataKey="dateLabel" tick={{ fontSize: 8 }} stroke="#94a3b8" />
                              <YAxis width={20} tick={{ fontSize: 8 }} stroke="#94a3b8" />
                              <Tooltip contentStyle={{ fontSize: '10px', borderRadius: '8px' }} />
                              <Line type="monotone" dataKey="stock" stroke="#3b82f6" strokeWidth={2} dot={{ r: 2 }} name="Expected Stock" />
                              <ReferenceLine y={5} stroke="#f43f5e" strokeDasharray="3 3" label={{ value: 'Restock Level (5)', fill: '#f43f5e', fontSize: 7, position: 'top' }} />
                            </LineChart>
                          </ResponsiveContainer>
                        </div>
                      )}

                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Right Side Pane: stock alerts and info (1/3 width) */}
          <div className="space-y-6">
            
            {/* Stock Warnings Box */}
            <div className="rounded-2xl border border-slate-100 dark:border-slate-700 bg-white dark:bg-[#1E293B] p-6 shadow-sm space-y-4">
              <div className="flex items-center gap-2 text-rose-600 dark:text-rose-400 font-bold text-sm">
                <FiAlertTriangle className="animate-pulse" />
                <span>Restock Action List</span>
              </div>
              <p className="text-xs text-slate-400 leading-normal">
                The medications below are predicted to completely run out in less than 5 days. Ensure refills are ordered.
              </p>
              
              {criticalMedicines.length === 0 ? (
                <div className="rounded-xl bg-teal-50 dark:bg-teal-900/10 p-3.5 border border-teal-100 dark:border-teal-900 text-teal-800 dark:text-teal-400 text-xs font-semibold text-center">
                  ✅ All medication stock levels normal
                </div>
              ) : (
                <div className="space-y-2">
                  {criticalMedicines.map((m) => (
                    <div key={m.id} className="flex justify-between items-center rounded-xl bg-rose-50/50 dark:bg-rose-950/20 border border-rose-100 dark:border-rose-900 p-3">
                      <div>
                        <p className="font-bold text-slate-700 dark:text-slate-300 text-xs">{m.medicine?.name}</p>
                        <p className="text-[10px] text-slate-400">{m.days_left} days remaining</p>
                      </div>
                      <button
                        onClick={() => {
                          setSelectedMedId(m.medicine_id);
                          setRefillQuantity(m.medicine?.quantity || 30);
                          setShowRefillModal(true);
                        }}
                        className="rounded-lg bg-rose-600 hover:bg-rose-700 px-2.5 py-1 text-[10px] font-bold text-white transition-colors cursor-pointer"
                      >
                        Replenish
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* AI Calculation Parameters Info */}
            <div className="rounded-2xl border border-slate-100 dark:border-slate-700 bg-white dark:bg-[#1E293B] p-6 shadow-sm space-y-3">
              <h4 className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                <FiPlus className="text-blue-500" /> Refill Prediction Logic
              </h4>
              <p className="text-xs text-slate-400 leading-normal">
                Our calculation factors in:
              </p>
              <ul className="space-y-2 text-xs text-slate-500 dark:text-slate-300 list-disc list-inside">
                <li><strong className="text-slate-600 dark:text-slate-300">Daily Frequency</strong>: Scheduled alarms per day</li>
                <li><strong className="text-slate-600 dark:text-slate-300">Compliance Factor</strong>: Average adherence rate from log logs (Taken vs Skipped/Missed)</li>
                <li><strong className="text-slate-600 dark:text-slate-300">Missed doses</strong>: Missed/Skipped logs dynamically slide the estimated depletion date out further</li>
              </ul>
            </div>

          </div>

        </div>
      )}

      {/* Refill Quantity Modal Dialog */}
      <AnimatePresence>
        {showRefillModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="w-full max-w-sm rounded-2xl bg-white dark:bg-[#1E293B] p-6 border border-slate-100 dark:border-slate-700 shadow-2xl space-y-4"
            >
              <div className="space-y-1">
                <h3 className="font-bold text-slate-900 dark:text-white dark:text-white text-base">Refill Medication Stock</h3>
                <p className="text-xs text-slate-400">Specify how many tablets/capsules were added to your pack.</p>
              </div>

              <form onSubmit={handleRefillSubmit} className="space-y-4">
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">
                    Refill Add Quantity
                  </label>
                  <input
                    type="number"
                    min="1"
                    required
                    value={refillQuantity}
                    onChange={(e) => setRefillQuantity(e.target.value)}
                    className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-[#1E293B] py-2.5 px-3.5 text-sm dark:text-white outline-none focus:border-blue-500 focus:bg-white"
                  />
                </div>

                <div className="flex gap-2 justify-end border-t border-slate-50 dark:border-slate-700 pt-3">
                  <button
                    type="button"
                    onClick={() => setShowRefillModal(false)}
                    className="rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 px-4 py-2 text-xs font-semibold text-slate-600 dark:text-slate-300 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={submittingRefill}
                    className="inline-flex items-center gap-1.5 rounded-xl bg-blue-600 hover:bg-blue-700 px-4 py-2 text-xs font-bold text-white shadow-md transition-colors cursor-pointer"
                  >
                    {submittingRefill ? (
                      <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent"></div>
                    ) : (
                      "Apply Replenishment"
                    )}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
};

export default RefillPrediction;
