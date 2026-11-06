import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { 
  Calendar, 
  Clock, 
  MapPin, 
  Users, 
  ShieldCheck, 
  Image as ImageIcon, 
  CheckCircle2, 
  AlertCircle, 
  ArrowLeft 
} from 'lucide-react';
import api from '../../api/client';

export default function CreateEvent() {
  const navigate = useNavigate();
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Form Fields
  const [title, setTitle] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [date, setDate] = useState('');
  const [startTime, setStartTime] = useState('09:30 AM');
  const [endTime, setEndTime] = useState('04:30 PM');
  const [venue, setVenue] = useState('');
  const [capacity, setCapacity] = useState(50);
  const [waitlistCapacity, setWaitlistCapacity] = useState(25);
  const [deadline, setDeadline] = useState('');
  const [bannerUrl, setBannerUrl] = useState('');
  const [eligibility, setEligibility] = useState('Open to all registered university students.');
  const [description, setDescription] = useState('');

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      const res = await api.get('/categories/');
      setCategories(res.data);
      if (res.data.length > 0) {
        setCategoryId(res.data[0].id);
      }
    } catch (e) {
      console.error("Failed to load categories:", e);
    }
  };

  const presetBanners = [
    { label: 'Technical Hackathon', url: 'https://images.unsplash.com/photo-1504384308090-c894fdcc538d?w=800&auto=format&fit=crop&q=80' },
    { label: 'Coding Workshop', url: 'https://images.unsplash.com/photo-1633356122544-f134324a6cee?w=800&auto=format&fit=crop&q=80' },
    { label: 'Cultural Festival', url: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=800&auto=format&fit=crop&q=80' },
    { label: 'CyberSecurity CTF', url: 'https://images.unsplash.com/photo-1550751827-4bd374c3f58b?w=800&auto=format&fit=crop&q=80' },
  ];

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const payload = {
        title: title.trim(),
        category_id: parseInt(categoryId),
        description: description.trim(),
        date,
        start_time: startTime,
        end_time: endTime,
        venue: venue.trim(),
        capacity: parseInt(capacity),
        waitlist_capacity: parseInt(waitlistCapacity),
        registration_deadline: deadline || date,
        banner_url: bannerUrl.trim() || undefined,
        eligibility: eligibility.trim()
      };

      const res = await api.post('/events/', payload);
      navigate(`/events/${res.data.id}`);
    } catch (err) {
      setError(err.response?.data?.detail || "Failed to create event. Please check inputs.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto px-4 py-8 space-y-6">
      <div>
        <Link
          to="/organizer"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-indigo-600 transition-colors mb-2"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to Organizer Dashboard</span>
        </Link>
        <h1 className="text-2xl font-bold text-slate-900">Create New Campus Event</h1>
        <p className="text-xs text-slate-500 mt-0.5">
          Submit event proposal with capacity limits and deadlines. Submitted events undergo administrative review.
        </p>
      </div>

      {error && (
        <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6 sm:p-8 space-y-5">
        
        {/* Title */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1">Event Title *</label>
          <input
            type="text"
            required
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="e.g. National Campus AI Hackathon 2026"
            className="w-full text-xs p-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 font-medium"
          />
        </div>

        {/* Category & Date */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Event Category *</label>
            <select
              value={categoryId}
              onChange={(e) => setCategoryId(e.target.value)}
              className="w-full text-xs p-3 rounded-xl border border-slate-200 bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
            >
              {categories.map((c) => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Event Date *</label>
            <input
              type="date"
              required
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="w-full text-xs p-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
            />
          </div>
        </div>

        {/* Timings & Venue */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Start Time *</label>
            <input
              type="text"
              required
              value={startTime}
              onChange={(e) => setStartTime(e.target.value)}
              placeholder="09:30 AM"
              className="w-full text-xs p-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">End Time *</label>
            <input
              type="text"
              required
              value={endTime}
              onChange={(e) => setEndTime(e.target.value)}
              placeholder="04:30 PM"
              className="w-full text-xs p-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Venue / Auditorium *</label>
            <input
              type="text"
              required
              value={venue}
              onChange={(e) => setVenue(e.target.value)}
              placeholder="Main Auditorium, Hall 1"
              className="w-full text-xs p-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
            />
          </div>
        </div>

        {/* Capacity & Waitlist & Deadline */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Confirmed Capacity *</label>
            <input
              type="number"
              required
              min={1}
              value={capacity}
              onChange={(e) => setCapacity(e.target.value)}
              className="w-full text-xs p-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Waitlist Capacity</label>
            <input
              type="number"
              min={0}
              value={waitlistCapacity}
              onChange={(e) => setWaitlistCapacity(e.target.value)}
              className="w-full text-xs p-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Registration Deadline</label>
            <input
              type="date"
              value={deadline}
              onChange={(e) => setDeadline(e.target.value)}
              className="w-full text-xs p-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
            />
          </div>
        </div>

        {/* Banner Image URL & presets */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1">Event Banner Image URL</label>
          <input
            type="url"
            value={bannerUrl}
            onChange={(e) => setBannerUrl(e.target.value)}
            placeholder="https://images.unsplash.com/..."
            className="w-full text-xs p-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
          />
          <div className="flex flex-wrap gap-2 mt-2">
            <span className="text-[11px] text-slate-400 self-center">Preset Posters:</span>
            {presetBanners.map((p, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => setBannerUrl(p.url)}
                className="text-[11px] text-indigo-600 hover:text-indigo-800 bg-indigo-50 px-2 py-0.5 rounded-lg border border-indigo-100"
              >
                {p.label}
              </button>
            ))}
          </div>
        </div>

        {/* Eligibility */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1">Eligibility Criteria</label>
          <input
            type="text"
            value={eligibility}
            onChange={(e) => setEligibility(e.target.value)}
            placeholder="e.g. Open to all registered students, basic Python knowledge recommended"
            className="w-full text-xs p-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
          />
        </div>

        {/* Description */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1">Full Description & Schedule *</label>
          <textarea
            rows={5}
            required
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Provide a comprehensive breakdown of the event objectives, tracks, prizes, and instructions for participants..."
            className="w-full text-xs p-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
          ></textarea>
        </div>

        <div className="pt-4 border-t border-slate-100 flex justify-end gap-3">
          <Link
            to="/organizer"
            className="px-4 py-2.5 rounded-xl text-xs font-semibold bg-slate-100 hover:bg-slate-200 text-slate-700"
          >
            Cancel
          </Link>
          <button
            type="submit"
            disabled={loading}
            className="px-6 py-2.5 rounded-xl text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 shadow-md shadow-indigo-100 transition-all disabled:opacity-50"
          >
            {loading ? 'Submitting Event...' : 'Submit Event for Approval'}
          </button>
        </div>
      </form>
    </div>
  );
}
