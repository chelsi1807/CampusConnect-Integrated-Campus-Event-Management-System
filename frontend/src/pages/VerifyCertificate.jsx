import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { ShieldCheck, Award, Search, CheckCircle2, XCircle, Download, Calendar, MapPin, User, Building } from 'lucide-react';
import api, { getCertificateDownloadUrl } from '../api/client';

export default function VerifyCertificate() {
  const [searchParams] = useSearchParams();
  const [code, setCode] = useState(searchParams.get('code') || '');
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);

  useEffect(() => {
    const queryCode = searchParams.get('code');
    if (queryCode) {
      setCode(queryCode);
      verifyCode(queryCode);
    }
  }, [searchParams]);

  const verifyCode = async (verificationCode) => {
    if (!verificationCode.trim()) return;
    setLoading(true);
    setSearched(true);
    setResult(null);

    try {
      const res = await api.get(`/certificates/verify/${encodeURIComponent(verificationCode.trim())}`);
      setResult(res.data);
    } catch (err) {
      setResult({
        is_valid: false,
        message: "Network error occurred during verification. Please check the code."
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    verifyCode(code);
  };

  return (
    <div className="max-w-2xl mx-auto px-4 py-12 space-y-8">
      
      {/* Header */}
      <div className="text-center space-y-2">
        <div className="w-12 h-12 bg-amber-50 dark:bg-amber-950/50 text-amber-600 dark:text-amber-400 border border-amber-200 dark:border-amber-800 rounded-2xl flex items-center justify-center mx-auto shadow-sm">
          <Award className="w-6 h-6" />
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
          Public Certificate Verification
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 max-w-md mx-auto">
          Verify the authenticity of digital certificates of participation issued by CampusConnect Academic Council.
        </p>
      </div>

      {/* Search Input Box */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm p-6 space-y-4 transition-colors">
        <form onSubmit={handleSubmit} className="flex gap-2">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              required
              value={code}
              onChange={(e) => setCode(e.target.value)}
              placeholder="Enter Certificate ID (e.g. CERT-2026-CC...) or Verification Code"
              className="w-full text-xs pl-10 pr-3.5 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 font-mono"
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="px-5 py-3 rounded-xl text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 shadow-md shadow-indigo-100 dark:shadow-none transition-all disabled:opacity-50 shrink-0"
          >
            {loading ? 'Verifying...' : 'Verify Authenticity'}
          </button>
        </form>

        <p className="text-[11px] text-slate-400 dark:text-slate-500 text-center">
          You can also scan the QR code printed on any official CampusConnect certificate.
        </p>
      </div>

      {/* Verification Result Display */}
      {searched && !loading && result && (
        <div>
          {result.is_valid ? (
            <div className="bg-white dark:bg-slate-900 rounded-3xl border-2 border-emerald-400/80 dark:border-emerald-600/80 shadow-lg p-6 sm:p-8 space-y-6 animate-in fade-in zoom-in-95 transition-colors">
              
              {/* Verified Header */}
              <div className="flex items-center gap-3 pb-4 border-b border-slate-100 dark:border-slate-800">
                <div className="w-12 h-12 rounded-2xl bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0">
                  <ShieldCheck className="w-7 h-7" />
                </div>
                <div>
                  <div className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-700 dark:text-emerald-300 uppercase tracking-wider bg-emerald-50 dark:bg-emerald-950/60 px-2 py-0.5 rounded-full border border-emerald-200 dark:border-emerald-800">
                    <CheckCircle2 className="w-3 h-3" />
                    <span>Official Authenticated Record</span>
                  </div>
                  <h3 className="text-base font-extrabold text-slate-900 dark:text-white mt-0.5">
                    Certificate Verified Authentic
                  </h3>
                </div>
              </div>

              {/* Certificate Details Grid */}
              <div className="space-y-4 text-xs">
                <div className="bg-slate-50 dark:bg-slate-800 rounded-2xl p-4 border border-slate-100 dark:border-slate-700/60 grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <span className="text-[10px] uppercase font-bold text-slate-400 dark:text-slate-500 block tracking-wider">Recipient Name</span>
                    <span className="text-sm font-bold text-slate-900 dark:text-white block mt-0.5">{result.issued_to}</span>
                    {result.student_id && (
                      <span className="text-slate-500 dark:text-slate-400 font-medium">ID: {result.student_id}</span>
                    )}
                  </div>

                  <div>
                    <span className="text-[10px] uppercase font-bold text-slate-400 dark:text-slate-500 block tracking-wider">Certificate ID</span>
                    <span className="text-xs font-mono font-bold text-indigo-700 dark:text-indigo-400 block mt-0.5">{result.certificate_number}</span>
                    <span className="text-slate-400 dark:text-slate-500 text-[11px]">
                      Issued: {new Date(result.issued_at).toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' })}
                    </span>
                  </div>
                </div>

                <div className="p-4 rounded-2xl border border-indigo-100 dark:border-indigo-900/60 bg-indigo-50/40 dark:bg-indigo-950/30 space-y-2">
                  <span className="text-[10px] uppercase font-bold text-indigo-600 dark:text-indigo-400 block tracking-wider">Event Completed</span>
                  <div className="text-sm font-extrabold text-indigo-950 dark:text-indigo-200">
                    "{result.event_title}"
                  </div>
                  <div className="flex flex-wrap gap-4 text-slate-600 dark:text-slate-300 text-xs pt-1">
                    <span className="flex items-center gap-1.5"><Calendar className="w-3.5 h-3.5 text-indigo-500" /> {result.event_date}</span>
                    <span className="flex items-center gap-1.5"><MapPin className="w-3.5 h-3.5 text-rose-500" /> {result.event_venue}</span>
                  </div>
                </div>

                <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 pt-2 border-t border-slate-100 dark:border-slate-800">
                  <span>Signatory: <b>{result.organizer_name}</b></span>
                  <a
                    href={getCertificateDownloadUrl(result.certificate_number)}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold shadow-xs"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>Download PDF</span>
                  </a>
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-white dark:bg-slate-900 rounded-3xl border border-rose-200 dark:border-rose-900/60 shadow-sm p-6 text-center space-y-3 transition-colors">
              <div className="w-12 h-12 rounded-2xl bg-rose-50 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400 flex items-center justify-center mx-auto">
                <XCircle className="w-6 h-6" />
              </div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white">Certificate Not Found</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm mx-auto">
                {result.message || "We could not find an authentic record matching this certificate ID. Please ensure the code is typed accurately."}
              </p>
            </div>
          )}
        </div>
      )}

    </div>
  );
}
