import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  FileCheck2, 
  Upload, 
  CheckCircle2, 
  AlertTriangle, 
  FileText, 
  Search, 
  ArrowRight,
  ArrowLeft,
  Building2,
  Clock,
  Sparkles,
  Layers,
  MapPin,
  ExternalLink,
  ChevronDown,
  ChevronRight,
  Filter,
  ShieldCheck,
  Zap,
  HelpCircle
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { IntelligenceBanner } from '../../components/common/IntelligenceBanner';
import { Navbar } from '../../components/layout/Navbar';
import { Footer } from '../../components/layout/Footer';
import { MetricCard } from '../../components/ui/MetricCard';
import { Modal } from '../../components/ui/Modal';

export const OnboardingDocumentsPage: React.FC = () => {
  const navigate = useNavigate();
  const { businessProfile, approvals, documents, uploadDocumentSimulated, showToast } = useApp();

  const [search, setSearch] = useState('');
  const [difficultyFilter, setDifficultyFilter] = useState<'All' | 'Easy' | 'Moderate' | 'Difficult'>('All');
  const [viewMode, setViewMode] = useState<'clearance' | 'difficulty'>('clearance');
  const [collapsedApprovals, setCollapsedApprovals] = useState<Record<string, boolean>>({});

  const [selectedDoc, setSelectedDoc] = useState<any | null>(null);
  const [uploadModalOpen, setUploadModalOpen] = useState(false);
  const [uploadFileName, setUploadFileName] = useState('');

  // Counts
  const easyCount = documents.filter(d => d.acquisitionDifficulty === 'Easy').length;
  const moderateCount = documents.filter(d => d.acquisitionDifficulty === 'Moderate').length;
  const difficultCount = documents.filter(d => d.acquisitionDifficulty === 'Difficult' || d.acquisitionDifficulty === 'High').length;
  const verifiedCount = documents.filter(d => d.status === 'Verified').length;

  // Filtered documents
  const filteredDocs = documents.filter(d => {
    const matchesSearch = 
      d.name.toLowerCase().includes(search.toLowerCase()) || 
      (d.issuingAuthority && d.issuingAuthority.toLowerCase().includes(search.toLowerCase())) ||
      d.approvalName.toLowerCase().includes(search.toLowerCase());
    
    const matchesDifficulty = 
      difficultyFilter === 'All' || 
      (difficultyFilter === 'Difficult' 
        ? (d.acquisitionDifficulty === 'Difficult' || d.acquisitionDifficulty === 'High')
        : d.acquisitionDifficulty === difficultyFilter);

    return matchesSearch && matchesDifficulty;
  });

  // Group by Approval
  const approvalGroups = React.useMemo(() => {
    const map = new Map<string, { approval: any; docs: typeof documents }>();
    
    // Group using real approvals
    for (const app of approvals) {
      map.set(app.id, { approval: app, docs: [] });
    }

    // Add matching documents
    for (const doc of filteredDocs) {
      if (map.has(doc.approvalId)) {
        map.get(doc.approvalId)!.docs.push(doc);
      } else {
        // Fallback group for orphaned docs
        const fallbackId = doc.approvalId || 'GEN-001';
        if (!map.has(fallbackId)) {
          map.set(fallbackId, {
            approval: {
              id: fallbackId,
              name: doc.approvalName || 'General Clearances',
              department: doc.issuingAuthority || 'State Single Window Authority',
              dueStage: 'Statutory Requirement',
              whyItMatters: 'Mandatory documentation for statutory filing.',
            },
            docs: [],
          });
        }
        map.get(fallbackId)!.docs.push(doc);
      }
    }

    // Return groups that have at least one matching document
    return Array.from(map.values()).filter(group => group.docs.length > 0);
  }, [approvals, filteredDocs]);

  // Group by Difficulty
  const difficultyGroups = React.useMemo(() => {
    return {
      easy: filteredDocs.filter(d => d.acquisitionDifficulty === 'Easy'),
      moderate: filteredDocs.filter(d => d.acquisitionDifficulty === 'Moderate'),
      difficult: filteredDocs.filter(d => d.acquisitionDifficulty === 'Difficult' || d.acquisitionDifficulty === 'High'),
    };
  }, [filteredDocs]);

  const toggleApprovalCollapse = (approvalId: string) => {
    setCollapsedApprovals(prev => ({ ...prev, [approvalId]: !prev[approvalId] }));
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

  const renderDifficultyBadge = (difficulty?: string) => {
    if (difficulty === 'Easy') {
      return (
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
          <span>Easy • Quick Win</span>
        </span>
      );
    }
    if (difficulty === 'Moderate') {
      return (
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-bold bg-amber-50 text-amber-700 border border-amber-200">
          <span className="w-1.5 h-1.5 rounded-full bg-amber-500"></span>
          <span>Moderate • 1–2 Weeks</span>
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-bold bg-rose-50 text-rose-700 border border-rose-200">
        <span className="w-1.5 h-1.5 rounded-full bg-rose-500"></span>
        <span>Difficult • High Lead Time</span>
      </span>
    );
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-900">
      <IntelligenceBanner />
      <Navbar />

      <main className="flex-1 max-w-7xl mx-auto w-full p-4 sm:p-6 lg:p-8">
        
        {/* Onboarding Transition Banner */}
        <div className="bg-gradient-to-r from-govNavy-900 via-govNavy-800 to-slate-900 text-white rounded-2xl p-6 sm:p-8 shadow-xl mb-8 relative overflow-hidden">
          <div className="absolute -right-8 -bottom-8 w-48 h-48 bg-amber-500/10 rounded-full blur-2xl pointer-events-none"></div>
          
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 relative z-10">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <span className="text-[11px] font-bold uppercase tracking-wider bg-amber-500/20 text-amber-300 px-3 py-0.5 rounded-full border border-amber-500/30 flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Onboarding Step Complete</span>
                </span>
                <span className="text-xs text-slate-300 font-medium">
                  {businessProfile.industry} • {businessProfile.location}
                </span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-black text-white">Documents You'll Need</h1>
              <p className="text-xs sm:text-sm text-slate-300 mt-1.5 max-w-2xl">
                Before initiating formal statutory clearance applications for <strong className="text-white">{businessProfile.companyName}</strong>, review your required documentation dossier below. Knock out <span className="text-emerald-400 font-bold">Easy Quick Wins</span> immediately and begin preparing <span className="text-rose-400 font-bold">Difficult High-Lead-Time</span> items to avoid critical path delays.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <button
                onClick={() => navigate('/approvals')}
                className="px-5 py-3 bg-amber-500 hover:bg-amber-600 text-slate-950 text-xs font-black rounded-xl shadow-lg transition-all flex items-center gap-2 cursor-pointer"
              >
                <span>Proceed to Clearance Roadmap</span>
                <ArrowRight className="w-4 h-4" />
              </button>
              <button
                onClick={() => navigate('/dashboard')}
                className="px-4 py-3 bg-white/10 hover:bg-white/20 text-white text-xs font-bold rounded-xl border border-white/20 transition-all cursor-pointer"
              >
                Go to Dashboard
              </button>
            </div>
          </div>
        </div>

        {/* Metric Cards Row */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
            <span className="text-[11px] font-bold uppercase text-slate-400 block">Total Required</span>
            <span className="text-2xl font-black text-slate-900 mt-1 block">{documents.length}</span>
            <span className="text-[11px] text-slate-500 mt-0.5 block">Statutory checklist items</span>
          </div>

          <div className="bg-white p-4 rounded-xl border border-emerald-200 shadow-xs bg-gradient-to-br from-emerald-50/40 to-white">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold uppercase text-emerald-700">Quick Wins</span>
              <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
            </div>
            <span className="text-2xl font-black text-emerald-700 mt-1 block">{easyCount}</span>
            <span className="text-[11px] text-emerald-600 font-medium mt-0.5 block">Easy • 1–3 Days lead time</span>
          </div>

          <div className="bg-white p-4 rounded-xl border border-amber-200 shadow-xs bg-gradient-to-br from-amber-50/40 to-white">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold uppercase text-amber-700">Standard Technical</span>
              <span className="w-2 h-2 rounded-full bg-amber-500"></span>
            </div>
            <span className="text-2xl font-black text-amber-700 mt-1 block">{moderateCount}</span>
            <span className="text-[11px] text-amber-600 font-medium mt-0.5 block">Moderate • 1–2 Weeks lead time</span>
          </div>

          <div className="bg-white p-4 rounded-xl border border-rose-200 shadow-xs bg-gradient-to-br from-rose-50/40 to-white">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold uppercase text-rose-700">High Lead Time</span>
              <span className="w-2 h-2 rounded-full bg-rose-500"></span>
            </div>
            <span className="text-2xl font-black text-rose-700 mt-1 block">{difficultCount}</span>
            <span className="text-[11px] text-rose-600 font-medium mt-0.5 block">Difficult • Start immediately!</span>
          </div>
        </div>

        {/* Guidance Callout */}
        <div className="p-4 bg-blue-50/80 border border-blue-200 rounded-xl mb-6 text-xs text-blue-900 flex items-start gap-3">
          <Zap className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" />
          <div className="leading-relaxed">
            <span className="font-bold">Statutory Acceleration Strategy:</span> Gather your{' '}
            <strong className="text-emerald-700">Easy</strong> documents (PAN, GSTIN, Incorporation, Udyam) within the next 48 hours to clear Stage 1 land verification. Concurrently initiate empanelled agency studies for{' '}
            <strong className="text-rose-700">Difficult</strong> clearances (e.g. Environmental Management Plan, Soil Bearing Capacity, and Structural Stability) so they are ready by Stage 2 without stalling civil construction.
          </div>
        </div>

        {/* Controls: Search, View Mode, Difficulty Filters */}
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs mb-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-xs font-bold text-slate-500 mr-1 flex items-center gap-1">
              <Layers className="w-3.5 h-3.5" />
              <span>Grouping:</span>
            </span>
            <div className="inline-flex p-1 bg-slate-100 rounded-lg border border-slate-200 text-xs font-bold">
              <button
                onClick={() => setViewMode('clearance')}
                className={`px-3 py-1 rounded-md transition-all cursor-pointer ${viewMode === 'clearance' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'}`}
              >
                By Clearance Approval ({approvalGroups.length})
              </button>
              <button
                onClick={() => setViewMode('difficulty')}
                className={`px-3 py-1 rounded-md transition-all cursor-pointer ${viewMode === 'difficulty' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'}`}
              >
                By Acquisition Difficulty
              </button>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            {/* Difficulty Filter Pills */}
            <div className="flex items-center gap-1 text-xs">
              <button
                onClick={() => setDifficultyFilter('All')}
                className={`px-2.5 py-1 rounded-lg font-bold border transition-colors cursor-pointer ${difficultyFilter === 'All' ? 'bg-govNavy-800 text-white border-govNavy-800' : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'}`}
              >
                All ({documents.length})
              </button>
              <button
                onClick={() => setDifficultyFilter('Easy')}
                className={`px-2.5 py-1 rounded-lg font-bold border transition-colors cursor-pointer ${difficultyFilter === 'Easy' ? 'bg-emerald-600 text-white border-emerald-600' : 'bg-emerald-50 text-emerald-800 border-emerald-200 hover:bg-emerald-100'}`}
              >
                Easy ({easyCount})
              </button>
              <button
                onClick={() => setDifficultyFilter('Moderate')}
                className={`px-2.5 py-1 rounded-lg font-bold border transition-colors cursor-pointer ${difficultyFilter === 'Moderate' ? 'bg-amber-600 text-white border-amber-600' : 'bg-amber-50 text-amber-800 border-amber-200 hover:bg-amber-100'}`}
              >
                Moderate ({moderateCount})
              </button>
              <button
                onClick={() => setDifficultyFilter('Difficult')}
                className={`px-2.5 py-1 rounded-lg font-bold border transition-colors cursor-pointer ${difficultyFilter === 'Difficult' ? 'bg-rose-600 text-white border-rose-600' : 'bg-rose-50 text-rose-800 border-rose-200 hover:bg-rose-100'}`}
              >
                Difficult ({difficultCount})
              </button>
            </div>

            {/* Search */}
            <div className="relative w-full sm:w-60">
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search documents or offices..."
                className="w-full pl-8 pr-3 py-1.5 bg-slate-50 border border-slate-300 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-govNavy-500"
              />
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5" />
            </div>
          </div>
        </div>

        {/* VIEW 1: GROUPED BY STATUTORY CLEARANCE */}
        {viewMode === 'clearance' && (
          <div className="space-y-5">
            {approvalGroups.map(group => {
              const isCollapsed = collapsedApprovals[group.approval.id];
              return (
                <div 
                  key={group.approval.id} 
                  className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden transition-all"
                >
                  {/* Approval Group Header */}
                  <div 
                    onClick={() => toggleApprovalCollapse(group.approval.id)}
                    className="p-4 sm:p-5 bg-slate-50/80 hover:bg-slate-100/80 border-b border-slate-200 cursor-pointer flex items-center justify-between gap-4 transition-colors"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <button className="text-slate-400 hover:text-slate-600 p-1">
                        {isCollapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                      </button>
                      <div className="min-w-0">
                        <div className="flex flex-wrap items-center gap-2 mb-1">
                          <span className="text-[10px] font-black uppercase tracking-wider text-govNavy-800 bg-govNavy-50 px-2 py-0.5 rounded border border-govNavy-200">
                            {group.approval.dueStage || 'Statutory Stage'}
                          </span>
                          <span className="text-[11px] font-semibold text-slate-500">
                            🏢 {group.approval.department}
                          </span>
                        </div>
                        <h3 className="text-sm sm:text-base font-extrabold text-slate-900 truncate">
                          {group.approval.name}
                        </h3>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 shrink-0">
                      <span className="text-xs font-bold text-slate-500 hidden sm:inline">
                        {group.docs.length} {group.docs.length === 1 ? 'document' : 'documents'}
                      </span>
                      <span className="px-2 py-1 bg-white border border-slate-200 rounded text-xs font-bold text-slate-700">
                        SLA: ~{group.approval.slaDays || 20}d
                      </span>
                    </div>
                  </div>

                  {/* Documents List */}
                  {!isCollapsed && (
                    <div className="divide-y divide-slate-100">
                      {group.docs.map(doc => (
                        <div 
                          key={doc.id}
                          className="p-4 sm:p-5 flex flex-col md:flex-row md:items-center justify-between gap-4 hover:bg-slate-50/50 transition-colors"
                        >
                          <div className="flex items-start gap-3 min-w-0">
                            <div className="w-9 h-9 rounded-lg bg-govNavy-50 text-govNavy-700 flex items-center justify-center shrink-0 mt-0.5 border border-govNavy-200">
                              <FileText className="w-4 h-4" />
                            </div>
                            <div className="min-w-0">
                              <div className="flex flex-wrap items-center gap-2 mb-1">
                                <h4 className="text-xs sm:text-sm font-bold text-slate-900">
                                  {doc.name}
                                </h4>
                                <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                                  doc.requirement === 'Required' 
                                    ? 'bg-slate-100 text-slate-700 border border-slate-200' 
                                    : 'bg-slate-50 text-slate-400'
                                }`}>
                                  {doc.requirement}
                                </span>
                                {renderDifficultyBadge(doc.acquisitionDifficulty)}
                              </div>

                              {/* Where to get it */}
                              <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-600 mt-1">
                                <span className="flex items-center gap-1.5 text-slate-700 font-medium">
                                  <Building2 className="w-3.5 h-3.5 text-govNavy-700 shrink-0" />
                                  <span><strong>Where to get:</strong> {doc.issuingAuthority || group.approval.department}</span>
                                </span>
                              </div>

                              {doc.uploadedDate && (
                                <span className="text-[11px] text-emerald-600 font-semibold block mt-1">
                                  ✓ Uploaded on {doc.uploadedDate} ({doc.fileSize})
                                </span>
                              )}
                            </div>
                          </div>

                          <div className="flex items-center gap-3 shrink-0 self-end md:self-center">
                            <span className={`px-2.5 py-1 rounded text-xs font-bold ${
                              doc.status === 'Verified' 
                                ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                                : 'bg-slate-100 text-slate-600 border border-slate-200'
                            }`}>
                              {doc.status === 'Verified' ? '✓ Verified' : 'Needs Upload'}
                            </span>

                            <button
                              onClick={() => {
                                setSelectedDoc(doc);
                                setUploadModalOpen(true);
                              }}
                              className="px-3 py-1.5 bg-govNavy-800 hover:bg-govNavy-900 text-white text-xs font-bold rounded-lg transition-colors flex items-center gap-1.5 cursor-pointer shadow-2xs"
                            >
                              <Upload className="w-3.5 h-3.5" />
                              <span>{doc.status === 'Verified' ? 'Replace' : 'Upload'}</span>
                            </button>
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

        {/* VIEW 2: GROUPED BY ACQUISITION DIFFICULTY */}
        {viewMode === 'difficulty' && (
          <div className="space-y-8">
            
            {/* SECTION 1: EASY / QUICK WINS */}
            <div className="bg-white rounded-xl border border-emerald-200 shadow-xs overflow-hidden">
              <div className="p-4 sm:p-5 bg-gradient-to-r from-emerald-50 to-emerald-100/50 border-b border-emerald-200 flex items-center justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span>
                    <h3 className="text-base font-extrabold text-emerald-950">
                      🟢 Quick Wins — Easy Acquisition (1–3 Days)
                    </h3>
                  </div>
                  <p className="text-xs text-emerald-800 mt-0.5">
                    Standard corporate identity, registration credentials, and self-declarations you can gather immediately from internal company records.
                  </p>
                </div>
                <span className="px-3 py-1 bg-white text-emerald-800 rounded-lg text-xs font-black border border-emerald-200 shadow-2xs">
                  {difficultyGroups.easy.length} Documents
                </span>
              </div>

              <div className="divide-y divide-slate-100">
                {difficultyGroups.easy.map(doc => (
                  <div key={doc.id} className="p-4 sm:p-5 flex flex-col md:flex-row md:items-center justify-between gap-4 hover:bg-emerald-50/20">
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-2 mb-1">
                        <h4 className="text-xs sm:text-sm font-bold text-slate-900">{doc.name}</h4>
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-slate-100 text-slate-700">
                          {doc.approvalName}
                        </span>
                      </div>
                      <p className="text-xs text-slate-600">
                        <strong>Where to get:</strong> {doc.issuingAuthority}
                      </p>
                    </div>

                    <div className="flex items-center gap-3 shrink-0">
                      <button
                        onClick={() => {
                          setSelectedDoc(doc);
                          setUploadModalOpen(true);
                        }}
                        className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-lg transition-colors flex items-center gap-1.5 cursor-pointer"
                      >
                        <Upload className="w-3.5 h-3.5" />
                        <span>Upload Now</span>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* SECTION 2: MODERATE / TECHNICAL DRAWINGS */}
            <div className="bg-white rounded-xl border border-amber-200 shadow-xs overflow-hidden">
              <div className="p-4 sm:p-5 bg-gradient-to-r from-amber-50 to-amber-100/50 border-b border-amber-200 flex items-center justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-amber-500"></span>
                    <h3 className="text-base font-extrabold text-amber-950">
                      🟡 Standard Technical Documentation (1–2 Weeks)
                    </h3>
                  </div>
                  <p className="text-xs text-amber-800 mt-0.5">
                    Engineering layout drawings, electrical Single Line Diagrams, water balance notes, and licensed architect endorsements.
                  </p>
                </div>
                <span className="px-3 py-1 bg-white text-amber-800 rounded-lg text-xs font-black border border-amber-200 shadow-2xs">
                  {difficultyGroups.moderate.length} Documents
                </span>
              </div>

              <div className="divide-y divide-slate-100">
                {difficultyGroups.moderate.map(doc => (
                  <div key={doc.id} className="p-4 sm:p-5 flex flex-col md:flex-row md:items-center justify-between gap-4 hover:bg-amber-50/20">
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-2 mb-1">
                        <h4 className="text-xs sm:text-sm font-bold text-slate-900">{doc.name}</h4>
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-slate-100 text-slate-700">
                          {doc.approvalName}
                        </span>
                      </div>
                      <p className="text-xs text-slate-600">
                        <strong>Where to get:</strong> {doc.issuingAuthority}
                      </p>
                    </div>

                    <div className="flex items-center gap-3 shrink-0">
                      <button
                        onClick={() => {
                          setSelectedDoc(doc);
                          setUploadModalOpen(true);
                        }}
                        className="px-3 py-1.5 bg-govNavy-800 hover:bg-govNavy-900 text-white text-xs font-bold rounded-lg transition-colors flex items-center gap-1.5 cursor-pointer"
                      >
                        <Upload className="w-3.5 h-3.5" />
                        <span>Upload</span>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* SECTION 3: DIFFICULT / HIGH LEAD TIME */}
            <div className="bg-white rounded-xl border border-rose-200 shadow-xs overflow-hidden">
              <div className="p-4 sm:p-5 bg-gradient-to-r from-rose-50 to-rose-100/50 border-b border-rose-200 flex items-center justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-rose-500"></span>
                    <h3 className="text-base font-extrabold text-rose-950">
                      🔴 High Lead Time — Critical Path Gating (3–6 Weeks)
                    </h3>
                  </div>
                  <p className="text-xs text-rose-800 mt-0.5">
                    Statutory baseline monitoring (EIA/EMP), Gram Sabha PESA resolutions, structural vetting, and specialized PESO / Drug controller sanctions. Initiate these immediately!
                  </p>
                </div>
                <span className="px-3 py-1 bg-white text-rose-800 rounded-lg text-xs font-black border border-rose-200 shadow-2xs">
                  {difficultyGroups.difficult.length} Documents
                </span>
              </div>

              <div className="divide-y divide-slate-100">
                {difficultyGroups.difficult.map(doc => (
                  <div key={doc.id} className="p-4 sm:p-5 flex flex-col md:flex-row md:items-center justify-between gap-4 hover:bg-rose-50/20">
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-2 mb-1">
                        <h4 className="text-xs sm:text-sm font-bold text-slate-900">{doc.name}</h4>
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-rose-100 text-rose-800 font-extrabold">
                          Critical Path
                        </span>
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-slate-100 text-slate-700">
                          {doc.approvalName}
                        </span>
                      </div>
                      <p className="text-xs text-slate-600">
                        <strong>Where to get:</strong> {doc.issuingAuthority}
                      </p>
                    </div>

                    <div className="flex items-center gap-3 shrink-0">
                      <button
                        onClick={() => {
                          setSelectedDoc(doc);
                          setUploadModalOpen(true);
                        }}
                        className="px-3 py-1.5 bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold rounded-lg transition-colors flex items-center gap-1.5 cursor-pointer shadow-xs"
                      >
                        <Upload className="w-3.5 h-3.5" />
                        <span>Upload</span>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

          </div>
        )}

        {/* Bottom Progression Footer */}
        <div className="mt-10 bg-white p-6 rounded-2xl border border-slate-200 shadow-lg flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h4 className="text-sm font-black text-slate-900">Ready to track clearance progression?</h4>
            <p className="text-xs text-slate-500 mt-0.5">
              Your approvals have been sequenced into a parallel-track DAG reducing project clearance time to ~65 days.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate('/dashboard')}
              className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold rounded-lg transition-colors cursor-pointer"
            >
              Investor Dashboard
            </button>
            <button
              onClick={() => navigate('/approvals')}
              className="px-6 py-2.5 bg-govNavy-800 hover:bg-govNavy-900 text-white text-xs font-extrabold rounded-lg shadow-md transition-all flex items-center gap-2 cursor-pointer"
            >
              <span>View Clearance Roadmap</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>

      </main>

      {/* Upload Document Modal */}
      {uploadModalOpen && selectedDoc && (
        <Modal
          isOpen={uploadModalOpen}
          onClose={() => setUploadModalOpen(false)}
          title={`Upload ${selectedDoc.name}`}
        >
          <form onSubmit={handleUploadSubmit} className="space-y-4">
            <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 text-xs text-slate-700 space-y-1">
              <div><strong>Clearance:</strong> {selectedDoc.approvalName}</div>
              <div><strong>Issuing Authority:</strong> {selectedDoc.issuingAuthority || 'Authorized Agency'}</div>
              <div><strong>Difficulty Level:</strong> {selectedDoc.acquisitionDifficulty}</div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Select File (PDF, DWG, DOCX up to 25MB)
              </label>
              <input
                type="text"
                placeholder="e.g. Approved_Site_Master_Plan_v2.pdf"
                value={uploadFileName}
                onChange={(e) => setUploadFileName(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-xs"
                required
              />
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setUploadModalOpen(false)}
                className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold rounded"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-1.5 bg-govNavy-800 hover:bg-govNavy-900 text-white text-xs font-bold rounded"
              >
                Simulate Upload
              </button>
            </div>
          </form>
        </Modal>
      )}

      <Footer />
    </div>
  );
};
