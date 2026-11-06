import React from 'react';
import { Link } from 'react-router-dom';
import { Calendar, Shield, Award, Heart, QrCode } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="bg-slate-900 text-slate-300 border-t border-slate-800 mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          
          {/* Brand */}
          <div className="md:col-span-1 space-y-3">
            <div className="flex items-center space-x-2.5">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-blue-500 to-indigo-500 flex items-center justify-center text-white shadow-md">
                <Calendar className="w-5 h-5" />
              </div>
              <span className="text-xl font-bold text-white tracking-tight">
                Campus<span className="text-indigo-400">Connect</span>
              </span>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed">
              Integrated campus event management, automated capacity & waitlists, digital QR entry passes, and verifiable academic certificates.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-xs font-semibold text-white uppercase tracking-wider mb-3">Platform Navigation</h4>
            <ul className="space-y-2 text-xs">
              <li><Link to="/events" className="hover:text-indigo-400 transition-colors">Explore All Events</Link></li>
              <li><Link to="/verify-certificate" className="hover:text-indigo-400 transition-colors">Public Certificate Verification</Link></li>
              <li><Link to="/login" className="hover:text-indigo-400 transition-colors">Portal Login</Link></li>
              <li><Link to="/register" className="hover:text-indigo-400 transition-colors">Student Registration</Link></li>
            </ul>
          </div>

          {/* Key Modules */}
          <div>
            <h4 className="text-xs font-semibold text-white uppercase tracking-wider mb-3">Core Modules</h4>
            <ul className="space-y-2 text-xs text-slate-400">
              <li className="flex items-center gap-1.5"><QrCode className="w-3.5 h-3.5 text-indigo-400" /> QR Attendance Scanner</li>
              <li className="flex items-center gap-1.5"><Award className="w-3.5 h-3.5 text-amber-400" /> Digital PDF Certificates</li>
              <li className="flex items-center gap-1.5"><Shield className="w-3.5 h-3.5 text-emerald-400" /> Role-Based Admin Workflow</li>
              <li className="flex items-center gap-1.5"><Calendar className="w-3.5 h-3.5 text-blue-400" /> Auto-Waitlist Promotion</li>
            </ul>
          </div>

          {/* Institutional Note */}
          <div>
            <h4 className="text-xs font-semibold text-white uppercase tracking-wider mb-3">Campus Council</h4>
            <div className="bg-slate-800/60 rounded-xl p-3 border border-slate-700/60 text-xs text-slate-400 leading-relaxed">
              Designed according to software engineering standards for university extracurricular events and technical symposiums.
            </div>
          </div>
        </div>

        <div className="border-t border-slate-800 mt-10 pt-6 flex flex-col sm:flex-row justify-between items-center text-xs text-slate-400">
          <p>© {new Date().getFullYear()} CampusConnect. All rights reserved.</p>
          <div className="flex items-center space-x-4 mt-3 sm:mt-0">
            <span>Built with React + Tailwind + FastAPI + SQLAlchemy + PostgreSQL</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
