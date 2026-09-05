import React from 'react';

export default function StatusBadge({ status, type = 'status' }: { status: string, type?: 'status' | 'severity' | 'location' }) {
  let bgColor = 'bg-gray-100';
  let textColor = 'text-gray-800';
  let borderColor = 'border-gray-200';

  const normalized = status.toLowerCase();

  if (type === 'status') {
    if (normalized === 'unreviewed') { bgColor = 'bg-slate-100'; textColor = 'text-slate-600'; }
    else if (normalized === 'active') { bgColor = 'bg-blue-100'; textColor = 'text-blue-800'; borderColor = 'border-blue-200'; }
    else if (normalized === 'in_progress') { bgColor = 'bg-amber-100'; textColor = 'text-amber-800'; borderColor = 'border-amber-200'; }
    else if (normalized === 'resolved' || normalized === 'completed') { bgColor = 'bg-emerald-100'; textColor = 'text-emerald-800'; borderColor = 'border-emerald-200'; }
    else if (normalized === 'duplicate' || normalized === 'archived') { bgColor = 'bg-slate-100'; textColor = 'text-slate-600'; }
    else if (normalized === 'open') { bgColor = 'bg-emerald-100'; textColor = 'text-emerald-800'; borderColor = 'border-emerald-200'; }
    else if (normalized === 'accepted') { bgColor = 'bg-blue-100'; textColor = 'text-blue-800'; }
    else if (normalized === 'in_transit') { bgColor = 'bg-indigo-100'; textColor = 'text-indigo-800'; }
    else if (normalized === 'on_site') { bgColor = 'bg-purple-100'; textColor = 'text-purple-800'; }
  } else if (type === 'severity') {
    if (normalized === 'critical') { bgColor = 'bg-rose-100'; textColor = 'text-rose-800'; borderColor = 'border-rose-200'; }
    else if (normalized === 'high') { bgColor = 'bg-orange-100'; textColor = 'text-orange-800'; borderColor = 'border-orange-200'; }
    else if (normalized === 'medium') { bgColor = 'bg-yellow-100'; textColor = 'text-yellow-800'; borderColor = 'border-yellow-200'; }
    else if (normalized === 'low') { bgColor = 'bg-green-100'; textColor = 'text-green-800'; borderColor = 'border-green-200'; }
  } else if (type === 'location') {
    if (normalized === 'open') { bgColor = 'bg-emerald-100'; textColor = 'text-emerald-800'; borderColor = 'border-emerald-200'; }
    else if (normalized === 'full') { bgColor = 'bg-amber-100'; textColor = 'text-amber-800'; borderColor = 'border-amber-200'; }
    else if (normalized === 'closed') { bgColor = 'bg-rose-100'; textColor = 'text-rose-800'; borderColor = 'border-rose-200'; }
  }

  return (
    <span className={`px-2 py-0.5 text-[10px] uppercase font-bold rounded border ${bgColor} ${textColor} ${borderColor}`}>
      {status.replace('_', ' ')}
    </span>
  );
}
