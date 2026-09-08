import React, { useState } from 'react';
import { Gift, CheckCircle2, Building2, MapPin, Coins, ExternalLink, Sparkles } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { IntelligenceBanner } from '../../components/common/IntelligenceBanner';
import { Navbar } from '../../components/layout/Navbar';
import { Sidebar } from '../../components/layout/Sidebar';
import { Footer } from '../../components/layout/Footer';

export const SupportPage: React.FC = () => {
  const { supportSchemes, businessProfile } = useApp();
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
                <Gift className="w-5 h-5 text-govSaffron-600" />
                <h1 className="text-2xl font-extrabold text-slate-900">Government Support & Incentive Schemes</h1>
              </div>
              <p className="text-xs text-slate-500 mt-1">
                Matched specifically to {businessProfile.companyName} ({businessProfile.industry} • {businessProfile.location}).
              </p>
            </div>
          </div>

          {/* Matched Profile Criteria Header */}
          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs mb-6 flex flex-wrap items-center justify-between gap-4 text-xs">
            <span className="font-bold text-slate-700 uppercase tracking-wider text-[11px]">Matched Profile Factors:</span>
            <div className="flex flex-wrap items-center gap-2">
              <span className="px-2.5 py-1 rounded bg-govNavy-50 text-govNavy-800 border border-govNavy-200 font-semibold">
                Sector: {businessProfile.industry}
              </span>
              <span className="px-2.5 py-1 rounded bg-govNavy-50 text-govNavy-800 border border-govNavy-200 font-semibold">
                Location: {businessProfile.location}
              </span>
              <span className="px-2.5 py-1 rounded bg-govNavy-50 text-govNavy-800 border border-govNavy-200 font-semibold">
                Investment: {businessProfile.investment}
              </span>
              <span className="px-2.5 py-1 rounded bg-govNavy-50 text-govNavy-800 border border-govNavy-200 font-semibold">
                Scale: {businessProfile.employees} Workers
              </span>
            </div>
          </div>

          {/* Scheme Cards */}
          <div className="space-y-6 mb-8">
            {supportSchemes.map(sch => (
              <div key={sch.id} className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm hover:border-govNavy-500 transition-all">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-100">
                  <div>
                    <span className="text-[10px] font-extrabold uppercase tracking-widest px-2 py-0.5 rounded bg-amber-100 text-amber-900 border border-amber-300">
                      Matched Opportunity
                    </span>
                    <h3 className="text-lg font-bold text-slate-900 mt-1">{sch.title}</h3>
                    <p className="text-xs text-slate-500">{sch.sector} • {sch.location}</p>
                  </div>

                  <div className="shrink-0 text-left md:text-right bg-emerald-50 p-3 rounded-lg border border-emerald-200">
                    <span className="text-[10px] uppercase font-bold text-emerald-800 block">Estimated Benefit</span>
                    <span className="text-sm font-extrabold text-emerald-950">{sch.estimatedBenefit}</span>
                  </div>
                </div>

                <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
                  <div className="md:col-span-2">
                    <p className="text-slate-700 leading-relaxed font-medium">{sch.description}</p>
                    
                    <div className="mt-3">
                      <span className="text-[11px] font-bold text-slate-700 block mb-1">Why this is relevant:</span>
                      <p className="text-slate-600 bg-slate-50 p-2.5 rounded border border-slate-200">{sch.eligibilityNote}</p>
                    </div>
                  </div>

                  <div className="bg-slate-50/70 p-3 rounded-lg border border-slate-200 space-y-2">
                    <span className="text-[11px] font-bold text-slate-800 block">Matching Eligibility Criteria:</span>
                    {sch.matchingFactors.map((f, idx) => (
                      <div key={idx} className="flex items-center gap-1.5 text-emerald-800 font-medium text-[11px]">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                        <span>{f}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t border-slate-100 flex justify-end">
                  <button className="px-4 py-2 bg-govNavy-800 hover:bg-govNavy-900 text-white text-xs font-bold rounded-lg transition-colors flex items-center gap-1.5 cursor-pointer">
                    <span>View Scheme Guidelines</span>
                    <ExternalLink className="w-3.5 h-3.5" />
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
