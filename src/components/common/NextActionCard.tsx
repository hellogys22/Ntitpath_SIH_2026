import React from 'react';
import { CheckCircle2, AlertTriangle, Circle, ArrowRight, Zap } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { useNavigate } from 'react-router-dom';

export const NextActionCard: React.FC = () => {
  const { isMismatchResolved, resolveDocumentMismatch } = useApp();
  const navigate = useNavigate();

  return (
    <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm mb-6">
      <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
        <div className="flex items-center gap-2">
          <Zap className="w-5 h-5 text-govSaffron-600" />
          <h3 className="text-base font-bold text-slate-900">Recommended Next Action</h3>
        </div>
        <span className="text-xs text-slate-500 font-medium">Prioritized Step 3 of 6</span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
        
        {/* Priority Highlight Box */}
        <div className="md:col-span-6 bg-slate-50 p-4 rounded-xl border border-slate-200 flex flex-col justify-between">
          <div>
            <span className="text-[10px] uppercase font-bold tracking-wider text-amber-800 bg-amber-100 px-2 py-0.5 rounded border border-amber-200">
              Highest Priority Action
            </span>
            
            <h4 className="text-base font-bold text-slate-900 mt-2">
              {!isMismatchResolved 
                ? 'Resolve Production-Capacity & Area Mismatch' 
                : 'Submit Pollution CTE Application'}
            </h4>

            <p className="text-xs text-slate-600 mt-1">
              {!isMismatchResolved 
                ? 'Correct the constructed area difference (10,000 sq ft vs 12,500 sq ft) in building layout drawings before submitting to the Pollution Control Board.'
                : 'All documents verified. Submit application package to Environment & Pollution Control Board for formal clearance.'}
            </p>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-200 flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500">Impact: Clears Pollution CTE Bottleneck</span>
            
            {!isMismatchResolved ? (
              <button
                onClick={() => resolveDocumentMismatch()}
                className="px-4 py-2 bg-govSaffron-600 hover:bg-govSaffron-700 text-white text-xs font-bold rounded-lg shadow-sm transition-colors flex items-center gap-1.5 cursor-pointer"
              >
                <span>Fix Now</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            ) : (
              <button
                onClick={() => navigate('/approvals/APP-001')}
                className="px-4 py-2 bg-govNavy-700 hover:bg-govNavy-800 text-white text-xs font-bold rounded-lg shadow-sm transition-colors flex items-center gap-1.5 cursor-pointer"
              >
                <span>Proceed to Submit</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>

        {/* Action Checklist */}
        <div className="md:col-span-6 flex flex-col justify-center gap-2">
          <p className="text-xs font-bold text-slate-700 mb-1">Approval Journey Action Checklist:</p>
          
          <div className="flex items-center gap-3 p-2 rounded-lg bg-emerald-50/60 border border-emerald-100 text-xs">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span className="text-slate-800 font-medium">Complete business profile (Raipur Fresh Foods Pvt. Ltd.)</span>
          </div>

          <div className="flex items-center gap-3 p-2 rounded-lg bg-emerald-50/60 border border-emerald-100 text-xs">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span className="text-slate-800 font-medium">Upload factory layout & site survey map</span>
          </div>

          <div className={`flex items-center justify-between p-2 rounded-lg text-xs font-semibold border ${
            !isMismatchResolved 
              ? 'bg-amber-50 border-amber-300 text-amber-950' 
              : 'bg-emerald-50/60 border-emerald-100 text-slate-800'
          }`}>
            <div className="flex items-center gap-3">
              {!isMismatchResolved ? (
                <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
              ) : (
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              )}
              <span>Resolve production-capacity & area mismatch</span>
            </div>
            {!isMismatchResolved && (
              <span className="text-[10px] uppercase font-bold text-amber-800 bg-amber-200 px-1.5 py-0.5 rounded">Action Needed</span>
            )}
          </div>

          <div className="flex items-center gap-3 p-2 rounded-lg bg-slate-50 border border-slate-200 text-xs text-slate-600">
            <Circle className="w-4 h-4 text-slate-400 shrink-0" />
            <span>Submit pollution approval (CTE clearance)</span>
          </div>

          <div className="flex items-center gap-3 p-2 rounded-lg bg-slate-50 border border-slate-200 text-xs text-slate-600">
            <Circle className="w-4 h-4 text-slate-400 shrink-0" />
            <span>Review fire NOC & high-voltage power requirements</span>
          </div>
        </div>

      </div>
    </div>
  );
};
