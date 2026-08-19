import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import Register from './pages/Register';
import Profile from './pages/Profile';
import AddMedicine from './AddMedicine';
import Dashboard from './Dashboard';
import History from './History';
import Sidebar from './Sidebar';
import Medicines from './Medicines';
import Scanner from './Scanner';
import Reports from './Reports';
import Settings from './Settings';
import RefillAnalytics from './RefillAnalytics';

function App() {
  const token = localStorage.getItem('token');

  if (!token) {
    return (
      <Router>
        <Routes>
          <Route path="/" element={<Navigate to="/login" />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
        </Routes>
      </Router>
    );
  }

  return (
    <Router>
      <Routes>
        <Route path="/" element={<Navigate to="/login" />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/profile" element={<Profile />} />
      </Routes>
      <div className="sidebar-layout">
        <Sidebar />
        <div className="sidebar-content">
          <Routes>
             <Route path="/" element={<Navigate to="/dashboard" />} />
             <Route path="/dashboard" element={<Dashboard />} />
             <Route path="/add-medicine" element={<AddMedicine />} />
             <Route path="/history" element={<History />} />
             <Route path="/profile" element={<Profile />} />
             <Route path="/medicines" element={<Medicines />} />
             <Route path="/scanner" element={<Scanner />} />
             <Route path="/reports" element={<Reports />} />
             <Route path="/settings" element={<Settings />} />
             <Route path="/refill-analytics" element={<RefillAnalytics />} />
          </Routes>
        </div>
      </div>
    </Router>
  );
}
export default App;