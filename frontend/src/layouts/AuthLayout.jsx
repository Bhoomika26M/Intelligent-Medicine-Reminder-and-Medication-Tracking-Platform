import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { GiPill } from 'react-icons/gi';
import { FiHeart, FiClock, FiActivity } from 'react-icons/fi';

const AuthLayout = () => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-white">
        <div className="h-12 w-12 animate-spin rounded-full border-4 border-sky-400 border-t-transparent"></div>
      </div>
    );
  }

  // Redirect to dashboard if already authenticated
  if (user) {
    return <Navigate to="/dashboard" replace />;
  }

  return (
    <div className="flex min-h-screen bg-white dark:bg-[#0B1220] overflow-hidden text-slate-900 dark:text-white transition-colors duration-300">
      {/* ── LEFT SIDE: Premium Gradient Healthcare Hero (Hidden on Mobile/Tablet) ── */}
      <div className="hidden lg:flex lg:w-1/2 relative bg-gradient-to-br from-blue-950 via-cyan-900 to-teal-950 overflow-hidden items-center justify-center p-12 border-r border-slate-800 shadow-[inset_-10px_0_30px_rgba(0,0,0,0.2)]">
        
        {/* Subtle grid lines background */}
        <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#3b82f6_1.5px,transparent_1.5px)] [background-size:30px_30px] pointer-events-none"></div>
        
        {/* Floating background glowing circles (Sky Blue & Medical Green) */}
        <div className="absolute -top-32 -left-32 w-96 h-96 rounded-full bg-blue-500/30 blur-3xl animate-pulse"></div>
        <div className="absolute -bottom-32 -right-32 w-96 h-96 rounded-full bg-teal-500/20 blur-3xl animate-pulse delay-1000"></div>

        {/* Floating Capsules Animation */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          <div className="absolute top-[20%] left-[15%] text-cyan-400/40 text-4xl animate-float drop-shadow-[0_0_10px_rgba(34,211,238,0.3)]" style={{ animationDelay: '0s', animationDuration: '8s' }}><GiPill /></div>
          <div className="absolute bottom-[25%] left-[25%] text-teal-400/40 text-3xl animate-float drop-shadow-[0_0_10px_rgba(45,212,191,0.3)]" style={{ animationDelay: '2.5s', animationDuration: '10s' }}><GiPill /></div>
          <div className="absolute top-[30%] right-[20%] text-blue-400/30 text-5xl animate-float drop-shadow-[0_0_10px_rgba(96,165,250,0.3)]" style={{ animationDelay: '1.5s', animationDuration: '9s' }}><GiPill /></div>
          <div className="absolute bottom-[15%] right-[15%] text-emerald-400/40 text-4xl animate-float drop-shadow-[0_0_10px_rgba(52,211,153,0.3)]" style={{ animationDelay: '4s', animationDuration: '11s' }}><GiPill /></div>
        </div>

        {/* Healthcare Illustration Vector Container */}
        <div className="z-10 w-full max-w-lg space-y-8 select-none">
          <div className="space-y-4">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-slate-900/50 backdrop-blur-md border border-cyan-800/50 px-3.5 py-1 text-xs font-bold uppercase tracking-wider text-cyan-300 shadow-lg">
              <FiHeart className="text-teal-400 animate-pulse drop-shadow-[0_0_5px_rgba(45,212,191,0.8)]" /> AI Intelligent Medicine Reminder
            </span>
            
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-blue-500 to-cyan-400 flex items-center justify-center text-white text-2xl shadow-[0_0_20px_rgba(59,130,246,0.5)]">
                <GiPill />
              </div>
              <h1 className="text-4xl font-black text-white tracking-tight drop-shadow-md">
                Pill<span className="text-cyan-400">Sync</span>
              </h1>
            </div>
            
            <p className="text-sm font-semibold text-teal-300 uppercase tracking-widest drop-shadow-sm">
              AI Intelligent Medicine Reminder & Medication Tracking Platform
            </p>
            
            <p className="text-sm leading-relaxed font-medium text-cyan-50/80">
              A premium, intelligent medication assistant designed to keep your healthcare logs, compliance metrics, and active prescriptions synchronized with your doctors and caregivers.
            </p>
          </div>

          {/* SVG Doctor & Medicine Illustration with Heartbeat ECG line */}
          <div className="relative bg-slate-900/30 backdrop-blur-md border border-white/10 rounded-3xl p-6 shadow-2xl flex flex-col items-center justify-center overflow-hidden group hover:border-white/20 transition-all duration-500">
            
            {/* SVG Clinical Graphics */}
            <svg viewBox="0 0 400 150" className="w-full h-36">
              {/* Heartbeat Animation Path */}
              <path
                d="M 10,75 L 120,75 L 130,60 L 140,90 L 150,30 L 160,110 L 170,70 L 180,80 L 190,75 L 390,75"
                fill="none"
                stroke="#2dd4bf"
                strokeWidth="3"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="heartbeat-line"
                style={{ filter: 'drop-shadow(0 0 6px rgba(45,212,191,0.6))' }}
              />
              {/* Doctor illustration representation */}
              <circle cx="70" cy="75" r="28" fill="#0891b2" stroke="#22d3ee" strokeWidth="2" />
              <path d="M 45,115 C 45,95 95,95 95,115 Z" fill="#0e7490" stroke="#22d3ee" strokeWidth="2" />
              <rect x="67" y="65" width="6" height="20" rx="3" fill="#67e8f9" />
              {/* Medicine capsule SVG graphic */}
              <g transform="translate(300, 50) rotate(30)">
                <rect x="0" y="0" width="30" height="60" rx="15" fill="#14b8a6" />
                <rect x="0" y="30" width="30" height="30" rx="0" fill="#3b82f6" className="rounded-b-full" />
                <line x1="0" y1="30" x2="30" y2="30" stroke="#ffffff" strokeWidth="2" />
              </g>
            </svg>
            
            <div className="absolute bottom-4 left-4 right-4 flex items-center justify-between text-xs text-cyan-100 font-bold uppercase tracking-wider bg-slate-900/60 backdrop-blur-sm px-3 py-1.5 rounded-xl border border-white/10 shadow-inner">
              <span>ECG: Live Monitor</span>
              <span className="flex items-center gap-1.5"><span className="h-2.5 w-2.5 rounded-full bg-teal-400 animate-ping shadow-[0_0_10px_rgba(45,212,191,0.8)]"></span> 72 BPM</span>
            </div>
          </div>

          {/* Interactive Stat Cards Widget */}
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-slate-900/30 backdrop-blur-md border border-white/10 rounded-2xl p-4 space-y-2 shadow-xl hover:shadow-cyan-500/20 transition-all duration-300 hover:-translate-y-1 group">
              <div className="flex items-center gap-2">
                <FiClock className="text-lg text-cyan-400 group-hover:text-cyan-300 transition-colors" />
                <span className="text-xs font-bold uppercase tracking-wider text-cyan-200">Scheduled Alarms</span>
              </div>
              <p className="text-xl font-extrabold text-white drop-shadow-sm">99.2% Accuracy</p>
              <p className="text-[10px] text-cyan-200/60 font-semibold">Immediate push triggers enabled</p>
            </div>
            
            <div className="bg-slate-900/30 backdrop-blur-md border border-white/10 rounded-2xl p-4 space-y-2 shadow-xl hover:shadow-teal-500/20 transition-all duration-300 hover:-translate-y-1 group">
              <div className="flex items-center gap-2">
                <FiActivity className="text-lg text-teal-400 group-hover:text-teal-300 transition-colors" />
                <span className="text-xs font-bold uppercase tracking-wider text-teal-200">Caregiver Sync</span>
              </div>
              <p className="text-xl font-extrabold text-white drop-shadow-sm">Real-Time Logs</p>
              <p className="text-[10px] text-teal-200/60 font-semibold">Instant missed dose warnings</p>
            </div>
          </div>
        </div>
      </div>

      {/* ── RIGHT SIDE: Form Container (Translucent Glassmorphic effect on White) ── */}
      <div className="w-full lg:w-1/2 flex items-center justify-center px-6 py-12 bg-white dark:bg-[#0B1220] relative transition-colors duration-300">
        {/* Logo and title header for mobile screen layout */}
        <div className="absolute top-12 left-12 flex items-center gap-2 lg:hidden text-sky-600">
          <GiPill className="text-3xl text-sky-500 animate-bounce" />
          <span className="text-xl font-black tracking-wider uppercase text-slate-800">PillSync</span>
        </div>

        <div className="w-full max-w-md bg-white dark:bg-[#1E293B] border border-slate-200 dark:border-slate-700 rounded-3xl p-8 sm:p-10 shadow-2xl dark:shadow-none relative overflow-hidden transition-all duration-300">
          <Outlet />
        </div>
      </div>

      {/* Embed Tailwind floating capsule animations directly via custom style tag */}
      <style>{`
        @keyframes float {
          0%, 100% { transform: translateY(0px) rotate(0deg); }
          50% { transform: translateY(-20px) rotate(15deg); }
        }
        .animate-float {
          animation: float infinite ease-in-out;
        }
        .heartbeat-line {
          stroke-dasharray: 600;
          stroke-dashoffset: 600;
          animation: draw-heartbeat 4s linear infinite;
        }
        @keyframes draw-heartbeat {
          to {
            stroke-dashoffset: 0;
          }
        }
      `}</style>
    </div>
  );
};

export default AuthLayout;
