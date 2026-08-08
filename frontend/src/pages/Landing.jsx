import React from 'react';
import { Link } from 'react-router-dom';
import { 
  FiClock, 
  FiShield, 
  FiActivity, 
  FiHeart, 
  FiUsers, 
  FiTrendingUp,
  FiArrowRight,
  FiCheckCircle
} from 'react-icons/fi';
import { GiPill } from 'react-icons/gi';
import { motion } from 'framer-motion';

const Landing = () => {
  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 dark:text-white flex flex-col font-sans">
      {/* Navbar */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-md border-b border-slate-100 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <GiPill className="text-3xl text-blue-600 animate-bounce" />
          <span className="text-2xl font-black tracking-tight text-slate-900 dark:text-white">
            Pill<span className="text-teal-500">Sync</span>
          </span>
        </div>
        <div className="flex items-center gap-4">
          <Link 
            to="/login" 
            className="text-sm font-bold text-slate-600 hover:text-blue-600 transition-colors"
          >
            Sign In
          </Link>
          <Link 
            to="/register" 
            className="rounded-xl bg-blue-600 hover:bg-blue-700 px-4 py-2 text-sm font-bold text-white shadow-md shadow-blue-500/10 hover:shadow-blue-500/20 active:scale-[0.98] transition-all cursor-pointer"
          >
            Create Account
          </Link>
        </div>
      </nav>

      {/* Hero Section */}
      <header className="pt-32 pb-20 px-6 md:px-12 max-w-7xl mx-auto grid md:grid-cols-2 gap-12 items-center flex-1">
        <motion.div 
          initial={{ opacity: 0, x: -35 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          className="space-y-6"
        >
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold text-blue-600 bg-blue-50 border border-blue-100">
            <FiActivity className="animate-pulse" /> Intelligent Medication Management
          </span>
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-black leading-tight tracking-tight text-slate-900 dark:text-white">
            Take Control of Your <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-teal-500">Health Journey</span>
          </h1>
          <p className="text-base text-slate-500 max-w-lg leading-relaxed">
            PillSync is your intelligent medicine companion. Schedule alarms, monitor stock levels, manage patients as a caregiver, and analyze historical medication compliance trends.
          </p>
          <div className="flex flex-wrap gap-4 pt-2">
            <Link 
              to="/register" 
              className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-blue-600 to-teal-500 hover:opacity-95 px-6 py-3.5 text-sm font-bold text-white shadow-lg shadow-blue-500/10 active:scale-[0.98] transition-all cursor-pointer"
            >
              Get Started Now <FiArrowRight />
            </Link>
            <Link 
              to="/login" 
              className="inline-flex items-center gap-2 rounded-xl bg-white border border-slate-200 hover:bg-slate-50 px-6 py-3.5 text-sm font-bold text-slate-700 transition-colors"
            >
              Access Account
            </Link>
          </div>
          
          <div className="grid grid-cols-3 gap-6 pt-8 border-t border-slate-100">
            <div>
              <p className="text-2xl font-extrabold text-blue-600">99.8%</p>
              <p className="text-xs text-slate-400 font-semibold uppercase tracking-wider">Adherence Rate</p>
            </div>
            <div>
              <p className="text-2xl font-extrabold text-teal-500">10k+</p>
              <p className="text-xs text-slate-400 font-semibold uppercase tracking-wider">Active Patients</p>
            </div>
            <div>
              <p className="text-2xl font-extrabold text-violet-500">24/7</p>
              <p className="text-xs text-slate-400 font-semibold uppercase tracking-wider">Automatic Reminders</p>
            </div>
          </div>
        </motion.div>
        
        {/* Decorative Grid Illustration */}
        <motion.div 
          initial={{ opacity: 0, x: 35 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6, delay: 0.15, ease: "easeOut" }}
          className="relative flex justify-center items-center"
        >
          <div className="absolute inset-0 bg-gradient-to-tr from-blue-400/20 to-teal-400/20 blur-3xl rounded-full" />
          <div className="relative rounded-3xl border border-white bg-white/40 p-6 md:p-8 shadow-2xl backdrop-blur-md max-w-md w-full space-y-6">
            <div className="flex items-center justify-between">
              <span className="text-sm font-bold text-slate-700">Today's Regimen</span>
              <span className="text-xs text-blue-500 font-bold bg-blue-50 px-2 py-0.5 rounded-full">3 Prescriptions</span>
            </div>
            
            <div className="space-y-3">
              {[
                { name: "Metformin (Glucophage)", time: "08:00 AM", tag: "Before Food", type: "Tablet", color: "bg-emerald-50 text-emerald-600 border-emerald-100" },
                { name: "Lisinopril", time: "01:00 PM", tag: "After Food", type: "Capsule", color: "bg-blue-50 text-blue-600 border-blue-100" },
                { name: "Atorvastatin (Lipitor)", time: "08:00 PM", tag: "At Bedtime", type: "Pill", color: "bg-violet-50 text-violet-600 border-violet-100" }
              ].map((med, index) => (
                <div key={index} className="flex items-center justify-between p-3.5 rounded-2xl bg-white border border-slate-100 shadow-sm">
                  <div className="flex items-center gap-3">
                    <div className="h-9 w-9 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center font-bold text-lg shrink-0">
                      💊
                    </div>
                    <div>
                      <h4 className="font-bold text-slate-900 dark:text-white text-xs">{med.name}</h4>
                      <p className="text-[10px] text-slate-400">{med.time} • {med.type}</p>
                    </div>
                  </div>
                  <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full border ${med.color}`}>
                    {med.tag}
                  </span>
                </div>
              ))}
            </div>

            <div className="flex justify-between items-center bg-slate-50 border border-slate-100 rounded-2xl p-4">
              <div className="flex items-center gap-2">
                <FiCheckCircle className="text-emerald-500 text-lg" />
                <span className="text-xs font-bold text-slate-700">All treatments taken!</span>
              </div>
              <span className="text-[10px] font-bold text-slate-400">100% adherence</span>
            </div>
          </div>
        </motion.div>
      </header>

      {/* Features Grid */}
      <section className="bg-white border-y border-slate-100 py-20 px-6 md:px-12">
        <div className="max-w-7xl mx-auto space-y-12">
          <div className="text-center space-y-3">
            <h2 className="text-3xl font-black text-slate-900 dark:text-white">Designed for Patient Success</h2>
            <p className="text-sm text-slate-500 max-w-lg mx-auto">
              Our clinical reminder system eliminates adherence worries with beautiful dashboard metrics and real-time schedules.
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            {[
              { icon: FiClock, color: "text-blue-600 bg-blue-50 border-blue-100", title: "Automated Reminders", text: "Background APScheduler cron triggers alarm notification alerts exactly when your pills are scheduled." },
              { icon: FiUsers, color: "text-teal-600 bg-teal-50 border-teal-100", title: "Caregiver Supervision", text: "Link your caregiver account to track active prescriptions, add medications, and monitor client logs." },
              { icon: FiActivity, color: "text-rose-600 bg-rose-50 border-rose-100", title: "Medication History Logs", text: "Record actions as Taken, Skipped, Snoozed, or Missed to populate daily, weekly, and monthly reports." },
              { icon: FiShield, color: "text-violet-600 bg-violet-50 border-violet-100", title: "HIPAA Compliant Security", text: "Rest assured knowing clinical data and medical history details are encrypted within our secure database." },
              { icon: FiHeart, color: "text-amber-600 bg-amber-50 border-amber-100", title: "Health Profiles", text: "Maintain detailed health files including age, gender, height, weight, diseases, allergies, and emergency contacts." },
              { icon: FiTrendingUp, color: "text-emerald-600 bg-emerald-50 border-emerald-100", title: "Stock Replenishment", text: "Track current pill inventory logs. PillSync alerts you automatically when stock levels fall below thresholds." }
            ].map((feat, index) => (
              <div key={index} className="group p-6 rounded-2xl border border-slate-100 hover:border-blue-100 hover:shadow-md transition-all space-y-4">
                <div className={`h-12 w-12 rounded-xl flex items-center justify-center text-xl border ${feat.color} group-hover:scale-110 transition-transform`}>
                  <feat.icon />
                </div>
                <h3 className="font-bold text-slate-900 dark:text-white text-base">{feat.title}</h3>
                <p className="text-xs text-slate-500 leading-relaxed">{feat.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Services and Testimony */}
      <section className="py-20 px-6 md:px-12 max-w-7xl mx-auto space-y-16">
        <div className="grid md:grid-cols-2 gap-12 items-center">
          <div className="space-y-6">
            <h2 className="text-3xl font-black text-slate-900 dark:text-white">Supervise Loved Ones with Caregiver Tools</h2>
            <p className="text-sm text-slate-500 leading-relaxed">
              PillSync includes a powerful role-based architecture. If you register as a caregiver, you can link multiple family members or clinic patients to your account. Monitor compliance logs, add new prescriptions, edit schedule intervals, and adjust emergency contact numbers from a dedicated, custom caregiver cockpit.
            </p>
            <div className="space-y-3">
              {[
                "Search and link patients easily by email address",
                "Full dashboard view of patient medication schedules",
                "Direct permissions to create, edit, or delete treatments",
                "Weekly adherence compliance reporting charts"
              ].map((pt, i) => (
                <div key={i} className="flex items-center gap-2 text-xs font-bold text-slate-700">
                  <FiCheckCircle className="text-teal-500 shrink-0" />
                  <span>{pt}</span>
                </div>
              ))}
            </div>
          </div>
          <div className="rounded-3xl border border-slate-100 bg-white p-6 shadow-lg">
            <div className="flex gap-1.5 text-amber-400 text-lg mb-4">
              {"★".repeat(5)}
            </div>
            <p className="text-sm italic text-slate-600 leading-relaxed mb-6">
              "PillSync has completely altered how I manage my diabetic treatment. The automated warnings keep me on schedule, and the stock tracker ensures I never run out of insulin. My doctor loves seeing the compliance charts at our monthly followups!"
            </p>
            <div className="flex items-center gap-3">
              <img 
                src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=100&h=100" 
                alt="Sarah K."
                className="h-10 w-10 rounded-xl object-cover"
              />
              <div>
                <h4 className="font-bold text-xs text-slate-900 dark:text-white">Sarah K.</h4>
                <p className="text-[10px] text-slate-400">Patient since June 2025</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Footer */}
      <footer className="mt-auto bg-slate-900 text-slate-400 border-t border-slate-800 pt-16 pb-8 px-6 md:px-12">
        <div className="max-w-7xl mx-auto grid gap-8 md:grid-cols-4 pb-12 border-b border-slate-800">
          <div className="md:col-span-2 space-y-4">
            <div className="flex items-center gap-2">
              <GiPill className="text-3xl text-blue-500" />
              <span className="text-2xl font-black text-white tracking-tight">PillSync</span>
            </div>
            <p className="text-xs text-slate-400 max-w-sm leading-relaxed">
              Intelligent medicine tracking and reminder platform helping thousands of patients manage prescription compliance logs securely.
            </p>
          </div>
          <div>
            <h4 className="font-bold text-white text-xs uppercase tracking-wider mb-4">Account Access</h4>
            <ul className="space-y-2 text-xs">
              <li><Link to="/login" className="hover:text-white transition-colors">Sign In</Link></li>
              <li><Link to="/register" className="hover:text-white transition-colors">Create Account</Link></li>
              <li><Link to="/forgot-password" className="hover:text-white transition-colors">Forgot Password</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="font-bold text-white text-xs uppercase tracking-wider mb-4">Medical Guidelines</h4>
            <p className="text-[10px] text-slate-500 leading-relaxed">
              Disclaimer: PillSync is a reminder aid and logging platform. It does not replace professional medical diagnosis, advice, or prescription treatment planning.
            </p>
          </div>
        </div>
        
        <div className="max-w-7xl mx-auto pt-8 flex flex-col md:flex-row justify-between items-center text-[10px] text-slate-500 gap-4">
          <p>© {new Date().getFullYear()} PillSync Platform Inc. All rights reserved.</p>
          <div className="flex gap-4">
            <a href="#" className="hover:text-white transition-colors">Privacy Policy</a>
            <a href="#" className="hover:text-white transition-colors">Terms of Service</a>
            <a href="#" className="hover:text-white transition-colors">Security Standards</a>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Landing;
