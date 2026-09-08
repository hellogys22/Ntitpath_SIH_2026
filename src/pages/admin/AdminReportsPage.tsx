import React, { useState } from 'react';
import { BarChart3, TrendingUp, PieChart, Clock, FileText, CheckCircle2 } from 'lucide-react';
import { IntelligenceBanner } from '../../components/common/IntelligenceBanner';
import { Navbar } from '../../components/layout/Navbar';
import { AdminSidebar } from '../../components/layout/AdminSidebar';
import { Footer } from '../../components/layout/Footer';

export const AdminReportsPage: React.FC = () => {
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
                <BarChart3 className="w-5 h-5 text-amber-400" />
                <h1 className="text-2xl font-black text-white">Reports & Clearance Analytics</h1>
              </div>
              <p className="text-xs text-slate-400 mt-1">Institutional regulatory velocity metrics and document quality audit logs</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            
            {/* Applications by Risk Chart Box */}
            <div className="bg-slate-900 rounded-xl border border-slate-800 p-5 shadow-md">
              <h3 className="text-sm font-bold text-white border-b border-slate-800 pb-3 mb-4 flex items-center justify-between">
                <span>Applications by Regulatory Risk Rating</span>
                <span className="text-[10px] text-slate-400">Total: 1,248</span>
              </h3>

              <div className="space-y-4 text-xs">
                <div>
                  <div className="flex justify-between mb-1">
                    <span className="text-slate-300 font-medium">Low Risk (Standard Track)</span>
                    <span className="text-emerald-400 font-bold">527 (42%)</span>
                  </div>
                  <div className="w-full bg-slate-800 rounded-full h-3">
                    <div className="bg-emerald-500 h-3 rounded-full" style={{ width: '42%' }} />
                  </div>
                </div>

                <div>
                  <div className="flex justify-between mb-1">
                    <span className="text-slate-300 font-medium">Medium Risk (Testing & Approvals)</span>
                    <span className="text-amber-400 font-bold">143 (11%)</span>
                  </div>
                  <div className="w-full bg-slate-800 rounded-full h-3">
                    <div className="bg-amber-500 h-3 rounded-full" style={{ width: '11%' }} />
                  </div>
                </div>

                <div>
                  <div className="flex justify-between mb-1">
                    <span className="text-slate-300 font-medium">High Risk (Document/Data Bottlenecks)</span>
                    <span className="text-rose-400 font-bold">64 (5%)</span>
                  </div>
                  <div className="w-full bg-slate-800 rounded-full h-3">
                    <div className="bg-rose-500 h-3 rounded-full" style={{ width: '5%' }} />
                  </div>
                </div>

                <div>
                  <div className="flex justify-between mb-1">
                    <span className="text-slate-300 font-medium">Fully Completed & Operating</span>
                    <span className="text-blue-400 font-bold">761 (61%)</span>
                  </div>
                  <div className="w-full bg-slate-800 rounded-full h-3">
                    <div className="bg-blue-500 h-3 rounded-full" style={{ width: '61%' }} />
                  </div>
                </div>
              </div>
            </div>

            {/* Common Document Issues Box */}
            <div className="bg-slate-900 rounded-xl border border-slate-800 p-5 shadow-md">
              <h3 className="text-sm font-bold text-white border-b border-slate-800 pb-3 mb-4">
                Top Root-Cause Discrepancies Detected Pre-Submission
              </h3>

              <div className="space-y-3 text-xs">
                <div className="p-3 bg-slate-950 rounded-lg border border-slate-800 flex justify-between items-center">
                  <div>
                    <span className="font-bold text-white block">1. Constructed Area / DPR Mismatch</span>
                    <span className="text-[10px] text-slate-400">Layout drawings conflicting with DPR text</span>
                  </div>
                  <span className="font-bold text-rose-400 bg-rose-950 px-2 py-1 rounded">38 Cases</span>
                </div>

                <div className="p-3 bg-slate-950 rounded-lg border border-slate-800 flex justify-between items-center">
                  <div>
                    <span className="font-bold text-white block">2. Missing Form 1-A Self-Declaration</span>
                    <span className="text-[10px] text-slate-400">Environmental boundary declaration omitted</span>
                  </div>
                  <span className="font-bold text-amber-400 bg-amber-950 px-2 py-1 rounded">29 Cases</span>
                </div>

                <div className="p-3 bg-slate-950 rounded-lg border border-slate-800 flex justify-between items-center">
                  <div>
                    <span className="font-bold text-white block">3. Missing OEM Hydrostatic Test Stamp</span>
                    <span className="text-[10px] text-slate-400">Boiler supplier signature unverified</span>
                  </div>
                  <span className="font-bold text-amber-400 bg-amber-950 px-2 py-1 rounded">17 Cases</span>
                </div>

                <div className="p-3 bg-slate-950 rounded-lg border border-slate-800 flex justify-between items-center">
                  <div>
                    <span className="font-bold text-white block">4. Water Quality NABL Report Expiry</span>
                    <span className="text-[10px] text-slate-400">Process water lab test &gt; 90 days old</span>
                  </div>
                  <span className="font-bold text-slate-300 bg-slate-800 px-2 py-1 rounded">14 Cases</span>
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
