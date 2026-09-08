import React from 'react';
import { AlertCircle, CheckCircle, ArrowRight, ExternalLink, ShieldAlert } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../../context/AppContext';

export const BottleneckCard: React.FC = () => {
  const navigate = useNavigate();
  const { isMismatchResolved, resolveDocumentMismatch } = useApp();

  if (isMismatchResolved) {
    return (
      <div className="bg-white rounded-xl border border-emerald-300 p-5 shadow-xs mb-6">
        <div className="flex items-center justify-between pb-3 border-b border-emerald-100">
          <div className="flex items-center gap-2">
            <CheckCircle className="w-5 h-5 text-emerald-600" />
            <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">Current Bottleneck Status</h3>
          </div>
          <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 border border-emerald-300">
            BOTTLENECK CLEARED
          </span>
        </div>

        <div className="mt-3 flex items-center justify-between">
          <div>
            <h4 className="text-base font-bold text-slate-900">Pollution Consent to Establish (CTE)</h4>
            <p className="text-xs text-slate-600 mt-0.5">
              All document inconsistencies resolved. Application is ready for final board review.
            </p>
          </div>
          <button 
            onClick={() => navigate('/approvals/APP-001')}
            className="px-3.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-semibold rounded-lg border border-slate-300 transition-colors flex items-center gap-1.5"
          >
            <span>View Approval</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl border-2 border-rose-300 p-6 shadow-sm mb-6 relative overflow-hidden">
      <div className="absolute top-0 left-0 w-2 h-full bg-rose-600" />

      <div className="flex items-center justify-between pb-3 border-b border-slate-100">
        <div className="flex items-center gap-2">
          <ShieldAlert className="w-5 h-5 text-rose-600" />
          <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">Current Bottleneck</h3>
        </div>
        <span className="px-3 py-1 rounded-full text-xs font-extrabold bg-rose-100 text-rose-800 border border-rose-300 flex items-center gap-1">
          <span className="w-2 h-2 rounded-full bg-rose-600 animate-ping" />
          HIGH RISK BOTTLENECK
        </span>
      </div>

      <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-6 items-center">
        <div className="md:col-span-2">
          <div className="flex items-baseline gap-2">
            <h4 className="text-lg font-extrabold text-slate-900">Pollution Consent to Establish (CTE)</h4>
            <span className="text-xs font-medium text-slate-500">Environment Board</span>
          </div>

          <div className="mt-2 bg-rose-50/70 p-3 rounded-lg border border-rose-200">
            <p className="text-xs font-bold text-rose-950">Root Cause of Delay:</p>
            <p className="text-xs text-rose-900 mt-0.5 font-medium">
              Required Form 1-A declaration is missing and production-capacity information differs across submitted documents (10,000 sq ft vs 12,500 sq ft).
            </p>
          </div>

          <div className="mt-3">
            <p className="text-xs font-bold text-slate-700">Recommended Action:</p>
            <p className="text-xs text-slate-800 font-medium">
              Correct capacity information in DPR and upload the missing environmental declaration document.
            </p>
          </div>
        </div>

        <div className="flex flex-col gap-2.5 justify-center md:border-l md:border-slate-100 md:pl-6">
          <button
            onClick={() => resolveDocumentMismatch()}
            className="w-full px-4 py-2.5 bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold rounded-lg shadow-sm transition-all flex items-center justify-center gap-2 cursor-pointer"
          >
            <span>Resolve Issue</span>
            <ArrowRight className="w-4 h-4" />
          </button>
          
          <button
            onClick={() => navigate('/approvals/APP-001')}
            className="w-full px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-semibold rounded-lg border border-slate-300 transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
          >
            <span>View Approval Details</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
};
