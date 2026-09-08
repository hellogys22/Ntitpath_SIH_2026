import React, { useState } from 'react';
import { Lightbulb, Users, CheckCircle2, ArrowRight } from 'lucide-react';
import { IntelligenceBanner } from '../../components/common/IntelligenceBanner';
import { Navbar } from '../../components/layout/Navbar';
import { AdminSidebar } from '../../components/layout/AdminSidebar';
import { Footer } from '../../components/layout/Footer';

export const AdminSupportPage: React.FC = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const schemeMatches = [
    {
      name: "PM Formalisation of Micro Food Processing Enterprises (PMFME)",
      matchedBusinesses: 84,
      sector: "Food Processing Industry",
      location: "Pan-Chhattisgarh",
      status: "Active Disbursals",
      budgetUtilization: "72%"
    },
    {
      name: "Chhattisgarh Industrial Policy 2024-29 — Fixed Capital Subsidy",
      matchedBusinesses: 142,
      sector: "Manufacturing / Priority Sector",
      location: "Raipur, Bilaspur, Durg",
      status: "Application Review Open",
      budgetUtilization: "58%"
    },
    {
      name: "PLI Scheme for Food Processing Sector (PLISFPI)",
      matchedBusinesses: 19,
      sector: "Large Commercial Units",
      location: "Pan-India / Export Focus",
      status: "National Window Active",
      budgetUtilization: "81%"
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
                <Lightbulb className="w-5 h-5 text-amber-400" />
                <h1 className="text-2xl font-black text-white">Support & Scheme Matching Radar</h1>
              </div>
              <p className="text-xs text-slate-400 mt-1">Cross-reference active industrial applicants with state and central incentive opportunities</p>
            </div>
          </div>

          <div className="bg-slate-900 rounded-xl border border-slate-800 p-5 shadow-md overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-950 text-slate-400 font-bold border-b border-slate-800 uppercase tracking-wider text-[11px]">
                  <tr>
                    <th className="py-3.5 px-4">Incentive / Support Scheme</th>
                    <th className="py-3.5 px-4">Matched Applicant Count</th>
                    <th className="py-3.5 px-4">Target Sector</th>
                    <th className="py-3.5 px-4">Geographic Coverage</th>
                    <th className="py-3.5 px-4">Scheme Window Status</th>
                    <th className="py-3.5 px-4 text-right">Fund Allocation</th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-slate-800 text-slate-300">
                  {schemeMatches.map((sc, idx) => (
                    <tr key={idx} className="hover:bg-slate-800/60">
                      <td className="py-3.5 px-4 font-bold text-white max-w-xs">{sc.name}</td>
                      <td className="py-3.5 px-4 font-extrabold text-amber-400">{sc.matchedBusinesses} Enterprises</td>
                      <td className="py-3.5 px-4 text-slate-300 font-medium">{sc.sector}</td>
                      <td className="py-3.5 px-4 text-slate-400">{sc.location}</td>
                      <td className="py-3.5 px-4">
                        <span className="px-2 py-0.5 rounded bg-emerald-950 text-emerald-300 border border-emerald-800 text-[10px] font-bold">
                          {sc.status}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-right font-bold text-white">{sc.budgetUtilization}</td>
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
