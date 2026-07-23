import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import api from '../services/api';
import { FiChevronLeft, FiPlus, FiAlertCircle, FiClock, FiCalendar, FiPlusSquare } from 'react-icons/fi';

const AddMedicine = () => {
  const navigate = useNavigate();
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  
  // Set default dates
  const today = new Date().toISOString().split('T')[0];
  const nextMonthDate = new Date();
  nextMonthDate.setMonth(nextMonthDate.getMonth() + 1);
  const nextMonth = nextMonthDate.toISOString().split('T')[0];

  const { register, handleSubmit, watch, setValue, formState: { errors } } = useForm({
    defaultValues: {
      morning: false,
      afternoon: false,
      night: false,
      frequency: "Daily",
      start_date: today,
      end_date: nextMonth,
      medicine_type: "Pill",
      reminder_time: "08:00"
    }
  });

  // Watch schedule slots to auto-populate default reminder times
  const watchMorning = watch("morning");
  const watchAfternoon = watch("afternoon");
  const watchNight = watch("night");

  // A helper to auto-generate comma-separated reminder times based on checked boxes
  React.useEffect(() => {
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
      // Pydantic schemas expect quantity & remaining_stock as integers, and boolean schedules
      const payload = {
        ...data,
        quantity: parseInt(data.quantity, 10),
        remaining_stock: parseInt(data.remaining_stock || data.quantity, 10)
      };

      await api.post('/medicines', payload);
      navigate('/medicines');
    } catch (err) {
      console.error("Error adding medicine:", err);
      setErrorMsg(err.response?.data?.detail || "Failed to create medicine. Verify inputs and try again.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Back Button */}
      <Link to="/medicines" className="inline-flex items-center gap-1 text-slate-500 hover:text-slate-800 text-sm font-semibold transition-colors">
        <FiChevronLeft /> Back to Medicines
      </Link>

      <div>
        <h1 className="text-3xl font-bold tracking-tight text-slate-800">Add New Medicine</h1>
        <p className="text-sm text-slate-500 mt-1">Register a medication treatment card and set up reminder slots.</p>
      </div>

      {errorMsg && (
        <div className="flex items-center gap-2 rounded-xl bg-rose-50 p-4 text-sm text-rose-600 border border-rose-100">
          <FiAlertCircle className="text-lg shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      <form onSubmit={handleSubmit(onSubmit)} className="bg-white border border-slate-100 rounded-2xl p-6 shadow-sm space-y-6">
        {/* Row 1: Drug Name & Disease Category */}
        <div className="grid gap-4 md:grid-cols-2">
          <div>
            <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">
              Medicine Name *
            </label>
            <input
              type="text"
              placeholder="e.g. Aspirin, Metformin"
              {...register("name", { required: "Medicine name is required" })}
              className={`w-full rounded-xl border py-2.5 px-3.5 text-sm outline-none transition-all ${
                errors.name ? 'border-rose-300 focus:border-rose-400' : 'border-slate-200 focus:border-blue-500'
              }`}
            />
            {errors.name && <span className="text-xs text-rose-500 mt-1 block">{errors.name.message}</span>}
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">
              Disease Category
            </label>
            <select
              {...register("disease_category")}
              className="w-full rounded-xl border py-2.5 px-3.5 text-sm border-slate-200 focus:border-blue-500 outline-none bg-white"
            >
              <option value="">Choose a category...</option>
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

        {/* Row 2: Dosage & Type */}
        <div className="grid gap-4 md:grid-cols-2">
          <div>
            <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">
              Dosage *
            </label>
            <input
              type="text"
              placeholder="e.g. 500mg, 1 Tablet, 5ml"
              {...register("dosage", { required: "Dosage is required" })}
              className={`w-full rounded-xl border py-2.5 px-3.5 text-sm outline-none transition-all ${
                errors.dosage ? 'border-rose-300 focus:border-rose-400' : 'border-slate-200 focus:border-blue-500'
              }`}
            />
            {errors.dosage && <span className="text-xs text-rose-500 mt-1 block">{errors.dosage.message}</span>}
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">
              Medicine Type
            </label>
            <select
              {...register("medicine_type")}
              className="w-full rounded-xl border py-2.5 px-3.5 text-sm border-slate-200 focus:border-blue-500 bg-white outline-none"
            >
              <option value="Pill">Pill</option>
              <option value="Capsule">Capsule</option>
              <option value="Syrup">Syrup</option>
              <option value="Injection">Injection</option>
              <option value="Inhaler">Inhaler</option>
              <option value="Topical (Cream)">Topical (Cream)</option>
              <option value="Other">Other</option>
            </select>
          </div>
        </div>

        {/* Row 3: Scheduling Slots & Frequency */}
        <div className="grid gap-4 md:grid-cols-2">
          <div>
            <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">
              Dosage Schedule Slots (Auto-adds reminder times)
            </label>
            <div className="flex gap-4">
              <label className="flex items-center gap-1.5 text-sm text-slate-700 font-medium cursor-pointer">
                <input type="checkbox" {...register("morning")} className="rounded text-blue-600 focus:ring-blue-500 h-4 w-4" />
                <span>Morning</span>
              </label>
              <label className="flex items-center gap-1.5 text-sm text-slate-700 font-medium cursor-pointer">
                <input type="checkbox" {...register("afternoon")} className="rounded text-blue-600 focus:ring-blue-500 h-4 w-4" />
                <span>Afternoon</span>
              </label>
              <label className="flex items-center gap-1.5 text-sm text-slate-700 font-medium cursor-pointer">
                <input type="checkbox" {...register("night")} className="rounded text-blue-600 focus:ring-blue-500 h-4 w-4" />
                <span>Night</span>
              </label>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">
              Frequency *
            </label>
            <select
              {...register("frequency", { required: "Frequency is required" })}
              className="w-full rounded-xl border py-2.5 px-3.5 text-sm border-slate-200 focus:border-blue-500 bg-white outline-none"
            >
              <option value="Daily">Daily</option>
              <option value="Weekly">Weekly</option>
              <option value="Alternating Days">Alternating Days</option>
              <option value="Every 12 Hours">Every 12 Hours</option>
              <option value="Every 8 Hours">Every 8 Hours</option>
            </select>
          </div>
        </div>

        {/* Custom Reminder Times input */}
        <div>
          <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">
            Reminder Times * (Comma-separated times in 24hr format)
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 flex items-center pl-3.5 text-slate-400">
              <FiClock />
            </div>
            <input
              type="text"
              placeholder="e.g., 08:00, 13:00, 20:00"
              {...register("reminder_time", { 
                required: "Reminder time is required",
                pattern: {
                  value: /^([01]?[0-9]|2[0-3]):[0-5][0-9](\s*,\s*([01]?[0-9]|2[0-3]):[0-5][0-9])*$/,
                  message: "Format must be comma-separated 24hr times (e.g. 08:00, 13:00)"
                }
              })}
              className={`w-full rounded-xl border py-2.5 pl-10 pr-4 text-sm outline-none transition-all ${
                errors.reminder_time ? 'border-rose-300 focus:border-rose-400' : 'border-slate-200 focus:border-blue-500'
              }`}
            />
          </div>
          <span className="text-[10px] text-slate-400 mt-1 block">
            E.g. "08:00" for Morning, or "08:00, 20:00" for twice daily.
          </span>
          {errors.reminder_time && <span className="text-xs text-rose-500 mt-1 block">{errors.reminder_time.message}</span>}
        </div>

        {/* Date Ranges */}
        <div className="grid gap-4 md:grid-cols-2">
          <div>
            <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">
              Start Date *
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 flex items-center pl-3.5 text-slate-400 pointer-events-none">
                <FiCalendar />
              </div>
              <input
                type="date"
                {...register("start_date", { required: "Start date is required" })}
                className="w-full rounded-xl border py-2.5 pl-10 pr-3.5 text-sm border-slate-200 focus:border-blue-500 outline-none"
              />
            </div>
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">
              End Date *
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 flex items-center pl-3.5 text-slate-400 pointer-events-none">
                <FiCalendar />
              </div>
              <input
                type="date"
                {...register("end_date", { required: "End date is required" })}
                className="w-full rounded-xl border py-2.5 pl-10 pr-3.5 text-sm border-slate-200 focus:border-blue-500 outline-none"
              />
            </div>
          </div>
        </div>

        {/* Inventory Stock & Base Stock */}
        <div className="grid gap-4 md:grid-cols-2">
          <div>
            <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">
              Initial Quantity (Total Stock) *
            </label>
            <input
              type="number"
              placeholder="e.g. 30, 60"
              {...register("quantity", { required: "Total quantity is required", min: { value: 1, message: "Must be at least 1" } })}
              className={`w-full rounded-xl border py-2.5 px-3.5 text-sm outline-none transition-all ${
                errors.quantity ? 'border-rose-300 focus:border-rose-400' : 'border-slate-200 focus:border-blue-500'
              }`}
            />
            {errors.quantity && <span className="text-xs text-rose-500 mt-1 block">{errors.quantity.message}</span>}
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">
              Remaining Stock * (Default same as total)
            </label>
            <input
              type="number"
              placeholder="e.g. 30"
              {...register("remaining_stock", { required: "Remaining stock is required" })}
              className="w-full rounded-xl border py-2.5 px-3.5 text-sm border-slate-200 focus:border-blue-500 outline-none"
            />
          </div>
        </div>

        {/* Special Instructions & Medicine Image */}
        <div className="grid gap-4">
          <div>
            <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">
              Medication Image URL (Optional)
            </label>
            <input
              type="text"
              placeholder="https://example.com/pill.jpg"
              {...register("medicine_image")}
              className="w-full rounded-xl border py-2.5 px-3.5 text-sm border-slate-200 focus:border-blue-500 outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">
              Special Instructions
            </label>
            <textarea
              rows="3"
              placeholder="e.g. Take after meals, swallow whole, do not mix with alcohol."
              {...register("instructions")}
              className="w-full rounded-xl border py-2.5 px-3.5 text-sm border-slate-200 focus:border-blue-500 outline-none resize-none"
            />
          </div>
        </div>

        {/* Form Submission */}
        <div className="flex justify-end gap-3 pt-4 border-t border-slate-50">
          <Link
            to="/medicines"
            className="rounded-xl border border-slate-200 px-5 py-3 text-sm font-semibold text-slate-600 hover:bg-slate-50 transition-colors"
          >
            Cancel
          </Link>
          <button
            type="submit"
            disabled={submitting}
            className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-blue-600 to-teal-500 px-6 py-3 text-sm font-bold text-white shadow-lg shadow-blue-500/10 hover:opacity-90 active:scale-[0.99] disabled:opacity-50 transition-all cursor-pointer"
          >
            {submitting ? (
              <div className="h-5 w-5 animate-spin rounded-full border-2 border-white border-t-transparent"></div>
            ) : (
              <>
                <FiPlusSquare /> Save Medicine
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default AddMedicine;
