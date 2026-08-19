import { useState, useEffect } from 'react';
import axios from 'axios';

function Settings() {
  const [user, setUser] = useState({ name: '', email: '' });
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    const token = localStorage.getItem('token');
    try {
      const response = await axios.get('http://127.0.0.1:5000/api/profile', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      setUser(response.data.user);
      setLoading(false);
    } catch (error) {
      console.error(error);
      setLoading(false);
    }
  };

  if (loading) return <div className="text-center py-10">Loading...</div>;

  return (
    <div className="max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">⚙️ Settings</h1>

      <div className="bg-white rounded-xl shadow p-6 space-y-4">
        <div>
          <h2 className="text-lg font-semibold mb-4">Profile Information</h2>
          <p><strong>Name:</strong> {user.name}</p>
          <p><strong>Email:</strong> {user.email}</p>
        </div>

        <div className="border-t pt-4">
          <h2 className="text-lg font-semibold mb-4">Change Password</h2>
          <input
            type="password"
            placeholder="Current Password"
            className="w-full px-3 py-2 border rounded-lg mb-2"
          />
          <input
            type="password"
            placeholder="New Password"
            className="w-full px-3 py-2 border rounded-lg mb-2"
          />
          <input
            type="password"
            placeholder="Confirm New Password"
            className="w-full px-3 py-2 border rounded-lg mb-2"
          />
          <button className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600">
            Update Password
          </button>
        </div>

        <div className="border-t pt-4">
          <h2 className="text-lg font-semibold mb-4">Notifications</h2>
          <label className="flex items-center gap-2">
            <input type="checkbox" defaultChecked /> Email Reminders
          </label>
          <label className="flex items-center gap-2">
            <input type="checkbox" defaultChecked /> Refill Alerts
          </label>
        </div>
      </div>
    </div>
  );
}

export default Settings;