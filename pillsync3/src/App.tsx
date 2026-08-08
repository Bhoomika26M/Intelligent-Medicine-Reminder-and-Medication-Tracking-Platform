import { BrowserRouter, Routes, Route, Navigate, Outlet } from "react-router-dom";
import { useEffect } from "react";
import { AuthProvider, useAuth } from "@/context/AuthContext";
import Layout from "@/components/Layout";
import Login from "@/pages/Login";
import Register from "@/pages/Register";
import Dashboard from "@/pages/Dashboard";
import Medicines from "@/pages/Medicines";
import History from "@/pages/History";
import Analytics from "@/pages/Analytics";
import Profile from "@/pages/Profile";
import { reminderApi } from "@/api";
import { ensureNotificationPermission, showReminderNotification } from "@/notifications";
import type { Reminder } from "@/types";

function Protected() {
  const { user, loading } = useAuth();
  if (loading) return <div className="min-h-screen flex items-center justify-center text-ink-500">Loading…</div>;
  if (!user) return <Navigate to="/login" replace />;
  return <Layout><Outlet /></Layout>;
}

function PublicOnly() {
  const { user, loading } = useAuth();
  if (loading) return null;
  if (user) return <Navigate to="/dashboard" replace />;
  return <Outlet />;
}

/** Checks reminder times every minute and fires a browser notification on match. */
function ReminderWatcher() {
  const { user } = useAuth();
  useEffect(() => {
    ensureNotificationPermission();
    if (!user) return;
    let lastFired = "";
    const check = async () => {
      const now = new Date();
      const hhmm = now.toTimeString().slice(0, 5);
      const key = `${now.toISOString().slice(0, 10)}-${hhmm}`;
      if (key === lastFired) return;
      try {
        const reminders: Reminder[] = await reminderApi.list(user);
        const match = reminders.find((r) => r.reminder_time === hhmm);
        if (match) {
          lastFired = key;
          showReminderNotification(match.name, match.dosage, match.reminder_time);
        }
      } catch { /* ignore — offline mode still works */ }
    };
    check();
    const id = setInterval(check, 60_000);
    return () => clearInterval(id);
  }, [user]);
  return null;
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <ReminderWatcher />
        <Routes>
          <Route element={<PublicOnly />}>
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
          </Route>
          <Route element={<Protected />}>
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/medicines" element={<Medicines />} />
            <Route path="/history" element={<History />} />
            <Route path="/analytics" element={<Analytics />} />
            <Route path="/profile" element={<Profile />} />
          </Route>
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}
