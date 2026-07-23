import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import { FiBell, FiTrash2, FiClock, FiAlertCircle, FiSettings } from 'react-icons/fi';
import { GiPill } from 'react-icons/gi';

const Notifications = () => {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState('');

  const fetchNotifications = async () => {
    try {
      // Backend auto-filters notifications to the authenticated user via JWT
      const res = await api.get('/notifications');
      setNotifications(res.data.slice().reverse()); // Show newest first
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

  const clearAllNotifications = () => {
    // Front-end side clearing
    setNotifications([]);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      {/* Header */}
      <div className="md:flex md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-800">Notification Alerts</h1>
          <p className="text-sm text-slate-500 mt-1">Review triggered push reminders and system alert dispatches.</p>
        </div>
        {notifications.length > 0 && (
          <div className="mt-4 md:mt-0">
            <button
              onClick={clearAllNotifications}
              className="inline-flex items-center gap-2 rounded-xl bg-rose-50 border border-rose-100 hover:bg-rose-100 px-4 py-2.5 text-sm font-semibold text-rose-600 transition-colors cursor-pointer"
            >
              <FiTrash2 /> Clear Alerts
            </button>
          </div>
        )}
      </div>

      {errorMsg && (
        <div className="rounded-xl bg-rose-50 p-4 text-sm text-rose-600 border border-rose-100 flex items-center gap-2">
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
        <div className="rounded-2xl border border-slate-100 bg-white p-12 text-center shadow-sm">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-slate-50 text-slate-400 mb-4 text-3xl">
            <FiBell />
          </div>
          <h3 className="text-lg font-bold text-slate-800">No active alerts</h3>
          <p className="text-sm text-slate-500 mt-1">
            You do not have any triggered notifications. Reminders are pushed here automatically as scheduled times occur.
          </p>
        </div>
      ) : (
        <div className="bg-white border border-slate-100 rounded-2xl shadow-sm overflow-hidden divide-y divide-slate-100">
          {notifications.map((notif, index) => (
            <div 
              key={index} 
              className="p-5 flex items-start gap-4 hover:bg-slate-50/50 transition-colors"
            >
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-teal-50 text-teal-600 text-xl border border-teal-100">
                <FiBell className="animate-swing" />
              </div>
              <div className="flex-1 space-y-1">
                <div className="flex justify-between items-start gap-2">
                  <h4 className="font-bold text-slate-800 text-sm">Medication reminder triggered</h4>
                  <span className="text-[10px] text-slate-400 flex items-center gap-1">
                    <FiClock /> {notif.timestamp}
                  </span>
                </div>
                <p className="text-xs text-slate-600">{notif.message}</p>
                <div className="flex gap-2 pt-1">
                  <span className="inline-flex rounded-full bg-blue-50 border border-blue-100 px-2 py-0.5 text-[9px] font-semibold text-blue-600">
                    Medicine: {notif.medicine_name}
                  </span>
                  <span className="inline-flex rounded-full bg-slate-50 border border-slate-100 px-2 py-0.5 text-[9px] font-semibold text-slate-500">
                    Dosage: {notif.dosage}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Push Notification Mockup Info Box */}
      <div className="rounded-2xl border border-blue-100 bg-blue-50/30 p-6 flex items-start gap-3.5">
        <FiSettings className="text-blue-500 text-xl mt-0.5 shrink-0" />
        <div className="space-y-1">
          <h4 className="font-bold text-blue-900 text-sm">Demonstration & Debugging Mode</h4>
          <p className="text-xs text-blue-700 leading-relaxed">
            PillSync features a simulated push-notification queue. In production, this queue integrates with standard WebPush / SMS services. 
            For demonstration, triggered reminder alerts are pushed directly to this UI list in real-time, matching the background APScheduler cron job intervals.
          </p>
        </div>
      </div>
    </div>
  );
};

export default Notifications;
