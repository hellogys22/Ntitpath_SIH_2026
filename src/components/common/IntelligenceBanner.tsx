import React from 'react';
import { Compass, ShieldCheck, Zap, LineChart } from 'lucide-react';

export const IntelligenceBanner: React.FC = () => {
  return (
    <div className="bg-gradient-to-r from-govNavy-900 via-govNavy-800 to-govNavy-950 text-white px-4 py-2 border-b border-govNavy-700 shadow-xs">
      <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-2 text-xs">
        <div className="flex items-center gap-2 font-semibold tracking-wide text-slate-200">
          <span className="inline-block w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          <span className="text-white font-bold uppercase tracking-wider">NitiPath Intelligence Engine Active</span>
          <span className="text-slate-400 hidden sm:inline">|</span>
          <span className="text-slate-300 font-normal hidden sm:inline">Regulatory Decision Support System</span>
        </div>

        <div className="flex items-center gap-4 text-[11px] font-medium text-slate-300">
          <div className="flex items-center gap-1">
            <Compass className="w-3.5 h-3.5 text-amber-400" />
            <span className="text-amber-300 font-bold">PREDICT</span>
          </div>
          <span className="text-slate-600">→</span>
          <div className="flex items-center gap-1">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
            <span className="text-emerald-300 font-bold">PREVENT</span>
          </div>
          <span className="text-slate-600">→</span>
          <div className="flex items-center gap-1">
            <Zap className="w-3.5 h-3.5 text-blue-400" />
            <span className="text-blue-300 font-bold">OPTIMIZE</span>
          </div>
          <span className="text-slate-600">→</span>
          <div className="flex items-center gap-1">
            <LineChart className="w-3.5 h-3.5 text-purple-400" />
            <span className="text-purple-300 font-bold">TRACK</span>
          </div>
        </div>
      </div>
    </div>
  );
};
