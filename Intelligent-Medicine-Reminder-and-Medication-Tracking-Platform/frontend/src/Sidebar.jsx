import { Link, useNavigate } from 'react-router-dom';

function Sidebar() {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/login');
  };

  return (
    <div style={{ width: '250px', height: '100vh', backgroundColor: '#1a2332', color: 'white', padding: '20px', position: 'fixed', left: 0, top: 0 }}>
      
      {/* Logo */}
      <h1 style={{ fontSize: '24px', fontWeight: 'bold', marginBottom: '30px' }}>💊 PillSync</h1>

      {/* Navigation */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
        <Link to="/dashboard" style={{ color: 'white', textDecoration: 'none', padding: '12px', borderRadius: '8px' }}>📊 Dashboard</Link>
        <Link to="/medicines" style={{ color: 'white', textDecoration: 'none', padding: '12px', borderRadius: '8px' }}>💊 Medicines</Link>
        <Link to="/add-medicine" style={{ color: 'white', textDecoration: 'none', padding: '12px', borderRadius: '8px' }}>➕ Add Medicine</Link>
        <Link to="/scanner" style={{ color: 'white', textDecoration: 'none', padding: '12px', borderRadius: '8px' }}>📸 Scanner</Link>
        <Link to="/history" style={{ color: 'white', textDecoration: 'none', padding: '12px', borderRadius: '8px' }}>📜 History</Link>
        <Link to="/reports" style={{ color: 'white', textDecoration: 'none', padding: '12px', borderRadius: '8px' }}>📈 Reports</Link>
        <Link to="/refill-analytics" style={{ color: 'white', textDecoration: 'none', padding: '12px', borderRadius: '8px' }}>📊 Refill Analytics</Link>
        <Link to="/settings" style={{ color: 'white', textDecoration: 'none', padding: '12px', borderRadius: '8px' }}>⚙️ Settings</Link>
      </div>

      {/* Logout */}
      <div style={{ marginTop: '40px', borderTop: '1px solid #374151', paddingTop: '20px' }}>
        <button onClick={handleLogout} style={{ color: '#f87171', background: 'none', border: 'none', padding: '12px', width: '100%', textAlign: 'left', fontSize: '16px', cursor: 'pointer' }}>
          🚪 Logout
        </button>
      </div>
    </div>
  );
}

export default Sidebar;