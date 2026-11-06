import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { 
  BarChart3, 
  ArrowLeft, 
  Calendar, 
  Users, 
  Star, 
  CheckCircle2, 
  Download, 
  FileText 
} from 'lucide-react';
import { 
  ResponsiveContainer, 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  Tooltip, 
  Legend, 
  Cell 
} from 'recharts';
import api from '../../api/client';

export default function EventReports() {
  const { eventId } = useParams();
  const [events, setEvents] = useState([]);
  const [selectedEventId, setSelectedEventId] = useState(eventId || '');
  const [feedbackSummary, setFeedbackSummary] = useState(null);
  const [attendanceStats, setAttendanceStats] = useState(null);
  const [eventDetails, setEventDetails] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchEvents();
  }, []);

  useEffect(() => {
    if (selectedEventId) {
      loadEventReport(selectedEventId);
    }
  }, [selectedEventId]);

  const fetchEvents = async () => {
    try {
      const res = await api.get('/events/organizer/my-events');
      setEvents(res.data);
      if (!selectedEventId && res.data.length > 0) {
        setSelectedEventId(String(res.data[0].id));
      }
    } catch (e) {
      console.error("Failed to load organizer events:", e);
    }
  };

  const loadEventReport = async (id) => {
    try {
      setLoading(true);
      const [evRes, statsRes, fbRes] = await Promise.all([
        api.get(`/events/${id}`),
        api.get(`/attendance/event/${id}/stats`),
        api.get(`/feedback/event/${id}`)
      ]);
      setEventDetails(evRes.data);
      setAttendanceStats(statsRes.data);
      setFeedbackSummary(fbRes.data);
    } catch (e) {
      console.error("Failed to load report data:", e);
    } finally {
      setLoading(false);
    }
  };

  const ratingData = [
    { star: '5 Stars', count: feedbackSummary?.rating_distribution?.['5'] || 0, color: '#10B981' },
    { star: '4 Stars', count: feedbackSummary?.rating_distribution?.['4'] || 0, color: '#3B82F6' },
    { star: '3 Stars', count: feedbackSummary?.rating_distribution?.['3'] || 0, color: '#F59E0B' },
    { star: '2 Stars', count: feedbackSummary?.rating_distribution?.['2'] || 0, color: '#EC4899' },
    { star: '1 Star', count: feedbackSummary?.rating_distribution?.['1'] || 0, color: '#EF4444' }
  ];

  const exportCSV = () => {
    if (!eventDetails || !feedbackSummary) return;
    
    let csvContent = "data:text/csv;charset=utf-8,";
    csvContent += "Event Report Summary\n";
    csvContent += `Title,${eventDetails.title}\n`;
    csvContent += `Date,${eventDetails.date}\n`;
    csvContent += `Venue,${eventDetails.venue}\n`;
    csvContent += `Capacity,${eventDetails.capacity}\n`;
    csvContent += `Confirmed Registrations,${attendanceStats?.confirmed_registrations || 0}\n`;
    csvContent += `Total Checked-In,${attendanceStats?.total_checked_in || 0}\n`;
    csvContent += `Attendance Rate,${attendanceStats?.attendance_rate || 0}%\n`;
    csvContent += `Average Feedback Rating,${feedbackSummary.average_rating || 0}/5.0\n\n`;
    
    csvContent += "Participant Comments\nRating,Comment,Date\n";
    (feedbackSummary.recent_feedbacks || []).forEach(f => {
      csvContent += `${f.rating},"${(f.comment || '').replace(/"/g, '""')}",${new Date(f.created_at).toLocaleDateString()}\n`;
    });

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `EventReport_${eventDetails.id}_${eventDetails.title.replace(/\s+/g, '_')}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      <div>
        <Link
          to="/organizer"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-indigo-600 transition-colors mb-2"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to Organizer Dashboard</span>
        </Link>
        <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Event Analytics & Post-Event Reports</h1>
            <p className="text-xs text-slate-500 mt-0.5">
              Attendance turn-out rates, capacity utilization, and student satisfaction breakdown.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <select
              value={selectedEventId}
              onChange={(e) => setSelectedEventId(e.target.value)}
              className="text-xs font-bold p-2.5 rounded-xl border border-slate-200 bg-white"
            >
              {events.map((ev) => (
                <option key={ev.id} value={ev.id}>{ev.title}</option>
              ))}
            </select>

            <button
              onClick={exportCSV}
              className="px-3.5 py-2.5 rounded-xl text-xs font-semibold bg-indigo-600 hover:bg-indigo-700 text-white flex items-center gap-1.5 shadow-sm transition-all"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Export CSV</span>
            </button>
          </div>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-2xl border border-slate-200 p-4">
          <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider block">Registrations</span>
          <span className="text-xl font-extrabold text-slate-900 mt-1 block">
            {attendanceStats?.confirmed_registrations || 0} / {eventDetails?.capacity || 0}
          </span>
          <span className="text-[11px] text-slate-400 mt-0.5 block">
            Occupancy: {eventDetails?.capacity ? Math.round(((attendanceStats?.confirmed_registrations || 0) / eventDetails.capacity) * 100) : 0}%
          </span>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200 p-4">
          <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider block">Verified Attendees</span>
          <span className="text-xl font-extrabold text-emerald-600 mt-1 block">
            {attendanceStats?.total_checked_in || 0}
          </span>
          <span className="text-[11px] text-emerald-600 mt-0.5 block font-medium">
            Attendance Rate: {attendanceStats?.attendance_rate || 0}%
          </span>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200 p-4">
          <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider block">Waitlist Queue</span>
          <span className="text-xl font-extrabold text-amber-600 mt-1 block">
            {attendanceStats?.waitlist_count || 0}
          </span>
          <span className="text-[11px] text-slate-400 mt-0.5 block">
            Max limit: {eventDetails?.waitlist_capacity || 0}
          </span>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200 p-4">
          <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider block">Average Satisfaction</span>
          <span className="text-xl font-extrabold text-amber-500 mt-1 block">
            {feedbackSummary?.average_rating || 0} / 5.0
          </span>
          <span className="text-[11px] text-slate-400 mt-0.5 block">
            {feedbackSummary?.total_feedbacks || 0} verified reviews
          </span>
        </div>
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Rating Distribution BarChart */}
        <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-xs space-y-4">
          <div>
            <h3 className="text-sm font-bold text-slate-900">Rating Distribution</h3>
            <p className="text-xs text-slate-400">Student score frequency across 1-5 stars</p>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={ratingData} layout="vertical" margin={{ top: 5, right: 30, left: 10, bottom: 5 }}>
                <XAxis type="number" tick={{ fontSize: 11 }} allowDecimals={false} />
                <YAxis dataKey="star" type="category" tick={{ fontSize: 11 }} />
                <Tooltip />
                <Bar dataKey="count" radius={[0, 6, 6, 0]}>
                  {ratingData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Dimension Ratings */}
        <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-xs space-y-5">
          <div>
            <h3 className="text-sm font-bold text-slate-900">Experience Dimension Ratings</h3>
            <p className="text-xs text-slate-400">Detailed aspect breakdowns</p>
          </div>

          <div className="space-y-4 pt-2">
            <div>
              <div className="flex justify-between text-xs font-semibold mb-1">
                <span className="text-slate-700">Content & Keynote Quality</span>
                <span className="text-indigo-600">{feedbackSummary?.average_content || 0} / 5.0</span>
              </div>
              <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-indigo-600 rounded-full" 
                  style={{ width: `${((feedbackSummary?.average_content || 0) / 5) * 100}%` }}
                ></div>
              </div>
            </div>

            <div>
              <div className="flex justify-between text-xs font-semibold mb-1">
                <span className="text-slate-700">Event Coordination & Flow</span>
                <span className="text-emerald-600">{feedbackSummary?.average_organization || 0} / 5.0</span>
              </div>
              <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-emerald-600 rounded-full" 
                  style={{ width: `${((feedbackSummary?.average_organization || 0) / 5) * 100}%` }}
                ></div>
              </div>
            </div>

            <div>
              <div className="flex justify-between text-xs font-semibold mb-1">
                <span className="text-slate-700">Venue, Audio/Visual Setup & Acoustics</span>
                <span className="text-amber-600">{feedbackSummary?.average_venue || 0} / 5.0</span>
              </div>
              <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-amber-500 rounded-full" 
                  style={{ width: `${((feedbackSummary?.average_venue || 0) / 5) * 100}%` }}
                ></div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Student Feedback Reviews */}
      <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-xs space-y-4">
        <h3 className="text-sm font-bold text-slate-900">Student Reviews & Qualitative Remarks</h3>
        
        {(!feedbackSummary?.recent_feedbacks || feedbackSummary.recent_feedbacks.length === 0) ? (
          <p className="text-xs text-slate-400 py-4 text-center">No reviews submitted yet for this event.</p>
        ) : (
          <div className="space-y-3">
            {feedbackSummary.recent_feedbacks.map((f) => (
              <div key={f.id} className="p-3.5 rounded-2xl bg-slate-50 border border-slate-100 text-xs space-y-1">
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-1 text-amber-500">
                    {[...Array(f.rating)].map((_, i) => (
                      <Star key={i} className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                    ))}
                    <span className="text-[11px] text-slate-700 font-bold ml-1">{f.rating}.0</span>
                  </div>
                  <span className="text-[10px] text-slate-400">{new Date(f.created_at).toLocaleDateString()}</span>
                </div>
                {f.comment && (
                  <p className="text-slate-600 leading-relaxed italic">"{f.comment}"</p>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

    </div>
  );
}

