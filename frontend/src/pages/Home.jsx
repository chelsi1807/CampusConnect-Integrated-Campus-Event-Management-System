import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  Calendar, 
  Sparkles, 
  QrCode, 
  Award, 
  Users, 
  Search, 
  ArrowRight, 
  CheckCircle, 
  ShieldCheck, 
  Code, 
  Cpu, 
  BookOpen, 
  Trophy,
  Layers
} from 'lucide-react';
import api from '../api/client';
import { useAuth } from '../context/AuthContext';
import EventCard from '../components/EventCard';

export default function Home() {
  const { isAuthenticated, user, quickLogin } = useAuth();
  const navigate = useNavigate();
  const [featuredEvents, setFeaturedEvents] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [eventsRes, catRes] = await Promise.all([
          api.get('/events/?limit=6'),
          api.get('/categories/')
        ]);
        setFeaturedEvents(eventsRes.data.events || []);
        setCategories(catRes.data || []);
      } catch (err) {
        console.error("Failed to fetch homepage data:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  return (
    <div className="space-y-16 pb-16">
      
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-b from-indigo-900 via-blue-900 to-slate-900 text-white pt-16 pb-24 px-4 sm:px-6 lg:px-8">
        {/* Decorative background grid pattern */}
        <div className="absolute inset-0 opacity-10 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px]"></div>
        
        <div className="relative max-w-5xl mx-auto text-center space-y-6">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-indigo-500/20 border border-indigo-400/30 text-indigo-200 text-xs font-semibold backdrop-blur-sm animate-pulse">
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            <span>Integrated Campus Event Management Platform</span>
          </div>

          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-white leading-tight">
            Discover, Register & Excel in <br />
            <span className="bg-gradient-to-r from-amber-400 via-indigo-300 to-sky-300 bg-clip-text text-transparent">
              Campus Life Events
            </span>
          </h1>

          <p className="max-w-2xl mx-auto text-sm sm:text-base text-indigo-100/80 leading-relaxed font-normal">
            CampusConnect centralizes technical hackathons, workshops, cultural galas, and guest lectures.
            Enjoy instant digital registration, automated waitlists, contactless QR attendance passes, and cryptographically verified digital certificates.
          </p>

          {/* Action CTAs */}
          <div className="flex flex-wrap items-center justify-center gap-3 pt-4">
            <Link
              to="/events"
              className="px-6 py-3 rounded-xl text-sm font-bold bg-indigo-600 hover:bg-indigo-500 text-white shadow-lg shadow-indigo-600/30 flex items-center gap-2 transition-all hover:scale-105"
            >
              <Search className="w-4 h-4" />
              <span>Explore All Events</span>
            </Link>

            {!isAuthenticated ? (
              <Link
                to="/register"
                className="px-6 py-3 rounded-xl text-sm font-semibold bg-white/10 hover:bg-white/20 text-white border border-white/20 backdrop-blur-sm transition-all"
              >
                Create Account
              </Link>
            ) : (
              <Link
                to={user?.role === 'admin' ? '/admin' : user?.role === 'organizer' ? '/organizer' : '/student'}
                className="px-6 py-3 rounded-xl text-sm font-semibold bg-emerald-600 hover:bg-emerald-500 text-white shadow-lg shadow-emerald-600/20 flex items-center gap-2 transition-all"
              >
                <Layers className="w-4 h-4" />
                <span>Go to My Dashboard</span>
              </Link>
            )}
          </div>

          {/* 1-Click Demo Evaluation Bar */}
          <div className="pt-8">
            <div className="bg-white/10 backdrop-blur-md rounded-2xl p-4 border border-white/15 max-w-xl mx-auto text-left">
              <div className="text-[11px] font-semibold text-amber-300 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5" />
                <span>Evaluation Quick-Launch (1-Click Switcher)</span>
              </div>
              <div className="grid grid-cols-3 gap-2">
                <button
                  onClick={async () => { await quickLogin('student'); navigate('/student'); }}
                  className="py-2 px-2.5 rounded-xl bg-white/10 hover:bg-emerald-500/30 text-white text-xs font-medium border border-white/10 hover:border-emerald-400 transition-colors text-center"
                >
                  <div className="font-bold text-emerald-300">🎓 Student</div>
                  <div className="text-[10px] text-white/70 truncate">David Chen</div>
                </button>
                <button
                  onClick={async () => { await quickLogin('organizer'); navigate('/organizer'); }}
                  className="py-2 px-2.5 rounded-xl bg-white/10 hover:bg-blue-500/30 text-white text-xs font-medium border border-white/10 hover:border-blue-400 transition-colors text-center"
                >
                  <div className="font-bold text-blue-300">🏛️ Organizer</div>
                  <div className="text-[10px] text-white/70 truncate">Prof. Jenkins</div>
                </button>
                <button
                  onClick={async () => { await quickLogin('admin'); navigate('/admin'); }}
                  className="py-2 px-2.5 rounded-xl bg-white/10 hover:bg-purple-500/30 text-white text-xs font-medium border border-white/10 hover:border-purple-400 transition-colors text-center"
                >
                  <div className="font-bold text-purple-300">👑 Admin</div>
                  <div className="text-[10px] text-white/70 truncate">Dr. Vance</div>
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Metrics Counter Bar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-10 relative z-20">
        <div className="bg-white rounded-2xl shadow-xl border border-slate-200/80 p-6 grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
          <div>
            <div className="text-2xl sm:text-3xl font-extrabold text-indigo-600">100%</div>
            <div className="text-xs font-medium text-slate-500 mt-1">Centralized Digital Events</div>
          </div>
          <div>
            <div className="text-2xl sm:text-3xl font-extrabold text-emerald-600">Zero-Wait</div>
            <div className="text-xs font-medium text-slate-500 mt-1">Automated Waitlist Promotion</div>
          </div>
          <div>
            <div className="text-2xl sm:text-3xl font-extrabold text-blue-600">&lt; 2s</div>
            <div className="text-xs font-medium text-slate-500 mt-1">QR Attendance Verification</div>
          </div>
          <div>
            <div className="text-2xl sm:text-3xl font-extrabold text-amber-600">Instant</div>
            <div className="text-xs font-medium text-slate-500 mt-1">Verifiable PDF Certificates</div>
          </div>
        </div>
      </div>

      {/* Categories Bar */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-end mb-6">
          <div>
            <span className="text-xs font-bold text-indigo-600 uppercase tracking-wider">Explore by Interest</span>
            <h2 className="text-2xl font-bold text-slate-900 mt-1">Campus Event Categories</h2>
          </div>
          <Link to="/events" className="text-xs font-semibold text-indigo-600 hover:text-indigo-800 flex items-center gap-1">
            <span>View All</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          {categories.map((cat) => (
            <Link
              key={cat.id}
              to={`/events?category_id=${cat.id}`}
              className="p-4 rounded-2xl bg-white border border-slate-200/80 shadow-sm hover:shadow-md hover:border-indigo-300 hover:-translate-y-1 transition-all text-center group"
            >
              <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center mx-auto mb-2.5 group-hover:bg-indigo-600 group-hover:text-white transition-colors">
                <Calendar className="w-5 h-5" />
              </div>
              <div className="text-xs font-bold text-slate-800 group-hover:text-indigo-600 transition-colors">
                {cat.name}
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* Featured Upcoming Events */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-end mb-6">
          <div>
            <span className="text-xs font-bold text-indigo-600 uppercase tracking-wider">Upcoming Highlights</span>
            <h2 className="text-2xl font-bold text-slate-900 mt-1">Featured Campus Events</h2>
          </div>
          <Link to="/events" className="text-xs font-semibold text-indigo-600 hover:text-indigo-800 flex items-center gap-1">
            <span>Explore All</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-80 bg-slate-100 rounded-2xl animate-pulse"></div>
            ))}
          </div>
        ) : featuredEvents.length === 0 ? (
          <div className="p-12 text-center bg-white rounded-2xl border border-slate-200">
            <Calendar className="w-10 h-10 text-slate-300 mx-auto mb-2" />
            <p className="text-sm text-slate-500">No events found currently.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {featuredEvents.map((evt) => (
              <EventCard key={evt.id} event={evt} />
            ))}
          </div>
        )}
      </section>

      {/* Lifecycle Workflow Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-gradient-to-tr from-slate-900 via-indigo-950 to-slate-900 rounded-3xl p-8 sm:p-12 text-white">
          <div className="text-center max-w-2xl mx-auto mb-10">
            <span className="text-xs font-bold text-indigo-400 uppercase tracking-wider">How It Works</span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-white mt-1">
              End-to-End Campus Event Lifecycle
            </h2>
            <p className="text-xs sm:text-sm text-slate-300 mt-2">
              From proposal to participation certificate, everything is tracked with role-based governance.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="bg-white/5 border border-white/10 rounded-2xl p-5 backdrop-blur-sm">
              <div className="w-10 h-10 rounded-xl bg-indigo-500/20 text-indigo-400 flex items-center justify-center font-bold text-base mb-3 border border-indigo-400/30">
                1
              </div>
              <h4 className="text-sm font-bold text-white mb-1">Proposal & Approval</h4>
              <p className="text-xs text-slate-300 leading-relaxed">
                Faculty or organizers submit event proposals with venues, capacity, and deadlines. Administrators review and approve before publication.
              </p>
            </div>

            <div className="bg-white/5 border border-white/10 rounded-2xl p-5 backdrop-blur-sm">
              <div className="w-10 h-10 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold text-base mb-3 border border-emerald-400/30">
                2
              </div>
              <h4 className="text-sm font-bold text-white mb-1">Central Registration</h4>
              <p className="text-xs text-slate-300 leading-relaxed">
                Students register with 1-click. If capacity is exhausted, users join the prioritized waitlist with automatic promotion when a seat frees up.
              </p>
            </div>

            <div className="bg-white/5 border border-white/10 rounded-2xl p-5 backdrop-blur-sm">
              <div className="w-10 h-10 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center font-bold text-base mb-3 border border-amber-400/30">
                3
              </div>
              <h4 className="text-sm font-bold text-white mb-1">QR Attendance Pass</h4>
              <p className="text-xs text-slate-300 leading-relaxed">
                Confirmed participants receive a cryptographic QR entry pass. Event coordinators scan it with their camera to verify check-in under 2 seconds.
              </p>
            </div>

            <div className="bg-white/5 border border-white/10 rounded-2xl p-5 backdrop-blur-sm">
              <div className="w-10 h-10 rounded-xl bg-sky-500/20 text-sky-400 flex items-center justify-center font-bold text-base mb-3 border border-sky-400/30">
                4
              </div>
              <h4 className="text-sm font-bold text-white mb-1">Certificates & Analytics</h4>
              <p className="text-xs text-slate-300 leading-relaxed">
                Attendees receive official ReportLab PDF participation certificates with unique IDs and public QR verification, while organizers review feedback.
              </p>
            </div>
          </div>
        </div>
      </section>

    </div>
  );
}

