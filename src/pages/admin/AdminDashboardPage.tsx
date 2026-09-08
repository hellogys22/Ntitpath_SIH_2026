import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { 
  ShieldCheck, 
  FileSpreadsheet, 
  AlertOctagon, 
  FileSearch, 
  Building, 
  Activity, 
  ArrowRight,
  Eye,
  CheckCircle2
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { IntelligenceBanner } from '../../components/common/IntelligenceBanner';
import { Navbar } from '../../components/layout/Navbar';
import { AdminSidebar } from '../../components/layout/AdminSidebar';
import { Footer } from '../../components/layout/Footer';
import { MetricCard } from '../../components/ui/MetricCard';
import { StatusBadge } from '../../components/ui/StatusBadge';
import { RiskBadge } from '../../components/ui/RiskBadge';

export const AdminDashboardPage: React.FC = () => {
  const navigate = useNavigate();
  const { adminApplications, departmentWorkloads } = useApp();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

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
          
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-amber-400 bg-amber-950/80 px-2.5 py-0.5 rounded border border-amber-800">
                Department Command Center
              </span>
              <h1 className="text-2xl font-black text-white mt-1">NitiPath Administration</h1>
              <p className="text-xs text-slate-400">Regulatory Journey Monitoring & Inter-Department Coordination</p>
            </div>
          </div>

          {/* Prototype Summary Metrics */}
          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-3 mb-8">
            <div className="p-3 bg-slate-900 rounded-lg border border-slate-800">
              <span className="text-[10px] uppercase font-bold text-slate-400 block">Total Apps</span>
              <span className="text-xl font-bold text-white">1,248</span>
            </div>

            <div className="p-3 bg-slate-900 rounded-lg border border-slate-800">
              <span className="text-[10px] uppercase font-bold text-blue-400 block">In Progress</span>
              <span className="text-xl font-bold text-blue-300">486</span>
            </div>

            <div className="p-3 bg-slate-900 rounded-lg border border-slate-800">
              <span className="text-[10px] uppercase font-bold text-amber-400 block">Pending Review</span>
              <span className="text-xl font-bold text-amber-300">217</span>
            </div>

            <div className="p-3 bg-rose-950/40 rounded-lg border border-rose-800">
              <span className="text-[10px] uppercase font-bold text-rose-400 block">High Risk</span>
              <span className="text-xl font-bold text-rose-300">64</span>
            </div>

            <div className="p-3 bg-slate-900 rounded-lg border border-slate-800">
              <span className="text-[10px] uppercase font-bold text-amber-400 block">Doc Issues</span>
              <span className="text-xl font-bold text-amber-300">91</span>
            </div>

            <div className="p-3 bg-slate-900 rounded-lg border border-slate-800">
              <span className="text-[10px] uppercase font-bold text-rose-400 block">Bottlenecks</span>
              <span className="text-xl font-bold text-rose-300">37</span>
            </div>

            <div className="p-3 bg-emerald-950/40 rounded-lg border border-emerald-800">
              <span className="text-[10px] uppercase font-bold text-emerald-400 block">Completed</span>
              <span className="text-xl font-bold text-emerald-300">761</span>
            </div>
          </div>

          {/* Requires Attention Table */}
          <div className="bg-slate-900 rounded-xl border border-slate-800 p-5 shadow-md mb-8">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800 mb-4">
              <div className="flex items-center gap-2">
                <AlertOctagon className="w-5 h-5 text-rose-400" />
                <h3 className="text-base font-bold text-white">Requires Urgent Officer Attention</h3>
              </div>
              <Link to="/admin/applications" className="text-xs font-bold text-amber-400 hover:underline">
                View All Applications →
              </Link>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-950 text-slate-400 font-bold border-b border-slate-800 uppercase tracking-wider text-[11px]">
                  <tr>
                    <th className="py-3 px-4">Application ID</th>
                    <th className="py-3 px-4">Enterprise Name</th>
                    <th className="py-3 px-4">Flagged Issue</th>
                    <th className="py-3 px-4">Risk Level</th>
                    <th className="py-3 px-4">In Charge Dept</th>
                    <th className="py-3 px-4 text-right">Officer Action</th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-slate-800 text-slate-300">
                  {adminApplications.filter(a => a.status === 'Needs Attention').map(app => (
                    <tr key={app.id} className="hover:bg-slate-800/60">
                      <td className="py-3.5 px-4 font-extrabold text-amber-400">{app.id}</td>
                      <td className="py-3.5 px-4 font-bold text-white">
                        <Link to={`/admin/applications/${app.id}`} className="hover:underline">
                          {app.businessName}
                        </Link>
                        <span className="block text-[10px] text-slate-400 font-normal">{app.location}</span>
                      </td>

                      <td className="py-3.5 px-4 text-rose-300 font-medium">
                        {app.hasMismatch ? '⚠ Document Area Mismatch (10,000 vs 12,500 sq ft)' : 'Pending Inter-dept Clearance'}
                      </td>

                      <td className="py-3.5 px-4">
                        <RiskBadge risk={app.risk} size="sm" />
                      </td>

                      <td className="py-3.5 px-4 text-slate-300 font-semibold">{app.departmentInCharge}</td>

                      <td className="py-3.5 px-4 text-right">
                        <button
                          onClick={() => navigate(`/admin/applications/${app.id}`)}
                          className="px-3 py-1.5 bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs rounded transition-colors inline-flex items-center gap-1 cursor-pointer"
                        >
                          <Eye className="w-3.5 h-3.5" />
                          <span>Review Case</span>
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Department Workload Summary */}
          <div className="bg-slate-900 rounded-xl border border-slate-800 p-5 shadow-md">
            <div className="pb-3 border-b border-slate-800 mb-4 flex justify-between items-center">
              <h3 className="text-base font-bold text-white">Department Workload & System Bottlenecks</h3>
              <Link to="/admin/departments" className="text-xs font-bold text-amber-400 hover:underline">
                View Full Workload Heatmap →
              </Link>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {departmentWorkloads.map((dw, idx) => (
                <div key={idx} className="p-4 rounded-lg bg-slate-950 border border-slate-800">
                  <span className="text-xs font-bold text-slate-300 block truncate" title={dw.department}>
                    {dw.department}
                  </span>
                  
                  <div className="mt-3 grid grid-cols-2 gap-2 text-center text-xs">
                    <div className="p-2 bg-slate-900 rounded border border-slate-800">
                      <span className="text-slate-400 block text-[10px]">Active Apps</span>
                      <span className="text-sm font-bold text-white">{dw.activeApplications}</span>
                    </div>

                    <div className="p-2 bg-rose-950/60 rounded border border-rose-800">
                      <span className="text-rose-400 block text-[10px]">High Risk</span>
                      <span className="text-sm font-bold text-rose-300">{dw.highRisk}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

        </main>
      </div>

      <Footer />
    </div>
  );
};
