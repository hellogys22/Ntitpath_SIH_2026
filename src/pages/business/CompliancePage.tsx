import React, { useState } from 'react';
import { Calendar as CalendarIcon, Clock, CheckCircle2, AlertTriangle, ShieldCheck, Bell } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { IntelligenceBanner } from '../../components/common/IntelligenceBanner';
import { Navbar } from '../../components/layout/Navbar';
import { Sidebar } from '../../components/layout/Sidebar';
import { Footer } from '../../components/layout/Footer';

export const CompliancePage: React.FC = () => {
  const { complianceEvents } = useApp();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

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
                <CalendarIcon className="w-5 h-5 text-govNavy-700" />
                <h1 className="text-2xl font-extrabold text-slate-900">Compliance Calendar</h1>
              </div>
              <p className="text-xs text-slate-500 mt-1">
                Post-commissioning statutory renewals, annual returns, and safety audit schedules.
              </p>
            </div>
          </div>

          <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-4 sm:p-6 mb-8">
            <div className="pb-4 border-b border-slate-100 mb-4 flex justify-between items-center">
              <h3 className="text-base font-bold text-slate-900">Upcoming Compliance Schedule (Next 120 Days)</h3>
              <span className="text-xs text-slate-500 font-medium">Auto-synced with State Pollution & Safety Portals</span>
            </div>

            <div className="space-y-4">
              {complianceEvents.map(ev => (
                <div key={ev.id} className="p-4 rounded-lg border border-slate-200 bg-slate-50/60 hover:bg-white hover:border-govNavy-400 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4 text-xs">
                  
                  <div className="flex items-start gap-3">
                    <div className="p-2 bg-govNavy-100 text-govNavy-800 rounded-lg border border-govNavy-200 shrink-0">
                      <CalendarIcon className="w-5 h-5" />
                    </div>

                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded bg-slate-200 text-slate-800">
                          {ev.type}
                        </span>
                        <span className="text-slate-500 font-semibold">{ev.department}</span>
                      </div>
                      <h4 className="text-sm font-bold text-slate-900 mt-1">{ev.title}</h4>
                    </div>
                  </div>

                  <div className="flex items-center gap-4 shrink-0 justify-between sm:justify-end">
                    <div className="text-right">
                      <span className="text-[10px] uppercase font-bold text-slate-500 block">Due Date</span>
                      <span className="text-sm font-bold text-rose-700">{ev.dueDate}</span>
                    </div>

                    <button className="px-3 py-1.5 bg-slate-200 hover:bg-slate-300 text-slate-800 font-bold rounded transition-colors text-xs">
                      Set Reminder
                    </button>
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
