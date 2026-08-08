import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import { FiBell, FiTrash2, FiClock, FiAlertCircle, FiSettings, FiCheck } from 'react-icons/fi';
import { GiPill } from 'react-icons/gi';

const Notifications = () => {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState('');

  const fetchNotifications = async () => {
    try {
      const res = await api.get('/notifications');
      // Sort to show newest first
      setNotifications(res.data.slice().sort((a, b) => b.id - a.id));
    } catch (err) {
      console.error("Error loading system notifications:", err);
      setErrorMsg("Failed to sync system alerts.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      fetchNotifications();
    }
  }, [user]);

  const clearAllNotifications = async () => {
    try {
      await api.delete('/notifications');
      setNotifications([]);
    } catch (err) {
      console.error("Failed to clear notifications:", err);
      setErrorMsg("Failed to clear notification logs from server.");
    }
  };

  const handleDelete = async (id) => {
    try {
      await api.delete(`/notifications/${id}`);
      setNotifications(prev => prev.filter(n => n.id !== id));
    } catch (err) {
      console.error("Failed to delete notification:", err);
      setErrorMsg("Failed to delete notification alert.");
    }
  };

  const handleMarkAsRead = async (id) => {
    try {
      await api.patch(`/notifications/${id}/read`);
      setNotifications(prev => prev.map(n => n.id === id ? { ...n, is_read: true } : n));
    } catch (err) {
      console.error("Failed to read notification:", err);
      setErrorMsg("Failed to update notification read status.");
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      {/* Header */}
      <div className="md:flex md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white dark:text-white">Notification Alerts</h1>
          <p className="text-sm text-slate-500 dark:text-slate-300 mt-1">Review triggered push reminders and system alert dispatches.</p>
        </div>
        {notifications.length > 0 && (
          <div className="mt-4 md:mt-0">
            <button
              onClick={clearAllNotifications}
              className="inline-flex items-center gap-2 rounded-xl bg-rose-50 dark:bg-rose-950/20 border border-rose-100 dark:border-rose-900 hover:bg-rose-100 dark:hover:bg-rose-900/50 px-4 py-2.5 text-sm font-semibold text-rose-600 dark:text-rose-400 transition-colors cursor-pointer"
            >
              <FiTrash2 /> Clear All Alerts
            </button>
          </div>
        )}
      </div>

      {errorMsg && (
        <div className="rounded-xl bg-rose-50 dark:bg-rose-950/20 p-4 text-sm text-rose-600 dark:text-rose-400 border border-rose-100 dark:border-rose-900 flex items-center gap-2">
          <FiAlertCircle className="text-lg shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* Main Panel */}
      {loading ? (
        <div className="flex h-48 items-center justify-center">
          <div className="h-10 w-10 animate-spin rounded-full border-4 border-blue-600 border-t-transparent"></div>
        </div>
      ) : notifications.length === 0 ? (
        <div className="rounded-2xl border border-slate-100 dark:border-slate-700 bg-white dark:bg-[#1E293B] p-12 text-center shadow-sm">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-slate-50 dark:bg-[#1E293B] text-slate-400 mb-4 text-3xl">
            <FiBell />
          </div>
          <h3 className="text-lg font-bold text-slate-900 dark:text-white dark:text-white">No active alerts</h3>
          <p className="text-sm text-slate-500 dark:text-slate-300 mt-1">
            You do not have any triggered notifications. Reminders are pushed here automatically as scheduled times occur.
          </p>
        </div>
      ) : (
        <div className="bg-white dark:bg-[#1E293B] border border-slate-100 dark:border-slate-700 rounded-2xl shadow-sm overflow-hidden divide-y divide-slate-100 dark:divide-slate-800">
          {notifications.map((notif) => (
            <div 
              key={notif.id} 
              className={`p-5 flex items-start justify-between gap-4 hover:bg-slate-50/50 dark:hover:bg-slate-800/20 transition-colors ${
                !notif.is_read ? 'bg-blue-50/20 dark:bg-blue-900/10' : ''
              }`}
            >
              <div className="flex items-start gap-4">
                <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-xl border ${
                  !notif.is_read 
                    ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 border-blue-100 dark:border-blue-900 animate-pulse'
                    : 'bg-slate-50 dark:bg-[#1E293B] text-slate-400 border-slate-100 dark:border-slate-700'
                }`}>
                  <FiBell />
                </div>
                <div className="space-y-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <h4 className="font-bold text-slate-900 dark:text-white dark:text-white text-sm">Medication reminder triggered</h4>
                    {!notif.is_read && (
                      <span className="inline-flex items-center rounded-full bg-blue-100 dark:bg-blue-900/30 px-1.5 py-0.5 text-[9px] font-black text-blue-600 dark:text-blue-400 uppercase">New</span>
                    )}
                  </div>
                  <p className="text-xs text-slate-600 dark:text-slate-300">{notif.message}</p>
                  <div className="flex gap-2 pt-1">
                    <span className="inline-flex rounded-full bg-blue-50 dark:bg-blue-900/20 border border-blue-100 dark:border-blue-900 px-2 py-0.5 text-[9px] font-semibold text-blue-600 dark:text-blue-400">
                      Medicine: {notif.medicine_name}
                    </span>
                    <span className="inline-flex rounded-full bg-slate-50 dark:bg-[#1E293B] border border-slate-100 dark:border-slate-700 px-2 py-0.5 text-[9px] font-semibold text-slate-500 dark:text-slate-300">
                      Dosage: {notif.dosage}
                    </span>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-2">
                <span className="text-[10px] text-slate-400 flex items-center gap-1 mr-2 whitespace-nowrap">
                  <FiClock /> {notif.timestamp}
                </span>

                {!notif.is_read && (
                  <button
                    onClick={() => handleMarkAsRead(notif.id)}
                    className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-700 text-slate-500 hover:text-teal-600 hover:border-teal-300 dark:hover:text-teal-400 dark:hover:border-teal-800 transition-colors cursor-pointer"
                    title="Mark as Read"
                  >
                    <FiCheck className="text-sm" />
                  </button>
                )}

                <button
                  onClick={() => handleDelete(notif.id)}
                  className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-700 text-slate-500 hover:text-rose-600 hover:border-rose-300 dark:hover:text-rose-400 dark:hover:border-rose-800 transition-colors cursor-pointer"
                  title="Delete Alert"
                >
                  <FiTrash2 className="text-sm" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Push Notification Mockup Info Box */}
      <div className="rounded-2xl border border-blue-100 dark:border-blue-900 bg-blue-50/30 dark:bg-blue-950/20 p-6 flex items-start gap-3.5">
        <FiSettings className="text-blue-500 text-xl mt-0.5 shrink-0" />
        <div className="space-y-1">
          <h4 className="font-bold text-blue-900 dark:text-blue-200 text-sm">Demonstration & Debugging Mode</h4>
          <p className="text-xs text-blue-700 dark:text-blue-300 leading-relaxed font-medium">
            PillSync features a simulated push-notification queue. In production, this queue integrates with standard WebPush / SMS services. 
            For demonstration, triggered reminder alerts are pushed directly to this UI list in real-time, matching the background APScheduler cron job intervals.
          </p>
        </div>
      </div>
    </div>
  );
};

export default Notifications;
