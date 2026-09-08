import React, { useState } from 'react';
import { UserCheck, Shield, Key, Clock, Building2, CheckCircle2 } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { IntelligenceBanner } from '../../components/common/IntelligenceBanner';
import { Navbar } from '../../components/layout/Navbar';
import { AdminSidebar } from '../../components/layout/AdminSidebar';
import { Footer } from '../../components/layout/Footer';

export const AdminProfilePage: React.FC = () => {
  const { user } = useApp();
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
          
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
            <div>
              <div className="flex items-center gap-2">
                <UserCheck className="w-5 h-5 text-amber-400" />
                <h1 className="text-2xl font-black text-white">Officer Profile & Security Audit</h1>
              </div>
              <p className="text-xs text-slate-400 mt-1">Authorized Department Regulatory Clearance Personnel</p>
            </div>
          </div>

          <div className="bg-slate-900 rounded-xl border border-slate-800 p-6 shadow-md max-w-3xl space-y-6">
            
            <div className="flex items-center gap-4 pb-6 border-b border-slate-800">
              <div className="w-14 h-14 rounded-xl bg-amber-500 text-govNavy-950 font-black text-2xl flex items-center justify-center shadow-md">
                A
              </div>
              <div>
                <h2 className="text-lg font-bold text-white">Senior NitiPath Clearance Officer</h2>
                <p className="text-xs text-amber-400 font-semibold">Environment & Industrial Monitoring Board</p>
                <span className="text-[10px] text-slate-400 block mt-0.5">Officer ID: SEC-GOV-09418 • Role: Lead Regulatory Auditor</span>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div className="p-3 bg-slate-950 rounded-lg border border-slate-800">
                <span className="text-slate-400 block text-[10px] uppercase font-bold">Official Email</span>
                <span className="text-white font-semibold">admin@demo.com</span>
              </div>

              <div className="p-3 bg-slate-950 rounded-lg border border-slate-800">
                <span className="text-slate-400 block text-[10px] uppercase font-bold">Last Authenticated Login</span>
                <span className="text-emerald-400 font-semibold">Today, 09:30 AM (2FA Verified)</span>
              </div>
            </div>

            <div>
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3">Statutory Clearance Permissions</h3>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 text-xs">
                <div className="flex items-center gap-2 p-2.5 bg-slate-950 rounded border border-slate-800 text-slate-300">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>Document Consistency Verification</span>
                </div>

                <div className="flex items-center gap-2 p-2.5 bg-slate-950 rounded border border-slate-800 text-slate-300">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>High-Risk Application Flagging</span>
                </div>

                <div className="flex items-center gap-2 p-2.5 bg-slate-950 rounded border border-slate-800 text-slate-300">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>Inter-Department Routing Coordination</span>
                </div>

                <div className="flex items-center gap-2 p-2.5 bg-slate-950 rounded border border-slate-800 text-slate-300">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>Official Audit Note Appending</span>
                </div>
              </div>
            </div>

          </div>

        </main>
      </div>

      <Footer />
    </div>
  );
};
