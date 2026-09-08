import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AlertOctagon, ShieldAlert, CheckCircle2, ArrowRight } from 'lucide-react';
import { IntelligenceBanner } from '../../components/common/IntelligenceBanner';
import { Navbar } from '../../components/layout/Navbar';
import { AdminSidebar } from '../../components/layout/AdminSidebar';
import { Footer } from '../../components/layout/Footer';
import { RiskBadge } from '../../components/ui/RiskBadge';

export const AdminRisksPage: React.FC = () => {
  const navigate = useNavigate();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const priorityCases = [
    {
      appId: "NTP-00128",
      business: "Raipur Fresh Foods Pvt. Ltd.",
      approval: "Pollution Consent to Establish (CTE)",
      risk: "HIGH" as const,
      reason: "Building Plan area (10,000 sq ft) differs from DPR statement (12,500 sq ft) + Form 1-A missing",
      dependency: "Document Verification Gate",
      action: "Applicant notified to align constructed footprint",
      dept: "Environment Board"
    },
    {
      appId: "NTP-00130",
      business: "Bharat Agro Cold Storage Industries",
      approval: "Highway Access NOC",
      risk: "HIGH" as const,
      reason: "NHAI median intersection clearance pending geometric curve safety survey",
      dependency: "Public Works Department",
      action: "Joint site inspection scheduled",
      dept: "PWD / NHAI"
    },
    {
      appId: "NTP-00129",
      business: "Shakti Heavy Engineering Ltd.",
      approval: "HT Power Substation",
      risk: "MEDIUM" as const,
      reason: "Transformer step-down leakage test report pending third-party NABL lab stamp",
      dependency: "Electrical Inspectorate",
      action: "Awaiting test certificate upload",
      dept: "Power Distribution Corp"
    },
    {
      appId: "NTP-00132",
      business: "Chhattisgarh Renewable Solar Park",
      approval: "Land Classification Sanction",
      risk: "MEDIUM" as const,
      reason: "Khasra demarcation map requires boundary signoff from revenue patwari",
      dependency: "Revenue Department",
      action: "Demarcation hearing in progress",
      dept: "Revenue Records"
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
                <AlertOctagon className="w-5 h-5 text-rose-400" />
                <h1 className="text-2xl font-black text-white">Risk & Bottleneck Monitoring</h1>
              </div>
              <p className="text-xs text-slate-400 mt-1">Cross-industry statutory bottleneck analysis and systemic delay points</p>
            </div>
          </div>

          {/* Metrics */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
            <div className="p-4 bg-rose-950/50 rounded-xl border border-rose-800">
              <span className="text-xs font-bold text-rose-300 block uppercase">High Risk Bottlenecks</span>
              <span className="text-2xl font-extrabold text-white mt-1 block">64 Applications</span>
              <span className="text-[11px] text-rose-400 mt-0.5 block">Affecting 18 Industrial Clusters</span>
            </div>

            <div className="p-4 bg-amber-950/50 rounded-xl border border-amber-800">
              <span className="text-xs font-bold text-amber-300 block uppercase">Medium Risk Cases</span>
              <span className="text-2xl font-extrabold text-white mt-1 block">143 Applications</span>
              <span className="text-[11px] text-amber-400 mt-0.5 block">Inter-department Handshakes</span>
            </div>

            <div className="p-4 bg-slate-900 rounded-xl border border-slate-800">
              <span className="text-xs font-bold text-slate-300 block uppercase">Low Risk / Routine</span>
              <span className="text-2xl font-extrabold text-white mt-1 block">527 Applications</span>
              <span className="text-[11px] text-slate-400 mt-0.5 block">Moving within SLA Timeframes</span>
            </div>
          </div>

          {/* Priority Risk Cases */}
          <div className="bg-slate-900 rounded-xl border border-slate-800 p-5 shadow-md">
            <div className="pb-3 border-b border-slate-800 mb-4 flex justify-between items-center">
              <h3 className="text-base font-bold text-white">Priority Bottleneck Queue</h3>
              <span className="text-xs text-slate-400">Ranked by Systemic Impact</span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-950 text-slate-400 font-bold border-b border-slate-800 uppercase tracking-wider text-[11px]">
                  <tr>
                    <th className="py-3.5 px-4">Application ID & Business</th>
                    <th className="py-3.5 px-4">Target Approval</th>
                    <th className="py-3.5 px-4">Risk Level</th>
                    <th className="py-3.5 px-4">Root Cause Discrepancy</th>
                    <th className="py-3.5 px-4">Locking Dependency</th>
                    <th className="py-3.5 px-4 text-right">Action</th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-slate-800 text-slate-300">
                  {priorityCases.map((pc, idx) => (
                    <tr key={idx} className="hover:bg-slate-800/60">
                      <td className="py-3.5 px-4 font-bold text-white">
                        <span className="text-amber-400 font-extrabold block">{pc.appId}</span>
                        <span>{pc.business}</span>
                      </td>

                      <td className="py-3.5 px-4 text-slate-300 font-medium">{pc.approval}</td>

                      <td className="py-3.5 px-4">
                        <RiskBadge risk={pc.risk} size="sm" />
                      </td>

                      <td className="py-3.5 px-4 text-slate-300 font-normal max-w-xs">{pc.reason}</td>

                      <td className="py-3.5 px-4 text-slate-400 font-semibold">{pc.dependency}</td>

                      <td className="py-3.5 px-4 text-right">
                        <button
                          onClick={() => navigate(`/admin/applications/${pc.appId}`)}
                          className="px-3 py-1.5 bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs rounded transition-colors inline-flex items-center gap-1 cursor-pointer"
                        >
                          <span>Inspect</span>
                          <ArrowRight className="w-3 h-3" />
                        </button>
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
