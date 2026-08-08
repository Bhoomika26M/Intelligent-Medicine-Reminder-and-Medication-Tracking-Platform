import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { FiMail, FiLock, FiAlertCircle, FiEye, FiEyeOff } from 'react-icons/fi';
import { FcGoogle } from 'react-icons/fc';
import { toast } from 'react-hot-toast';
import { motion } from 'framer-motion';

const Login = () => {
  const { login, googleLogin } = useAuth();
  const navigate = useNavigate();
  const [apiError, setApiError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  
  const { register, handleSubmit, formState: { errors } } = useForm({
    defaultValues: {
      email: "",
      password: ""
    }
  });

  const onSubmit = async (data) => {
    setLoading(true);
    setApiError(null);
    try {
      // Remember me handling (mocked via localStorage for showcase)
      if (rememberMe) {
        localStorage.setItem('pillsync_remembered_email', data.email);
      } else {
        localStorage.removeItem('pillsync_remembered_email');
      }

      await login(data.email, data.password);
      toast.success("Welcome back to PillSync!");
      navigate('/dashboard');
    } catch (err) {
      const msg = err.response?.data?.detail || "Authentication failed. Try again.";
      setApiError(msg);
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setLoading(true);
    setApiError(null);
    try {
      await googleLogin('policemounika@google.com', 'Police Mounika');
      toast.success("Successfully logged in with Google!");
      navigate('/dashboard');
    } catch (err) {
      const msg = err.response?.data?.detail || "Google authentication failed. Try again.";
      setApiError(msg);
      toast.error(msg);
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
      <div className="space-y-1">
        <h3 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">Sign In</h3>
        <p className="text-xs text-slate-400 font-medium">Access your intelligent medicine schedules & trackers.</p>
      </div>

      {apiError && (
        <div className="flex items-center gap-2 rounded-xl bg-rose-50 p-3.5 text-xs text-rose-600 border border-rose-100 animate-shake">
          <FiAlertCircle className="text-base shrink-0" />
          <span>{apiError}</span>
        </div>
      )}

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        {/* Email Address */}
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
              className={`w-full rounded-xl border py-3 pl-11 pr-4 text-sm outline-none transition-all duration-200 bg-white/50 ${
                errors.email ? 'border-rose-300 bg-rose-50/20 focus:border-rose-400' : 'border-slate-200 focus:border-blue-500 focus:bg-white'
              }`}
            />
          </div>
          {errors.email && (
            <span className="mt-1.5 text-[11px] text-rose-500 flex items-center gap-1">
              <FiAlertCircle /> {errors.email.message}
            </span>
          )}
        </div>

        {/* Password */}
        <div>
          <label className="block text-xs font-bold text-slate-600 dark:text-slate-300 uppercase tracking-wider mb-1.5">
            Password
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 flex items-center pl-3.5 text-slate-400 pointer-events-none">
              <FiLock className="text-base" />
            </div>
            <input
              type={showPassword ? "text" : "password"}
              placeholder="••••••••"
              {...register("password", { 
                required: "Password is required",
                minLength: {
                  value: 6,
                  message: "Password must be at least 6 characters"
                }
              })}
              className={`w-full rounded-xl border py-3 pl-11 pr-10 text-sm outline-none transition-all duration-200 bg-white/50 ${
                errors.password ? 'border-rose-300 bg-rose-50/20 focus:border-rose-400' : 'border-slate-200 focus:border-blue-500 focus:bg-white'
              }`}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute inset-y-0 right-0 flex items-center pr-3.5 text-slate-400 hover:text-slate-600 focus:outline-none cursor-pointer"
            >
              {showPassword ? <FiEyeOff className="text-base" /> : <FiEye className="text-base" />}
            </button>
          </div>
          {errors.password && (
            <span className="mt-1.5 text-[11px] text-rose-500 flex items-center gap-1">
              <FiAlertCircle /> {errors.password.message}
            </span>
          )}
        </div>

        {/* Remember Me & Forgot Password Links */}
        <div className="flex items-center justify-between text-xs pt-1 select-none">
          <label className="flex items-center gap-2 text-slate-500 cursor-pointer font-medium">
            <input
              type="checkbox"
              checked={rememberMe}
              onChange={(e) => setRememberMe(e.target.checked)}
              className="h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500 cursor-pointer"
            />
            <span>Remember Me</span>
          </label>
          <Link to="/forgot-password" className="font-bold text-blue-600 hover:underline">
            Forgot Password?
          </Link>
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={loading}
          className="flex w-full items-center justify-center rounded-xl bg-gradient-to-r from-blue-600 to-teal-500 py-3.5 text-sm font-bold text-white shadow-lg shadow-blue-500/10 hover:opacity-90 active:scale-[0.99] disabled:opacity-50 transition-all cursor-pointer mt-2"
        >
          {loading ? (
            <div className="h-5 w-5 animate-spin rounded-full border-2 border-white border-t-transparent"></div>
          ) : (
            "Access Platform"
          )}
        </button>
      </form>

      {/* Google Login Divider & Button */}
      <div className="space-y-4">
        <div className="relative flex py-1 items-center">
          <div className="flex-grow border-t border-slate-100"></div>
          <span className="flex-shrink mx-3 text-slate-400 text-[10px] font-bold uppercase tracking-widest">Or Continue With</span>
          <div className="flex-grow border-t border-slate-100"></div>
        </div>

        <button
          type="button"
          onClick={handleGoogleLogin}
          disabled={loading}
          className="flex w-full items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white py-3 text-sm font-semibold text-slate-700 hover:bg-slate-50 active:scale-[0.99] disabled:opacity-50 transition-all cursor-pointer"
        >
          {loading ? (
            <div className="h-5 w-5 animate-spin rounded-full border-2 border-blue-500 border-t-transparent"></div>
          ) : (
            <>
              <FcGoogle className="text-xl" />
              <span>Sign In with Google</span>
            </>
          )}
        </button>
      </div>

      <div className="text-center text-xs text-slate-400 font-semibold select-none">
        New to PillSync?{" "}
        <Link to="/register" className="font-bold text-blue-600 hover:underline">
          Create Account
        </Link>
      </div>
    </motion.div>
  );
};

export default Login;
