import React, { useState } from 'react';
import { 
  FileCheck2, 
  Upload, 
  CheckCircle2, 
  AlertTriangle, 
  FileText, 
  Search, 
  ArrowRight,
  ShieldAlert,
  XCircle,
  Eye
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { IntelligenceBanner } from '../../components/common/IntelligenceBanner';
import { Navbar } from '../../components/layout/Navbar';
import { Sidebar } from '../../components/layout/Sidebar';
import { Footer } from '../../components/layout/Footer';
import { MetricCard } from '../../components/ui/MetricCard';
import { StatusBadge } from '../../components/ui/StatusBadge';
import { Modal } from '../../components/ui/Modal';
import { DocumentMismatchAlert } from '../../components/common/DocumentMismatchAlert';

export const DocumentsPage: React.FC = () => {
  const { documents, isMismatchResolved, resolveDocumentMismatch, uploadDocumentSimulated, markDocumentVerified } = useApp();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [search, setSearch] = useState('');
  
  const [selectedDoc, setSelectedDoc] = useState<any | null>(null);
  const [uploadModalOpen, setUploadModalOpen] = useState(false);
  const [uploadFileName, setUploadFileName] = useState('');

  const verifiedCount = documents.filter(d => d.status === 'Verified').length;
  const correctionCount = documents.filter(d => d.status === 'Needs Correction').length;
  const missingCount = documents.filter(d => d.status === 'Missing').length;

  const filteredDocs = documents.filter(d => 
    d.name.toLowerCase().includes(search.toLowerCase()) || 
    d.approvalName.toLowerCase().includes(search.toLowerCase())
  );

  const handleUploadSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedDoc && uploadFileName) {
      uploadDocumentSimulated(selectedDoc.id, uploadFileName);
      setUploadModalOpen(false);
      setUploadFileName('');
      setSelectedDoc(null);
    }
  };

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
                <FileCheck2 className="w-5 h-5 text-govNavy-700" />
                <h1 className="text-2xl font-extrabold text-slate-900">Document Check</h1>
              </div>
              <p className="text-xs text-slate-500 mt-1">
                Check document completeness and dimensional consistency before official submission.
              </p>
            </div>

            <button
              onClick={() => resolveDocumentMismatch()}
              className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-lg shadow-sm transition-colors flex items-center gap-1.5 cursor-pointer"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>Simulate Auto-Verification</span>
            </button>
          </div>

          {/* Metrics */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
            <MetricCard
              title="Total Required"
              value={documents.length}
              subtitle="Statutory Checklist"
              icon={FileText}
            />
            <MetricCard
              title="Verified"
              value={verifiedCount}
              subtitle="Passed Consistency Check"
              variant="success"
              icon={CheckCircle2}
            />
            <MetricCard
              title="Needs Correction"
              value={correctionCount}
              subtitle={correctionCount > 0 ? "Area/Capacity Mismatch" : "None"}
              variant={correctionCount > 0 ? "danger" : "default"}
              icon={AlertTriangle}
            />
            <MetricCard
              title="Missing Documents"
              value={missingCount}
              subtitle={missingCount > 0 ? "Form 1-A Declaration" : "All Uploaded"}
              variant={missingCount > 0 ? "warning" : "default"}
              icon={XCircle}
            />
          </div>

          {/* Interactive Document Inconsistency WOW Alert */}
          <DocumentMismatchAlert />

          {/* Document Table */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-4 sm:p-6 mb-8">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pb-4 border-b border-slate-100 mb-4">
              <h3 className="text-base font-bold text-slate-900">Mandatory Document Repository</h3>
              
              <div className="relative w-full sm:w-64">
                <input
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Filter documents..."
                  className="w-full pl-9 pr-3 py-1.5 bg-slate-50 border border-slate-300 rounded-lg text-xs"
                />
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2" />
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-100 text-slate-700 font-bold border-b border-slate-200 uppercase tracking-wider text-[11px]">
                  <tr>
                    <th className="py-3.5 px-4">Document Name</th>
                    <th className="py-3.5 px-4">Mapped Clearance</th>
                    <th className="py-3.5 px-4">Requirement</th>
                    <th className="py-3.5 px-4">Status</th>
                    <th className="py-3.5 px-4">Detected Issue</th>
                    <th className="py-3.5 px-4 text-right">Actions</th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-slate-100">
                  {filteredDocs.map(doc => (
                    <tr 
                      key={doc.id}
                      className={`hover:bg-slate-50 transition-colors ${doc.status === 'Needs Correction' ? 'bg-amber-50/40' : ''}`}
                    >
                      <td className="py-3.5 px-4 font-bold text-slate-900">
                        <div className="flex items-center gap-2">
                          <FileText className="w-4 h-4 text-slate-400 shrink-0" />
                          <span>{doc.name}</span>
                        </div>
                        {doc.uploadedDate && (
                          <span className="text-[10px] text-slate-400 font-normal block pl-6">
                            Uploaded {doc.uploadedDate} ({doc.fileSize})
                          </span>
                        )}
                      </td>

                      <td className="py-3.5 px-4 text-slate-600 font-medium">{doc.approvalName}</td>

                      <td className="py-3.5 px-4 text-slate-500 font-semibold">{doc.requirement}</td>

                      <td className="py-3.5 px-4">
                        <StatusBadge status={doc.status} size="sm" />
                      </td>

                      <td className="py-3.5 px-4 font-medium text-slate-800 max-w-xs">
                        {doc.issue ? (
                          <span className="text-rose-700 font-semibold">{doc.issue}</span>
                        ) : (
                          <span className="text-emerald-700 font-medium">✓ Passed Verification</span>
                        )}
                      </td>

                      <td className="py-3.5 px-4 text-right space-x-2">
                        {doc.status !== 'Verified' && (
                          <button
                            onClick={() => {
                              setSelectedDoc(doc);
                              setUploadModalOpen(true);
                            }}
                            className="px-2.5 py-1 bg-govNavy-800 hover:bg-govNavy-900 text-white text-xs font-bold rounded transition-colors inline-flex items-center gap-1 cursor-pointer"
                          >
                            <Upload className="w-3 h-3" />
                            <span>Upload</span>
                          </button>
                        )}

                        {doc.status === 'Under Review' && (
                          <button
                            onClick={() => markDocumentVerified(doc.id)}
                            className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded transition-colors inline-flex items-center gap-1 cursor-pointer"
                          >
                            <CheckCircle2 className="w-3 h-3" />
                            <span>Verify</span>
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

      {/* Upload Simulation Modal */}
      <Modal
        isOpen={uploadModalOpen}
        onClose={() => setUploadModalOpen(false)}
        title={`Upload Document: ${selectedDoc?.name}`}
        subtitle="Frontend prototype simulation - file will be processed by NitiPath Consistency Engine"
      >
        <form onSubmit={handleUploadSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Select Document File</label>
            <input
              type="text"
              value={uploadFileName}
              onChange={(e) => setUploadFileName(e.target.value)}
              placeholder="e.g. Corrected_Layout_Drawing_12500sqft.pdf"
              required
              className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-xs"
            />
          </div>

          <div className="p-3 bg-slate-100 rounded-lg border border-slate-200 text-xs text-slate-600">
            <span className="font-bold block">Engine Validation:</span>
            Upon submission, NitiPath will cross-verify constructed footprint area and ETP volumetric output ratings.
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={() => setUploadModalOpen(false)}
              className="px-4 py-2 bg-slate-200 text-slate-800 text-xs font-bold rounded-lg"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 bg-govNavy-800 text-white text-xs font-bold rounded-lg shadow-sm"
            >
              Submit for Intelligence Audit
            </button>
          </div>
        </form>
      </Modal>

      <Footer />
    </div>
  );
};
