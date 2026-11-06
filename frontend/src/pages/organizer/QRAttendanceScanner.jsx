import React, { useState, useEffect, useRef } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { 
  QrCode, 
  Camera, 
  CheckCircle2, 
  XCircle, 
  AlertCircle, 
  ArrowLeft, 
  RefreshCw, 
  Keyboard, 
  Users,
  Volume2
} from 'lucide-react';
import { Html5Qrcode } from 'html5-qrcode';
import api from '../../api/client';
import confetti from 'canvas-confetti';

export default function QRAttendanceScanner() {
  const [searchParams] = useSearchParams();
  const [events, setEvents] = useState([]);
  const [selectedEventId, setSelectedEventId] = useState(searchParams.get('event_id') || '');
  const [eventDetails, setEventDetails] = useState(null);
  
  // Scanning state
  const [scanning, setScanning] = useState(false);
  const [scanResult, setScanResult] = useState(null); // { success, message, studentName, time }
  const [manualCode, setManualCode] = useState('');
  const [loadingAction, setLoadingAction] = useState(false);
  const [attendeeCount, setAttendeeCount] = useState(0);

  const scannerRef = useRef(null);
  const html5QrCodeRef = useRef(null);

  useEffect(() => {
    fetchOrganizerEvents();
  }, []);

  useEffect(() => {
    if (selectedEventId) {
      fetchEventInfo(selectedEventId);
    }
  }, [selectedEventId]);

  // Clean up scanner on unmount
  useEffect(() => {
    return () => {
      stopCameraScanner();
    };
  }, []);

  const fetchOrganizerEvents = async () => {
    try {
      const res = await api.get('/events/organizer/my-events');
      const approvedEvents = res.data.filter(e => e.status === 'approved' || e.status === 'completed');
      setEvents(approvedEvents);
      if (!selectedEventId && approvedEvents.length > 0) {
        setSelectedEventId(String(approvedEvents[0].id));
      }
    } catch (e) {
      console.error("Failed to load organizer events:", e);
    }
  };

  const fetchEventInfo = async (id) => {
    try {
      const [evRes, statsRes] = await Promise.all([
        api.get(`/events/${id}`),
        api.get(`/attendance/event/${id}/stats`)
      ]);
      setEventDetails(evRes.data);
      setAttendeeCount(statsRes.data.total_checked_in);
    } catch (e) {
      console.error("Failed to load event details:", e);
    }
  };

  const startCameraScanner = async () => {
    if (!selectedEventId) {
      alert("Please select an event before scanning.");
      return;
    }

    try {
      const html5QrCode = new Html5Qrcode("reader");
      html5QrCodeRef.current = html5QrCode;

      const config = { fps: 10, qrbox: { width: 250, height: 250 } };

      await html5QrCode.start(
        { facingMode: "environment" },
        config,
        (decodedText) => {
          handleScannedCode(decodedText);
        },
        (errorMessage) => {
          // ignore scan frame errors
        }
      );
      setScanning(true);
    } catch (err) {
      console.error("Failed to start camera scanner:", err);
      alert("Could not access camera. Please ensure permissions are granted or use manual code entry.");
    }
  };

  const stopCameraScanner = async () => {
    if (html5QrCodeRef.current && scanning) {
      try {
        await html5QrCodeRef.current.stop();
        html5QrCodeRef.current.clear();
      } catch (e) {
        console.error("Error stopping scanner:", e);
      }
      setScanning(false);
    }
  };

  const handleScannedCode = async (codeText) => {
    if (loadingAction) return;

    try {
      setLoadingAction(true);
      const res = await api.post('/attendance/check-in', {
        registration_code: codeText,
        event_id: parseInt(selectedEventId),
        check_in_method: 'qr_scan'
      });

      confetti({ particleCount: 50, spread: 60, origin: { y: 0.7 } });
      setScanResult({
        success: true,
        message: "Attendance Verified & Checked In!",
        studentName: res.data.user?.full_name || "Student",
        studentId: res.data.user?.student_id || "",
        time: new Date(res.data.checked_in_at).toLocaleTimeString()
      });
      setAttendeeCount(prev => prev + 1);

    } catch (err) {
      setScanResult({
        success: false,
        message: err.response?.data?.detail || "Check-in failed. Invalid QR code or registration.",
        studentName: null,
        studentId: null,
        time: new Date().toLocaleTimeString()
      });
    } finally {
      setLoadingAction(false);
    }
  };

  const handleManualSubmit = (e) => {
    e.preventDefault();
    if (!manualCode.trim()) return;
    handleScannedCode(manualCode.trim());
    setManualCode('');
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      
      {/* Header */}
      <div>
        <Link
          to="/organizer"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-indigo-600 transition-colors mb-2"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to Organizer Dashboard</span>
        </Link>
        <h1 className="text-2xl font-bold text-slate-900">QR Code Attendance Check-In</h1>
        <p className="text-xs text-slate-500 mt-0.5">
          Scan student entry passes in real-time or submit registration codes for venue check-in.
        </p>
      </div>

      {/* Event Selector & Live Counter */}
      <div className="bg-white rounded-3xl border border-slate-200 p-5 shadow-xs flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="w-full sm:w-80">
          <label className="block text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-1">
            Active Event
          </label>
          <select
            value={selectedEventId}
            onChange={(e) => {
              stopCameraScanner();
              setSelectedEventId(e.target.value);
            }}
            className="w-full text-xs font-bold p-2.5 rounded-xl border border-slate-200 bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
          >
            {events.map((ev) => (
              <option key={ev.id} value={ev.id}>
                {ev.title} ({ev.date})
              </option>
            ))}
          </select>
        </div>

        <div className="flex items-center gap-6 self-stretch sm:self-auto justify-between sm:justify-end border-t sm:border-t-0 pt-3 sm:pt-0 border-slate-100">
          <div>
            <span className="text-[10px] uppercase font-bold text-slate-400 block tracking-wider">Checked In</span>
            <span className="text-xl font-extrabold text-emerald-600 block mt-0.5">
              {attendeeCount} / {eventDetails?.capacity || '—'}
            </span>
          </div>
          <Link
            to={`/organizer/attendees/${selectedEventId}`}
            className="px-3.5 py-2 rounded-xl text-xs font-semibold bg-indigo-50 text-indigo-700 hover:bg-indigo-100 transition-colors"
          >
            View Full List
          </Link>
        </div>
      </div>

      {/* Scanner & Result Layout */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* Left Column: Camera Viewport */}
        <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex justify-between items-center mb-3">
              <span className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
                <Camera className="w-4 h-4 text-indigo-600" />
                <span>Live Camera View</span>
              </span>
              <span className="text-[11px] text-slate-400">
                {scanning ? 'Camera Active' : 'Camera Standby'}
              </span>
            </div>

            {/* Video Viewport Container */}
            <div className="relative w-full aspect-square bg-slate-950 rounded-2xl overflow-hidden flex items-center justify-center border border-slate-800">
              <div id="reader" className="w-full h-full"></div>
              
              {!scanning && (
                <div className="text-center p-6 space-y-3 z-10">
                  <div className="w-16 h-16 rounded-2xl bg-white/10 text-white/80 flex items-center justify-center mx-auto">
                    <QrCode className="w-8 h-8" />
                  </div>
                  <p className="text-xs text-slate-300 max-w-xs">
                    Point camera at student's QR entry pass for instantaneous check-in.
                  </p>
                </div>
              )}
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-100 flex gap-2">
            {!scanning ? (
              <button
                type="button"
                onClick={startCameraScanner}
                className="w-full py-2.5 px-4 rounded-xl text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm flex items-center justify-center gap-1.5 transition-all"
              >
                <Camera className="w-4 h-4" />
                <span>Start Camera Scanner</span>
              </button>
            ) : (
              <button
                type="button"
                onClick={stopCameraScanner}
                className="w-full py-2.5 px-4 rounded-xl text-xs font-bold bg-rose-600 hover:bg-rose-700 text-white shadow-sm transition-all"
              >
                Stop Camera
              </button>
            )}
          </div>
        </div>

        {/* Right Column: Scan Feedback & Manual Fallback */}
        <div className="space-y-6">
          
          {/* Latest Result Banner */}
          {scanResult ? (
            <div
              className={`p-6 rounded-3xl border shadow-sm space-y-3 transition-all ${
                scanResult.success
                  ? 'bg-emerald-50 border-emerald-300 text-emerald-900'
                  : 'bg-rose-50 border-rose-300 text-rose-900'
              }`}
            >
              <div className="flex items-center gap-2.5">
                {scanResult.success ? (
                  <CheckCircle2 className="w-7 h-7 text-emerald-600 shrink-0" />
                ) : (
                  <XCircle className="w-7 h-7 text-rose-600 shrink-0" />
                )}
                <div>
                  <h3 className="font-extrabold text-sm">
                    {scanResult.success ? 'Check-in Verified!' : 'Check-in Rejected'}
                  </h3>
                  <span className="text-[10px] text-slate-500">{scanResult.time}</span>
                </div>
              </div>

              <p className="text-xs font-medium leading-relaxed">
                {scanResult.message}
              </p>

              {scanResult.studentName && (
                <div className="p-3 bg-white/80 rounded-xl text-xs space-y-0.5 border border-emerald-200">
                  <div className="font-bold text-slate-900">Attendee: {scanResult.studentName}</div>
                  {scanResult.studentId && (
                    <div className="text-[11px] text-slate-500">ID: {scanResult.studentId}</div>
                  )}
                </div>
              )}
            </div>
          ) : (
            <div className="p-8 rounded-3xl border border-dashed border-slate-200 bg-white text-center text-slate-400 space-y-2">
              <QrCode className="w-8 h-8 mx-auto text-slate-300" />
              <div className="text-xs font-semibold">Awaiting QR scan</div>
              <div className="text-[11px]">Results will appear here immediately upon scanning.</div>
            </div>
          )}

          {/* Manual Entry Fallback */}
          <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-xs space-y-3">
            <span className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
              <Keyboard className="w-4 h-4 text-indigo-600" />
              <span>Manual Registration Code Entry</span>
            </span>
            <p className="text-[11px] text-slate-400">
              If participant's phone screen is cracked or low battery, type their pass code (e.g. CC-E1-U4-...).
            </p>

            <form onSubmit={handleManualSubmit} className="flex gap-2">
              <input
                type="text"
                value={manualCode}
                onChange={(e) => setManualCode(e.target.value)}
                placeholder="CC-E1-U4-..."
                className="flex-1 text-xs px-3.5 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 font-mono uppercase"
              />
              <button
                type="submit"
                disabled={loadingAction || !manualCode.trim()}
                className="px-4 py-2.5 rounded-xl text-xs font-bold bg-indigo-600 hover:bg-indigo-700 text-white shadow-sm disabled:opacity-50 transition-all shrink-0"
              >
                {loadingAction ? 'Verifying...' : 'Check In'}
              </button>
            </form>
          </div>
        </div>
      </div>

    </div>
  );
}

