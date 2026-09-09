import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { 
  Bell, 
  Globe, 
  HelpCircle, 
  User as UserIcon, 
  LogOut, 
  ChevronDown,
  Menu,
  X,
  LogIn
} from 'lucide-react';
import { useApp } from '../../context/AppContext';

interface NavbarProps {
  toggleMobileMenu?: () => void;
  isMobileMenuOpen?: boolean;
}

export const Navbar: React.FC<NavbarProps> = ({ toggleMobileMenu, isMobileMenuOpen }) => {
  const { role, logout, notifications, markNotificationRead, user, language, toggleLanguage, t } = useApp();
  const navigate = useNavigate();
  const location = useLocation();
  const [showNotifications, setShowNotifications] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showHelpModal, setShowHelpModal] = useState(false);

  const unreadCount = notifications.filter(n => !n.read && n.recipientRole === role).length;
  const isPublicPage = location.pathname === '/' || location.pathname === '/login' || location.pathname === '/register' || location.pathname === '/landing';

  return (
    <>
      <header className="bg-govNavy-900 text-white border-b border-govNavy-800 sticky top-0 z-40 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            
            {/* Left: Mobile Menu Button & Brand Emblem */}
            <div className="flex items-center gap-3">
              {toggleMobileMenu && (
                <button
                  onClick={toggleMobileMenu}
                  className="p-1.5 rounded-md text-slate-300 hover:text-white hover:bg-govNavy-800 lg:hidden"
                  aria-label="Toggle navigation menu"
                >
                  {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
                </button>
              )}

              <Link 
                to={!user ? '/' : role === 'admin' ? '/admin/dashboard' : '/dashboard'} 
                className="flex items-center gap-3 group"
              >
                {/* Emblem Badge */}
                <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-govNavy-700 to-govNavy-950 border border-amber-500/40 flex items-center justify-center shadow-xs">
                  <div className="w-5 h-5 rounded-full border-2 border-amber-400 flex items-center justify-center">
                    <span className="text-[10px] font-black text-amber-400">N</span>
                  </div>
                </div>

                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-lg font-black tracking-tight text-white group-hover:text-amber-400 transition-colors">
                      {language === 'HI' ? 'नीतिपथ' : 'NitiPath'}
                    </span>
                  </div>
                  <p className="text-[10px] text-slate-300 font-medium hidden sm:block">
                    {language === 'HI' ? 'औद्योगिक अनुमोदन एवं अनुपालन आसूचना' : 'Industrial Approval & Compliance Intelligence'}
                  </p>
                </div>
              </Link>
            </div>

            {/* Middle: Public Navigation Links */}
            {isPublicPage ? (
              <nav className="hidden md:flex items-center gap-6 text-xs font-medium text-slate-300">
                <Link to="/" className="hover:text-amber-400 transition-colors">Home</Link>
                <a href="/#how-it-works" className="hover:text-amber-400 transition-colors">How It Works</a>
                <Link to="/assessment" className="hover:text-amber-400 transition-colors">Approval Journey</Link>
                <Link to="/login" className="hover:text-amber-400 transition-colors">Support & Schemes</Link>
                <Link to="/login" className="hover:text-amber-400 transition-colors">Compliance</Link>
              </nav>
            ) : (
              <div className="hidden md:flex items-center gap-2">
                <span className="text-xs font-semibold text-slate-400">
                  {role === 'admin' 
                    ? (language === 'HI' ? '🏛️ विभागीय प्रशासन प्रवेशद्वार' : '🏛️ Department Administration Gateway')
                    : (language === 'HI' ? '🏢 औद्योगिक उद्यम पोर्टल' : '🏢 Industrial Enterprise Portal')}
                </span>
              </div>
            )}

            {/* Right Tools */}
            <div className="flex items-center gap-3">
              
              {/* Working Global Language Selector */}
              <button 
                type="button"
                onClick={toggleLanguage}
                className="p-1.5 rounded-md text-slate-300 hover:text-white hover:bg-govNavy-800 transition-colors flex items-center gap-1.5 text-xs font-bold border border-govNavy-700 bg-govNavy-950/60 cursor-pointer"
                title="Switch Language / भाषा बदलें"
              >
                <Globe className="w-4 h-4 text-amber-400" />
                <span>{language === 'EN' ? 'English' : 'हिन्दी'}</span>
              </button>

              {/* Notifications Dropdown (only when logged in) */}
              {user && (
                <div className="relative">
                  <button
                    onClick={() => setShowNotifications(!showNotifications)}
                    className="p-1.5 rounded-md text-slate-300 hover:text-white hover:bg-govNavy-800 transition-colors relative"
                    aria-label="Notifications"
                  >
                    <Bell className="w-5 h-5" />
                    {unreadCount > 0 && (
                      <span className="absolute top-1 right-1 w-2.5 h-2.5 bg-rose-500 rounded-full border-2 border-govNavy-900 animate-pulse" />
                    )}
                  </button>

                  {showNotifications && (
                    <div className="absolute right-0 mt-2 w-80 bg-white text-slate-900 rounded-xl shadow-2xl border border-slate-200 py-2 z-50 animate-in fade-in zoom-in-95 duration-100">
                      <div className="px-4 py-2 border-b border-slate-100 flex items-center justify-between">
                        <span className="text-xs font-bold text-slate-900">Notifications ({unreadCount})</span>
                        <span className="text-[10px] text-slate-500">Alert Stream</span>
                      </div>

                      <div className="max-h-64 overflow-y-auto divide-y divide-slate-100">
                        {notifications.filter(n => n.recipientRole === role).length === 0 ? (
                          <div className="p-4 text-center text-xs text-slate-500">No new notifications</div>
                        ) : (
                          notifications.filter(n => n.recipientRole === role).map(n => (
                            <div 
                              key={n.id} 
                              onClick={() => {
                                markNotificationRead(n.id);
                                navigate(n.link);
                                setShowNotifications(false);
                              }}
                              className={`p-3 text-xs hover:bg-slate-50 cursor-pointer transition-colors ${!n.read ? 'bg-amber-50/50 font-medium' : ''}`}
                            >
                              <p className="font-bold text-slate-900">{n.title}</p>
                              <p className="text-slate-600 mt-0.5 text-[11px] leading-relaxed">{n.message}</p>
                              <span className="text-[10px] text-slate-400 mt-1 block">{n.time}</span>
                            </div>
                          ))
                        )}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Help & Support Button */}
              <button
                onClick={() => setShowHelpModal(!showHelpModal)}
                className="p-1.5 rounded-md text-slate-300 hover:text-white hover:bg-govNavy-800 transition-colors"
                title="Help & Support"
              >
                <HelpCircle className="w-5 h-5" />
              </button>

              {/* User Profile or Sign In / Register Buttons */}
              <div className="relative">
                {user ? (
                  <button
                    onClick={() => setShowUserMenu(!showUserMenu)}
                    className="flex items-center gap-2 pl-2 pr-1.5 py-1 rounded-lg bg-govNavy-800 hover:bg-govNavy-700 transition-colors border border-govNavy-700 text-xs cursor-pointer"
                  >
                    <div className={`w-6 h-6 rounded-full font-bold flex items-center justify-center text-xs ${
                      role === 'admin' ? 'bg-amber-500 text-govNavy-950' : 'bg-govNavy-500 text-white'
                    }`}>
                      {user.role === 'admin' ? 'A' : 'B'}
                    </div>
                    <span className="font-semibold text-white max-w-[120px] truncate hidden sm:inline">
                      {user.role === 'admin' ? 'Admin Officer' : user.companyName || 'Raipur Fresh'}
                    </span>
                    <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
                  </button>
                ) : (
                  <div className="flex items-center gap-2">
                    <Link
                      to="/login"
                      className="px-3 py-1.5 rounded-lg bg-govNavy-800 hover:bg-govNavy-700 text-white font-bold text-xs border border-govNavy-700 transition-colors flex items-center gap-1.5"
                    >
                      <LogIn className="w-3.5 h-3.5 text-amber-400" />
                      <span>Sign In</span>
                    </Link>
                    <Link
                      to="/register"
                      className="hidden sm:inline-flex px-3 py-1.5 rounded-lg bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs shadow-xs transition-colors"
                    >
                      Register
                    </Link>
                  </div>
                )}

                {showUserMenu && user && (
                  <div className="absolute right-0 mt-2 w-56 bg-white text-slate-900 rounded-xl shadow-2xl border border-slate-200 py-2 z-50 text-xs animate-in fade-in duration-100">
                    <div className="px-4 py-2 border-b border-slate-100">
                      <p className="font-bold text-slate-900">{user.name}</p>
                      <p className="text-[11px] text-slate-500">{user.email}</p>
                      <span className={`inline-block mt-1 text-[10px] font-extrabold uppercase px-2 py-0.5 rounded ${
                        role === 'admin' ? 'bg-amber-100 text-amber-900' : 'bg-slate-100 text-slate-700'
                      }`}>
                        {role === 'admin' ? 'Department Admin' : 'Business Applicant'}
                      </span>
                    </div>

                    <Link
                      to={role === 'admin' ? '/admin/profile' : '/profile'}
                      onClick={() => setShowUserMenu(false)}
                      className="px-4 py-2 hover:bg-slate-50 flex items-center gap-2 text-slate-700"
                    >
                      <UserIcon className="w-4 h-4 text-slate-400" />
                      <span>View Profile</span>
                    </Link>

                    <button
                      onClick={() => {
                        logout();
                        setShowUserMenu(false);
                        navigate('/login');
                      }}
                      className="w-full px-4 py-2 hover:bg-rose-50 text-rose-700 flex items-center gap-2 text-left font-semibold border-t border-slate-100 cursor-pointer"
                    >
                      <LogOut className="w-4 h-4 text-rose-600" />
                      <span>Sign Out</span>
                    </button>
                  </div>
                )}
              </div>

            </div>

          </div>
        </div>
      </header>

      {/* Help Modal */}
      {showHelpModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 flex items-center justify-center p-4" onClick={() => setShowHelpModal(false)}>
          <div className="bg-white rounded-xl max-w-md w-full p-6 border border-slate-200 shadow-2xl" onClick={e => e.stopPropagation()}>
            <div className="flex justify-between items-center pb-3 border-b border-slate-100">
              <h3 className="text-base font-bold text-slate-900">NitiPath Platform Guidance</h3>
              <button onClick={() => setShowHelpModal(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="py-4 space-y-3 text-xs text-slate-600">
              <p><strong>NitiPath</strong> is an intelligence layer designed to help businesses navigate industrial approvals cleanly.</p>
              
              <div className="bg-slate-50 p-3 rounded-lg border border-slate-200 space-y-1.5">
                <p className="font-bold text-slate-900">Login Portals (on /login):</p>
                <p>• <strong>Business User</strong>: Sign in via "Business / Applicant" tab (e.g. <code>business@demo.com</code> / <code>demo123</code>)</p>
                <p>• <strong>Department Admin</strong>: Sign in via "Department / Admin" tab (e.g. <code>admin@demo.com</code> / <code>admin123</code>)</p>
              </div>

              <p>Problem Statement: <strong>SIH26130</strong> | Industrial Approval & Compliance Intelligence</p>
            </div>
            <button 
              onClick={() => setShowHelpModal(false)}
              className="w-full py-2 bg-govNavy-700 text-white font-bold text-xs rounded-lg hover:bg-govNavy-800 cursor-pointer"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </>
  );
};
