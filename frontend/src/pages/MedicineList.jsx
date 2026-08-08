import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';
import { toast } from 'react-hot-toast';
import { motion } from 'framer-motion';
import { 
  FiSearch, 
  FiPlus, 
  FiTrash2, 
  FiEdit, 
  FiFilter, 
  FiAlertTriangle, 
  FiClock, 
  FiLayers,
  FiCalendar,
  FiTrendingDown,
  FiPackage
} from 'react-icons/fi';
import { GiPill } from 'react-icons/gi';

const MedicineList = () => {
  const [medicines, setMedicines] = useState([]);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('');
  const [sortBy, setSortBy] = useState('');
  const [loading, setLoading] = useState(true);

  const fetchMedicines = async () => {
    try {
      const params = {};
      if (search) params.search = search;
      if (category) params.category = category;
      if (sortBy) params.sort_by = sortBy;

      const res = await api.get('/medicines', { params });
      setMedicines(res.data);
    } catch (err) {
      console.error("Error fetching medicines:", err);
      toast.error("Failed to retrieve medicines. Please refresh.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const delayDebounce = setTimeout(() => {
      fetchMedicines();
    }, 300); // Debounce search requests

    return () => clearTimeout(delayDebounce);
  }, [search, category, sortBy]);

  const handleDelete = async (id, name) => {
    if (!window.confirm(`Are you sure you want to delete "${name}" from your active medicines?`)) {
      return;
    }
    try {
      await api.delete(`/medicines/${id}`);
      toast.success(`"${name}" deleted successfully.`);
      setMedicines(prev => prev.filter(m => m.id !== id));
    } catch (err) {
      console.error("Error deleting medicine:", err);
      toast.error(err.response?.data?.detail || "Could not delete medicine. Please try again.");
    }
  };

  const getStockStatus = (remaining, total) => {
    const pct = (remaining / total) * 100;
    if (remaining <= 0) return { text: 'Out of Stock', color: 'text-rose-600 bg-rose-50 border-rose-100 dark:bg-rose-900/30 dark:border-rose-800 dark:text-rose-400' };
    if (remaining <= 5) return { text: 'Refill Urgent', color: 'text-rose-600 bg-rose-50 border-rose-100 dark:bg-rose-900/30 dark:border-rose-800 dark:text-rose-400 font-bold animate-pulse' };
    if (pct < 30) return { text: 'Low Stock', color: 'text-amber-600 bg-amber-50 border-amber-100 dark:bg-amber-900/30 dark:border-amber-800 dark:text-amber-400' };
    return { text: 'In Stock', color: 'text-emerald-600 bg-emerald-50 border-emerald-100 dark:bg-emerald-900/30 dark:border-emerald-800 dark:text-emerald-400' };
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.07 } }
  };

  const cardVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.3 } }
  };

  return (
    <div className="space-y-8">
      {/* Top Header */}
      <div className="md:flex md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white dark:text-white">Medicines Directory</h1>
          <p className="text-sm text-slate-500 dark:text-slate-300 mt-1">Add, browse, and edit your active medical treatments and stock levels.</p>
        </div>
        <div className="mt-4 md:mt-0">
          <Link
            to="/medicines/new"
            className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-blue-600 to-teal-500 px-5 py-3 text-sm font-semibold text-white shadow-md shadow-blue-500/10 hover:opacity-90 transition-all cursor-pointer"
          >
            <FiPlus /> Add Medicine
          </Link>
        </div>
      </div>

      {/* Filters & Actions Panel */}
      <div className="rounded-2xl border border-slate-100 dark:border-slate-700 bg-white dark:bg-[#1E293B] p-4 shadow-sm grid gap-4 md:grid-cols-4">
        {/* Search */}
        <div className="relative md:col-span-2">
          <div className="absolute inset-y-0 left-0 flex items-center pl-3.5 text-slate-400">
            <FiSearch />
          </div>
          <input
            type="text"
            placeholder="Search by medicine name, category or type..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full rounded-xl border border-slate-200 dark:border-slate-700 py-2.5 pl-10 pr-4 text-sm outline-none focus:border-blue-500 transition-colors bg-white dark:bg-slate-700 text-slate-900 dark:text-white dark:text-white placeholder:text-slate-400"
          />
        </div>

        {/* Filter Category */}
        <div className="relative">
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="w-full appearance-none rounded-xl border border-slate-200 dark:border-slate-700 py-2.5 px-3.5 text-sm bg-white dark:bg-slate-700 text-slate-700 dark:text-slate-300 outline-none focus:border-blue-500 transition-colors cursor-pointer"
          >
            <option value="">All Categories</option>
            <option value="Cardiovascular">Cardiovascular</option>
            <option value="Diabetes">Diabetes</option>
            <option value="Respiratory">Respiratory</option>
            <option value="Thyroid">Thyroid</option>
            <option value="Antibiotics">Antibiotics</option>
            <option value="Pain Management">Pain Management</option>
            <option value="Vitamins">Vitamins / Supplements</option>
            <option value="Heart">Heart Medications</option>
            <option value="Other">Other</option>
          </select>
          <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none text-slate-400">
            <FiFilter />
          </div>
        </div>

        {/* Sort By */}
        <div className="relative">
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="w-full appearance-none rounded-xl border border-slate-200 dark:border-slate-700 py-2.5 px-3.5 text-sm bg-white dark:bg-slate-700 text-slate-700 dark:text-slate-300 outline-none focus:border-blue-500 transition-colors cursor-pointer"
          >
            <option value="">Sort: Default (Newest)</option>
            <option value="name">Sort: Drug Name</option>
            <option value="remaining_stock">Sort: Low Stock First</option>
            <option value="end_date">Sort: End Date</option>
          </select>
          <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none text-slate-400">
            <FiLayers />
          </div>
        </div>
      </div>

      {/* Medicine Grid */}
      {loading ? (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="rounded-2xl border border-slate-100 dark:border-slate-700 bg-white dark:bg-[#1E293B] p-6 shadow-sm animate-pulse">
              <div className="flex items-center gap-3 mb-4">
                <div className="h-12 w-12 rounded-2xl bg-slate-200 dark:bg-slate-700" />
                <div className="space-y-2 flex-1">
                  <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded-lg w-3/4" />
                  <div className="h-3 bg-slate-100 dark:bg-slate-700 rounded-lg w-1/2" />
                </div>
              </div>
              <div className="space-y-2">
                <div className="h-3 bg-slate-100 dark:bg-slate-700 rounded-lg" />
                <div className="h-3 bg-slate-100 dark:bg-slate-700 rounded-lg" />
                <div className="h-3 bg-slate-100 dark:bg-slate-700 rounded-lg w-4/5" />
              </div>
            </div>
          ))}
        </div>
      ) : medicines.length === 0 ? (
        <div className="rounded-2xl border border-slate-100 dark:border-slate-700 bg-white dark:bg-[#1E293B] p-12 text-center shadow-sm max-w-lg mx-auto">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-slate-50 dark:bg-slate-700 text-slate-400 mb-4 text-3xl">
            <GiPill />
          </div>
          <h3 className="text-lg font-bold text-slate-900 dark:text-white dark:text-white">No medicines found</h3>
          <p className="text-sm text-slate-500 dark:text-slate-300 mt-1">Start by adding your first medicine treatment card to track schedules.</p>
          <Link
            to="/medicines/new"
            className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm mt-4 hover:bg-blue-700 transition-all cursor-pointer"
          >
            <FiPlus /> Add Medicine Now
          </Link>
        </div>
      ) : (
        <motion.div 
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="grid gap-6 md:grid-cols-2 lg:grid-cols-3"
        >
          {medicines.map((med) => {
            const stockStatus = getStockStatus(med.remaining_stock, med.quantity);
            return (
              <motion.div 
                key={med.id} 
                variants={cardVariants}
                className="rounded-2xl border border-slate-100 dark:border-slate-700 bg-white dark:bg-[#1E293B] p-6 shadow-sm hover:shadow-md dark:hover:shadow-slate-700/50 transition-all flex flex-col justify-between space-y-4 group"
              >
                {/* Header Section */}
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-3">
                    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-tr from-blue-500 to-indigo-600 text-white text-2xl font-bold shadow-sm group-hover:scale-110 transition-transform">
                      <GiPill />
                    </div>
                    <div>
                      <h3 className="font-bold text-slate-900 dark:text-white dark:text-white text-base leading-tight">{med.name}</h3>
                      <span className="inline-flex rounded-full bg-slate-50 dark:bg-slate-700 border border-slate-100 dark:border-slate-700 px-2 py-0.5 text-[10px] font-semibold text-slate-500 dark:text-slate-300 mt-1">
                        {med.disease_category || 'General Health'}
                      </span>
                    </div>
                  </div>
                  
                  {/* Stock Tag */}
                  <span className={`inline-flex rounded-full px-2.5 py-0.5 text-[10px] font-bold border ${stockStatus.color}`}>
                    {stockStatus.text}
                  </span>
                </div>

                {/* Details Section */}
                <div className="space-y-2.5 text-xs text-slate-500 dark:text-slate-300">
                  <div className="flex justify-between items-center py-1 border-b border-slate-50 dark:border-slate-700">
                    <span className="font-semibold text-slate-400 dark:text-slate-500">Dosage</span>
                    <span className="font-bold text-slate-700 dark:text-slate-300">{med.dosage} ({med.medicine_type || 'Pill'})</span>
                  </div>
                  <div className="flex justify-between items-center py-1 border-b border-slate-50 dark:border-slate-700">
                    <span className="font-semibold text-slate-400 dark:text-slate-500">Frequency</span>
                    <span className="font-bold text-slate-700 dark:text-slate-300">{med.frequency}</span>
                  </div>
                  <div className="flex justify-between items-center py-1 border-b border-slate-50 dark:border-slate-700">
                    <span className="font-semibold text-slate-400 dark:text-slate-500">Inventory Stock</span>
                    <span className={`font-bold ${med.remaining_stock <= 5 ? 'text-rose-600' : 'text-slate-700 dark:text-slate-300'}`}>
                      {med.remaining_stock} / {med.quantity} Left
                    </span>
                  </div>

                  {/* Stock Progress Mini-bar */}
                  <div className="w-full bg-slate-100 dark:bg-slate-700 rounded-full h-1.5 overflow-hidden">
                    <div 
                      className={`h-full rounded-full transition-all ${
                        med.remaining_stock <= 5 ? 'bg-rose-500' : 
                        (med.remaining_stock / med.quantity) < 0.3 ? 'bg-amber-400' : 
                        'bg-emerald-500'
                      }`}
                      style={{ width: `${Math.min((med.remaining_stock / med.quantity) * 100, 100)}%` }}
                    />
                  </div>

                  <div className="py-1">
                    <span className="font-semibold text-slate-400 dark:text-slate-500 block mb-1">Schedule Slots</span>
                    <div className="flex gap-1.5 flex-wrap">
                      {med.morning && (
                        <span className="bg-amber-50 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400 border border-amber-100 dark:border-amber-800 rounded-lg px-2 py-0.5 text-[10px] font-bold">
                          Morning
                        </span>
                      )}
                      {med.afternoon && (
                        <span className="bg-orange-50 dark:bg-orange-900/30 text-orange-700 dark:text-orange-400 border border-orange-100 dark:border-orange-800 rounded-lg px-2 py-0.5 text-[10px] font-bold">
                          Afternoon
                        </span>
                      )}
                      {med.night && (
                        <span className="bg-indigo-50 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-400 border border-indigo-100 dark:border-indigo-800 rounded-lg px-2 py-0.5 text-[10px] font-bold">
                          Night
                        </span>
                      )}
                      <span className="bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 border border-blue-100 dark:border-blue-800 rounded-lg px-2 py-0.5 text-[10px] font-bold flex items-center gap-0.5">
                        <FiClock className="text-[9px]" /> {med.reminder_time}
                      </span>
                    </div>
                  </div>
                  
                  {med.instructions && (
                    <div className="rounded-xl bg-slate-50/50 dark:bg-slate-700/50 p-2.5 border border-slate-100 dark:border-slate-700 mt-2">
                      <p className="font-semibold text-slate-600 dark:text-slate-300 mb-0.5">Instructions:</p>
                      <p className="text-[11px] text-slate-500 dark:text-slate-300 italic">"{med.instructions}"</p>
                    </div>
                  )}
                  
                  <div className="flex justify-between text-[10px] text-slate-400 pt-1">
                    <span><FiCalendar className="inline mr-1" />Start: {med.start_date}</span>
                    <span>End: {med.end_date}</span>
                  </div>
                </div>

                {/* Card Action Buttons */}
                <div className="flex items-center gap-2 pt-3 border-t border-slate-50 dark:border-slate-700">
                  <Link
                    to={`/medicines/edit/${med.id}`}
                    className="flex-1 inline-flex items-center justify-center gap-1.5 rounded-xl bg-slate-50 dark:bg-slate-700 hover:bg-slate-100 dark:hover:bg-slate-600 border border-slate-100 dark:border-slate-700 text-slate-600 dark:text-slate-300 py-2.5 text-xs font-bold transition-colors"
                  >
                    <FiEdit /> Edit Medicine
                  </Link>
                  <button
                    onClick={() => handleDelete(med.id, med.name)}
                    className="inline-flex h-9 w-9 items-center justify-center rounded-xl bg-rose-50 dark:bg-rose-900/30 hover:bg-rose-100 dark:hover:bg-rose-900/50 border border-rose-100 dark:border-rose-800 text-rose-600 dark:text-rose-400 transition-colors cursor-pointer"
                    title="Delete Medicine"
                  >
                    <FiTrash2 />
                  </button>
                </div>
              </motion.div>
            );
          })}
        </motion.div>
      )}

      {/* Stats Summary Bar */}
      {medicines.length > 0 && !loading && (
        <div className="rounded-2xl border border-slate-100 dark:border-slate-700 bg-white dark:bg-[#1E293B] p-4 shadow-sm flex flex-wrap gap-4 items-center justify-between">
          <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-300">
            <FiPackage className="text-blue-500" />
            <span><span className="font-bold text-slate-700 dark:text-slate-300">{medicines.length}</span> total medicines</span>
          </div>
          <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-300">
            <FiAlertTriangle className="text-rose-500" />
            <span><span className="font-bold text-rose-600">{medicines.filter(m => m.remaining_stock <= 5).length}</span> need refills</span>
          </div>
          <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-300">
            <FiTrendingDown className="text-amber-500" />
            <span><span className="font-bold text-amber-600">{medicines.filter(m => (m.remaining_stock / m.quantity) < 0.3 && m.remaining_stock > 5).length}</span> low stock</span>
          </div>
        </div>
      )}
    </div>
  );
};

export default MedicineList;
