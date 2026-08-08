import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import api from '../services/api';
import { FiMail, FiLock, FiKey, FiAlertCircle, FiCheck } from 'react-icons/fi';

const ResetPassword = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const defaultEmail = searchParams.get('email') || '';
  
  const [apiError, setApiError] = useState(null);
  const [successMsg, setSuccessMsg] = useState(null);
  const [loading, setLoading] = useState(false);
  const { register, handleSubmit, watch, formState: { errors } } = useForm({
    defaultValues: {
      email: defaultEmail,
      code: '',
      password: '',
      confirm_password: ''
    }
  });

  const watchPassword = watch("password", "");

  const onSubmit = async (data) => {
    setLoading(true);
    setApiError(null);
    setSuccessMsg(null);
    try {
      await api.post('/auth/reset-password', {
        email: data.email,
        code: data.code,
        password: data.password
      });
      setSuccessMsg("Password updated successfully! You can now log in.");
      setTimeout(() => {
        navigate('/login');
      }, 3000);
    } catch (err) {
      setApiError(err.response?.data?.detail || "Could not reset password. Please check your verification code.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-xl font-bold text-slate-900 dark:text-white">Choose New Password</h3>
        <p className="text-sm text-slate-500">Provide the code you received and key in your new credentials.</p>
      </div>

      {apiError && (
        <div className="flex items-center gap-2 rounded-xl bg-rose-50 p-3.5 text-sm text-rose-600 border border-rose-100">
          <FiAlertCircle className="text-lg shrink-0" />
          <span>{apiError}</span>
        </div>
      )}

      {successMsg && (
        <div className="flex items-center gap-2 rounded-xl bg-emerald-50 p-3.5 text-sm text-emerald-700 border border-emerald-100">
          <FiCheck className="text-lg shrink-0" />
          <span>{successMsg}</span>
        </div>
      )}

      {!successMsg && (
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
                  errors.email ? 'border-rose-300 bg-rose-50/20 dark:bg-rose-950/20' : 'border-slate-200 dark:border-slate-700 focus:border-blue-500 focus:ring-1 focus:ring-blue-500'
                }`}
              />
            </div>
            {errors.email && (
              <span className="mt-1 text-xs text-rose-500 flex items-center gap-1">
                <FiAlertCircle /> {errors.email.message}
              </span>
            )}
          </div>

          {/* Reset Code */}
          <div>
            <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 uppercase tracking-wider mb-1">
              Verification Code
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400">
                <FiKey className="text-lg" />
              </div>
              <input
                type="text"
                placeholder="Enter 6-digit code"
                {...register("code", { required: "Reset verification code is required" })}
                className={`w-full rounded-xl border py-3 pl-10 pr-4 text-sm bg-white dark:bg-[#0B1220] text-slate-900 dark:text-white outline-none transition-all shadow-sm ${
                  errors.code ? 'border-rose-300 bg-rose-50/20 dark:bg-rose-950/20' : 'border-slate-200 dark:border-slate-700 focus:border-blue-500 focus:ring-1 focus:ring-blue-500'
                }`}
              />
            </div>
            {errors.code && (
              <span className="mt-1 text-xs text-rose-500 flex items-center gap-1">
                <FiAlertCircle /> {errors.code.message}
              </span>
            )}
          </div>

          {/* New Password */}
          <div>
            <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 uppercase tracking-wider mb-1">
              New Password
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
                  errors.password ? 'border-rose-300 bg-rose-50/20 dark:bg-rose-950/20' : 'border-slate-200 dark:border-slate-700 focus:border-blue-500 focus:ring-1 focus:ring-blue-500'
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
                {...register("confirm_password", { 
                  required: "Confirm password is required",
                  validate: (val) => val === watchPassword || "Passwords do not match"
                })}
                className={`w-full rounded-xl border py-3 pl-10 pr-4 text-sm bg-white dark:bg-[#0B1220] text-slate-900 dark:text-white outline-none transition-all shadow-sm ${
                  errors.confirm_password ? 'border-rose-300 bg-rose-50/20 dark:bg-rose-950/20' : 'border-slate-200 dark:border-slate-700 focus:border-blue-500 focus:ring-1 focus:ring-blue-500'
                }`}
              />
            </div>
            {errors.confirm_password && (
              <span className="mt-1 text-xs text-rose-500 flex items-center gap-1">
                <FiAlertCircle /> {errors.confirm_password.message}
              </span>
            )}
          </div>

          <button
            type="submit"
            disabled={loading}
            className="flex w-full items-center justify-center rounded-xl bg-gradient-to-r from-blue-600 to-teal-500 py-3.5 text-sm font-bold text-white shadow-lg hover:opacity-90 active:scale-[0.99] disabled:opacity-50 transition-all cursor-pointer"
          >
            {loading ? (
              <div className="h-5 w-5 animate-spin rounded-full border-2 border-white border-t-transparent"></div>
            ) : (
              "Save New Password"
            )}
          </button>
        </form>
      )}

      <div className="text-center text-sm text-slate-500">
        Back to Login?{" "}
        <Link to="/login" className="font-bold text-blue-600 hover:underline">
          Sign In
        </Link>
      </div>
    </div>
  );
};

export default ResetPassword;
