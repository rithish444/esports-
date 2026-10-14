import React from 'react';

export const StatusBadge = ({ status }) => {
  switch (status?.toLowerCase()) {
    case 'open':
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
          OPEN
        </span>
      );
    case 'live':
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-rose-500/15 text-rose-400 border border-rose-500/40 shadow-neon-red">
          <span className="w-2 h-2 rounded-full bg-rose-500 animate-ping"></span>
          LIVE NOW
        </span>
      );
    case 'closed':
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-slate-800 text-slate-400 border border-slate-700">
          CLOSED
        </span>
      );
    case 'completed':
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-500/10 text-blue-400 border border-blue-500/30">
          COMPLETED
        </span>
      );
    default:
      return (
        <span className="inline-flex items-center px-2 py-0.5 rounded text-xs bg-slate-800 text-slate-300">
          {status}
        </span>
      );
  }
};

export const RegStatusBadge = ({ status }) => {
  switch (status?.toLowerCase()) {
    case 'approved':
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md text-xs font-semibold bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
          ✓ Approved
        </span>
      );
    case 'pending':
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md text-xs font-semibold bg-amber-500/15 text-amber-400 border border-amber-500/30">
          ⏳ Pending Review
        </span>
      );
    case 'rejected':
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md text-xs font-semibold bg-rose-500/15 text-rose-400 border border-rose-500/30">
          ✕ Rejected
        </span>
      );
    default:
      return <span className="text-xs text-slate-400">{status}</span>;
  }
};

export const ModeBadge = ({ mode }) => {
  return (
    <span className="px-2 py-0.5 rounded text-[11px] font-bold tracking-wider uppercase bg-cyan-950/80 text-cyan-400 border border-cyan-500/30">
      {mode}
    </span>
  );
};
