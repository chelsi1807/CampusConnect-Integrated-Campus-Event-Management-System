import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  CheckCircle2, 
  XCircle, 
  Calendar, 
  Clock, 
  MapPin, 
  User, 
  ArrowLeft, 
  AlertCircle,
  FileText
} from 'lucide-react';
import api from '../../api/client';
import confetti from 'canvas-confetti';

export default function EventApprovals() {
  const [pendingEvents, setPendingEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [rejectionModalEvent, setRejectionModalEvent] = useState(null);
  const [rejectionReason, setRejectionReason] = useState('');
  const [message, setMessage] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchPendingEvents();
  }, []);

  const fetchPendingEvents = async () => {
    try {
      setLoading(true);
      const res = await api.get('/events/admin/pending-approvals');
      setPendingEvents(res.data);
    } catch (e) {
      console.error("Failed to load pending events:", e);
      setError("Failed to load pending events queue.");
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (eventId, title) => {
    try {
      setActionLoading(true);
      setError(null);
      setMessage(null);
      await api.post(`/events/${eventId}/review`, { status: 'approved' });
      confetti({ particleCount: 60, spread: 60, origin: { y: 0.6 } });
      setMessage(`Event "${title}" approved and published to the student catalog!`);
      await fetchPendingEvents();
    } catch (err) {
      setError(err.response?.data?.detail || "Failed to approve event.");
    } finally {
      setActionLoading(false);
    }
  };

  const handleRejectSubmit = async (e) => {
    e.preventDefault();
    if (!rejectionReason.trim()) {
      alert("Please enter a reason for rejecting the event.");
      return;
    }

    try {
      setActionLoading(true);
      setError(null);
      setMessage(null);
      await api.post(`/events/${rejectionModalEvent.id}/review`, {
        status: 'rejected',
        rejection_reason: rejectionReason.trim()
      });
      setMessage(`Event "${rejectionModalEvent.title}" rejected and feedback returned to organizer.`);
      setRejectionModalEvent(null);
      setRejectionReason('');
      await fetchPendingEvents();
    } catch (err) {
      setError(err.response?.data?.detail || "Failed to reject event.");
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      <div>
        <Link
          to="/admin"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-indigo-600 transition-colors mb-2"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to Admin Dashboard</span>
        </Link>
        <h1 className="text-2xl font-bold text-slate-900">Event Approval Review Queue</h1>
        <p className="text-xs text-slate-500 mt-0.5">
          Review pending event submissions from organizers before making them visible to students.
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

      {loading ? (
        <div className="space-y-4">
          {[1, 2].map(i => (
            <div key={i} className="h-48 bg-slate-100 rounded-3xl animate-pulse"></div>
          ))}
        </div>
      ) : pendingEvents.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-3xl border border-slate-200 p-8 shadow-xs">
          <CheckCircle2 className="w-12 h-12 text-emerald-500 mx-auto mb-3" />
          <h3 className="text-base font-bold text-slate-800">All submissions reviewed</h3>
          <p className="text-xs text-slate-500 mt-1">
            There are currently no events pending administrative approval in the queue.
          </p>
        </div>
      ) : (
        <div className="space-y-6">
          {pendingEvents.map((evt) => (
            <div
              key={evt.id}
              className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden flex flex-col md:flex-row"
            >
              {/* Event thumbnail */}
              <div className="md:w-64 h-48 md:h-auto bg-slate-900 relative shrink-0">
                <img
                  src={evt.banner_url || 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=600&auto=format&fit=crop&q=80'}
                  alt={evt.title}
                  className="w-full h-full object-cover opacity-80"
                />
                {evt.category && (
                  <span className="absolute top-3 left-3 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-white/90 text-slate-900">
                    {evt.category.name}
                  </span>
                )}
              </div>

              {/* Event Content & Action */}
              <div className="p-6 flex-1 flex flex-col justify-between space-y-4">
                <div className="space-y-2">
                  <h3 className="text-lg font-bold text-slate-900">{evt.title}</h3>
                  <p className="text-xs text-slate-600 leading-relaxed line-clamp-3">
                    {evt.description}
                  </p>

                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-xs text-slate-500 pt-2">
                    <span>📅 {evt.date}</span>
                    <span>⏰ {evt.start_time} - {evt.end_time}</span>
                    <span>📍 {evt.venue}</span>
                    <span>👥 Capacity: <b>{evt.capacity} seats</b></span>
                    <span>⏳ Waitlist: <b>{evt.waitlist_capacity} max</b></span>
                    <span>👤 By: <b>{evt.organizer?.full_name || 'Organizer'}</b></span>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                  <button
                    onClick={() => {
                      setRejectionModalEvent(evt);
                      setRejectionReason('');
                    }}
                    disabled={actionLoading}
                    className="px-4 py-2 rounded-xl text-xs font-semibold text-rose-700 bg-rose-50 hover:bg-rose-100 flex items-center gap-1.5 transition-colors"
                  >
                    <XCircle className="w-3.5 h-3.5" />
                    <span>Reject with Reason</span>
                  </button>

                  <button
                    onClick={() => handleApprove(evt.id, evt.title)}
                    disabled={actionLoading}
                    className="px-5 py-2 rounded-xl text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 shadow-sm flex items-center gap-1.5 transition-all"
                  >
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>Approve & Publish</span>
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Rejection Modal */}
      {rejectionModalEvent && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl space-y-4 animate-in fade-in zoom-in-95">
            <h3 className="text-base font-bold text-slate-900">
              Reject Event Submission
            </h3>
            <p className="text-xs text-slate-500">
              Provide constructive feedback to the organizer explaining why <b>"{rejectionModalEvent.title}"</b> was returned or rejected.
            </p>

            <form onSubmit={handleRejectSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Rejection Reason *
                </label>
                <textarea
                  rows={4}
                  required
                  value={rejectionReason}
                  onChange={(e) => setRejectionReason(e.target.value)}
                  placeholder="e.g. Auditorium is already booked for another department meeting on this date, or additional safety clearance required..."
                  className="w-full text-xs p-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-rose-500/20"
                ></textarea>
              </div>

              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setRejectionModalEvent(null)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold bg-slate-100 hover:bg-slate-200 text-slate-700"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={actionLoading}
                  className="px-5 py-2 rounded-xl text-xs font-bold bg-rose-600 hover:bg-rose-700 text-white shadow-sm"
                >
                  Confirm Rejection
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
