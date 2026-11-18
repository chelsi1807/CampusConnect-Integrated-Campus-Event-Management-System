import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Calendar,
  PlusCircle,
  QrCode,
  Users,
  Award,
  Star,
  ArrowRight,
  Clock,
  CheckCircle2,
  Layers,
  FileText
} from 'lucide-react';
import api from '../../api/client';
import { useAuth } from '../../context/AuthContext';
import StatusBadge from '../../components/StatusBadge';

export default function OrganizerDashboard() {
  const { user } = useAuth();
  const [analytics, setAnalytics] = useState(null);
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const [analyticsRes, eventsRes] = await Promise.all([
        api.get('/analytics/organizer'),
        api.get('/events/organizer/my-events')
      ]);
      setAnalytics(analyticsRes.data);
      setEvents(eventsRes.data || []);
    } catch (e) {
      console.error("Failed to load organizer dashboard data:", e);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">

      {/* Header */}
      <div className="bg-gradient-to-r from-blue-800 via-indigo-900 to-slate-900 rounded-3xl p-6 sm:p-8 text-white flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6 shadow-md border border-slate-800">
        <div>
          <span className="text-xs font-semibold text-blue-300 uppercase tracking-wider">Organizer Portal</span>
          <h1 className="text-2xl sm:text-3xl font-extrabold mt-1">
            {user?.full_name}
          </h1>
          <p className="text-xs sm:text-sm text-indigo-100/80 mt-1">
            {user?.department || 'Department Organizer'} • Event Coordinator
          </p>
        </div>

        <div className="flex gap-2.5">
          <Link
            to="/organizer/create-event"
            className="px-4 py-2.5 rounded-xl text-xs font-bold bg-white text-indigo-900 hover:bg-indigo-50 shadow-sm flex items-center gap-1.5 transition-all"
          >
            <PlusCircle className="w-4 h-4 text-indigo-600" />
            <span>Create New Event</span>
          </Link>
          <Link
            to="/organizer/scanner"
            className="px-4 py-2.5 rounded-xl text-xs font-semibold bg-emerald-500 hover:bg-emerald-600 text-white shadow-sm flex items-center gap-1.5 transition-all"
          >
            <QrCode className="w-4 h-4" />
            <span>QR Check-in Scanner</span>
          </Link>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 p-5 shadow-xs transition-colors">
          <div className="flex justify-between items-center text-slate-400 dark:text-slate-500 mb-2">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">Total Events</span>
            <div className="w-8 h-8 rounded-lg bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
              <Calendar className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-extrabold text-slate-900 dark:text-white">{analytics?.total_events || 0}</div>
          <div className="text-[11px] text-slate-400 dark:text-slate-500 mt-1">{analytics?.active_events || 0} currently active</div>
        </div>

        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 p-5 shadow-xs transition-colors">
          <div className="flex justify-between items-center text-slate-400 dark:text-slate-500 mb-2">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">Total Registrations</span>
            <div className="w-8 h-8 rounded-lg bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 flex items-center justify-center">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-extrabold text-slate-900 dark:text-white">{analytics?.total_registrations || 0}</div>
          <div className="text-[11px] text-slate-400 dark:text-slate-500 mt-1">Confirmed participants</div>
        </div>

        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 p-5 shadow-xs transition-colors">
          <div className="flex justify-between items-center text-slate-400 dark:text-slate-500 mb-2">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">Attendance Rate</span>
            <div className="w-8 h-8 rounded-lg bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-extrabold text-emerald-700 dark:text-emerald-400">{analytics?.overall_attendance_rate || 0}%</div>
          <div className="text-[11px] text-slate-400 dark:text-slate-500 mt-1">{analytics?.total_attendees || 0} verified check-ins</div>
        </div>

        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 p-5 shadow-xs transition-colors">
          <div className="flex justify-between items-center text-slate-400 dark:text-slate-500 mb-2">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">Feedback Rating</span>
            <div className="w-8 h-8 rounded-lg bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 flex items-center justify-center">
              <Star className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-extrabold text-amber-600 dark:text-amber-400">{analytics?.average_feedback_rating || 0} / 5</div>
          <div className="text-[11px] text-slate-400 dark:text-slate-500 mt-1">Student satisfaction score</div>
        </div>
      </div>

      {/* Events Table / Overview */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden transition-colors">
        <div className="p-5 sm:p-6 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center">
          <div>
            <h2 className="text-base font-bold text-slate-900 dark:text-white">Events Management Overview</h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">Manage event approvals, monitor registrations, and launch QR scanner</p>
          </div>
          <Link
            to="/organizer/events"
            className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:text-indigo-800 dark:hover:text-indigo-300"
          >
            Manage All Events
          </Link>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 dark:bg-slate-800/60 border-b border-slate-100 dark:border-slate-800 text-slate-400 dark:text-slate-500 uppercase font-semibold text-[10px] tracking-wider">
              <tr>
                <th className="px-6 py-3">Event Title</th>
                <th className="px-6 py-3">Date</th>
                <th className="px-6 py-3">Status</th>
                <th className="px-6 py-3">Capacity & Occupancy</th>
                <th className="px-6 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {events.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-10 text-center text-slate-400 dark:text-slate-500">
                    No events created yet. Click "Create New Event" to get started.
                  </td>
                </tr>
              ) : (
                events.map((evt) => {
                  const confirmed = evt.confirmed_count || 0;
                  const capacity = evt.capacity || 1;
                  const occupancy = Math.min(100, Math.round((confirmed / capacity) * 100));

                  return (
                    <tr key={evt.id} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/50 transition-colors">
                      <td className="px-6 py-4">
                        <Link to={`/events/${evt.id}`} className="font-bold text-slate-900 dark:text-white hover:text-indigo-600 dark:hover:text-indigo-400 block">
                          {evt.title}
                        </Link>
                        <span className="text-[11px] text-slate-400 dark:text-slate-500">{evt.venue}</span>
                      </td>

                      <td className="px-6 py-4 text-slate-600 dark:text-slate-300 whitespace-nowrap">
                        {evt.date}
                      </td>

                      <td className="px-6 py-4 whitespace-nowrap">
                        <StatusBadge status={evt.status} size="sm" />
                        {evt.status === 'rejected' && evt.rejection_reason && (
                          <div className="text-[10px] text-rose-600 dark:text-rose-400 mt-1 max-w-xs truncate" title={evt.rejection_reason}>
                            Reason: {evt.rejection_reason}
                          </div>
                        )}
                      </td>

                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="w-32 space-y-1">
                          <div className="flex justify-between text-[10px] font-semibold text-slate-600 dark:text-slate-300">
                            <span>{confirmed} / {capacity}</span>
                            <span>{occupancy}%</span>
                          </div>
                          <div className="w-full h-1.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                            <div
                              className={`h-full rounded-full ${occupancy >= 100 ? 'bg-amber-500' : 'bg-indigo-600'}`}
                              style={{ width: `${occupancy}%` }}
                            ></div>
                          </div>
                        </div>
                      </td>

                      <td className="px-6 py-4 text-right whitespace-nowrap space-x-2">
                        <Link
                          to={`/organizer/attendees/${evt.id}`}
                          className="px-3 py-1.5 rounded-lg text-[11px] font-semibold bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 hover:bg-indigo-100 dark:hover:bg-indigo-900/60 transition-colors inline-block"
                        >
                          Attendees
                        </Link>
                        {evt.status === 'approved' && (
                          <Link
                            to={`/organizer/scanner?event_id=${evt.id}`}
                            className="px-3 py-1.5 rounded-lg text-[11px] font-semibold bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 hover:bg-emerald-100 dark:hover:bg-emerald-900/60 transition-colors inline-block"
                          >
                            Scan QR
                          </Link>
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
