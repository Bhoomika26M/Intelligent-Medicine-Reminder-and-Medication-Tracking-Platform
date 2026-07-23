import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import AuthLayout from './layouts/AuthLayout';
import DashboardLayout from './layouts/DashboardLayout';

import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import Profile from './pages/Profile';
import MedicineList from './pages/MedicineList';
import AddMedicine from './pages/AddMedicine';
import EditMedicine from './pages/EditMedicine';
import ReminderDashboard from './pages/ReminderDashboard';
import MedicationHistory from './pages/MedicationHistory';
import Notifications from './pages/Notifications';
import Settings from './pages/Settings';

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          {/* Guest Auth routes */}
          <Route element={<AuthLayout />}>
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
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
            <Route path="/profile" element={<Profile />} />
            <Route path="/settings" element={<Settings />} />
            <Route path="/notifications" element={<Notifications />} />
            
            {/* Catch-all to redirect to dashboard */}
            <Route path="*" element={<Navigate to="/dashboard" replace />} />
          </Route>

          {/* Root redirect */}
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
