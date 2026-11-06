import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { 
  Users, 
  CheckCircle2, 
  Clock, 
  QrCode, 
  Award, 
  ArrowLeft, 
  Download, 
  AlertCircle,
  Search,
  Check
} from 'lucide-react';
import api from '../../api/client';
import StatusBadge from '../../components/StatusBadge';
import confetti from 'canvas-confetti';

export default function EventAttendees() {
  const { eventId } = useParams();
  const [event, setEvent] = useState(null);
  const [registrations, setRegistrations] = useState([]);
  const [stats, setStats] = useState(null);
  const [filter, setFilter] = useState('all');
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [batchLoading, setBatchLoading] = useState(false);
  const [manualLoading, setManualLoading] = useState(false);
  const [message, setMessage] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchAttendeesData();
  }, [eventId]);

  const fetchAttendeesData = async () => {
    try {
      setLoading(true);
      const [evRes, regsRes, statsRes] = await Promise.all([
        api.get(`/events/${eventId}`),
        api.get(`/registrations/event/${eventId}`),
        api.get(`/attendance/event/${eventId}/stats`)
      ]);
      setEvent(evRes.data);
      setRegistrations(regsRes.data || []);
      setStats(statsRes.data);
    } catch (e) {
      console.error("Failed to load attendees:", e);
      setError("Failed to load attendee records.");
    } finally {
      setLoading(false);
    }
  };

  const handleManualCheckIn = async (registrationCode) => {
    try {
      setManualLoading(true);
      setError(null);
      setMessage(null);
      await api.post('/attendance/check-in', {
        registration_code: registrationCode,
        event_id: parseInt(eventId),
        check_in_method: 'manual'
      });
      setMessage("Participant attendance checked in manually.");
      await fetchAttendeesData();
    } catch (err) {
      setError(err.response?.data?.detail || "Manual check-in failed.");
    } finally {
      setManualLoading(false);
    }
  };

  const handleBatchGenerateCertificates = async () => {
    if (!window.confirm("Generate and issue digital certificates to all verified attendees for this event?")) return;

    try {
      setBatchLoading(true);
      setError(null);
      setMessage(null);
      const res = await api.post(`/certificates/batch-generate/${eventId}`);
      confetti({ particleCount: 75, spread: 70, origin: { y: 0.6 } });
      setMessage(`Successfully generated ${res.data.length} official certificates!`);
      await fetchAttendeesData();
    } catch (err) {
      setError(err.response?.data?.detail || "Batch certificate generation failed.");
    } finally {
      setBatchLoading(false);
    }
  };

  const filtered = registrations.filter((r) => {
    if (filter !== 'all' && r.status !== filter) return false;
    if (search) {
      const q = search.toLowerCase();
      const name = r.user?.full_name?.toLowerCase() || '';
      const email = r.user?.email?.toLowerCase() || '';
      const code = r.registration_code?.toLowerCase() || '';
      const sId = r.user?.student_id?.toLowerCase() || '';
      return name.includes(q) || email.includes(q) || code.includes(q) || sId.includes(q);
    }
    return true;
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      
      {/* Header */}
      <div>
        <Link
          to="/organizer/events"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-indigo-600 transition-colors mb-2"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to Manage Events</span>
        </Link>
        <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">
              {event?.title || 'Event'} — Attendees & Check-ins
            </h1>
            <p className="text-xs text-slate-500 mt-0.5">
              📅 {event?.date} • 📍 {event?.venue} • Capacity: {event?.capacity}
            </p>
          </div>

          <div className="flex gap-2.5">
            <Link
              to={`/organizer/scanner?event_id=${eventId}`}
              className="px-4 py-2 rounded-xl text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm flex items-center gap-1.5 transition-all"
            >
              <QrCode className="w-4 h-4" />
              <span>Launch QR Scanner</span>
            </Link>

            <button
              onClick={handleBatchGenerateCertificates}
              disabled={batchLoading}
              className="px-4 py-2 rounded-xl text-xs font-bold bg-indigo-600 hover:bg-indigo-700 text-white shadow-sm flex items-center gap-1.5 transition-all disabled:opacity-50"
            >
              <Award className="w-4 h-4 text-amber-300" />
              <span>{batchLoading ? 'Generating...' : 'Batch Issue Certificates'}</span>
            </button>
          </div>
        </div>
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

      {/* Stats Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-white rounded-2xl border border-slate-200 p-4">
          <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">Confirmed Registrations</span>
          <span className="text-xl font-bold text-slate-900 mt-1 block">{stats?.confirmed_registrations || 0}</span>
        </div>
        <div className="bg-white rounded-2xl border border-slate-200 p-4">
          <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">Checked In (Attended)</span>
          <span className="text-xl font-bold text-emerald-700 mt-1 block">{stats?.total_checked_in || 0}</span>
        </div>
        <div className="bg-white rounded-2xl border border-slate-200 p-4">
          <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">Attendance Rate</span>
          <span className="text-xl font-bold text-indigo-700 mt-1 block">{stats?.attendance_rate || 0}%</span>
        </div>
        <div className="bg-white rounded-2xl border border-slate-200 p-4">
          <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">Active Waitlist</span>
          <span className="text-xl font-bold text-amber-700 mt-1 block">{stats?.waitlist_count || 0}</span>
        </div>
      </div>

      {/* Table & Controls */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden space-y-4 p-5">
        
        {/* Filters and Search */}
        <div className="flex flex-col sm:flex-row justify-between items-center gap-3">
          <div className="flex gap-1.5 overflow-x-auto w-full sm:w-auto">
            {['all', 'confirmed', 'attended', 'waitlisted'].map((tab) => (
              <button
                key={tab}
                onClick={() => setFilter(tab)}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold capitalize transition-all whitespace-nowrap ${
                  filter === tab ? 'bg-indigo-600 text-white shadow-xs' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {tab}
              </button>
            ))}
          </div>

          <div className="relative w-full sm:w-64">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search attendee name, ID..."
              className="w-full text-xs pl-8 pr-3 py-1.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
            />
          </div>
        </div>

        {/* Attendees Table */}
        <div className="overflow-x-auto border-t border-slate-100">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-400 uppercase font-semibold text-[10px] tracking-wider border-b border-slate-100">
              <tr>
                <th className="px-4 py-3">Participant</th>
                <th className="px-4 py-3">Pass Identifier</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Department</th>
                <th className="px-4 py-3 text-right">Attendance Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-4 py-8 text-center text-slate-400">
                    No participants found matching this filter.
                  </td>
                </tr>
              ) : (
                filtered.map((r) => (
                  <tr key={r.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="px-4 py-3.5">
                      <div className="font-bold text-slate-900">{r.user?.full_name}</div>
                      <div className="text-[11px] text-slate-400">{r.user?.email}</div>
                    </td>

                    <td className="px-4 py-3.5 font-mono text-slate-600">
                      {r.registration_code}
                    </td>

                    <td className="px-4 py-3.5">
                      <StatusBadge status={r.status} position={r.waitlist_position} size="sm" />
                    </td>

                    <td className="px-4 py-3.5 text-slate-600">
                      {r.user?.department || '—'}
                      {r.user?.student_id && <span className="text-slate-400 text-[10px] block">ID: {r.user.student_id}</span>}
                    </td>

                    <td className="px-4 py-3.5 text-right">
                      {r.status === 'attended' ? (
                        <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-lg">
                          <Check className="w-3.5 h-3.5" /> Checked In
                        </span>
                      ) : r.status === 'confirmed' ? (
                        <button
                          onClick={() => handleManualCheckIn(r.registration_code)}
                          disabled={manualLoading}
                          className="px-3 py-1 rounded-lg text-[11px] font-semibold bg-indigo-50 hover:bg-indigo-100 text-indigo-700 transition-colors"
                        >
                          Manual Check-In
                        </button>
                      ) : (
                        <span className="text-[11px] text-slate-400 italic">Waitlisted</span>
                      )}
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
}
