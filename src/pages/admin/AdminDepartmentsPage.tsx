import React, { useState } from 'react';
import { Building, Users, Clock, AlertTriangle, ArrowRight } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { IntelligenceBanner } from '../../components/common/IntelligenceBanner';
import { Navbar } from '../../components/layout/Navbar';
import { AdminSidebar } from '../../components/layout/AdminSidebar';
import { Footer } from '../../components/layout/Footer';

export const AdminDepartmentsPage: React.FC = () => {
  const { departmentWorkloads } = useApp();
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
                <Building className="w-5 h-5 text-amber-400" />
                <h1 className="text-2xl font-black text-white">Department Workload & Processing Capacity</h1>
              </div>
              <p className="text-xs text-slate-400 mt-1">
                Inter-departmental clearance velocity, pending review backlogs, and bottleneck density
              </p>
            </div>
          </div>

          {/* Department Workload Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            {departmentWorkloads.map((dw, idx) => (
              <div key={idx} className="bg-slate-900 rounded-xl border border-slate-800 p-6 shadow-md">
                <div className="flex items-start justify-between gap-4 pb-4 border-b border-slate-800">
                  <div>
                    <h3 className="text-base font-bold text-white">{dw.department}</h3>
                    <p className="text-xs text-slate-400 mt-0.5">Statutory Clearance Authority</p>
                  </div>
                  <span className="px-2.5 py-1 rounded bg-slate-800 text-amber-400 border border-slate-700 text-xs font-bold">
                    Active Authority
                  </span>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-4 text-center">
                  <div className="p-3 bg-slate-950 rounded-lg border border-slate-800">
                    <span className="text-slate-400 block text-[10px] uppercase font-bold">Active Apps</span>
                    <span className="text-lg font-bold text-white">{dw.activeApplications}</span>
                  </div>

                  <div className="p-3 bg-slate-950 rounded-lg border border-slate-800">
                    <span className="text-amber-400 block text-[10px] uppercase font-bold">Pending Review</span>
                    <span className="text-lg font-bold text-amber-300">{dw.pendingReviews}</span>
                  </div>

                  <div className="p-3 bg-rose-950/60 rounded-lg border border-rose-800">
                    <span className="text-rose-400 block text-[10px] uppercase font-bold">High Risk</span>
                    <span className="text-lg font-bold text-rose-300">{dw.highRisk}</span>
                  </div>

                  <div className="p-3 bg-slate-950 rounded-lg border border-slate-800">
                    <span className="text-slate-400 block text-[10px] uppercase font-bold">Bottlenecks</span>
                    <span className="text-lg font-bold text-white">{dw.bottlenecks}</span>
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t border-slate-800 flex justify-between items-center text-xs text-slate-400">
                  <span>Average Processing Time: 14 Business Days</span>
                  <span className="text-emerald-400 font-semibold">92% Compliance Rate</span>
                </div>
              </div>
            ))}
          </div>

        </main>
      </div>

      <Footer />
    </div>
  );
};
