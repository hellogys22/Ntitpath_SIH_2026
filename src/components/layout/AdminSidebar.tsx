import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { 
  LayoutDashboard, 
  FileSpreadsheet, 
  Activity, 
  AlertOctagon, 
  FileSearch, 
  Building, 
  GitFork, 
  BarChart3, 
  Lightbulb, 
  ShieldAlert, 
  Bell, 
  UserCheck, 
  LogOut,
  ChevronRight
} from 'lucide-react';
import { useApp } from '../../context/AppContext';

interface AdminSidebarProps {
  isMobileOpen?: boolean;
  closeMobileMenu?: () => void;
}

export const AdminSidebar: React.FC<AdminSidebarProps> = ({ isMobileOpen, closeMobileMenu }) => {
  const { logout, t } = useApp();
  const navigate = useNavigate();

  const adminNavItems = [
    { label: t('adminDashboard'), path: '/admin/dashboard', icon: LayoutDashboard },
    { label: t('adminApplications'), path: '/admin/applications', icon: FileSpreadsheet },
    { label: t('adminApprovals'), path: '/admin/approvals', icon: Activity },
    { label: t('adminRisks'), path: '/admin/risks', icon: AlertOctagon },
    { label: t('adminDocuments'), path: '/admin/documents', icon: FileSearch },
    { label: t('adminDepartments'), path: '/admin/departments', icon: Building },
    { label: t('adminDependencies'), path: '/admin/dependencies', icon: GitFork },
    { label: t('adminReports'), path: '/admin/reports', icon: BarChart3 },
    { label: t('adminSupport'), path: '/admin/support', icon: Lightbulb },
    { label: t('adminCompliance'), path: '/admin/compliance', icon: ShieldAlert },
    { label: t('adminNotifications'), path: '/admin/notifications', icon: Bell },
    { label: t('adminProfile'), path: '/admin/profile', icon: UserCheck },
  ];

  const sidebarContent = (
    <div className="flex flex-col h-full bg-slate-900 text-slate-200 border-r border-slate-800 w-64 shrink-0 shadow-lg">
      
      {/* Officer Header */}
      <div className="p-4 border-b border-slate-800 bg-slate-950/60">
        <span className="text-[10px] font-bold uppercase tracking-wider text-amber-400">Department Administration</span>
        <h3 className="text-xs font-bold text-white truncate mt-0.5">
          Senior Officer Portal
        </h3>
        <p className="text-[11px] text-slate-400 truncate">Environment & Industry Cell</p>
      </div>

      {/* Navigation Links */}
      <nav className="flex-1 overflow-y-auto p-3 space-y-1">
        <div className="px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider text-slate-500">
          Monitoring & Coordination
        </div>

        {adminNavItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            onClick={closeMobileMenu}
            className={({ isActive }) =>
              `flex items-center justify-between px-3 py-2 rounded-lg text-xs font-medium transition-all ${
                isActive
                  ? 'bg-amber-600 text-white font-bold shadow-xs'
                  : 'text-slate-300 hover:bg-slate-800 hover:text-white'
              }`
            }
          >
            {({ isActive }) => (
              <>
                <div className="flex items-center gap-2.5">
                  <item.icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-slate-400'}`} />
                  <span>{item.label}</span>
                </div>
                {isActive && <ChevronRight className="w-3.5 h-3.5 text-white" />}
              </>
            )}
          </NavLink>
        ))}
      </nav>

      {/* Logout */}
      <div className="p-3 border-t border-slate-800 bg-slate-950/50">
        <button
          onClick={() => {
            logout();
            navigate('/login');
          }}
          className="w-full flex items-center gap-2.5 px-3 py-2 text-xs font-semibold text-rose-400 hover:bg-rose-950/40 rounded-lg transition-colors"
        >
          <LogOut className="w-4 h-4 text-rose-400" />
          <span>Sign Out</span>
        </button>
      </div>

    </div>
  );

  return (
    <>
      <aside className="hidden lg:block h-[calc(100vh-4rem)] sticky top-16 shrink-0 z-20">
        {sidebarContent}
      </aside>

      {isMobileOpen && (
        <div className="fixed inset-0 z-50 lg:hidden flex">
          <div className="fixed inset-0 bg-slate-950/70 backdrop-blur-xs" onClick={closeMobileMenu} />
          <div className="relative z-10 w-64 h-full animate-in slide-in-from-left duration-200">
            {sidebarContent}
          </div>
        </div>
      )}
    </>
  );
};
