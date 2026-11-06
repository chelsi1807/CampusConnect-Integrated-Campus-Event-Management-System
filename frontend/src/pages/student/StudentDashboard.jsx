import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  Calendar, 
  QrCode, 
  Award, 
  Clock, 
  CheckCircle2, 
  ArrowRight, 
  AlertCircle, 
  ExternalLink 
} from 'lucide-react';
import api from '../../api/client';
import { useAuth } from '../../context/AuthContext';
import QRPassModal from '../../components/QRPassModal';

export default function StudentDashboard() {
  const { user } = useAuth();
  const [analytics, setAnalytics] = useState(null);
  const [registrations, setRegistrations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedPass, setSelectedPass] = useState(null);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const [analyticsRes, regsRes] = await Promise.all([
        api.get('/analytics/student'),
        api.get('/registrations/my-registrations')
      ]);
      setAnalytics(analyticsRes.data);
      setRegistrations(regsRes.data || []);
    } catch (e) {
      console.error("Failed to load student dashboard data:", e);
    } finally {
      setLoading(false);
    }
  };

  const confirmedUpcoming = registrations.filter(r => r.status === 'confirmed');
  const nextEvent = confirmedUpcoming[0] || null;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      
      {/* Welcome Hero */}
      <div className="bg-gradient-to-r from-blue-900 via-indigo-900 to-indigo-950 rounded-3xl p-6 sm:p-8 text-white flex flex-col md:flex-row justify-between items-start md:items-center gap-6 shadow-md">
        <div>
          <span className="text-xs font-semibold text-indigo-300 uppercase tracking-wider">Student Portal</span>
          <h1 className="text-2xl sm:text-3xl font-extrabold mt-1">
            Welcome back, {user?.full_name}!
          </h1>
          <p className="text-xs sm:text-sm text-indigo-100/80 mt-1">
            {user?.department || 'Enrolled Student'} {user?.student_id && `• ${user.student_id}`}
          </p>
        </div>

        <div className="flex gap-2.5">
          <Link
            to="/events"
            className="px-4 py-2.5 rounded-xl text-xs font-bold bg-white text-indigo-900 hover:bg-indigo-50 shadow-sm transition-all"
          >
            Explore Events
          </Link>
          <Link
            to="/student/registrations"
            className="px-4 py-2.5 rounded-xl text-xs font-semibold bg-white/10 hover:bg-white/20 text-white border border-white/20 transition-all"
          >
            My Entry Passes
          </Link>
        </div>
      </div>

      {/* Analytics Stat Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs">
          <div className="flex justify-between items-center text-slate-400 mb-2">
            <span className="text-xs font-semibold text-slate-500">Upcoming Events</span>
            <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center">
              <Calendar className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-extrabold text-slate-900">{analytics?.upcoming_events_count || 0}</div>
          <div className="text-[11px] text-slate-400 mt-1">Confirmed seats</div>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs">
          <div className="flex justify-between items-center text-slate-400 mb-2">
            <span className="text-xs font-semibold text-slate-500">Attended Events</span>
            <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-extrabold text-slate-900">{analytics?.attended_count || 0}</div>
          <div className="text-[11px] text-emerald-600 mt-1 font-medium">QR attendance verified</div>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs">
          <div className="flex justify-between items-center text-slate-400 mb-2">
            <span className="text-xs font-semibold text-slate-500">Waitlist Positions</span>
            <div className="w-8 h-8 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-extrabold text-slate-900">{analytics?.waitlisted_count || 0}</div>
          <div className="text-[11px] text-slate-400 mt-1">Queued for seat openings</div>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs">
          <div className="flex justify-between items-center text-slate-400 mb-2">
            <span className="text-xs font-semibold text-slate-500">Certificates Earned</span>
            <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
              <Award className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-extrabold text-slate-900">{analytics?.certificates_earned || 0}</div>
          <div className="text-[11px] text-indigo-600 mt-1 font-medium">Digital PDF available</div>
        </div>
      </div>

      {/* Main Grid: Next Event & Active Passes */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Next Upcoming Event Hero */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="text-base font-bold text-slate-900">Next Upcoming Event</h2>
            <Link to="/student/registrations" className="text-xs font-semibold text-indigo-600 hover:text-indigo-800">
              View All ({registrations.length})
            </Link>
          </div>

          {nextEvent ? (
            <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6 space-y-4">
              <div className="flex justify-between items-start gap-4">
                <div>
                  <span className="px-2.5 py-1 rounded-full text-[11px] font-semibold bg-indigo-50 text-indigo-700">
                    {nextEvent.category_name || 'Event'}
                  </span>
                  <h3 className="text-lg font-bold text-slate-900 mt-2">
                    {nextEvent.event_title}
                  </h3>
                  <div className="flex flex-wrap gap-4 text-xs text-slate-500 mt-2">
                    <span>📅 {nextEvent.event_date}</span>
                    <span>⏰ {nextEvent.event_start_time} - {nextEvent.event_end_time}</span>
                    <span>📍 {nextEvent.event_venue}</span>
                  </div>
                </div>

                <button
                  onClick={() => setSelectedPass(nextEvent)}
                  className="px-4 py-2.5 rounded-xl text-xs font-bold bg-indigo-600 hover:bg-indigo-700 text-white shadow-md shadow-indigo-100 flex items-center gap-1.5 shrink-0 transition-all"
                >
                  <QrCode className="w-4 h-4" />
                  <span>Show Entry QR</span>
                </button>
              </div>

              <div className="bg-slate-50 rounded-2xl p-3 border border-slate-100 flex items-center justify-between text-xs">
                <span className="text-slate-500">Entry Code: <b className="font-mono text-indigo-900">{nextEvent.registration_code}</b></span>
                <span className="text-emerald-700 font-semibold flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5" /> Seat Confirmed
                </span>
              </div>
            </div>
          ) : (
            <div className="bg-white rounded-3xl border border-slate-200 p-8 text-center space-y-3">
              <Calendar className="w-10 h-10 text-slate-300 mx-auto" />
              <h3 className="text-sm font-bold text-slate-800">No upcoming confirmed events</h3>
              <p className="text-xs text-slate-500">Discover and register for technical challenges, workshops, and sports.</p>
              <Link to="/events" className="inline-block px-4 py-2 text-xs font-semibold bg-indigo-600 text-white rounded-xl">
                Browse Campus Events
              </Link>
            </div>
          )}
        </div>

        {/* Quick Links & Certificates sidebar */}
        <div className="space-y-4">
          <h2 className="text-base font-bold text-slate-900">Quick Actions</h2>
          <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-4 space-y-2">
            <Link
              to="/student/registrations"
              className="flex items-center justify-between p-3 rounded-2xl hover:bg-slate-50 text-xs font-semibold text-slate-800 transition-colors"
            >
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
                  <QrCode className="w-4 h-4" />
                </div>
                <span>My Active Entry Passes</span>
              </div>
              <ArrowRight className="w-4 h-4 text-slate-400" />
            </Link>

            <Link
              to="/student/certificates"
              className="flex items-center justify-between p-3 rounded-2xl hover:bg-slate-50 text-xs font-semibold text-slate-800 transition-colors"
            >
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
                  <Award className="w-4 h-4" />
                </div>
                <span>My Official Certificates</span>
              </div>
              <ArrowRight className="w-4 h-4 text-slate-400" />
            </Link>

            <Link
              to="/verify-certificate"
              className="flex items-center justify-between p-3 rounded-2xl hover:bg-slate-50 text-xs font-semibold text-slate-800 transition-colors"
            >
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
                  <ExternalLink className="w-4 h-4" />
                </div>
                <span>Public Certificate Verification</span>
              </div>
              <ArrowRight className="w-4 h-4 text-slate-400" />
            </Link>
          </div>
        </div>
      </div>

      {/* QR Pass Modal */}
      {selectedPass && (
        <QRPassModal
          isOpen={!!selectedPass}
          onClose={() => setSelectedPass(null)}
          registration={selectedPass}
        />
      )}

    </div>
  );
}
