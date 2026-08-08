import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { Toaster } from 'react-hot-toast';
import AuthLayout from './layouts/AuthLayout';
import DashboardLayout from './layouts/DashboardLayout';

import Login from './pages/Login';
import Register from './pages/Register';
import ForgotPassword from './pages/ForgotPassword';
import ResetPassword from './pages/ResetPassword';
import Landing from './pages/Landing';
import Dashboard from './pages/Dashboard';
import Profile from './pages/Profile';
import MedicineList from './pages/MedicineList';
import AddMedicine from './pages/AddMedicine';
import EditMedicine from './pages/EditMedicine';
import ReminderDashboard from './pages/ReminderDashboard';
import MedicationHistory from './pages/MedicationHistory';
import Notifications from './pages/Notifications';
import Settings from './pages/Settings';
import Ocr from './pages/Ocr';
import RefillPrediction from './pages/RefillPrediction';

function App() {
  useEffect(() => {
    if (localStorage.getItem('darkMode') === 'true') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, []);

  return (
    <AuthProvider>
      <Toaster 
        position="top-right" 
        toastOptions={{
          className: 'bg-white dark:bg-[#1E293B] text-slate-900 dark:text-white border border-slate-200 dark:border-slate-700 rounded-2xl shadow-lg font-sans text-sm',
          duration: 4000,
        }} 
      />
      <Router>

        <Routes>
          {/* Landing Page */}
          <Route path="/" element={<Navigate to="/login" replace />} />

          {/* Guest Auth routes */}
          <Route element={<AuthLayout />}>
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route path="/reset-password" element={<ResetPassword />} />
          </Route>

          {/* Authenticated Dashboard routes */}
          <Route element={<DashboardLayout />}>
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/medicines" element={<MedicineList />} />
            <Route path="/medicines/new" element={<AddMedicine />} />
            <Route path="/medicines/edit/:id" element={<EditMedicine />} />
            <Route path="/reminders" element={<ReminderDashboard />} />
            <Route path="/history" element={<MedicationHistory />} />
            <Route path="/reports" element={<MedicationHistory />} />
            <Route path="/ocr" element={<Ocr />} />
            <Route path="/refills" element={<RefillPrediction />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="/settings" element={<Settings />} />
            <Route path="/notifications" element={<Notifications />} />
            
            {/* Catch-all to redirect to dashboard if not matched */}
            <Route path="*" element={<Navigate to="/dashboard" replace />} />
          </Route>
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
