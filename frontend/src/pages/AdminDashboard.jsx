import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { 
  FiUsers, 
  FiShield, 
  FiTrash2, 
  FiSearch, 
  FiActivity, 
  FiUserCheck, 
  FiSliders,
  FiMail,
  FiAlertCircle,
  FiCheck
} from 'react-icons/fi';
import { GiPill } from 'react-icons/gi';

const AdminDashboard = () => {
  const [users, setUsers] = useState([]);
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  const [loading, setLoading] = useState(true);
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [updatingUserId, setUpdatingUserId] = useState(null);

  const fetchUsers = async () => {
    try {
      const res = await api.get('/profile/all');
      setUsers(res.data);
    } catch (err) {
      console.error("Error fetching system users:", err);
      setErrorMsg("Failed to load global user management registry.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleRoleChange = async (userId, newRole) => {
    setUpdatingUserId(userId);
    setErrorMsg('');
    setSuccessMsg('');
    try {
      await api.patch(`/profile/${userId}/role?role_name=${newRole}`);
      setSuccessMsg(`User role updated to ${newRole} successfully.`);
      // Update local state
      setUsers(prev => prev.map(u => u.user_id === userId ? { ...u, role: newRole } : u));
      setTimeout(() => setSuccessMsg(''), 4000);
    } catch (err) {
      setErrorMsg("Failed to update user role.");
    } finally {
      setUpdatingUserId(null);
    }
  };

  const handleDeleteUser = async (userId, name) => {
    if (!window.confirm(`WARNING: Are you sure you want to permanently delete user "${name}"? All their medicines, schedules, and compliance logs will be lost.`)) {
      return;
    }
    setErrorMsg('');
    setSuccessMsg('');
    try {
      await api.delete(`/profile/${userId}`);
      setSuccessMsg(`User "${name}" has been deleted.`);
      setUsers(prev => prev.filter(u => u.user_id !== userId));
      setTimeout(() => setSuccessMsg(''), 4000);
    } catch (err) {
      setErrorMsg(err.response?.data?.detail || "Could not delete user.");
    }
  };

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-blue-600 border-t-transparent"></div>
      </div>
    );
  }

  // Calculate statistics
  const totalUsers = users.length;
  const patientsCount = users.filter(u => u.role === 'Patient').length;
  const caregiversCount = users.filter(u => u.role === 'Caregiver').length;
  const adminsCount = users.filter(u => u.role === 'Admin').length;

  // Filter users
  const filteredUsers = users.filter(u => {
    const matchesSearch = 
      (u.full_name || '').toLowerCase().includes(search.toLowerCase()) ||
      (u.email || '').toLowerCase().includes(search.toLowerCase());
    const matchesRole = roleFilter ? u.role === roleFilter : true;
    return matchesSearch && matchesRole;
  });

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white">Admin Control Panel</h1>
        <p className="text-sm text-slate-500 dark:text-slate-300 mt-1">Manage global PillSync accounts, audit user demographics, and configure system access roles.</p>
      </div>

      {/* KPI Stats Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-2xl border border-slate-100 bg-white p-6 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block">Total Registry</span>
            <p className="text-3xl font-extrabold text-slate-900 dark:text-white mt-1">{totalUsers}</p>
          </div>
          <div className="h-12 w-12 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center text-xl">
            <FiUsers />
          </div>
        </div>

        <div className="rounded-2xl border border-slate-100 bg-white p-6 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block">Active Patients</span>
            <p className="text-3xl font-extrabold text-slate-900 dark:text-white mt-1">{patientsCount}</p>
          </div>
          <div className="h-12 w-12 bg-teal-50 text-teal-600 rounded-xl flex items-center justify-center text-xl">
            <GiPill />
          </div>
        </div>

        <div className="rounded-2xl border border-slate-100 bg-white p-6 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block">Caregivers</span>
            <p className="text-3xl font-extrabold text-slate-900 dark:text-white mt-1">{caregiversCount}</p>
          </div>
          <div className="h-12 w-12 bg-indigo-50 text-indigo-600 rounded-xl flex items-center justify-center text-xl">
            <FiUserCheck />
          </div>
        </div>

        <div className="rounded-2xl border border-slate-100 bg-white p-6 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block">Administrators</span>
            <p className="text-3xl font-extrabold text-slate-900 dark:text-white mt-1">{adminsCount}</p>
          </div>
          <div className="h-12 w-12 bg-violet-50 text-violet-600 rounded-xl flex items-center justify-center text-xl">
            <FiShield />
          </div>
        </div>
      </div>

      {successMsg && (
        <div className="flex items-center gap-2 rounded-xl bg-emerald-50 p-4 text-sm text-emerald-700 border border-emerald-100">
          <FiCheck className="text-lg shrink-0" />
          <span>{successMsg}</span>
        </div>
      )}

      {errorMsg && (
        <div className="flex items-center gap-2 rounded-xl bg-rose-50 p-4 text-sm text-rose-600 border border-rose-100">
          <FiAlertCircle className="text-lg shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* Main Table Panel */}
      <div className="bg-white dark:bg-[#1E293B] border border-slate-200 dark:border-slate-700 rounded-2xl shadow-sm overflow-hidden space-y-4 p-6">
        {/* Table Filters */}
        <div className="flex flex-col md:flex-row gap-4 justify-between items-center pb-2">
          <div className="relative w-full md:max-w-md">
            <div className="absolute inset-y-0 left-0 flex items-center pl-3.5 text-slate-400">
              <FiSearch />
            </div>
            <input
              type="text"
              placeholder="Search users by name or email..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full rounded-xl border border-slate-200 py-2 pl-10 pr-4 text-sm outline-none focus:border-blue-500 transition-colors"
            />
          </div>

          <div className="w-full md:w-48">
            <select
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value)}
              className="w-full rounded-xl border border-slate-200 py-2 px-3 text-sm bg-white outline-none focus:border-blue-500 transition-colors cursor-pointer"
            >
              <option value="">All Roles</option>
              <option value="Patient">Patient</option>
              <option value="Caregiver">Caregiver</option>
              <option value="Admin">Admin</option>
            </select>
          </div>
        </div>

        {/* Users Table */}
        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-left text-sm text-slate-500">
            <thead className="bg-slate-50 text-xs font-semibold text-slate-400 uppercase tracking-wider">
              <tr>
                <th className="px-6 py-4">User Info</th>
                <th className="px-6 py-4">Clinical Profile Info</th>
                <th className="px-6 py-4">Completion</th>
                <th className="px-6 py-4">System Role</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 border-t border-slate-100">
              {filteredUsers.length === 0 ? (
                <tr>
                  <td colSpan="5" className="px-6 py-10 text-center text-slate-400 text-xs font-semibold">
                    No registry accounts found matching filters.
                  </td>
                </tr>
              ) : (
                filteredUsers.map((u) => (
                  <tr key={u.user_id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="px-6 py-4 flex items-center gap-3">
                      <div className="h-10 w-10 bg-slate-100 text-slate-600 rounded-xl flex items-center justify-center font-bold text-sm shrink-0 uppercase">
                        {u.full_name?.substring(0, 2) || "U"}
                      </div>
                      <div className="min-w-0">
                        <p className="font-bold text-slate-900 dark:text-white text-xs truncate">{u.full_name || "New Registry"}</p>
                        <p className="text-[10px] text-slate-400 flex items-center gap-1"><FiMail /> {u.email}</p>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-[11px] text-slate-600 space-y-0.5">
                        <p><span className="font-bold text-slate-700">Demog:</span> {u.age ? `${u.age} y/o` : '—'} • {u.gender || '—'} • Blood: {u.blood_group || '—'}</p>
                        <p><span className="font-bold text-slate-700">Medical:</span> {u.diseases || 'None'}</p>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <div className="w-16 bg-slate-100 h-2 rounded-full overflow-hidden shrink-0">
                          <div 
                            style={{ width: `${u.completion_percentage || 0}%` }}
                            className={`h-full ${
                              u.completion_percentage < 45 ? 'bg-rose-500' : u.completion_percentage < 80 ? 'bg-amber-400' : 'bg-emerald-500'
                            }`}
                          />
                        </div>
                        <span className="text-[10px] font-bold text-slate-600">{u.completion_percentage || 0}%</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <select
                        disabled={updatingUserId === u.user_id}
                        value={u.role || "Patient"}
                        onChange={(e) => handleRoleChange(u.user_id, e.target.value)}
                        className={`rounded-lg border border-slate-200 py-1 px-2.5 text-xs font-semibold outline-none cursor-pointer bg-white ${
                          u.role === 'Admin' ? 'text-violet-600 border-violet-100 bg-violet-50/50' : u.role === 'Caregiver' ? 'text-teal-600 border-teal-100 bg-teal-50/50' : 'text-slate-600'
                        }`}
                      >
                        <option value="Patient">Patient</option>
                        <option value="Caregiver">Caregiver</option>
                        <option value="Admin">Admin</option>
                      </select>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button
                        onClick={() => handleDeleteUser(u.user_id, u.full_name || u.email)}
                        className="h-8 w-8 rounded-lg bg-rose-50 text-rose-600 hover:bg-rose-100 flex items-center justify-center transition-colors cursor-pointer ml-auto"
                        title="Delete User permanently"
                      >
                        <FiTrash2 className="text-xs" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
