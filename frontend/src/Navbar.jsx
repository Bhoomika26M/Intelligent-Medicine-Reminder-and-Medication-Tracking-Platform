import { Link, useNavigate } from 'react-router-dom';

function Navbar() {
  const navigate = useNavigate();
  const token = localStorage.getItem('token');

  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/login');
  };

  return (
    <nav style={{ backgroundColor: '#2563eb', color: 'white', padding: '16px', boxShadow: '0 4px 6px rgba(0,0,0,0.1)' }}>
      <div style={{ maxWidth: '1200px', margin: '0 auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ display: 'flex', alignItems: 'center' }}>
          <span style={{ fontSize: '20px', fontWeight: 'bold', marginRight: '30px' }}>💊 MediTrack</span>
          <div>
            <Link to="/dashboard" style={{ color: 'white', textDecoration: 'none', marginRight: '25px', fontSize: '16px' }}>Dashboard</Link>
            <Link to="/add-medicine" style={{ color: 'white', textDecoration: 'none', marginRight: '25px', fontSize: '16px' }}>Add Medicine</Link>
            <Link to="/history" style={{ color: 'white', textDecoration: 'none', marginRight: '25px', fontSize: '16px' }}>History</Link>
            <Link to="/profile" style={{ color: 'white', textDecoration: 'none', fontSize: '16px' }}>Profile</Link>
          </div>
        </div>
        <button
          onClick={handleLogout}
          style={{ backgroundColor: '#dc2626', color: 'white', border: 'none', padding: '6px 16px', borderRadius: '4px', cursor: 'pointer' }}
        >
          Logout
        </button>
      </div>
    </nav>
  );
}

export default Navbar;