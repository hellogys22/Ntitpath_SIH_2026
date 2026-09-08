import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AlertTriangle, ShieldAlert, CheckCircle2, ArrowRight, Filter } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { IntelligenceBanner } from '../../components/common/IntelligenceBanner';
import { Navbar } from '../../components/layout/Navbar';
import { Sidebar } from '../../components/layout/Sidebar';
import { Footer } from '../../components/layout/Footer';
import { MetricCard } from '../../components/ui/MetricCard';
import { RiskBadge } from '../../components/ui/RiskBadge';

export const RisksPage: React.FC = () => {
  const navigate = useNavigate();
  const { risks, resolveDocumentMismatch, isMismatchResolved } = useApp();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const highCount = risks.filter(r => r.riskLevel === 'HIGH').length;
  const mediumCount = risks.filter(r => r.riskLevel === 'MEDIUM').length;

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-900">
      <IntelligenceBanner />
      <Navbar 
        toggleMobileMenu={() => setIsMobileMenuOpen(!isMobileMenuOpen)} 
        isMobileMenuOpen={isMobileMenuOpen} 
      />

      <div className="flex-1 flex max-w-7xl mx-auto w-full">
        <Sidebar 
          isMobileOpen={isMobileMenuOpen} 
          closeMobileMenu={() => setIsMobileMenuOpen(false)} 
        />

        <main className="flex-1 p-4 sm:p-6 lg:p-8 min-w-0">
          
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
            <div>
              <div className="flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-rose-600" />
                <h1 className="text-2xl font-extrabold text-slate-900">Risk & Dependencies</h1>
              </div>
              <p className="text-xs text-slate-500 mt-1">
                Predictive bottleneck detection, inter-department locks, and risk resolution pathways.
              </p>
            </div>
          </div>

          {/* Metrics */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
            <MetricCard
              title="High Risk Issues"
              value={highCount}
              subtitle="Critical Approval Blockers"
              variant={highCount > 0 ? "danger" : "success"}
              icon={ShieldAlert}
            />
            <MetricCard
              title="Medium Risk Issues"
              value={mediumCount}
              subtitle="Third-party & Testing Delays"
              variant="warning"
              icon={AlertTriangle}
            />
            <MetricCard
              title="Low Risk Permits"
              value={11}
              subtitle="Routine Statutory Approvals"
              variant="success"
              icon={CheckCircle2}
            />
          </div>

          {/* Risk Items Table */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-4 sm:p-6 mb-8">
            <div className="pb-4 border-b border-slate-100 mb-4 flex justify-between items-center">
              <h3 className="text-base font-bold text-slate-900">Active Regulatory Risks</h3>
              <span className="text-xs text-slate-500 font-medium">Categorized by NitiPath Intelligence</span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-100 text-slate-700 font-bold border-b border-slate-200 uppercase tracking-wider text-[11px]">
                  <tr>
                    <th className="py-3.5 px-4">Approval Target</th>
                    <th className="py-3.5 px-4">Risk Rating</th>
                    <th className="py-3.5 px-4">Risk Category & Cause</th>
                    <th className="py-3.5 px-4">Dependency Lock</th>
                    <th className="py-3.5 px-4">Recommended Action</th>
                    <th className="py-3.5 px-4 text-right">Action</th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-slate-100">
                  {risks.map(r => (
                    <tr 
                      key={r.id}
                      className={`hover:bg-slate-50 transition-colors ${r.riskLevel === 'HIGH' ? 'bg-rose-50/30' : ''}`}
                    >
                      <td className="py-3.5 px-4 font-bold text-slate-900 max-w-xs">{r.approvalName}</td>
                      
                      <td className="py-3.5 px-4">
                        <RiskBadge risk={r.riskLevel} size="sm" />
                      </td>

                      <td className="py-3.5 px-4 font-medium text-slate-800 max-w-xs">
                        <span className="text-[10px] uppercase font-bold text-slate-500 block">{r.category}</span>
                        {r.reason}
                      </td>

                      <td className="py-3.5 px-4 font-semibold text-slate-700">{r.dependency}</td>

                      <td className="py-3.5 px-4 font-bold text-slate-900 max-w-xs">{r.recommendedAction}</td>

                      <td className="py-3.5 px-4 text-right">
                        {r.id === 'RISK-001' && !isMismatchResolved ? (
                          <button
                            onClick={() => resolveDocumentMismatch()}
                            className="px-3 py-1.5 bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold rounded shadow-xs transition-colors inline-flex items-center gap-1 cursor-pointer"
                          >
                            <span>Fix Issue</span>
                            <ArrowRight className="w-3 h-3" />
                          </button>
                        ) : (
                          <button
                            onClick={() => navigate(`/approvals/${r.approvalId}`)}
                            className="px-2.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-semibold rounded border border-slate-300 transition-colors inline-flex items-center gap-1 cursor-pointer"
                          >
                            <span>View</span>
                            <ArrowRight className="w-3 h-3" />
                          </button>
                        )}
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
