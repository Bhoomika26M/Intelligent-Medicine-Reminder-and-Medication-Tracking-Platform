import React, { useState, useEffect } from 'react';
import { Navigate, Outlet, Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import { 
  FiHome, 
  FiPlusSquare, 
  FiClock, 
  FiActivity, 
  FiBarChart2, 
  FiUser, 
  FiLogOut, 
  FiMenu, 
  FiBell,
  FiSettings,
  FiSearch,
  FiSun,
  FiMoon,
  FiAlertCircle,
  FiCheckCircle,
  FiMinusCircle,
  FiXCircle,
  FiCamera,
  FiRefreshCw
} from 'react-icons/fi';
import { GiPill } from 'react-icons/gi';

const DashboardLayout = () => {
  const { user, loading, logout } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [showNotifications, setShowNotifications] = useState(false);
  const location = useLocation();

  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [allMedicines, setAllMedicines] = useState([]);

  useEffect(() => {
    if (!user) return;
    const fetchMeds = async () => {
      try {
        const res = await api.get('/medicines');
        setAllMedicines(res.data);
      } catch(e){}
    };
    fetchMeds();
  }, [user]);

  const handleSearch = (query) => {
    setSearchQuery(query);
    if (!query) {
      setSearchResults([]);
      return;
    }
    const q = query.toLowerCase();
    
    const staticItems = [
      { name: 'Medicine Name', type: 'Feature' },
      { name: 'Medicine Type', type: 'Category' },
      { name: 'Category', type: 'System' },
      { name: 'Reminder', type: 'Feature' },
      { name: 'Schedule', type: 'Feature' },
      { name: 'Prescription', type: 'Feature' },
      { name: 'History', type: 'Feature' },
      { name: 'OCR', type: 'Feature' },
      { name: 'Reports', type: 'Feature' },
      { name: 'Analytics', type: 'Feature' },
    ];
    
    const matchedStatic = staticItems.filter(item => item.name.toLowerCase().includes(q));
    const matchedMeds = allMedicines.filter(m => m.name.toLowerCase().includes(q) || (m.disease && m.disease.toLowerCase().includes(q)));
    
    setSearchResults([...matchedStatic, ...matchedMeds.map(m => ({ name: m.name, type: m.disease || 'Medicine' }))]);
  };

  const highlightMatch = (text, query) => {
    if (!query) return text;
    const parts = text.split(new RegExp(`(${query})`, 'gi'));
    return parts.map((part, i) => 
      part.toLowerCase() === query.toLowerCase() ? <span key={i} className="bg-yellow-200 dark:bg-yellow-700/50 text-slate-900 dark:text-white font-bold rounded-sm px-0.5">{part}</span> : part
    );
  };

  // Dark Mode State
  const [darkMode, setDarkMode] = useState(() => {
    return localStorage.getItem('darkMode') === 'true';
  });

  // Reminder Popup & Audio Alert States
  const [activePopupReminder, setActivePopupReminder] = useState(null);
  const [snoozedIds, setSnoozedIds] = useState({});

  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('darkMode', 'true');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('darkMode', 'false');
    }
  }, [darkMode]);

  // Request browser notification permissions
  useEffect(() => {
    if ('Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission();
    }
  }, []);

  // Poll system notifications (for indicator bell)
  useEffect(() => {
    if (!user) return;

    const fetchNotifications = async () => {
      try {
        const res = await api.get('/notifications');
        setNotifications(res.data);
      } catch (err) {
        console.error("Error fetching system notifications:", err);
      }
    };

    fetchNotifications();
    const interval = setInterval(fetchNotifications, 15000); // Poll every 15s
    return () => clearInterval(interval);
  }, [user]);

  // Synthesize Medical Alert Chime
  const playChime = (success = false) => {
    try {
      const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
      
      const playTone = (freq, duration, type = 'sine') => {
        const osc = audioCtx.createOscillator();
        const gainNode = audioCtx.createGain();
        osc.connect(gainNode);
        gainNode.connect(audioCtx.destination);
        osc.type = type;
        osc.frequency.setValueAtTime(freq, audioCtx.currentTime);
        gainNode.gain.setValueAtTime(0.08, audioCtx.currentTime);
        osc.start();
        osc.stop(audioCtx.currentTime + duration);
      };

      if (success) {
        // Success: High sweet chime (C5 -> G5)
        playTone(523.25, 0.1);
        setTimeout(() => playTone(783.99, 0.2), 100);
      } else {
        // Alert: Medical beep (C5 -> E5 -> G5)
        playTone(523.25, 0.15, 'triangle');
        setTimeout(() => playTone(659.25, 0.15, 'triangle'), 150);
        setTimeout(() => playTone(783.99, 0.25, 'triangle'), 300);
      }
    } catch (err) {
      console.warn("Browser audio blocks play until interaction:", err);
    }
  };

  // Poll for due Pending reminders
  useEffect(() => {
    if (!user || user.role !== 'Patient') return;

    const pollDueReminders = async () => {
      try {
        const todayStr = new Date().toISOString().split('T')[0];
        const res = await api.get(`/reminder?date_filter=${todayStr}&status_filter=Pending`);
        const pending = res.data;

        if (pending.length > 0) {
          const now = new Date();
          const currentHHMM = now.toTimeString().substring(0, 5);

          // Find a pending reminder whose scheduled time has arrived
          const due = pending.find(r => {
            const remTime = r.reminder_time.substring(0, 5);
            const isSnoozed = snoozedIds[r.id] && now.getTime() < snoozedIds[r.id];
            return remTime <= currentHHMM && !isSnoozed;
          });

          if (due && (!activePopupReminder || activePopupReminder.id !== due.id)) {
            setActivePopupReminder(due);
            playChime(false);

            // Web Browser Native Notification
            if ('Notification' in window && Notification.permission === 'granted') {
              new Notification("PillSync Medication Reminder", {
                body: `It's time to take your: ${due.medicine?.name} (${due.medicine?.dosage})`,
                icon: "/logo.png"
              });
            }
          }
        }
      } catch (err) {
        console.error("Reminder polling failed:", err);
      }
    };

    pollDueReminders();
    const interval = setInterval(pollDueReminders, 10000); // Check every 10 seconds
    return () => clearInterval(interval);
  }, [user, activePopupReminder, snoozedIds]);

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-slate-50 dark:bg-[#0B1220]">
        <div className="h-12 w-12 animate-spin rounded-full border-4 border-blue-600 border-t-transparent"></div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // Handle Dose action inside popup
  const handlePopupAction = async (reminderId, status) => {
    try {
      await api.put(`/reminder/${reminderId}`, { status });
      if (status === 'Taken') {
        playChime(true);
      }
      setActivePopupReminder(null);
      
      // Notify other dashboards to refresh data
      window.dispatchEvent(new CustomEvent('reminderStatusUpdated'));
    } catch (err) {
      console.error("Popup update error:", err);
    }
  };

  // Snooze active reminder
  const handleSnooze = (reminderId) => {
    // Snooze for 1 minute (60 seconds) for demonstration
    const snoozeUntil = new Date().getTime() + 60000;
    setSnoozedIds(prev => ({ ...prev, [reminderId]: snoozeUntil }));
    setActivePopupReminder(null);
  };

  const displayName = "Police Mounika";

  const navigation = [
    { name: 'Dashboard', href: '/dashboard', icon: FiHome },
    { name: 'Medicines', href: '/medicines', icon: FiPlusSquare },
    { name: 'OCR Scanner', href: '/ocr', icon: FiCamera },
    { name: 'AI Refills', href: '/refills', icon: FiRefreshCw },
    { name: 'Reminders', href: '/reminders', icon: FiClock },
    { name: 'History Logs', href: '/history', icon: FiActivity },
    { name: 'Adherence Reports', href: '/reports', icon: FiBarChart2 },
    { name: 'System Alerts', href: '/notifications', icon: FiBell },
    { name: 'Profile Settings', href: '/profile', icon: FiUser },
    { name: 'System Settings', href: '/settings', icon: FiSettings },
  ];

  return (
    <div className="flex h-screen overflow-hidden bg-white dark:bg-[#0B1220] text-slate-900 dark:text-white transition-colors duration-300">
      {/* Mobile Sidebar Overlay */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 z-40 bg-slate-800/40 backdrop-blur-sm lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar Navigation */}
      <aside className={`fixed inset-y-0 left-0 z-50 flex w-64 flex-col bg-[#F8FAFC] dark:bg-[#111827] border-r border-slate-200 dark:border-slate-700 transition-transform duration-300 lg:static lg:translate-x-0 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="flex h-16 items-center gap-2 border-b border-slate-200 dark:border-slate-700 px-6">
          <GiPill className="text-2xl text-blue-600 animate-bounce" />
          <span className="text-xl font-bold tracking-tight text-slate-800 dark:text-white">
            Pill<span className="text-teal-500">Sync</span>
          </span>
        </div>
        
        <nav className="flex-1 overflow-y-auto px-4 py-6 space-y-1">
          {navigation.map((item) => {
            const isActive = location.pathname === item.href || location.pathname.startsWith(item.href + '/');
            return (
              <Link
                key={item.name}
                to={item.href}
                onClick={() => setSidebarOpen(false)}
                className={`flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium transition-colors ${
                  isActive 
                    ? 'bg-white dark:bg-[#1E293B] text-blue-600 dark:text-white font-bold shadow-sm' 
                    : 'text-slate-600 dark:text-slate-300 hover:bg-white dark:hover:bg-[#1E293B] hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                <item.icon className="text-lg" />
                {item.name}
              </Link>
            );
          })}
        </nav>

        <div className="p-4 border-t border-slate-200 dark:border-slate-700">
          <button
            onClick={logout}
            className="flex w-full items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium text-rose-500 hover:bg-white dark:hover:bg-[#1E293B] transition-colors cursor-pointer"
          >
            <FiLogOut className="text-lg" />
            Sign Out
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex flex-1 flex-col overflow-hidden">
        {/* Top Navbar */}
        <header className="flex h-16 items-center justify-between bg-white dark:bg-[#0B1220] border-b border-slate-200 dark:border-slate-700 px-6">
          <button
            onClick={() => setSidebarOpen(true)}
            className="rounded-lg p-1.5 hover:bg-slate-100 dark:hover:bg-slate-800 lg:hidden text-slate-600 dark:text-slate-300"
          >
            <FiMenu className="text-xl" />
          </button>

          {/* Search Bar */}
          <div className="hidden md:flex flex-1 max-w-md mx-8 relative">
            <div className="absolute inset-y-0 left-0 flex items-center pl-3.5 text-slate-400 pointer-events-none">
              <FiSearch className="text-base" />
            </div>
            <input
              type="text"
              placeholder="Search medical categories, medications, schedules..."
              className="w-full rounded-xl border border-slate-200 dark:border-slate-700 py-2 pl-10 pr-4 text-xs bg-[#F8FAFC] dark:bg-[#111827] focus:bg-white dark:focus:bg-[#1E293B] focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition-all text-slate-900 dark:text-white"
              value={searchQuery}
              onChange={(e) => handleSearch(e.target.value)}
            />
            {searchQuery && (
              <div className="absolute top-full left-0 right-0 mt-2 bg-white dark:bg-[#1E293B] border border-slate-200 dark:border-slate-700 rounded-xl shadow-lg max-h-60 overflow-y-auto z-50 p-2">
                {searchResults.length > 0 ? (
                  searchResults.map((result, idx) => (
                    <div key={idx} className="p-2 hover:bg-slate-50 dark:hover:bg-slate-700 rounded-lg cursor-pointer text-sm text-slate-700 dark:text-slate-300">
                      {highlightMatch(result.name, searchQuery)} <span className="text-xs text-slate-500">- {result.type}</span>
                    </div>
                  ))
                ) : (
                  <div className="p-3 text-sm text-slate-500 text-center">No matching medicines found.</div>
                )}
              </div>
            )}
          </div>

          {/* Right Header controls */}
          <div className="flex items-center gap-4">
            {/* Dark Mode Toggle */}
            <button
              onClick={() => setDarkMode(!darkMode)}
              className="rounded-full p-2 hover:bg-[#F8FAFC] dark:hover:bg-[#1E293B] border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 transition-colors focus:outline-none cursor-pointer"
            >
              {darkMode ? <FiSun className="text-lg" /> : <FiMoon className="text-lg" />}
            </button>

            {/* Notification Badge Dropdown */}
            <div className="relative">
              <button
                onClick={() => setShowNotifications(!showNotifications)}
                className="relative rounded-full p-2 hover:bg-[#F8FAFC] dark:hover:bg-[#1E293B] border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 transition-colors focus:outline-none cursor-pointer"
              >
                <FiBell className="text-lg" />
                {notifications.length > 0 && (
                  <span className="absolute -top-0.5 -right-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-rose-500 text-[10px] font-bold text-white ring-2 ring-white dark:ring-slate-900 animate-pulse">
                    {notifications.length}
                  </span>
                )}
              </button>

              {/* Notification Overlay Menu */}
              {showNotifications && (
                <div className="absolute right-0 mt-2 z-50 w-80 rounded-2xl bg-white dark:bg-[#1E293B] border border-slate-200 dark:border-slate-700 shadow-xl p-4 space-y-3 max-h-96 overflow-y-auto">
                  <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-700 pb-2">
                    <span className="font-bold text-slate-900 dark:text-white text-sm">System Alerts</span>
                    <button 
                      onClick={async () => {
                        try {
                          await api.delete('/notifications');
                          setNotifications([]);
                        } catch (err) {
                          console.error(err);
                        }
                      }} 
                      className="text-xs text-blue-600 hover:underline"
                    >
                      Clear All
                    </button>
                  </div>
                  {notifications.length === 0 ? (
                    <p className="text-xs text-slate-400 text-center py-4">No active reminders. You are all set!</p>
                  ) : (
                    <div className="space-y-2">
                      {notifications.map((notif, index) => (
                        <div key={index} className="flex gap-2.5 rounded-xl bg-[#F8FAFC] dark:bg-[#111827] p-2.5 border border-slate-200 dark:border-slate-700 text-xs">
                          <GiPill className="text-teal-500 text-base shrink-0 mt-0.5" />
                          <div className="flex-1">
                            <p className="font-medium text-slate-700 dark:text-slate-300">{notif.message}</p>
                            <span className="text-[10px] text-slate-400">{notif.timestamp}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Profile Avatar & Metadata */}
            <div className="flex items-center gap-3">
              <div className="hidden text-right md:block">
                <p className="text-xs font-semibold text-slate-900 dark:text-white">{displayName}</p>
                <span className="inline-flex rounded-full bg-teal-50 dark:bg-[#1E293B] px-2 py-0.5 text-[10px] font-medium text-teal-600 dark:text-teal-400 border border-teal-100 dark:border-slate-700 capitalize">
                  Patient
                </span>
              </div>
              <img
                src={user.profile_image || `https://ui-avatars.com/api/?name=${encodeURIComponent(displayName)}&background=0D8ABC&color=fff&size=128&bold=true`}
                alt="Profile"
                className="h-10 w-10 rounded-xl bg-[#F8FAFC] dark:bg-[#111827] border border-slate-200 dark:border-slate-700 object-cover"
              />
            </div>
          </div>
        </header>

        {/* Dynamic Nested Route Content */}
        <main className="flex-1 overflow-y-auto bg-white dark:bg-[#0B1220] p-6 md:p-8">
          <Outlet />
        </main>
      </div>

      {/* ── SOUND-ENABLED CENTRAL OVERLAY REMINDER POPUP ────────────────────── */}
      {activePopupReminder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-md px-4">
          <div className="w-full max-w-md rounded-3xl bg-white dark:bg-[#1E293B] p-6 shadow-2xl border border-slate-200 dark:border-slate-700 text-center space-y-6 animate-scaleIn">
            
            <div className="flex flex-col items-center">
              {/* Pulsing Pill Container */}
              <div className="flex h-20 w-20 items-center justify-center rounded-full bg-rose-50 dark:bg-rose-950/25 text-rose-500 text-4xl shadow-inner animate-pulse">
                <GiPill className="animate-spin" style={{ animationDuration: '3s' }} />
              </div>
              <h2 className="mt-4 text-xl font-black text-slate-800 dark:text-white">Medication Alarm</h2>
              <p className="text-xs text-rose-500 font-bold uppercase tracking-widest mt-1">Dose is currently due</p>
            </div>

            {/* Medicine details */}
            <div className="bg-[#F8FAFC] dark:bg-[#111827] rounded-2xl p-4.5 border border-slate-200 dark:border-slate-700 text-left space-y-1">
              <h3 className="font-bold text-slate-900 dark:text-white text-base">{activePopupReminder.medicine?.name}</h3>
              <p className="text-xs text-slate-500 dark:text-slate-300">
                Dosage: <span className="font-bold text-slate-700 dark:text-slate-300">{activePopupReminder.medicine?.dosage}</span>
              </p>
              <p className="text-xs text-slate-500 dark:text-slate-300">
                Scheduled Time: <span className="font-bold text-slate-700 dark:text-slate-300">{activePopupReminder.reminder_time.substring(0, 5)}</span>
              </p>
              {activePopupReminder.medicine?.instructions && (
                <p className="text-xs text-slate-400 mt-2 italic bg-white dark:bg-[#1E293B] p-2 rounded-lg border border-slate-100 dark:border-slate-700">
                  Instructions: {activePopupReminder.medicine?.instructions}
                </p>
              )}
            </div>

            {/* Action buttons */}
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={() => handlePopupAction(activePopupReminder.id, 'Taken')}
                className="rounded-xl bg-teal-500 hover:bg-teal-600 text-white py-3 text-xs font-bold shadow-md shadow-teal-500/10 cursor-pointer transition-colors"
              >
                Taken
              </button>
              <button
                onClick={() => handlePopupAction(activePopupReminder.id, 'Skipped')}
                className="rounded-xl bg-amber-400 hover:bg-amber-500 text-white py-3 text-xs font-bold shadow-md shadow-amber-400/10 cursor-pointer transition-colors"
              >
                Skip
              </button>
              <button
                onClick={() => handlePopupAction(activePopupReminder.id, 'Missed')}
                className="rounded-xl bg-rose-500 hover:bg-rose-600 text-white py-3 text-xs font-bold shadow-md shadow-rose-500/10 cursor-pointer transition-colors"
              >
                Missed
              </button>
              <button
                onClick={() => handleSnooze(activePopupReminder.id)}
                className="rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-600 dark:bg-[#1E293B] dark:hover:bg-slate-700 dark:text-slate-300 py-3 text-xs font-bold cursor-pointer transition-colors"
              >
                Snooze (1 min)
              </button>
            </div>
            
          </div>
        </div>
      )}
    </div>
  );
};

export default DashboardLayout;
