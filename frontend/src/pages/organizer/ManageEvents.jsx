import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Calendar, PlusCircle, Users, QrCode, CheckCircle2, AlertCircle, Award, MoreVertical } from 'lucide-react';
import api from '../../api/client';
import StatusBadge from '../../components/StatusBadge';

export default function ManageEvents() {
  const [events, setEvents] = useState([]);
  const [filter, setFilter] = useState('all');
  const [loading, setLoading] = useState(true);
  const [statusActionLoading, setStatusActionLoading] = useState(false);

  useEffect(() => {
    fetchEvents();
  }, []);

  const fetchEvents = async () => {
    try {
      setLoading(true);
      const res = await api.get('/events/organizer/my-events');
      setEvents(res.data);
    } catch (e) {
      console.error("Failed to load organizer events:", e);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (eventId, newStatus) => {
    if (!window.confirm(`Are you sure you want to change this event's status to "${newStatus}"?`)) return;

    try {
      setStatusActionLoading(true);
      await api.post(`/events/${eventId}/status?status_name=${newStatus}`);
      await fetchEvents();
    } catch (e) {
      alert(e.response?.data?.detail || "Failed to update event status.");
    } finally {
      setStatusActionLoading(false);
    }
  };

  const filteredEvents = events.filter(e => {
    if (filter === 'all') return true;
    return e.status === filter;
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      
      <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Manage My Events</h1>
          <p className="text-xs text-slate-500 mt-0.5">Track proposal statuses, manage capacities, and update event states</p>
        </div>

        <Link
          to="/organizer/create-event"
          className="px-4 py-2.5 rounded-xl text-xs font-bold bg-indigo-600 hover:bg-indigo-700 text-white shadow-sm flex items-center gap-1.5 self-start sm:self-auto transition-all"
        >
          <PlusCircle className="w-4 h-4" />
          <span>Create New Event</span>
        </Link>
      </div>

      {/* Filter Tabs */}
      <div className="flex gap-2 border-b border-slate-200 pb-2 overflow-x-auto">
        {['all', 'approved', 'pending', 'completed', 'rejected'].map((tab) => (
          <button
            key={tab}
            onClick={() => setFilter(tab)}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold capitalize transition-all whitespace-nowrap ${
              filter === tab
                ? 'bg-indigo-600 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            {tab === 'all' ? `All (${events.length})` : tab}
          </button>
        ))}
      </div>

      {/* Events Grid */}
      {loading ? (
        <div className="space-y-4">
          {[1, 2, 3].map(i => (
            <div key={i} className="h-32 bg-slate-100 rounded-2xl animate-pulse"></div>
          ))}
        </div>
      ) : filteredEvents.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-3xl border border-slate-200 p-8 shadow-xs">
          <Calendar className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <h3 className="text-base font-bold text-slate-800">No {filter !== 'all' ? filter : ''} events found</h3>
          <p className="text-xs text-slate-500 mt-1 mb-4">
            Click Create New Event to submit a proposal for administrative approval.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredEvents.map((evt) => (
            <div
              key={evt.id}
              className="bg-white rounded-3xl border border-slate-200/90 shadow-xs hover:shadow-md transition-all p-5 sm:p-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-6"
            >
              <div className="space-y-2 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <StatusBadge status={evt.status} size="sm" />
                  {evt.category && (
                    <span className="text-[11px] font-semibold text-slate-500 bg-slate-100 px-2.5 py-0.5 rounded-full">
                      {evt.category.name}
                    </span>
                  )}
                </div>

                <Link
                  to={`/events/${evt.id}`}
                  className="text-base font-bold text-slate-900 hover:text-indigo-600 transition-colors block"
                >
                  {evt.title}
                </Link>

                <div className="flex flex-wrap gap-4 text-xs text-slate-500">
                  <span>📅 {evt.date} • {evt.start_time} - {evt.end_time}</span>
                  <span>📍 {evt.venue}</span>
                  <span>👥 Capacity: <b>{evt.confirmed_count || 0} / {evt.capacity}</b></span>
                  {evt.waitlist_count > 0 && (
                    <span className="text-amber-600 font-semibold">⏳ Waitlist: {evt.waitlist_count}</span>
                  )}
                </div>

                {evt.status === 'rejected' && evt.rejection_reason && (
                  <div className="p-2.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs">
                    <b>Admin Rejection Reason:</b> {evt.rejection_reason}
                  </div>
                )}
              </div>

              {/* Actions */}
              <div className="flex flex-wrap items-center gap-2 w-full md:w-auto justify-end pt-3 md:pt-0 border-t md:border-t-0 border-slate-100">
                <Link
                  to={`/organizer/attendees/${evt.id}`}
                  className="px-3.5 py-2 rounded-xl text-xs font-semibold bg-indigo-50 text-indigo-700 hover:bg-indigo-100 flex items-center gap-1.5 transition-colors"
                >
                  <Users className="w-3.5 h-3.5" />
                  <span>Attendees ({evt.confirmed_count || 0})</span>
                </Link>

                {evt.status === 'approved' && (
                  <>
                    <Link
                      to={`/organizer/scanner?event_id=${evt.id}`}
                      className="px-3.5 py-2 rounded-xl text-xs font-semibold bg-emerald-50 text-emerald-700 hover:bg-emerald-100 flex items-center gap-1.5 transition-colors"
                    >
                      <QrCode className="w-3.5 h-3.5" />
                      <span>Scan QR</span>
                    </Link>

                    <button
                      onClick={() => handleStatusChange(evt.id, 'completed')}
                      disabled={statusActionLoading}
                      className="px-3.5 py-2 rounded-xl text-xs font-semibold bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors"
                    >
                      Mark Completed
                    </button>
                  </>
                )}

                {evt.status === 'completed' && (
                  <Link
                    to={`/organizer/attendees/${evt.id}`}
                    className="px-3.5 py-2 rounded-xl text-xs font-semibold bg-amber-50 text-amber-800 hover:bg-amber-100 border border-amber-200 flex items-center gap-1.5 transition-colors"
                  >
                    <Award className="w-3.5 h-3.5 text-amber-600" />
                    <span>Issue Certificates</span>
                  </Link>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

    </div>
  );
}
