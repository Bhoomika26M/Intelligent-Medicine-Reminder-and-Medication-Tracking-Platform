import { Routes, Route } from "react-router-dom";
import Caregiver from "./pages/Caregiver";
import CalendarPage from "./pages/Calendar";
import MainLayout from "./layouts/MainLayout";
import AddMedicine from "./pages/AddMedicine";
import UploadPrescription from "./pages/UploadPrescription";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import Medicines from "./pages/Medicines";
import Reminder from "./pages/Reminder";
import History from "./pages/History";
import Profile from "./pages/Profile";
import ChangePassword from "./pages/ChangePassword";
import EditMedicine from "./pages/EditMedicine";
import ForgotPassword from "./pages/ForgotPassword";
import Settings from "./pages/Settings";
import Notifications from "./pages/Notifications";
import Analytics from "./pages/Analytics";
import RefillPrediction from "./pages/RefillPrediction";
function App() {
  return (
    <Routes>
      <Route path="/" element={<Login />} />
      <Route path="/register" element={<Register />} />

      <Route element={<MainLayout />}>
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/medicines" element={<Medicines />} />
        <Route path="/add-medicine" element={<AddMedicine />} />
        <Route path="/edit-medicine/:id" element={<EditMedicine />} />
        <Route
          path="/upload-prescription"
          element={<UploadPrescription />}
        />
        <Route path="/reminders" element={<Reminder />} />
        <Route path="/history" element={<History />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/change-password" element={<ChangePassword />} />
        <Route path="/calendar" element={<CalendarPage />} />
        <Route path="/settings" element={<Settings />} />
        <Route
          path="/forgot-password"
          element={<ForgotPassword />}
        />
        <Route
          path="/notifications"
          element={<Notifications />}
        />
        <Route
           path="/refill-prediction"
           element={<RefillPrediction />}
        />
        <Route path="/analytics" element={<Analytics />} />
        <Route path="/caregiver" element={<Caregiver />} />
      </Route>
    </Routes>
  );
}

export default App;