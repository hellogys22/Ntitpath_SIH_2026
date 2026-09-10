import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { 
  Building2, 
  Map, 
  FileCheck2, 
  AlertTriangle, 
  CheckCircle2, 
  Calendar, 
  Clock, 
  ArrowRight,
  TrendingUp,
  Sparkles,
  Zap,
  Layers
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { IntelligenceBanner } from '../../components/common/IntelligenceBanner';
import { Navbar } from '../../components/layout/Navbar';
import { Sidebar } from '../../components/layout/Sidebar';
import { Footer } from '../../components/layout/Footer';
import { MetricCard } from '../../components/ui/MetricCard';
import { ProgressBar } from '../../components/ui/ProgressBar';
import { DocumentMismatchAlert } from '../../components/common/DocumentMismatchAlert';
import { BottleneckCard } from '../../components/common/BottleneckCard';
import { NextActionCard } from '../../components/common/NextActionCard';
import { DependencyGraph } from '../../components/common/DependencyGraph';
import { StatusBadge } from '../../components/ui/StatusBadge';
import { RiskBadge } from '../../components/ui/RiskBadge';

export const DashboardPage: React.FC = () => {
  const navigate = useNavigate();
  const { businessProfile, approvals, documents, risks, isMismatchResolved, t, language } = useApp();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const completedCount = approvals.filter(a => a.status === 'Completed').length;
  const inProgressCount = approvals.filter(a => a.status === 'In Progress').length;
  const pendingCount = approvals.filter(a => a.status === 'Pending').length;
  const highRiskCount = risks.filter(r => r.riskLevel === 'HIGH').length;

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

        <main className="flex-1 p-4 sm:p-6 lg:p-8 min-w-0 overflow-y-auto">
          
          {/* Welcome Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-extrabold uppercase tracking-wider text-amber-800 bg-amber-100 px-2.5 py-0.5 rounded-full border border-amber-200">
                  {language === 'HI' ? 'औद्योगिक आवेदक कार्यक्षेत्र' : 'Industrial Applicant Workspace'}
                </span>
                <span className="text-xs text-slate-500 font-medium">
                  {language === 'HI' ? 'अद्यतन 10 मिनट पूर्व' : 'Updated 10m ago'}
                </span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-black text-slate-900 mt-1">
                {t('welcomeBack')}, {businessProfile.companyName}
              </h1>
              <p className="text-xs sm:text-sm text-slate-600 font-medium">
                {businessProfile.location} • {businessProfile.industry} • {language === 'HI' ? 'निवेश' : 'Investment'}: {businessProfile.investment}
              </p>
            </div>

            <div className="flex items-center gap-2">
              <Link
                to="/copilot"
                className="px-4 py-2.5 bg-govNavy-800 hover:bg-govNavy-900 text-white text-xs font-bold rounded-lg shadow-sm transition-colors flex items-center gap-2"
              >
                <Sparkles className="w-4 h-4 text-amber-400" />
                <span>{language === 'HI' ? 'नीतिपथ कोपायलट से पूछें' : 'Ask NitiPath Copilot'}</span>
              </Link>
            </div>
          </div>

          {/* Summary Metrics */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4 mb-8">
            <MetricCard
              title={t('readinessScore')}
              value={`${businessProfile.readinessScore}%`}
              subtitle={isMismatchResolved ? (language === 'HI' ? "+14% समाधान हुआ" : "+14% Mismatch Cleared") : (language === 'HI' ? "कार्रवाई आवश्यक" : "Requires Attention")}
              variant={isMismatchResolved ? 'success' : 'warning'}
              icon={TrendingUp}
              onClick={() => navigate('/profile')}
            />
            <MetricCard
              title={t('totalApprovals')}
              value={approvals.length}
              subtitle={`${completedCount} ${language === 'HI' ? 'पूर्ण' : 'Completed'} • ${inProgressCount} ${language === 'HI' ? 'प्रगति पर' : 'Active'}`}
              icon={Map}
              onClick={() => navigate('/approvals')}
            />
            <MetricCard
              title={t('requiredDocuments')}
              value={documents.length}
              subtitle={isMismatchResolved ? (language === 'HI' ? "सभी सत्यापित" : "All Clear") : (language === 'HI' ? "2 में सुधार आवश्यक" : "2 Need Correction")}
              variant={isMismatchResolved ? 'default' : 'danger'}
              icon={FileCheck2}
              onClick={() => navigate('/documents')}
            />
            <MetricCard
              title={t('highRiskIssues')}
              value={highRiskCount}
              subtitle={highRiskCount > 0 ? (language === 'HI' ? "गंभीर अड़चनें" : "Critical Bottlenecks") : (language === 'HI' ? "कोई रुकावट नहीं" : "No Blockers")}
              variant={highRiskCount > 0 ? 'danger' : 'success'}
              icon={AlertTriangle}
              onClick={() => navigate('/risks')}
            />
            <MetricCard
              title={t('upcomingCompliance')}
              value={2}
              subtitle={language === 'HI' ? "आगामी 60 दिन" : "Next 60 Days"}
              icon={Calendar}
              onClick={() => navigate('/compliance')}
            />
          </div>

          {/* Interactive WOW Moment Alert */}
          <DocumentMismatchAlert />

          {/* Current Bottleneck Section */}
          <BottleneckCard />

          {/* Recommended Next Action Section */}
          <NextActionCard />

          {/* Approval Progress Breakdown */}
          <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm mb-8">
            <div className="flex flex-wrap items-center justify-between gap-2 mb-4 pb-3 border-b border-slate-100">
              <div>
                <h3 className="text-base font-bold text-slate-900">Approval Journey Progress</h3>
                <p className="text-xs text-slate-500">18 Total Statutory Permits Across 5 Departments</p>
              </div>
              <Link to="/approvals" className="text-xs font-bold text-govNavy-700 hover:underline flex items-center gap-1">
                <span>View Full Roadmap</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            <ProgressBar 
              progress={(completedCount / approvals.length) * 100} 
              label={`${completedCount} of ${approvals.length} Permits Completed`}
              colorClass="bg-emerald-600"
              size="lg"
            />

            <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 mt-6 pt-4 border-t border-slate-100 text-center text-xs">
              <div className="p-2 rounded-lg bg-slate-50 border border-slate-200">
                <span className="text-slate-500 block text-[10px] uppercase font-semibold">Total Permits</span>
                <span className="text-base font-bold text-slate-900">{approvals.length}</span>
              </div>
              <div className="p-2 rounded-lg bg-emerald-50 border border-emerald-200">
                <span className="text-emerald-800 block text-[10px] uppercase font-semibold">Completed</span>
                <span className="text-base font-bold text-emerald-900">{completedCount}</span>
              </div>
              <div className="p-2 rounded-lg bg-blue-50 border border-blue-200">
                <span className="text-blue-800 block text-[10px] uppercase font-semibold">In Progress</span>
                <span className="text-base font-bold text-blue-900">{inProgressCount}</span>
              </div>
              <div className="p-2 rounded-lg bg-slate-100 border border-slate-200">
                <span className="text-slate-600 block text-[10px] uppercase font-semibold">Pending</span>
                <span className="text-base font-bold text-slate-800">{pendingCount}</span>
              </div>
              <div className="p-2 rounded-lg bg-rose-50 border border-rose-200">
                <span className="text-rose-800 block text-[10px] uppercase font-semibold">High Risk</span>
                <span className="text-base font-bold text-rose-900">{highRiskCount}</span>
              </div>
            </div>
          </div>

          {/* Parallel Work & Critical Path Visualizer */}
          <DependencyGraph onSelectApproval={(appId) => navigate(`/approvals/${appId}`)} />

        </main>
      </div>

      <Footer />
    </div>
  );
};
