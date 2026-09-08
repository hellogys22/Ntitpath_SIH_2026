import React, { useState } from 'react';
import { GitFork, GitBranch, ArrowRight, CheckCircle2, AlertTriangle, Zap, Layers } from 'lucide-react';
import { IntelligenceBanner } from '../../components/common/IntelligenceBanner';
import { Navbar } from '../../components/layout/Navbar';
import { AdminSidebar } from '../../components/layout/AdminSidebar';
import { Footer } from '../../components/layout/Footer';

export const AdminDependenciesPage: React.FC = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  return (
    <div className="min-h-screen flex flex-col bg-slate-900 text-slate-100">
      <IntelligenceBanner />
      <Navbar 
        toggleMobileMenu={() => setIsMobileMenuOpen(!isMobileMenuOpen)} 
        isMobileMenuOpen={isMobileMenuOpen} 
      />

      <div className="flex-1 flex max-w-7xl mx-auto w-full">
        <AdminSidebar 
          isMobileOpen={isMobileMenuOpen} 
          closeMobileMenu={() => setIsMobileMenuOpen(false)} 
        />

        <main className="flex-1 p-4 sm:p-6 lg:p-8 min-w-0 bg-slate-950/60">
          
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
            <div>
              <div className="flex items-center gap-2">
                <GitFork className="w-5 h-5 text-amber-400" />
                <h1 className="text-2xl font-black text-white">System-Level Workflow Dependencies</h1>
              </div>
              <p className="text-xs text-slate-400 mt-1">Multi-application statutory flow graph and critical path synchronization</p>
            </div>
          </div>

          <div className="bg-slate-900 rounded-xl border border-slate-800 p-6 shadow-md mb-8">
            <div className="pb-4 border-b border-slate-800 mb-6 flex flex-wrap items-center justify-between gap-4">
              <div>
                <h3 className="text-base font-bold text-white">Standard Industrial Regulatory Pipeline</h3>
                <p className="text-xs text-slate-400 mt-0.5">Highlighting Critical Sequential Gates vs Parallel Fast-Tracks</p>
              </div>

              <div className="flex items-center gap-3 text-xs">
                <span className="flex items-center gap-1.5 px-2.5 py-1 rounded bg-amber-950 text-amber-300 border border-amber-800 font-bold">
                  Critical Sequential Path
                </span>
                <span className="flex items-center gap-1.5 px-2.5 py-1 rounded bg-blue-950 text-blue-300 border border-blue-800 font-bold">
                  Parallel Independent Track
                </span>
              </div>
            </div>

            {/* Pipeline Flow Visualization */}
            <div className="space-y-6 overflow-x-auto py-2">
              <div className="min-w-[700px] flex flex-col gap-4">
                
                {/* Stage 1 */}
                <div className="flex items-center gap-4">
                  <div className="p-3.5 bg-slate-950 rounded-lg border border-slate-800 flex-1">
                    <span className="text-[10px] uppercase font-bold text-slate-400 block">Stage 1</span>
                    <h4 className="text-xs font-bold text-white">Application Filing & Land Records</h4>
                    <p className="text-[10px] text-slate-400 mt-0.5">1,248 Applications Passed</p>
                  </div>

                  <ArrowRight className="w-5 h-5 text-slate-600 shrink-0" />

                  {/* Stage 2 */}
                  <div className="p-3.5 bg-rose-950/40 rounded-lg border border-rose-800 flex-1">
                    <span className="text-[10px] uppercase font-bold text-rose-400 block">Stage 2 • Major Gate</span>
                    <h4 className="text-xs font-bold text-white">Document Consistency Audit</h4>
                    <p className="text-[10px] text-rose-300 mt-0.5">91 Issues Currently Flagged</p>
                  </div>

                  <ArrowRight className="w-5 h-5 text-slate-600 shrink-0" />

                  {/* Stage 3 */}
                  <div className="p-3.5 bg-amber-950/40 rounded-lg border border-amber-800 flex-1">
                    <span className="text-[10px] uppercase font-bold text-amber-400 block">Stage 3 • Sequential</span>
                    <h4 className="text-xs font-bold text-white">Pollution CTE Approval</h4>
                    <p className="text-[10px] text-amber-300 mt-0.5">31 Applications In Committee</p>
                  </div>

                  <ArrowRight className="w-5 h-5 text-slate-600 shrink-0" />

                  {/* Stage 4 */}
                  <div className="p-3.5 bg-slate-950 rounded-lg border border-slate-800 flex-1">
                    <span className="text-[10px] uppercase font-bold text-slate-400 block">Stage 4 • Final</span>
                    <h4 className="text-xs font-bold text-white">Factory Operating License</h4>
                    <p className="text-[10px] text-slate-400 mt-0.5">761 Licenses Active</p>
                  </div>
                </div>

                {/* Parallel Track Indicator */}
                <div className="p-4 bg-slate-950 rounded-xl border border-dashed border-slate-800">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-bold text-blue-400 flex items-center gap-1.5">
                      <Zap className="w-4 h-4" />
                      Concurrent Processing (Fire NOC, HT Power, Water Line)
                    </span>
                    <span className="text-[10px] text-slate-400">Processed simultaneously during Stage 2 & 3</span>
                  </div>
                  <p className="text-xs text-slate-400 leading-relaxed">
                    NitiPath notifies regulatory officers when parallel clearances are ready for grant without waiting for sequential pollution signoffs.
                  </p>
                </div>

              </div>
            </div>

          </div>

        </main>
      </div>

      <Footer />
    </div>
  );
};
