import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { FiMail, FiLock, FiAlertCircle } from 'react-icons/fi';

const Login = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [apiError, setApiError] = useState(null);
  const [loading, setLoading] = useState(false);
  const { register, handleSubmit, formState: { errors } } = useForm();

  const onSubmit = async (data) => {
    setLoading(true);
    setApiError(null);
    try {
      await login(data.email, data.password);
      navigate('/dashboard');
    } catch (err) {
      setApiError(err.response?.data?.detail || "Authentication failed. Try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-xl font-bold text-slate-800">Welcome Back</h3>
        <p className="text-sm text-slate-500">Sign in to manage and track your medication schedules.</p>
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
          <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">
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
              className={`w-full rounded-xl border py-3.5 pl-10 pr-4 text-sm outline-none transition-all ${
                errors.email ? 'border-rose-300 bg-rose-50/20 focus:border-rose-400' : 'border-slate-200 focus:border-blue-500'
              }`}
            />
          </div>
          {errors.email && (
            <span className="mt-1 text-xs text-rose-500 flex items-center gap-1">
              <FiAlertCircle /> {errors.email.message}
            </span>
          )}
        </div>

        {/* Password */}
        <div>
          <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">
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
              className={`w-full rounded-xl border py-3.5 pl-10 pr-4 text-sm outline-none transition-all ${
                errors.password ? 'border-rose-300 bg-rose-50/20 focus:border-rose-400' : 'border-slate-200 focus:border-blue-500'
              }`}
            />
          </div>
          {errors.password && (
            <span className="mt-1 text-xs text-rose-500 flex items-center gap-1">
              <FiAlertCircle /> {errors.password.message}
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
            "Access Platform"
          )}
        </button>
      </form>

      <div className="text-center text-sm text-slate-500">
        New to PillSync?{" "}
        <Link to="/register" className="font-bold text-blue-600 hover:underline">
          Create Account
        </Link>
      </div>
    </div>
  );
};

export default Login;
