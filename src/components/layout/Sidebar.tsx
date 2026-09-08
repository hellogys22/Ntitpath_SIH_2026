import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Building2, 
  Map, 
  FileCheck2, 
  AlertTriangle, 
  GitMerge, 
  Gift, 
  Calendar, 
  Bot, 
  Bell, 
  Settings, 
  LogOut,
  ChevronRight
} from 'lucide-react';
import { useApp } from '../../context/AppContext';

interface SidebarProps {
  isMobileOpen?: boolean;
  closeMobileMenu?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ isMobileOpen, closeMobileMenu }) => {
  const { businessProfile, logout, t, language } = useApp();
  const navigate = useNavigate();

  const navItems = [
    { label: t('dashboard'), path: '/dashboard', icon: LayoutDashboard },
    { label: t('businessProfile'), path: '/profile', icon: Building2 },
    { label: t('approvalRoadmap'), path: '/approvals', icon: Map },
    { label: t('documentCheck'), path: '/documents', icon: FileCheck2 },
    { label: t('riskDependencies'), path: '/risks', icon: AlertTriangle },
    { label: t('supportSchemes'), path: '/support', icon: Gift },
    { label: t('complianceCalendar'), path: '/compliance', icon: Calendar },
    { label: t('copilot'), path: '/copilot', icon: Bot },
  ];

  const sidebarContent = (
    <div className="flex flex-col h-full bg-white border-r border-slate-200 w-64 text-slate-800 shadow-xs">
      
      {/* Business Info Header */}
      <div className="p-4 border-b border-slate-100 bg-slate-50/70">
        <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
          {language === 'HI' ? 'लक्षित उद्यम' : 'Target Enterprise'}
        </span>
        <h3 className="text-xs font-extrabold text-slate-900 truncate mt-0.5" title={businessProfile.companyName}>
          {businessProfile.companyName}
        </h3>
        <p className="text-[11px] text-slate-500 truncate">{businessProfile.location}</p>
        
        <div className="mt-2.5 pt-2 border-t border-slate-200/80 flex items-center justify-between">
          <span className="text-[11px] font-medium text-slate-600">
            {language === 'HI' ? 'तत्परता स्कोर' : 'Readiness Score'}
          </span>
          <span className="text-xs font-bold text-govNavy-700 bg-govNavy-50 px-2 py-0.5 rounded border border-govNavy-200">
            {businessProfile.readinessScore}%
          </span>
        </div>
      </div>

      {/* Navigation Links */}
      <nav className="flex-1 overflow-y-auto p-3 space-y-1">
        <div className="px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider text-slate-400">
          Business Navigation
        </div>

        {navItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            onClick={closeMobileMenu}
            className={({ isActive }) =>
              `flex items-center justify-between px-3 py-2.5 rounded-lg text-xs font-semibold transition-all ${
                isActive
                  ? 'bg-govNavy-700 text-white shadow-xs'
                  : 'text-slate-700 hover:bg-slate-100 hover:text-slate-900'
              }`
            }
          >
            {({ isActive }) => (
              <>
                <div className="flex items-center gap-2.5">
                  <item.icon className={`w-4 h-4 ${isActive ? 'text-amber-400' : 'text-slate-500'}`} />
                  <span>{item.label}</span>
                </div>
                {isActive && <ChevronRight className="w-3.5 h-3.5 text-amber-400" />}
              </>
            )}
          </NavLink>
        ))}
      </nav>

      {/* Footer / Logout */}
      <div className="p-3 border-t border-slate-100 bg-slate-50/50 space-y-1">
        <button
          onClick={() => {
            logout();
            navigate('/login');
          }}
          className="w-full flex items-center gap-2.5 px-3 py-2 text-xs font-semibold text-rose-700 hover:bg-rose-50 rounded-lg transition-colors"
        >
          <LogOut className="w-4 h-4 text-rose-600" />
          <span>Sign Out</span>
        </button>
      </div>

    </div>
  );

  return (
    <>
      {/* Desktop Persistent Sidebar */}
      <aside className="hidden lg:block h-[calc(100vh-4rem)] sticky top-16 shrink-0 z-20">
        {sidebarContent}
      </aside>

      {/* Mobile Drawer */}
      {isMobileOpen && (
        <div className="fixed inset-0 z-50 lg:hidden flex">
          <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs" onClick={closeMobileMenu} />
          <div className="relative z-10 w-64 h-full animate-in slide-in-from-left duration-200">
            {sidebarContent}
          </div>
        </div>
      )}
    </>
  );
};
