import React, { useState } from 'react';
import { Activity, Search, AlertTriangle, ShieldCheck } from 'lucide-react';
import { IntelligenceBanner } from '../../components/common/IntelligenceBanner';
import { Navbar } from '../../components/layout/Navbar';
import { AdminSidebar } from '../../components/layout/AdminSidebar';
import { Footer } from '../../components/layout/Footer';
import { StatusBadge } from '../../components/ui/StatusBadge';

export const AdminApprovalsPage: React.FC = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const approvalMonitoringData = [
    { name: "Pollution Consent to Establish (CTE)", department: "Environment & Pollution Board", total: 184, pending: 31, highRisk: 14, isBottleneck: true, status: "Needs Attention" },
    { name: "Factory Building Plan Sanction", department: "Directorate of Industrial Safety", total: 142, pending: 24, highRisk: 9, isBottleneck: true, status: "Monitoring" },
    { name: "Fire Safety NOC", department: "State Fire & Emergency Services", total: 96, pending: 12, highRisk: 4, isBottleneck: false, status: "Normal" },
    { name: "Electricity HT Substation Feed", department: "State Power Distribution Corp", total: 118, pending: 17, highRisk: 6, isBottleneck: false, status: "Normal" },
    { name: "Industrial Water Connection", department: "Municipal Water Board", total: 85, pending: 8, highRisk: 2, isBottleneck: false, status: "Normal" },
    { name: "Boiler Safety Inspection", department: "Boiler Inspectorate", total: 64, pending: 15, highRisk: 7, isBottleneck: true, status: "Needs Attention" }
  ];

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
                <Activity className="w-5 h-5 text-amber-400" />
                <h1 className="text-2xl font-black text-white">Inter-Department Approval Monitoring</h1>
              </div>
              <p className="text-xs text-slate-400 mt-1">Cross-state approval volume, delay risks, and bottleneck indicators</p>
            </div>
          </div>

          <div className="bg-slate-900 rounded-xl border border-slate-800 p-5 shadow-md overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-950 text-slate-400 font-bold border-b border-slate-800 uppercase tracking-wider text-[11px]">
                  <tr>
                    <th className="py-3.5 px-4">Statutory Approval Type</th>
                    <th className="py-3.5 px-4">In-Charge Department</th>
                    <th className="py-3.5 px-4">Total Active Apps</th>
                    <th className="py-3.5 px-4">Pending Review</th>
                    <th className="py-3.5 px-4">High Risk Count</th>
                    <th className="py-3.5 px-4">System Bottleneck?</th>
                    <th className="py-3.5 px-4 text-right">Status</th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-slate-800 text-slate-300">
                  {approvalMonitoringData.map((row, idx) => (
                    <tr key={idx} className="hover:bg-slate-800/60">
                      <td className="py-3.5 px-4 font-bold text-white max-w-xs">{row.name}</td>
                      <td className="py-3.5 px-4 text-slate-400 font-medium">{row.department}</td>
                      <td className="py-3.5 px-4 font-bold text-white">{row.total}</td>
                      <td className="py-3.5 px-4 font-semibold text-amber-300">{row.pending}</td>
                      <td className="py-3.5 px-4 font-bold text-rose-400">{row.highRisk}</td>
                      
                      <td className="py-3.5 px-4">
                        {row.isBottleneck ? (
                          <span className="px-2 py-0.5 rounded bg-rose-950 text-rose-300 border border-rose-800 text-[10px] font-bold">
                            YES (BOTTLENECK)
                          </span>
                        ) : (
                          <span className="px-2 py-0.5 rounded bg-slate-800 text-slate-400 text-[10px]">No</span>
                        )}
                      </td>

                      <td className="py-3.5 px-4 text-right">
                        <StatusBadge status={row.status} size="sm" />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

        </main>
      </div>

      <Footer />
    </div>
  );
};
