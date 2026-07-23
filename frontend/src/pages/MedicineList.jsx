import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';
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
  FiTrendingDown
} from 'react-icons/fi';
import { GiPill } from 'react-icons/gi';

const MedicineList = () => {
  const [medicines, setMedicines] = useState([]);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('');
  const [sortBy, setSortBy] = useState('');
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  const fetchMedicines = async () => {
    try {
      const params = {};
      if (search) params.search = search;
      if (category) params.category = category;
      if (sortBy) params.sort_by = sortBy;

      // Note: Backend routers support both /medicine and /medicines
      const res = await api.get('/medicines', { params });
      setMedicines(res.data);
    } catch (err) {
      console.error("Error fetching medicines:", err);
      setErrorMsg("Failed to retrieve medicines.");
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
    setErrorMsg('');
    setSuccessMsg('');
    try {
      await api.delete(`/medicines/${id}`);
      setSuccessMsg(`"${name}" was deleted successfully.`);
      setMedicines(prev => prev.filter(m => m.id !== id));
      setTimeout(() => setSuccessMsg(''), 4000);
    } catch (err) {
      console.error("Error deleting medicine:", err);
      setErrorMsg(err.response?.data?.detail || "Could not delete medicine. Please try again.");
    }
  };

  const getStockStatus = (remaining, total) => {
    const pct = (remaining / total) * 100;
    if (remaining <= 0) return { text: 'Out of Stock', color: 'text-rose-600 bg-rose-50 border-rose-100' };
    if (remaining <= 5) return { text: 'Refill Urgent', color: 'text-rose-600 bg-rose-50 border-rose-100 font-bold animate-pulse' };
    if (pct < 30) return { text: 'Low Stock', color: 'text-amber-600 bg-amber-50 border-amber-100' };
    return { text: 'In Stock', color: 'text-emerald-600 bg-emerald-50 border-emerald-100' };
  };

  return (
    <div className="space-y-8">
      {/* Top Header */}
      <div className="md:flex md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-800">Medicines Directory</h1>
          <p className="text-sm text-slate-500 mt-1">Add, browse, and edit your active medical treatments and stock levels.</p>
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

      {/* Success and Error messages */}
      {successMsg && (
        <div className="rounded-xl bg-emerald-50 p-4 text-sm text-emerald-700 border border-emerald-100">
          {successMsg}
        </div>
      )}
      {errorMsg && (
        <div className="rounded-xl bg-rose-50 p-4 text-sm text-rose-600 border border-rose-100">
          {errorMsg}
        </div>
      )}

      {/* Filters & Actions Panel */}
      <div className="rounded-2xl border border-slate-100 bg-white p-4 shadow-sm grid gap-4 md:grid-cols-4">
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
            className="w-full rounded-xl border border-slate-200 py-2.5 pl-10 pr-4 text-sm outline-none focus:border-blue-500 transition-colors"
          />
        </div>

        {/* Filter Category */}
        <div className="relative">
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="w-full appearance-none rounded-xl border border-slate-200 py-2.5 px-3.5 text-sm bg-white outline-none focus:border-blue-500 transition-colors cursor-pointer"
          >
            <option value="">All Categories</option>
            <option value="Cardiovascular">Cardiovascular</option>
            <option value="Diabetes">Diabetes</option>
            <option value="Respiratory">Respiratory</option>
            <option value="Pain Management">Pain Management</option>
            <option value="Antibiotics">Antibiotics</option>
            <option value="Vitamins">Vitamins / Supplements</option>
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
            className="w-full appearance-none rounded-xl border border-slate-200 py-2.5 px-3.5 text-sm bg-white outline-none focus:border-blue-500 transition-colors cursor-pointer"
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
        <div className="flex h-48 items-center justify-center">
          <div className="h-10 w-10 animate-spin rounded-full border-4 border-blue-600 border-t-transparent"></div>
        </div>
      ) : medicines.length === 0 ? (
        <div className="rounded-2xl border border-slate-100 bg-white p-12 text-center shadow-sm max-w-lg mx-auto">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-slate-50 text-slate-400 mb-4 text-3xl">
            <GiPill />
          </div>
          <h3 className="text-lg font-bold text-slate-800">No medicines found</h3>
          <p className="text-sm text-slate-500 mt-1">Start by adding your first medicine treatment card to track schedules.</p>
          <Link
            to="/medicines/new"
            className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm mt-4 hover:bg-blue-700 transition-all cursor-pointer"
          >
            <FiPlus /> Add Medicine Now
          </Link>
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {medicines.map((med) => {
            const stockStatus = getStockStatus(med.remaining_stock, med.quantity);
            return (
              <div 
                key={med.id} 
                className="rounded-2xl border border-slate-100 bg-white p-6 shadow-sm hover:shadow-md transition-all flex flex-col justify-between space-y-4"
              >
                {/* Header Section */}
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-3">
                    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-tr from-blue-500 to-indigo-600 text-white text-2xl font-bold shadow-sm">
                      <GiPill />
                    </div>
                    <div>
                      <h3 className="font-bold text-slate-800 text-base leading-tight">{med.name}</h3>
                      <span className="inline-flex rounded-full bg-slate-50 border border-slate-100 px-2 py-0.5 text-[10px] font-semibold text-slate-500 mt-1">
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
                <div className="space-y-2.5 text-xs text-slate-500">
                  <div className="flex justify-between items-center py-1 border-b border-slate-50">
                    <span className="font-semibold text-slate-400">Dosage</span>
                    <span className="font-bold text-slate-700">{med.dosage} ({med.medicine_type || 'Pill'})</span>
                  </div>
                  <div className="flex justify-between items-center py-1 border-b border-slate-50">
                    <span className="font-semibold text-slate-400">Frequency</span>
                    <span className="font-bold text-slate-700">{med.frequency}</span>
                  </div>
                  <div className="flex justify-between items-center py-1 border-b border-slate-50">
                    <span className="font-semibold text-slate-400">Inventory Stock</span>
                    <span className="font-bold text-slate-700">{med.remaining_stock} / {med.quantity} Left</span>
                  </div>
                  <div className="py-1">
                    <span className="font-semibold text-slate-400 block mb-1">Reminder Schedule Slots</span>
                    <div className="flex gap-1.5 flex-wrap">
                      {med.morning && (
                        <span className="bg-amber-50 text-amber-700 border border-amber-100 rounded-lg px-2 py-0.5 text-[10px] font-bold">
                          Morning
                        </span>
                      )}
                      {med.afternoon && (
                        <span className="bg-orange-50 text-orange-700 border border-orange-100 rounded-lg px-2 py-0.5 text-[10px] font-bold">
                          Afternoon
                        </span>
                      )}
                      {med.night && (
                        <span className="bg-indigo-50 text-indigo-700 border border-indigo-100 rounded-lg px-2 py-0.5 text-[10px] font-bold">
                          Night
                        </span>
                      )}
                      <span className="bg-blue-50 text-blue-700 border border-blue-100 rounded-lg px-2 py-0.5 text-[10px] font-bold flex items-center gap-0.5">
                        <FiClock className="text-[9px]" /> {med.reminder_time}
                      </span>
                    </div>
                  </div>
                  
                  {med.instructions && (
                    <div className="rounded-xl bg-slate-50/50 p-2.5 border border-slate-100 mt-2">
                      <p className="font-semibold text-slate-600 mb-0.5">Instructions:</p>
                      <p className="text-[11px] text-slate-500 italic">"{med.instructions}"</p>
                    </div>
                  )}
                </div>

                {/* Card Action Buttons */}
                <div className="flex items-center gap-2 pt-3 border-t border-slate-50">
                  <Link
                    to={`/medicines/edit/${med.id}`}
                    className="flex-1 inline-flex items-center justify-center gap-1.5 rounded-xl bg-slate-50 hover:bg-slate-100 border border-slate-100 text-slate-600 py-2.5 text-xs font-bold transition-colors"
                  >
                    <FiEdit /> Edit
                  </Link>
                  <button
                    onClick={() => handleDelete(med.id, med.name)}
                    className="inline-flex h-9 w-9 items-center justify-center rounded-xl bg-rose-50 hover:bg-rose-100 border border-rose-100 text-rose-600 transition-colors cursor-pointer"
                  >
                    <FiTrash2 />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default MedicineList;
