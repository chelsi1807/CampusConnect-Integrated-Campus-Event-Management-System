import React, { useRef, useEffect } from 'react';
import { X, QrCode, Download, Calendar, MapPin, User, CheckCircle2 } from 'lucide-react';

export default function QRPassModal({ isOpen, onClose, registration }) {
  const dialogRef = useRef(null);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;

    if (isOpen) {
      if (!dialog.open) {
        dialog.showModal();
      }
    } else {
      if (dialog.open) {
        dialog.close();
      }
    }
  }, [isOpen]);

  if (!registration) return null;

  const handleDownload = () => {
    const link = document.createElement('a');
    link.href = registration.qr_code_data;
    link.download = `CampusConnect_Pass_${registration.registration_code}.png`;
    link.click();
  };

  return (
    <dialog
      ref={dialogRef}
      onClose={onClose}
      className="p-0 rounded-3xl shadow-2xl bg-white max-w-sm w-full mx-auto backdrop:bg-slate-900/60 backdrop:backdrop-blur-sm border border-slate-200"
      aria-labelledby="qr-pass-title"
    >
      <div className="relative overflow-hidden bg-gradient-to-br from-indigo-900 via-blue-900 to-indigo-950 text-white p-5 pb-6 text-center">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 rounded-full bg-white/10 hover:bg-white/20 text-white/80 hover:text-white transition-colors"
          aria-label="Close dialog"
        >
          <X className="w-4 h-4" />
        </button>

        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 text-xs font-semibold mb-2 border border-emerald-500/30">
          <CheckCircle2 className="w-3.5 h-3.5" />
          <span>Official Event Entry Pass</span>
        </div>

        <h3 id="qr-pass-title" className="text-base font-bold text-white line-clamp-1 px-4">
          {registration.event_title || 'Campus Event'}
        </h3>
        <p className="text-xs text-indigo-200/80 mt-0.5">CampusConnect Automated Pass</p>
      </div>

      <div className="p-6 text-center bg-white">
        {/* QR Code Container */}
        <div className="bg-slate-50 p-4 rounded-2xl border-2 border-dashed border-indigo-100 inline-block shadow-inner mx-auto mb-4">
          {registration.qr_code_data ? (
            <img
              src={registration.qr_code_data}
              alt="Event Entry QR Pass"
              className="w-48 h-48 mx-auto object-contain rounded-lg"
            />
          ) : (
            <div className="w-48 h-48 flex items-center justify-center text-slate-400">
              <QrCode className="w-16 h-16 animate-pulse" />
            </div>
          )}
        </div>

        {/* Alphanumeric Code */}
        <div className="mb-4">
          <div className="text-[11px] font-medium text-slate-400 uppercase tracking-wider">Registration Identifier</div>
          <div className="font-mono text-sm font-bold text-indigo-900 bg-indigo-50/70 border border-indigo-100 py-1.5 px-3 rounded-xl inline-block mt-1">
            {registration.registration_code}
          </div>
        </div>

        {/* Details list */}
        <div className="bg-slate-50 rounded-xl p-3 text-left space-y-2 text-xs text-slate-600 border border-slate-100 mb-5">
          <div className="flex items-center gap-2">
            <User className="w-3.5 h-3.5 text-indigo-500 shrink-0" />
            <span className="font-medium text-slate-900">
              {registration.user?.full_name || 'Student Participant'}
            </span>
            {registration.user?.student_id && (
              <span className="text-slate-400">({registration.user.student_id})</span>
            )}
          </div>
          <div className="flex items-center gap-2">
            <Calendar className="w-3.5 h-3.5 text-indigo-500 shrink-0" />
            <span>{registration.event_date} • {registration.event_start_time}</span>
          </div>
          <div className="flex items-center gap-2 truncate">
            <MapPin className="w-3.5 h-3.5 text-rose-500 shrink-0" />
            <span className="truncate">{registration.event_venue}</span>
          </div>
        </div>

        {/* Buttons */}
        <div className="flex gap-2">
          <button
            onClick={handleDownload}
            className="flex-1 flex items-center justify-center gap-1.5 py-2.5 px-4 rounded-xl text-xs font-semibold bg-indigo-600 hover:bg-indigo-700 text-white shadow-md shadow-indigo-100 transition-all"
          >
            <Download className="w-4 h-4" />
            <span>Download Pass</span>
          </button>
          <button
            onClick={onClose}
            className="py-2.5 px-4 rounded-xl text-xs font-semibold bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors"
          >
            Close
          </button>
        </div>

        <p className="text-[11px] text-slate-400 mt-3">
          Present this QR pass to the coordinator at venue check-in.
        </p>
      </div>
    </dialog>
  );
}
