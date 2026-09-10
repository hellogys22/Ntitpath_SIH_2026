import React, { useState, useMemo, useRef, useEffect } from 'react';
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
  Eye,
  Layers,
  Building2,
  Clock,
  ExternalLink,
  ChevronDown,
  ChevronRight,
  Sparkles,
  HelpCircle,
  RefreshCw,
  AlertCircle
} from 'lucide-react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useApp } from '../../context/AppContext';
import { IntelligenceBanner } from '../../components/common/IntelligenceBanner';
import { Navbar } from '../../components/layout/Navbar';
import { Sidebar } from '../../components/layout/Sidebar';
import { Footer } from '../../components/layout/Footer';
import { MetricCard } from '../../components/ui/MetricCard';
import { StatusBadge } from '../../components/ui/StatusBadge';
import { Modal } from '../../components/ui/Modal';
import { DocumentMismatchAlert } from '../../components/common/DocumentMismatchAlert';
import { DocumentPreviewModal } from '../../components/common/DocumentPreviewModal';
import { DocumentItem, RuleCheckResult } from '../../types';
import { VerificationEngine } from '../../services/verificationEngine';

export const DocumentsPage: React.FC = () => {
  const navigate = useNavigate();
  const { 
    documents, 
    approvals, 
    businessProfile,
    isMismatchResolved, 
    resolveDocumentMismatch, 
    uploadRealDocument,
    reuploadRealDocument,
    uploadDocumentSimulated, 
    markDocumentVerified,
    showToast 
  } = useApp();

  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<'All' | 'Verified' | 'Needs Correction' | 'Not Uploaded'>('All');
  const [difficultyFilter, setDifficultyFilter] = useState<'All' | 'Easy' | 'Moderate' | 'Difficult'>('All');
  const [viewMode, setViewMode] = useState<'clearance' | 'flat' | 'difficulty'>('clearance');
  const [collapsedApprovals, setCollapsedApprovals] = useState<Record<string, boolean>>({});

  const [searchParams] = useSearchParams();

  // Preview modal state
  const [previewDoc, setPreviewDoc] = useState<DocumentItem | null>(null);
  const [isPreviewModalOpen, setIsPreviewModalOpen] = useState(false);

  // Deep-linking from Approval Details or notifications
  useEffect(() => {
    const docIdParam = searchParams.get('docId');
    const statusParam = searchParams.get('status');

    if (statusParam && ['All', 'Verified', 'Needs Correction', 'Not Uploaded'].includes(statusParam)) {
      setStatusFilter(statusParam as any);
    }

    if (docIdParam) {
      const target = documents.find(d => d.id === docIdParam);
      if (target) {
        setPreviewDoc(target);
        setIsPreviewModalOpen(true);
      }
    }
  }, [searchParams, documents]);

  // Real File picker trigger
  const filePickerRef = useRef<HTMLInputElement>(null);
  const [targetDocForPicker, setTargetDocForPicker] = useState<{ doc: DocumentItem; isReupload: boolean } | null>(null);

  // Upload modal state
  const [selectedDoc, setSelectedDoc] = useState<DocumentItem | null>(null);
  const [uploadModalOpen, setUploadModalOpen] = useState(false);
  const [uploadFileName, setUploadFileName] = useState('');
  const [isReupload, setIsReupload] = useState(false);

  // Counts
  const verifiedCount = documents.filter(d => d.status === 'Verified').length;
  const correctionCount = documents.filter(d => d.status === 'Needs Correction').length;
  const notUploadedCount = documents.filter(d => d.status === 'Not Uploaded' || d.status === 'Missing').length;

  const easyCount = documents.filter(d => d.acquisitionDifficulty === 'Easy').length;
  const moderateCount = documents.filter(d => d.acquisitionDifficulty === 'Moderate').length;
  const difficultCount = documents.filter(d => d.acquisitionDifficulty === 'Difficult' || d.acquisitionDifficulty === 'High').length;

  // Filtered documents
  const filteredDocs = useMemo(() => {
    return documents.filter(d => {
      const matchesSearch = 
        d.name.toLowerCase().includes(search.toLowerCase()) || 
        (d.approvalName && d.approvalName.toLowerCase().includes(search.toLowerCase())) ||
        (d.issuingAuthority && d.issuingAuthority.toLowerCase().includes(search.toLowerCase()));

      const docNormalizedStatus = d.status === 'Missing' ? 'Not Uploaded' : d.status;
      const matchesStatus = 
        statusFilter === 'All' || 
        docNormalizedStatus === statusFilter;

      const matchesDifficulty = 
        difficultyFilter === 'All' || 
        (difficultyFilter === 'Difficult' 
          ? (d.acquisitionDifficulty === 'Difficult' || d.acquisitionDifficulty === 'High')
          : d.acquisitionDifficulty === difficultyFilter);

      return matchesSearch && matchesStatus && matchesDifficulty;
    });
  }, [documents, search, statusFilter, difficultyFilter]);

  // Group by Approval Clearance
  const approvalGroups = useMemo(() => {
    const map = new Map<string, { approval: any; docs: DocumentItem[] }>();

    // Seed with all known approvals
    for (const app of approvals) {
      map.set(app.id, { approval: app, docs: [] });
    }

    // Assign documents to their matching approval group
    for (const doc of filteredDocs) {
      if (map.has(doc.approvalId)) {
        map.get(doc.approvalId)!.docs.push(doc);
      } else {
        // Fallback by name match or generic group
        const matchedApp = approvals.find(a => 
          a.name.toLowerCase().includes(doc.approvalName?.toLowerCase() || '') ||
          (doc.approvalName && doc.approvalName.toLowerCase().includes(a.name.toLowerCase()))
        );

        if (matchedApp && map.has(matchedApp.id)) {
          map.get(matchedApp.id)!.docs.push(doc);
        } else {
          const fallbackId = doc.approvalId || 'GEN-001';
          if (!map.has(fallbackId)) {
            map.set(fallbackId, {
              approval: {
                id: fallbackId,
                name: doc.approvalName || 'Statutory Compliance Clearances',
                department: doc.issuingAuthority || 'State Single Window Authority',
                dueStage: 'Clearance Dossier',
                whyItMatters: 'Mandatory statutory documentation required under industrial policy.',
              },
              docs: [],
            });
          }
          map.get(fallbackId)!.docs.push(doc);
        }
      }
    }

    // Return groups that have documents or match the search
    return Array.from(map.values()).filter(group => group.docs.length > 0);
  }, [approvals, filteredDocs]);

  // Group by Difficulty
  const difficultyGroups = useMemo(() => {
    return {
      easy: filteredDocs.filter(d => d.acquisitionDifficulty === 'Easy'),
      moderate: filteredDocs.filter(d => d.acquisitionDifficulty === 'Moderate'),
      difficult: filteredDocs.filter(d => d.acquisitionDifficulty === 'Difficult' || d.acquisitionDifficulty === 'High'),
    };
  }, [filteredDocs]);

  const toggleApprovalCollapse = (approvalId: string) => {
    setCollapsedApprovals(prev => ({ ...prev, [approvalId]: !prev[approvalId] }));
  };

  const triggerDirectFilePick = (doc: DocumentItem, isReupload = false) => {
    setTargetDocForPicker({ doc, isReupload });
    if (filePickerRef.current) {
      filePickerRef.current.value = '';
      filePickerRef.current.click();
    }
  };

  const handleNativeFilePicked = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !targetDocForPicker) return;

    const { doc, isReupload } = targetDocForPicker;
    if (isReupload) {
      await reuploadRealDocument(doc.id, file);
    } else {
      await uploadRealDocument(doc.id, file);
    }
    setTargetDocForPicker(null);
  };

  const handleOpenPreview = (doc: DocumentItem) => {
    setPreviewDoc(doc);
    setIsPreviewModalOpen(true);
  };

  const handleModalReupload = async (doc: DocumentItem, file: File) => {
    await reuploadRealDocument(doc.id, file);
    const updated = documents.find(d => d.id === doc.id);
    if (updated) {
      setPreviewDoc({ ...updated, currentVersion: (doc.currentVersion || 1) + 1 });
    }
  };

  const handleOpenUpload = (doc: DocumentItem, reupload = false) => {
    triggerDirectFilePick(doc, reupload);
  };

  const handleUploadSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedDoc && uploadFileName) {
      uploadDocumentSimulated(selectedDoc.id, uploadFileName);
      setUploadModalOpen(false);
      setUploadFileName('');
      setSelectedDoc(null);
    }
  };

  // Helper to render difficulty badge with color dot
  const renderDifficultyBadge = (difficulty?: string) => {
    if (difficulty === 'Easy') {
      return (
        <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[11px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
          <span>Easy • Quick Win</span>
        </span>
      );
    }
    if (difficulty === 'Moderate') {
      return (
        <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[11px] font-bold bg-amber-50 text-amber-700 border border-amber-200">
          <span className="w-1.5 h-1.5 rounded-full bg-amber-500"></span>
          <span>Moderate • 1–2 Weeks</span>
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[11px] font-bold bg-rose-50 text-rose-700 border border-rose-200">
        <span className="w-1.5 h-1.5 rounded-full bg-rose-500"></span>
        <span>Difficult • High Lead Time</span>
      </span>
    );
  };

  // Helper to render rule check results inline
  const renderRuleChecks = (doc: DocumentItem) => {
    // If ruleChecks is populated, use it, else evaluate via engine
    const verification = doc.ruleChecks && doc.ruleChecks.length > 0 
      ? { ruleChecks: doc.ruleChecks, status: doc.status }
      : VerificationEngine.verifyDocument(doc, businessProfile, documents);

    const checks = verification.ruleChecks;
    const failedChecks = checks.filter(c => !c.passed);

    if (doc.status === 'Not Uploaded' || doc.status === 'Missing') {
      return (
        <div className="mt-2 text-[11px] text-slate-500 flex items-center gap-1.5">
          <FileText className="w-3.5 h-3.5 text-slate-400" />
          <span>Awaiting document upload. Required for statutory clearance review.</span>
        </div>
      );
    }

    if (failedChecks.length > 0) {
      return (
        <div className="mt-3 p-3.5 bg-amber-50/90 rounded-lg border border-amber-300 space-y-2.5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5 text-xs font-bold text-amber-900">
              <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
              <span>Deterministic Rule Verification: {failedChecks.length} Check(s) Failed</span>
            </div>
            <button
              onClick={() => handleOpenUpload(doc, true)}
              className="px-2.5 py-1 bg-govNavy-800 hover:bg-govNavy-900 text-white text-[11px] font-bold rounded shadow-2xs transition-colors flex items-center gap-1 cursor-pointer"
            >
              <Upload className="w-3 h-3" />
              <span>Re-upload Corrected Version</span>
            </button>
          </div>

          <div className="space-y-2 text-xs">
            {failedChecks.map((check, idx) => (
              <div key={idx} className="p-2.5 bg-white/90 rounded border border-amber-200 space-y-1">
                <div className="flex items-center justify-between text-[11px] font-bold text-slate-800">
                  <span className="text-rose-700">✕ {check.title}</span>
                  <span className="text-slate-400 font-mono text-[10px]">{check.ruleId}</span>
                </div>
                
                <p className="text-slate-700 text-[11px] leading-relaxed">
                  <strong>Reason:</strong> {check.message}
                </p>

                {check.expectedValue && (
                  <div className="text-[10px] text-slate-600 bg-slate-50 p-1.5 rounded border border-slate-200">
                    <div><span className="font-semibold text-slate-700">Expected:</span> {check.expectedValue}</div>
                    {check.foundValue && <div><span className="font-semibold text-rose-700">Found:</span> {check.foundValue}</div>}
                  </div>
                )}

                <p className="text-govNavy-900 text-[11px] font-medium pt-0.5">
                  <strong>What to do:</strong> {check.remediation}
                </p>
              </div>
            ))}
          </div>
        </div>
      );
    }

    return (
      <div className="mt-2 text-[11px] text-emerald-800 bg-emerald-50/80 px-2.5 py-1.5 rounded border border-emerald-200 flex items-center gap-1.5">
        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
        <span>✓ All deterministic rule checks passed (Required Fields, Legal Entity Name, Validity Period, Cross-Doc Dimensions).</span>
      </div>
    );
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-900 font-sans">
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
          
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
            <div>
              <div className="flex items-center gap-2">
                <FileCheck2 className="w-6 h-6 text-govNavy-700" />
                <h1 className="text-2xl font-black text-slate-900 tracking-tight">
                  Document Center / दस्तावेज़ केंद्र
                </h1>
              </div>
              <p className="text-xs text-slate-600 mt-1">
                Statutory document repository grouped by approval clearance. Deterministic verification ensures zero rejection at department scrutiny.
              </p>
            </div>

            <button
              onClick={() => resolveDocumentMismatch()}
              className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-lg shadow-xs transition-colors flex items-center gap-1.5 cursor-pointer self-start sm:self-auto"
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
              subtitle="Full Statutory Checklist"
              icon={FileText}
            />
            <MetricCard
              title="Verified"
              value={verifiedCount}
              subtitle="All Rule Checks Passed"
              variant="success"
              icon={CheckCircle2}
            />
            <MetricCard
              title="Needs Correction"
              value={correctionCount}
              subtitle={correctionCount > 0 ? "Rule Check Issues Detected" : "No Issues"}
              variant={correctionCount > 0 ? "danger" : "default"}
              icon={AlertTriangle}
            />
            <MetricCard
              title="Not Uploaded"
              value={notUploadedCount}
              subtitle={`${notUploadedCount} Documents Pending Upload`}
              variant={notUploadedCount > 0 ? "warning" : "default"}
              icon={XCircle}
            />
          </div>

          {/* Document Inconsistency Alert */}
          <DocumentMismatchAlert />

          {/* Control Bar: View Mode, Filters & Search */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-xs p-4 sm:p-5 mb-6 space-y-4">
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
              
              {/* View Mode Toggle */}
              <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-lg border border-slate-200 text-xs self-start">
                <button
                  onClick={() => setViewMode('clearance')}
                  className={`px-3 py-1.5 rounded-md font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                    viewMode === 'clearance'
                      ? 'bg-govNavy-800 text-white shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <Layers className="w-3.5 h-3.5" />
                  <span>Group by Clearance ({approvalGroups.length})</span>
                </button>
                <button
                  onClick={() => setViewMode('flat')}
                  className={`px-3 py-1.5 rounded-md font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                    viewMode === 'flat'
                      ? 'bg-govNavy-800 text-white shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <FileText className="w-3.5 h-3.5" />
                  <span>All Documents ({filteredDocs.length})</span>
                </button>
                <button
                  onClick={() => setViewMode('difficulty')}
                  className={`px-3 py-1.5 rounded-md font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                    viewMode === 'difficulty'
                      ? 'bg-govNavy-800 text-white shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <Clock className="w-3.5 h-3.5" />
                  <span>By Acquisition Lead Time</span>
                </button>
              </div>

              {/* Search Bar */}
              <div className="relative w-full lg:w-72">
                <input
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search document, authority, or clearance..."
                  className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-xs font-medium text-slate-900 focus:ring-2 focus:ring-govNavy-700"
                />
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
              </div>
            </div>

            {/* Filter Pills */}
            <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-slate-100">
              {/* Status Filter */}
              <div className="flex flex-wrap items-center gap-1.5 text-xs">
                <span className="text-slate-500 font-bold mr-1 text-[11px] uppercase">Status:</span>
                {(['All', 'Verified', 'Needs Correction', 'Not Uploaded'] as const).map(st => (
                  <button
                    key={st}
                    onClick={() => setStatusFilter(st)}
                    className={`px-2.5 py-1 rounded-md text-xs font-bold transition-colors cursor-pointer border ${
                      statusFilter === st
                        ? 'bg-govNavy-800 text-white border-govNavy-800 shadow-2xs'
                        : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
                    }`}
                  >
                    {st === 'All' ? `All (${documents.length})` : st === 'Verified' ? `Verified (${verifiedCount})` : st === 'Needs Correction' ? `Needs Correction (${correctionCount})` : `Not Uploaded (${notUploadedCount})`}
                  </button>
                ))}
              </div>

              {/* Difficulty Filter */}
              <div className="flex flex-wrap items-center gap-1.5 text-xs">
                <span className="text-slate-500 font-bold mr-1 text-[11px] uppercase">Lead Time:</span>
                {(['All', 'Easy', 'Moderate', 'Difficult'] as const).map(df => (
                  <button
                    key={df}
                    onClick={() => setDifficultyFilter(df)}
                    className={`px-2.5 py-1 rounded-md text-xs font-bold transition-colors cursor-pointer border ${
                      difficultyFilter === df
                        ? 'bg-slate-800 text-white border-slate-800 shadow-2xs'
                        : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
                    }`}
                  >
                    {df === 'All' ? 'All' : df === 'Easy' ? `🟢 Easy (${easyCount})` : df === 'Moderate' ? `🟡 Moderate (${moderateCount})` : `🔴 Difficult (${difficultCount})`}
                  </button>
                ))}
              </div>
            </div>

          </div>

          {/* VIEW MODE 1: GROUPED BY STATUTORY APPROVAL CLEARANCE */}
          {viewMode === 'clearance' && (
            <div className="space-y-6 mb-8">
              {approvalGroups.map(({ approval, docs }) => {
                const isCollapsed = !!collapsedApprovals[approval.id];
                const groupVerified = docs.filter(d => d.status === 'Verified').length;
                const groupCorrection = docs.filter(d => d.status === 'Needs Correction').length;

                return (
                  <div 
                    key={approval.id} 
                    className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden"
                  >
                    {/* Clearance Header Strip */}
                    <div 
                      onClick={() => toggleApprovalCollapse(approval.id)}
                      className="p-4 sm:p-5 bg-gradient-to-r from-slate-50 to-white border-b border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3 cursor-pointer hover:bg-slate-100/60 transition-colors"
                    >
                      <div className="flex items-start sm:items-center gap-3">
                        <button className="text-slate-500 hover:text-slate-800 mt-0.5 sm:mt-0">
                          {isCollapsed ? <ChevronRight className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
                        </button>

                        <div>
                          <div className="flex flex-wrap items-center gap-2">
                            <span className="px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-wider bg-govNavy-50 text-govNavy-800 border border-govNavy-200">
                              {approval.id}
                            </span>
                            <span className="text-xs text-slate-500 font-semibold">{approval.department}</span>
                          </div>
                          <h3 className="text-base font-extrabold text-slate-900 mt-1">
                            {approval.name}
                          </h3>
                        </div>
                      </div>

                      <div className="flex items-center gap-3 pl-8 sm:pl-0">
                        <div className="text-right text-xs">
                          <span className="text-slate-500 block text-[10px] uppercase font-bold">Document Readiness</span>
                          <span className="font-extrabold text-slate-900">
                            {groupVerified} / {docs.length} Verified
                          </span>
                        </div>

                        {groupCorrection > 0 && (
                          <span className="px-2.5 py-1 rounded-full text-[11px] font-extrabold bg-amber-100 text-amber-900 border border-amber-300 flex items-center gap-1">
                            <AlertTriangle className="w-3.5 h-3.5 text-amber-700" />
                            <span>{groupCorrection} Needs Correction</span>
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Document List Inside Group */}
                    {!isCollapsed && (
                      <div className="divide-y divide-slate-100">
                        {docs.map(doc => (
                          <div key={doc.id} className="p-4 sm:p-5 hover:bg-slate-50/50 transition-colors">
                            <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
                              
                              <div className="space-y-1 max-w-2xl">
                                <div className="flex flex-wrap items-center gap-2">
                                  <FileText className="w-4 h-4 text-govNavy-700 shrink-0" />
                                  <span className="text-sm font-bold text-slate-900">{doc.name}</span>
                                  <span className={`text-[10px] px-2 py-0.5 rounded font-bold ${
                                    doc.requirement === 'Required' ? 'bg-slate-100 text-slate-800 border border-slate-200' : 'bg-slate-50 text-slate-500'
                                  }`}>
                                    {doc.requirement}
                                  </span>
                                </div>

                                {/* Where to get it & Difficulty */}
                                <div className="flex flex-wrap items-center gap-3 text-xs text-slate-600 pl-6">
                                  {doc.issuingAuthority && (
                                    <span className="flex items-center gap-1">
                                      <span className="text-slate-400 font-medium">Where to get:</span>
                                      <strong className="text-slate-700">{doc.issuingAuthority}</strong>
                                    </span>
                                  )}
                                  {renderDifficultyBadge(doc.acquisitionDifficulty)}
                                  {doc.uploadedDate && (
                                    <span className="text-[11px] text-slate-400">
                                      Uploaded on {doc.uploadedDate} ({doc.fileSize || '3.5 MB'})
                                    </span>
                                  )}
                                </div>
                              </div>

                              {/* Status Pill & Action Buttons */}
                              <div className="flex items-center gap-3 self-start md:self-center pl-6 md:pl-0">
                                <StatusBadge status={doc.status} size="sm" />

                                {doc.status === 'Needs Correction' ? (
                                  <div className="flex items-center gap-2">
                                    <button
                                      onClick={() => handleOpenPreview(doc)}
                                      className="px-2.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-lg border border-slate-300 transition-colors flex items-center gap-1 cursor-pointer"
                                      title="Inspect failed rule checks & preview artifact"
                                    >
                                      <Eye className="w-3.5 h-3.5" />
                                      <span>View</span>
                                    </button>
                                    <button
                                      onClick={() => triggerDirectFilePick(doc, true)}
                                      className="px-3 py-1.5 bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold rounded-lg shadow-2xs transition-colors flex items-center gap-1 cursor-pointer"
                                    >
                                      <Upload className="w-3.5 h-3.5" />
                                      <span>Re-upload</span>
                                    </button>
                                  </div>
                                ) : doc.status === 'Verified' ? (
                                  <button
                                    onClick={() => handleOpenPreview(doc)}
                                    className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-lg border border-slate-300 transition-colors flex items-center gap-1 cursor-pointer"
                                  >
                                    <Eye className="w-3.5 h-3.5" />
                                    <span>View</span>
                                  </button>
                                ) : (
                                  <button
                                    onClick={() => triggerDirectFilePick(doc, false)}
                                    className="px-3 py-1.5 bg-govNavy-800 hover:bg-govNavy-900 text-white text-xs font-bold rounded-lg shadow-2xs transition-colors flex items-center gap-1 cursor-pointer"
                                  >
                                    <Upload className="w-3.5 h-3.5" />
                                    <span>Upload</span>
                                  </button>
                                )}
                              </div>
                            </div>

                            {/* Deterministic Rule Verification Inline Breakdown */}
                            <div className="pl-6">
                              {renderRuleChecks(doc)}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}

          {/* VIEW MODE 2: FLAT TABLE VIEW */}
          {viewMode === 'flat' && (
            <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden mb-8">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-100 text-slate-700 font-bold border-b border-slate-200 uppercase tracking-wider text-[11px]">
                    <tr>
                      <th className="py-3.5 px-4">Document Title</th>
                      <th className="py-3.5 px-4">Mapped Clearance</th>
                      <th className="py-3.5 px-4">Where to Get It</th>
                      <th className="py-3.5 px-4">Difficulty</th>
                      <th className="py-3.5 px-4">Verification Status</th>
                      <th className="py-3.5 px-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {filteredDocs.map(doc => (
                      <tr 
                        key={doc.id}
                        className={`hover:bg-slate-50 transition-colors ${doc.status === 'Needs Correction' ? 'bg-amber-50/30' : ''}`}
                      >
                        <td className="py-3.5 px-4 font-bold text-slate-900 max-w-xs">
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

                        <td className="py-3.5 px-4 text-slate-600 font-medium max-w-xs">
                          {doc.approvalName}
                        </td>

                        <td className="py-3.5 px-4 text-slate-700 font-medium">
                          {doc.issuingAuthority || 'CSIDC / Single Window'}
                        </td>

                        <td className="py-3.5 px-4">
                          {renderDifficultyBadge(doc.acquisitionDifficulty)}
                        </td>

                        <td className="py-3.5 px-4">
                          <StatusBadge status={doc.status} size="sm" />
                        </td>

                        <td className="py-3.5 px-4 text-right">
                          {doc.status === 'Needs Correction' ? (
                            <div className="inline-flex items-center gap-1.5">
                              <button
                                onClick={() => handleOpenPreview(doc)}
                                className="px-2 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded border border-slate-300 transition-colors inline-flex items-center gap-1 cursor-pointer"
                                title="Inspect failed checks in preview"
                              >
                                <Eye className="w-3 h-3" />
                                <span>View</span>
                              </button>
                              <button
                                onClick={() => triggerDirectFilePick(doc, true)}
                                className="px-2.5 py-1 bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold rounded transition-colors inline-flex items-center gap-1 cursor-pointer"
                              >
                                <Upload className="w-3 h-3" />
                                <span>Re-upload</span>
                              </button>
                            </div>
                          ) : doc.status === 'Verified' ? (
                            <button
                              onClick={() => handleOpenPreview(doc)}
                              className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded border border-slate-300 transition-colors inline-flex items-center gap-1 cursor-pointer"
                            >
                              <Eye className="w-3 h-3" />
                              <span>View</span>
                            </button>
                          ) : (
                            <button
                              onClick={() => triggerDirectFilePick(doc, false)}
                              className="px-2.5 py-1 bg-govNavy-800 hover:bg-govNavy-900 text-white text-xs font-bold rounded transition-colors inline-flex items-center gap-1 cursor-pointer"
                            >
                              <Upload className="w-3 h-3" />
                              <span>Upload</span>
                            </button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* VIEW MODE 3: BY DIFFICULTY */}
          {viewMode === 'difficulty' && (
            <div className="space-y-6 mb-8">
              {[
                { title: '🟢 Easy • Quick Win Checklists (1–3 Days)', docs: difficultyGroups.easy, color: 'border-emerald-200 bg-emerald-50/20' },
                { title: '🟡 Moderate • Standard Lead Time (1–2 Weeks)', docs: difficultyGroups.moderate, color: 'border-amber-200 bg-amber-50/20' },
                { title: '🔴 Difficult • High Lead Time (3–6 Weeks)', docs: difficultyGroups.difficult, color: 'border-rose-200 bg-rose-50/20' },
              ].map((tier, idx) => (
                <div key={idx} className={`bg-white rounded-xl border ${tier.color} shadow-xs p-5`}>
                  <div className="flex items-center justify-between pb-3 border-b border-slate-200 mb-4">
                    <h3 className="text-base font-extrabold text-slate-900">{tier.title}</h3>
                    <span className="text-xs font-bold text-slate-600 bg-white px-2.5 py-1 rounded-full border border-slate-200">
                      {tier.docs.length} Documents
                    </span>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {tier.docs.map(doc => (
                      <div key={doc.id} className="p-3.5 bg-slate-50/80 rounded-lg border border-slate-200 space-y-2">
                        <div className="flex items-start justify-between gap-2">
                          <span className="text-xs font-bold text-slate-900">{doc.name}</span>
                          <StatusBadge status={doc.status} size="sm" />
                        </div>
                        <p className="text-[11px] text-slate-500">
                          <strong>Clearance:</strong> {doc.approvalName}
                        </p>
                        <p className="text-[11px] text-slate-600">
                          <strong>Where to get:</strong> {doc.issuingAuthority}
                        </p>

                        <div className="flex items-center justify-between pt-2 border-t border-slate-200/80 mt-2">
                          <span className="text-[10px] text-slate-400 font-mono">
                            {doc.uploadedDate ? `v${doc.currentVersion || 1} • ${doc.uploadedDate}` : 'Not Uploaded'}
                          </span>

                          {doc.status === 'Needs Correction' ? (
                            <div className="flex items-center gap-1.5">
                              <button
                                onClick={() => handleOpenPreview(doc)}
                                className="px-2 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded border border-slate-300 transition-colors"
                              >
                                View
                              </button>
                              <button
                                onClick={() => triggerDirectFilePick(doc, true)}
                                className="px-2.5 py-1 bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold rounded transition-colors"
                              >
                                Re-upload
                              </button>
                            </div>
                          ) : doc.status === 'Verified' ? (
                            <button
                              onClick={() => handleOpenPreview(doc)}
                              className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded border border-slate-300 transition-colors"
                            >
                              View
                            </button>
                          ) : (
                            <button
                              onClick={() => triggerDirectFilePick(doc, false)}
                              className="px-2.5 py-1 bg-govNavy-800 hover:bg-govNavy-900 text-white text-xs font-bold rounded transition-colors"
                            >
                              Upload
                            </button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}

        </main>
      </div>

      {/* Upload Simulation Modal */}
      <Modal
        isOpen={uploadModalOpen}
        onClose={() => setUploadModalOpen(false)}
        title={isReupload ? `Re-upload Corrected Version: ${selectedDoc?.name}` : `Upload Document: ${selectedDoc?.name}`}
        subtitle="File will be evaluated by NitiPath Deterministic Rule Engine upon submission"
      >
        <form onSubmit={handleUploadSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-800 mb-1">
              Select Certified File (.pdf, .png, .jpg)
            </label>
            <input
              type="text"
              value={uploadFileName}
              onChange={(e) => setUploadFileName(e.target.value)}
              placeholder="e.g. Corrected_Site_Layout_Drawing_12500sqft.pdf"
              required
              className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-xs font-medium text-slate-900 focus:ring-2 focus:ring-govNavy-700"
            />
          </div>

          <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 text-xs text-slate-600 space-y-1">
            <span className="font-bold text-slate-800 block">Deterministic Rule Checks:</span>
            <ul className="list-disc list-inside text-[11px] text-slate-600 space-y-0.5">
              <li>Required statutory fields present</li>
              <li>Enterprise legal name matches registered profile</li>
              <li>Certificate validity is unexpired</li>
              <li>Cross-document consistency (e.g. built-up footprint matches DPR)</li>
            </ul>
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={() => setUploadModalOpen(false)}
              className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-lg transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 bg-govNavy-800 hover:bg-govNavy-900 text-white text-xs font-bold rounded-lg shadow-xs transition-colors cursor-pointer"
            >
              {isReupload ? 'Submit Corrected Version' : 'Upload & Run Verification'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Hidden Native File Picker Input for real file selection */}
      <input
        type="file"
        ref={filePickerRef}
        onChange={handleNativeFilePicked}
        accept=".pdf,.png,.jpg,.jpeg,.doc,.docx"
        className="hidden"
      />

      {/* Document Preview Modal with Signed URL Access & Version History */}
      <DocumentPreviewModal
        isOpen={isPreviewModalOpen}
        onClose={() => setIsPreviewModalOpen(false)}
        document={previewDoc}
        onReupload={handleModalReupload}
      />

      <Footer />
    </div>
  );
};
