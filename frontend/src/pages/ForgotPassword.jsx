import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Link, useNavigate } from 'react-router-dom';
import api from '../services/api';
import { FiMail, FiAlertCircle, FiCheck, FiArrowRight, FiInfo } from 'react-icons/fi';

const ForgotPassword = () => {
  const navigate = useNavigate();
  const [apiError, setApiError] = useState(null);
  const [successMsg, setSuccessMsg] = useState(null);
  const [submittedEmail, setSubmittedEmail] = useState('');
  const [simulatedCode, setSimulatedCode] = useState(null);
  const [loading, setLoading] = useState(false);
  const { register, handleSubmit, formState: { errors } } = useForm();

  const onSubmit = async (data) => {
    setLoading(true);
    setApiError(null);
    setSuccessMsg(null);
    setSimulatedCode(null);
    try {
      const res = await api.post('/auth/forgot-password', { email: data.email });
      setSubmittedEmail(data.email);
      setSuccessMsg("Reset verification code has been generated.");
      if (res.data.simulated_code) {
        setSimulatedCode(res.data.simulated_code);
      }
    } catch (err) {
      setApiError(err.response?.data?.detail || "We couldn't locate an account with that email.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="space-y-1">
        <h3 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">Reset Password</h3>
        <p className="text-xs text-slate-400 font-medium">Provide your registered email to receive a simulation code.</p>
      </div>

      {apiError && (
        <div className="flex items-center gap-2 rounded-xl bg-rose-50 p-3.5 text-xs text-rose-600 border border-rose-100">
          <FiAlertCircle className="text-base shrink-0" />
          <span>{apiError}</span>
        </div>
      )}

      {successMsg && (
        <div className="space-y-4 animate-fadeIn">
          <div className="flex items-center gap-2 rounded-xl bg-emerald-50 p-3.5 text-xs text-emerald-700 border border-emerald-100 font-medium">
            <FiCheck className="text-base shrink-0" />
            <span>{successMsg}</span>
          </div>

          {simulatedCode && (
            <div className="rounded-xl border border-blue-100 bg-blue-50/50 p-4 space-y-2.5">
              <div className="flex items-center gap-2 text-xs font-bold text-blue-800">
                <FiInfo />
                <span>Simulated Email Notification Alert</span>
              </div>
              <p className="text-xs text-blue-700 leading-relaxed font-medium">
                Since this is a simulated sandbox environment, the system has generated your password reset code below:
              </p>
              <div className="bg-white border border-blue-200 rounded-xl p-3 flex justify-between items-center">
                <span className="font-mono text-lg font-black text-blue-600 tracking-widest">{simulatedCode}</span>
                <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Copy Code</span>
              </div>
              <Link 
                to={`/reset-password?email=${encodeURIComponent(submittedEmail)}`}
                className="inline-flex items-center gap-1.5 text-xs font-bold text-blue-600 hover:underline pt-1"
              >
                Go to Reset Form <FiArrowRight />
              </Link>
            </div>
          )}
        </div>
      )}

      {!successMsg && (
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-600 dark:text-slate-300 uppercase tracking-wider mb-1.5">
              Email Address
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 flex items-center pl-3.5 text-slate-400 pointer-events-none">
                <FiMail className="text-base" />
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
                className={`w-full rounded-xl border py-3.5 pl-11 pr-4 text-sm outline-none transition-all duration-200 bg-white/50 ${
                  errors.email ? 'border-rose-300 bg-rose-50/20 focus:border-rose-400' : 'border-slate-200 focus:border-blue-500 focus:bg-white'
                }`}
              />
            </div>
            {errors.email && (
              <span className="mt-1.5 text-xs text-rose-500 flex items-center gap-1">
                <FiAlertCircle /> {errors.email.message}
              </span>
            )}
          </div>

          <button
            type="submit"
            disabled={loading}
            className="flex w-full items-center justify-center rounded-xl bg-gradient-to-r from-blue-600 to-teal-500 py-3.5 text-sm font-bold text-white shadow-lg hover:opacity-90 active:scale-[0.99] disabled:opacity-50 transition-all cursor-pointer mt-2"
          >
            {loading ? (
              <div className="h-5 w-5 animate-spin rounded-full border-2 border-white border-t-transparent"></div>
            ) : (
              "Generate Reset Code"
            )}
          </button>
        </form>
      )}

      <div className="text-center text-xs text-slate-400 font-semibold select-none">
        Remember your details?{" "}
        <Link to="/login" className="font-bold text-blue-600 hover:underline">
          Sign In
        </Link>
      </div>
    </div>
  );
};

export default ForgotPassword;
