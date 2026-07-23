import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import { FiUser, FiMail, FiPhone, FiMapPin, FiHeart, FiAlertCircle, FiCheck } from 'react-icons/fi';

const Profile = () => {
  const { user, updateProfileState } = useAuth();
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const { register, handleSubmit, reset, formState: { errors } } = useForm();

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await api.get('/profile');
        reset(res.data);
      } catch (err) {
        console.error("Error fetching profile details:", err);
        setErrorMsg(err.response?.data?.detail || "Failed to load profile.");
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, [reset]);

  const onSubmit = async (data) => {
    setSubmitting(true);
    setSuccessMsg('');
    setErrorMsg('');
    try {
      const res = await api.put('/profile', data);
      setSuccessMsg('Profile updated successfully!');
      updateProfileState(res.data);
      reset(res.data);
      setTimeout(() => setSuccessMsg(''), 4000);
    } catch (err) {
      setErrorMsg(err.response?.data?.detail || "Failed to update profile.");
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
    <div className="max-w-4xl mx-auto space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-slate-800">Profile Settings</h1>
        <p className="text-sm text-slate-500 mt-1">Manage your personal demographics, health profile, and contact details.</p>
      </div>

      {successMsg && (
        <div className="flex items-center gap-2 rounded-xl bg-emerald-50 p-4 text-sm text-emerald-700 border border-emerald-100">
          <FiCheck className="text-lg shrink-0" />
          <span>{successMsg}</span>
        </div>
      )}

      {errorMsg && (
        <div className="flex items-center gap-2 rounded-xl bg-rose-50 p-4 text-sm text-rose-600 border border-rose-100">
          <FiAlertCircle className="text-lg shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      <form onSubmit={handleSubmit(onSubmit)} className="grid gap-6 md:grid-cols-2">
        {/* Basic Info Card */}
        <div className="rounded-2xl border border-slate-100 bg-white p-6 shadow-sm space-y-4">
          <h3 className="text-lg font-bold text-slate-800 border-b border-slate-50 pb-3 flex items-center gap-2">
            <FiUser className="text-blue-500" />
            <span>Personal Information</span>
          </h3>

          <div>
            <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Full Name</label>
            <input
              type="text"
              placeholder="Your full name"
              {...register("full_name", { required: "Full name is required" })}
              className={`w-full rounded-xl border py-2.5 px-3.5 text-sm outline-none transition-all ${
                errors.full_name ? 'border-rose-300' : 'border-slate-200 focus:border-blue-500'
              }`}
            />
            {errors.full_name && <span className="text-xs text-rose-500 mt-1 block">{errors.full_name.message}</span>}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Age</label>
              <input
                type="number"
                placeholder="Age"
                {...register("age", { valueAsNumber: true, min: { value: 0, message: "Invalid age" } })}
                className="w-full rounded-xl border py-2.5 px-3.5 text-sm border-slate-200 focus:border-blue-500 outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Gender</label>
              <select
                {...register("gender")}
                className="w-full rounded-xl border py-2.5 px-3.5 text-sm border-slate-200 focus:border-blue-500 outline-none bg-white"
              >
                <option value="">Select Gender</option>
                <option value="Male">Male</option>
                <option value="Female">Female</option>
                <option value="Other">Other</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Role / Account Type</label>
            <input
              type="text"
              value={user?.role || "Patient"}
              disabled
              className="w-full rounded-xl border py-2.5 px-3.5 text-sm border-slate-100 bg-slate-50 text-slate-400 cursor-not-allowed font-medium capitalize"
            />
          </div>
        </div>

        {/* Contact Info Card */}
        <div className="rounded-2xl border border-slate-100 bg-white p-6 shadow-sm space-y-4">
          <h3 className="text-lg font-bold text-slate-800 border-b border-slate-50 pb-3 flex items-center gap-2">
            <FiPhone className="text-teal-500" />
            <span>Contact Details</span>
          </h3>

          <div>
            <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Email Address</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400">
                <FiMail />
              </div>
              <input
                type="email"
                placeholder="name@example.com"
                {...register("email", { required: "Email address is required" })}
                className="w-full rounded-xl border py-2.5 pl-10 pr-3.5 text-sm border-slate-200 focus:border-blue-500 outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Phone Number</label>
            <input
              type="text"
              placeholder="+1 (555) 000-0000"
              {...register("phone")}
              className="w-full rounded-xl border py-2.5 px-3.5 text-sm border-slate-200 focus:border-blue-500 outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Emergency Contact Info</label>
            <input
              type="text"
              placeholder="Name & Relation - Phone Number"
              {...register("emergency_contact")}
              className="w-full rounded-xl border py-2.5 px-3.5 text-sm border-slate-200 focus:border-blue-500 outline-none"
            />
          </div>
        </div>

        {/* Medical Info Card */}
        <div className="rounded-2xl border border-slate-100 bg-white p-6 shadow-sm space-y-4 md:col-span-2">
          <h3 className="text-lg font-bold text-slate-800 border-b border-slate-50 pb-3 flex items-center gap-2">
            <FiHeart className="text-rose-500" />
            <span>Medical History & Profile</span>
          </h3>

          <div className="grid gap-4 md:grid-cols-3">
            <div>
              <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Blood Group</label>
              <select
                {...register("blood_group")}
                className="w-full rounded-xl border py-2.5 px-3.5 text-sm border-slate-200 focus:border-blue-500 outline-none bg-white"
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
              <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Profile Image URL / Base64</label>
              <input
                type="text"
                placeholder="https://example.com/avatar.jpg"
                {...register("profile_image")}
                className="w-full rounded-xl border py-2.5 px-3.5 text-sm border-slate-200 focus:border-blue-500 outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Chronic Illnesses / Diseases</label>
            <textarea
              rows="2"
              placeholder="e.g. Hypertension, Type-2 Diabetes, Asthma"
              {...register("diseases")}
              className="w-full rounded-xl border py-2.5 px-3.5 text-sm border-slate-200 focus:border-blue-500 outline-none resize-none"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Residential Address</label>
            <div className="relative">
              <div className="absolute top-3.5 left-3.5 text-slate-400">
                <FiMapPin />
              </div>
              <textarea
                rows="2"
                placeholder="Street address, City, State, ZIP"
                {...register("address")}
                className="w-full rounded-xl border py-2.5 pl-10 pr-3.5 text-sm border-slate-200 focus:border-blue-500 outline-none resize-none"
              />
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
    </div>
  );
};

export default Profile;
