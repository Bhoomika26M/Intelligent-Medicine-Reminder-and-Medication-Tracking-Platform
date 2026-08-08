import React, { useState, useEffect } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import api from '../services/api';
import { toast } from 'react-hot-toast';
import { FiChevronLeft, FiCheck, FiAlertCircle, FiClock, FiCalendar, FiEdit } from 'react-icons/fi';

const EditMedicine = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const { register, handleSubmit, reset, watch, setValue, formState: { errors } } = useForm();

  useEffect(() => {
    const fetchMedicineDetails = async () => {
      try {
        const res = await api.get(`/medicines/${id}`);
        reset(res.data);
      } catch (err) {
        console.error("Error loading medicine details:", err);
        setErrorMsg("Failed to retrieve medicine information.");
      } finally {
        setLoading(false);
      }
    };
    fetchMedicineDetails();
  }, [id, reset]);

  // Watch checkboxes for schedule
  const watchMorning = watch("morning");
  const watchAfternoon = watch("afternoon");
  const watchNight = watch("night");

  // Auto-updates times if boxes are adjusted
  const [userInteracted, setUserInteracted] = useState(false);
  useEffect(() => {
    if (!userInteracted) {
      setUserInteracted(true);
      return;
    }
    const times = [];
    if (watchMorning) times.push("08:00");
    if (watchAfternoon) times.push("13:00");
    if (watchNight) times.push("20:00");
    
    if (times.length > 0) {
      setValue("reminder_time", times.join(", "));
    }
  }, [watchMorning, watchAfternoon, watchNight, setValue]);

  const onSubmit = async (data) => {
    setSubmitting(true);
    setErrorMsg('');
    try {
      const payload = {
        ...data,
        quantity: parseInt(data.quantity, 10),
        remaining_stock: parseInt(data.remaining_stock, 10)
      };

      await api.put(`/medicines/${id}`, payload);
      toast.success(`"${data.name}" updated successfully!`);
      navigate('/medicines');
    } catch (err) {
      console.error("Error updating medicine:", err);
      const msg = err.response?.data?.detail || "Failed to update medicine. Check inputs and try again.";
      setErrorMsg(msg);
      toast.error(msg);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-blue-600 border-t-transparent"></div>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Back Button */}
      <Link to="/medicines" className="inline-flex items-center gap-1 text-slate-500 hover:text-slate-900 dark:text-white text-sm font-semibold transition-colors">
        <FiChevronLeft /> Back to Medicines
      </Link>

      <div>
        <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white">Edit Medicine Treatment</h1>
        <p className="text-sm text-slate-500 dark:text-slate-300 mt-1">Modify dose schedules, instruction notes, and inventory status.</p>
      </div>

      {errorMsg && (
        <div className="flex items-center gap-2 rounded-xl bg-rose-50 p-4 text-sm text-rose-600 border border-rose-100">
          <FiAlertCircle className="text-lg shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      <form onSubmit={handleSubmit(onSubmit)} className="bg-white dark:bg-[#1E293B] border border-slate-200 dark:border-slate-700 rounded-2xl p-6 shadow-sm space-y-6">
        {/* Row 1: Drug Name & Disease Tag */}
        <div className="grid gap-4 md:grid-cols-2">
          <div>
            <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 uppercase tracking-wider mb-1">
              Medicine Name *
            </label>
            <input
              type="text"
              placeholder="e.g. Metformin, Aspirin"
              {...register("name", { required: "Medicine name is required" })}
              className={`w-full rounded-xl border py-2.5 px-3.5 text-sm bg-white dark:bg-[#0B1220] text-slate-900 dark:text-white outline-none transition-all shadow-sm ${
                errors.name ? 'border-rose-300 focus:border-rose-400' : 'border-slate-200 dark:border-slate-700 focus:border-blue-500 focus:ring-1 focus:ring-blue-500'
              }`}
            />
            {errors.name && <span className="text-xs text-rose-500 mt-1 block">{errors.name.message}</span>}
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 uppercase tracking-wider mb-1">
              Target Illness / Disease (e.g. Diabetes)
            </label>
            <input
              type="text"
              placeholder="e.g. Diabetes, Hypertension"
              {...register("disease")}
              className="w-full rounded-xl border py-2.5 px-3.5 text-sm border-slate-200 dark:border-slate-700 bg-white dark:bg-[#0B1220] text-slate-900 dark:text-white focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition-all shadow-sm"
            />
          </div>
        </div>

        {/* Row 2: Dosage & Type */}
        <div className="grid gap-4 md:grid-cols-3">
          <div>
            <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 uppercase tracking-wider mb-1">
              Dosage (e.g. 500mg) *
            </label>
            <input
              type="text"
              placeholder="e.g. 500mg, 1 Tablet"
              {...register("dosage", { required: "Dosage is required" })}
              className={`w-full rounded-xl border py-2.5 px-3.5 text-sm bg-white dark:bg-[#0B1220] text-slate-900 dark:text-white outline-none transition-all shadow-sm ${
                errors.dosage ? 'border-rose-300 focus:border-rose-400' : 'border-slate-200 dark:border-slate-700 focus:border-blue-500 focus:ring-1 focus:ring-blue-500'
              }`}
            />
            {errors.dosage && <span className="text-xs text-rose-500 mt-1 block">{errors.dosage.message}</span>}
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 uppercase tracking-wider mb-1">
              Medicine Type
            </label>
            <select
              {...register("medicine_type")}
              className="w-full rounded-xl border py-2.5 px-3.5 text-sm border-slate-200 dark:border-slate-700 bg-white dark:bg-[#0B1220] text-slate-900 dark:text-white focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition-all shadow-sm"
            >
              <option value="Pill">Pill</option>
              <option value="Capsule">Capsule</option>
              <option value="Syrup">Syrup (Liquid)</option>
              <option value="Injection">Injection</option>
              <option value="Inhaler">Inhaler</option>
              <option value="Drops">Drops</option>
              <option value="Other">Other</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 uppercase tracking-wider mb-1">
              Disease Category
            </label>
            <select
              {...register("disease_category")}
              className="w-full rounded-xl border py-2.5 px-3.5 text-sm border-slate-200 dark:border-slate-700 bg-white dark:bg-[#0B1220] text-slate-900 dark:text-white focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition-all shadow-sm"
            >
              <option value="Cardiovascular">Cardiovascular</option>
              <option value="Diabetes">Diabetes</option>
              <option value="Respiratory">Respiratory</option>
              <option value="Pain Management">Pain Management</option>
              <option value="Antibiotics">Antibiotics</option>
              <option value="Vitamins">Vitamins / Supplements</option>
              <option value="Other">Other</option>
            </select>
          </div>
        </div>

        {/* Row 3: Scheduling Checkboxes */}
        <div className="rounded-xl border border-slate-100 bg-slate-50/50 dark:bg-[#0B1220] p-4 space-y-4">
          <label className="block text-xs font-bold text-slate-600 dark:text-slate-300 uppercase tracking-wider">
            Dosage Schedule Intervals
          </label>
          
          <div className="grid gap-3 sm:grid-cols-5">
            <label className="flex items-center gap-2 rounded-xl bg-white dark:bg-[#1E293B] border border-slate-200 dark:border-slate-700 p-3 text-xs font-semibold text-slate-700 dark:text-slate-300 cursor-pointer select-none">
              <input type="checkbox" {...register("morning")} className="h-4 w-4 rounded border-slate-300 text-blue-600" />
              <span>Morning</span>
            </label>
            <label className="flex items-center gap-2 rounded-xl bg-white dark:bg-[#1E293B] border border-slate-200 dark:border-slate-700 p-3 text-xs font-semibold text-slate-700 dark:text-slate-300 cursor-pointer select-none">
              <input type="checkbox" {...register("afternoon")} className="h-4 w-4 rounded border-slate-300 text-blue-600" />
              <span>Afternoon</span>
            </label>
            <label className="flex items-center gap-2 rounded-xl bg-white dark:bg-[#1E293B] border border-slate-200 dark:border-slate-700 p-3 text-xs font-semibold text-slate-700 dark:text-slate-300 cursor-pointer select-none">
              <input type="checkbox" {...register("night")} className="h-4 w-4 rounded border-slate-300 text-blue-600" />
              <span>Night</span>
            </label>
            
            {/* Food relations */}
            <label className="flex items-center gap-2 rounded-xl bg-white dark:bg-[#1E293B] border border-slate-200 dark:border-slate-700 p-3 text-xs font-semibold text-slate-700 dark:text-slate-300 cursor-pointer select-none">
              <input type="checkbox" {...register("before_food")} className="h-4 w-4 rounded border-slate-300 text-blue-600" />
              <span className="text-rose-600 font-bold">Before Food</span>
            </label>
            <label className="flex items-center gap-2 rounded-xl bg-white dark:bg-[#1E293B] border border-slate-200 dark:border-slate-700 p-3 text-xs font-semibold text-slate-700 dark:text-slate-300 cursor-pointer select-none">
              <input type="checkbox" {...register("after_food")} className="h-4 w-4 rounded border-slate-300 text-blue-600" />
              <span className="text-teal-600 font-bold">After Food</span>
            </label>
          </div>
        </div>

        {/* Row 4: Custom Reminder Times (comma separated) */}
        <div>
          <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 uppercase tracking-wider mb-1 flex items-center gap-1">
            <FiClock className="text-blue-500" /> Custom Reminder Times (comma-separated, 24h format)
          </label>
          <input
            type="text"
            placeholder="e.g. 08:00, 13:00, 20:00"
            {...register("reminder_time", { required: "Reminder times are required" })}
            className={`w-full rounded-xl border py-2.5 px-3.5 text-sm bg-white dark:bg-[#0B1220] text-slate-900 dark:text-white outline-none transition-all shadow-sm ${
              errors.reminder_time ? 'border-rose-300 focus:border-rose-400' : 'border-slate-200 dark:border-slate-700 focus:border-blue-500 focus:ring-1 focus:ring-blue-500'
            }`}
          />
        </div>

        {/* Row 5: Dates and Frequency */}
        <div className="grid gap-4 md:grid-cols-3">
          <div>
            <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 uppercase tracking-wider mb-1 flex items-center gap-1">
              <FiCalendar className="text-teal-500" /> Start Date *
            </label>
            <input
              type="date"
              {...register("start_date", { required: "Start date is required" })}
              className="w-full rounded-xl border py-2.5 px-3.5 text-sm border-slate-200 dark:border-slate-700 bg-white dark:bg-[#0B1220] text-slate-900 dark:text-white focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition-all shadow-sm"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 uppercase tracking-wider mb-1 flex items-center gap-1">
              <FiCalendar className="text-rose-500" /> End Date *
            </label>
            <input
              type="date"
              {...register("end_date", { required: "End date is required" })}
              className="w-full rounded-xl border py-2.5 px-3.5 text-sm border-slate-200 dark:border-slate-700 bg-white dark:bg-[#0B1220] text-slate-900 dark:text-white focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition-all shadow-sm"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 uppercase tracking-wider mb-1">
              Frequency
            </label>
            <select
              {...register("frequency")}
              className="w-full rounded-xl border py-2.5 px-3.5 text-sm border-slate-200 dark:border-slate-700 bg-white dark:bg-[#0B1220] text-slate-900 dark:text-white focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition-all shadow-sm"
            >
              <option value="Daily">Daily</option>
              <option value="Weekly">Weekly</option>
              <option value="Alternating">Alternating Days</option>
            </select>
          </div>
        </div>

        {/* Row 6: Quantities */}
        <div className="grid gap-4 md:grid-cols-2">
          <div>
            <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 uppercase tracking-wider mb-1">
              Total Pill Quantity Pack size *
            </label>
            <input
              type="number"
              placeholder="e.g. 60"
              {...register("quantity", { required: "Pack size quantity is required", min: 1 })}
              className={`w-full rounded-xl border py-2.5 px-3.5 text-sm bg-white dark:bg-[#0B1220] text-slate-900 dark:text-white outline-none transition-all shadow-sm ${
                errors.quantity ? 'border-rose-300 focus:border-rose-400' : 'border-slate-200 dark:border-slate-700 focus:border-blue-500 focus:ring-1 focus:ring-blue-500'
              }`}
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 uppercase tracking-wider mb-1">
              Current Remaining Stock
            </label>
            <input
              type="number"
              placeholder="e.g. 30"
              {...register("remaining_stock")}
              className="w-full rounded-xl border py-2.5 px-3.5 text-sm border-slate-200 dark:border-slate-700 bg-white dark:bg-[#0B1220] text-slate-900 dark:text-white focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition-all shadow-sm"
            />
          </div>
        </div>

        {/* Row 7: Medicine Image and Instructions */}
        <div>
          <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 uppercase tracking-wider mb-1">
            Medicine Card Image URL (Optional)
          </label>
          <input
            type="text"
            placeholder="e.g. https://images.unsplash.com/... or Base64 string"
            {...register("medicine_image")}
            className="w-full rounded-xl border py-2.5 px-3.5 text-sm border-slate-200 dark:border-slate-700 bg-white dark:bg-[#0B1220] text-slate-900 dark:text-white focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition-all shadow-sm"
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 uppercase tracking-wider mb-1">
            Clinical Instructions & Notes
          </label>
          <textarea
            rows="3"
            placeholder="e.g. Take with water. Do not crush tablets."
            {...register("instructions")}
            className="w-full rounded-xl border py-2.5 px-3.5 text-sm border-slate-200 dark:border-slate-700 bg-white dark:bg-[#0B1220] text-slate-900 dark:text-white focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition-all shadow-sm resize-none"
          />
        </div>

        {/* Action buttons */}
        <div className="flex justify-end gap-3 border-t border-slate-50 pt-4">
          <Link
            to="/medicines"
            className="rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-[#111827] px-5 py-2.5 text-sm font-semibold text-slate-600 dark:text-slate-300 transition-colors"
          >
            Cancel
          </Link>
          <button
            type="submit"
            disabled={submitting}
            className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-blue-600 to-teal-500 px-6 py-2.5 text-sm font-bold text-white shadow-md hover:opacity-95 active:scale-[0.98] disabled:opacity-50 transition-all cursor-pointer"
          >
            {submitting ? (
              <div className="h-5 w-5 animate-spin rounded-full border-2 border-white border-t-transparent"></div>
            ) : (
              <>
                <FiEdit /> Save Changes
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default EditMedicine;
