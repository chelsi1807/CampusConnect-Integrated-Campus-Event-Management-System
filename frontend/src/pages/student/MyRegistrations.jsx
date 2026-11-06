import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  Calendar, 
  Clock, 
  MapPin, 
  QrCode, 
  Award, 
  Star, 
  X, 
  AlertCircle, 
  CheckCircle2, 
  Download,
  Ban
} from 'lucide-react';
import api from '../../api/client';
import StatusBadge from '../../components/StatusBadge';
import QRPassModal from '../../components/QRPassModal';
import FeedbackModal from '../../components/FeedbackModal';

export default function MyRegistrations() {
  const [registrations, setRegistrations] = useState([]);
  const [filter, setFilter] = useState('all');
  const [loading, setLoading] = useState(true);
  const [selectedPass, setSelectedPass] = useState(null);
  const [feedbackEvent, setFeedbackEvent] = useState(null);
  const [actionLoading, setActionLoading] = useState(false);
  const [message, setMessage] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchRegistrations();
  }, []);

  const fetchRegistrations = async () => {
    try {
      setLoading(true);
      const res = await api.get('/registrations/my-registrations');
      setRegistrations(res.data);
    } catch (e) {
      console.error("Failed to fetch registrations:", e);
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = async (regId, eventTitle) => {
    if (!window.confirm(`Are you sure you want to cancel your registration for "${eventTitle}"? Your seat will be given to the next waiting participant.`)) {
      return;
    }

    try {
      setActionLoading(true);
      setError(null);
      setMessage(null);
      await api.post(`/registrations/${regId}/cancel`);
      setMessage(`Successfully cancelled registration for "${eventTitle}".`);
      await fetchRegistrations();
    } catch (err) {
      setError(err.response?.data?.detail || "Failed to cancel registration.");
    } finally {
      setActionLoading(false);
    }
  };

  const filteredRegistrations = registrations.filter(r => {
    if (filter === 'all') return true;
    return r.status === filter;
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      
      {/* Title */}
      <div>
        <h1 className="text-2xl font-bold text-slate-900">My Event Registrations & Passes</h1>
        <p className="text-xs text-slate-500 mt-1">
          Access your digital QR entry passes, check waitlist status, and provide event feedback.
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

      {/* Filter Tabs */}
      <div className="flex gap-2 border-b border-slate-200 pb-2 overflow-x-auto">
        {['all', 'confirmed', 'waitlisted', 'attended'].map((tab) => (
          <button
            key={tab}
            onClick={() => setFilter(tab)}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold capitalize transition-all whitespace-nowrap ${
              filter === tab
                ? 'bg-indigo-600 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            {tab === 'all' ? `All (${registrations.length})` : tab}
          </button>
        ))}
      </div>

      {/* Registrations List */}
      {loading ? (
        <div className="space-y-4">
          {[1, 2, 3].map(i => (
            <div key={i} className="h-32 bg-slate-100 rounded-2xl animate-pulse"></div>
          ))}
        </div>
      ) : filteredRegistrations.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-3xl border border-slate-200 p-8 shadow-xs">
          <Calendar className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <h3 className="text-base font-bold text-slate-800">No {filter !== 'all' ? filter : ''} registrations found</h3>
          <p className="text-xs text-slate-500 mt-1 mb-4">
            You don't have any events in this section. Browse upcoming events to register.
          </p>
          <Link to="/events" className="px-4 py-2 text-xs font-semibold bg-indigo-600 text-white rounded-xl">
            Browse Events
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredRegistrations.map((reg) => (
            <div
              key={reg.id}
              className="bg-white rounded-3xl border border-slate-200/90 shadow-xs hover:shadow-md transition-all p-5 sm:p-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-6"
            >
              <div className="space-y-2 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <StatusBadge status={reg.status} position={reg.waitlist_position} size="sm" />
                  {reg.category_name && (
                    <span className="text-[11px] font-semibold text-slate-500 bg-slate-100 px-2.5 py-0.5 rounded-full">
                      {reg.category_name}
                    </span>
                  )}
                </div>

                <Link
                  to={`/events/${reg.event_id}`}
                  className="text-base font-bold text-slate-900 hover:text-indigo-600 transition-colors block"
                >
                  {reg.event_title}
                </Link>

                <div className="flex flex-wrap gap-4 text-xs text-slate-500">
                  <span className="flex items-center gap-1.5"><Calendar className="w-3.5 h-3.5 text-indigo-500" /> {reg.event_date}</span>
                  <span className="flex items-center gap-1.5"><Clock className="w-3.5 h-3.5 text-indigo-500" /> {reg.event_start_time} - {reg.event_end_time}</span>
                  <span className="flex items-center gap-1.5"><MapPin className="w-3.5 h-3.5 text-rose-500" /> {reg.event_venue}</span>
                </div>

                <div className="text-[11px] text-slate-400 font-mono">
                  Pass ID: {reg.registration_code}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-wrap items-center gap-2 w-full md:w-auto justify-end pt-3 md:pt-0 border-t md:border-t-0 border-slate-100">
                {reg.status === 'confirmed' && (
                  <>
                    <button
                      onClick={() => setSelectedPass(reg)}
                      className="px-4 py-2.5 rounded-xl text-xs font-bold bg-indigo-600 hover:bg-indigo-700 text-white shadow-sm flex items-center gap-1.5 transition-all"
                    >
                      <QrCode className="w-4 h-4" />
                      <span>View QR Pass</span>
                    </button>
                    <button
                      onClick={() => handleCancel(reg.id, reg.event_title)}
                      disabled={actionLoading}
                      className="px-3 py-2.5 rounded-xl text-xs font-semibold text-rose-600 hover:bg-rose-50 transition-colors"
                    >
                      Cancel
                    </button>
                  </>
                )}

                {reg.status === 'waitlisted' && (
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-amber-700 font-medium bg-amber-50 px-3 py-1.5 rounded-xl border border-amber-200">
                      Waiting in queue (#{reg.waitlist_position})
                    </span>
                    <button
                      onClick={() => handleCancel(reg.id, reg.event_title)}
                      disabled={actionLoading}
                      className="px-3 py-1.5 rounded-xl text-xs font-semibold text-rose-600 hover:bg-rose-50 transition-colors"
                    >
                      Leave Waitlist
                    </button>
                  </div>
                )}

                {reg.status === 'attended' && (
                  <div className="flex flex-wrap gap-2">
                    <Link
                      to="/student/certificates"
                      className="px-3.5 py-2 rounded-xl text-xs font-semibold bg-emerald-50 text-emerald-800 hover:bg-emerald-100 border border-emerald-200 flex items-center gap-1.5 transition-colors"
                    >
                      <Award className="w-3.5 h-3.5 text-emerald-600" />
                      <span>Get Certificate</span>
                    </Link>

                    <button
                      onClick={() => setFeedbackEvent({ id: reg.event_id, title: reg.event_title })}
                      className="px-3.5 py-2 rounded-xl text-xs font-semibold bg-indigo-50 text-indigo-700 hover:bg-indigo-100 flex items-center gap-1.5 transition-colors"
                    >
                      <Star className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
                      <span>{reg.has_feedback ? 'Review Submitted' : 'Give Feedback'}</span>
                    </button>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* QR Pass Modal */}
      {selectedPass && (
        <QRPassModal
          isOpen={!!selectedPass}
          onClose={() => setSelectedPass(null)}
          registration={selectedPass}
        />
      )}

      {/* Feedback Modal */}
      {feedbackEvent && (
        <FeedbackModal
          isOpen={!!feedbackEvent}
          onClose={() => setFeedbackEvent(null)}
          eventId={feedbackEvent.id}
          eventTitle={feedbackEvent.title}
          onSuccess={() => fetchRegistrations()}
        />
      )}

    </div>
  );
}
