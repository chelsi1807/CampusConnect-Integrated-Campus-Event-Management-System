import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  Users, 
  Search, 
  ShieldCheck, 
  UserCheck, 
  UserX, 
  ArrowLeft, 
  AlertCircle, 
  CheckCircle2,
  Filter
} from 'lucide-react';
import api from '../../api/client';
import { useAuth } from '../../context/AuthContext';

export default function ManageUsers() {
  const { user: currentAdmin } = useAuth();
  const [users, setUsers] = useState([]);
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [message, setMessage] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchUsers();
  }, [roleFilter]);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (roleFilter) params.append('role', roleFilter);
      if (search) params.append('search', search);

      const res = await api.get(`/users/?${params.toString()}`);
      setUsers(res.data);
    } catch (e) {
      console.error("Failed to load users:", e);
      setError("Failed to load user accounts.");
    } finally {
      setLoading(false);
    }
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchUsers();
  };

  const handleToggleStatus = async (userId, currentStatus, name) => {
    if (userId === currentAdmin.id) {
      alert("You cannot suspend your own administrative account.");
      return;
    }

    const action = currentStatus ? "suspend/deactivate" : "activate";
    if (!window.confirm(`Are you sure you want to ${action} user "${name}"?`)) return;

    try {
      setActionLoading(true);
      setError(null);
      setMessage(null);
      await api.put(`/users/${userId}/status?is_active=${!currentStatus}`);
      setMessage(`User "${name}" has been ${currentStatus ? 'suspended' : 'activated'}.`);
      await fetchUsers();
    } catch (err) {
      setError(err.response?.data?.detail || "Failed to update account status.");
    } finally {
      setActionLoading(false);
    }
  };

  const handleChangeRole = async (userId, newRole, name) => {
    if (!window.confirm(`Change role for "${name}" to ${newRole.toUpperCase()}?`)) return;

    try {
      setActionLoading(true);
      setError(null);
      setMessage(null);
      await api.put(`/users/${userId}/role?role=${newRole}`);
      setMessage(`Role for "${name}" updated to ${newRole.toUpperCase()}.`);
      await fetchUsers();
    } catch (err) {
      setError(err.response?.data?.detail || "Failed to change user role.");
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      <div>
        <Link
          to="/admin"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-indigo-600 transition-colors mb-2"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to Admin Dashboard</span>
        </Link>
        <h1 className="text-2xl font-bold text-slate-900">Manage Campus User Accounts</h1>
        <p className="text-xs text-slate-500 mt-0.5">
          View registered students, event organizers, assign roles, and manage account statuses.
        </p>
      </div>

      {message && (
        <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{message}</span>
        </div>
      )}

      {error && (
        <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center gap-2">
          <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Filter and Search Bar */}
      <div className="bg-white rounded-3xl border border-slate-200 p-4 sm:p-5 shadow-xs flex flex-col sm:flex-row justify-between items-center gap-3">
        <form onSubmit={handleSearchSubmit} className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by name, email, department..."
            className="w-full text-xs pl-10 pr-3 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
          />
        </form>

        <div className="flex gap-2 w-full sm:w-auto">
          <select
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
            className="text-xs px-3 py-2.5 rounded-xl border border-slate-200 bg-white font-medium text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
          >
            <option value="">All Roles</option>
            <option value="student">Students</option>
            <option value="organizer">Organizers</option>
            <option value="admin">Administrators</option>
          </select>

          <button
            onClick={fetchUsers}
            className="px-4 py-2.5 text-xs font-semibold rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors"
          >
            Refresh
          </button>
        </div>
      </div>

      {/* Users Table */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 border-b border-slate-100 text-slate-400 uppercase font-semibold text-[10px] tracking-wider">
              <tr>
                <th className="px-6 py-3.5">User</th>
                <th className="px-6 py-3.5">Department & ID</th>
                <th className="px-6 py-3.5">Role</th>
                <th className="px-6 py-3.5">Account Status</th>
                <th className="px-6 py-3.5 text-right">Administrative Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-slate-400">
                    Loading user accounts...
                  </td>
                </tr>
              ) : users.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-slate-400">
                    No users found matching query.
                  </td>
                </tr>
              ) : (
                users.map((u) => {
                  const roleColors = {
                    admin: 'bg-purple-50 text-purple-700 border-purple-200',
                    organizer: 'bg-blue-50 text-blue-700 border-blue-200',
                    student: 'bg-emerald-50 text-emerald-700 border-emerald-200',
                  }[u.role] || 'bg-slate-100 text-slate-600';

                  return (
                    <tr key={u.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <img
                            src={u.avatar_url || `https://api.dicebear.com/7.x/initials/svg?seed=${u.full_name}`}
                            alt={u.full_name}
                            className="w-8 h-8 rounded-lg object-cover ring-1 ring-slate-200"
                          />
                          <div>
                            <span className="font-bold text-slate-900 block">{u.full_name}</span>
                            <span className="text-[11px] text-slate-400">{u.email}</span>
                          </div>
                        </div>
                      </td>

                      <td className="px-6 py-4 text-slate-600">
                        <span>{u.department || '—'}</span>
                        {u.student_id && (
                          <span className="text-slate-400 text-[10px] block font-mono">ID: {u.student_id}</span>
                        )}
                      </td>

                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold uppercase border ${roleColors}`}>
                          {u.role}
                        </span>
                      </td>

                      <td className="px-6 py-4 whitespace-nowrap">
                        {u.is_active ? (
                          <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                            Active
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-rose-700 bg-rose-50 px-2 py-0.5 rounded-full border border-rose-200">
                            Suspended
                          </span>
                        )}
                      </td>

                      <td className="px-6 py-4 text-right whitespace-nowrap space-x-2">
                        {/* Change Role Selector */}
                        <select
                          value={u.role}
                          onChange={(e) => handleChangeRole(u.id, e.target.value, u.full_name)}
                          disabled={actionLoading || u.id === currentAdmin.id}
                          className="text-[11px] px-2 py-1 rounded-lg border border-slate-200 bg-white"
                        >
                          <option value="student">Student</option>
                          <option value="organizer">Organizer</option>
                          <option value="admin">Admin</option>
                        </select>

                        {/* Toggle Active Status */}
                        {u.id !== currentAdmin.id && (
                          <button
                            onClick={() => handleToggleStatus(u.id, u.is_active, u.full_name)}
                            disabled={actionLoading}
                            className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold transition-colors ${
                              u.is_active
                                ? 'bg-rose-50 text-rose-700 hover:bg-rose-100'
                                : 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100'
                            }`}
                          >
                            {u.is_active ? 'Suspend' : 'Activate'}
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
}
