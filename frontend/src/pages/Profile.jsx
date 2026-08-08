import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import { toast } from 'react-hot-toast';
import { 
  FiUser, 
  FiMail, 
  FiPhone, 
  FiMapPin, 
  FiHeart, 
  FiAlertCircle, 
  FiCheck,
  FiActivity,
  FiUsers,
  FiSliders
} from 'react-icons/fi';

const Profile = () => {
  const { user, updateProfileState, logout } = useAuth();
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [caregivers, setCaregivers] = useState([]);
  const [completionPct, setCompletionPct] = useState(0);
  const [base64Image, setBase64Image] = useState('');
  
  // Danger Zone States
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const handleDeleteAccount = async () => {
    setDeleting(true);
    try {
      await api.delete('/profile');
      toast.success("Your PillSync account and all data have been permanently deleted.");
      setShowDeleteModal(false);
      await logout();
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.detail || "Could not delete account. Try again.");
    } finally {
      setDeleting(false);
    }
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setBase64Image(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };
  const { register, handleSubmit, reset, formState: { errors } } = useForm();

  const fetchProfileAndCaregivers = async () => {
    try {
      const [profileRes, caregiversRes] = await Promise.all([
        api.get('/profile'),
        api.get('/profile/caregivers')
      ]);
      reset(profileRes.data);
      setCompletionPct(profileRes.data.completion_percentage || 0);
      setBase64Image(profileRes.data.profile_image || '');
      setCaregivers(caregiversRes.data);
    } catch (err) {
      console.error("Error fetching profile details:", err);
      toast.error(err.response?.data?.detail || "Failed to load profile settings.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfileAndCaregivers();
  }, [reset]);

  const onSubmit = async (data) => {
    setSubmitting(true);
    try {
      // Clean up caregiver_id if empty string
      const payload = {
        ...data,
        profile_image: base64Image,
        caregiver_id: data.caregiver_id ? parseInt(data.caregiver_id, 10) : null,
        age: data.age ? parseInt(data.age, 10) : null
      };

      const res = await api.put('/profile', payload);
      toast.success('Profile updated successfully!');
      updateProfileState(res.data);
      setCompletionPct(res.data.completion_percentage || 0);
      reset(res.data);
    } catch (err) {
      toast.error(err.response?.data?.detail || "Failed to update profile.");
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

  // Get color for completion bar
  const getCompletionColor = (pct) => {
    if (pct < 40) return 'bg-rose-500';
    if (pct < 80) return 'bg-amber-400';
    return 'bg-emerald-500';
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-white">Profile Settings</h1>
        <p className="text-sm text-slate-500 dark:text-slate-300 mt-1">Manage your personal demographics, health profile, and caregiver linkage details.</p>
      </div>

      {/* Completion Percentage Bar */}
      <div className="rounded-2xl border border-[#334155] bg-[#1E293B] p-6 shadow-sm space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <FiActivity className="text-blue-500 text-lg" />
            <span className="font-bold text-white text-sm">Profile Completion Status</span>
          </div>
          <span className="font-extrabold text-slate-700 text-sm">{completionPct}%</span>
        </div>
        <div className="w-full bg-slate-100 h-3.5 rounded-full overflow-hidden">
          <div 
            style={{ width: `${completionPct}%` }}
            className={`h-full progress-bar-fill ${getCompletionColor(completionPct)}`} 
          />
        </div>
        <p className="text-[10px] text-slate-400">
          {completionPct < 100 
            ? "Tip: Complete all profile data fields to help caregivers and doctors manage your prescriptions accurately." 
            : "Perfect! Your profile details are fully complete."}
        </p>
      </div>

      {/* Messages are managed by react-hot-toast. */}

      <form onSubmit={handleSubmit(onSubmit)} className="grid gap-6 md:grid-cols-2">
        {/* Basic Info Card */}
        <div className="rounded-2xl border border-[#334155] bg-[#1E293B] p-6 shadow-sm space-y-4">
          <h3 className="text-lg font-bold text-white border-b border-slate-50 pb-3 flex items-center gap-2">
            <FiUser className="text-blue-500" />
            <span>Personal Information</span>
          </h3>

          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1">Full Name</label>
            <input
              type="text"
              placeholder="Your full name"
              {...register("full_name", { required: "Full name is required" })}
              className={`w-full rounded-xl border py-2.5 px-3.5 text-sm bg-[#0F172A] text-white placeholder-[#94A3B8] outline-none transition-all shadow-sm ${
                errors.full_name ? 'border-rose-300' : 'border-[#334155] focus:border-blue-500 focus:ring-1 focus:ring-blue-500'
              }`}
            />
            {errors.full_name && <span className="text-xs text-rose-500 mt-1 block">{errors.full_name.message}</span>}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1">Age</label>
              <input
                type="number"
                placeholder="Age"
                {...register("age", { min: { value: 0, message: "Invalid age" } })}
                className="w-full rounded-xl border py-2.5 px-3.5 text-sm border-[#334155] bg-[#0F172A] text-white placeholder-[#94A3B8] focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:shadow-[0_0_10px_rgba(59,130,246,0.5)] outline-none transition-all shadow-sm"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1">Gender</label>
              <select
                {...register("gender")}
                className="w-full rounded-xl border py-2.5 px-3.5 text-sm border-[#334155] focus:border-blue-500 focus:shadow-[0_0_10px_rgba(59,130,246,0.5)] outline-none bg-[#0F172A] text-white border-[#334155]"
              >
                <option value="">Select Gender</option>
                <option value="Male">Male</option>
                <option value="Female">Female</option>
                <option value="Other">Other</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1">Height (e.g. 175 cm)</label>
              <input
                type="text"
                placeholder="Height"
                {...register("height")}
                className="w-full rounded-xl border py-2.5 px-3.5 text-sm border-[#334155] bg-[#0F172A] text-white placeholder-[#94A3B8] focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:shadow-[0_0_10px_rgba(59,130,246,0.5)] outline-none transition-all shadow-sm"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1">Weight (e.g. 70 kg)</label>
              <input
                type="text"
                placeholder="Weight"
                {...register("weight")}
                className="w-full rounded-xl border py-2.5 px-3.5 text-sm border-[#334155] bg-[#0F172A] text-white placeholder-[#94A3B8] focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:shadow-[0_0_10px_rgba(59,130,246,0.5)] outline-none transition-all shadow-sm"
              />
            </div>
          </div>
        </div>

        {/* Contact & Caregiver link Card */}
        <div className="rounded-2xl border border-[#334155] bg-[#1E293B] p-6 shadow-sm space-y-4">
          <h3 className="text-lg font-bold text-white border-b border-slate-50 pb-3 flex items-center gap-2">
            <FiPhone className="text-teal-500" />
            <span>Contact & Caregiver Link</span>
          </h3>

          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1">Email Address</label>
            <input
              type="email"
              placeholder="name@example.com"
              {...register("email", { required: "Email address is required" })}
              className="w-full rounded-xl border py-2.5 px-3.5 text-sm border-[#334155] bg-[#0F172A] text-white placeholder-[#94A3B8] focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:shadow-[0_0_10px_rgba(59,130,246,0.5)] outline-none transition-all shadow-sm"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1">Phone Number</label>
              <input
                type="text"
                placeholder="+1 (555) 000-0000"
                {...register("phone")}
                className="w-full rounded-xl border py-2.5 px-3.5 text-sm border-[#334155] bg-[#0F172A] text-white placeholder-[#94A3B8] focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:shadow-[0_0_10px_rgba(59,130,246,0.5)] outline-none transition-all shadow-sm"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1">Emergency Contact</label>
              <input
                type="text"
                placeholder="Name & Number"
                {...register("emergency_contact")}
                className="w-full rounded-xl border py-2.5 px-3.5 text-sm border-[#334155] bg-[#0F172A] text-white placeholder-[#94A3B8] focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:shadow-[0_0_10px_rgba(59,130,246,0.5)] outline-none transition-all shadow-sm"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1 flex items-center gap-1">
              <FiUsers className="text-teal-500" /> Assign Caregiver (Supervisor)
            </label>
            <select
              {...register("caregiver_id")}
              className="w-full rounded-xl border py-2.5 px-3.5 text-sm border-[#334155] focus:border-blue-500 focus:shadow-[0_0_10px_rgba(59,130,246,0.5)] outline-none bg-[#0F172A] text-white border-[#334155]"
            >
              <option value="">No Active Caregiver</option>
              {caregivers.map((cg) => (
                <option key={cg.user_id} value={cg.user_id}>
                  {cg.full_name} ({cg.email})
                </option>
              ))}
            </select>
            <span className="text-[9px] text-slate-400 mt-1 block">
              Assigning a caregiver allows them to view your schedules and log medication edits.
            </span>
          </div>
        </div>

        {/* Medical Info Card */}
        <div className="rounded-2xl border border-[#334155] bg-[#1E293B] p-6 shadow-sm space-y-4 md:col-span-2">
          <h3 className="text-lg font-bold text-white border-b border-slate-50 pb-3 flex items-center gap-2">
            <FiHeart className="text-rose-500" />
            <span>Clinical Information</span>
          </h3>

          <div className="grid gap-4 md:grid-cols-3">
            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1">Blood Group</label>
              <select
                {...register("blood_group")}
                className="w-full rounded-xl border py-2.5 px-3.5 text-sm border-[#334155] focus:border-blue-500 focus:shadow-[0_0_10px_rgba(59,130,246,0.5)] outline-none bg-[#0F172A] text-white border-[#334155]"
              >
                <option value="">Unknown</option>
                <option value="A+">A+</option>
                <option value="A-">A-</option>
                <option value="B+">B+</option>
                <option value="B-">B-</option>
                <option value="AB+">AB+</option>
                <option value="AB-">AB-</option>
                <option value="O+">O+</option>
                <option value="O-">O-</option>
              </select>
            </div>
            
            <div className="md:col-span-2">
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1">Attending Physician (Doctor Name)</label>
              <input
                type="text"
                placeholder="Dr. John Watson"
                {...register("doctor_name")}
                className="w-full rounded-xl border py-2.5 px-3.5 text-sm border-[#334155] bg-[#0F172A] text-white placeholder-[#94A3B8] focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:shadow-[0_0_10px_rgba(59,130,246,0.5)] outline-none transition-all shadow-sm"
              />
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1">Chronic Illnesses / Diseases</label>
              <textarea
                rows="2"
                placeholder="e.g. Hypertension, Type-2 Diabetes, Asthma"
                {...register("diseases")}
                className="w-full rounded-xl border py-2.5 px-3.5 text-sm border-[#334155] bg-[#0F172A] text-white placeholder-[#94A3B8] focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:shadow-[0_0_10px_rgba(59,130,246,0.5)] outline-none transition-all shadow-sm resize-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1">Residential Address</label>
              <textarea
                rows="2"
                placeholder="Street address, City, State, ZIP"
                {...register("address")}
                className="w-full rounded-xl border py-2.5 px-3.5 text-sm border-[#334155] bg-[#0F172A] text-white placeholder-[#94A3B8] focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:shadow-[0_0_10px_rgba(59,130,246,0.5)] outline-none transition-all shadow-sm resize-none"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1">Special Medical Notes</label>
            <textarea
              rows="3"
              placeholder="e.g. Penicillin allergy, take blood thinners at morning intervals, dietary requirements..."
              {...register("medical_notes")}
              className="w-full rounded-xl border py-2.5 px-3.5 text-sm border-[#334155] bg-[#0F172A] text-white placeholder-[#94A3B8] focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:shadow-[0_0_10px_rgba(59,130,246,0.5)] outline-none transition-all shadow-sm resize-none"
            />
          </div>

          <div className="space-y-2">
            <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider">Profile Picture Upload</label>
            <div className="flex items-center gap-4">
              <img
                src={base64Image || `https://ui-avatars.com/api/?name=${encodeURIComponent(user.full_name || user.email || 'User')}&background=0D8ABC&color=fff&size=128&bold=true`}
                alt="Avatar Preview"
                className="h-16 w-16 rounded-2xl bg-[#0F172A] border border-[#334155] object-cover shrink-0"
              />
              <div className="space-y-1.5">
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  className="hidden"
                  id="profile-picture-upload"
                />
                <label
                  htmlFor="profile-picture-upload"
                  className="inline-flex items-center gap-2 rounded-xl bg-[#1E293B] hover:bg-slate-700 px-4 py-2.5 text-xs font-bold text-slate-700 dark:text-slate-300 border border-[#334155] cursor-pointer select-none transition-all"
                >
                  Choose Image File
                </label>
                <p className="text-[10px] text-slate-400">Supports PNG, JPG, or GIF. Max size 2MB.</p>
              </div>
            </div>
          </div>
        </div>

        {/* Submit Actions */}
        <div className="md:col-span-2 flex justify-end">
          <button
            type="submit"
            disabled={submitting}
            className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-blue-600 to-teal-500 px-6 py-3 text-sm font-bold text-white shadow-lg hover:opacity-90 active:scale-[0.99] disabled:opacity-50 transition-all cursor-pointer"
          >
            {submitting ? (
              <div className="h-5 w-5 animate-spin rounded-full border-2 border-white border-t-transparent"></div>
            ) : (
              "Save Changes"
            )}
          </button>
        </div>
      </form>

      {/* Danger Zone: Account Deletion */}
      <div className="rounded-2xl border border-rose-100 bg-rose-50/10 p-6 shadow-sm space-y-4">
        <div className="flex items-center gap-2 border-b border-rose-50 pb-3 text-rose-800">
          <FiAlertCircle className="text-xl" />
          <h3 className="text-lg font-bold">Danger Zone</h3>
        </div>
        <p className="text-xs text-slate-500 leading-relaxed">
          Permanently delete your profile and PillSync account. All of your active treatments, schedules, alerts, and medication logs will be permanently erased. This action is irreversible.
        </p>
        <div className="flex justify-end">
          <button
            type="button"
            onClick={() => setShowDeleteModal(true)}
            className="rounded-xl bg-rose-600 hover:bg-rose-700 text-white px-5 py-2.5 text-xs font-bold transition-all shadow-md cursor-pointer"
          >
            Delete Account
          </button>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm px-4">
          <div className="w-full max-w-md rounded-3xl bg-[#1E293B] p-6 shadow-2xl border border-[#334155] text-center space-y-6">
            <div className="flex flex-col items-center">
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-rose-50 dark:bg-rose-950/25 text-rose-600 text-3xl shadow-inner">
                <FiAlertCircle />
              </div>
              <h2 className="mt-4 text-xl font-bold text-white text-white">Delete Your Account?</h2>
              <p className="text-xs text-slate-500 dark:text-slate-300 mt-2">
                This action is irreversible. All of your clinical treatments and adherence records will be wiped from the PostgreSQL server.
              </p>
            </div>
            <div className="flex gap-3 justify-center">
              <button
                type="button"
                onClick={() => setShowDeleteModal(false)}
                className="rounded-xl border-[#334155] hover:bg-slate-700 text-slate-300 bg-[#1E293B] px-5 py-2.5 text-xs font-bold cursor-pointer transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleDeleteAccount}
                disabled={deleting}
                className="rounded-xl bg-rose-600 hover:bg-rose-700 text-white px-5 py-2.5 text-xs font-bold shadow-md cursor-pointer transition-colors"
              >
                {deleting ? "Deleting..." : "Permanently Delete"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Profile;
