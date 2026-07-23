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
  FiX, 
  FiBell,
  FiSettings
} from 'react-icons/fi';
import { GiPill } from 'react-icons/gi';

const DashboardLayout = () => {
  const { user, loading, logout } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [showNotifications, setShowNotifications] = useState(false);
  const location = useLocation();

  useEffect(() => {
    if (!user) return;

    const fetchNotifications = async () => {
      try {
        // Backend /notifications endpoint is JWT-protected and auto-filters by current user
        const res = await api.get('/notifications');
        setNotifications(res.data);
      } catch (err) {
        console.error("Error fetching system notifications:", err);
      }
    };

    fetchNotifications();
    const interval = setInterval(fetchNotifications, 10000); // Poll every 10s
    return () => clearInterval(interval);
  }, [user]);

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-slate-50">
        <div className="h-12 w-12 animate-spin rounded-full border-4 border-blue-600 border-t-transparent"></div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  const navigation = [
    { name: 'Dashboard', href: '/dashboard', icon: FiHome },
    { name: 'Medicines', href: '/medicines', icon: FiPlusSquare },
    { name: 'Reminders', href: '/reminders', icon: FiClock },
    { name: 'History Logs', href: '/history', icon: FiActivity },
    { name: 'Adherence Reports', href: '/reports', icon: FiBarChart2 },
    { name: 'System Alerts', href: '/notifications', icon: FiBell },
    { name: 'Profile Settings', href: '/profile', icon: FiUser },
    { name: 'System Settings', href: '/settings', icon: FiSettings },
  ];

  return (
    <div className="flex h-screen overflow-hidden bg-slate-50 text-slate-800">
      {/* Mobile Sidebar Overlay */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 z-40 bg-slate-800/40 backdrop-blur-sm lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar Navigation */}
      <aside className={`fixed inset-y-0 left-0 z-50 flex w-64 flex-col bg-white border-r border-slate-100 transition-transform duration-300 lg:static lg:translate-x-0 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="flex h-16 items-center gap-2 border-b border-slate-100 px-6">
          <GiPill className="text-2xl text-blue-600 animate-bounce" />
          <span className="text-xl font-bold tracking-tight text-slate-800">
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
                    ? 'bg-blue-50 text-blue-600' 
                    : 'text-slate-500 hover:bg-slate-50 hover:text-slate-800'
                }`}
              >
                <item.icon className="text-lg" />
                {item.name}
              </Link>
            );
          })}
        </nav>

        <div className="p-4 border-t border-slate-100">
          <button
            onClick={logout}
            className="flex w-full items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium text-rose-500 hover:bg-rose-50 transition-colors"
          >
            <FiLogOut className="text-lg" />
            Sign Out
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex flex-1 flex-col overflow-hidden">
        {/* Top Navbar */}
        <header className="flex h-16 items-center justify-between bg-white border-b border-slate-100 px-6">
          <button
            onClick={() => setSidebarOpen(true)}
            className="rounded-lg p-1.5 hover:bg-slate-100 lg:hidden text-slate-600"
          >
            <FiMenu className="text-xl" />
          </button>

          <div className="flex-1 lg:flex-none">
            <span className="text-sm font-medium text-slate-500 hidden md:inline">
              Welcome back, <span className="font-bold text-slate-700">{user.full_name || user.email}</span>
            </span>
          </div>

          <div className="flex items-center gap-4">
            {/* Notification Badge Dropdown */}
            <div className="relative">
              <button
                onClick={() => setShowNotifications(!showNotifications)}
                className="relative rounded-full p-2 hover:bg-slate-50 border border-slate-100 text-slate-500 transition-colors focus:outline-none"
              >
                <FiBell className="text-lg" />
                {notifications.length > 0 && (
                  <span className="absolute -top-0.5 -right-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-rose-500 text-[10px] font-bold text-white ring-2 ring-white animate-pulse">
                    {notifications.length}
                  </span>
                )}
              </button>

              {/* Notification Overlay Menu */}
              {showNotifications && (
                <div className="absolute right-0 mt-2 z-50 w-80 rounded-2xl bg-white border border-slate-100 shadow-xl p-4 space-y-3 max-h-96 overflow-y-auto">
                  <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                    <span className="font-bold text-slate-800 text-sm">System Alerts</span>
                    <button 
                      onClick={() => setNotifications([])} 
                      className="text-xs text-blue-600 hover:underline"
                    >
                      Clear
                    </button>
                  </div>
                  {notifications.length === 0 ? (
                    <p className="text-xs text-slate-400 text-center py-4">No active reminders. You are all set!</p>
                  ) : (
                    <div className="space-y-2">
                      {notifications.map((notif, index) => (
                        <div key={index} className="flex gap-2.5 rounded-xl bg-slate-50 p-2.5 border border-slate-100 text-xs">
                          <GiPill className="text-teal-500 text-base shrink-0 mt-0.5" />
                          <div>
                            <p className="font-medium text-slate-700">{notif.message}</p>
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
                <p className="text-xs font-semibold text-slate-700">{user.full_name}</p>
                <span className="inline-flex rounded-full bg-teal-50 px-2 py-0.5 text-[10px] font-medium text-teal-600 border border-teal-100 capitalize">
                  {user.role}
                </span>
              </div>
              <img
                src={user.profile_image || `https://ui-avatars.com/name=${encodeURIComponent(user.full_name || 'User')}&background=0D8ABC&color=fff`}
                alt="Profile"
                className="h-10 w-10 rounded-xl bg-slate-100 border border-slate-200 object-cover"
              />
            </div>
          </div>
        </header>

        {/* Dynamic Nested Route Content */}
        <main className="flex-1 overflow-y-auto bg-slate-50/50 p-6 md:p-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;
