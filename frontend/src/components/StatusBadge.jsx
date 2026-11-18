import React from 'react';
import { CheckCircle2, Clock, XCircle, AlertCircle, Award, UserCheck, Ban } from 'lucide-react';

const statusConfigs = {
  // Event Statuses
  approved: { 
    label: 'Approved', 
    bg: 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/60 dark:text-emerald-300 dark:border-emerald-800', 
    icon: CheckCircle2 
  },
  pending: { 
    label: 'Pending Review', 
    bg: 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/60 dark:text-amber-300 dark:border-amber-800', 
    icon: Clock 
  },
  rejected: { 
    label: 'Rejected', 
    bg: 'bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-950/60 dark:text-rose-300 dark:border-rose-800', 
    icon: XCircle 
  },
  completed: { 
    label: 'Completed', 
    bg: 'bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950/60 dark:text-blue-300 dark:border-blue-800', 
    icon: Award 
  },
  cancelled: { 
    label: 'Cancelled', 
    bg: 'bg-slate-100 text-slate-600 border-slate-200 dark:bg-slate-800 dark:text-slate-400 dark:border-slate-700', 
    icon: Ban 
  },

  // Registration Statuses
  confirmed: { 
    label: 'Confirmed Seat', 
    bg: 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/60 dark:text-emerald-300 dark:border-emerald-800', 
    icon: CheckCircle2 
  },
  waitlisted: { 
    label: 'Waitlisted', 
    bg: 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/60 dark:text-amber-300 dark:border-amber-800', 
    icon: Clock 
  },
  attended: { 
    label: 'Attended', 
    bg: 'bg-indigo-50 text-indigo-700 border-indigo-200 dark:bg-indigo-950/60 dark:text-indigo-300 dark:border-indigo-800', 
    icon: UserCheck 
  },
};

export default function StatusBadge({ status, position = null, size = 'sm' }) {
  const norm = (status || '').toLowerCase();
  const config = statusConfigs[norm] || { 
    label: status, 
    bg: 'bg-slate-100 text-slate-700 border-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700', 
    icon: AlertCircle 
  };
  const Icon = config.icon;

  const sizeClasses = size === 'lg' ? 'px-3 py-1.5 text-sm gap-1.5' : 'px-2.5 py-1 text-xs gap-1';

  return (
    <span className={`inline-flex items-center font-medium rounded-full border ${config.bg} ${sizeClasses}`}>
      <Icon className={size === 'lg' ? 'w-4 h-4' : 'w-3.5 h-3.5'} />
      <span>{norm === 'waitlisted' && position ? `Waitlist #${position}` : config.label}</span>
    </span>
  );
}
