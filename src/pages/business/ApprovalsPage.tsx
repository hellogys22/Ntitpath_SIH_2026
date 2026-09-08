import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Map, Search, Filter, ArrowRight, ExternalLink, ShieldAlert, CheckCircle2, Clock } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { IntelligenceBanner } from '../../components/common/IntelligenceBanner';
import { Navbar } from '../../components/layout/Navbar';
import { Sidebar } from '../../components/layout/Sidebar';
import { Footer } from '../../components/layout/Footer';
import { StatusBadge } from '../../components/ui/StatusBadge';
import { RiskBadge } from '../../components/ui/RiskBadge';

export const ApprovalsPage: React.FC = () => {
  const navigate = useNavigate();
  const { approvals } = useApp();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');

  const filteredApprovals = approvals.filter(a => {
    const matchesSearch = a.name.toLowerCase().includes(search.toLowerCase()) || 
                          a.department.toLowerCase().includes(search.toLowerCase());
    const matchesFilter = statusFilter === 'ALL' || 
                          (statusFilter === 'HIGH_RISK' && a.risk === 'HIGH') ||
                          a.status.toUpperCase().replace(' ', '_') === statusFilter;
    return matchesSearch && matchesFilter;
  });

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
                <Map className="w-5 h-5 text-govNavy-700" />
                <h1 className="text-2xl font-extrabold text-slate-900">Approval Roadmap</h1>
              </div>
              <p className="text-xs text-slate-500 mt-1">
                18 Statutory Approvals mapped across Environment, Industries, Fire, Power Utility, and Revenue.
              </p>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold text-slate-600 bg-white px-3 py-1.5 rounded-lg border border-slate-200 shadow-2xs">
                Showing {filteredApprovals.length} of {approvals.length} Approvals
              </span>
            </div>
          </div>

          {/* Filters & Search */}
          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs mb-6 flex flex-col sm:flex-row items-center justify-between gap-4">
            
            <div className="relative w-full sm:w-72">
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search approval name or department..."
                className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-xs font-medium focus:ring-2 focus:ring-govNavy-700"
              />
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            </div>

            <div className="flex items-center gap-1.5 flex-wrap w-full sm:w-auto">
              <span className="text-xs text-slate-500 font-bold mr-1 hidden md:inline">Filter Status:</span>
              
              {['ALL', 'IN_PROGRESS', 'COMPLETED', 'PENDING', 'HIGH_RISK'].map((st) => (
                <button
                  key={st}
                  onClick={() => setStatusFilter(st)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                    statusFilter === st
                      ? 'bg-govNavy-800 text-white shadow-xs'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  {st === 'HIGH_RISK' ? '⚠ High Risk' : st.replace('_', ' ')}
                </button>
              ))}
            </div>

          </div>

          {/* Approval Table */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-100/80 text-slate-700 font-bold border-b border-slate-200 uppercase tracking-wider text-[11px]">
                  <tr>
                    <th className="py-3.5 px-4">Approval Name</th>
                    <th className="py-3.5 px-4">Department</th>
                    <th className="py-3.5 px-4">Status</th>
                    <th className="py-3.5 px-4">Risk Level</th>
                    <th className="py-3.5 px-4">Current Dependency</th>
                    <th className="py-3.5 px-4">Recommended Next Action</th>
                    <th className="py-3.5 px-4 text-right">Action</th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-slate-100">
                  {filteredApprovals.map((app) => (
                    <tr 
                      key={app.id} 
                      className={`hover:bg-slate-50 transition-colors ${app.risk === 'HIGH' ? 'bg-rose-50/20' : ''}`}
                    >
                      <td className="py-3.5 px-4 font-bold text-slate-900 max-w-xs">
                        <Link to={`/approvals/${app.id}`} className="hover:text-govNavy-700 hover:underline">
                          {app.name}
                        </Link>
                        {app.isCriticalPath && (
                          <span className="ml-2 text-[10px] font-extrabold uppercase px-1.5 py-0.5 rounded bg-amber-100 text-amber-800 border border-amber-300">
                            Critical Path
                          </span>
                        )}
                      </td>

                      <td className="py-3.5 px-4 text-slate-600 font-medium">{app.department}</td>
                      
                      <td className="py-3.5 px-4">
                        <StatusBadge status={app.status} size="sm" />
                      </td>

                      <td className="py-3.5 px-4">
                        <RiskBadge risk={app.risk} size="sm" />
                      </td>

                      <td className="py-3.5 px-4 text-slate-600 font-medium">{app.dependency}</td>

                      <td className="py-3.5 px-4 font-semibold text-slate-800 max-w-xs">{app.nextAction}</td>

                      <td className="py-3.5 px-4 text-right">
                        <button
                          onClick={() => navigate(`/approvals/${app.id}`)}
                          className="px-2.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-semibold rounded border border-slate-300 transition-colors inline-flex items-center gap-1 cursor-pointer"
                        >
                          <span>Details</span>
                          <ArrowRight className="w-3 h-3" />
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
