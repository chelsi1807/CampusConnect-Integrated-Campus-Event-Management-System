import React, { useState, useRef, useEffect } from 'react';
import { X, Star, MessageSquare, Send, CheckCircle2 } from 'lucide-react';
import api from '../api/client';
import confetti from 'canvas-confetti';

export default function FeedbackModal({ isOpen, onClose, eventId, eventTitle, onSuccess }) {
  const dialogRef = useRef(null);
  const [rating, setRating] = useState(5);
  const [contentRating, setContentRating] = useState(5);
  const [orgRating, setOrgRating] = useState(5);
  const [venueRating, setVenueRating] = useState(5);
  const [comment, setComment] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;

    if (isOpen) {
      if (!dialog.open) {
        dialog.showModal();
        setError(null);
      }
    } else {
      if (dialog.open) dialog.close();
    }
  }, [isOpen]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);

    try {
      await api.post('/feedback/', {
        event_id: eventId,
        rating,
        content_rating: contentRating,
        organization_rating: orgRating,
        venue_rating: venueRating,
        comment: comment.trim() || undefined
      });

      confetti({ particleCount: 50, spread: 60, origin: { y: 0.7 } });
      if (onSuccess) onSuccess();
      onClose();
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to submit feedback.');
    } finally {
      setSubmitting(false);
    }
  };

  const StarSelector = ({ value, onChange, label }) => (
    <div className="flex items-center justify-between py-1">
      <span className="text-xs text-slate-600 font-medium">{label}</span>
      <div className="flex items-center gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            type="button"
            onClick={() => onChange(star)}
            className="p-1 text-slate-300 hover:text-amber-400 focus:outline-none transition-colors"
          >
            <Star
              className={`w-4 h-4 ${star <= value ? 'text-amber-400 fill-amber-400' : 'text-slate-200'}`}
            />
          </button>
        ))}
      </div>
    </div>
  );

  return (
    <dialog
      ref={dialogRef}
      onClose={onClose}
      className="p-0 rounded-3xl shadow-2xl bg-white max-w-md w-full mx-auto backdrop:bg-slate-900/60 backdrop:backdrop-blur-sm border border-slate-200"
      aria-labelledby="feedback-title"
    >
      <div className="p-6">
        <div className="flex justify-between items-start mb-4">
          <div>
            <span className="text-[11px] font-semibold text-indigo-600 uppercase tracking-wider">Participant Review</span>
            <h3 id="feedback-title" className="text-base font-bold text-slate-900 mt-0.5 line-clamp-1">
              {eventTitle}
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full hover:bg-slate-100 text-slate-400 hover:text-slate-600"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {error && (
          <div className="mb-4 p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="bg-slate-50 rounded-2xl p-4 border border-slate-100 space-y-2">
            <div className="text-center pb-2 border-b border-slate-200/60">
              <span className="text-xs font-semibold text-slate-700 block mb-1">Overall Event Rating</span>
              <div className="flex justify-center gap-1.5">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => setRating(star)}
                    className="p-1 hover:scale-110 transition-transform"
                  >
                    <Star
                      className={`w-7 h-7 ${star <= rating ? 'text-amber-400 fill-amber-400' : 'text-slate-200'}`}
                    />
                  </button>
                ))}
              </div>
            </div>

            <div className="pt-2 space-y-1">
              <StarSelector label="Content & Speaker Quality" value={contentRating} onChange={setContentRating} />
              <StarSelector label="Event Organization" value={orgRating} onChange={setOrgRating} />
              <StarSelector label="Venue & Technical Setup" value={venueRating} onChange={setVenueRating} />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Comments & Suggestions (Optional)
            </label>
            <textarea
              rows={3}
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="What did you like most? What could the organizers improve?"
              className="w-full text-xs p-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-500"
            ></textarea>
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-semibold bg-slate-100 hover:bg-slate-200 text-slate-700"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="px-5 py-2 rounded-xl text-xs font-semibold bg-indigo-600 hover:bg-indigo-700 text-white shadow-md shadow-indigo-100 flex items-center gap-1.5 disabled:opacity-50"
            >
              <Send className="w-3.5 h-3.5" />
              <span>{submitting ? 'Submitting...' : 'Submit Feedback'}</span>
            </button>
          </div>
        </form>
      </div>
    </dialog>
  );
}

