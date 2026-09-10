import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { 
  Map, 
  Search, 
  Filter, 
  ArrowRight, 
  ExternalLink, 
  ShieldAlert, 
  CheckCircle2, 
  Clock, 
  GitBranch, 
  Table, 
  Layers, 
  Info 
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { Navbar } from '../../components/layout/Navbar';
import { Sidebar } from '../../components/layout/Sidebar';
import { Footer } from '../../components/layout/Footer';
import { StatusBadge } from '../../components/ui/StatusBadge';
import { RiskBadge } from '../../components/ui/RiskBadge';
import { DependencyGraph } from '../../components/common/DependencyGraph';
import { ApprovalDetailsDrawer } from '../../components/common/ApprovalDetailsDrawer';

export const ApprovalsPage: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const { approvals } = useApp();

  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [viewMode, setViewMode] = useState<'both' | 'table' | 'graph'>('both');

  // Slide-over Details Drawer state
  const [selectedApprovalId, setSelectedApprovalId] = useState<string | null>(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  // Read URL search params for deep-linked approval opening
  useEffect(() => {
    const idParam = searchParams.get('approvalId') || searchParams.get('id');
    if (idParam) {
      setSelectedApprovalId(idParam);
      setIsDrawerOpen(true);
    }
  }, [searchParams]);

  const handleOpenDrawer = (approvalId: string) => {
    setSelectedApprovalId(approvalId);
    setIsDrawerOpen(true);
  };

  const handleCloseDrawer = () => {
    setIsDrawerOpen(false);
    // Remove query param if present
    if (searchParams.has('approvalId') || searchParams.has('id')) {
      searchParams.delete('approvalId');
      searchParams.delete('id');
      setSearchParams(searchParams);
    }
  };

  const filteredApprovals = useMemo(() => {
    return approvals.filter(a => {
      const matchesSearch = 
        a.name.toLowerCase().includes(search.toLowerCase()) || 
        a.department.toLowerCase().includes(search.toLowerCase()) ||
        a.id.toLowerCase().includes(search.toLowerCase());

      const matchesFilter = 
        statusFilter === 'ALL' || 
        (statusFilter === 'HIGH_RISK' && a.risk === 'HIGH') ||
        a.status.toUpperCase().replace(/\s+/g, '_') === statusFilter;

      return matchesSearch && matchesFilter;
    });
  }, [approvals, search, statusFilter]);

  const highRiskCount = approvals.filter(a => a.risk === 'HIGH').length;

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-900 font-sans">
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
          
          {/* Header & View Switcher */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
            <div>
              <div className="flex items-center gap-2">
                <Map className="w-5 h-5 text-govNavy-700" />
                <h1 className="text-2xl font-black text-slate-900 tracking-tight">Statutory Approval Roadmap</h1>
              </div>
              <p className="text-xs text-slate-500 mt-1">
                18 Statutory Clearances mapped across Environment (CECB), Industries (CSIDC), DISH, Fire Services, and Revenue.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2.5">
              {/* View Mode Toggle */}
              <div className="bg-white p-1 rounded-lg border border-slate-200 shadow-2xs flex items-center gap-1 text-xs">
                <button
                  onClick={() => setViewMode('both')}
                  className={`px-3 py-1.5 rounded-md font-bold transition-colors cursor-pointer flex items-center gap-1.5 ${
                    viewMode === 'both'
                      ? 'bg-govNavy-800 text-white shadow-2xs'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                  }`}
                >
                  <Layers className="w-3.5 h-3.5" />
                  <span>Combined</span>
                </button>
                <button
                  onClick={() => setViewMode('graph')}
                  className={`px-3 py-1.5 rounded-md font-bold transition-colors cursor-pointer flex items-center gap-1.5 ${
                    viewMode === 'graph'
                      ? 'bg-govNavy-800 text-white shadow-2xs'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                  }`}
                >
                  <GitBranch className="w-3.5 h-3.5" />
                  <span>DAG Graph</span>
                </button>
                <button
                  onClick={() => setViewMode('table')}
                  className={`px-3 py-1.5 rounded-md font-bold transition-colors cursor-pointer flex items-center gap-1.5 ${
                    viewMode === 'table'
                      ? 'bg-govNavy-800 text-white shadow-2xs'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                  }`}
                >
                  <Table className="w-3.5 h-3.5" />
                  <span>Table View</span>
                </button>
              </div>

              <span className="text-xs font-semibold text-slate-600 bg-white px-3 py-1.5 rounded-lg border border-slate-200 shadow-2xs">
                {filteredApprovals.length} of {approvals.length} Approvals
              </span>
            </div>
          </div>

          {/* Interactive DAG Graph Section */}
          {(viewMode === 'both' || viewMode === 'graph') && (
            <div className="mb-6">
              <DependencyGraph onSelectApproval={handleOpenDrawer} />
            </div>
          )}

          {/* Table View Section */}
          {(viewMode === 'both' || viewMode === 'table') && (
            <>
              {/* Filters & Search */}
              <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs mb-4 flex flex-col md:flex-row items-center justify-between gap-4">
                <div className="relative w-full md:w-80">
                  <input
                    type="text"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="Search approval, code, or department..."
                    className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-xs font-medium focus:ring-2 focus:ring-govNavy-700 outline-hidden"
                  />
                  <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                </div>

                <div className="flex items-center gap-1.5 flex-wrap w-full md:w-auto">
                  <span className="text-xs text-slate-500 font-bold mr-1 hidden sm:inline">Filter:</span>
                  
                  {['ALL', 'IN_PROGRESS', 'COMPLETED', 'PENDING', 'HIGH_RISK'].map((st) => (
                    <button
                      key={st}
                      onClick={() => setStatusFilter(st)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                        statusFilter === st
                          ? 'bg-govNavy-800 text-white shadow-2xs'
                          : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                      }`}
                    >
                      {st === 'HIGH_RISK' ? `⚠ High Risk (${highRiskCount})` : st.replace('_', ' ')}
                    </button>
                  ))}
                </div>
              </div>

              {/* Approval Table */}
              <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden mb-6">
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-slate-100/90 text-slate-700 font-bold border-b border-slate-200 uppercase tracking-wider text-[11px]">
                      <tr>
                        <th className="py-3.5 px-4">Approval Name</th>
                        <th className="py-3.5 px-4">Department</th>
                        <th className="py-3.5 px-4">Status</th>
                        <th className="py-3.5 px-4">Risk Level</th>
                        <th className="py-3.5 px-4">Statutory Dependency</th>
                        <th className="py-3.5 px-4">Critical Path</th>
                        <th className="py-3.5 px-4 text-right">Action</th>
                      </tr>
                    </thead>

                    <tbody className="divide-y divide-slate-100">
                      {filteredApprovals.map((app) => (
                        <tr 
                          key={app.id} 
                          onClick={() => handleOpenDrawer(app.id)}
                          className={`hover:bg-slate-50/90 transition-colors cursor-pointer group ${
                            app.risk === 'HIGH' ? 'bg-rose-50/20' : ''
                          }`}
                        >
                          <td className="py-3.5 px-4 font-bold text-slate-900 max-w-xs">
                            <div className="flex items-center gap-1.5">
                              <span className="font-mono text-[10px] uppercase font-bold text-slate-500 group-hover:text-govNavy-700">
                                {app.id}
                              </span>
                            </div>
                            <span className="text-slate-900 group-hover:text-govNavy-800 transition-colors block mt-0.5">
                              {app.name}
                            </span>
                          </td>

                          <td className="py-3.5 px-4 text-slate-600 font-medium">{app.department}</td>
                          
                          <td className="py-3.5 px-4">
                            <StatusBadge status={app.status} size="sm" />
                          </td>

                          <td className="py-3.5 px-4">
                            <RiskBadge risk={app.risk} size="sm" />
                          </td>

                          <td className="py-3.5 px-4 text-slate-600 font-medium">
                            {app.dependency && app.dependency !== 'None' ? (
                              <span className="text-amber-800 font-semibold bg-amber-50 px-2 py-0.5 rounded border border-amber-200 text-[11px]">
                                {app.dependency}
                              </span>
                            ) : (
                              <span className="text-slate-400 italic">None (Independent)</span>
                            )}
                          </td>

                          <td className="py-3.5 px-4">
                            {app.isCriticalPath ? (
                              <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded bg-amber-100 text-amber-800 border border-amber-300">
                                Critical Path
                              </span>
                            ) : (
                              <span className="text-[10px] font-medium text-slate-500">
                                Parallel Track
                              </span>
                            )}
                          </td>

                          <td className="py-3.5 px-4 text-right" onClick={(e) => e.stopPropagation()}>
                            <div className="inline-flex items-center gap-1.5">
                              <button
                                onClick={() => handleOpenDrawer(app.id)}
                                className="px-2.5 py-1.5 bg-govNavy-800 hover:bg-govNavy-900 text-white text-xs font-bold rounded shadow-2xs transition-colors inline-flex items-center gap-1 cursor-pointer"
                              >
                                <span>Details</span>
                                <ArrowRight className="w-3 h-3" />
                              </button>
                              <button
                                onClick={() => navigate(`/approvals/${app.id}`)}
                                className="p-1.5 bg-slate-100 hover:bg-slate-200 text-slate-600 hover:text-slate-900 rounded border border-slate-300 transition-colors inline-flex items-center cursor-pointer"
                                title="Open full page"
                              >
                                <ExternalLink className="w-3 h-3" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </>
          )}

        </main>
      </div>

      {/* Slide-over Approval Details Drawer */}
      <ApprovalDetailsDrawer
        isOpen={isDrawerOpen}
        onClose={handleCloseDrawer}
        approvalId={selectedApprovalId}
        onSelectAnotherApproval={(id) => setSelectedApprovalId(id)}
      />

      <Footer />
    </div>
  );
};
