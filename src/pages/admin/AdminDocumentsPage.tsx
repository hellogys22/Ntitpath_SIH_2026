import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FileSearch, Search, Eye, Filter, CheckCircle2, AlertTriangle } from 'lucide-react';
import { IntelligenceBanner } from '../../components/common/IntelligenceBanner';
import { Navbar } from '../../components/layout/Navbar';
import { AdminSidebar } from '../../components/layout/AdminSidebar';
import { Footer } from '../../components/layout/Footer';
import { StatusBadge } from '../../components/ui/StatusBadge';

export const AdminDocumentsPage: React.FC = () => {
  const navigate = useNavigate();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'ALL' | 'Needs Correction' | 'Pending Review' | 'Verified'>('ALL');
  const [search, setSearch] = useState('');

  const documentQueue = [
    {
      id: "DOC-Q-01",
      business: "Raipur Fresh Foods Pvt. Ltd.",
      appId: "NTP-00128",
      document: "Approved Building Site Plan & Layout Drawing",
      uploaded: "08 Sep 2026",
      status: "Needs Correction",
      issue: "Area mismatch (10,000 sq ft drawing vs 12,500 sq ft DPR)",
      dept: "Pollution Board"
    },
    {
      id: "DOC-Q-02",
      business: "Raipur Fresh Foods Pvt. Ltd.",
      appId: "NTP-00128",
      document: "Detailed Project Report (DPR)",
      uploaded: "08 Sep 2026",
      status: "Needs Correction",
      issue: "ETP capacity rating discrepancy",
      dept: "Pollution Board"
    },
    {
      id: "DOC-Q-03",
      business: "Shakti Heavy Engineering Ltd.",
      appId: "NTP-00129",
      document: "High-Tension Transformer Pressure Relief Test",
      uploaded: "07 Sep 2026",
      status: "Pending Review",
      issue: "Awaiting Electrical Inspector signature validation",
      dept: "Power Distribution"
    },
    {
      id: "DOC-Q-04",
      business: "Bharat Agro Cold Storage Industries",
      appId: "NTP-00130",
      document: "Ammonia Refrigeration Safety Protocol Form",
      uploaded: "06 Sep 2026",
      status: "Needs Correction",
      issue: "Emergency evacuation map missing wind-direction marker",
      dept: "Industrial Safety"
    },
    {
      id: "DOC-Q-05",
      business: "Mahamaya Pharma Synthetics",
      appId: "NTP-00131",
      document: "ZLD Effluent Treatment Verification Certificate",
      uploaded: "05 Sep 2026",
      status: "Verified",
      issue: "All test parameters compliant with Board standards",
      dept: "Environment Board"
    }
  ];

  const filtered = documentQueue.filter(d => {
    const matchesSearch = d.business.toLowerCase().includes(search.toLowerCase()) || 
                          d.document.toLowerCase().includes(search.toLowerCase());
    const matchesTab = activeTab === 'ALL' || d.status === activeTab;
    return matchesSearch && matchesTab;
  });

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
                <FileSearch className="w-5 h-5 text-amber-400" />
                <h1 className="text-2xl font-black text-white">Document Review Queue</h1>
              </div>
              <p className="text-xs text-slate-400 mt-1">Cross-check document consistency, drawing dimensions, and statutory declarations</p>
            </div>
          </div>

          {/* Filter Tabs & Search */}
          <div className="bg-slate-900 p-4 rounded-xl border border-slate-800 shadow-sm mb-6 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              {['ALL', 'Needs Correction', 'Pending Review', 'Verified'].map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab as any)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                    activeTab === tab
                      ? 'bg-amber-600 text-white shadow-xs'
                      : 'bg-slate-800 text-slate-400 hover:text-white'
                  }`}
                >
                  {tab}
                </button>
              ))}
            </div>

            <div className="relative w-full sm:w-64">
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search business or document..."
                className="w-full pl-9 pr-3 py-1.5 bg-slate-950 border border-slate-800 rounded-lg text-xs text-slate-200"
              />
              <Search className="w-4 h-4 text-slate-500 absolute left-3 top-2" />
            </div>
          </div>

          {/* Documents Table */}
          <div className="bg-slate-900 rounded-xl border border-slate-800 shadow-md overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-950 text-slate-400 font-bold border-b border-slate-800 uppercase tracking-wider text-[11px]">
                  <tr>
                    <th className="py-3.5 px-4">Business Enterprise</th>
                    <th className="py-3.5 px-4">Document Title</th>
                    <th className="py-3.5 px-4">Submission Date</th>
                    <th className="py-3.5 px-4">Audit Status</th>
                    <th className="py-3.5 px-4">Detected Discrepancy</th>
                    <th className="py-3.5 px-4 text-right">Action</th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-slate-800 text-slate-300">
                  {filtered.map((item) => (
                    <tr key={item.id} className="hover:bg-slate-800/60">
                      <td className="py-3.5 px-4 font-bold text-white">
                        <span>{item.business}</span>
                        <span className="text-[10px] text-amber-400 block font-normal">{item.appId}</span>
                      </td>

                      <td className="py-3.5 px-4 text-slate-200 font-medium max-w-xs">{item.document}</td>

                      <td className="py-3.5 px-4 text-slate-400">{item.uploaded}</td>

                      <td className="py-3.5 px-4">
                        <StatusBadge status={item.status} size="sm" />
                      </td>

                      <td className="py-3.5 px-4 font-medium text-slate-300 max-w-xs">
                        {item.status === 'Needs Correction' ? (
                          <span className="text-rose-300 font-semibold">{item.issue}</span>
                        ) : (
                          <span>{item.issue}</span>
                        )}
                      </td>

                      <td className="py-3.5 px-4 text-right">
                        <button
                          onClick={() => navigate(`/admin/applications/${item.appId}`)}
                          className="px-3 py-1.5 bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs rounded transition-colors inline-flex items-center gap-1 cursor-pointer"
                        >
                          <Eye className="w-3.5 h-3.5" />
                          <span>Review</span>
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
