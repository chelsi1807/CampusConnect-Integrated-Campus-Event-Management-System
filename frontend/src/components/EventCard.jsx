import React from 'react';
import { Link } from 'react-router-dom';
import { Calendar, Clock, MapPin, Users, ArrowRight, CheckCircle2 } from 'lucide-react';
import StatusBadge from './StatusBadge';

export default function EventCard({ event }) {
  const confirmed = event.confirmed_count || 0;
  const capacity = event.capacity || 1;
  const percentFilled = Math.min(100, Math.round((confirmed / capacity) * 100));
  const isFull = confirmed >= capacity;

  return (
    <div className="bg-white rounded-2xl border border-slate-200/90 shadow-sm hover:shadow-md transition-all duration-200 flex flex-col overflow-hidden group">
      {/* Banner */}
      <div className="relative h-44 w-full bg-slate-100 overflow-hidden">
        <img
          src={event.banner_url || 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=800&auto=format&fit=crop&q=80'}
          alt={event.title}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          loading="lazy"
        />
        
        {/* Category Pill */}
        {event.category && (
          <div className="absolute top-3 left-3">
            <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-white/90 backdrop-blur-md text-slate-800 shadow-sm">
              {event.category.name}
            </span>
          </div>
        )}

        {/* Status Badge */}
        <div className="absolute top-3 right-3">
          <StatusBadge status={event.status} size="sm" />
        </div>

        {/* If user already registered */}
        {event.is_registered && (
          <div className="absolute bottom-3 left-3 bg-emerald-600 text-white text-[11px] font-semibold px-2.5 py-0.5 rounded-full flex items-center gap-1 shadow">
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>You're Registered</span>
          </div>
        )}
      </div>

      {/* Body */}
      <div className="p-4 flex-1 flex flex-col justify-between">
        <div>
          <h3 className="font-bold text-base text-slate-900 group-hover:text-indigo-600 transition-colors line-clamp-1 mb-2">
            {event.title}
          </h3>

          <p className="text-xs text-slate-500 line-clamp-2 mb-3 leading-relaxed">
            {event.description}
          </p>

          {/* Metadata items */}
          <div className="space-y-1.5 text-xs text-slate-600">
            <div className="flex items-center gap-2">
              <Calendar className="w-3.5 h-3.5 text-indigo-500 shrink-0" />
              <span>{event.date}</span>
              <span className="text-slate-300">•</span>
              <Clock className="w-3.5 h-3.5 text-indigo-500 shrink-0" />
              <span>{event.start_time}</span>
            </div>

            <div className="flex items-center gap-2 truncate">
              <MapPin className="w-3.5 h-3.5 text-rose-500 shrink-0" />
              <span className="truncate">{event.venue}</span>
            </div>
          </div>
        </div>

        {/* Capacity status bar */}
        <div className="mt-4 pt-3 border-t border-slate-100">
          <div className="flex justify-between items-center text-[11px] mb-1.5">
            <span className="text-slate-500 flex items-center gap-1 font-medium">
              <Users className="w-3 h-3 text-slate-400" />
              {isFull ? (
                <span className="text-amber-600 font-semibold">Capacity Full ({confirmed}/{capacity})</span>
              ) : (
                <span>{confirmed} of {capacity} seats filled</span>
              )}
            </span>
            <span className={`font-semibold ${isFull ? 'text-amber-600' : 'text-slate-700'}`}>
              {isFull ? `Waitlist: ${event.waitlist_count || 0}` : `${event.remaining_seats || 0} left`}
            </span>
          </div>

          <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
            <div
              className={`h-full rounded-full transition-all duration-300 ${
                isFull ? 'bg-amber-500' : percentFilled > 80 ? 'bg-orange-500' : 'bg-indigo-600'
              }`}
              style={{ width: `${percentFilled}%` }}
            ></div>
          </div>

          <Link
            to={`/events/${event.id}`}
            className="mt-3.5 w-full flex items-center justify-center gap-1.5 py-2 px-3 text-xs font-semibold rounded-xl bg-slate-100 hover:bg-indigo-50 text-slate-700 hover:text-indigo-600 transition-colors"
          >
            <span>View Event Details</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>
    </div>
  );
}
