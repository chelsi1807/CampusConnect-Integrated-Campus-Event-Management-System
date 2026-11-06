import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { LogIn, Calendar, Lock, Mail, AlertCircle, Sparkles, ArrowRight } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function Login() {
  const { login, quickLogin } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const from = location.state?.from?.pathname || null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const user = await login(email, password);
      redirectUser(user.role);
    } catch (err) {
      setError(err.response?.data?.detail || 'Invalid email or password.');
    } finally {
      setLoading(false);
    }
  };

  const redirectUser = (role) => {
    if (from) {
      navigate(from, { replace: true });
    } else {
      if (role === 'admin') navigate('/admin');
      else if (role === 'organizer') navigate('/organizer');
      else navigate('/student');
    }
  };

  const handleDemoLogin = async (role) => {
    setLoading(true);
    setError(null);
    try {
      const user = await quickLogin(role);
      redirectUser(user.role);
    } catch (err) {
      setError("Failed to sign in with demo account.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[75vh] flex items-center justify-center px-4 py-12">
      <div className="max-w-md w-full space-y-6">
        
        {/* Header */}
        <div className="text-center space-y-2">
          <div className="w-12 h-12 bg-gradient-to-tr from-blue-600 to-indigo-600 rounded-2xl flex items-center justify-center text-white mx-auto shadow-md shadow-indigo-200">
            <Calendar className="w-6 h-6" />
          </div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">Sign In to CampusConnect</h1>
          <p className="text-xs text-slate-500">Access your registered events, QR entry passes, and certificates</p>
        </div>

        {/* Demo Quick-Login Banner */}
        <div className="bg-indigo-50/80 rounded-2xl p-4 border border-indigo-100 space-y-2.5">
          <div className="flex items-center gap-1.5 text-xs font-bold text-indigo-900">
            <Sparkles className="w-4 h-4 text-amber-500" />
            <span>Instant Demo Accounts (1-Click Evaluation)</span>
          </div>
          <div className="grid grid-cols-3 gap-2">
            <button
              type="button"
              onClick={() => handleDemoLogin('student')}
              className="p-2 rounded-xl bg-white hover:bg-emerald-50 text-slate-700 hover:text-emerald-800 border border-slate-200 text-xs font-semibold shadow-xs transition-colors"
            >
              🎓 Student
            </button>
            <button
              type="button"
              onClick={() => handleDemoLogin('organizer')}
              className="p-2 rounded-xl bg-white hover:bg-blue-50 text-slate-700 hover:text-blue-800 border border-slate-200 text-xs font-semibold shadow-xs transition-colors"
            >
              🏛️ Organizer
            </button>
            <button
              type="button"
              onClick={() => handleDemoLogin('admin')}
              className="p-2 rounded-xl bg-white hover:bg-purple-50 text-slate-700 hover:text-purple-800 border border-slate-200 text-xs font-semibold shadow-xs transition-colors"
            >
              👑 Admin
            </button>
          </div>
        </div>

        {/* Form Card */}
        <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6 sm:p-8 space-y-5">
          {error && (
            <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Email Address</label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="student@campusconnect.edu"
                  className="w-full text-xs pl-10 pr-3.5 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Password</label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full text-xs pl-10 pr-3.5 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 px-4 rounded-xl text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 shadow-md shadow-indigo-100 flex items-center justify-center gap-1.5 transition-all disabled:opacity-50"
            >
              <LogIn className="w-4 h-4" />
              <span>{loading ? 'Authenticating...' : 'Sign In'}</span>
            </button>
          </form>

          <div className="text-center pt-2 border-t border-slate-100 text-xs text-slate-500">
            Don't have an account yet?{' '}
            <Link to="/register" className="font-semibold text-indigo-600 hover:text-indigo-800">
              Create an account
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
