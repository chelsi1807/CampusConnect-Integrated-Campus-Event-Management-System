import React, { useState, useEffect } from 'react';
import { Award, Download, ExternalLink, Calendar, CheckCircle2, Copy, Check } from 'lucide-react';
import api from '../../api/client';

export default function MyCertificates() {
  const [certificates, setCertificates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [copiedId, setCopiedId] = useState(null);

  useEffect(() => {
    fetchCertificates();
  }, []);

  const fetchCertificates = async () => {
    try {
      setLoading(true);
      const res = await api.get('/certificates/my-certificates');
      setCertificates(res.data);
    } catch (e) {
      console.error("Failed to fetch certificates:", e);
    } finally {
      setLoading(false);
    }
  };

  const copyVerifyLink = (verificationCode) => {
    const url = `${window.location.origin}/verify-certificate?code=${verificationCode}`;
    navigator.clipboard.writeText(url);
    setCopiedId(verificationCode);
    setTimeout(() => setCopiedId(null), 2500);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">My Digital Certificates</h1>
        <p className="text-xs text-slate-500 mt-1">
          Official, cryptographically verifiable certificates of participation generated for attended campus events.
        </p>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {[1, 2].map(i => (
            <div key={i} className="h-64 bg-slate-100 rounded-3xl animate-pulse"></div>
          ))}
        </div>
      ) : certificates.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-3xl border border-slate-200 p-8 shadow-xs">
          <Award className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <h3 className="text-base font-bold text-slate-800">No certificates earned yet</h3>
          <p className="text-xs text-slate-500 mt-1 mb-4">
            Attend approved campus events and have your QR code scanned to receive verified digital certificates.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {certificates.map((cert) => (
            <div
              key={cert.id}
              className="bg-white rounded-3xl border border-slate-200/90 shadow-xs hover:shadow-md transition-all overflow-hidden flex flex-col justify-between"
            >
              {/* Certificate visual top header */}
              <div className="bg-gradient-to-r from-amber-600 via-amber-700 to-amber-800 text-white p-5 flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-xl bg-white/20 flex items-center justify-center backdrop-blur-xs">
                    <Award className="w-5 h-5 text-amber-200" />
                  </div>
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-amber-200/90 block">Official Record</span>
                    <span className="text-xs font-mono font-bold">{cert.certificate_number}</span>
                  </div>
                </div>

                <span className="text-[11px] font-semibold bg-emerald-500/20 text-emerald-100 px-2.5 py-0.5 rounded-full border border-emerald-400/30 flex items-center gap-1">
                  <CheckCircle2 className="w-3 h-3 text-emerald-300" /> Verified
                </span>
              </div>

              {/* Certificate Details */}
              <div className="p-6 space-y-4 flex-1">
                <div>
                  <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">Event Participation</span>
                  <h3 className="text-base font-extrabold text-slate-900 mt-0.5">
                    {cert.event_title}
                  </h3>
                </div>

                <div className="bg-slate-50 rounded-2xl p-3.5 border border-slate-100 text-xs text-slate-600 space-y-1.5">
                  <div className="flex justify-between">
                    <span className="text-slate-400">Awarded To:</span>
                    <b className="text-slate-800">{cert.student_name}</b>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Event Date:</span>
                    <span className="text-slate-800">{cert.event_date}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Issuing Convener:</span>
                    <span className="text-slate-800">{cert.organizer_name}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Date Issued:</span>
                    <span className="text-slate-800">
                      {new Date(cert.issued_at).toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' })}
                    </span>
                  </div>
                </div>
              </div>

              {/* Actions Footer */}
              <div className="p-5 bg-slate-50/70 border-t border-slate-100 flex flex-wrap items-center justify-between gap-2">
                <button
                  onClick={() => copyVerifyLink(cert.verification_code)}
                  className="px-3 py-2 rounded-xl text-xs font-semibold bg-white border border-slate-200 hover:bg-slate-100 text-slate-700 flex items-center gap-1.5 transition-colors"
                >
                  {copiedId === cert.verification_code ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-emerald-600" />
                      <span className="text-emerald-700">Link Copied!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5 text-slate-400" />
                      <span>Share Verify Link</span>
                    </>
                  )}
                </button>

                <a
                  href={`/api/certificates/download/${cert.certificate_number}`}
                  target="_blank"
                  rel="noreferrer"
                  className="px-4 py-2 rounded-xl text-xs font-bold bg-indigo-600 hover:bg-indigo-700 text-white shadow-sm flex items-center gap-1.5 transition-all"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Download PDF Certificate</span>
                </a>
              </div>
            </div>
          ))}
        </div>
      )}

    </div>
  );
}
