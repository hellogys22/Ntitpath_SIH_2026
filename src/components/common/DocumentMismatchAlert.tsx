import React from 'react';
import { AlertTriangle, CheckCircle2, FileText, ArrowRight, ShieldAlert } from 'lucide-react';
import { useApp } from '../../context/AppContext';

export const DocumentMismatchAlert: React.FC = () => {
  const { isMismatchResolved, resolveDocumentMismatch } = useApp();

  if (isMismatchResolved) {
    return (
      <div className="bg-emerald-50 border border-emerald-300 rounded-xl p-5 shadow-xs mb-6 animate-in fade-in duration-200">
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-start gap-3">
            <div className="p-2 bg-emerald-100 rounded-lg text-emerald-700 border border-emerald-200">
              <CheckCircle2 className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold uppercase tracking-wider bg-emerald-200 text-emerald-900 px-2 py-0.5 rounded">
                  Resolved by Intelligence Engine
                </span>
                <span className="text-xs text-emerald-700 font-medium">Verified Consistency</span>
              </div>
              <h4 className="text-base font-bold text-emerald-950 mt-1">
                Document Area & Capacity Discrepancy Resolved
              </h4>
              <p className="text-xs text-emerald-800 mt-1">
                Building Plan layout and Detailed Project Report have been aligned to <strong>12,500 sq ft</strong> and <strong>35 MT/Day</strong>. Pollution Consent to Establish (CTE) risk recalculated from <strong className="text-rose-700">HIGH</strong> to <strong className="text-emerald-700">LOW</strong>.
              </p>
            </div>
          </div>

          <div className="text-right shrink-0">
            <span className="text-xs font-semibold text-slate-500 block">Current Business Readiness</span>
            <span className="text-2xl font-extrabold text-emerald-700">86%</span>
            <span className="text-[10px] text-emerald-600 block">+14% increase</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gradient-to-r from-rose-50 via-amber-50 to-orange-50 border-2 border-rose-300 rounded-xl p-5 shadow-sm mb-6 animate-in fade-in duration-200">
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        
        <div className="flex items-start gap-3.5">
          <div className="p-2.5 bg-rose-600 rounded-lg text-white shadow-xs shrink-0">
            <ShieldAlert className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-xs font-bold uppercase tracking-wider bg-rose-600 text-white px-2 py-0.5 rounded">
                ⚠ Intelligence Alert: Document Mismatch Detected
              </span>
              <span className="text-xs font-bold text-rose-700">Impact: Pollution Consent to Establish (CTE)</span>
            </div>

            <h4 className="text-base font-bold text-slate-900 mt-1">
              Building Plan vs. Project Document Inconsistency
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-3">
              <div className="bg-white p-2.5 rounded-lg border border-rose-200 text-xs">
                <span className="text-slate-500 block text-[10px] font-semibold uppercase">Building Plan Drawing</span>
                <span className="text-slate-900 font-bold text-sm">10,000 sq ft</span>
              </div>
              <div className="bg-white p-2.5 rounded-lg border border-rose-200 text-xs">
                <span className="text-slate-500 block text-[10px] font-semibold uppercase">Project Report (DPR)</span>
                <span className="text-slate-900 font-bold text-sm">12,500 sq ft</span>
              </div>
            </div>

            <p className="text-xs text-slate-700 mt-2 font-medium">
              NitiPath pre-submission document check detected a 2,500 sq ft discrepancy. Submitting conflicting area metrics will cause automatic rejection at the Environment Pollution Control Board committee.
            </p>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row md:flex-col items-stretch gap-2 shrink-0 w-full md:w-auto">
          <button
            onClick={() => resolveDocumentMismatch()}
            className="px-4 py-2.5 bg-govNavy-800 hover:bg-govNavy-900 text-white text-xs font-bold rounded-lg shadow-md transition-all flex items-center justify-center gap-2 hover:shadow-lg cursor-pointer"
          >
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            <span>Mark as Resolved (Fix Issue)</span>
          </button>
          <p className="text-[10px] text-center text-slate-500">
            Simulates document correction & risk recalculation
          </p>
        </div>

      </div>
    </div>
  );
};
