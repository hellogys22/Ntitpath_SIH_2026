import React, { useState } from 'react';
import { ShieldAlert, Calendar, CheckCircle2, AlertTriangle, Users } from 'lucide-react';
import { IntelligenceBanner } from '../../components/common/IntelligenceBanner';
import { Navbar } from '../../components/layout/Navbar';
import { AdminSidebar } from '../../components/layout/AdminSidebar';
import { Footer } from '../../components/layout/Footer';

export const AdminCompliancePage: React.FC = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const complianceList = [
    {
      title: "Annual Environmental Emission Return Submissions",
      department: "Environment Board",
      deadline: "15 Oct 2026",
      affectedUnits: 184,
      status: "Submission Open",
      complianceRisk: "Medium"
    },
    {
      title: "Mandatory Annual Fire Hydrant Pressure Audit",
      department: "Fire Services",
      deadline: "22 Oct 2026",
      affectedUnits: 96,
      status: "Inspection Scheduled",
      complianceRisk: "High"
    },
    {
      title: "Quarterly Labour Welfare Fund Returns (BOCW)",
      department: "Labour Dept",
      deadline: "30 Oct 2026",
      affectedUnits: 312,
      status: "Active Portal Filing",
      complianceRisk: "Low"
    },
    {
      title: "Boiler Safety Operational Pressure Vessel Recertification",
      department: "Boilers Directorate",
      deadline: "05 Jan 2027",
      affectedUnits: 47,
      status: "Notice Issued",
      complianceRisk: "Medium"
    }
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
                <ShieldAlert className="w-5 h-5 text-amber-400" />
                <h1 className="text-2xl font-black text-white">Statewide Compliance Monitoring</h1>
              </div>
              <p className="text-xs text-slate-400 mt-1">
                Monitor recurring statutory return deadlines, safety audits, and operating license renewals across industries
              </p>
            </div>
          </div>

          <div className="bg-slate-900 rounded-xl border border-slate-800 p-5 shadow-md overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-950 text-slate-400 font-bold border-b border-slate-800 uppercase tracking-wider text-[11px]">
                  <tr>
                    <th className="py-3.5 px-4">Compliance Event / Statutory Requirement</th>
                    <th className="py-3.5 px-4">Regulatory Authority</th>
                    <th className="py-3.5 px-4">Target Submission Deadline</th>
                    <th className="py-3.5 px-4">Operating Units Affected</th>
                    <th className="py-3.5 px-4 text-right">Filing Status</th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-slate-800 text-slate-300">
                  {complianceList.map((c, idx) => (
                    <tr key={idx} className="hover:bg-slate-800/60">
                      <td className="py-3.5 px-4 font-bold text-white max-w-xs">{c.title}</td>
                      <td className="py-3.5 px-4 text-slate-300 font-medium">{c.department}</td>
                      <td className="py-3.5 px-4 font-extrabold text-amber-400">{c.deadline}</td>
                      <td className="py-3.5 px-4 font-semibold text-white">{c.affectedUnits} Industrial Plants</td>
                      <td className="py-3.5 px-4 text-right">
                        <span className="px-2.5 py-1 rounded bg-slate-800 text-slate-200 border border-slate-700 font-medium">
                          {c.status}
                        </span>
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
