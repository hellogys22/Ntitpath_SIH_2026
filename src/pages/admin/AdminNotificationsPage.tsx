import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Bell, AlertTriangle, FileCheck2, ArrowRight } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { IntelligenceBanner } from '../../components/common/IntelligenceBanner';
import { Navbar } from '../../components/layout/Navbar';
import { AdminSidebar } from '../../components/layout/AdminSidebar';
import { Footer } from '../../components/layout/Footer';

export const AdminNotificationsPage: React.FC = () => {
  const navigate = useNavigate();
  const { notifications, markNotificationRead } = useApp();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const adminNotifs = notifications.filter(n => n.recipientRole === 'admin');

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
                <Bell className="w-5 h-5 text-amber-400" />
                <h1 className="text-2xl font-black text-white">Department Officer Notifications</h1>
              </div>
              <p className="text-xs text-slate-400 mt-1">Real-time alert stream for application bottlenecks, high-risk cases, and document audits</p>
            </div>
          </div>

          <div className="bg-slate-900 rounded-xl border border-slate-800 p-5 shadow-md space-y-3">
            {adminNotifs.map((n) => (
              <div 
                key={n.id}
                onClick={() => {
                  markNotificationRead(n.id);
                  navigate(n.link);
                }}
                className="p-4 rounded-lg bg-slate-950 border border-slate-800 hover:border-amber-500 cursor-pointer transition-all flex items-start justify-between gap-4 text-xs"
              >
                <div className="flex items-start gap-3">
                  <div className="p-2 bg-amber-500/20 text-amber-400 rounded-lg border border-amber-500/30 shrink-0">
                    <AlertTriangle className="w-5 h-5" />
                  </div>

                  <div>
                    <h4 className="text-sm font-bold text-white">{n.title}</h4>
                    <p className="text-slate-400 mt-0.5 leading-relaxed">{n.message}</p>
                    <span className="text-[10px] text-slate-500 mt-1 block">{n.time}</span>
                  </div>
                </div>

                <div className="shrink-0">
                  <button className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold rounded flex items-center gap-1">
                    <span>Inspect</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>

        </main>
      </div>

      <Footer />
    </div>
  );
};
