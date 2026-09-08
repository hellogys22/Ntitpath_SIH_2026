import React from 'react';
import { Link } from 'react-router-dom';
import { ShieldCheck } from 'lucide-react';

export const Footer: React.FC = () => {
  return (
    <footer className="bg-govNavy-950 text-white border-t border-govNavy-900 text-xs py-8 mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 pb-8 border-b border-govNavy-800/60">
          
          <div className="md:col-span-1">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded bg-amber-500 text-govNavy-950 font-black flex items-center justify-center text-xs">
                N
              </div>
              <span className="text-base font-extrabold tracking-tight text-white">NitiPath</span>
            </div>
            <p className="text-xs text-slate-400 mt-2 leading-relaxed">
              Industrial Approval & Compliance Intelligence Platform
            </p>
          </div>

          <div>
            <h4 className="font-bold text-white uppercase text-[11px] tracking-wider mb-3">Platform Capabilities</h4>
            <ul className="space-y-2 text-slate-300">
              <li><Link to="/approvals" className="hover:text-amber-400 transition-colors">Predictive Risk Engine</Link></li>
              <li><Link to="/documents" className="hover:text-amber-400 transition-colors">Document Consistency Check</Link></li>
              <li><Link to="/risks" className="hover:text-amber-400 transition-colors">Parallel Path Optimization</Link></li>
              <li><Link to="/compliance" className="hover:text-amber-400 transition-colors">Compliance Monitoring</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="font-bold text-white uppercase text-[11px] tracking-wider mb-3">Quick Links</h4>
            <ul className="space-y-2 text-slate-300">
              <li><Link to="/" className="hover:text-amber-400 transition-colors">How It Works</Link></li>
              <li><Link to="/assessment" className="hover:text-amber-400 transition-colors">Business Assessment</Link></li>
              <li><Link to="/support" className="hover:text-amber-400 transition-colors">Government Support</Link></li>
              <li><Link to="/copilot" className="hover:text-amber-400 transition-colors">NitiPath Copilot</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="font-bold text-white uppercase text-[11px] tracking-wider mb-3">Portals & Access</h4>
            <ul className="space-y-2 text-slate-300">
              <li><Link to="/login" className="hover:text-amber-400 transition-colors">Business Applicant Sign In</Link></li>
              <li><Link to="/login" className="hover:text-amber-400 transition-colors">Department Officer Sign In</Link></li>
              <li><Link to="/register" className="hover:text-amber-400 transition-colors">New Business Registration</Link></li>
              <li><Link to="/login" className="hover:text-amber-400 transition-colors">Admin Gateway</Link></li>
            </ul>
          </div>

        </div>

        {/* Disclaimer section */}
        <div className="pt-6 flex flex-col md:flex-row items-center justify-between gap-4 text-[11px] text-slate-400">
          <p className="max-w-3xl leading-relaxed text-center md:text-left">
            <strong>Platform Disclaimer:</strong> NitiPath provides decision support and regulatory intelligence based on available business and statutory project data. Final approval, eligibility determination, and statutory compliance remain subject to the respective government authorities and applicable laws.
          </p>

          <p className="shrink-0 text-slate-500">
            © 2026 NitiPath Platform • SIH Prototype
          </p>
        </div>

      </div>
    </footer>
  );
};
