import { Routes, Route } from "react-router-dom";

import MainLayout from "./layouts/MainLayout";
import AddMedicine from "./pages/AddMedicine";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import Medicines from "./pages/Medicines";
import Reminder from "./pages/Reminder";
import History from "./pages/History";
import Profile from "./pages/Profile";
import ChangePassword from "./pages/ChangePassword";
import ForgotPassword from "./pages/ForgetPassword";
function App() {
  return (
    <Routes>
      <Route path="/" element={<Login />} />
      <Route path="/register" element={<Register />} />

      <Route element={<MainLayout />}>
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/medicines" element={<Medicines />} />
        <Route path="/add-medicine" element={<AddMedicine />} />
        <Route path="/reminders" element={<Reminder />} />
        <Route path="/history" element={<History />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/change-password" element={<ChangePassword />} />
        <Route path="/forgot-password" element={<ForgotPassword />}  />   
        </Route> 
    </Routes>
  );
}

export default App;