import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, 
  Building2, 
  FileText, 
  ShieldAlert, 
  CheckCircle2, 
  MessageSquare, 
  Flag, 
  ExternalLink,
  Plus
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { IntelligenceBanner } from '../../components/common/IntelligenceBanner';
import { Navbar } from '../../components/layout/Navbar';
import { AdminSidebar } from '../../components/layout/AdminSidebar';
import { Footer } from '../../components/layout/Footer';
import { StatusBadge } from '../../components/ui/StatusBadge';
import { RiskBadge } from '../../components/ui/RiskBadge';
import { Modal } from '../../components/ui/Modal';

export const AdminApplicationDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { adminApplications, addAdminReviewNote, updateAdminAppStatus } = useApp();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [noteModalOpen, setNoteModalOpen] = useState(false);
  const [noteText, setNoteText] = useState('');

  const app = adminApplications.find(a => a.id === id) || adminApplications[0];

  const handleAddNoteSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (noteText.trim()) {
      addAdminReviewNote(app.id, noteText);
      setNoteText('');
      setNoteModalOpen(false);
    }
  };

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
          
          <button
            onClick={() => navigate('/admin/applications')}
            className="mb-4 text-xs font-bold text-slate-400 hover:text-white flex items-center gap-1.5"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to All Applications</span>
          </button>

          {/* Application Header Card */}
          <div className="bg-slate-900 rounded-xl border border-slate-800 p-6 shadow-md mb-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-black uppercase px-2 py-0.5 rounded bg-amber-500/20 text-amber-400 border border-amber-500/30">
                    Application ID: {app.id}
                  </span>
                  <span className="text-xs text-slate-400 font-medium">{app.departmentInCharge}</span>
                </div>
                <h1 className="text-2xl font-black text-white mt-2">{app.businessName}</h1>
                <p className="text-xs text-slate-400 mt-0.5">
                  {app.industry} • {app.location} • Last Updated: {app.lastUpdated}
                </p>
              </div>

              <div className="flex items-center gap-2">
                <StatusBadge status={app.status} size="md" />
                <RiskBadge risk={app.risk} size="md" />
              </div>
            </div>

            {/* Enterprise Parameters */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-4 pt-2 text-xs">
              <div className="p-3 bg-slate-950 rounded-lg border border-slate-800">
                <span className="text-slate-400 block text-[10px] uppercase font-semibold">Capital Investment</span>
                <span className="text-sm font-bold text-white">₹5 Crore</span>
              </div>
              <div className="p-3 bg-slate-950 rounded-lg border border-slate-800">
                <span className="text-slate-400 block text-[10px] uppercase font-semibold">Workforce</span>
                <span className="text-sm font-bold text-white">50 Employees</span>
              </div>
              <div className="p-3 bg-slate-950 rounded-lg border border-slate-800">
                <span className="text-slate-400 block text-[10px] uppercase font-semibold">Land Extent</span>
                <span className="text-sm font-bold text-white">5 Acres</span>
              </div>
              <div className="p-3 bg-slate-950 rounded-lg border border-slate-800">
                <span className="text-slate-400 block text-[10px] uppercase font-semibold">Project Category</span>
                <span className="text-sm font-bold text-white">New Manufacturing Unit</span>
              </div>
            </div>
          </div>

          {/* Document Inconsistency Callout */}
          {app.hasMismatch ? (
            <div className="bg-rose-950/60 border-2 border-rose-800 rounded-xl p-5 mb-6">
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-start gap-3">
                  <ShieldAlert className="w-6 h-6 text-rose-400 shrink-0 mt-0.5" />
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-rose-800 text-white">
                      Document Area Inconsistency Detected
                    </span>
                    <h3 className="text-base font-bold text-white mt-1">
                      Building Plan vs Detailed Project Report Discrepancy
                    </h3>
                    
                    <div className="grid grid-cols-2 gap-3 mt-3 max-w-md">
                      <div className="p-2 bg-slate-900 rounded border border-rose-900 text-xs">
                        <span className="text-slate-400 block text-[10px]">Building Layout Plan</span>
                        <span className="text-white font-bold text-sm">10,000 sq ft</span>
                      </div>
                      <div className="p-2 bg-slate-900 rounded border border-rose-900 text-xs">
                        <span className="text-slate-400 block text-[10px]">Project Report (DPR)</span>
                        <span className="text-white font-bold text-sm">12,500 sq ft</span>
                      </div>
                    </div>

                    <p className="text-xs text-rose-200 mt-2">
                      The Pollution Control Board technical clearance requires constructed footprint area matching Effluent Treatment Plant sizing.
                    </p>
                  </div>
                </div>

                <div className="flex flex-col gap-2 shrink-0">
                  <button
                    onClick={() => updateAdminAppStatus(app.id, 'Needs Attention')}
                    className="px-3.5 py-2 bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold rounded-lg shadow-sm flex items-center gap-1.5 cursor-pointer"
                  >
                    <Flag className="w-3.5 h-3.5" />
                    <span>Flag for Correction</span>
                  </button>

                  <button
                    onClick={() => updateAdminAppStatus(app.id, 'In Review')}
                    className="px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-white text-xs font-bold rounded-lg border border-slate-700 flex items-center gap-1.5 cursor-pointer"
                  >
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Mark Reviewed</span>
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-emerald-950/40 border border-emerald-800 rounded-xl p-5 mb-6 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <CheckCircle2 className="w-6 h-6 text-emerald-400" />
                <div>
                  <h3 className="text-sm font-bold text-white">Document Inconsistency Resolved</h3>
                  <p className="text-xs text-emerald-300">Building Plan and DPR figures aligned to 12,500 sq ft.</p>
                </div>
              </div>
              <span className="text-xs font-bold text-emerald-400 bg-emerald-900 px-3 py-1 rounded">Passed Audit</span>
            </div>
          )}

          {/* Approval & Document Summaries */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            
            <div className="bg-slate-900 rounded-xl border border-slate-800 p-5 shadow-sm">
              <h3 className="text-sm font-bold text-white border-b border-slate-800 pb-3 mb-3">
                Approval Breakdown (18 Approvals)
              </h3>
              <div className="grid grid-cols-2 gap-3 text-xs">
                <div className="p-3 bg-slate-950 rounded border border-slate-800">
                  <span className="text-emerald-400 font-bold block text-sm">8 Completed</span>
                  <span className="text-slate-400 text-[10px]">NA, Labour, Trade, GST</span>
                </div>
                <div className="p-3 bg-slate-950 rounded border border-slate-800">
                  <span className="text-blue-400 font-bold block text-sm">5 In Progress</span>
                  <span className="text-slate-400 text-[10px]">Pollution CTE, DISH Plan</span>
                </div>
                <div className="p-3 bg-slate-950 rounded border border-slate-800">
                  <span className="text-slate-400 font-bold block text-sm">3 Pending</span>
                  <span className="text-slate-400 text-[10px]">Fire NOC, Electricity</span>
                </div>
                <div className="p-3 bg-slate-950 rounded border border-slate-800">
                  <span className="text-rose-400 font-bold block text-sm">2 High Risk</span>
                  <span className="text-slate-400 text-[10px]">CTE Area Mismatch</span>
                </div>
              </div>
            </div>

            <div className="bg-slate-900 rounded-xl border border-slate-800 p-5 shadow-sm">
              <h3 className="text-sm font-bold text-white border-b border-slate-800 pb-3 mb-3">
                Document Gate Breakdown (27 Documents)
              </h3>
              <div className="grid grid-cols-2 gap-3 text-xs">
                <div className="p-3 bg-slate-950 rounded border border-slate-800">
                  <span className="text-emerald-400 font-bold block text-sm">24 Accepted</span>
                  <span className="text-slate-400 text-[10px]">Land Registry, Power Load</span>
                </div>
                <div className="p-3 bg-slate-950 rounded border border-slate-800">
                  <span className="text-amber-400 font-bold block text-sm">2 Need Correction</span>
                  <span className="text-slate-400 text-[10px]">Building Layout, DPR</span>
                </div>
                <div className="p-3 bg-slate-950 rounded border border-slate-800">
                  <span className="text-rose-400 font-bold block text-sm">1 Missing</span>
                  <span className="text-slate-400 text-[10px]">Form 1-A Declaration</span>
                </div>
                <div className="p-3 bg-slate-950 rounded border border-slate-800">
                  <span className="text-blue-400 font-bold block text-sm">0 Pending Audit</span>
                  <span className="text-slate-400 text-[10px]">Queue Clear</span>
                </div>
              </div>
            </div>

          </div>

          {/* Officer Review Notes Feed */}
          <div className="bg-slate-900 rounded-xl border border-slate-800 p-5 shadow-sm">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800 mb-4">
              <div className="flex items-center gap-2">
                <MessageSquare className="w-4 h-4 text-amber-400" />
                <h3 className="text-sm font-bold text-white">Officer Review Notes & Audit Log</h3>
              </div>

              <button
                onClick={() => setNoteModalOpen(true)}
                className="px-3 py-1.5 bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs rounded transition-colors flex items-center gap-1 cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Review Note</span>
              </button>
            </div>

            <div className="space-y-2.5">
              {app.reviewNotes.map((note, idx) => (
                <div key={idx} className="p-3 bg-slate-950 rounded-lg border border-slate-800 text-xs text-slate-300">
                  <span className="text-[10px] font-bold text-amber-400 block uppercase mb-0.5">Official Inspector Entry #{idx + 1}</span>
                  <p>{note}</p>
                </div>
              ))}
            </div>
          </div>

        </main>
      </div>

      {/* Add Review Note Modal */}
      <Modal
        isOpen={noteModalOpen}
        onClose={() => setNoteModalOpen(false)}
        title={`Add Official Review Note — ${app.id}`}
        subtitle="This entry will be appended to the official application audit log."
      >
        <form onSubmit={handleAddNoteSubmit} className="space-y-4 text-slate-900">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Inspector Note Text</label>
            <textarea
              rows={4}
              value={noteText}
              onChange={(e) => setNoteText(e.target.value)}
              placeholder="e.g. Verified structural calculation report. Applicant instructed to correct site boundary drawing."
              required
              className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-xs"
            />
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={() => setNoteModalOpen(false)}
              className="px-4 py-2 bg-slate-200 text-slate-800 text-xs font-bold rounded-lg"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 bg-amber-600 text-white text-xs font-bold rounded-lg shadow-sm"
            >
              Append Review Note
            </button>
          </div>
        </form>
      </Modal>

      <Footer />
    </div>
  );
};
