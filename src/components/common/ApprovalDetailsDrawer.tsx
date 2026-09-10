import React, { useState, useMemo, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  X, 
  ArrowRight, 
  ExternalLink, 
  Eye, 
  Upload, 
  FileText, 
  CheckCircle2, 
  AlertTriangle, 
  ShieldAlert, 
  ShieldCheck, 
  Check, 
  ChevronRight,
  Clock,
  Layers,
  Building2
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { StatusBadge } from '../ui/StatusBadge';
import { RiskBadge } from '../ui/RiskBadge';
import { DocumentPreviewModal } from './DocumentPreviewModal';
import { getComprehensiveDocuments } from '../../data/statutoryChecklist';
import { DocumentItem } from '../../types';

interface ApprovalDetailsDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  approvalId: string | null;
  onSelectAnotherApproval?: (approvalId: string) => void;
}

const STATUTORY_ACT_MAPPING: Record<string, string> = {
  'APPR_LAND_ALLOT': 'Chhattisgarh Industrial Land Allotment Rules 2015 & CSIDC Regulations',
  'APPR_LAND_CONV': 'Chhattisgarh Land Revenue Code 1959 (Section 172 Nazul & Agricultural Conversion)',
  'APPR_SITE_ZONING': 'Chhattisgarh Nagar Tatha Gram Nivesh Adhiniyam 1973 (TCP Master Plan Clearance)',
  'APPR_BASTAR_PESA': 'Panchayats (Extension to Scheduled Areas) Act 1996 & CG Tenancy Code (Sec 170-B)',
  'APPR_POLLUTION_CTE': 'Water (Prevention & Control of Pollution) Act 1974 & Air (Prevention & Control of Pollution) Act 1981',
  'APPR_FIRE_PROV': 'Chhattisgarh Fire & Emergency Services Act 2018 & National Building Code (Part IV)',
  'APPR_BLDG_PLAN': 'Chhattisgarh Municipal Corporation Act 1956 & National Building Code (NBC 2016)',
  'APPR_POWER_CONN': 'Electricity Act 2003 (Sec 43) & CSPDCL Industrial Supply Code 2020',
  'APPR_WATER_ALLOC': 'Chhattisgarh Water Resources Regulatory Framework & WRD Industrial Allocation Rules',
  'APPR_FOREST_NOC': 'Forest (Conservation) Act 1980 & MoEFCC Forest Diversion Guidelines',
  'APPR_MINE_LEASE': 'Mines and Minerals (Development and Regulation) Act 1957 (MMDR Act)',
  'APPR_FACTORY_LIC': 'Factories Act 1948 (Sections 6 & 7) & Chhattisgarh Factories Rules 1962',
  'APPR_POLLUTION_CTO': 'Water Act 1974 (Section 25/26) & Air Act 1981 (Section 21)',
  'APPR_BOILER_REG': 'Indian Boilers Act 1923 & Indian Boiler Regulations (IBR 1950)',
  'APPR_LABOUR_REG': 'Contract Labour (Regulation & Abolition) Act 1970 & Inter-State Migrant Workmen Act',
  'APPR_FSSAI_CENTRAL': 'Food Safety and Standards Act 2006 (FSSA) & FSSAI Licensing Regulations 2011',
  'APPR_PETRO_PESO': 'Petroleum Act 1934 & Static and Mobile Pressure Vessels (Unfired) Rules 2016',
  'APPR_DRUG_CDSCO': 'Drugs and Cosmetics Act 1940 & Medical Devices Rules 2017',
};

export const ApprovalDetailsDrawer: React.FC<ApprovalDetailsDrawerProps> = ({
  isOpen,
  onClose,
  approvalId,
  onSelectAnotherApproval,
}) => {
  const navigate = useNavigate();
  const { 
    approvals, 
    documents, 
    businessProfile,
    uploadRealDocument,
    reuploadRealDocument,
    showToast 
  } = useApp();

  const [previewDoc, setPreviewDoc] = useState<DocumentItem | null>(null);
  const [isPreviewModalOpen, setIsPreviewModalOpen] = useState(false);
  const filePickerRef = useRef<HTMLInputElement>(null);
  const [targetDocForPicker, setTargetDocForPicker] = useState<{ doc: DocumentItem; isReupload: boolean } | null>(null);

  // Normalize Approval Lookup
  const normalizedId = approvalId?.toLowerCase();
  const approval = useMemo(() => {
    if (!normalizedId) return null;
    return approvals.find(a => {
      const aId = a.id.toLowerCase();
      const aCode = ((a as any).approvalCode || '').toLowerCase();
      const aName = a.name.toLowerCase();

      if (aId === normalizedId || aCode === normalizedId || aName.includes(normalizedId)) return true;
      if ((normalizedId === 'app-001' || normalizedId === 'appr_pollution_cte') && 
          (aId === 'app-001' || aCode === 'appr_pollution_cte' || aName.includes('consent to establish') || aName.includes('pollution consent'))) return true;
      if ((normalizedId === 'appr_power_conn' || normalizedId === 'appr_power_feasibility') && 
          (aCode.includes('power') || aName.includes('power') || aName.includes('electricity'))) return true;
      if ((normalizedId === 'appr_fssai_central' || normalizedId === 'appr_fssai_mfg') && 
          (aCode.includes('fssai') || aName.includes('fssai'))) return true;
      if ((normalizedId === 'appr_dish_factory' || normalizedId === 'appr_factory_lic') && 
          (aCode.includes('dish') || aCode.includes('factory') || aName.includes('factory'))) return true;
      return false;
    }) || approvals[0];
  }, [approvals, normalizedId]);

  // Normalize Required Documents Lookup (with fallback to comprehensive statutory checklist)
  const requiredDocs = useMemo(() => {
    if (!approval) return [];
    let docs = documents.filter(d => 
      d.approvalId === approval.id ||
      d.approvalName.toLowerCase() === approval.name.toLowerCase() ||
      (approval.id === 'APP-001' && (d.approvalId === 'APPR_POLLUTION_CTE' || d.approvalId === 'APP-001')) ||
      (approval.id === 'APPR_POLLUTION_CTE' && (d.approvalId === 'APP-001' || d.approvalId === 'APPR_POLLUTION_CTE'))
    );

    if (docs.length === 0) {
      const comprehensive = getComprehensiveDocuments(businessProfile, documents);
      const fallback = comprehensive.documents.filter(d => 
        d.approvalId === approval.id ||
        d.approvalName.toLowerCase() === approval.name.toLowerCase()
      );
      if (fallback.length > 0) docs = fallback;
    }

    return docs;
  }, [documents, approval, businessProfile]);

  // Prerequisite Approvals Resolution
  const prerequisites = useMemo(() => {
    if (!approval || !approval.dependency || approval.dependency === 'None') return [];
    const tokens = approval.dependency.split(/[,&]|and/i).map(s => s.trim()).filter(Boolean);
    return tokens.map(token => {
      const match = approvals.find(a => 
        a.id.toLowerCase() === token.toLowerCase() ||
        a.name.toLowerCase().includes(token.toLowerCase()) ||
        token.toLowerCase().includes(a.name.toLowerCase().slice(0, 15))
      );
      return match ? match : {
        id: token,
        name: token,
        department: 'Regulatory Authority',
        status: 'Pending' as const,
        risk: 'MEDIUM' as const,
      };
    }).filter(p => p.id !== approval.id);
  }, [approval, approvals]);

  // Non-boilerplate Risk Factors
  const riskFactors = useMemo(() => {
    if (!approval) return [];
    const factors: Array<{
      id: string;
      category: 'DEPENDENCY' | 'DOCUMENT' | 'REGULATORY';
      severity: 'HIGH' | 'MEDIUM' | 'LOW';
      title: string;
      issue: string;
      whyItMatters: string;
      whatToDo: string;
      documentId?: string;
      documentName?: string;
      prerequisiteId?: string;
      prerequisiteName?: string;
    }> = [];

    // 1. Check prerequisite dependencies
    for (const prereq of prerequisites) {
      if (prereq.status !== 'Completed') {
        factors.push({
          id: `DEP-${prereq.id}`,
          category: 'DEPENDENCY',
          severity: approval.status === 'Blocked' || prereq.status === 'Blocked' ? 'HIGH' : 'MEDIUM',
          title: `Prerequisite Clearance Blocking: ${prereq.name}`,
          issue: `Prerequisite clearance "${prereq.name}" (${prereq.id}) is not yet approved — current status is "${prereq.status}".`,
          whyItMatters: `Under statutory single-window dependency rules, ${approval.name} cannot be legally processed or granted by ${approval.department} until "${prereq.name}" is formally approved and on file.`,
          whatToDo: `Inspect the status and requirements of "${prereq.name}". If it is stuck or awaiting documentation, resolving that prerequisite is the actual critical path to unblock this clearance.`,
          prerequisiteId: prereq.id,
          prerequisiteName: prereq.name,
        });
      }
    }

    // 2. Check document verification failures (Stage 1)
    for (const doc of requiredDocs) {
      if (doc.status === 'Needs Correction') {
        const failedChecks = doc.ruleChecks?.filter(c => !c.passed) || [];
        if (failedChecks.length > 0) {
          for (const chk of failedChecks) {
            factors.push({
              id: `DOC-${doc.id}-${chk.ruleId}`,
              category: 'DOCUMENT',
              severity: 'HIGH',
              title: `Document Check Failed: ${doc.name}`,
              issue: `Deterministic check "${chk.title}" failed on "${doc.name}": ${chk.message}`,
              whyItMatters: `Statutory scrutiny officers at ${approval.department} will reject or issue formal objection notices for filings containing discrepancies, expired dates, or mismatched entity names.`,
              whatToDo: `Re-upload corrected certificate via Document Center: ${chk.remediation}`,
              documentId: doc.id,
              documentName: doc.name,
            });
          }
        } else {
          factors.push({
            id: `DOC-${doc.id}-GENERIC`,
            category: 'DOCUMENT',
            severity: 'HIGH',
            title: `Document Correction Required: ${doc.name}`,
            issue: doc.issue || `Discrepancy detected in statutory parameters of "${doc.name}".`,
            whyItMatters: `${approval.department} requires 100% parameter alignment before granting formal clearance.`,
            whatToDo: doc.action || `Re-upload corrected version of ${doc.name}.`,
            documentId: doc.id,
            documentName: doc.name,
          });
        }
      } else if (doc.status === 'Not Uploaded' || doc.status === 'Missing') {
        if (doc.requirement === 'Required') {
          factors.push({
            id: `DOC-${doc.id}-MISSING`,
            category: 'DOCUMENT',
            severity: 'MEDIUM',
            title: `Mandatory Document Not Uploaded: ${doc.name}`,
            issue: `Mandatory statutory enclosure "${doc.name}" has not yet been uploaded to Document Center.`,
            whyItMatters: `${approval.department} will not initiate technical scrutiny without this mandatory statutory enclosure on record.`,
            whatToDo: `Obtain this document from ${doc.issuingAuthority || 'the issuing department'} and upload it to proceed.`,
            documentId: doc.id,
            documentName: doc.name,
          });
        }
      }
    }

    // 3. If zero blocking factors exist
    if (factors.length === 0) {
      factors.push({
        id: 'CLEARED',
        category: 'REGULATORY',
        severity: 'LOW',
        title: 'Statutory Verification Cleared',
        issue: 'Zero blocking prerequisite clearances and zero document defects detected on this approval.',
        whyItMatters: 'All pre-submission compliance criteria conform 100% to single-window statutory scrutiny standards.',
        whatToDo: `Application dossier is ready for final technical scrutiny by ${approval.department}.`,
      });
    }

    return factors;
  }, [approval, prerequisites, requiredDocs]);

  // Handlers for preview and file upload
  const handleOpenPreview = (doc: DocumentItem) => {
    setPreviewDoc(doc);
    setIsPreviewModalOpen(true);
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

  const handleModalReupload = async (doc: DocumentItem, file: File) => {
    await reuploadRealDocument(doc.id, file);
    const updated = documents.find(d => d.id === doc.id);
    if (updated) {
      setPreviewDoc({ ...updated, currentVersion: (doc.currentVersion || 1) + 1 });
    }
  };

  if (!isOpen || !approval) return null;

  const statutoryAct = STATUTORY_ACT_MAPPING[approval.id] || 'Chhattisgarh Industrial Investment Promotion Act & Single Window Clearance Framework';
  const hasHighRisk = riskFactors.some(f => f.severity === 'HIGH');
  const hasMediumRisk = riskFactors.some(f => f.severity === 'MEDIUM');

  return (
    <>
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs z-50 transition-opacity animate-in fade-in"
        onClick={onClose}
      />

      {/* Slide-over Drawer */}
      <div 
        className="fixed inset-y-0 right-0 max-w-2xl w-full bg-white shadow-2xl z-50 overflow-y-auto flex flex-col font-sans transition-transform duration-300 animate-in slide-in-from-right"
        role="dialog"
        aria-modal="true"
      >
        {/* Drawer Header */}
        <div className="p-5 border-b border-slate-200 bg-slate-50/80 sticky top-0 z-10 backdrop-blur-xs flex items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span className="text-xs font-black uppercase px-2.5 py-0.5 rounded bg-govNavy-50 text-govNavy-800 border border-govNavy-200 font-mono">
              {approval.id}
            </span>
            <StatusBadge status={approval.status} size="sm" />
            <RiskBadge risk={hasHighRisk ? 'HIGH' : hasMediumRisk ? 'MEDIUM' : 'LOW'} size="sm" />
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                onClose();
                navigate(`/approvals/${approval.id}`);
              }}
              className="px-2.5 py-1.5 bg-white hover:bg-slate-100 text-slate-700 text-xs font-bold rounded-lg border border-slate-300 transition-colors inline-flex items-center gap-1 cursor-pointer shadow-2xs"
              title="Open full page view"
            >
              <span>Full Page</span>
              <ExternalLink className="w-3.5 h-3.5 text-slate-500" />
            </button>
            <button 
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-200 transition-colors cursor-pointer"
              aria-label="Close drawer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Drawer Content */}
        <div className="p-6 space-y-6 flex-1 text-slate-900">
          
          {/* Clearance Title & Dept */}
          <div>
            <span className="text-xs text-slate-500 font-semibold">{approval.department}</span>
            <h2 className="text-xl font-black text-slate-900 tracking-tight mt-0.5">{approval.name}</h2>
            <p className="text-xs text-slate-600 mt-2 leading-relaxed">
              {approval.whyItMatters || approval.description}
            </p>

            <div className="mt-3 grid grid-cols-2 sm:grid-cols-3 gap-2.5 text-[11px] p-3 bg-slate-50 rounded-lg border border-slate-200">
              <div>
                <span className="text-slate-500 block">Statutory SLA</span>
                <strong className="text-slate-900 font-mono">30 Days</strong>
              </div>
              <div>
                <span className="text-slate-500 block">Critical Path</span>
                <strong className={approval.isCriticalPath ? 'text-amber-700' : 'text-slate-700'}>
                  {approval.isCriticalPath ? 'Yes (Mandatory)' : 'Parallel Track'}
                </strong>
              </div>
              <div>
                <span className="text-slate-500 block">Single Window ID</span>
                <strong className="text-govNavy-700 font-mono">CG-SWC-{approval.id}</strong>
              </div>
            </div>
          </div>

          {/* Detailed Risk & Bottleneck Analysis */}
          <div className={`rounded-xl border-2 p-5 transition-colors ${
            hasHighRisk 
              ? 'bg-rose-50/80 border-rose-300' 
              : hasMediumRisk 
                ? 'bg-amber-50/80 border-amber-300' 
                : 'bg-emerald-50/80 border-emerald-300'
          }`}>
            <div className="flex items-start gap-3">
              {hasHighRisk ? (
                <ShieldAlert className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
              ) : hasMediumRisk ? (
                <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
              ) : (
                <ShieldCheck className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
              )}

              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-black text-slate-900">
                    {hasHighRisk 
                      ? 'Statutory Scrutiny Risk & Bottleneck' 
                      : hasMediumRisk 
                        ? 'Compliance Notice & Dependency Warnings' 
                        : 'Statutory Verification Cleared'}
                  </h3>
                  <span className={`text-[10px] font-black uppercase px-2 py-0.5 rounded border ${
                    hasHighRisk 
                      ? 'bg-rose-100 text-rose-900 border-rose-300' 
                      : hasMediumRisk 
                        ? 'bg-amber-100 text-amber-900 border-amber-300' 
                        : 'bg-emerald-100 text-emerald-900 border-emerald-300'
                  }`}>
                    {hasHighRisk ? 'HIGH RISK' : hasMediumRisk ? 'MEDIUM RISK' : 'LOW RISK'}
                  </span>
                </div>

                <div className="mt-3.5 space-y-3">
                  {riskFactors.map(factor => (
                    <div 
                      key={factor.id}
                      className="p-3.5 bg-white/95 rounded-lg border border-slate-200 shadow-2xs space-y-2 text-xs"
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-extrabold text-slate-900 text-xs">{factor.title}</span>
                        <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-slate-100 text-slate-600 uppercase font-bold">
                          {factor.category}
                        </span>
                      </div>

                      {/* 1. What the specific issue is */}
                      <div className="space-y-0.5 pl-3 border-l-2 border-slate-300">
                        <span className="text-[10px] font-bold text-slate-900 block">1. Specific Issue:</span>
                        <p className="text-slate-700 leading-relaxed text-[11px]">{factor.issue}</p>
                      </div>

                      {/* 2. Why it matters */}
                      <div className="space-y-0.5 pl-3 border-l-2 border-amber-300">
                        <span className="text-[10px] font-bold text-amber-950 block">2. Why It Matters:</span>
                        <p className="text-slate-700 leading-relaxed text-[11px]">{factor.whyItMatters}</p>
                      </div>

                      {/* 3. What to do about it */}
                      <div className="space-y-0.5 pl-3 border-l-2 border-emerald-400">
                        <span className="text-[10px] font-bold text-emerald-950 block">3. What To Do:</span>
                        <p className="text-slate-700 leading-relaxed font-medium text-[11px]">{factor.whatToDo}</p>
                      </div>

                      {/* Action Links */}
                      <div className="pt-2 flex flex-wrap items-center gap-1.5 border-t border-slate-100">
                        {factor.documentId && (
                          <div className="flex flex-wrap items-center gap-1.5">
                            <button
                              onClick={() => {
                                const doc = documents.find(d => d.id === factor.documentId);
                                if (doc) handleOpenPreview(doc);
                              }}
                              className="px-2.5 py-1 bg-rose-600 hover:bg-rose-700 text-white text-[11px] font-bold rounded shadow-2xs transition-colors flex items-center gap-1 cursor-pointer"
                            >
                              <Eye className="w-3 h-3" />
                              <span>Inspect Doc</span>
                            </button>
                            <button
                              onClick={() => {
                                const doc = documents.find(d => d.id === factor.documentId);
                                if (doc) triggerDirectFilePick(doc, true);
                              }}
                              className="px-2.5 py-1 bg-slate-800 hover:bg-slate-900 text-white text-[11px] font-bold rounded transition-colors flex items-center gap-1 cursor-pointer"
                            >
                              <Upload className="w-3 h-3" />
                              <span>Re-upload</span>
                            </button>
                            <Link
                              to={`/documents?docId=${factor.documentId}&status=Needs+Correction`}
                              onClick={onClose}
                              className="px-2 py-1 bg-white hover:bg-slate-100 text-slate-700 text-[11px] font-bold rounded border border-slate-300 transition-colors inline-flex items-center gap-1"
                            >
                              <span>Doc Center</span>
                              <ExternalLink className="w-3 h-3 text-slate-500" />
                            </Link>
                          </div>
                        )}

                        {factor.prerequisiteId && (
                          <button
                            onClick={() => {
                              if (onSelectAnotherApproval) {
                                onSelectAnotherApproval(factor.prerequisiteId!);
                              } else {
                                navigate(`/approvals/${factor.prerequisiteId}`);
                                onClose();
                              }
                            }}
                            className="px-2.5 py-1 bg-govNavy-800 hover:bg-govNavy-900 text-white text-[11px] font-bold rounded transition-colors inline-flex items-center gap-1 cursor-pointer"
                          >
                            <span>Inspect Bottleneck: {factor.prerequisiteName}</span>
                            <ArrowRight className="w-3 h-3" />
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>

              </div>
            </div>
          </div>

          {/* Prerequisite Dependencies */}
          <div>
            <div className="flex items-center justify-between pb-2 border-b border-slate-100 mb-3">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700">
                Prerequisite Clearances ({prerequisites.length})
              </h3>
            </div>

            {prerequisites.length > 0 ? (
              <div className="space-y-2">
                {prerequisites.map(prereq => (
                  <div 
                    key={prereq.id}
                    className={`p-3 rounded-lg border flex items-center justify-between gap-3 text-xs ${
                      prereq.status === 'Completed'
                        ? 'bg-emerald-50/50 border-emerald-200'
                        : 'bg-amber-50/50 border-amber-200'
                    }`}
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-[10px] font-bold px-1.5 py-0.5 rounded bg-white border border-slate-200 text-slate-700">
                          {prereq.id}
                        </span>
                        <StatusBadge status={prereq.status} size="sm" />
                      </div>
                      <h4 className="font-bold text-slate-900 mt-1">{prereq.name}</h4>
                      <p className="text-[10px] text-slate-500">{prereq.department}</p>
                    </div>

                    <button
                      onClick={() => {
                        if (onSelectAnotherApproval) {
                          onSelectAnotherApproval(prereq.id);
                        } else {
                          navigate(`/approvals/${prereq.id}`);
                          onClose();
                        }
                      }}
                      className="px-2.5 py-1 bg-white hover:bg-slate-100 text-slate-700 text-xs font-semibold rounded border border-slate-300 transition-colors inline-flex items-center gap-1 shrink-0 cursor-pointer"
                    >
                      <span>View</span>
                      <ChevronRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-3 bg-emerald-50/60 rounded-lg border border-emerald-200 flex items-center gap-2 text-xs text-emerald-900 font-medium">
                <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>No prerequisite clearances required. Ready to file immediately.</span>
              </div>
            )}
          </div>

          {/* Live Required Documents (with Stage 1 verification pills) */}
          <div>
            <div className="flex items-center justify-between pb-2 border-b border-slate-100 mb-3">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700">
                Required Statutory Enclosures ({requiredDocs.length})
              </h3>
              <Link
                to="/documents"
                onClick={onClose}
                className="text-xs font-bold text-govNavy-700 hover:text-govNavy-900 inline-flex items-center gap-1"
              >
                <span>Document Center</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            <div className="space-y-2.5">
              {requiredDocs.map(doc => {
                const failedCheck = doc.ruleChecks?.find(c => !c.passed);

                return (
                  <div 
                    key={doc.id}
                    className={`p-3.5 rounded-lg border text-xs space-y-2 transition-colors ${
                      doc.status === 'Needs Correction'
                        ? 'bg-amber-50/40 border-amber-200'
                        : doc.status === 'Verified'
                          ? 'bg-emerald-50/30 border-emerald-200'
                          : 'bg-white border-slate-200'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <FileText className="w-4 h-4 text-slate-400 shrink-0" />
                          <h4 className="font-bold text-slate-900 truncate">{doc.name}</h4>
                        </div>
                        <p className="text-[11px] text-slate-500 pl-6 mt-0.5">
                          {doc.issuingAuthority || 'Issuing Authority'} • Difficulty:{' '}
                          <span className="font-semibold text-slate-700">{doc.acquisitionDifficulty || 'Moderate'}</span>
                        </p>
                      </div>

                      <StatusBadge status={doc.status} size="sm" />
                    </div>

                    {/* Audit finding */}
                    {doc.status === 'Needs Correction' && (
                      <div className="pl-6 text-[11px] space-y-0.5">
                        <span className="text-rose-700 font-bold block">
                          {failedCheck ? `✕ ${failedCheck.title}` : doc.issue || 'Inconsistency detected'}
                        </span>
                        <p className="text-slate-600 text-[10px]">
                          {failedCheck ? failedCheck.remediation : doc.action || 'Re-upload corrected certificate.'}
                        </p>
                      </div>
                    )}

                    {/* Action buttons */}
                    <div className="pl-6 pt-1 flex items-center gap-2">
                      {doc.status === 'Needs Correction' ? (
                        <>
                          <button
                            onClick={() => handleOpenPreview(doc)}
                            className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-semibold rounded border border-slate-300 transition-colors inline-flex items-center gap-1 cursor-pointer"
                          >
                            <Eye className="w-3 h-3" />
                            <span>Inspect</span>
                          </button>
                          <button
                            onClick={() => triggerDirectFilePick(doc, true)}
                            className="px-2.5 py-1 bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold rounded shadow-2xs transition-colors inline-flex items-center gap-1 cursor-pointer"
                          >
                            <Upload className="w-3 h-3" />
                            <span>Re-upload</span>
                          </button>
                        </>
                      ) : doc.status === 'Verified' ? (
                        <button
                          onClick={() => handleOpenPreview(doc)}
                          className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-semibold rounded border border-slate-300 transition-colors inline-flex items-center gap-1 cursor-pointer"
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
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Statutory Regulatory Basis Metadata Footer */}
          <div className="p-4 bg-slate-100 rounded-lg border border-slate-200 text-[11px] text-slate-600 space-y-1">
            <div className="flex items-center gap-1.5 font-bold text-slate-800">
              <ShieldCheck className="w-3.5 h-3.5 text-govNavy-700" />
              <span>Statutory Regulatory Act:</span>
            </div>
            <p className="text-slate-700 font-medium pl-5">{statutoryAct}</p>
            <div className="pt-2 border-t border-slate-200 text-slate-500 font-mono text-[10px]">
              Verified via NitiPath Single Window Engine v2.4 • SLA: 30 Days
            </div>
          </div>

        </div>
      </div>

      {/* Hidden File Picker Input */}
      <input
        type="file"
        ref={filePickerRef}
        onChange={handleNativeFilePicked}
        accept=".pdf,.png,.jpg,.jpeg,.doc,.docx"
        className="hidden"
      />

      {/* Document Preview Modal with Signed URL Access */}
      <DocumentPreviewModal
        isOpen={isPreviewModalOpen}
        onClose={() => setIsPreviewModalOpen(false)}
        document={previewDoc}
        onReupload={handleModalReupload}
      />
    </>
  );
};
