import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  Users, 
  Calendar, 
  Award, 
  Clock, 
  CheckCircle2, 
  ShieldCheck, 
  ArrowRight, 
  Layers, 
  AlertTriangle,
  FolderKanban
} from 'lucide-react';
import { 
  ResponsiveContainer, 
  PieChart, 
  Pie, 
  Cell, 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  Tooltip, 
  Legend 
} from 'recharts';
import api from '../../api/client';
import { useAuth } from '../../context/AuthContext';

export default function AdminDashboard() {
  const { user } = useAuth();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAdminAnalytics();
  }, []);

  const fetchAdminAnalytics = async () => {
    try {
      setLoading(true);
      const res = await api.get('/analytics/admin');
      setData(res.data);
    } catch (e) {
      console.error("Failed to load admin analytics:", e);
    } finally {
      setLoading(false);
    }
  };

  const CATEGORY_COLORS = ['#3B82F6', '#6366F1', '#10B981', '#F59E0B', '#8B5CF6', '#EC4899'];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      
      {/* Header */}
      <div className="bg-gradient-to-r from-purple-900 via-indigo-900 to-slate-900 rounded-3xl p-6 sm:p-8 text-white flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6 shadow-md">
        <div>
          <span className="text-xs font-semibold text-purple-300 uppercase tracking-wider">Administration Portal</span>
          <h1 className="text-2xl sm:text-3xl font-extrabold mt-1">
            System Executive Dashboard
          </h1>
          <p className="text-xs sm:text-sm text-indigo-100/80 mt-1">
            Platform-wide governance, event approvals, user oversight, and institutional analytics.
          </p>
        </div>

        <div className="flex flex-wrap gap-2.5">
          <Link
            to="/admin/approvals"
            className="px-4 py-2.5 rounded-xl text-xs font-bold bg-amber-400 hover:bg-amber-300 text-slate-950 shadow-sm flex items-center gap-1.5 transition-all"
          >
            <Clock className="w-4 h-4" />
            <span>Pending Approvals ({data?.pending_approvals || 0})</span>
          </Link>
          <Link
            to="/admin/users"
            className="px-4 py-2.5 rounded-xl text-xs font-semibold bg-white/10 hover:bg-white/20 text-white border border-white/20 transition-all"
          >
            Manage Accounts
          </Link>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs">
          <div className="flex justify-between items-center text-slate-400 mb-2">
            <span className="text-xs font-semibold text-slate-500">Total Users</span>
            <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-extrabold text-slate-900">{data?.total_users || 0}</div>
          <div className="text-[11px] text-slate-400 mt-1">
            {data?.total_students || 0} students • {data?.total_organizers || 0} organizers
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs">
          <div className="flex justify-between items-center text-slate-400 mb-2">
            <span className="text-xs font-semibold text-slate-500">Events Catalog</span>
            <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
              <Calendar className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-extrabold text-slate-900">{data?.total_events || 0}</div>
          <div className="text-[11px] text-emerald-600 mt-1 font-medium">
            {data?.approved_events || 0} approved & active
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs">
          <div className="flex justify-between items-center text-slate-400 mb-2">
            <span className="text-xs font-semibold text-slate-500">Total Registrations</span>
            <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-extrabold text-slate-900">{data?.total_registrations || 0}</div>
          <div className="text-[11px] text-slate-400 mt-1">
            {data?.total_attendance || 0} check-ins recorded
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs">
          <div className="flex justify-between items-center text-slate-400 mb-2">
            <span className="text-xs font-semibold text-slate-500">Verified Certificates</span>
            <div className="w-8 h-8 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center">
              <Award className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-extrabold text-amber-600">{data?.total_certificates || 0}</div>
          <div className="text-[11px] text-slate-400 mt-1">Issued with cryptographic ID</div>
        </div>
      </div>

      {/* Pending Approvals Notice Banner */}
      {data && data.pending_approvals > 0 && (
        <div className="bg-amber-50 border border-amber-200 rounded-3xl p-5 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-amber-100 text-amber-700 flex items-center justify-center shrink-0">
              <AlertTriangle className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-amber-950">
                {data.pending_approvals} Event Proposal{data.pending_approvals > 1 ? 's' : ''} Awaiting Administrative Review
              </h3>
              <p className="text-xs text-amber-800">
                Review organizer submissions to approve or reject with reasons.
              </p>
            </div>
          </div>

          <Link
            to="/admin/approvals"
            className="px-4 py-2 rounded-xl text-xs font-bold bg-amber-600 hover:bg-amber-700 text-white shadow-xs transition-all shrink-0"
          >
            Review Queue
          </Link>
        </div>
      )}

      {/* Recharts Data Visualizations */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Monthly Trend Area Chart */}
        <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-xs space-y-4">
          <div>
            <h3 className="text-sm font-bold text-slate-900">Registration & Attendance Trends</h3>
            <p className="text-xs text-slate-400">Monthly student participation activity</p>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={data?.monthly_registrations || []} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorReg" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#4F46E5" stopOpacity={0.4}/>
                    <stop offset="95%" stopColor="#4F46E5" stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="colorAtt" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10B981" stopOpacity={0.4}/>
                    <stop offset="95%" stopColor="#10B981" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <XAxis dataKey="month" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} />
                <Tooltip />
                <Legend iconType="circle" wrapperStyle={{ fontSize: 11 }} />
                <Area type="monotone" dataKey="registrations" stroke="#4F46E5" fillOpacity={1} fill="url(#colorReg)" name="Registrations" />
                <Area type="monotone" dataKey="attendance" stroke="#10B981" fillOpacity={1} fill="url(#colorAtt)" name="Attendance" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Events by Category Distribution Pie Chart */}
        <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-xs space-y-4">
          <div>
            <h3 className="text-sm font-bold text-slate-900">Events by Category</h3>
            <p className="text-xs text-slate-400">Distribution across campus domains</p>
          </div>

          <div className="h-64 w-full flex items-center justify-center">
            {data?.events_by_category?.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={data.events_by_category}
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={80}
                    paddingAngle={4}
                    dataKey="count"
                    nameKey="name"
                  >
                    {data.events_by_category.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={CATEGORY_COLORS[index % CATEGORY_COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend wrapperStyle={{ fontSize: 11 }} />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <span className="text-xs text-slate-400">No category event data</span>
            )}
          </div>
        </div>
      </div>

      {/* Admin Module Shortcuts */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Link
          to="/admin/approvals"
          className="p-5 rounded-3xl bg-white border border-slate-200 hover:border-indigo-300 hover:shadow-md transition-all flex items-center justify-between group"
        >
          <div>
            <div className="text-xs font-bold text-slate-900 group-hover:text-indigo-600 transition-colors">
              Event Review Queue
            </div>
            <div className="text-[11px] text-slate-400 mt-0.5">Approve or reject submitted events</div>
          </div>
          <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-indigo-600 transition-colors" />
        </Link>

        <Link
          to="/admin/users"
          className="p-5 rounded-3xl bg-white border border-slate-200 hover:border-indigo-300 hover:shadow-md transition-all flex items-center justify-between group"
        >
          <div>
            <div className="text-xs font-bold text-slate-900 group-hover:text-indigo-600 transition-colors">
              User Accounts
            </div>
            <div className="text-[11px] text-slate-400 mt-0.5">Manage students, organizers & roles</div>
          </div>
          <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-indigo-600 transition-colors" />
        </Link>

        <Link
          to="/admin/categories"
          className="p-5 rounded-3xl bg-white border border-slate-200 hover:border-indigo-300 hover:shadow-md transition-all flex items-center justify-between group"
        >
          <div>
            <div className="text-xs font-bold text-slate-900 group-hover:text-indigo-600 transition-colors">
              Manage Categories
            </div>
            <div className="text-[11px] text-slate-400 mt-0.5">Configure event taxonomies & icons</div>
          </div>
          <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-indigo-600 transition-colors" />
        </Link>
      </div>

    </div>
  );
}
