import React from 'react';
import { ArrowRight, CheckCircle2, AlertTriangle, Clock, Zap, GitBranch, Layers } from 'lucide-react';
import { useApp } from '../../context/AppContext';

export const DependencyGraph: React.FC = () => {
  const { isMismatchResolved } = useApp();

  return (
    <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm">
      <div className="flex flex-wrap items-center justify-between gap-4 mb-6 pb-4 border-b border-slate-100">
        <div>
          <div className="flex items-center gap-2">
            <GitBranch className="w-5 h-5 text-govNavy-700" />
            <h3 className="text-base font-bold text-slate-900">Optimized Approval Path & Workflow Dependencies</h3>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            NitiPath analyzes independent approvals that can run concurrently while monitoring critical-path bottlenecks.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3 text-xs">
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-emerald-50 text-emerald-800 border border-emerald-200 font-medium">
            <span className="w-2 h-2 rounded-full bg-emerald-500" />
            Completed Stage
          </div>
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-amber-50 text-amber-800 border border-amber-300 font-medium">
            <span className="w-2 h-2 rounded-full bg-amber-500" />
            Critical Path Node
          </div>
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-blue-50 text-blue-800 border border-blue-200 font-medium">
            <span className="w-2 h-2 rounded-full bg-blue-500" />
            Parallel Track
          </div>
        </div>
      </div>

      {/* Dependency Diagram Layout */}
      <div className="relative overflow-x-auto py-4">
        <div className="min-w-[760px] flex flex-col gap-6">
          
          {/* Stage 1: Setup */}
          <div className="grid grid-cols-12 items-center gap-4">
            <div className="col-span-3">
              <div className="p-3 bg-emerald-50 rounded-lg border border-emerald-200 flex items-center gap-3">
                <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
                <div>
                  <p className="text-xs font-bold text-emerald-950">Land NA & Registration</p>
                  <p className="text-[10px] text-emerald-700">Revenue Dept • Verified</p>
                </div>
              </div>
            </div>
            <div className="col-span-1 flex justify-center">
              <ArrowRight className="w-5 h-5 text-slate-400" />
            </div>

            {/* Stage 2: Mismatch Check Node */}
            <div className="col-span-4">
              <div className={`p-3.5 rounded-lg border transition-all ${
                isMismatchResolved 
                  ? 'bg-emerald-50 border-emerald-300 text-emerald-950' 
                  : 'bg-rose-50 border-rose-300 text-rose-950 shadow-xs'
              }`}>
                <div className="flex items-center justify-between">
                  <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded bg-white/80 border text-slate-800">
                    Document Gate
                  </span>
                  {!isMismatchResolved ? (
                    <span className="text-[10px] font-bold bg-rose-600 text-white px-2 py-0.5 rounded-full animate-pulse">
                      HIGH RISK BOTTLENECK
                    </span>
                  ) : (
                    <span className="text-[10px] font-bold bg-emerald-600 text-white px-2 py-0.5 rounded-full">
                      CLEARED
                    </span>
                  )}
                </div>
                <p className="text-xs font-bold mt-2">
                  Building Plan & DPR Verification
                </p>
                <p className="text-[11px] mt-0.5 opacity-90">
                  {!isMismatchResolved 
                    ? '⚠ Area Mismatch: 10,000 sq ft vs 12,500 sq ft' 
                    : '✓ Area Mismatch Resolved (12,500 sq ft verified)'}
                </p>
              </div>
            </div>

            <div className="col-span-1 flex justify-center">
              <ArrowRight className="w-5 h-5 text-slate-400" />
            </div>

            {/* Stage 3: Split Paths Label */}
            <div className="col-span-3">
              <div className="p-3 bg-govNavy-50 rounded-lg border border-govNavy-200 text-govNavy-900 text-xs font-semibold flex items-center gap-2">
                <Layers className="w-4 h-4 text-govNavy-700" />
                <span>NitiPath Parallel Pipeline</span>
              </div>
            </div>
          </div>

          {/* Connectors to Parallel Branches */}
          <div className="grid grid-cols-12 gap-4 my-2">
            
            {/* Top Branch: Parallel Independent Approvals */}
            <div className="col-span-12 p-4 bg-slate-50/80 rounded-xl border border-dashed border-slate-300">
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-bold text-blue-900 flex items-center gap-1.5">
                  <Zap className="w-4 h-4 text-blue-600" />
                  PARALLEL INDEPENDENT TRACK (Can progress concurrently without blocking)
                </span>
                <span className="text-[11px] text-slate-500 font-medium">Estimated Time Saved: 45 Days</span>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div className="p-3 bg-white rounded-lg border border-blue-200 shadow-2xs">
                  <div className="flex justify-between items-start">
                    <p className="text-xs font-bold text-slate-900">Fire NOC Safety Clearance</p>
                    <span className="text-[10px] bg-blue-100 text-blue-800 font-bold px-1.5 py-0.5 rounded">Parallel</span>
                  </div>
                  <p className="text-[10px] text-slate-500 mt-1">Fire Dept • Ready to file</p>
                </div>

                <div className="p-3 bg-white rounded-lg border border-blue-200 shadow-2xs">
                  <div className="flex justify-between items-start">
                    <p className="text-xs font-bold text-slate-900">Electricity Substation Feed</p>
                    <span className="text-[10px] bg-blue-100 text-blue-800 font-bold px-1.5 py-0.5 rounded">Parallel</span>
                  </div>
                  <p className="text-[10px] text-slate-500 mt-1">Power Utility • Load Ready</p>
                </div>

                <div className="p-3 bg-white rounded-lg border border-blue-200 shadow-2xs">
                  <div className="flex justify-between items-start">
                    <p className="text-xs font-bold text-slate-900">Water Supply Connection</p>
                    <span className="text-[10px] bg-blue-100 text-blue-800 font-bold px-1.5 py-0.5 rounded">Parallel</span>
                  </div>
                  <p className="text-[10px] text-slate-500 mt-1">Municipal Board • Pending</p>
                </div>
              </div>
            </div>

            {/* Bottom Branch: Critical Path */}
            <div className="col-span-12 p-4 bg-amber-50/50 rounded-xl border border-amber-300">
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-bold text-amber-900 flex items-center gap-1.5">
                  <AlertTriangle className="w-4 h-4 text-amber-600" />
                  CRITICAL PATH PIPELINE (Sequential Statutory Dependency)
                </span>
                <span className="text-[11px] text-amber-800 font-medium">Primary Operational Readiness Pathway</span>
              </div>

              <div className="flex items-center justify-between gap-2">
                <div className={`p-3 rounded-lg border flex-1 ${
                  !isMismatchResolved 
                    ? 'bg-rose-100 border-rose-300 text-rose-950 font-semibold' 
                    : 'bg-emerald-100 border-emerald-300 text-emerald-950'
                }`}>
                  <p className="text-xs font-bold">1. Pollution CTE</p>
                  <p className="text-[10px] opacity-80">Environment Board</p>
                  <p className="text-[10px] mt-1 font-bold">
                    {!isMismatchResolved ? '🔴 Blocked by Document Issue' : '🟢 Cleared for Board Meeting'}
                  </p>
                </div>

                <ArrowRight className="w-4 h-4 text-amber-600 shrink-0" />

                <div className="p-3 bg-white rounded-lg border border-amber-300 flex-1">
                  <p className="text-xs font-bold text-slate-900">2. Boiler Inspection</p>
                  <p className="text-[10px] text-slate-500">Boiler Inspectorate</p>
                  <p className="text-[10px] text-amber-700 mt-1 font-semibold">Technical Drawing Review</p>
                </div>

                <ArrowRight className="w-4 h-4 text-amber-600 shrink-0" />

                <div className="p-3 bg-white rounded-lg border border-amber-300 flex-1">
                  <p className="text-xs font-bold text-slate-900">3. FSSAI Central License</p>
                  <p className="text-[10px] text-slate-500">Food Safety Authority</p>
                  <p className="text-[10px] text-blue-700 mt-1 font-semibold">Water Test Under Review</p>
                </div>

                <ArrowRight className="w-4 h-4 text-amber-600 shrink-0" />

                <div className="p-3 bg-slate-100 rounded-lg border border-slate-300 flex-1 opacity-80">
                  <p className="text-xs font-bold text-slate-800">4. Final CTO & Factory License</p>
                  <p className="text-[10px] text-slate-500">DISH / Environment Board</p>
                  <p className="text-[10px] text-slate-600 mt-1">Final Operational Stage</p>
                </div>
              </div>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
};
