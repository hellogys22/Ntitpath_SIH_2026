import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { FileSpreadsheet, Search, Eye, Filter } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { IntelligenceBanner } from '../../components/common/IntelligenceBanner';
import { Navbar } from '../../components/layout/Navbar';
import { AdminSidebar } from '../../components/layout/AdminSidebar';
import { Footer } from '../../components/layout/Footer';
import { StatusBadge } from '../../components/ui/StatusBadge';
import { RiskBadge } from '../../components/ui/RiskBadge';

export const AdminApplicationsPage: React.FC = () => {
  const navigate = useNavigate();
  const { adminApplications } = useApp();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('ALL');

  const filtered = adminApplications.filter(a => {
    const matchesSearch = a.businessName.toLowerCase().includes(search.toLowerCase()) || 
                          a.id.toLowerCase().includes(search.toLowerCase()) ||
                          a.industry.toLowerCase().includes(search.toLowerCase());
    const matchesFilter = filterStatus === 'ALL' || a.status === filterStatus || (filterStatus === 'HIGH_RISK' && a.risk === 'HIGH');
    return matchesSearch && matchesFilter;
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
                <FileSpreadsheet className="w-5 h-5 text-amber-400" />
                <h1 className="text-2xl font-black text-white">Application Management</h1>
              </div>
              <p className="text-xs text-slate-400 mt-1">Monitor applicant clearance stages, document issues, and risk flags</p>
            </div>
          </div>

          {/* Search & Filters */}
          <div className="bg-slate-900 p-4 rounded-xl border border-slate-800 shadow-sm mb-6 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="relative w-full sm:w-80">
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search by ID, business name, or industry..."
                className="w-full pl-9 pr-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-xs text-slate-200 focus:ring-2 focus:ring-amber-500"
              />
              <Search className="w-4 h-4 text-slate-500 absolute left-3 top-2.5" />
            </div>

            <div className="flex items-center gap-1.5 flex-wrap">
              {['ALL', 'Needs Attention', 'In Review', 'HIGH_RISK', 'Completed'].map(st => (
                <button
                  key={st}
                  onClick={() => setFilterStatus(st)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                    filterStatus === st
                      ? 'bg-amber-600 text-white shadow-xs'
                      : 'bg-slate-800 text-slate-400 hover:text-white'
                  }`}
                >
                  {st === 'HIGH_RISK' ? '⚠ High Risk' : st}
                </button>
              ))}
            </div>
          </div>

          {/* Applications Table */}
          <div className="bg-slate-900 rounded-xl border border-slate-800 shadow-md overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-950 text-slate-400 font-bold border-b border-slate-800 uppercase tracking-wider text-[11px]">
                  <tr>
                    <th className="py-3.5 px-4">Application ID</th>
                    <th className="py-3.5 px-4">Business Name</th>
                    <th className="py-3.5 px-4">Industry & Location</th>
                    <th className="py-3.5 px-4">Current Stage</th>
                    <th className="py-3.5 px-4">Risk Level</th>
                    <th className="py-3.5 px-4">Status</th>
                    <th className="py-3.5 px-4 text-right">Action</th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-slate-800 text-slate-300">
                  {filtered.map(app => (
                    <tr key={app.id} className="hover:bg-slate-800/60">
                      <td className="py-3.5 px-4 font-extrabold text-amber-400">{app.id}</td>
                      
                      <td className="py-3.5 px-4 font-bold text-white max-w-xs">
                        <Link to={`/admin/applications/${app.id}`} className="hover:underline">
                          {app.businessName}
                        </Link>
                      </td>

                      <td className="py-3.5 px-4 text-slate-400">
                        {app.industry}
                        <span className="block text-[10px] text-slate-500">{app.location}</span>
                      </td>

                      <td className="py-3.5 px-4 font-medium text-slate-200">{app.stage}</td>

                      <td className="py-3.5 px-4">
                        <RiskBadge risk={app.risk} size="sm" />
                      </td>

                      <td className="py-3.5 px-4">
                        <StatusBadge status={app.status} size="sm" />
                      </td>

                      <td className="py-3.5 px-4 text-right">
                        <button
                          onClick={() => navigate(`/admin/applications/${app.id}`)}
                          className="px-3 py-1.5 bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs rounded transition-colors inline-flex items-center gap-1 cursor-pointer"
                        >
                          <Eye className="w-3.5 h-3.5" />
                          <span>View Details</span>
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
