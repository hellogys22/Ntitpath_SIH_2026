import React, { useState, useEffect, useRef } from 'react';
import { 
  X, 
  FileText, 
  CheckCircle2, 
  AlertTriangle, 
  ExternalLink, 
  Upload, 
  History, 
  ShieldCheck, 
  Building2, 
  Calendar, 
  Maximize2,
  RefreshCw,
  Loader2
} from 'lucide-react';
import { DocumentItem, DocumentVersionItem, RuleCheckResult } from '../../types';
import { StatusBadge } from '../ui/StatusBadge';
import { api } from '../../services/api';

interface DocumentPreviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  document: DocumentItem | null;
  onReupload: (doc: DocumentItem, file: File) => Promise<void>;
}

export const DocumentPreviewModal: React.FC<DocumentPreviewModalProps> = ({
  isOpen,
  onClose,
  document,
  onReupload,
}) => {
  const [selectedVersion, setSelectedVersion] = useState<number>(1);
  const [signedUrl, setSignedUrl] = useState<string | null>(null);
  const [isLoadingUrl, setIsLoadingUrl] = useState<boolean>(false);
  const [isReuploading, setIsReuploading] = useState<boolean>(false);
  const [versions, setVersions] = useState<DocumentVersionItem[]>([]);
  const [activeRuleChecks, setActiveRuleChecks] = useState<RuleCheckResult[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!isOpen || !document) {
      setSignedUrl(null);
      setVersions([]);
      return;
    }

    const currentVer = document.currentVersion || 1;
    setSelectedVersion(currentVer);
    setActiveRuleChecks(document.ruleChecks || []);

    loadSignedUrl(document.id, currentVer);
    loadVersions(document.id);
  }, [isOpen, document]);

  const loadSignedUrl = async (docId: string, versionNum: number) => {
    setIsLoadingUrl(true);
    try {
      const res = await api.getDocumentSignedUrl(docId, versionNum);
      if (res?.data?.signedUrl) {
        setSignedUrl(res.data.signedUrl);
      } else {
        // Fallback local authenticated stream
        setSignedUrl(`/api/documents/${docId}/download?inline=true&version=${versionNum}`);
      }
    } catch (err) {
      console.warn('Fallback to direct stream:', err);
      setSignedUrl(`/api/documents/${docId}/download?inline=true&version=${versionNum}`);
    } finally {
      setIsLoadingUrl(false);
    }
  };

  const loadVersions = async (docId: string) => {
    try {
      const res = await api.getDocumentVersions(docId);
      if (res?.data && res.data.length > 0) {
        const mapped: DocumentVersionItem[] = res.data.map((v: any) => ({
          versionNumber: v.versionNumber,
          fileName: v.fileName,
          uploadedAt: new Date(v.uploadedAt).toLocaleString(),
          fileSizeBytes: v.fileSizeBytes,
          status: v.status === 'VERIFIED' ? 'Verified' : 'Needs Correction',
          ruleChecks: v.ruleChecksJson ? JSON.parse(v.ruleChecksJson) : undefined,
        }));
        setVersions(mapped);
      } else if (document) {
        // Fallback local mock versions
        const fallbackVersions: DocumentVersionItem[] = [
          {
            versionNumber: document.currentVersion || 1,
            fileName: document.name + '.pdf',
            uploadedAt: document.uploadedDate || 'Today',
            status: document.status,
            ruleChecks: document.ruleChecks,
          },
        ];
        if (document.versions && document.versions.length > 0) {
          setVersions(document.versions);
        } else {
          setVersions(fallbackVersions);
        }
      }
    } catch (e) {
      if (document) {
        setVersions(document.versions || [
          {
            versionNumber: document.currentVersion || 1,
            fileName: document.name + '.pdf',
            uploadedAt: document.uploadedDate || 'Today',
            status: document.status,
            ruleChecks: document.ruleChecks,
          }
        ]);
      }
    }
  };

  const handleVersionChange = (verNum: number) => {
    setSelectedVersion(verNum);
    if (document) {
      loadSignedUrl(document.id, verNum);
      const v = versions.find(item => item.versionNumber === verNum);
      if (v?.ruleChecks) {
        setActiveRuleChecks(v.ruleChecks);
      } else if (verNum === (document.currentVersion || 1)) {
        setActiveRuleChecks(document.ruleChecks || []);
      }
    }
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !document) return;

    setIsReuploading(true);
    try {
      await onReupload(document, file);
      // Reload versions and latest url
      await loadVersions(document.id);
      setSelectedVersion((document.currentVersion || 1) + 1);
      loadSignedUrl(document.id, (document.currentVersion || 1) + 1);
    } catch (err) {
      console.error('Re-upload failed:', err);
    } finally {
      setIsReuploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  if (!isOpen || !document) return null;

  const currentVerData = versions.find(v => v.versionNumber === selectedVersion);
  const isLatestVersion = selectedVersion === (document.currentVersion || 1);
  const isPdf = signedUrl?.includes('.pdf') || true;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="bg-slate-900 border border-slate-700 w-full max-w-6xl h-[90vh] rounded-2xl shadow-2xl flex flex-col overflow-hidden">
        
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-800 bg-slate-900/90 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-blue-500/10 border border-blue-500/20 rounded-xl text-blue-400">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-bold text-white tracking-tight">{document.name}</h2>
                <span className="px-2 py-0.5 rounded text-xs font-semibold bg-slate-800 border border-slate-700 text-slate-300">
                  v{selectedVersion} {isLatestVersion && '(Active)'}
                </span>
                <StatusBadge status={currentVerData?.status || document.status} />
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                Clearance: <span className="text-slate-300 font-medium">{document.approvalName}</span> • 
                Issuing: <span className="text-slate-300 font-medium">{document.issuingAuthority || 'Regulatory Authority'}</span>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {signedUrl && (
              <a
                href={signedUrl}
                target="_blank"
                rel="noreferrer"
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg bg-slate-800 hover:bg-slate-750 text-slate-300 hover:text-white border border-slate-700 transition"
                title="Open in new window"
              >
                <ExternalLink className="w-3.5 h-3.5" />
                <span>Open in Tab</span>
              </a>
            )}
            <button
              onClick={() => fileInputRef.current?.click()}
              disabled={isReuploading}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg bg-blue-600 hover:bg-blue-500 text-white shadow-sm transition disabled:opacity-50"
            >
              {isReuploading ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
              ) : (
                <Upload className="w-3.5 h-3.5" />
              )}
              <span>Re-upload Version</span>
            </button>
            <input 
              type="file" 
              ref={fileInputRef} 
              onChange={handleFileChange} 
              accept=".pdf,.png,.jpg,.jpeg,.doc,.docx"
              className="hidden" 
            />
            <button
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition ml-2"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Version Switcher Bar */}
        <div className="px-6 py-2.5 bg-slate-950/60 border-b border-slate-800/80 flex items-center justify-between text-xs">
          <div className="flex items-center gap-2">
            <span className="text-slate-400 font-medium flex items-center gap-1.5">
              <History className="w-3.5 h-3.5 text-slate-500" />
              Version History:
            </span>
            <div className="flex items-center gap-1.5">
              {versions.map((ver) => (
                <button
                  key={ver.versionNumber}
                  onClick={() => handleVersionChange(ver.versionNumber)}
                  className={`px-2.5 py-1 rounded-md text-xs font-medium transition flex items-center gap-1.5 ${
                    selectedVersion === ver.versionNumber
                      ? 'bg-blue-600 text-white shadow-sm font-semibold'
                      : 'bg-slate-800/80 hover:bg-slate-800 text-slate-300 border border-slate-700/60'
                  }`}
                >
                  <span>v{ver.versionNumber}</span>
                  <span className={`w-1.5 h-1.5 rounded-full ${ver.status === 'Verified' ? 'bg-emerald-400' : 'bg-amber-400'}`} />
                </button>
              ))}
            </div>
          </div>
          <div className="text-slate-400">
            Storage: <span className="text-emerald-400 font-mono">Private Supabase Bucket (Signed Token Access)</span>
          </div>
        </div>

        {/* Modal Body: Left Preview, Right Verification Rule Results */}
        <div className="flex-1 flex overflow-hidden">
          
          {/* Left: Inline Viewer */}
          <div className="flex-1 bg-slate-950 p-4 flex flex-col justify-center items-center relative overflow-hidden border-r border-slate-800">
            {isLoadingUrl ? (
              <div className="flex flex-col items-center gap-3 text-slate-400">
                <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
                <p className="text-sm font-medium">Generating time-limited signed URL...</p>
              </div>
            ) : signedUrl ? (
              <iframe
                src={signedUrl}
                title={document.name}
                className="w-full h-full rounded-xl border border-slate-800 bg-slate-900 shadow-inner"
              />
            ) : (
              <div className="text-center p-8 text-slate-400">
                <FileText className="w-12 h-12 mx-auto mb-3 text-slate-600" />
                <p className="font-medium text-slate-300">Preview artifact unavailable</p>
                <p className="text-xs text-slate-500 mt-1">Please re-upload a compliant certificate to generate a new preview.</p>
              </div>
            )}
          </div>

          {/* Right: Deterministic Rule Verification Checks */}
          <div className="w-[420px] bg-slate-900 flex flex-col overflow-y-auto p-6 space-y-5">
            <div>
              <h3 className="text-sm font-bold uppercase tracking-wider text-slate-400 mb-1 flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-blue-400" />
                Deterministic Statutory Verification
              </h3>
              <p className="text-xs text-slate-500">
                Evaluated against statutory rules engine (zero AI hallucinations). Pass/fail criteria are strictly deterministic.
              </p>
            </div>

            {/* Verdict Box */}
            <div className={`p-4 rounded-xl border ${
              (currentVerData?.status || document.status) === 'Verified'
                ? 'bg-emerald-950/20 border-emerald-500/30 text-emerald-300'
                : 'bg-amber-950/20 border-amber-500/30 text-amber-300'
            }`}>
              <div className="flex items-center gap-2 font-semibold text-sm">
                {(currentVerData?.status || document.status) === 'Verified' ? (
                  <>
                    <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                    <span>Statutory Audit Verdict: 100% Cleared</span>
                  </>
                ) : (
                  <>
                    <AlertTriangle className="w-5 h-5 text-amber-400" />
                    <span>Action Required: Correction Detected</span>
                  </>
                )}
              </div>
              <p className="text-xs mt-1.5 text-slate-300 leading-relaxed">
                {(currentVerData?.status || document.status) === 'Verified'
                  ? 'All mandatory statutory attributes, entity names, validity dates, and dimensions match registered records.'
                  : 'Deterministic rule check flagged an inconsistency. Follow the remediation steps below and re-upload.'}
              </p>
            </div>

            {/* Rule Checks Breakdown */}
            <div className="space-y-3.5">
              <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                Rule-by-Rule Compliance Checks:
              </h4>

              {activeRuleChecks && activeRuleChecks.length > 0 ? (
                activeRuleChecks.map((check) => (
                  <div 
                    key={check.ruleId} 
                    className={`p-3.5 rounded-xl border transition ${
                      check.passed 
                        ? 'bg-slate-800/40 border-slate-700/60 text-slate-300' 
                        : 'bg-amber-950/15 border-amber-500/40 text-slate-200 shadow-sm'
                    }`}
                  >
                    <div className="flex items-start gap-2.5">
                      {check.passed ? (
                        <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                      ) : (
                        <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                      )}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-bold text-white">{check.title}</span>
                          <span className={`text-[10px] font-bold uppercase px-1.5 py-0.5 rounded ${
                            check.passed 
                              ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' 
                              : 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                          }`}>
                            {check.passed ? 'PASSED' : 'FAILED'}
                          </span>
                        </div>

                        {/* Plain Language Explanation */}
                        <p className="text-xs text-slate-300 mt-1 leading-relaxed">
                          {check.message}
                        </p>

                        {/* Remediation instructions if failed */}
                        {!check.passed && (
                          <div className="mt-2.5 p-2 rounded-lg bg-amber-500/10 border border-amber-500/20 text-[11px] text-amber-200 leading-snug">
                            <strong className="text-amber-300">What to do: </strong>
                            {check.remediation}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-xs text-slate-400 italic p-3 bg-slate-800/30 rounded-lg border border-slate-700/50">
                  Standard statutory checks verified clean.
                </div>
              )}
            </div>

            {/* Quick Re-upload Box if Failed */}
            {(currentVerData?.status || document.status) !== 'Verified' && (
              <div className="pt-2 border-t border-slate-800">
                <button
                  onClick={() => fileInputRef.current?.click()}
                  disabled={isReuploading}
                  className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs transition shadow-lg shadow-blue-600/20"
                >
                  {isReuploading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Verifying Re-uploaded Document...</span>
                    </>
                  ) : (
                    <>
                      <RefreshCw className="w-4 h-4" />
                      <span>Re-upload Corrected File (Creates v{(document.currentVersion || 1) + 1})</span>
                    </>
                  )}
                </button>
                <p className="text-[11px] text-slate-500 text-center mt-1.5">
                  Accepts PDF, PNG, JPG up to 20MB. Automatically re-runs verification.
                </p>
              </div>
            )}

          </div>

        </div>

      </div>
    </div>
  );
};

export default DocumentPreviewModal;
