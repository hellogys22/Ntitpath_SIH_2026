import React, { useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { 
  ArrowLeft, 
  CheckCircle2, 
  AlertTriangle, 
  FileText, 
  Building2, 
  ShieldAlert, 
  ExternalLink,
  Zap
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { IntelligenceBanner } from '../../components/common/IntelligenceBanner';
import { Navbar } from '../../components/layout/Navbar';
import { Sidebar } from '../../components/layout/Sidebar';
import { Footer } from '../../components/layout/Footer';
import { StatusBadge } from '../../components/ui/StatusBadge';
import { RiskBadge } from '../../components/ui/RiskBadge';

export const ApprovalDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { approvals, documents, resolveDocumentMismatch, isMismatchResolved } = useApp();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const approval = approvals.find(a => a.id === id) || approvals[0];
  const requiredDocs = documents.filter(d => d.approvalId === approval.id);

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
          
          <button
            onClick={() => navigate('/approvals')}
            className="mb-4 text-xs font-bold text-slate-600 hover:text-slate-900 flex items-center gap-1.5"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Approval Roadmap</span>
          </button>

          {/* Header Card */}
          <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm mb-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-extrabold uppercase px-2 py-0.5 rounded bg-govNavy-50 text-govNavy-700 border border-govNavy-200">
                    {approval.id}
                  </span>
                  <span className="text-xs text-slate-500 font-medium">{approval.department}</span>
                </div>
                <h1 className="text-2xl font-black text-slate-900 mt-2">{approval.name}</h1>
              </div>

              <div className="flex items-center gap-2">
                <StatusBadge status={approval.status} size="md" />
                <RiskBadge risk={approval.risk} size="md" />
              </div>
            </div>

            {/* Why This Approval Matters */}
            <div className="mt-4">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-1">Why This Approval Matters</h3>
              <p className="text-xs text-slate-700 leading-relaxed font-medium">
                {approval.whyItMatters}
              </p>
              <p className="text-xs text-slate-500 mt-1">
                {approval.description}
              </p>
            </div>
          </div>

          {/* Risk Explanation & Recommended Action */}
          {approval.risk === 'HIGH' && (
            <div className="bg-rose-50 border-2 border-rose-300 rounded-xl p-5 mb-6">
              <div className="flex items-start gap-3">
                <ShieldAlert className="w-6 h-6 text-rose-600 shrink-0 mt-0.5" />
                <div>
                  <h3 className="text-sm font-bold text-rose-950">Risk Explanation & Cause</h3>
                  <p className="text-xs text-rose-900 mt-1 font-medium">
                    Production capacity and constructed area differ between submitted documents (Building Plan says 10,000 sq ft vs DPR 12,500 sq ft). Furthermore, Form 1-A Environmental Impact Self-Declaration has not been uploaded.
                  </p>
                  
                  <div className="mt-3 pt-3 border-t border-rose-200/80 flex flex-wrap items-center justify-between gap-3">
                    <p className="text-xs font-bold text-slate-900">
                      Recommended Action: Correct capacity statements and upload missing environmental declaration.
                    </p>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => resolveDocumentMismatch()}
                        className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold rounded-lg shadow-sm transition-colors cursor-pointer"
                      >
                        Resolve Document Issue
                      </button>

                      <Link
                        to="/documents"
                        className="px-3.5 py-2 bg-white text-slate-800 text-xs font-bold rounded-lg border border-slate-300 hover:bg-slate-50"
                      >
                        View Documents
                      </Link>
                    </div>
                  </div>

                </div>
              </div>
            </div>
          )}

          {/* Required Documents Table */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6 mb-6">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
              <h3 className="text-base font-bold text-slate-900">Required Documents ({requiredDocs.length})</h3>
              <Link to="/documents" className="text-xs font-bold text-govNavy-700 hover:underline">
                Open Document Checker →
              </Link>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 text-slate-700 font-bold border-b border-slate-200">
                  <tr>
                    <th className="py-3 px-4">Document Name</th>
                    <th className="py-3 px-4">Requirement</th>
                    <th className="py-3 px-4">Status</th>
                    <th className="py-3 px-4">Detected Issue</th>
                    <th className="py-3 px-4 text-right">Action Required</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {requiredDocs.map(doc => (
                    <tr key={doc.id} className="hover:bg-slate-50">
                      <td className="py-3 px-4 font-bold text-slate-900">{doc.name}</td>
                      <td className="py-3 px-4 text-slate-500 font-medium">{doc.requirement}</td>
                      <td className="py-3 px-4">
                        <StatusBadge status={doc.status} size="sm" />
                      </td>
                      <td className="py-3 px-4 text-slate-600 font-medium">
                        {doc.issue || 'No issues detected'}
                      </td>
                      <td className="py-3 px-4 text-right font-semibold text-govNavy-700">
                        {doc.action}
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
