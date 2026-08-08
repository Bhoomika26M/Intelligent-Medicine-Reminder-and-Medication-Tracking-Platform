import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { FiMail, FiLock, FiAlertCircle, FiUsers } from 'react-icons/fi';
import { toast } from 'react-hot-toast';
import { motion } from 'framer-motion';

const Register = () => {
  const { register: signup } = useAuth();
  const navigate = useNavigate();
  const [apiError, setApiError] = useState(null);
  const [loading, setLoading] = useState(false);
  const { register, handleSubmit, watch, formState: { errors } } = useForm();

  const watchPassword = watch("password", "");

  const onSubmit = async (data) => {
    setLoading(true);
    setApiError(null);
    try {
      await signup(data.email, data.password, data.role);
      toast.success("Account created successfully! Welcome to PillSync.");
      navigate('/dashboard');
    } catch (err) {
      const detail = err.response?.data?.detail;
      let errorMsgText = "Registration Failed. Try Again.";
      if (Array.isArray(detail)) {
        // Parse Pydantic validation array error messages
        errorMsgText = detail.map(e => {
          const field = e.loc?.[e.loc.length - 1] || 'Field';
          return `${field.charAt(0).toUpperCase() + field.slice(1)}: ${e.msg}`;
        }).join(', ');
      } else if (typeof detail === 'string') {
        errorMsgText = detail;
      }
      setApiError(errorMsgText);
      toast.error(errorMsgText);
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="space-y-6"
    >
      <div>
        <h3 className="text-xl font-bold text-slate-900 dark:text-white">Create Account</h3>
        <p className="text-sm text-slate-500">Sign up to schedule and track your daily medical regimens.</p>
      </div>

      {apiError && (
        <div className="flex items-center gap-2 rounded-xl bg-rose-50 p-3.5 text-sm text-rose-600 border border-rose-100">
          <FiAlertCircle className="text-lg shrink-0" />
          <span>{apiError}</span>
        </div>
      )}

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        {/* Email Address */}
        <div>
          <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 uppercase tracking-wider mb-1">
            Email Address
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400">
              <FiMail className="text-lg" />
            </div>
            <input
              type="email"
              placeholder="name@example.com"
              {...register("email", { 
                required: "Email address is required",
                pattern: {
                  value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                  message: "Invalid email address format"
                }
              })}
              className={`w-full rounded-xl border py-3 pl-10 pr-4 text-sm bg-white dark:bg-[#0B1220] text-slate-900 dark:text-white outline-none transition-all shadow-sm ${
                errors.email ? 'border-rose-300 bg-rose-50/20 dark:bg-rose-950/20 focus:border-rose-400' : 'border-slate-200 dark:border-slate-700 focus:border-blue-500 focus:ring-1 focus:ring-blue-500'
              }`}
            />
          </div>
          {errors.email && (
            <span className="mt-1 text-xs text-rose-500 flex items-center gap-1">
              <FiAlertCircle /> {errors.email.message}
            </span>
          )}
        </div>

        {/* User Role Selection */}
        <div>
          <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 uppercase tracking-wider mb-1">
            Account Type (Role)
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400">
              <FiUsers className="text-lg" />
            </div>
            <select
              {...register("role", { required: "Please select an account type" })}
              className={`w-full appearance-none rounded-xl border py-3 pl-10 pr-4 text-sm bg-white dark:bg-[#0B1220] text-slate-900 dark:text-white outline-none transition-all shadow-sm ${
                errors.role ? 'border-rose-300 focus:border-rose-400' : 'border-slate-200 dark:border-slate-700 focus:border-blue-500 focus:ring-1 focus:ring-blue-500'
              }`}
            >
              <option value="Patient">Patient (Manage own medicines)</option>
              <option value="Caregiver">Caregiver (Supervise others)</option>
              <option value="Admin">Admin (Full Control)</option>
            </select>
          </div>
          {errors.role && (
            <span className="mt-1 text-xs text-rose-500 flex items-center gap-1">
              <FiAlertCircle /> {errors.role.message}
            </span>
          )}
        </div>

        {/* Password */}
        <div>
          <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 uppercase tracking-wider mb-1">
            Password
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400">
              <FiLock className="text-lg" />
            </div>
            <input
              type="password"
              placeholder="••••••••"
              {...register("password", { 
                required: "Password is required",
                minLength: {
                  value: 6,
                  message: "Password must be at least 6 characters"
                }
              })}
              className={`w-full rounded-xl border py-3 pl-10 pr-4 text-sm bg-white dark:bg-[#0B1220] text-slate-900 dark:text-white outline-none transition-all shadow-sm ${
                errors.password ? 'border-rose-300 bg-rose-50/20 dark:bg-rose-950/20 focus:border-rose-400' : 'border-slate-200 dark:border-slate-700 focus:border-blue-500 focus:ring-1 focus:ring-blue-500'
              }`}
            />
          </div>
          {errors.password && (
            <span className="mt-1 text-xs text-rose-500 flex items-center gap-1">
              <FiAlertCircle /> {errors.password.message}
            </span>
          )}
        </div>

        {/* Confirm Password */}
        <div>
          <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 uppercase tracking-wider mb-1">
            Confirm Password
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400">
              <FiLock className="text-lg" />
            </div>
            <input
              type="password"
              placeholder="••••••••"
              {...register("confirmPassword", { 
                required: "Confirm password is required",
                validate: value => value === watchPassword || "Passwords do not match"
              })}
              className={`w-full rounded-xl border py-3 pl-10 pr-4 text-sm bg-white dark:bg-[#0B1220] text-slate-900 dark:text-white outline-none transition-all shadow-sm ${
                errors.confirmPassword ? 'border-rose-300 bg-rose-50/20 dark:bg-rose-950/20 focus:border-rose-400' : 'border-slate-200 dark:border-slate-700 focus:border-blue-500 focus:ring-1 focus:ring-blue-500'
              }`}
            />
          </div>
          {errors.confirmPassword && (
            <span className="mt-1 text-xs text-rose-500 flex items-center gap-1">
              <FiAlertCircle /> {errors.confirmPassword.message}
            </span>
          )}
        </div>

        {/* Submit */}
        <button
          type="submit"
          disabled={loading}
          className="flex w-full items-center justify-center rounded-xl bg-gradient-to-r from-blue-600 to-teal-500 py-3.5 text-sm font-bold text-white shadow-lg shadow-blue-500/20 hover:opacity-90 active:scale-[0.99] disabled:opacity-50 transition-all cursor-pointer"
        >
          {loading ? (
            <div className="h-5 w-5 animate-spin rounded-full border-2 border-white border-t-transparent"></div>
          ) : (
            "Create Account"
          )}
        </button>
      </form>

      <div className="text-center text-sm text-slate-500">
        Already have an account?{" "}
        <Link to="/login" className="font-bold text-blue-600 hover:underline">
          Sign In
        </Link>
      </div>
    </motion.div>
  );
};

export default Register;
