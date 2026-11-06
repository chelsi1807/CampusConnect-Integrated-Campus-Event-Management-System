import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { 
  Calendar, 
  Clock, 
  MapPin, 
  Users, 
  User, 
  ShieldCheck, 
  QrCode, 
  Award, 
  Star, 
  AlertCircle, 
  CheckCircle2, 
  ArrowLeft,
  Share2
} from 'lucide-react';
import api from '../api/client';
import { useAuth } from '../context/AuthContext';
import StatusBadge from '../components/StatusBadge';
import QRPassModal from '../components/QRPassModal';
import FeedbackModal from '../components/FeedbackModal';
import confetti from 'canvas-confetti';

export default function EventDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();
  
  const [event, setEvent] = useState(null);
  const [userRegistration, setUserRegistration] = useState(null);
  const [feedbackSummary, setFeedbackSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState(null);

  // Modals
  const [showQRModal, setShowQRModal] = useState(false);
  const [showFeedbackModal, setShowFeedbackModal] = useState(false);

  useEffect(() => {
    fetchEventDetails();
  }, [id, isAuthenticated]);

  const fetchEventDetails = async () => {
    try {
      setLoading(true);
      setErrorMsg(null);
      const res = await api.get(`/events/${id}`);
      setEvent(res.data);

      // Check if user is registered for this event
      if (isAuthenticated) {
        try {
          const regRes = await api.get('/registrations/my-registrations');
          const matched = regRes.data.find(r => r.event_id === parseInt(id));
          setUserRegistration(matched || null);
        } catch (e) {
          console.error("Could not load registration status:", e);
        }
      }

      // If completed or organizer, fetch feedback summary
      if (res.data.status === 'completed' || user?.role === 'organizer' || user?.role === 'admin') {
        try {
          const fbRes = await api.get(`/feedback/event/${id}`);
          setFeedbackSummary(fbRes.data);
        } catch (e) {
          // not authorized or no feedback yet
        }
      }
    } catch (err) {
      console.error("Failed to load event details:", err);
      setErrorMsg(err.response?.data?.detail || "Could not load event information.");
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async () => {
    if (!isAuthenticated) {
      navigate('/login', { state: { from: `/events/${id}` } });
      return;
    }

    try {
      setActionLoading(true);
      setErrorMsg(null);
      const res = await api.post('/registrations/', { event_id: parseInt(id) });
      
      confetti({ particleCount: 75, spread: 70, origin: { y: 0.6 } });
      await fetchEventDetails();

      // If confirmed, automatically open QR modal to delight the user!
      if (res.data.status === 'confirmed') {
        setShowQRModal(true);
      }
    } catch (err) {
      setErrorMsg(err.response?.data?.detail || "Failed to complete registration.");
    } finally {
      setActionLoading(false);
    }
  };

  const handleCancelRegistration = async () => {
    if (!userRegistration) return;
    if (!window.confirm("Are you sure you want to cancel your registration? If you cancel, your seat will be automatically offered to the next waitlisted student.")) return;

    try {
      setActionLoading(true);
      await api.post(`/registrations/${userRegistration.id}/cancel`);
      await fetchEventDetails();
    } catch (err) {
      setErrorMsg(err.response?.data?.detail || "Failed to cancel registration.");
    } finally {
      setActionLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="max-w-5xl mx-auto px-4 py-16 text-center">
        <div className="w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
        <p className="text-xs text-slate-500">Loading event details...</p>
      </div>
    );
  }

  if (errorMsg && !event) {
    return (
      <div className="max-w-md mx-auto my-16 p-6 bg-white rounded-2xl border border-slate-200 text-center shadow-sm">
        <AlertCircle className="w-10 h-10 text-rose-500 mx-auto mb-2" />
        <h2 className="text-base font-bold text-slate-900">Event Not Available</h2>
        <p className="text-xs text-slate-500 mt-1 mb-4">{errorMsg}</p>
        <Link to="/events" className="px-4 py-2 text-xs font-semibold bg-indigo-600 text-white rounded-xl">
          Back to Events
        </Link>
      </div>
    );
  }

  const confirmed = event.confirmed_count || 0;
  const capacity = event.capacity || 1;
  const percentFilled = Math.min(100, Math.round((confirmed / capacity) * 100));
  const isFull = confirmed >= capacity;

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      
      {/* Back button */}
      <div>
        <Link
          to="/events"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-indigo-600 transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to All Events</span>
        </Link>
      </div>

      {errorMsg && (
        <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* Main Event Card */}
      <div className="bg-white rounded-3xl border border-slate-200/90 shadow-sm overflow-hidden">
        
        {/* Banner with overlaid elements */}
        <div className="relative h-64 sm:h-80 w-full bg-slate-900 overflow-hidden">
          <img
            src={event.banner_url || 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=1200&auto=format&fit=crop&q=80'}
            alt={event.title}
            className="w-full h-full object-cover opacity-90"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-transparent"></div>

          <div className="absolute top-4 left-4 flex gap-2">
            {event.category && (
              <span className="px-3 py-1 rounded-full text-xs font-semibold bg-white/90 backdrop-blur-md text-slate-800 shadow">
                {event.category.name}
              </span>
            )}
          </div>

          <div className="absolute top-4 right-4">
            <StatusBadge status={event.status} size="lg" />
          </div>

          <div className="absolute bottom-4 left-4 right-4">
            <h1 className="text-xl sm:text-3xl font-extrabold text-white leading-tight">
              {event.title}
            </h1>
          </div>
        </div>

        {/* Content & Action Grid */}
        <div className="p-6 sm:p-8 grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Left 2 Columns: Description & Details */}
          <div className="lg:col-span-2 space-y-6">
            <div>
              <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider mb-2">
                About this Event
              </h2>
              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed whitespace-pre-line">
                {event.description}
              </p>
            </div>

            {/* Quick Metadata Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-4 border-t border-slate-100">
              <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-100 flex items-start gap-3">
                <Calendar className="w-5 h-5 text-indigo-600 shrink-0 mt-0.5" />
                <div>
                  <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">Date & Time</span>
                  <span className="text-xs font-bold text-slate-800 block mt-0.5">{event.date}</span>
                  <span className="text-xs text-slate-500">{event.start_time} - {event.end_time}</span>
                </div>
              </div>

              <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-100 flex items-start gap-3">
                <MapPin className="w-5 h-5 text-rose-500 shrink-0 mt-0.5" />
                <div>
                  <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">Campus Venue</span>
                  <span className="text-xs font-bold text-slate-800 block mt-0.5">{event.venue}</span>
                  <span className="text-xs text-slate-500">Official Campus Location</span>
                </div>
              </div>
            </div>

            {/* Eligibility & Guidelines */}
            <div className="p-4 rounded-2xl bg-indigo-50/50 border border-indigo-100 space-y-1">
              <div className="flex items-center gap-2 text-indigo-900 font-bold text-xs">
                <ShieldCheck className="w-4 h-4 text-indigo-600" />
                <span>Eligibility & Rules</span>
              </div>
              <p className="text-xs text-indigo-950/80 leading-relaxed">
                {event.eligibility || 'Open to all registered university students.'}
              </p>
              {event.registration_deadline && (
                <p className="text-[11px] text-indigo-700 font-medium pt-1">
                  Registration Closes: <b>{event.registration_deadline}</b>
                </p>
              )}
            </div>

            {/* Organizer Card */}
            {event.organizer && (
              <div className="flex items-center gap-3 p-4 rounded-2xl border border-slate-100 bg-slate-50">
                <img
                  src={event.organizer.avatar_url || `https://api.dicebear.com/7.x/initials/svg?seed=${event.organizer.full_name}`}
                  alt={event.organizer.full_name}
                  className="w-10 h-10 rounded-xl object-cover ring-2 ring-indigo-200"
                />
                <div>
                  <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Event Organizer</span>
                  <div className="text-xs font-bold text-slate-900">{event.organizer.full_name}</div>
                  <div className="text-[11px] text-slate-500">{event.organizer.department || 'Campus Department'}</div>
                </div>
              </div>
            )}
          </div>

          {/* Right Column: Capacity & Registration Box */}
          <div className="space-y-6">
            <div className="bg-slate-50/80 rounded-2xl p-5 border border-slate-200/80 space-y-5">
              
              <div className="flex justify-between items-center">
                <span className="text-xs font-bold text-slate-700 uppercase tracking-wider">Seat Availability</span>
                <span className={`text-xs font-extrabold ${isFull ? 'text-amber-600' : 'text-indigo-600'}`}>
                  {confirmed} / {capacity}
                </span>
              </div>

              {/* Progress bar */}
              <div className="space-y-1.5">
                <div className="w-full h-2.5 bg-slate-200 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-300 ${
                      isFull ? 'bg-amber-500' : percentFilled > 80 ? 'bg-orange-500' : 'bg-indigo-600'
                    }`}
                    style={{ width: `${percentFilled}%` }}
                  ></div>
                </div>
                <div className="flex justify-between text-[11px] text-slate-500 font-medium">
                  <span>{percentFilled}% booked</span>
                  <span>{isFull ? `Waitlist: ${event.waitlist_count || 0}` : `${event.remaining_seats} seats open`}</span>
                </div>
              </div>

              {/* Status Alert or Action */}
              {userRegistration ? (
                <div className="space-y-3 pt-2">
                  {userRegistration.status === 'confirmed' || userRegistration.status === 'attended' ? (
                    <div className="p-3.5 bg-emerald-50 border border-emerald-200 rounded-xl space-y-2">
                      <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-800">
                        <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                        <span>Seat Confirmed</span>
                      </div>
                      <p className="text-[11px] text-emerald-700 leading-tight">
                        Your registration is active. Present your QR entry pass at the event door.
                      </p>
                      <button
                        onClick={() => setShowQRModal(true)}
                        className="w-full flex items-center justify-center gap-1.5 py-2 px-3 rounded-lg text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm transition-all"
                      >
                        <QrCode className="w-4 h-4" />
                        <span>View My QR Entry Pass</span>
                      </button>
                    </div>
                  ) : userRegistration.status === 'waitlisted' ? (
                    <div className="p-3.5 bg-amber-50 border border-amber-200 rounded-xl space-y-2">
                      <div className="flex items-center gap-1.5 text-xs font-bold text-amber-800">
                        <Clock className="w-4 h-4 text-amber-600" />
                        <span>Waitlisted (Queue #{userRegistration.waitlist_position})</span>
                      </div>
                      <p className="text-[11px] text-amber-700 leading-tight">
                        You will be automatically promoted to confirmed if any attendee cancels!
                      </p>
                    </div>
                  ) : null}

                  {userRegistration.status !== 'attended' && (
                    <button
                      onClick={handleCancelRegistration}
                      disabled={actionLoading}
                      className="w-full py-2 text-xs font-semibold text-rose-600 hover:text-rose-800 hover:bg-rose-50 rounded-xl transition-colors"
                    >
                      Cancel My Registration
                    </button>
                  )}
                </div>
              ) : (
                <div className="pt-2">
                  {event.status === 'completed' ? (
                    <div className="p-3 text-center bg-slate-100 rounded-xl text-xs text-slate-500 font-medium">
                      This event has concluded.
                    </div>
                  ) : event.status !== 'approved' ? (
                    <div className="p-3 text-center bg-amber-50 border border-amber-200 rounded-xl text-xs text-amber-800 font-medium">
                      Event is currently {event.status}. Registration unavailable.
                    </div>
                  ) : (
                    <button
                      onClick={handleRegister}
                      disabled={actionLoading}
                      className={`w-full py-3 px-4 rounded-xl text-xs font-bold text-white shadow-md transition-all flex items-center justify-center gap-2 ${
                        isFull
                          ? 'bg-amber-600 hover:bg-amber-700 shadow-amber-600/20'
                          : 'bg-indigo-600 hover:bg-indigo-700 shadow-indigo-600/20'
                      }`}
                    >
                      {actionLoading ? (
                        <span>Processing...</span>
                      ) : isFull ? (
                        <>
                          <Clock className="w-4 h-4" />
                          <span>Join Event Waitlist</span>
                        </>
                      ) : (
                        <>
                          <CheckCircle2 className="w-4 h-4" />
                          <span>Register for Event</span>
                        </>
                      )}
                    </button>
                  )}
                </div>
              )}

              {/* Feedback Button for Attended Students */}
              {userRegistration && userRegistration.status === 'attended' && (
                <div className="pt-2 border-t border-slate-200">
                  <button
                    onClick={() => setShowFeedbackModal(true)}
                    className="w-full flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-xl text-xs font-semibold bg-indigo-50 hover:bg-indigo-100 text-indigo-700 transition-colors"
                  >
                    <Star className="w-4 h-4 text-amber-500 fill-amber-500" />
                    <span>Submit Event Feedback</span>
                  </button>
                </div>
              )}
            </div>

            {/* Quick Share / Info */}
            <div className="text-center text-xs text-slate-400 flex items-center justify-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
              <span>CampusConnect Verified Event</span>
            </div>
          </div>
        </div>
      </div>

      {/* Post-Event Feedback & Ratings Section */}
      {feedbackSummary && feedbackSummary.total_feedbacks > 0 && (
        <div className="bg-white rounded-3xl border border-slate-200/90 shadow-sm p-6 sm:p-8 space-y-6">
          <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-2 pb-4 border-b border-slate-100">
            <div>
              <span className="text-xs font-bold text-indigo-600 uppercase tracking-wider">Attendee Insights</span>
              <h3 className="text-lg font-bold text-slate-900 mt-0.5">Participant Ratings & Reviews</h3>
            </div>
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-1 bg-amber-50 text-amber-800 px-3 py-1.5 rounded-xl border border-amber-200 font-bold text-sm">
                <Star className="w-4 h-4 text-amber-500 fill-amber-500" />
                <span>{feedbackSummary.average_rating} / 5.0</span>
              </div>
              <span className="text-xs text-slate-400">({feedbackSummary.total_feedbacks} verified reviews)</span>
            </div>
          </div>

          {/* Sub-ratings breakdown */}
          <div className="grid grid-cols-3 gap-3 text-center">
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
              <div className="text-xs font-bold text-slate-800">{feedbackSummary.average_content} / 5</div>
              <div className="text-[11px] text-slate-400 mt-0.5">Content Quality</div>
            </div>
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
              <div className="text-xs font-bold text-slate-800">{feedbackSummary.average_organization} / 5</div>
              <div className="text-[11px] text-slate-400 mt-0.5">Organization</div>
            </div>
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
              <div className="text-xs font-bold text-slate-800">{feedbackSummary.average_venue} / 5</div>
              <div className="text-[11px] text-slate-400 mt-0.5">Venue & Logistics</div>
            </div>
          </div>

          {/* Recent Reviews list */}
          <div className="space-y-3 pt-2">
            <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider">Student Comments</h4>
            <div className="space-y-2.5">
              {feedbackSummary.recent_feedbacks.map((fb) => (
                <div key={fb.id} className="p-4 rounded-2xl bg-slate-50/80 border border-slate-100 text-xs space-y-1.5">
                  <div className="flex justify-between items-center">
                    <div className="flex items-center gap-1">
                      {[...Array(fb.rating)].map((_, i) => (
                        <Star key={i} className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
                      ))}
                    </div>
                    <span className="text-[10px] text-slate-400">
                      {new Date(fb.created_at).toLocaleDateString()}
                    </span>
                  </div>
                  {fb.comment && (
                    <p className="text-slate-600 leading-relaxed italic">"{fb.comment}"</p>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* QR Entry Pass Modal */}
      {userRegistration && (
        <QRPassModal
          isOpen={showQRModal}
          onClose={() => setShowQRModal(false)}
          registration={userRegistration}
        />
      )}

      {/* Feedback Modal */}
      <FeedbackModal
        isOpen={showFeedbackModal}
        onClose={() => setShowFeedbackModal(false)}
        eventId={parseInt(id)}
        eventTitle={event.title}
        onSuccess={() => fetchEventDetails()}
      />

    </div>
  );
}

